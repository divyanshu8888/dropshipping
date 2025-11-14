-- ============================================================================
-- SERVICES TABLE - MySQL Version
-- ============================================================================

USE uniti;

CREATE TABLE IF NOT EXISTS services (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id INT UNSIGNED NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,                               -- URL-friendly identifier
    description TEXT NULL,
    short_description VARCHAR(500) NULL,                            -- Brief summary for listings
    icon_url VARCHAR(512) NULL,                                     -- URL to service icon
    image_url VARCHAR(512) NULL,                                    -- URL to service banner/image
    base_price_cents INT UNSIGNED NULL,                             -- Starting price in cents
    currency CHAR(3) NOT NULL DEFAULT 'AUD',                         -- ISO 4217 currency code
    display_order INT UNSIGNED DEFAULT 0,                           -- Order for display/sorting
    is_active ENUM('TRUE', 'FALSE') NOT NULL DEFAULT 'TRUE',        -- Whether service is active
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_services_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,

    INDEX idx_services_category_id (category_id),
    INDEX idx_services_name (name),
    INDEX idx_services_slug (slug),
    INDEX idx_services_display_order (display_order),
    INDEX idx_services_is_active (is_active)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Sample data with all fields populated
INSERT INTO services (category_id, name, slug, description, short_description, icon_url, image_url, base_price_cents, currency, display_order, is_active) VALUES
    ((SELECT id FROM categories WHERE slug = 'web-development' LIMIT 1), 'Website Development', 'website-development', 'Complete website development from design to deployment', 'Custom website development services', 'https://example.com/icons/website-dev.svg', 'https://example.com/images/website-dev.jpg', 500000, 'AUD', 1, 'TRUE'),
    ((SELECT id FROM categories WHERE slug = 'web-development' LIMIT 1), 'E-commerce Development', 'ecommerce-development', 'Full-featured e-commerce platform development', 'Online store development with payment integration', 'https://example.com/icons/ecommerce.svg', 'https://example.com/images/ecommerce.jpg', 1000000, 'AUD', 2, 'TRUE'),
    ((SELECT id FROM categories WHERE slug = 'design' LIMIT 1), 'Logo Design', 'logo-design', 'Professional logo design services', 'Custom logo design for your brand', 'https://example.com/icons/logo-design.svg', 'https://example.com/images/logo-design.jpg', 50000, 'AUD', 1, 'TRUE'),
    ((SELECT id FROM categories WHERE slug = 'design' LIMIT 1), 'UI/UX Design', 'ui-ux-design', 'User interface and experience design', 'Modern UI/UX design for web and mobile', 'https://example.com/icons/ui-ux.svg', 'https://example.com/images/ui-ux.jpg', 300000, 'AUD', 2, 'TRUE'),
    ((SELECT id FROM categories WHERE slug = 'marketing' LIMIT 1), 'SEO Services', 'seo-services', 'Search engine optimization services', 'Improve your website ranking and visibility', 'https://example.com/icons/seo.svg', 'https://example.com/images/seo.jpg', 200000, 'AUD', 1, 'TRUE'),
    ((SELECT id FROM categories WHERE slug = 'marketing' LIMIT 1), 'Social Media Management', 'social-media-management', 'Complete social media management services', 'Manage and grow your social media presence', 'https://example.com/icons/social-media.svg', 'https://example.com/images/social-media.jpg', 150000, 'AUD', 2, 'TRUE'),
    ((SELECT id FROM categories WHERE slug = 'writing' LIMIT 1), 'Content Writing', 'content-writing', 'Professional content writing services', 'High-quality content for your website and blog', 'https://example.com/icons/content-writing.svg', 'https://example.com/images/content-writing.jpg', 100000, 'AUD', 1, 'TRUE'),
    ((SELECT id FROM categories WHERE slug = 'writing' LIMIT 1), 'Copywriting', 'copywriting', 'Professional copywriting services', 'Compelling copy that converts visitors to customers', 'https://example.com/icons/copywriting.svg', 'https://example.com/images/copywriting.jpg', 120000, 'AUD', 2, 'TRUE'),
    ((SELECT id FROM categories WHERE slug = 'video' LIMIT 1), 'Video Editing', 'video-editing', 'Professional video editing services', 'High-quality video editing and post-production', 'https://example.com/icons/video-editing.svg', 'https://example.com/images/video-editing.jpg', 250000, 'AUD', 1, 'TRUE'),
    ((SELECT id FROM categories WHERE slug = 'video' LIMIT 1), 'Animation', 'animation', '2D and 3D animation services', 'Creative animation for videos and presentations', 'https://example.com/icons/animation.svg', 'https://example.com/images/animation.jpg', 400000, 'AUD', 2, 'TRUE'),
    ((SELECT id FROM categories WHERE slug = 'business' LIMIT 1), 'Business Consulting', 'business-consulting', 'Strategic business consulting services', 'Expert advice to grow and improve your business', 'https://example.com/icons/business-consulting.svg', 'https://example.com/images/business-consulting.jpg', 300000, 'AUD', 1, 'TRUE'),
    ((SELECT id FROM categories WHERE slug = 'programming' LIMIT 1), 'Custom Software Development', 'custom-software-development', 'Bespoke software development services', 'Custom software solutions tailored to your needs', 'https://example.com/icons/custom-software.svg', 'https://example.com/images/custom-software.jpg', 800000, 'AUD', 1, 'TRUE'),
    ((SELECT id FROM categories WHERE slug = 'data-science' LIMIT 1), 'Data Analysis', 'data-analysis', 'Professional data analysis services', 'Extract insights from your data with expert analysis', 'https://example.com/icons/data-analysis.svg', 'https://example.com/images/data-analysis.jpg', 350000, 'AUD', 1, 'TRUE')
ON DUPLICATE KEY UPDATE 
    category_id = VALUES(category_id),
    description = VALUES(description),
    short_description = VALUES(short_description),
    icon_url = VALUES(icon_url),
    image_url = VALUES(image_url),
    base_price_cents = VALUES(base_price_cents),
    currency = VALUES(currency),
    display_order = VALUES(display_order),
    is_active = VALUES(is_active),
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- SERVICE LISTINGS (Freelancer product catalog)
-- ============================================================================
CREATE TABLE IF NOT EXISTS service_listings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    freelancer_id INT UNSIGNED NOT NULL,
    service_id INT UNSIGNED NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    summary VARCHAR(500) NULL,
    description MEDIUMTEXT NULL,
    hero_image_url VARCHAR(512) NULL,
    base_price_cents INT UNSIGNED NOT NULL DEFAULT 0,
    currency CHAR(3) NOT NULL DEFAULT 'AUD',
    delivery_days SMALLINT UNSIGNED NULL,
    status ENUM('draft','active','paused','archived') NOT NULL DEFAULT 'draft',
    display_order INT UNSIGNED NOT NULL DEFAULT 1000,
    is_featured ENUM('TRUE','FALSE') NOT NULL DEFAULT 'FALSE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_listing_freelancer (freelancer_id),
    INDEX idx_listing_service (service_id),
    INDEX idx_listing_status (status),

    CONSTRAINT fk_listing_freelancer
        FOREIGN KEY (freelancer_id) REFERENCES freelancers(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_listing_service
        FOREIGN KEY (service_id) REFERENCES services(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- Seed listings by pairing approved freelancers with active services
INSERT INTO service_listings (
    freelancer_id,
    service_id,
    slug,
    title,
    summary,
    description,
    hero_image_url,
    base_price_cents,
    currency,
    delivery_days,
    status,
    display_order,
    is_featured
)
SELECT
    f.id,
    s.id,
    CONCAT(s.slug, '-', f.id),
    CONCAT(s.name, ' · Operated by ', f.display_name),
    'Done-for-you package delivered by a verified Uniti operator.',
    s.description,
    s.image_url,
    COALESCE(s.base_price_cents, 250000),
    s.currency,
    14,
    'active',
    100 + ROW_NUMBER() OVER (ORDER BY f.id),
    'FALSE'
FROM freelancers f
JOIN services s ON s.is_active = 'TRUE'
WHERE f.status = 'approved'
LIMIT 9
ON DUPLICATE KEY UPDATE
    summary = VALUES(summary),
    description = VALUES(description),
    hero_image_url = VALUES(hero_image_url),
    base_price_cents = VALUES(base_price_cents),
    delivery_days = VALUES(delivery_days),
    status = VALUES(status),
    display_order = VALUES(display_order),
    updated_at = CURRENT_TIMESTAMP;

