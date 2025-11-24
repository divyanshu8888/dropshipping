-- ============================================================================
-- ADD submitted_at FIELD TO MILESTONES TABLE
-- ============================================================================
-- Migration to add submitted_at timestamp for better auto-approval tracking

USE uniti;

-- Add submitted_at column to milestones table
ALTER TABLE milestones 
ADD COLUMN submitted_at DATETIME NULL AFTER status;

-- Add submitted_at column to milestones_recovery table
ALTER TABLE milestones_recovery 
ADD COLUMN submitted_at DATETIME NULL AFTER status;

-- Update existing submitted milestones to have submitted_at = updated_at
UPDATE milestones 
SET submitted_at = updated_at 
WHERE status = 'submitted' AND submitted_at IS NULL;

-- Update recovery table
UPDATE milestones_recovery 
SET submitted_at = updated_at 
WHERE status = 'submitted' AND submitted_at IS NULL;

-- Add index for auto-approval queries
CREATE INDEX idx_milestones_submitted_at ON milestones(submitted_at, status);

