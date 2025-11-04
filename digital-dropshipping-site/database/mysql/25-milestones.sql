-- ============================================================================
-- MILESTONES TABLE - MySQL Version
-- ============================================================================

USE uniti;

CREATE TABLE IF NOT EXISTS milestones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    contract_id INT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    amount_cents INT UNSIGNED NOT NULL,
    due_date DATE NULL,
    status ENUM('pending', 'funded', 'in_progress', 'submitted', 'approved', 'released', 'rejected') NOT NULL DEFAULT 'pending',
    sort_order INT UNSIGNED DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_milestones_contract FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,

    INDEX idx_milestones_contract (contract_id),
    INDEX idx_milestones_status (status),
    INDEX idx_milestones_sort_order (contract_id, sort_order)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Recovery table
CREATE TABLE IF NOT EXISTS milestones_recovery (
    id INT UNSIGNED PRIMARY KEY,
    contract_id INT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    amount_cents INT UNSIGNED NOT NULL,
    due_date DATE NULL,
    status ENUM('pending', 'funded', 'in_progress', 'submitted', 'approved', 'released', 'rejected') NOT NULL DEFAULT 'pending',
    sort_order INT UNSIGNED DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    recovery_imported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts_recovery(id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Triggers
DROP TRIGGER IF EXISTS trigger_auto_sync_milestones_insert;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_milestones_insert
    AFTER INSERT ON milestones
    FOR EACH ROW
BEGIN
    INSERT INTO milestones_recovery (id, contract_id, title, description, amount_cents, due_date, status, sort_order, created_at, updated_at, recovery_imported_at)
    VALUES (NEW.id, NEW.contract_id, NEW.title, NEW.description, NEW.amount_cents, NEW.due_date, NEW.status, NEW.sort_order, NEW.created_at, NEW.updated_at, NOW())
    ON DUPLICATE KEY UPDATE
        contract_id = NEW.contract_id,
        title = NEW.title,
        description = NEW.description,
        amount_cents = NEW.amount_cents,
        due_date = NEW.due_date,
        status = NEW.status,
        sort_order = NEW.sort_order,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW();
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_milestones_update;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_milestones_update
    AFTER UPDATE ON milestones
    FOR EACH ROW
BEGIN
    UPDATE milestones_recovery 
    SET contract_id = NEW.contract_id,
        title = NEW.title,
        description = NEW.description,
        amount_cents = NEW.amount_cents,
        due_date = NEW.due_date,
        status = NEW.status,
        sort_order = NEW.sort_order,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW()
    WHERE id = NEW.id;
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_milestones_delete;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_milestones_delete
    AFTER DELETE ON milestones
    FOR EACH ROW
BEGIN
    DELETE FROM milestones_recovery WHERE id = OLD.id;
END$$

DELIMITER ;

-- Sample data
-- Note: Requires contracts to exist first
INSERT INTO milestones (contract_id, title, description, amount_cents, due_date, status, sort_order)
SELECT 
    c.id,
    'Initial Setup & Planning',
    'Project setup, requirements gathering, and initial planning phase',
    100000,
    DATE_ADD(NOW(), INTERVAL 7 DAY),
    'pending',
    1
FROM contracts c
LIMIT 1
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO milestones (contract_id, title, description, amount_cents, due_date, status, sort_order)
SELECT 
    c.id,
    'Development Phase',
    'Core development and implementation',
    300000,
    DATE_ADD(NOW(), INTERVAL 30 DAY),
    'pending',
    2
FROM contracts c
LIMIT 1
ON DUPLICATE KEY UPDATE title = VALUES(title);

