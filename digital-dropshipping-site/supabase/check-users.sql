-- Check existing users in the database
-- Run this to see what users are currently available for login

SELECT 
    id,
    email,
    role,
    is_active,
    email_verified,
    created_at,
    last_login
FROM users 
ORDER BY 
    CASE role 
        WHEN 'admin' THEN 1
        WHEN 'team_member' THEN 2
        WHEN 'freelancer' THEN 3
        WHEN 'client' THEN 4
        ELSE 5
    END,
    created_at DESC;
