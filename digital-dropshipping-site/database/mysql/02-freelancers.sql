-- ============================================================================
-- FREELANCERS TABLE - MySQL Version
-- ============================================================================

USE uniti;

-- ============================================================================
-- CREATE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS freelancers (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    headline VARCHAR(150),
    title VARCHAR(200),
    bio TEXT,
    description TEXT,
    country VARCHAR(100),
    skills JSON,
    avatar_url VARCHAR(500),
    hourly_rate_cents INT UNSIGNED,
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating BETWEEN 0 AND 5),
    total_reviews INT UNSIGNED DEFAULT 0,
    completed_projects INT UNSIGNED DEFAULT 0,
    response_time VARCHAR(50),
    availability VARCHAR(50) DEFAULT 'available',
    verification_state ENUM('unverified','pending','verified','rejected') DEFAULT 'unverified',
    status ENUM('pending','approved','suspended','rejected') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (user_id),
    CHECK (JSON_VALID(skills)),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_freelancers_user_id ON freelancers(user_id);
CREATE INDEX idx_freelancers_status ON freelancers(status);
CREATE INDEX idx_freelancers_rating ON freelancers(rating);
CREATE INDEX idx_freelancers_country ON freelancers(country);
CREATE INDEX idx_freelancers_verification_state ON freelancers(verification_state);

