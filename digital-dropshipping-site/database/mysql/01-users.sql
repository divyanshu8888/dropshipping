-- ============================================================================
-- USERS TABLE - MySQL Version
-- ============================================================================
-- IMPORTANT: Create database first as root user:
--   CREATE DATABASE uniti_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Then grant permissions if needed:
--   GRANT ALL ON uniti_db.* TO 'uniti'@'localhost';
--   FLUSH PRIVILEGES;
-- Then run this script

USE uniti;

-- ============================================================================
-- CREATE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'freelancer', 'client', 'team_member') NOT NULL DEFAULT 'client',
    display_name VARCHAR(150),
    avatar_url VARCHAR(512),
    timezone VARCHAR(50) DEFAULT 'UTC',
    auth_user_id INT UNSIGNED,
    is_active ENUM('TRUE', 'FALSE') NOT NULL DEFAULT 'TRUE',
    email_verified ENUM('TRUE', 'FALSE') NOT NULL DEFAULT 'FALSE',
    last_login DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (email),
    INDEX (role),
    INDEX (is_active),
    INDEX (auth_user_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- RECOVERY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users_recovery (
    id INT UNSIGNED PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'freelancer', 'client', 'team_member') NOT NULL DEFAULT 'client',
    is_active ENUM('TRUE', 'FALSE') NOT NULL DEFAULT 'TRUE',
    email_verified ENUM('TRUE', 'FALSE') NOT NULL DEFAULT 'FALSE',
    last_login DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    recovery_imported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- RECOVERY SYNC TRIGGER
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_auto_sync_users_insert;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_users_insert
    AFTER INSERT ON users
    FOR EACH ROW
BEGIN
    INSERT INTO users_recovery (id, email, password_hash, role, is_active, email_verified, last_login, created_at, updated_at, recovery_imported_at)
    VALUES (NEW.id, NEW.email, NEW.password_hash, NEW.role, NEW.is_active, NEW.email_verified, NEW.last_login, NEW.created_at, NEW.updated_at, NOW())
    ON DUPLICATE KEY UPDATE
        email = NEW.email,
        password_hash = NEW.password_hash,
        role = NEW.role,
        is_active = NEW.is_active,
        email_verified = NEW.email_verified,
        last_login = NEW.last_login,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW();
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_users_update;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_users_update
    AFTER UPDATE ON users
    FOR EACH ROW
BEGIN
    UPDATE users_recovery 
    SET email = NEW.email,
        password_hash = NEW.password_hash,
        role = NEW.role,
        is_active = NEW.is_active,
        email_verified = NEW.email_verified,
        last_login = NEW.last_login,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW()
    WHERE id = NEW.id;
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_users_delete;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_users_delete
    AFTER DELETE ON users
    FOR EACH ROW
BEGIN
    DELETE FROM users_recovery WHERE id = OLD.id;
END$$

DELIMITER ;

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================
INSERT INTO users (email, password_hash, role, display_name, is_active, email_verified) VALUES
    ('admin@uniti.com', '$2b$10$example', 'admin', 'Admin User', 'TRUE', 'TRUE'),
    ('freelancer@example.com', '$2b$10$example', 'freelancer', 'John Freelancer', 'TRUE', 'TRUE'),
    ('client@example.com', '$2b$10$example', 'client', 'Jane Client', 'TRUE', 'TRUE'),
    ('freelancer2@example.com', '$2b$10$example', 'freelancer', 'Sarah Designer', 'TRUE', 'TRUE'),
    ('client2@example.com', '$2b$10$example', 'client', 'Bob Company', 'TRUE', 'TRUE')
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name);

