-- Moderation Engine Functions
-- Handles message filtering, redaction, and policy enforcement

-- ============================================================================
-- MODERATION CORE FUNCTIONS
-- ============================================================================

-- Function to check message against moderation rules
CREATE OR REPLACE FUNCTION check_message_moderation(p_message_text TEXT)
RETURNS JSONB AS $$
DECLARE
    rule_record RECORD;
    violations JSONB := '[]';
    redacted_text TEXT := p_message_text;
    total_violations INTEGER := 0;
    critical_violations INTEGER := 0;
    should_block BOOLEAN := FALSE;
BEGIN
    -- Loop through all enabled moderation rules
    FOR rule_record IN 
        SELECT * FROM moderation_rules 
        WHERE is_enabled = true 
        ORDER BY severity DESC
    LOOP
        -- Check if message matches the pattern
        IF redacted_text ~ rule_record.pattern THEN
            -- Count violations
            total_violations := total_violations + 1;
            
            -- Count critical violations
            IF rule_record.severity = 'critical' THEN
                critical_violations := critical_violations + 1;
            END IF;
            
            -- Handle different actions
            CASE rule_record.action
                WHEN 'redact' THEN
                    -- Replace matched text with redaction notice
                    redacted_text := regexp_replace(
                        redacted_text, 
                        rule_record.pattern, 
                        '[redacted: ' || rule_record.code || ']', 
                        'gi'
                    );
                    
                WHEN 'block' THEN
                    should_block := TRUE;
                    
                WHEN 'warn' THEN
                    -- Just flag for warning, no text modification
                    NULL;
            END CASE;
            
            -- Add to violations array
            violations := violations || jsonb_build_object(
                'rule_code', rule_record.code,
                'severity', rule_record.severity,
                'action', rule_record.action,
                'matched', TRUE
            );
        END IF;
    END LOOP;
    
    -- Block if critical violations or multiple violations
    IF critical_violations > 0 OR total_violations >= 3 THEN
        should_block := TRUE;
    END IF;
    
    -- Return moderation result
    RETURN jsonb_build_object(
        'violations', violations,
        'total_violations', total_violations,
        'critical_violations', critical_violations,
        'should_block', should_block,
        'redacted_text', redacted_text,
        'original_text', p_message_text
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send a message with moderation
CREATE OR REPLACE FUNCTION send_message(
    p_conversation_id UUID,
    p_body TEXT,
    p_reply_to UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_message_id UUID;
    v_sender_id UUID;
    v_moderation_result JSONB;
    v_final_body TEXT;
    v_rule_record RECORD;
BEGIN
    -- Get current user ID
    v_sender_id := auth.uid();
    
    -- Check if user is participant or admin
    IF NOT EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE conversation_id = p_conversation_id
        AND (user_id = v_sender_id OR
             EXISTS (SELECT 1 FROM users WHERE id = v_sender_id AND role = 'admin'))
    ) THEN
        RAISE EXCEPTION 'not_participant' USING DETAIL = 'User is not a participant in this conversation';
    END IF;
    
    -- Run moderation check
    v_moderation_result := check_message_moderation(p_body);
    
    -- Check if message should be blocked
    IF (v_moderation_result->>'should_block')::BOOLEAN THEN
        -- Log the blocked attempt
        INSERT INTO moderation_events (user_id, conversation_id, event_type, details)
        VALUES (v_sender_id, p_conversation_id, 'violation', v_moderation_result);
        
        -- Return error
        RETURN jsonb_build_object(
            'success', false,
            'error', 'message_blocked',
            'reason', 'Message blocked by moderation policy',
            'violations', v_moderation_result->'violations'
        );
    END IF;
    
    -- Use redacted text if available, otherwise original
    v_final_body := COALESCE(v_moderation_result->>'redacted_text', p_body);
    
    -- Create the message
    v_message_id := uuid_generate_v4();
    
    INSERT INTO messages (
        id, conversation_id, sender_id, body, original_body, 
        redaction_meta, reply_to, status
    ) VALUES (
        v_message_id, p_conversation_id, v_sender_id, v_final_body, p_body,
        v_moderation_result, p_reply_to, 'sent'
    );
    
    -- Log violations if any
    IF (v_moderation_result->>'total_violations')::INTEGER > 0 THEN
        FOR v_rule_record IN 
            SELECT * FROM jsonb_array_elements(v_moderation_result->'violations')
            WHERE value->>'matched' = 'true'
        LOOP
            INSERT INTO message_flags (
                message_id, rule_code, severity, action_taken
            ) VALUES (
                v_message_id,
                v_rule_record->>'rule_code',
                v_rule_record->>'severity',
                v_rule_record->>'action'
            );
        END LOOP;
        
        -- Log moderation event
        INSERT INTO moderation_events (user_id, conversation_id, event_type, details)
        VALUES (v_sender_id, p_conversation_id, 'violation', v_moderation_result);
    END IF;
    
    -- Return success with message details
    RETURN jsonb_build_object(
        'success', true,
        'message_id', v_message_id,
        'body', v_final_body,
        'violations', v_moderation_result->'violations',
        'redacted', v_final_body != p_body
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a conversation
CREATE OR REPLACE FUNCTION create_conversation(
    p_title VARCHAR(255),
    p_project_id UUID DEFAULT NULL,
    p_participants UUID[] DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
    v_conversation_id UUID;
    v_creator_id UUID;
    v_participant_id UUID;
BEGIN
    -- Get current user ID
    v_creator_id := auth.uid();
    
    -- Create conversation
    v_conversation_id := uuid_generate_v4();
    
    INSERT INTO conversations (id, project_id, title, created_by)
    VALUES (v_conversation_id, p_project_id, p_title, v_creator_id);
    
    -- Add creator as participant
    INSERT INTO conversation_participants (conversation_id, user_id, role)
    VALUES (v_conversation_id, v_creator_id, 'client');
    
    -- Add other participants
    IF array_length(p_participants, 1) > 0 THEN
        FOREACH v_participant_id IN ARRAY p_participants
        LOOP
            INSERT INTO conversation_participants (conversation_id, user_id, role)
            VALUES (v_conversation_id, v_participant_id, 'freelancer');
        END LOOP;
    END IF;
    
    -- Add admin observer if not admin
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = v_creator_id AND role = 'admin') THEN
        INSERT INTO conversation_participants (conversation_id, user_id, role)
        SELECT v_conversation_id, id, 'admin_observer'
        FROM users 
        WHERE role = 'admin' 
        LIMIT 1;
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'conversation_id', v_conversation_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mute/unmute a user
CREATE OR REPLACE FUNCTION toggle_user_mute(
    p_conversation_id UUID,
    p_user_id UUID,
    p_mute_duration_minutes INTEGER DEFAULT 10
)
RETURNS JSONB AS $$
DECLARE
    v_is_admin BOOLEAN;
    v_current_user_id UUID;
BEGIN
    -- Get current user ID and check if admin
    v_current_user_id := auth.uid();
    v_is_admin := EXISTS (SELECT 1 FROM users WHERE id = v_current_user_id AND role = 'admin');
    
    -- Only admins can mute users
    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'insufficient_privileges' USING DETAIL = 'Only admins can mute users';
    END IF;
    
    -- Update mute status
    UPDATE conversation_participants
    SET 
        is_muted = NOT is_muted,
        mute_until = CASE 
            WHEN is_muted THEN NULL 
            ELSE NOW() + (p_mute_duration_minutes || ' minutes')::INTERVAL 
        END
    WHERE conversation_id = p_conversation_id AND user_id = p_user_id;
    
    -- Log moderation event
    INSERT INTO moderation_events (user_id, conversation_id, event_type, details)
    VALUES (p_user_id, p_conversation_id, 'mute', jsonb_build_object(
        'action', 'toggle_mute',
        'muted_by', v_current_user_id,
        'duration_minutes', p_mute_duration_minutes
    ));
    
    RETURN jsonb_build_object(
        'success', true,
        'muted', NOT (SELECT is_muted FROM conversation_participants 
                     WHERE conversation_id = p_conversation_id AND user_id = p_user_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get conversation with moderation info
CREATE OR REPLACE FUNCTION get_conversation_with_moderation(p_conversation_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_conversation JSONB;
    v_participants JSONB;
    v_messages JSONB;
    v_moderation_summary JSONB;
    v_is_admin BOOLEAN;
BEGIN
    -- Check if user is admin
    v_is_admin := EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');
    
    -- Get conversation details
    SELECT to_jsonb(c.*) INTO v_conversation
    FROM conversations c
    WHERE c.id = p_conversation_id;
    
    -- Get participants
    SELECT jsonb_agg(
        jsonb_build_object(
            'user_id', cp.user_id,
            'role', cp.role,
            'joined_at', cp.joined_at,
            'last_read_at', cp.last_read_at,
            'is_muted', cp.is_muted,
            'mute_until', cp.mute_until,
            'user_name', u.name,
            'user_email', CASE WHEN v_is_admin THEN u.email ELSE NULL END
        )
    ) INTO v_participants
    FROM conversation_participants cp
    JOIN users u ON u.id = cp.user_id
    WHERE cp.conversation_id = p_conversation_id;
    
    -- Get messages with moderation info
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', m.id,
            'sender_id', m.sender_id,
            'body', m.body,
            'original_body', CASE WHEN v_is_admin THEN m.original_body ELSE NULL END,
            'status', m.status,
            'redaction_meta', CASE WHEN v_is_admin THEN m.redaction_meta ELSE NULL END,
            'is_system_message', m.is_system_message,
            'created_at', m.created_at,
            'sender_name', u.name,
            'violations', CASE WHEN v_is_admin THEN (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'rule_code', mf.rule_code,
                        'severity', mf.severity,
                        'action_taken', mf.action_taken,
                        'created_at', mf.created_at
                    )
                ) FROM message_flags mf WHERE mf.message_id = m.id
            ) ELSE NULL END
        )
    ) INTO v_messages
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    WHERE m.conversation_id = p_conversation_id
    ORDER BY m.created_at ASC;
    
    -- Get moderation summary (admin only)
    IF v_is_admin THEN
        SELECT jsonb_build_object(
            'total_violations', COUNT(*),
            'critical_violations', COUNT(*) FILTER (WHERE severity = 'critical'),
            'recent_events', (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'event_type', event_type,
                        'details', details,
                        'created_at', created_at
                    )
                ) FROM moderation_events 
                WHERE conversation_id = p_conversation_id 
                AND created_at > NOW() - INTERVAL '24 hours'
                ORDER BY created_at DESC
                LIMIT 10
            )
        ) INTO v_moderation_summary
        FROM message_flags mf
        JOIN messages m ON m.id = mf.message_id
        WHERE m.conversation_id = p_conversation_id;
    END IF;
    
    RETURN jsonb_build_object(
        'conversation', v_conversation,
        'participants', v_participants,
        'messages', v_messages,
        'moderation_summary', v_moderation_summary
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add structured alternatives (quote request, file sharing)
CREATE OR REPLACE FUNCTION create_structured_request(
    p_conversation_id UUID,
    p_request_type VARCHAR(50), -- 'quote', 'file_share', 'milestone_update'
    p_data JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_message_id UUID;
    v_sender_id UUID;
BEGIN
    -- Get current user ID
    v_sender_id := auth.uid();
    
    -- Check if user is participant
    IF NOT EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE conversation_id = p_conversation_id
        AND user_id = v_sender_id
    ) THEN
        RAISE EXCEPTION 'not_participant' USING DETAIL = 'User is not a participant in this conversation';
    END IF;
    
    -- Create structured message
    v_message_id := uuid_generate_v4();
    
    INSERT INTO messages (
        id, conversation_id, sender_id, body, is_system_message
    ) VALUES (
        v_message_id, p_conversation_id, v_sender_id, 
        '[' || p_request_type || '] ' || p_data::TEXT, true
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message_id', v_message_id,
        'type', p_request_type
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get moderation dashboard data for admin
CREATE OR REPLACE FUNCTION get_moderation_dashboard()
RETURNS JSONB AS $$
DECLARE
    v_stats JSONB;
    v_recent_violations JSONB;
    v_muted_users JSONB;
    v_active_conversations JSONB;
BEGIN
    -- Only admins can access
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION 'insufficient_privileges' USING DETAIL = 'Only admins can access moderation dashboard';
    END IF;
    
    -- Get moderation stats
    SELECT jsonb_build_object(
        'total_violations_today', COUNT(*) FILTER (WHERE created_at > CURRENT_DATE),
        'total_violations_week', COUNT(*) FILTER (WHERE created_at > CURRENT_DATE - INTERVAL '7 days'),
        'critical_violations_today', COUNT(*) FILTER (WHERE created_at > CURRENT_DATE AND severity = 'critical'),
        'blocked_messages_today', COUNT(*) FILTER (WHERE created_at > CURRENT_DATE AND action_taken = 'block'),
        'muted_users_count', (
            SELECT COUNT(*) FROM conversation_participants 
            WHERE is_muted = true AND (mute_until IS NULL OR mute_until > NOW())
        )
    ) INTO v_stats
    FROM message_flags;
    
    -- Get recent violations
    SELECT jsonb_agg(
        jsonb_build_object(
            'message_id', mf.message_id,
            'rule_code', mf.rule_code,
            'severity', mf.severity,
            'action_taken', mf.action_taken,
            'created_at', mf.created_at,
            'conversation_id', m.conversation_id,
            'sender_name', u.name,
            'sender_email', u.email
        )
    ) INTO v_recent_violations
    FROM message_flags mf
    JOIN messages m ON m.id = mf.message_id
    JOIN users u ON u.id = m.sender_id
    WHERE mf.created_at > NOW() - INTERVAL '24 hours'
    ORDER BY mf.created_at DESC
    LIMIT 20;
    
    -- Get muted users
    SELECT jsonb_agg(
        jsonb_build_object(
            'user_id', cp.user_id,
            'user_name', u.name,
            'user_email', u.email,
            'conversation_id', cp.conversation_id,
            'muted_until', cp.mute_until,
            'muted_at', cp.updated_at
        )
    ) INTO v_muted_users
    FROM conversation_participants cp
    JOIN users u ON u.id = cp.user_id
    WHERE cp.is_muted = true AND (cp.mute_until IS NULL OR cp.mute_until > NOW())
    ORDER BY cp.updated_at DESC;
    
    -- Get active conversations with moderation flags
    SELECT jsonb_agg(
        jsonb_build_object(
            'conversation_id', c.id,
            'title', c.title,
            'status', c.status,
            'participant_count', (
                SELECT COUNT(*) FROM conversation_participants cp2 
                WHERE cp2.conversation_id = c.id
            ),
            'last_message_at', (
                SELECT MAX(m.created_at) FROM messages m 
                WHERE m.conversation_id = c.id
            ),
            'violation_count', (
                SELECT COUNT(*) FROM message_flags mf
                JOIN messages m ON m.id = mf.message_id
                WHERE m.conversation_id = c.id
            )
        )
    ) INTO v_active_conversations
    FROM conversations c
    WHERE c.status = 'active'
    AND EXISTS (
        SELECT 1 FROM message_flags mf
        JOIN messages m ON m.id = mf.message_id
        WHERE m.conversation_id = c.id
    )
    ORDER BY (
        SELECT MAX(m.created_at) FROM messages m 
        WHERE m.conversation_id = c.id
    ) DESC
    LIMIT 10;
    
    RETURN jsonb_build_object(
        'stats', v_stats,
        'recent_violations', v_recent_violations,
        'muted_users', v_muted_users,
        'active_conversations', v_active_conversations
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION send_message(UUID, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_conversation(VARCHAR, UUID, UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversation_with_moderation(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_structured_request(UUID, VARCHAR, JSONB) TO authenticated;

-- Grant admin-only permissions
GRANT EXECUTE ON FUNCTION toggle_user_mute(UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_moderation_dashboard() TO authenticated;
