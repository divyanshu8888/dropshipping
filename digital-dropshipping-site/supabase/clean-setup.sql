-- Clean Setup: Delete everything and recreate from scratch
-- Run this in your Supabase SQL editor

-- ============================================================================
-- DROP EVERYTHING FIRST
-- ============================================================================

-- Drop all triggers
DROP TRIGGER IF EXISTS update_freelancers_updated_at ON freelancers CASCADE;
DROP TRIGGER IF EXISTS update_portfolio_items_updated_at ON portfolio_items CASCADE;
DROP TRIGGER IF EXISTS update_rating_on_review_insert ON reviews CASCADE;
DROP TRIGGER IF EXISTS update_rating_on_review_update ON reviews CASCADE;
DROP TRIGGER IF EXISTS update_rating_on_review_delete ON reviews CASCADE;

-- Drop all policies (using dynamic SQL to find all policies)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_freelancer_rating() CASCADE;

-- Drop all views
DROP VIEW IF EXISTS freelancers_public CASCADE;
DROP VIEW IF EXISTS portfolio_public CASCADE;

-- Drop all tables (in reverse dependency order)
DROP TABLE IF EXISTS freelancer_services CASCADE;
DROP TABLE IF EXISTS quote_requests CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS portfolio_items CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS freelancers CASCADE;

-- ============================================================================
-- RECREATE EVERYTHING FROM SCRATCH
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- FREELANCERS TABLE
-- ============================================================================
CREATE TABLE freelancers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT NOT NULL,
  description TEXT NOT NULL,
  country TEXT NOT NULL,
  skills TEXT[] NOT NULL DEFAULT '{}',
  hourly_rate INTEGER NOT NULL, -- in cents
  base_fee INTEGER NOT NULL, -- Private field (in cents)
  contact_email TEXT NOT NULL, -- Private field
  contact_phone TEXT, -- Private field
  avatar_url TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  response_time TEXT DEFAULT '24 hours',
  availability TEXT DEFAULT 'Available' CHECK (availability IN ('Available', 'Busy', 'Offline')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PORTFOLIO ITEMS TABLE
-- ============================================================================
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID NOT NULL REFERENCES freelancers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  thumbnail_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  project_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- REVIEWS TABLE
-- ============================================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID NOT NULL REFERENCES freelancers(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_company TEXT,
  client_avatar_url TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  project_title TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ADMINS TABLE
-- ============================================================================
CREATE TABLE admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TESTIMONIALS TABLE (for homepage)
-- ============================================================================
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  client_role TEXT NOT NULL,
  client_company TEXT,
  testimonial_text TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  avatar_url TEXT,
  is_featured BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FREELANCER SERVICES TABLE
-- ============================================================================
CREATE TABLE freelancer_services (
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

-- ============================================================================
-- QUOTE REQUESTS TABLE
-- ============================================================================
CREATE TABLE quote_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID REFERENCES freelancers(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_company TEXT,
  project_type TEXT NOT NULL,
  budget_range TEXT NOT NULL,
  timeline TEXT NOT NULL,
  description TEXT NOT NULL,
  preferred_skills TEXT[],
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PUBLIC VIEWS (hide sensitive data)
-- ============================================================================
CREATE VIEW freelancers_public AS
SELECT 
  id,
  display_name,
  title,
  bio,
  description,
  country,
  skills,
  hourly_rate,
  avatar_url,
  rating,
  total_reviews,
  completed_projects,
  response_time,
  availability,
  status,
  created_at
FROM freelancers
WHERE status = 'approved';

CREATE VIEW portfolio_public AS
SELECT 
  p.id,
  p.freelancer_id,
  p.title,
  p.summary,
  p.thumbnail_url,
  p.gallery_urls,
  p.tags,
  p.project_url,
  p.created_at
FROM portfolio_items p
JOIN freelancers f ON p.freelancer_id = f.id
WHERE p.is_public = TRUE 
  AND f.status = 'approved';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE freelancers ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_services ENABLE ROW LEVEL SECURITY;

-- Public can read approved freelancers
CREATE POLICY "public_read_freelancers" ON freelancers
  FOR SELECT TO anon, authenticated
  USING (status = 'approved');

-- Public can read portfolio items
CREATE POLICY "public_read_portfolio" ON portfolio_items
  FOR SELECT TO anon, authenticated
  USING (is_public = TRUE);

-- Public can read reviews
CREATE POLICY "public_read_reviews" ON reviews
  FOR SELECT TO anon, authenticated
  USING (TRUE);

-- Public can read testimonials
CREATE POLICY "public_read_testimonials" ON testimonials
  FOR SELECT TO anon, authenticated
  USING (is_featured = TRUE);

-- Public can read freelancer services for approved freelancers
CREATE POLICY "public_read_freelancer_services" ON freelancer_services
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE AND EXISTS (
    SELECT 1 FROM freelancers 
    WHERE freelancers.id = freelancer_services.freelancer_id 
    AND freelancers.status = 'approved'
  ));

-- Admins can do everything
CREATE POLICY "admins_all_freelancers" ON freelancers
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

CREATE POLICY "admins_all_portfolio" ON portfolio_items
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

CREATE POLICY "admins_all_reviews" ON reviews
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

CREATE POLICY "admins_all_testimonials" ON testimonials
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

CREATE POLICY "admins_all_freelancer_services" ON freelancer_services
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Public can insert quote requests
CREATE POLICY "public_insert_quotes" ON quote_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (TRUE);

-- Admins can read all quote requests
CREATE POLICY "admins_read_quotes" ON quote_requests
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_freelancers_status ON freelancers(status);
CREATE INDEX idx_freelancers_rating ON freelancers(rating DESC);
CREATE INDEX idx_freelancers_country ON freelancers(country);
CREATE INDEX idx_freelancers_skills ON freelancers USING GIN(skills);
CREATE INDEX idx_portfolio_freelancer_id ON portfolio_items(freelancer_id);
CREATE INDEX idx_reviews_freelancer_id ON reviews(freelancer_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_testimonials_featured ON testimonials(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_freelancer_services_freelancer_id ON freelancer_services(freelancer_id);
CREATE INDEX idx_freelancer_services_category ON freelancer_services(category);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Update freelancer rating when review is added/updated/deleted
CREATE FUNCTION update_freelancer_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE freelancers
  SET 
    rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE freelancer_id = COALESCE(NEW.freelancer_id, OLD.freelancer_id)),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE freelancer_id = COALESCE(NEW.freelancer_id, OLD.freelancer_id))
  WHERE id = COALESCE(NEW.freelancer_id, OLD.freelancer_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_freelancers_updated_at 
  BEFORE UPDATE ON freelancers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_items_updated_at 
  BEFORE UPDATE ON portfolio_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rating_on_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_freelancer_rating();

CREATE TRIGGER update_rating_on_review_update
  AFTER UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_freelancer_rating();

CREATE TRIGGER update_rating_on_review_delete
  AFTER DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_freelancer_rating();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON freelancers_public TO anon, authenticated;
GRANT SELECT ON portfolio_public TO anon, authenticated;
GRANT SELECT ON reviews TO anon, authenticated;
GRANT SELECT ON testimonials TO anon, authenticated;
GRANT SELECT ON freelancer_services TO anon, authenticated;
