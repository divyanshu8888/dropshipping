-- ============================================================================
-- CHAT & MODERATION SYSTEM
-- Real-time messaging with comprehensive moderation
-- ============================================================================

-- ============================================================================
-- CHAT TABLES
-- ============================================================================

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id),
    title VARCHAR(255),
    status conversation_status DEFAULT 'active',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation participants
CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_muted BOOLEAN DEFAULT FALSE,
    mute_until TIMESTAMP WITH TIME ZONE,
    UNIQUE(conversation_id, user_id)
);

-- Messages table (write via RPC only)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    body TEXT NOT NULL,
    original_body TEXT,
    status message_status DEFAULT 'sent',
    redaction_meta JSONB,
    is_system_message BOOLEAN DEFAULT FALSE,
    reply_to UUID REFERENCES messages(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message attachments
CREATE TABLE message_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_hash VARCHAR(64),
    mime_type VARCHAR(100),
    file_size INTEGER,
    is_secure BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MODERATION TABLES
-- ============================================================================

-- Moderation rules
CREATE TABLE moderation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    pattern TEXT NOT NULL,
    action moderation_action NOT NULL,
    severity moderation_severity DEFAULT 'medium',
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message flags for moderation violations
CREATE TABLE message_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    rule_code VARCHAR(50) NOT NULL,
    severity moderation_severity NOT NULL,
    matched_text TEXT,
    action_taken moderation_action,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Moderation events for user tracking
CREATE TABLE moderation_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    conversation_id UUID REFERENCES conversations(id),
    event_type VARCHAR(50) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CHAT INDEXES
-- ============================================================================

-- Conversation indexes
CREATE INDEX idx_conversations_project ON conversations(project_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation ON conversation_participants(conversation_id);

-- Message indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- Moderation indexes
CREATE INDEX idx_message_flags_message ON message_flags(message_id);
CREATE INDEX idx_moderation_events_user ON moderation_events(user_id);

-- ============================================================================
-- DEFAULT MODERATION RULES
-- ============================================================================

INSERT INTO moderation_rules (code, name, description, pattern, action, severity) VALUES
('PRICING', 'Pricing Language', 'Detects pricing-related language', '(?i)(\$|€|£|₹|AUD|USD|EUR)\s*\d+|\b(per\s*(hour|hr|day|week|month)|rate|quote|price|discount|invoice|payment)\b|\b\d{2,}(\.\d{1,2})?\s*(k|per\s*hour|/hr|/month)\b', 'redact', 'high'),
('CONTACT', 'Contact Exchange', 'Detects contact information sharing', '(?i)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|(\+?\d{1,3}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}|\b(whatsapp|telegram|discord|wechat|signal|meet|zoom|skype)\b', 'block', 'high'),
('URLS', 'External URLs', 'Detects external website links', 'https?://|www\.', 'redact', 'medium'),
('PII', 'Personal Information', 'Detects potential PII sharing', '(?i)\b(ssn|social security|passport|license|address|street|avenue|road)\b', 'redact', 'critical');
