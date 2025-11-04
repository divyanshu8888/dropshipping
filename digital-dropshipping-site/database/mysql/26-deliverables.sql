-- ============================================================================
-- DELIVERABLES TABLE - MySQL Version
-- ============================================================================

USE uniti;

CREATE TABLE IF NOT EXISTS deliverables (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id INT UNSIGNED NULL,
    milestone_id INT UNSIGNED NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    file_path VARCHAR(512) NULL,                                   -- File storage path
    submitted_at DATETIME NULL,
    approved_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_deliverables_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_deliverables_milestone FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE,

    INDEX idx_deliverables_project_id (project_id),
    INDEX idx_deliverables_milestone (milestone_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Recovery table
CREATE TABLE IF NOT EXISTS deliverables_recovery (
    id INT UNSIGNED PRIMARY KEY,
    project_id INT UNSIGNED NULL,
    milestone_id INT UNSIGNED NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    file_path VARCHAR(512) NULL,
    submitted_at DATETIME NULL,
    approved_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    recovery_imported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects_recovery(id) ON DELETE CASCADE,
    FOREIGN KEY (milestone_id) REFERENCES milestones_recovery(id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Triggers
DROP TRIGGER IF EXISTS trigger_auto_sync_deliverables_insert;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_deliverables_insert
    AFTER INSERT ON deliverables
    FOR EACH ROW
BEGIN
    INSERT INTO deliverables_recovery (id, project_id, milestone_id, title, description, file_path, submitted_at, approved_at, created_at, updated_at, recovery_imported_at)
    VALUES (NEW.id, NEW.project_id, NEW.milestone_id, NEW.title, NEW.description, NEW.file_path, NEW.submitted_at, NEW.approved_at, NEW.created_at, NEW.updated_at, NOW())
    ON DUPLICATE KEY UPDATE
        project_id = NEW.project_id,
        milestone_id = NEW.milestone_id,
        title = NEW.title,
        description = NEW.description,
        file_path = NEW.file_path,
        submitted_at = NEW.submitted_at,
        approved_at = NEW.approved_at,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW();
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_deliverables_update;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_deliverables_update
    AFTER UPDATE ON deliverables
    FOR EACH ROW
BEGIN
    UPDATE deliverables_recovery 
    SET project_id = NEW.project_id,
        milestone_id = NEW.milestone_id,
        title = NEW.title,
        description = NEW.description,
        file_path = NEW.file_path,
        submitted_at = NEW.submitted_at,
        approved_at = NEW.approved_at,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW()
    WHERE id = NEW.id;
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_deliverables_delete;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_deliverables_delete
    AFTER DELETE ON deliverables
    FOR EACH ROW
BEGIN
    DELETE FROM deliverables_recovery WHERE id = OLD.id;
END$$

DELIMITER ;

-- Sample data
-- Note: Requires projects and milestones to exist first
INSERT INTO deliverables (project_id, milestone_id, title, description, file_path, submitted_at)
SELECT 
    p.id,
    m.id,
    'Project Documentation',
    'Complete project documentation and specifications',
    '/files/deliverables/doc-001.pdf',
    NOW()
FROM projects p
JOIN contracts c ON c.project_id = p.id
JOIN milestones m ON m.contract_id = c.id
WHERE m.status = 'submitted'
LIMIT 1
ON DUPLICATE KEY UPDATE title = VALUES(title);

