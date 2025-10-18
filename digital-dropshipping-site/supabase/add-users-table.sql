-- Add users table to Supabase for authentication
-- Run this in your Supabase SQL editor

-- ============================================================================
-- USERS TABLE FOR AUTHENTICATION
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL, -- hashed password
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'freelancer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "users_select_own" ON users
  FOR SELECT TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "users_insert_public" ON users
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Allow service role to bypass RLS for signup operations
CREATE POLICY "users_service_role_all" ON users
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON users TO anon, authenticated;

-- Add trigger for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
