-- Force views to be created with SECURITY INVOKER (not SECURITY DEFINER)
DROP VIEW IF EXISTS public.portfolio_public CASCADE;
DROP VIEW IF EXISTS public.recent_recovery_operations CASCADE;
DROP VIEW IF EXISTS public.freelancers_public CASCADE;
DROP VIEW IF EXISTS public.recovery_overview CASCADE;
DROP VIEW IF EXISTS public.recent_recovery_operation CASCADE;

CREATE VIEW public.freelancers_public 
WITH (security_invoker = true) AS
SELECT 
    id,
    display_name,
    title,
    bio,
    description,
    country,
    skills,
    avatar_url,
    rating,
    total_reviews,
    completed_projects,
    response_time,
    availability,
    status,
    created_at
FROM freelancers
WHERE status = 'approved';

CREATE VIEW public.portfolio_public 
WITH (security_invoker = true) AS
SELECT 
    p.id,
    p.freelancer_id,
    p.title,
    p.summary,
    p.thumbnail_url,
    p.gallery_urls,
    p.tags,
    p.created_at
FROM portfolio_items p
JOIN freelancers f ON f.id = p.freelancer_id
WHERE f.status = 'approved' AND p.is_public = true;

CREATE VIEW public.recovery_overview 
WITH (security_invoker = true) AS
SELECT 
    'users' as table_name,
    (SELECT COUNT(*) FROM users) as main_count,
    (SELECT COUNT(*) FROM users_recovery) as recovery_count,
    CASE 
        WHEN (SELECT COUNT(*) FROM users) = (SELECT COUNT(*) FROM users_recovery) THEN 'SYNCED'
        ELSE 'OUT_OF_SYNC'
    END as sync_status;

CREATE VIEW public.recent_recovery_operations 
WITH (security_invoker = true) AS
SELECT 
    'users' as table_name,
    MAX(recovery_imported_at) as last_sync,
    NOW() - MAX(recovery_imported_at) as sync_delay
FROM users_recovery;

CREATE VIEW public.recent_recovery_operation 
WITH (security_invoker = true) AS
SELECT 
    'users' as table_name,
    MAX(recovery_imported_at) as last_sync,
    NOW() - MAX(recovery_imported_at) as sync_delay
FROM users_recovery;

GRANT SELECT ON public.freelancers_public TO anon, authenticated;
GRANT SELECT ON public.portfolio_public TO anon, authenticated;
GRANT SELECT ON public.recovery_overview TO authenticated;
GRANT SELECT ON public.recent_recovery_operations TO authenticated;
GRANT SELECT ON public.recent_recovery_operation TO authenticated;

-- Fix Function Search Path Mutable warnings
-- Drop functions first to ensure clean recreation
DROP FUNCTION IF EXISTS create_conversation(uuid[], text) CASCADE;
DROP FUNCTION IF EXISTS send_message(uuid, text, text) CASCADE;
DROP FUNCTION IF EXISTS create_structured_request(jsonb) CASCADE;
DROP FUNCTION IF EXISTS toggle_user_mute(uuid, boolean) CASCADE;
DROP FUNCTION IF EXISTS update_freelancer_rating(uuid, decimal, text) CASCADE;
DROP FUNCTION IF EXISTS log_audit_event(text, text, uuid, jsonb, jsonb) CASCADE;

CREATE OR REPLACE FUNCTION create_conversation(participant_ids uuid[], title text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    conversation_id uuid;
    participant_id uuid;
BEGIN
    INSERT INTO conversations (title) VALUES (title) RETURNING id INTO conversation_id;
    
    FOREACH participant_id IN ARRAY participant_ids
    LOOP
        INSERT INTO conversation_participants (conversation_id, user_id) 
        VALUES (conversation_id, participant_id);
    END LOOP;
    
    RETURN conversation_id;
END;
$$;

CREATE OR REPLACE FUNCTION send_message(conversation_id uuid, content text, message_type text DEFAULT 'text')
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    message_id uuid;
BEGIN
    INSERT INTO messages (conversation_id, sender_id, content, message_type)
    VALUES (conversation_id, (select auth.uid()), content, message_type)
    RETURNING id INTO message_id;
    
    RETURN message_id;
END;
$$;

CREATE OR REPLACE FUNCTION create_structured_request(request_data jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    request_id uuid;
BEGIN
    INSERT INTO quote_requests (
        client_id, client_name, client_email, client_phone,
        project_title, project_description, budget, timeline, category, notes
    ) VALUES (
        (request_data->>'client_id')::uuid,
        request_data->>'client_name',
        request_data->>'client_email',
        request_data->>'client_phone',
        request_data->>'project_title',
        request_data->>'project_description',
        (request_data->>'budget')::integer,
        request_data->>'timeline',
        request_data->>'category',
        request_data->>'notes'
    ) RETURNING id INTO request_id;
    
    RETURN request_id;
END;
$$;

CREATE OR REPLACE FUNCTION toggle_user_mute(user_id uuid, is_muted boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION update_freelancer_rating(freelancer_id uuid, new_rating decimal, review_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    UPDATE freelancers 
    SET rating = new_rating, total_reviews = total_reviews + 1
    WHERE id = freelancer_id;
    
    RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION log_audit_event(event_type text, table_name text, record_id uuid, old_data jsonb, new_data jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    audit_id uuid;
BEGIN
    INSERT INTO audit_log (event_type, table_name, record_id, old_data, new_data, user_id)
    VALUES (event_type, table_name, record_id, old_data, new_data, (select auth.uid()))
    RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$;