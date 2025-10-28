-- Create events table for real-time event streaming
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  user_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  assigned_to UUID REFERENCES users(id),
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_entity ON events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_priority ON events(priority);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- Create RLS policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy for admins to see all events
CREATE POLICY "Admins can view all events" ON events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Policy for users to see their own events
CREATE POLICY "Users can view their own events" ON events
  FOR SELECT USING (
    user_id = auth.uid() OR 
    assigned_to = auth.uid()
  );

-- Policy for admins to insert events
CREATE POLICY "Admins can insert events" ON events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Policy for admins to update events
CREATE POLICY "Admins can update events" ON events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();

-- Get existing users from the database to create events
-- We'll use actual user IDs from the users table instead of hardcoded ones

-- Insert sample events using actual user IDs from the users table
-- First, let's get some real user IDs and create events for them
INSERT INTO events (event_type, entity_type, entity_id, user_id, title, description, priority, metadata) 
SELECT 
  'user_registered' as event_type,
  'user' as entity_type,
  id as entity_id,
  id as user_id,
  'New User Registration' as title,
  CONCAT(email, ' registered as ', role) as description,
  'medium' as priority,
  jsonb_build_object('role', role, 'email', email, 'user_name', split_part(email, '@', 1)) as metadata
FROM users 
WHERE role IN ('freelancer', 'team_member', 'client')
LIMIT 5;

-- Insert some project-related events
INSERT INTO events (event_type, entity_type, entity_id, user_id, title, description, priority, metadata) 
SELECT 
  'project_created' as event_type,
  'project' as entity_type,
  gen_random_uuid() as entity_id,
  id as user_id,
  'New Project Created' as title,
  CONCAT('Project created by ', split_part(email, '@', 1), ' with $5000 budget') as description,
  'high' as priority,
  jsonb_build_object('budget', 5000, 'category', 'web_design', 'amount', 5000) as metadata
FROM users 
WHERE role = 'client'
LIMIT 3;

-- Insert some order events
INSERT INTO events (event_type, entity_type, entity_id, user_id, title, description, priority, metadata) 
SELECT 
  'order_placed' as event_type,
  'order' as entity_type,
  gen_random_uuid() as entity_id,
  id as user_id,
  'New Order Placed' as title,
  CONCAT('Order placed by ', split_part(email, '@', 1), ' for $299') as description,
  'medium' as priority,
  jsonb_build_object('amount', 299, 'status', 'pending') as metadata
FROM users 
WHERE role = 'client'
LIMIT 2;

-- Insert some KYC events
INSERT INTO events (event_type, entity_type, entity_id, user_id, title, description, priority, metadata) 
SELECT 
  'kyc_submitted' as event_type,
  'kyc' as entity_type,
  gen_random_uuid() as entity_id,
  id as user_id,
  'KYC Verification Submitted' as title,
  CONCAT('KYC documents submitted by ', split_part(email, '@', 1)) as description,
  'high' as priority,
  jsonb_build_object('status', 'pending', 'documents', '["passport", "utility_bill"]') as metadata
FROM users 
WHERE role = 'freelancer'
LIMIT 2;

-- Insert some payment events
INSERT INTO events (event_type, entity_type, entity_id, user_id, title, description, priority, metadata) 
SELECT 
  'payment_processed' as event_type,
  'payment' as entity_type,
  gen_random_uuid() as entity_id,
  id as user_id,
  'Payment Processed' as title,
  CONCAT('Payment of $1500 processed for ', split_part(email, '@', 1)) as description,
  'medium' as priority,
  jsonb_build_object('amount', 1500, 'method', 'stripe') as metadata
FROM users 
WHERE role = 'client'
LIMIT 2;

-- Insert some service events
INSERT INTO events (event_type, entity_type, entity_id, user_id, title, description, priority, metadata) 
SELECT 
  'service_created' as event_type,
  'service' as entity_type,
  gen_random_uuid() as entity_id,
  id as user_id,
  'Service Created' as title,
  CONCAT('New service created by ', split_part(email, '@', 1)) as description,
  'low' as priority,
  jsonb_build_object('price', 50, 'category', 'writing') as metadata
FROM users 
WHERE role = 'freelancer'
LIMIT 2;

-- Insert some review events
INSERT INTO events (event_type, entity_type, entity_id, user_id, title, description, priority, metadata) 
SELECT 
  'review_posted' as event_type,
  'review' as entity_type,
  gen_random_uuid() as entity_id,
  id as user_id,
  'Review Posted' as title,
  CONCAT('5-star review posted by ', split_part(email, '@', 1)) as description,
  'low' as priority,
  jsonb_build_object('rating', 5, 'project_id', 'proj_123') as metadata
FROM users 
WHERE role = 'client'
LIMIT 2;

-- Insert some admin events (using admin users)
INSERT INTO events (event_type, entity_type, entity_id, user_id, title, description, priority, metadata) 
SELECT 
  'freelancer_approved' as event_type,
  'freelancer' as entity_type,
  gen_random_uuid() as entity_id,
  id as user_id,
  'Freelancer Approved' as title,
  CONCAT('Freelancer approved by admin ', split_part(email, '@', 1)) as description,
  'medium' as priority,
  jsonb_build_object('status', 'approved', 'user_name', split_part(email, '@', 1)) as metadata
FROM users 
WHERE role = 'admin'
LIMIT 1;

-- Insert some dispute events
INSERT INTO events (event_type, entity_type, entity_id, user_id, title, description, priority, metadata) 
SELECT 
  'dispute_opened' as event_type,
  'dispute' as entity_type,
  gen_random_uuid() as entity_id,
  id as user_id,
  'Dispute Opened' as title,
  CONCAT('Dispute opened by ', split_part(email, '@', 1)) as description,
  'high' as priority,
  jsonb_build_object('reason', 'late_delivery', 'severity', 'high') as metadata
FROM users 
WHERE role = 'freelancer'
LIMIT 1;

-- Insert some payment failure events
INSERT INTO events (event_type, entity_type, entity_id, user_id, title, description, priority, metadata) 
SELECT 
  'payment_failed' as event_type,
  'payment' as entity_type,
  gen_random_uuid() as entity_id,
  id as user_id,
  'Payment Failed' as title,
  CONCAT('Payment failed for ', split_part(email, '@', 1)) as description,
  'high' as priority,
  jsonb_build_object('amount', 200, 'reason', 'insufficient_funds') as metadata
FROM users 
WHERE role = 'freelancer'
LIMIT 1;

-- Insert some message flag events
INSERT INTO events (event_type, entity_type, entity_id, user_id, title, description, priority, metadata) 
SELECT 
  'message_flagged' as event_type,
  'message' as entity_type,
  gen_random_uuid() as entity_id,
  id as user_id,
  'Message Flagged' as title,
  CONCAT('Message flagged by admin ', split_part(email, '@', 1)) as description,
  'high' as priority,
  jsonb_build_object('reason', 'inappropriate_content', 'severity', 'high') as metadata
FROM users 
WHERE role = 'admin'
LIMIT 1;
