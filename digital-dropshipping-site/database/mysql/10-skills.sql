-- ============================================================================
-- SKILLS TABLE - MySQL Version
-- ============================================================================

USE uniti;

CREATE TABLE IF NOT EXISTS skills (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,                               -- URL-friendly identifier
    category VARCHAR(100) NULL,                                       -- Skill category grouping
    description TEXT NULL,                                            -- Skill description
    icon_url VARCHAR(512) NULL,                                       -- Icon URL for skill
    display_order INT UNSIGNED DEFAULT 0,                             -- Order for display/sorting
    is_active ENUM('TRUE', 'FALSE') NOT NULL DEFAULT 'TRUE',          -- Whether skill is active
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_skills_name (name),
    INDEX idx_skills_slug (slug),
    INDEX idx_skills_category (category),
    INDEX idx_skills_display_order (display_order),
    INDEX idx_skills_is_active (is_active)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Sample data with all fields populated
INSERT INTO skills (name, slug, category, description, icon_url, display_order, is_active) VALUES
    ('JavaScript', 'javascript', 'Programming', 'JavaScript programming language for web development', 'https://example.com/icons/javascript.svg', 1, 'TRUE'),
    ('TypeScript', 'typescript', 'Programming', 'TypeScript - typed superset of JavaScript', 'https://example.com/icons/typescript.svg', 2, 'TRUE'),
    ('React', 'react', 'Frontend', 'React library for building user interfaces', 'https://example.com/icons/react.svg', 3, 'TRUE'),
    ('Next.js', 'nextjs', 'Frontend', 'Next.js React framework for production', 'https://example.com/icons/nextjs.svg', 4, 'TRUE'),
    ('Node.js', 'nodejs', 'Backend', 'Node.js JavaScript runtime for server-side development', 'https://example.com/icons/nodejs.svg', 5, 'TRUE'),
    ('Python', 'python', 'Programming', 'Python programming language', 'https://example.com/icons/python.svg', 6, 'TRUE'),
    ('PHP', 'php', 'Programming', 'PHP server-side scripting language', 'https://example.com/icons/php.svg', 7, 'TRUE'),
    ('Laravel', 'laravel', 'Backend', 'Laravel PHP framework', 'https://example.com/icons/laravel.svg', 8, 'TRUE'),
    ('UI/UX Design', 'ui-ux-design', 'Design', 'User interface and user experience design', 'https://example.com/icons/ui-ux.svg', 9, 'TRUE'),
    ('Graphic Design', 'graphic-design', 'Design', 'Graphic design and visual communication', 'https://example.com/icons/graphic-design.svg', 10, 'TRUE'),
    ('Logo Design', 'logo-design', 'Design', 'Professional logo design services', 'https://example.com/icons/logo-design.svg', 11, 'TRUE'),
    ('WordPress', 'wordpress', 'CMS', 'WordPress content management system', 'https://example.com/icons/wordpress.svg', 12, 'TRUE'),
    ('SEO', 'seo', 'Marketing', 'Search engine optimization', 'https://example.com/icons/seo.svg', 13, 'TRUE'),
    ('Content Writing', 'content-writing', 'Writing', 'Professional content writing services', 'https://example.com/icons/content-writing.svg', 14, 'TRUE'),
    ('Copywriting', 'copywriting', 'Writing', 'Persuasive copywriting for marketing', 'https://example.com/icons/copywriting.svg', 15, 'TRUE'),
    ('Video Editing', 'video-editing', 'Video', 'Professional video editing services', 'https://example.com/icons/video-editing.svg', 16, 'TRUE'),
    ('Photography', 'photography', 'Creative', 'Professional photography services', 'https://example.com/icons/photography.svg', 17, 'TRUE'),
    ('Vue.js', 'vuejs', 'Frontend', 'Vue.js progressive JavaScript framework', 'https://example.com/icons/vuejs.svg', 18, 'TRUE'),
    ('Angular', 'angular', 'Frontend', 'Angular web application framework', 'https://example.com/icons/angular.svg', 19, 'TRUE'),
    ('Django', 'django', 'Backend', 'Django Python web framework', 'https://example.com/icons/django.svg', 20, 'TRUE'),
    ('MongoDB', 'mongodb', 'Database', 'MongoDB NoSQL database', 'https://example.com/icons/mongodb.svg', 21, 'TRUE'),
    ('PostgreSQL', 'postgresql', 'Database', 'PostgreSQL relational database', 'https://example.com/icons/postgresql.svg', 22, 'TRUE'),
    ('AWS', 'aws', 'Cloud', 'Amazon Web Services cloud platform', 'https://example.com/icons/aws.svg', 23, 'TRUE'),
    ('Docker', 'docker', 'DevOps', 'Docker containerization platform', 'https://example.com/icons/docker.svg', 24, 'TRUE')
ON DUPLICATE KEY UPDATE 
    category = VALUES(category),
    description = VALUES(description),
    icon_url = VALUES(icon_url),
    display_order = VALUES(display_order),
    is_active = VALUES(is_active),
    updated_at = CURRENT_TIMESTAMP;

