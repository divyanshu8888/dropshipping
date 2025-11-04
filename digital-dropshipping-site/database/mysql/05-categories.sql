-- ============================================================================
-- CATEGORIES TABLE - MySQL Version
-- ============================================================================

USE uniti;

CREATE TABLE IF NOT EXISTS categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,                              -- URL-friendly identifier
    description TEXT NULL,
    icon_url VARCHAR(512) NULL,                                     -- URL to category icon
    image_url VARCHAR(512) NULL,                                   -- URL to category banner/image
    display_order INT UNSIGNED DEFAULT 0,                           -- Order for display/sorting
    is_active ENUM('TRUE', 'FALSE') NOT NULL DEFAULT 'TRUE',        -- Whether category is active
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_categories_name (name),
    INDEX idx_categories_slug (slug),
    INDEX idx_categories_display_order (display_order),
    INDEX idx_categories_is_active (is_active)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Sample data with all fields populated
INSERT INTO categories (name, slug, description, icon_url, image_url, display_order, is_active) VALUES
    ('Web Development', 'web-development', 'Website and web application development services', 'https://example.com/icons/web-dev.svg', 'https://example.com/images/web-dev.jpg', 1, 'TRUE'),
    ('Design', 'design', 'Graphic design, UI/UX design, and visual design services', 'https://example.com/icons/design.svg', 'https://example.com/images/design.jpg', 2, 'TRUE'),
    ('Marketing', 'marketing', 'Digital marketing, SEO, content marketing, and social media services', 'https://example.com/icons/marketing.svg', 'https://example.com/images/marketing.jpg', 3, 'TRUE'),
    ('Writing', 'writing', 'Content writing, copywriting, technical writing, and editing services', 'https://example.com/icons/writing.svg', 'https://example.com/images/writing.jpg', 4, 'TRUE'),
    ('Video', 'video', 'Video editing, animation, motion graphics, and video production services', 'https://example.com/icons/video.svg', 'https://example.com/images/video.jpg', 5, 'TRUE'),
    ('Business', 'business', 'Business consulting, strategy, financial planning, and analysis services', 'https://example.com/icons/business.svg', 'https://example.com/images/business.jpg', 6, 'TRUE'),
    ('Programming', 'programming', 'Software development, coding, and programming services', 'https://example.com/icons/programming.svg', 'https://example.com/images/programming.jpg', 7, 'TRUE'),
    ('Data Science', 'data-science', 'Data analysis, machine learning, and data science services', 'https://example.com/icons/data-science.svg', 'https://example.com/images/data-science.jpg', 8, 'TRUE')
ON DUPLICATE KEY UPDATE 
    description = VALUES(description),
    icon_url = VALUES(icon_url),
    image_url = VALUES(image_url),
    display_order = VALUES(display_order),
    is_active = VALUES(is_active),
    updated_at = CURRENT_TIMESTAMP;

