-- Setup Test Users for Uniti Platform
-- This script creates test users for all roles with known passwords

-- First, let's create some test users if they don't exist
-- Password for all test users: "testpass123" (hashed with bcrypt)

INSERT INTO users (id, email, password_hash, role, is_active, email_verified, created_at, updated_at) VALUES
-- Admin users
('550e8400-e29b-41d4-a716-446655440001', 'admin@uniti.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2C', 'admin', true, true, NOW() - INTERVAL '10 days', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'admin2@uniti.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2C', 'admin', true, true, NOW() - INTERVAL '9 days', NOW()),

-- Team members
('550e8400-e29b-41d4-a716-446655440003', 'team@uniti.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2C', 'team_member', true, true, NOW() - INTERVAL '8 days', NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'moderator@uniti.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2C', 'team_member', true, true, NOW() - INTERVAL '7 days', NOW()),

-- Freelancers
('550e8400-e29b-41d4-a716-446655440005', 'freelancer1@uniti.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2C', 'freelancer', true, true, NOW() - INTERVAL '6 days', NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'freelancer2@uniti.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2C', 'freelancer', true, true, NOW() - INTERVAL '5 days', NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'freelancer3@uniti.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2C', 'freelancer', true, true, NOW() - INTERVAL '4 days', NOW()),

-- Clients
('550e8400-e29b-41d4-a716-446655440008', 'client1@uniti.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2C', 'client', true, true, NOW() - INTERVAL '3 days', NOW()),
('550e8400-e29b-41d4-a716-446655440009', 'client2@uniti.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2C', 'client', true, true, NOW() - INTERVAL '2 days', NOW()),
('550e8400-e29b-41d4-a716-446655440010', 'client3@uniti.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2C', 'client', true, true, NOW() - INTERVAL '1 day', NOW())

ON CONFLICT (id) DO NOTHING;

-- Display login credentials
DO $$
BEGIN
    RAISE NOTICE '=== UNITI PLATFORM TEST USERS ===';
    RAISE NOTICE 'Password for ALL test users: testpass123';
    RAISE NOTICE '';
    RAISE NOTICE 'ADMIN ACCOUNTS:';
    RAISE NOTICE '  admin@uniti.com (Admin)';
    RAISE NOTICE '  admin2@uniti.com (Admin)';
    RAISE NOTICE '';
    RAISE NOTICE 'TEAM MEMBER ACCOUNTS:';
    RAISE NOTICE '  team@uniti.com (Team Member)';
    RAISE NOTICE '  moderator@uniti.com (Team Member)';
    RAISE NOTICE '';
    RAISE NOTICE 'FREELANCER ACCOUNTS:';
    RAISE NOTICE '  freelancer1@uniti.com (Freelancer)';
    RAISE NOTICE '  freelancer2@uniti.com (Freelancer)';
    RAISE NOTICE '  freelancer3@uniti.com (Freelancer)';
    RAISE NOTICE '';
    RAISE NOTICE 'CLIENT ACCOUNTS:';
    RAISE NOTICE '  client1@uniti.com (Client)';
    RAISE NOTICE '  client2@uniti.com (Client)';
    RAISE NOTICE '  client3@uniti.com (Client)';
    RAISE NOTICE '';
    RAISE NOTICE 'Login at: http://localhost:3000/login';
    RAISE NOTICE 'Admin dashboard: http://localhost:3000/admin';
END $$;
