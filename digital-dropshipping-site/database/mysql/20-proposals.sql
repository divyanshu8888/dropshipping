-- ============================================================================
-- PROPOSALS TABLE - MySQL Version
-- ============================================================================

USE uniti;

CREATE TABLE IF NOT EXISTS proposals (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id INT UNSIGNED NULL,
    brief_id INT UNSIGNED NULL,
    freelancer_id INT UNSIGNED NOT NULL,
    status ENUM('sent', 'shortlisted', 'accepted', 'declined', 'withdrawn', 'expired') NOT NULL DEFAULT 'sent',
    total_cents INT UNSIGNED NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'AUD',                         -- ISO 4217 currency code
    message TEXT NULL,
    valid_until DATE NULL,
    submitted_at DATETIME NULL,                                       -- When proposal was submitted
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_proposals_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_proposals_brief FOREIGN KEY (brief_id) REFERENCES briefs(id) ON DELETE CASCADE,
    CONSTRAINT fk_proposals_freelancer FOREIGN KEY (freelancer_id) REFERENCES freelancers(id) ON DELETE CASCADE,

    UNIQUE KEY unique_project_freelancer (project_id, freelancer_id),
    UNIQUE KEY unique_brief_freelancer (brief_id, freelancer_id),

    INDEX idx_proposals_project (project_id),
    INDEX idx_proposals_brief (brief_id),
    INDEX idx_proposals_freelancer (freelancer_id),
    INDEX idx_proposals_status (status),
    INDEX idx_proposals_valid_until (valid_until)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Recovery table
CREATE TABLE IF NOT EXISTS proposals_recovery (
    id INT UNSIGNED PRIMARY KEY,
    project_id INT UNSIGNED NULL,
    brief_id INT UNSIGNED NULL,
    freelancer_id INT UNSIGNED NOT NULL,
    status ENUM('sent', 'shortlisted', 'accepted', 'declined', 'withdrawn', 'expired') NOT NULL DEFAULT 'sent',
    total_cents INT UNSIGNED NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'AUD',
    message TEXT NULL,
    valid_until DATE NULL,
    submitted_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    recovery_imported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects_recovery(id) ON DELETE CASCADE,
    FOREIGN KEY (brief_id) REFERENCES briefs_recovery(id) ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

DROP TRIGGER IF EXISTS trigger_auto_sync_proposals_insert;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_proposals_insert
    AFTER INSERT ON proposals
    FOR EACH ROW
BEGIN
    INSERT INTO proposals_recovery (id, project_id, brief_id, freelancer_id, status, total_cents, currency, message, valid_until, submitted_at, created_at, updated_at, recovery_imported_at)
    VALUES (NEW.id, NEW.project_id, NEW.brief_id, NEW.freelancer_id, NEW.status, NEW.total_cents, NEW.currency, NEW.message, NEW.valid_until, NEW.submitted_at, NEW.created_at, NEW.updated_at, NOW())
    ON DUPLICATE KEY UPDATE
        project_id = NEW.project_id,
        brief_id = NEW.brief_id,
        freelancer_id = NEW.freelancer_id,
        status = NEW.status,
        total_cents = NEW.total_cents,
        currency = NEW.currency,
        message = NEW.message,
        valid_until = NEW.valid_until,
        submitted_at = NEW.submitted_at,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW();
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_proposals_update;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_proposals_update
    AFTER UPDATE ON proposals
    FOR EACH ROW
BEGIN
    UPDATE proposals_recovery 
    SET project_id = NEW.project_id,
        brief_id = NEW.brief_id,
        freelancer_id = NEW.freelancer_id,
        status = NEW.status,
        total_cents = NEW.total_cents,
        currency = NEW.currency,
        message = NEW.message,
        valid_until = NEW.valid_until,
        submitted_at = NEW.submitted_at,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW()
    WHERE id = NEW.id;
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_proposals_delete;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_proposals_delete
    AFTER DELETE ON proposals
    FOR EACH ROW
BEGIN
    DELETE FROM proposals_recovery WHERE id = OLD.id;
END$$

DELIMITER ;

-- Sample data
-- Note: Requires projects/briefs, freelancers to exist first
INSERT INTO proposals (project_id, brief_id, freelancer_id, status, total_cents, currency, message, valid_until, submitted_at)
SELECT 
    p.id,
    NULL,
    f.id,
    'sent',
    450000,
    'AUD',
    'I would be happy to help with your website redesign. I have 5+ years of experience in web development and UI/UX design. Looking forward to working with you!',
    DATE_ADD(NOW(), INTERVAL 30 DAY),
    NOW()
FROM projects p
JOIN freelancers f ON f.status = 'approved'
WHERE p.status = 'open'
LIMIT 1
ON DUPLICATE KEY UPDATE message = VALUES(message);

INSERT INTO proposals (project_id, brief_id, freelancer_id, status, total_cents, currency, message, valid_until, submitted_at)
SELECT 
    NULL,
    b.id,
    f.id,
    'sent',
    480000,
    'AUD',
    'I specialize in modern web design and can deliver a high-quality website redesign within your budget and timeline.',
    DATE_ADD(NOW(), INTERVAL 30 DAY),
    NOW()
FROM briefs b
JOIN freelancers f ON f.status = 'approved'
WHERE b.status = 'open'
LIMIT 1
ON DUPLICATE KEY UPDATE message = VALUES(message);

