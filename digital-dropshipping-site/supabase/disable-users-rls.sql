-- Temporarily disable RLS for users table to allow signup
-- Run this in your Supabase SQL editor

-- First, make sure the users table exists
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'freelancer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS temporarily for users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to allow signup
GRANT ALL ON users TO anon, authenticated, service_role;

-- Create the update trigger (if it doesn't exist)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
