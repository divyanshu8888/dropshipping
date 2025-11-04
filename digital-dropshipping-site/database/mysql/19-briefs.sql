-- ============================================================================
-- BRIEFS TABLE - MySQL Version
-- ============================================================================

USE uniti;

CREATE TABLE IF NOT EXISTS briefs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    client_id INT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    service_id INT UNSIGNED NULL,
    budget_cents INT UNSIGNED NULL,
    currency CHAR(3) NOT NULL DEFAULT 'AUD',                         -- ISO 4217 currency code
    deadline DATE NULL,
    status ENUM('draft', 'open', 'closed', 'archived') NOT NULL DEFAULT 'open',
    created_by INT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_briefs_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    CONSTRAINT fk_briefs_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    CONSTRAINT fk_briefs_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,

    INDEX idx_briefs_client (client_id),
    INDEX idx_briefs_service (service_id),
    INDEX idx_briefs_created_by (created_by),
    INDEX idx_briefs_status (status),
    INDEX idx_briefs_deadline (deadline)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Recovery table
CREATE TABLE IF NOT EXISTS briefs_recovery (
    id INT UNSIGNED PRIMARY KEY,
    client_id INT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    service_id INT UNSIGNED NULL,
    budget_cents INT UNSIGNED NULL,
    currency CHAR(3) NOT NULL DEFAULT 'AUD',
    deadline DATE NULL,
    status ENUM('draft', 'open', 'closed', 'archived') NOT NULL DEFAULT 'open',
    created_by INT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    recovery_imported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients_recovery(id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

DROP TRIGGER IF EXISTS trigger_auto_sync_briefs_insert;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_briefs_insert
    AFTER INSERT ON briefs
    FOR EACH ROW
BEGIN
    INSERT INTO briefs_recovery (id, client_id, title, description, service_id, budget_cents, currency, deadline, status, created_by, created_at, updated_at, recovery_imported_at)
    VALUES (NEW.id, NEW.client_id, NEW.title, NEW.description, NEW.service_id, NEW.budget_cents, NEW.currency, NEW.deadline, NEW.status, NEW.created_by, NEW.created_at, NEW.updated_at, NOW())
    ON DUPLICATE KEY UPDATE
        client_id = NEW.client_id,
        title = NEW.title,
        description = NEW.description,
        service_id = NEW.service_id,
        budget_cents = NEW.budget_cents,
        currency = NEW.currency,
        deadline = NEW.deadline,
        status = NEW.status,
        created_by = NEW.created_by,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW();
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_briefs_update;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_briefs_update
    AFTER UPDATE ON briefs
    FOR EACH ROW
BEGIN
    UPDATE briefs_recovery 
    SET client_id = NEW.client_id,
        title = NEW.title,
        description = NEW.description,
        service_id = NEW.service_id,
        budget_cents = NEW.budget_cents,
        currency = NEW.currency,
        deadline = NEW.deadline,
        status = NEW.status,
        created_by = NEW.created_by,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW()
    WHERE id = NEW.id;
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_briefs_delete;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_briefs_delete
    AFTER DELETE ON briefs
    FOR EACH ROW
BEGIN
    DELETE FROM briefs_recovery WHERE id = OLD.id;
END$$

DELIMITER ;

-- Sample data
-- Note: Requires clients, services, and users to exist first
INSERT INTO briefs (client_id, title, description, service_id, budget_cents, currency, deadline, status, created_by)
SELECT 
    c.id,
    'Website Redesign Project',
    'Looking for a complete website redesign with modern UI/UX. The site needs to be responsive, fast, and user-friendly. Should include e-commerce functionality.',
    (SELECT id FROM services WHERE slug = 'web-development' LIMIT 1),
    500000,
    'AUD',
    DATE_ADD(NOW(), INTERVAL 60 DAY),
    'open',
    c.owner_id
FROM clients c
WHERE c.status = 'active'
LIMIT 1
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO briefs (client_id, title, description, service_id, budget_cents, currency, deadline, status, created_by)
SELECT 
    c.id,
    'Mobile App Development',
    'Need a native mobile application for iOS and Android. Features include user authentication, push notifications, and in-app purchases.',
    (SELECT id FROM services WHERE slug = 'mobile-app-development' LIMIT 1),
    1000000,
    'AUD',
    DATE_ADD(NOW(), INTERVAL 90 DAY),
    'open',
    c.owner_id
FROM clients c
WHERE c.status = 'active'
LIMIT 1
ON DUPLICATE KEY UPDATE title = VALUES(title);

