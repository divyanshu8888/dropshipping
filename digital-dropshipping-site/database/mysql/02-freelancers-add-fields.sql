-- ============================================================================
-- ADD NEW FIELDS TO FREELANCERS TABLE
-- ============================================================================
-- This script adds fields needed for the premium freelancer listing page
-- Run this after 02-freelancers.sql
-- 
-- IMPORTANT: MySQL doesn't support IF NOT EXISTS for ALTER TABLE.
-- If you get "Duplicate column name" error, that column already exists - skip it.
-- ============================================================================

USE uniti;

-- Add experience_level
-- If column already exists, skip this statement
ALTER TABLE freelancers
  ADD COLUMN experience_level ENUM('intermediate', 'senior', 'expert') DEFAULT 'intermediate' AFTER completed_projects;

-- Add turnaround_days
-- If column already exists, skip this statement
ALTER TABLE freelancers
  ADD COLUMN turnaround_days TINYINT UNSIGNED DEFAULT 3 AFTER response_time;

-- Add timezone_offset
-- If column already exists, skip this statement
ALTER TABLE freelancers
  ADD COLUMN timezone_offset SMALLINT DEFAULT 0 COMMENT 'Minutes from UTC' AFTER country;

-- Add languages
-- If column already exists, skip this statement
ALTER TABLE freelancers
  ADD COLUMN languages JSON NULL COMMENT 'Array of languages spoken' AFTER skills;

-- Add industries
-- If column already exists, skip this statement
ALTER TABLE freelancers
  ADD COLUMN industries JSON NULL COMMENT 'Array of industries worked in' AFTER languages;

-- Add portfolio_thumbs
-- If column already exists, skip this statement
ALTER TABLE freelancers
  ADD COLUMN portfolio_thumbs JSON NULL COMMENT 'Array of 3 portfolio thumbnail URLs' AFTER avatar_url;

-- Add indexes
-- If index already exists, you'll get an error - that's okay, just continue
CREATE INDEX idx_freelancers_experience_level ON freelancers(experience_level);

CREATE INDEX idx_freelancers_turnaround_days ON freelancers(turnaround_days);

CREATE INDEX idx_freelancers_availability ON freelancers(availability);

-- Update existing records with default/calculated values
UPDATE freelancers 
SET 
  experience_level = COALESCE(experience_level, CASE 
    WHEN completed_projects >= 50 THEN 'expert'
    WHEN completed_projects >= 20 THEN 'senior'
    ELSE 'intermediate'
  END),
  turnaround_days = COALESCE(turnaround_days, CASE 
    WHEN response_time LIKE '%hour%' OR response_time LIKE '%1 hour%' THEN 2
    WHEN response_time LIKE '%2 hours%' THEN 3
    WHEN response_time LIKE '%3 hours%' THEN 4
    ELSE 5
  END),
  languages = COALESCE(languages, JSON_ARRAY('English')),
  industries = COALESCE(industries, JSON_ARRAY('SaaS'))
WHERE experience_level IS NULL 
   OR turnaround_days IS NULL 
   OR languages IS NULL 
   OR industries IS NULL;
