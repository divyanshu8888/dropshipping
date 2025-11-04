-- ============================================================================
-- CLIENTS TABLE - MySQL Version
-- ============================================================================

USE uniti;

CREATE TABLE IF NOT EXISTS clients (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  owner_id         INT UNSIGNED NOT NULL,                         -- required: account owner
  user_id          INT UNSIGNED NULL,                              -- optional: legacy primary contact
  client_type      ENUM('individual','organization') NOT NULL DEFAULT 'organization',
  company_name     VARCHAR(200) NOT NULL,                          -- legal/brand name
  display_name     VARCHAR(200) NULL,                              -- optional shorter label
  contact_name     VARCHAR(120) NULL,
  contact_email    VARCHAR(255) NULL,
  phone            VARCHAR(32) NULL,
  address_line1    VARCHAR(200) NULL,
  address_line2    VARCHAR(200) NULL,
  city             VARCHAR(120) NULL,
  region           VARCHAR(120) NULL,
  postal_code      VARCHAR(32)  NULL,
  country_code     CHAR(2) NULL,                                   -- ISO-3166-1 alpha-2
  website          VARCHAR(255) NULL,
  company_number   VARCHAR(64)  NULL,                              -- ABN/ACN/EIN/etc.
  tax_id           VARCHAR(64)  NULL,
  status           ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_clients_owner  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_clients_user   FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE SET NULL,

  -- prevent accidental duplicates for the same owner/org name
  UNIQUE KEY uq_owner_company (owner_id, company_name),

  -- helpful filters
  INDEX idx_clients_owner_id (owner_id),
  INDEX idx_clients_user_id  (user_id),
  INDEX idx_clients_company  (company_name),
  INDEX idx_clients_status   (status)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Recovery table
CREATE TABLE IF NOT EXISTS clients_recovery (
    id INT UNSIGNED PRIMARY KEY,
    owner_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NULL,
    client_type ENUM('individual','organization') NOT NULL DEFAULT 'organization',
    company_name VARCHAR(200) NOT NULL,
    display_name VARCHAR(200) NULL,
    contact_name VARCHAR(120) NULL,
    contact_email VARCHAR(255) NULL,
    phone VARCHAR(32) NULL,
    address_line1 VARCHAR(200) NULL,
    address_line2 VARCHAR(200) NULL,
    city VARCHAR(120) NULL,
    region VARCHAR(120) NULL,
    postal_code VARCHAR(32) NULL,
    country_code CHAR(2) NULL,
    website VARCHAR(255) NULL,
    company_number VARCHAR(64) NULL,
    tax_id VARCHAR(64) NULL,
    status ENUM('active','inactive') NOT NULL DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    recovery_imported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users_recovery(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users_recovery(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Triggers
DROP TRIGGER IF EXISTS trigger_auto_sync_clients_insert;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_clients_insert
    AFTER INSERT ON clients
    FOR EACH ROW
BEGIN
    INSERT INTO clients_recovery (id, owner_id, user_id, client_type, company_name, display_name, contact_name, contact_email, phone, address_line1, address_line2, city, region, postal_code, country_code, website, company_number, tax_id, status, created_at, updated_at, recovery_imported_at)
    VALUES (NEW.id, NEW.owner_id, NEW.user_id, NEW.client_type, NEW.company_name, NEW.display_name, NEW.contact_name, NEW.contact_email, NEW.phone, NEW.address_line1, NEW.address_line2, NEW.city, NEW.region, NEW.postal_code, NEW.country_code, NEW.website, NEW.company_number, NEW.tax_id, NEW.status, NEW.created_at, NEW.updated_at, NOW())
    ON DUPLICATE KEY UPDATE
        owner_id = NEW.owner_id,
        user_id = NEW.user_id,
        client_type = NEW.client_type,
        company_name = NEW.company_name,
        display_name = NEW.display_name,
        contact_name = NEW.contact_name,
        contact_email = NEW.contact_email,
        phone = NEW.phone,
        address_line1 = NEW.address_line1,
        address_line2 = NEW.address_line2,
        city = NEW.city,
        region = NEW.region,
        postal_code = NEW.postal_code,
        country_code = NEW.country_code,
        website = NEW.website,
        company_number = NEW.company_number,
        tax_id = NEW.tax_id,
        status = NEW.status,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW();
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_clients_update;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_clients_update
    AFTER UPDATE ON clients
    FOR EACH ROW
BEGIN
    UPDATE clients_recovery 
    SET owner_id = NEW.owner_id,
        user_id = NEW.user_id,
        client_type = NEW.client_type,
        company_name = NEW.company_name,
        display_name = NEW.display_name,
        contact_name = NEW.contact_name,
        contact_email = NEW.contact_email,
        phone = NEW.phone,
        address_line1 = NEW.address_line1,
        address_line2 = NEW.address_line2,
        city = NEW.city,
        region = NEW.region,
        postal_code = NEW.postal_code,
        country_code = NEW.country_code,
        website = NEW.website,
        company_number = NEW.company_number,
        tax_id = NEW.tax_id,
        status = NEW.status,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW()
    WHERE id = NEW.id;
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_clients_delete;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_clients_delete
    AFTER DELETE ON clients
    FOR EACH ROW
BEGIN
    DELETE FROM clients_recovery WHERE id = OLD.id;
END$$

DELIMITER ;

-- Sample data
-- Note: Replace owner_id with actual IDs from users table after inserting users
INSERT INTO clients (owner_id, user_id, client_type, company_name, display_name, contact_name, contact_email, phone, country_code, status)
SELECT 
    u.id,
    u.id,
    'organization',
    'Example Corp',
    'Example Corp',
    'Jane Client',
    'client@example.com',
    '+61 400 000 000',
    'AU',
    'active'
FROM users u WHERE u.email = 'client@example.com'
ON DUPLICATE KEY UPDATE company_name = VALUES(company_name);

INSERT INTO clients (owner_id, user_id, client_type, company_name, display_name, contact_name, contact_email, phone, country_code, status)
SELECT 
    u.id,
    u.id,
    'organization',
    'Tech Solutions Inc',
    'Tech Solutions Inc',
    'Bob Company',
    'client2@example.com',
    '+1 555 123 4567',
    'US',
    'active'
FROM users u WHERE u.email = 'client2@example.com'
ON DUPLICATE KEY UPDATE company_name = VALUES(company_name);

