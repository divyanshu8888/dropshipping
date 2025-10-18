-- Migration: Add freelancer services feature ONLY
-- Run this AFTER running the main schema.sql file

-- NOTE: This migration only adds the freelancer services feature
-- The main schema.sql file already contains all the base tables and policies

-- Create freelancer services table (if not already created by schema.sql)
CREATE TABLE IF NOT EXISTS freelancer_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID NOT NULL REFERENCES freelancers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL, -- in cents
  category TEXT NOT NULL,
  delivery_time INTEGER NOT NULL, -- in days
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on freelancer services (if not already enabled)
ALTER TABLE freelancer_services ENABLE ROW LEVEL SECURITY;

-- Create policies ONLY for freelancer services (other policies already exist in schema.sql)
CREATE POLICY "public_read_freelancer_services" ON freelancer_services
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE AND EXISTS (
    SELECT 1 FROM freelancers 
    WHERE freelancers.id = freelancer_services.freelancer_id 
    AND freelancers.status = 'approved'
  ));

CREATE POLICY "admins_all_freelancer_services" ON freelancer_services
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Create indexes for freelancer services (if not already created)
CREATE INDEX IF NOT EXISTS idx_freelancer_services_freelancer_id ON freelancer_services(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_services_category ON freelancer_services(category);

-- Grant permissions (if not already granted)
GRANT SELECT ON freelancer_services TO anon, authenticated;
