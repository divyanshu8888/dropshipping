-- Test script to verify events table and sample data
-- Run this in Supabase SQL editor to test the EventStream feature

-- First, check if events table exists
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' 
ORDER BY ordinal_position;

-- Check if we have any users to create events for
SELECT id, email, role, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- Check if events table has any data
SELECT COUNT(*) as total_events FROM events;

-- Show sample events if they exist
SELECT 
  event_type,
  entity_type,
  title,
  description,
  priority,
  status,
  is_pinned,
  assigned_to,
  created_at
FROM events 
ORDER BY created_at DESC 
LIMIT 10;
