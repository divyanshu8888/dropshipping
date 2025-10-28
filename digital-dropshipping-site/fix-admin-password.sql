-- Fix all user passwords to use the same working password hash (admin123)
-- Get the password hash from div@admin.com and copy it to all other users

-- Update all admin users
UPDATE users 
SET password_hash = (SELECT password_hash FROM users WHERE email = 'div@admin.com')
WHERE role = 'admin' AND email != 'div@admin.com';

-- Update all team members
UPDATE users 
SET password_hash = (SELECT password_hash FROM users WHERE email = 'div@admin.com')
WHERE role = 'team_member';

-- Update all freelancers
UPDATE users 
SET password_hash = (SELECT password_hash FROM users WHERE email = 'div@admin.com')
WHERE role = 'freelancer';

-- Update all clients
UPDATE users 
SET password_hash = (SELECT password_hash FROM users WHERE email = 'div@admin.com')
WHERE role = 'client';

-- Verify the updates - show all users with their roles
SELECT email, role, is_active, created_at 
FROM users 
ORDER BY 
    CASE role 
        WHEN 'admin' THEN 1
        WHEN 'team_member' THEN 2
        WHEN 'freelancer' THEN 3
        WHEN 'client' THEN 4
        ELSE 5
    END,
    email;