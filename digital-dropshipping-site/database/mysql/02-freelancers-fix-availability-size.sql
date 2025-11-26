-- ============================================================================
-- FIX AVAILABILITY COLUMN SIZE
-- ============================================================================
-- The availability column needs to be larger to store formatted strings like:
-- "available|timezone=America/New_York|hours=09:00-17:00|date=2024-12-25"
-- This can easily exceed 50 characters, so we increase it to VARCHAR(255)
-- ============================================================================

USE uniti;

-- Increase availability column size to accommodate formatted strings
ALTER TABLE freelancers
  MODIFY COLUMN availability VARCHAR(255) DEFAULT 'available';

-- Also update the recovery table
ALTER TABLE freelancers_recovery
  MODIFY COLUMN availability VARCHAR(255) DEFAULT 'available';


