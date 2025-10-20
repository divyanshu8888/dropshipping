-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Comprehensive security policies for data access control
-- ============================================================================

-- ============================================================================
-- ENABLE RLS
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
ALTER TABLE freelancers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USER POLICIES
-- ============================================================================

-- Users can only see their own data (except admins)
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id OR 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- CONVERSATION POLICIES
-- ============================================================================

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

-- ============================================================================
-- MESSAGE POLICIES
-- ============================================================================

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

-- ============================================================================
-- PROJECT POLICIES
-- ============================================================================

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

-- ============================================================================
-- FREELANCER POLICIES
-- ============================================================================

-- Freelancers policies
CREATE POLICY "Public can view active freelancers" ON freelancers
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view own freelancer profile" ON freelancers
    FOR SELECT USING (
        user_id = auth.uid() OR
        is_active = true OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Users can update own freelancer profile" ON freelancers
    FOR UPDATE USING (user_id = auth.uid());

-- ============================================================================
-- PRODUCT POLICIES
-- ============================================================================

-- Products policies
CREATE POLICY "Public can view active products" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all products" ON products
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- REVIEW POLICIES
-- ============================================================================

-- Reviews policies
CREATE POLICY "Users can view public reviews" ON reviews
    FOR SELECT USING (is_public = true OR 
        reviewer_id = auth.uid() OR
        reviewee_id = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================================
-- PAYMENT POLICIES
-- ============================================================================

-- Escrow policies
CREATE POLICY "Users can view their escrows" ON escrows
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = escrows.project_id
            AND (p.client_id = auth.uid() OR p.freelancer_id = auth.uid())
        ) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Payment policies
CREATE POLICY "Users can view their payments" ON payments
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = payments.project_id
            AND (p.client_id = auth.uid() OR p.freelancer_id = auth.uid())
        ) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Payout policies
CREATE POLICY "Users can view their payouts" ON payouts
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
