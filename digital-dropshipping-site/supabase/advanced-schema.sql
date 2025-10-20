-- Advanced Platform Schema
-- Comprehensive dropshipping + freelancer marketplace with chat moderation

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================
CREATE TYPE user_role AS ENUM ('admin', 'freelancer', 'client', 'supplier');
CREATE TYPE conversation_status AS ENUM ('active', 'paused', 'closed', 'escalated');
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read', 'redacted', 'blocked');
CREATE TYPE moderation_action AS ENUM ('warn', 'redact', 'block', 'mute');
CREATE TYPE moderation_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE project_status AS ENUM ('draft', 'quoted', 'sow_pending', 'active', 'completed', 'disputed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed');
CREATE TYPE escrow_status AS ENUM ('created', 'funded', 'released', 'disputed', 'refunded');
CREATE TYPE kyc_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
CREATE TYPE supplier_status AS ENUM ('pending', 'approved', 'suspended', 'terminated');

-- ============================================================================
-- CORE USER TABLES
-- ============================================================================

-- Enhanced users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'client',
    phone VARCHAR(20),
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    two_fa_enabled BOOLEAN DEFAULT FALSE,
    two_fa_secret VARCHAR(255),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KYC verification for freelancers and suppliers
CREATE TABLE kyc_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status kyc_status DEFAULT 'pending',
    document_type VARCHAR(50) NOT NULL, -- 'passport', 'drivers_license', 'business_license'
    document_url TEXT,
    verification_data JSONB, -- Store verification results
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SUPPLIER & DROPSHIPPING TABLES
-- ============================================================================

-- Supplier profiles
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100), -- 'manufacturer', 'wholesaler', 'distributor'
    status supplier_status DEFAULT 'pending',
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    website TEXT,
    address JSONB, -- Full address object
    tax_id VARCHAR(50),
    payment_terms INTEGER DEFAULT 30, -- Days
    minimum_order_value DECIMAL(10,2),
    lead_time_days INTEGER DEFAULT 7,
    shipping_regions TEXT[], -- Array of supported regions
    certifications TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product catalog with supplier mapping
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    sku VARCHAR(100) UNIQUE,
    supplier_id UUID REFERENCES suppliers(id),
    supplier_sku VARCHAR(100),
    cost_price DECIMAL(10,2),
    retail_price DECIMAL(10,2),
    markup_percentage DECIMAL(5,2),
    weight DECIMAL(8,3),
    dimensions JSONB, -- {length, width, height}
    images TEXT[],
    specifications JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    stock_quantity INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 10,
    lead_time_days INTEGER DEFAULT 7,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- FREELANCER & SERVICES TABLES
-- ============================================================================

-- Enhanced freelancer profiles
CREATE TABLE freelancers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    bio TEXT,
    skills TEXT[],
    services JSONB, -- Array of service objects
    portfolio JSONB, -- Array of portfolio items
    certifications JSONB, -- Array of certifications
    experience_years INTEGER,
    hourly_rate_min DECIMAL(10,2), -- Internal use only
    hourly_rate_max DECIMAL(10,2), -- Internal use only
    availability VARCHAR(50) DEFAULT 'available', -- 'available', 'busy', 'unavailable'
    timezone VARCHAR(50),
    languages TEXT[],
    response_time_hours INTEGER DEFAULT 24,
    completion_rate DECIMAL(5,2) DEFAULT 100.00,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CHAT & CONVERSATION SYSTEM
-- ============================================================================

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID, -- Can be null for general discussions
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
    role VARCHAR(20) NOT NULL, -- 'client', 'freelancer', 'admin_observer'
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
    original_body TEXT, -- Store original before redaction
    status message_status DEFAULT 'sent',
    redaction_meta JSONB, -- Store redaction details
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
    is_secure BOOLEAN DEFAULT FALSE, -- For sensitive documents
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MODERATION SYSTEM
-- ============================================================================

-- Moderation rules
CREATE TABLE moderation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL, -- 'PRICING', 'CONTACT', 'PII'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    pattern TEXT NOT NULL, -- Regex pattern
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
    event_type VARCHAR(50) NOT NULL, -- 'violation', 'mute', 'unmute', 'escalation'
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PROJECT & QUOTE MANAGEMENT
-- ============================================================================

