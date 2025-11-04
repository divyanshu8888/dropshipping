-- ============================================================================
-- CONTRACTS TABLE - MySQL Version
-- ============================================================================

USE uniti;

CREATE TABLE IF NOT EXISTS contracts (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id INT UNSIGNED NOT NULL UNIQUE,
    proposal_id INT UNSIGNED NOT NULL,
    start_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    terms TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_contracts_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_contracts_proposal FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE RESTRICT,

    INDEX idx_contracts_project (project_id),
    INDEX idx_contracts_proposal (proposal_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Recovery table
CREATE TABLE IF NOT EXISTS contracts_recovery (
    id INT UNSIGNED PRIMARY KEY,
    project_id INT UNSIGNED NOT NULL,
    proposal_id INT UNSIGNED NOT NULL,
    start_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    terms TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    recovery_imported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects_recovery(id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Triggers
DROP TRIGGER IF EXISTS trigger_auto_sync_contracts_insert;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_contracts_insert
    AFTER INSERT ON contracts
    FOR EACH ROW
BEGIN
    INSERT INTO contracts_recovery (id, project_id, proposal_id, start_at, terms, created_at, updated_at, recovery_imported_at)
    VALUES (NEW.id, NEW.project_id, NEW.proposal_id, NEW.start_at, NEW.terms, NEW.created_at, NEW.updated_at, NOW())
    ON DUPLICATE KEY UPDATE
        project_id = NEW.project_id,
        proposal_id = NEW.proposal_id,
        start_at = NEW.start_at,
        terms = NEW.terms,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW();
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_contracts_update;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_contracts_update
    AFTER UPDATE ON contracts
    FOR EACH ROW
BEGIN
    UPDATE contracts_recovery 
    SET project_id = NEW.project_id,
        proposal_id = NEW.proposal_id,
        start_at = NEW.start_at,
        terms = NEW.terms,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW()
    WHERE id = NEW.id;
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_contracts_delete;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_contracts_delete
    AFTER DELETE ON contracts
    FOR EACH ROW
BEGIN
    DELETE FROM contracts_recovery WHERE id = OLD.id;
END$$

DELIMITER ;

-- Sample data
-- Note: Requires projects and proposals to exist first
INSERT INTO contracts (project_id, proposal_id, start_at, terms)
SELECT 
    p.id,
    pr.id,
    NOW(),
    'Standard service agreement terms apply'
FROM projects p
JOIN proposals pr ON pr.project_id = p.id
WHERE p.status = 'contracted'
LIMIT 1
ON DUPLICATE KEY UPDATE terms = VALUES(terms);

