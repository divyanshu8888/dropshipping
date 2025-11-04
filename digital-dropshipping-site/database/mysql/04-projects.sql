-- ============================================================================
-- PROJECTS TABLE - MySQL Version
-- ============================================================================

USE uniti;

CREATE TABLE IF NOT EXISTS projects (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    client_id INT UNSIGNED NOT NULL,
    freelancer_id INT UNSIGNED NULL,
    created_by INT UNSIGNED NOT NULL,
    service_id INT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    budget_cents INT UNSIGNED NULL,                                 -- Amount in cents (more precise than budget)
    budget INT UNSIGNED NULL,                                       -- Legacy field, use budget_cents
    currency CHAR(3) NOT NULL DEFAULT 'AUD',                        -- ISO 4217 currency code
    status ENUM('draft', 'open', 'in_review', 'contracted', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed') NOT NULL DEFAULT 'open',
    deadline DATE NULL,
    started_at DATETIME NULL,                                       -- When project actually started
    completed_at DATETIME NULL,                                     -- When project was completed
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_projects_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    CONSTRAINT fk_projects_freelancer FOREIGN KEY (freelancer_id) REFERENCES freelancers(id) ON DELETE SET NULL,
    CONSTRAINT fk_projects_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
    -- Note: service_id FK will be added after services table is created
    -- ALTER TABLE projects ADD CONSTRAINT fk_projects_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL;
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Indexes for common queries
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_client_status ON projects(client_id, status);
CREATE INDEX idx_projects_freelancer_id ON projects(freelancer_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_service_id ON projects(service_id);
CREATE INDEX idx_projects_deadline ON projects(deadline);

-- ============================================================================
-- RECOVERY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS projects_recovery (
    id INT UNSIGNED PRIMARY KEY,
    client_id INT UNSIGNED NOT NULL,
    freelancer_id INT UNSIGNED NULL,
    created_by INT UNSIGNED NOT NULL,
    service_id INT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    budget_cents INT UNSIGNED NULL,
    budget INT UNSIGNED NULL,
    currency CHAR(3) NOT NULL DEFAULT 'AUD',
    status ENUM('draft', 'open', 'in_review', 'contracted', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed') NOT NULL DEFAULT 'open',
    deadline DATE NULL,
    started_at DATETIME NULL,
    completed_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    recovery_imported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients_recovery(id) ON DELETE CASCADE,
    FOREIGN KEY (freelancer_id) REFERENCES freelancers_recovery(id) ON DELETE SET NULL
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Triggers
DROP TRIGGER IF EXISTS trigger_auto_sync_projects_insert;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_projects_insert
    AFTER INSERT ON projects
    FOR EACH ROW
BEGIN
    INSERT INTO projects_recovery (id, client_id, freelancer_id, created_by, service_id, title, description, budget_cents, budget, currency, status, deadline, started_at, completed_at, created_at, updated_at, recovery_imported_at)
    VALUES (NEW.id, NEW.client_id, NEW.freelancer_id, NEW.created_by, NEW.service_id, NEW.title, NEW.description, NEW.budget_cents, NEW.budget, NEW.currency, NEW.status, NEW.deadline, NEW.started_at, NEW.completed_at, NEW.created_at, NEW.updated_at, NOW())
    ON DUPLICATE KEY UPDATE
        client_id = NEW.client_id,
        freelancer_id = NEW.freelancer_id,
        created_by = NEW.created_by,
        service_id = NEW.service_id,
        title = NEW.title,
        description = NEW.description,
        budget_cents = NEW.budget_cents,
        budget = NEW.budget,
        currency = NEW.currency,
        status = NEW.status,
        deadline = NEW.deadline,
        started_at = NEW.started_at,
        completed_at = NEW.completed_at,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW();
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_projects_update;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_projects_update
    AFTER UPDATE ON projects
    FOR EACH ROW
BEGIN
    UPDATE projects_recovery 
    SET client_id = NEW.client_id,
        freelancer_id = NEW.freelancer_id,
        created_by = NEW.created_by,
        service_id = NEW.service_id,
        title = NEW.title,
        description = NEW.description,
        budget_cents = NEW.budget_cents,
        budget = NEW.budget,
        currency = NEW.currency,
        status = NEW.status,
        deadline = NEW.deadline,
        started_at = NEW.started_at,
        completed_at = NEW.completed_at,
        created_at = NEW.created_at,
        updated_at = NEW.updated_at,
        recovery_imported_at = NOW()
    WHERE id = NEW.id;
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trigger_auto_sync_projects_delete;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_projects_delete
    AFTER DELETE ON projects
    FOR EACH ROW
BEGIN
    DELETE FROM projects_recovery WHERE id = OLD.id;
END$$

DELIMITER ;

-- Sample data
-- Note: Replace IDs with actual IDs from related tables after inserting users, clients, freelancers
INSERT INTO projects (client_id, created_by, title, description, budget_cents, currency, status, deadline)
SELECT 
    c.id,
    u.id,
    'Website Redesign Project',
    'Complete redesign of company website with modern UI/UX',
    500000,
    'AUD',
    'open',
    DATE_ADD(NOW(), INTERVAL 30 DAY)
FROM clients c
JOIN users u ON u.id = c.owner_id
WHERE c.company_name = 'Example Corp'
LIMIT 1
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO projects (client_id, created_by, title, description, budget_cents, currency, status, deadline)
SELECT 
    c.id,
    u.id,
    'Mobile App Development',
    'Native iOS and Android mobile application',
    1000000,
    'USD',
    'open',
    DATE_ADD(NOW(), INTERVAL 60 DAY)
FROM clients c
JOIN users u ON u.id = c.owner_id
WHERE c.company_name = 'Tech Solutions Inc'
LIMIT 1
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Add service_id foreign key constraint after services table is created
-- Run this after executing 09-services.sql:
-- ALTER TABLE projects 
--   ADD CONSTRAINT fk_projects_service 
--   FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL;

