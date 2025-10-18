-- Fix RLS policies for users table to allow signup
-- Run this in your Supabase SQL editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_insert_public" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_service_role_all" ON users;

-- Create more permissive policies for signup
CREATE POLICY "users_select_own" ON users
  FOR SELECT TO authenticated
  USING (auth.uid()::text = id::text);

-- Allow anyone to insert (for signup)
CREATE POLICY "users_insert_anyone" ON users
  FOR INSERT TO anon, authenticated, service_role
  WITH CHECK (true);

-- Allow users to update their own data
CREATE POLICY "users_update_own" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Allow service role full access (for admin operations)
CREATE POLICY "users_service_role_all" ON users
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant all necessary permissions
GRANT SELECT, INSERT, UPDATE ON users TO anon, authenticated, service_role;
