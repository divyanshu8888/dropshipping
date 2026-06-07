-- ============================================================================
-- MIGRATION: Add category and skills_required to projects table
-- ============================================================================

USE uniti;

ALTER TABLE projects
  ADD COLUMN category VARCHAR(100) NULL DEFAULT NULL AFTER status,
  ADD COLUMN skills_required JSON NULL DEFAULT NULL AFTER category;

-- Mirror columns on recovery table
ALTER TABLE projects_recovery
  ADD COLUMN category VARCHAR(100) NULL DEFAULT NULL AFTER status,
  ADD COLUMN skills_required JSON NULL DEFAULT NULL AFTER category;

-- Update triggers to include new fields

DROP TRIGGER IF EXISTS trigger_auto_sync_projects_insert;

DELIMITER $$

CREATE TRIGGER trigger_auto_sync_projects_insert
    AFTER INSERT ON projects
    FOR EACH ROW
BEGIN
    INSERT INTO projects_recovery (
        id, client_id, freelancer_id, created_by, service_id,
        title, description, budget_cents, budget, currency,
        status, category, skills_required,
        deadline, started_at, completed_at,
        created_at, updated_at, recovery_imported_at
    )
    VALUES (
        NEW.id, NEW.client_id, NEW.freelancer_id, NEW.created_by, NEW.service_id,
        NEW.title, NEW.description, NEW.budget_cents, NEW.budget, NEW.currency,
        NEW.status, NEW.category, NEW.skills_required,
        NEW.deadline, NEW.started_at, NEW.completed_at,
        NEW.created_at, NEW.updated_at, NOW()
    )
    ON DUPLICATE KEY UPDATE
        client_id        = NEW.client_id,
        freelancer_id    = NEW.freelancer_id,
        created_by       = NEW.created_by,
        service_id       = NEW.service_id,
        title            = NEW.title,
        description      = NEW.description,
        budget_cents     = NEW.budget_cents,
        budget           = NEW.budget,
        currency         = NEW.currency,
        status           = NEW.status,
        category         = NEW.category,
        skills_required  = NEW.skills_required,
        deadline         = NEW.deadline,
        started_at       = NEW.started_at,
        completed_at     = NEW.completed_at,
        created_at       = NEW.created_at,
        updated_at       = NEW.updated_at,
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
    SET client_id        = NEW.client_id,
        freelancer_id    = NEW.freelancer_id,
        created_by       = NEW.created_by,
        service_id       = NEW.service_id,
        title            = NEW.title,
        description      = NEW.description,
        budget_cents     = NEW.budget_cents,
        budget           = NEW.budget,
        currency         = NEW.currency,
        status           = NEW.status,
        category         = NEW.category,
        skills_required  = NEW.skills_required,
        deadline         = NEW.deadline,
        started_at       = NEW.started_at,
        completed_at     = NEW.completed_at,
        created_at       = NEW.created_at,
        updated_at       = NEW.updated_at,
        recovery_imported_at = NOW()
    WHERE id = NEW.id;
END$$

DELIMITER ;

-- Index for category filter on open projects page
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_status_category ON projects(status, category);
