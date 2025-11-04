-- ============================================================================
-- TESTIMONIALS TABLE - MySQL Version
-- ============================================================================

USE uniti;

CREATE TABLE IF NOT EXISTS testimonials (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    client_name VARCHAR(100) NOT NULL,
    client_title VARCHAR(200) NULL,
    client_company VARCHAR(200) NULL,
    content TEXT NOT NULL,
    rating INT UNSIGNED NULL CHECK (rating >= 1 AND rating <= 5),
    is_featured ENUM('TRUE', 'FALSE') NOT NULL DEFAULT 'FALSE',
    is_active ENUM('TRUE', 'FALSE') NOT NULL DEFAULT 'TRUE',
    client_image_url VARCHAR(512) NULL,                              -- Client photo/avatar URL
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_testimonials_is_featured (is_featured),
    INDEX idx_testimonials_is_active (is_active),
    INDEX idx_testimonials_rating (rating)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Recovery table
CREATE TABLE IF NOT EXISTS testimonials_recovery (
    id INT UNSIGNED PRIMARY KEY,
    client_name VARCHAR(100) NOT NULL,
    client_title VARCHAR(200) NULL,
    client_company VARCHAR(200) NULL,
    content TEXT NOT NULL,
    rating INT UNSIGNED NULL CHECK (rating >= 1 AND rating <= 5),
    is_featured ENUM('TRUE', 'FALSE') NOT NULL DEFAULT 'FALSE',
    is_active ENUM('TRUE', 'FALSE') NOT NULL DEFAULT 'TRUE',
    client_image_url VARCHAR(512) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    recovery_imported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Triggers
DROP TRIGGER IF EXISTS trigger_auto_sync_testimonials_insert;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_testimonials_insert
    AFTER INSERT ON testimonials
    FOR EACH ROW
BEGIN
    INSERT INTO testimonials_recovery (id, client_name, client_title, client_company, content, rating, is_featured, is_active, client_image_url, created_at, updated_at, recovery_imported_at)
    VALUES (NEW.id, NEW.client_name, NEW.client_title, NEW.client_company, NEW.content, NEW.rating, NEW.is_featured, NEW.is_active, NEW.client_image_url, NEW.created_at, NEW.updated_at, NOW())
    ON DUPLICATE KEY UPDATE
        client_name = NEW.client_name,
        client_title = NEW.client_title,
        client_company = NEW.client_company,
        content = NEW.content,
        rating = NEW.rating,
        is_featured = NEW.is_featured,
        is_active = NEW.is_active,
        client_image_url = NEW.client_image_url,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW();
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_testimonials_update;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_testimonials_update
    AFTER UPDATE ON testimonials
    FOR EACH ROW
BEGIN
    UPDATE testimonials_recovery 
    SET client_name = NEW.client_name,
        client_title = NEW.client_title,
        client_company = NEW.client_company,
        content = NEW.content,
        rating = NEW.rating,
        is_featured = NEW.is_featured,
        is_active = NEW.is_active,
        client_image_url = NEW.client_image_url,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW()
    WHERE id = NEW.id;
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_testimonials_delete;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_testimonials_delete
    AFTER DELETE ON testimonials
    FOR EACH ROW
BEGIN
    DELETE FROM testimonials_recovery WHERE id = OLD.id;
END$$

DELIMITER ;

-- Sample data with all fields populated
INSERT INTO testimonials (client_name, client_title, client_company, content, rating, is_featured, is_active, client_image_url) VALUES
    ('Sarah Johnson', 'CEO', 'Tech Innovations Inc', 'Uniti transformed our development process. The quality of work and communication exceeded all expectations. Highly recommended!', 5, 'TRUE', 'TRUE', 'https://example.com/images/clients/sarah-johnson.jpg'),
    ('Michael Chen', 'Marketing Director', 'Growth Partners', 'Outstanding service! The freelancers are professional and deliver on time, every time. Our marketing campaigns have never been better.', 5, 'TRUE', 'TRUE', 'https://example.com/images/clients/michael-chen.jpg'),
    ('Emily Rodriguez', 'Founder', 'Creative Solutions', 'The best marketplace for finding top-tier talent. Highly recommended for any business looking for quality work!', 5, 'TRUE', 'TRUE', 'https://example.com/images/clients/emily-rodriguez.jpg'),
    ('David Kim', 'CTO', 'Digital Ventures', 'Seamless experience from start to finish. Our project was completed ahead of schedule and exceeded expectations.', 5, 'TRUE', 'TRUE', 'https://example.com/images/clients/david-kim.jpg'),
    ('Lisa Anderson', 'Product Manager', 'Innovation Labs', 'Professional freelancers with deep expertise. Worth every penny! The team delivered exactly what we needed.', 5, 'TRUE', 'TRUE', 'https://example.com/images/clients/lisa-anderson.jpg'),
    ('James Wilson', 'Operations Manager', 'Global Enterprises', 'Excellent platform for connecting with skilled professionals. Five stars! The support team is also very responsive.', 5, 'TRUE', 'TRUE', 'https://example.com/images/clients/james-wilson.jpg'),
    ('Maria Garcia', 'Creative Director', 'Design Studio', 'Amazing designers and creative professionals. The quality of work is outstanding and the process is smooth.', 5, 'FALSE', 'TRUE', 'https://example.com/images/clients/maria-garcia.jpg'),
    ('Robert Taylor', 'Business Owner', 'Startup Hub', 'Great experience working with freelancers through Uniti. Fast, reliable, and professional service.', 4, 'FALSE', 'TRUE', 'https://example.com/images/clients/robert-taylor.jpg')
ON DUPLICATE KEY UPDATE 
    content = VALUES(content),
    rating = VALUES(rating),
    is_featured = VALUES(is_featured),
    is_active = VALUES(is_active),
    updated_at = CURRENT_TIMESTAMP;