-- ============================================================================
-- RECOVERY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS freelancers_recovery (
    id INT UNSIGNED PRIMARY KEY,
    user_id INT UNSIGNED,
    display_name VARCHAR(100) NOT NULL,
    title VARCHAR(200),
    bio TEXT,
    description TEXT,
    country VARCHAR(100),
    skills JSON,
    avatar_url VARCHAR(500),
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT UNSIGNED DEFAULT 0,
    completed_projects INT UNSIGNED DEFAULT 0,
    response_time VARCHAR(50),
    availability VARCHAR(50) DEFAULT 'available',
    verification_state ENUM('unverified','pending','verified','rejected'),
    status ENUM('pending','approved','suspended','rejected'),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    recovery_imported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users_recovery(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- RECOVERY SYNC TRIGGERS
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_auto_sync_freelancers_insert;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_freelancers_insert
    AFTER INSERT ON freelancers
    FOR EACH ROW
BEGIN
    INSERT INTO freelancers_recovery (id, user_id, display_name, title, bio, description, country, skills, avatar_url, rating, total_reviews, completed_projects, response_time, availability, status, created_at, updated_at, recovery_imported_at)
    VALUES (NEW.id, NEW.user_id, NEW.display_name, NEW.title, NEW.bio, NEW.description, NEW.country, NEW.skills, NEW.avatar_url, NEW.rating, NEW.total_reviews, NEW.completed_projects, NEW.response_time, NEW.availability, NEW.status, NEW.created_at, NEW.updated_at, NOW())
    ON DUPLICATE KEY UPDATE
        user_id = NEW.user_id,
        display_name = NEW.display_name,
        title = NEW.title,
        bio = NEW.bio,
        description = NEW.description,
        country = NEW.country,
        skills = NEW.skills,
        avatar_url = NEW.avatar_url,
        rating = NEW.rating,
        total_reviews = NEW.total_reviews,
        completed_projects = NEW.completed_projects,
        response_time = NEW.response_time,
        availability = NEW.availability,
        status = NEW.status,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW();
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_freelancers_update;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_freelancers_update
    AFTER UPDATE ON freelancers
    FOR EACH ROW
BEGIN
    UPDATE freelancers_recovery 
    SET user_id = NEW.user_id,
        display_name = NEW.display_name,
        title = NEW.title,
        bio = NEW.bio,
        description = NEW.description,
        country = NEW.country,
        skills = NEW.skills,
        avatar_url = NEW.avatar_url,
        rating = NEW.rating,
        total_reviews = NEW.total_reviews,
        completed_projects = NEW.completed_projects,
        response_time = NEW.response_time,
        availability = NEW.availability,
        status = NEW.status,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW()
    WHERE id = NEW.id;
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_freelancers_delete;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_freelancers_delete
    AFTER DELETE ON freelancers
    FOR EACH ROW
BEGIN
    DELETE FROM freelancers_recovery WHERE id = OLD.id;
END$$

DELIMITER ;

-- ============================================================================
-- SAMPLE DATA - Complete INSERT statements with ALL columns
-- ============================================================================
-- First, ensure users exist (create if they don't)
-- These will be created if not exists, or use existing if they do

-- Create/get user for John Freelancer
INSERT INTO users (email, password_hash, role, display_name, is_active, email_verified)
VALUES ('john.freelancer@example.com', '$2b$10$example', 'freelancer', 'John Freelancer', 'TRUE', 'TRUE')
ON DUPLICATE KEY UPDATE id = id;

-- Create/get user for Sarah Designer
INSERT INTO users (email, password_hash, role, display_name, is_active, email_verified)
VALUES ('sarah.designer@example.com', '$2b$10$example', 'freelancer', 'Sarah Designer', 'TRUE', 'TRUE')
ON DUPLICATE KEY UPDATE id = id;

-- Create/get user for Mark Developer
INSERT INTO users (email, password_hash, role, display_name, is_active, email_verified)
VALUES ('mark.developer@example.com', '$2b$10$example', 'freelancer', 'Mark Developer', 'TRUE', 'TRUE')
ON DUPLICATE KEY UPDATE id = id;

-- Create/get user for Emily Content
INSERT INTO users (email, password_hash, role, display_name, is_active, email_verified)
VALUES ('emily.content@example.com', '$2b$10$example', 'freelancer', 'Emily Content', 'TRUE', 'TRUE')
ON DUPLICATE KEY UPDATE id = id;

-- Create/get user for David Mobile
INSERT INTO users (email, password_hash, role, display_name, is_active, email_verified)
VALUES ('david.mobile@example.com', '$2b$10$example', 'freelancer', 'David Mobile', 'TRUE', 'TRUE')
ON DUPLICATE KEY UPDATE id = id;

-- Now insert freelancers with ALL columns populated
INSERT INTO freelancers (
    user_id,
    display_name,
    headline,
    title,
    bio,
    description,
    country,
    skills,
    avatar_url,
    hourly_rate_cents,
    rating,
    total_reviews,
    completed_projects,
    response_time,
    availability,
    verification_state,
    status,
    created_at,
    updated_at
)
SELECT 
    u.id,
    'John Freelancer',
    'Expert Web Developer',
    'Full Stack Developer',
    'I build amazing web applications',
    'Experienced full stack developer with expertise in modern web technologies. Specializing in React, Node.js, and cloud infrastructure.',
    'Australia',
    JSON_ARRAY('JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    7500,
    4.85,
    12,
    45,
    'Within 2 hours',
    'available',
    'verified',
    'approved',
    '2025-11-04 19:08:33',
    '2025-11-04 19:08:33'
FROM users u WHERE u.email = 'john.freelancer@example.com'
ON DUPLICATE KEY UPDATE 
    display_name = VALUES(display_name),
    headline = VALUES(headline),
    title = VALUES(title),
    bio = VALUES(bio),
    description = VALUES(description),
    country = VALUES(country),
    skills = VALUES(skills),
    avatar_url = VALUES(avatar_url),
    hourly_rate_cents = VALUES(hourly_rate_cents),
    rating = VALUES(rating),
    total_reviews = VALUES(total_reviews),
    completed_projects = VALUES(completed_projects),
    response_time = VALUES(response_time),
    availability = VALUES(availability),
    verification_state = VALUES(verification_state),
    status = VALUES(status);

INSERT INTO freelancers (
    user_id,
    display_name,
    headline,
    title,
    bio,
    description,
    country,
    skills,
    avatar_url,
    hourly_rate_cents,
    rating,
    total_reviews,
    completed_projects,
    response_time,
    availability,
    verification_state,
    status,
    created_at,
    updated_at
)
SELECT 
    u.id,
    'Sarah Designer',
    'Creative UI/UX Designer',
    'UI/UX Designer',
    'Creating beautiful user experiences',
    'Passionate UI/UX designer with 8+ years of experience creating intuitive and visually stunning interfaces for web and mobile applications.',
    'United States',
    JSON_ARRAY('Figma', 'Adobe XD', 'Sketch', 'User Research', 'Prototyping', 'Design Systems'),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    6500,
    4.92,
    28,
    67,
    'Within 1 hour',
    'available',
    'verified',
    'approved',
    '2025-11-04 19:08:33',
    '2025-11-04 19:08:33'
FROM users u WHERE u.email = 'sarah.designer@example.com'
ON DUPLICATE KEY UPDATE 
    display_name = VALUES(display_name),
    headline = VALUES(headline),
    title = VALUES(title),
    bio = VALUES(bio),
    description = VALUES(description),
    country = VALUES(country),
    skills = VALUES(skills),
    avatar_url = VALUES(avatar_url),
    hourly_rate_cents = VALUES(hourly_rate_cents),
    rating = VALUES(rating),
    total_reviews = VALUES(total_reviews),
    completed_projects = VALUES(completed_projects),
    response_time = VALUES(response_time),
    availability = VALUES(availability),
    verification_state = VALUES(verification_state),
    status = VALUES(status);

INSERT INTO freelancers (
    user_id,
    display_name,
    headline,
    title,
    bio,
    description,
    country,
    skills,
    avatar_url,
    hourly_rate_cents,
    rating,
    total_reviews,
    completed_projects,
    response_time,
    availability,
    verification_state,
    status,
    created_at,
    updated_at
)
SELECT 
    u.id,
    'Mark Developer',
    'Senior Backend Engineer',
    'Backend Developer',
    'Building scalable server solutions',
    'Expert backend developer specializing in microservices architecture, API development, and database optimization. Proficient in Python, Java, and Go.',
    'United Kingdom',
    JSON_ARRAY('Python', 'Java', 'Go', 'PostgreSQL', 'Docker', 'Kubernetes', 'Redis'),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Mark',
    8500,
    4.78,
    19,
    52,
    'Within 3 hours',
    'available',
    'verified',
    'approved',
    '2025-11-04 19:08:33',
    '2025-11-04 19:08:33'
FROM users u WHERE u.email = 'mark.developer@example.com'
ON DUPLICATE KEY UPDATE 
    display_name = VALUES(display_name),
    headline = VALUES(headline),
    title = VALUES(title),
    bio = VALUES(bio),
    description = VALUES(description),
    country = VALUES(country),
    skills = VALUES(skills),
    avatar_url = VALUES(avatar_url),
    hourly_rate_cents = VALUES(hourly_rate_cents),
    rating = VALUES(rating),
    total_reviews = VALUES(total_reviews),
    completed_projects = VALUES(completed_projects),
    response_time = VALUES(response_time),
    availability = VALUES(availability),
    verification_state = VALUES(verification_state),
    status = VALUES(status);

INSERT INTO freelancers (
    user_id,
    display_name,
    headline,
    title,
    bio,
    description,
    country,
    skills,
    avatar_url,
    hourly_rate_cents,
    rating,
    total_reviews,
    completed_projects,
    response_time,
    availability,
    verification_state,
    status,
    created_at,
    updated_at
)
SELECT 
    u.id,
    'Emily Content',
    'Professional Content Writer',
    'Content Writer & Strategist',
    'Crafting compelling stories and content',
    'Award-winning content writer and strategist with expertise in SEO, technical writing, and brand storytelling. Helping businesses communicate effectively.',
    'Canada',
    JSON_ARRAY('Content Writing', 'SEO', 'Copywriting', 'Technical Writing', 'Content Strategy', 'Blog Writing'),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    4500,
    4.95,
    35,
    89,
    'Within 1 hour',
    'available',
    'verified',
    'approved',
    '2025-11-04 19:08:33',
    '2025-11-04 19:08:33'
FROM users u WHERE u.email = 'emily.content@example.com'
ON DUPLICATE KEY UPDATE 
    display_name = VALUES(display_name),
    headline = VALUES(headline),
    title = VALUES(title),
    bio = VALUES(bio),
    description = VALUES(description),
    country = VALUES(country),
    skills = VALUES(skills),
    avatar_url = VALUES(avatar_url),
    hourly_rate_cents = VALUES(hourly_rate_cents),
    rating = VALUES(rating),
    total_reviews = VALUES(total_reviews),
    completed_projects = VALUES(completed_projects),
    response_time = VALUES(response_time),
    availability = VALUES(availability),
    verification_state = VALUES(verification_state),
    status = VALUES(status);

INSERT INTO freelancers (
    user_id,
    display_name,
    headline,
    title,
    bio,
    description,
    country,
    skills,
    avatar_url,
    hourly_rate_cents,
    rating,
    total_reviews,
    completed_projects,
    response_time,
    availability,
    verification_state,
    status,
    created_at,
    updated_at
)
SELECT 
    u.id,
    'David Mobile',
    'Mobile App Developer',
    'iOS & Android Developer',
    'Creating native mobile experiences',
    'Expert mobile app developer with proven track record in iOS and Android development. Specialized in React Native, Flutter, and native development.',
    'Germany',
    JSON_ARRAY('Swift', 'Kotlin', 'React Native', 'Flutter', 'iOS', 'Android', 'Mobile UI/UX'),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    8000,
    4.88,
    22,
    58,
    'Within 2 hours',
    'available',
    'verified',
    'approved',
    '2025-11-04 19:08:33',
    '2025-11-04 19:08:33'
FROM users u WHERE u.email = 'david.mobile@example.com'
ON DUPLICATE KEY UPDATE 
    display_name = VALUES(display_name),
    headline = VALUES(headline),
    title = VALUES(title),
    bio = VALUES(bio),
    description = VALUES(description),
    country = VALUES(country),
    skills = VALUES(skills),
    avatar_url = VALUES(avatar_url),
    hourly_rate_cents = VALUES(hourly_rate_cents),
    rating = VALUES(rating),
    total_reviews = VALUES(total_reviews),
    completed_projects = VALUES(completed_projects),
    response_time = VALUES(response_time),
    availability = VALUES(availability),
    verification_state = VALUES(verification_state),
    status = VALUES(status);

