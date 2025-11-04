-- ============================================================================
-- CONVERSATIONS TABLE - MySQL Version
-- ============================================================================

USE uniti;

CREATE TABLE IF NOT EXISTS conversations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id INT UNSIGNED NULL,
    title VARCHAR(200) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_conversations_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,

    INDEX idx_conversations_project_id (project_id),
    INDEX idx_conversations_updated_at (updated_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Recovery table
CREATE TABLE IF NOT EXISTS conversations_recovery (
    id INT UNSIGNED PRIMARY KEY,
    project_id INT UNSIGNED NULL,
    title VARCHAR(200) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    recovery_imported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects_recovery(id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Triggers
DROP TRIGGER IF EXISTS trigger_auto_sync_conversations_insert;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_conversations_insert
    AFTER INSERT ON conversations
    FOR EACH ROW
BEGIN
    INSERT INTO conversations_recovery (id, project_id, title, created_at, updated_at, recovery_imported_at)
    VALUES (NEW.id, NEW.project_id, NEW.title, NEW.created_at, NEW.updated_at, NOW())
    ON DUPLICATE KEY UPDATE
        project_id = NEW.project_id,
        title = NEW.title,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW();
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_conversations_update;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_conversations_update
    AFTER UPDATE ON conversations
    FOR EACH ROW
BEGIN
    UPDATE conversations_recovery 
    SET project_id = NEW.project_id,
        title = NEW.title,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW()
    WHERE id = NEW.id;
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_conversations_delete;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_conversations_delete
    AFTER DELETE ON conversations
    FOR EACH ROW
BEGIN
    DELETE FROM conversations_recovery WHERE id = OLD.id;
END$$

DELIMITER ;

-- Sample data
-- Note: Requires projects to exist first
INSERT INTO conversations (project_id, title)
SELECT 
    p.id,
    CONCAT('Project Discussion: ', p.title)
FROM projects p
WHERE p.status IN ('contracted', 'in_progress')
LIMIT 1
ON DUPLICATE KEY UPDATE title = VALUES(title);