-- Quote requests
CREATE TABLE quote_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES users(id),
    project_title VARCHAR(255) NOT NULL,
    project_description TEXT NOT NULL,
    category VARCHAR(100),
    budget_range VARCHAR(50), -- 'under-1k', '1k-5k', '5k-10k', '10k+'
    timeline VARCHAR(50), -- 'asap', '1-week', '1-month', '3-months'
    requirements JSONB,
    files JSONB, -- Array of file objects
    status VARCHAR(50) DEFAULT 'pending',
    assigned_freelancer_id UUID REFERENCES freelancers(id),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_request_id UUID REFERENCES quote_requests(id),
    client_id UUID REFERENCES users(id),
    freelancer_id UUID REFERENCES freelancers(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status project_status DEFAULT 'draft',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(10,2),
    milestones JSONB, -- Array of milestone objects
    sow_url TEXT, -- Link to signed SOW
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PAYMENTS & ESCROW SYSTEM
-- ============================================================================

-- Escrow accounts
CREATE TABLE escrows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id),
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status escrow_status DEFAULT 'created',
    funded_at TIMESTAMP WITH TIME ZONE,
    released_at TIMESTAMP WITH TIME ZONE,
    dispute_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment transactions
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    type VARCHAR(50), -- 'escrow_fund', 'escrow_release', 'commission', 'refund'
    status payment_status DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    gateway_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payouts to freelancers/suppliers
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status payment_status DEFAULT 'pending',
    method VARCHAR(50), -- 'bank_transfer', 'paypal', 'stripe'
    account_details JSONB, -- Encrypted payment details
    scheduled_for TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- AUDIT & COMPLIANCE
-- ============================================================================

-- Comprehensive audit log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id),
    entity_type VARCHAR(50) NOT NULL, -- 'user', 'conversation', 'message', 'project'
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'read'
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disputes
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id),
    opened_by UUID REFERENCES users(id),
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'closed'
    resolution TEXT,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    evidence JSONB, -- Links to relevant files/conversations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- REVIEWS & TESTIMONIALS
-- ============================================================================

-- Reviews for freelancers
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id),
    reviewer_id UUID REFERENCES users(id),
    reviewee_id UUID REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name VARCHAR(255) NOT NULL,
    client_company VARCHAR(255),
    client_avatar_url TEXT,
    testimonial TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    project_type VARCHAR(100),
    is_featured BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

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

-- Project indexes
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_freelancer ON projects(freelancer_id);
CREATE INDEX idx_projects_status ON projects(status);

-- Audit indexes
CREATE INDEX idx_audit_log_actor ON audit_log(actor_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data (except admins)
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id OR 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Conversation policies
CREATE POLICY "Users can view conversations they participate in" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp 
            WHERE cp.conversation_id = conversations.id 
            AND cp.user_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Conversation participants policies
CREATE POLICY "Users can view conversation participants" ON conversation_participants
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM conversation_participants cp2
            WHERE cp2.conversation_id = conversation_participants.conversation_id
            AND cp2.user_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Messages policies (read-only, writes via RPC)
CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id
            AND cp.user_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Quote requests policies
CREATE POLICY "Users can view own quote requests" ON quote_requests
    FOR SELECT USING (
        client_id = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Users can create quote requests" ON quote_requests
    FOR INSERT WITH CHECK (client_id = auth.uid());

-- Projects policies
CREATE POLICY "Users can view projects they're involved in" ON projects
    FOR SELECT USING (
        client_id = auth.uid() OR
        freelancer_id = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Reviews policies
CREATE POLICY "Users can view public reviews" ON reviews
    FOR SELECT USING (is_public = true OR 
        reviewer_id = auth.uid() OR
        reviewee_id = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        actor_id, entity_type, entity_id, action, old_values, new_values
    ) VALUES (
        auth.uid(),
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_conversations AFTER INSERT OR UPDATE OR DELETE ON conversations
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_messages AFTER INSERT OR UPDATE OR DELETE ON messages
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default moderation rules
INSERT INTO moderation_rules (code, name, description, pattern, action, severity) VALUES
('PRICING', 'Pricing Language', 'Detects pricing-related language', '(?i)(\$|€|£|₹|AUD|USD|EUR)\s*\d+|\b(per\s*(hour|hr|day|week|month)|rate|quote|price|discount|invoice|payment)\b|\b\d{2,}(\.\d{1,2})?\s*(k|per\s*hour|/hr|/month)\b', 'redact', 'high'),
('CONTACT', 'Contact Exchange', 'Detects contact information sharing', '(?i)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|(\+?\d{1,3}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}|\b(whatsapp|telegram|discord|wechat|signal|meet|zoom|skype)\b', 'block', 'high'),
('URLS', 'External URLs', 'Detects external website links', 'https?://|www\.', 'redact', 'medium'),
('PII', 'Personal Information', 'Detects potential PII sharing', '(?i)\b(ssn|social security|passport|license|address|street|avenue|road)\b', 'redact', 'critical');

-- Insert sample admin user (password generated during setup)
INSERT INTO users (id, email, name, password, role, is_verified, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@platform.com', 'Platform Admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8.4.2O', 'admin', true, true);

COMMIT;
