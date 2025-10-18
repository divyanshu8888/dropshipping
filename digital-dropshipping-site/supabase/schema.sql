-- Enhanced TalentHub Pro Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- FREELANCERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS freelancers (
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
CREATE TABLE IF NOT EXISTS portfolio_items (
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
CREATE TABLE IF NOT EXISTS reviews (
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
CREATE TABLE IF NOT EXISTS admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TESTIMONIALS TABLE (for homepage)
-- ============================================================================
CREATE TABLE IF NOT EXISTS testimonials (
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

-- ============================================================================
-- QUOTE REQUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS quote_requests (
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

CREATE OR REPLACE VIEW freelancers_public AS
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

CREATE OR REPLACE VIEW portfolio_public AS
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

CREATE INDEX IF NOT EXISTS idx_freelancers_status ON freelancers(status);
CREATE INDEX IF NOT EXISTS idx_freelancers_rating ON freelancers(rating DESC);
CREATE INDEX IF NOT EXISTS idx_freelancers_country ON freelancers(country);
CREATE INDEX IF NOT EXISTS idx_freelancers_skills ON freelancers USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_portfolio_freelancer_id ON portfolio_items(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_freelancer_id ON reviews(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_freelancer_services_freelancer_id ON freelancer_services(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_services_category ON freelancer_services(category);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_freelancers_updated_at ON freelancers;
CREATE TRIGGER update_freelancers_updated_at 
  BEFORE UPDATE ON freelancers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_portfolio_items_updated_at ON portfolio_items;
CREATE TRIGGER update_portfolio_items_updated_at 
  BEFORE UPDATE ON portfolio_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update freelancer rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_freelancer_rating()
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

DROP TRIGGER IF EXISTS update_rating_on_review_insert ON reviews;
CREATE TRIGGER update_rating_on_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_freelancer_rating();

DROP TRIGGER IF EXISTS update_rating_on_review_update ON reviews;
CREATE TRIGGER update_rating_on_review_update
  AFTER UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_freelancer_rating();

DROP TRIGGER IF EXISTS update_rating_on_review_delete ON reviews;
CREATE TRIGGER update_rating_on_review_delete
  AFTER DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_freelancer_rating();

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert sample freelancers
INSERT INTO freelancers (display_name, title, bio, description, country, skills, hourly_rate, base_fee, contact_email, rating, total_reviews, completed_projects, response_time, availability, status) VALUES
('Alex Johnson', 'Full Stack Developer', 'Senior developer with 8+ years of experience', 'Senior full-stack developer with 8+ years of experience in building scalable web applications using React, Node.js, and cloud technologies.', 'United States', ARRAY['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL'], 8500, 500000, 'alex.j@example.com', 4.9, 127, 156, '2 hours', 'Available', 'approved'),
('Maria Garcia', 'UI/UX Designer', 'Award-winning designer with a passion for user experience', 'Award-winning designer specializing in modern, user-centric interfaces that convert. Expert in Figma, Adobe Creative Suite, and design systems.', 'Spain', ARRAY['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'], 7500, 400000, 'maria.g@example.com', 5.0, 203, 289, '1 hour', 'Available', 'approved'),
('David Chen', 'Mobile App Developer', 'Mobile development expert with published apps', 'Mobile development expert with published apps on both App Store and Play Store. Specializing in React Native and Flutter for cross-platform solutions.', 'Singapore', ARRAY['React Native', 'Flutter', 'iOS', 'Android', 'Firebase'], 9000, 550000, 'david.c@example.com', 4.8, 95, 112, '3 hours', 'Available', 'approved'),
('Sarah Williams', 'Digital Marketing Expert', 'Results-driven marketer focused on ROI', 'Results-driven marketer who has helped 100+ businesses grow their online presence through data-driven strategies and creative campaigns.', 'United Kingdom', ARRAY['SEO', 'Google Ads', 'Content Marketing', 'Analytics', 'Social Media'], 7000, 380000, 'sarah.w@example.com', 4.9, 178, 234, '1 hour', 'Available', 'approved'),
('Mohammed Ahmed', 'Data Scientist', 'PhD in Computer Science specializing in AI/ML', 'PhD in Computer Science specializing in AI and machine learning solutions. Expert in building predictive models and data pipelines.', 'UAE', ARRAY['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Data Visualization'], 9500, 600000, 'mohammed.a@example.com', 4.7, 64, 78, '4 hours', 'Busy', 'approved'),
('Emma Brown', 'Content Writer', 'Professional writer creating engaging content', 'Professional writer with 10+ years creating engaging content that ranks and converts. Specializing in SEO writing, copywriting, and technical documentation.', 'Canada', ARRAY['SEO Writing', 'Copywriting', 'Blog Posts', 'Technical Writing', 'Content Strategy'], 6000, 300000, 'emma.b@example.com', 5.0, 312, 456, '2 hours', 'Available', 'approved');

-- Insert sample reviews
INSERT INTO reviews (freelancer_id, client_name, client_company, rating, review_text, project_title, is_featured, is_verified) VALUES
((SELECT id FROM freelancers WHERE display_name = 'Alex Johnson'), 'John Smith', 'TechCorp Inc', 5, 'Alex delivered an outstanding web application ahead of schedule. His expertise in React and Node.js is exceptional. Highly recommended!', 'E-commerce Platform', TRUE, TRUE),
((SELECT id FROM freelancers WHERE display_name = 'Alex Johnson'), 'Emily Davis', 'StartupXYZ', 5, 'Professional, communicative, and skilled. The project exceeded our expectations. Will definitely work with Alex again.', 'CRM System', TRUE, TRUE),
((SELECT id FROM freelancers WHERE display_name = 'Maria Garcia'), 'Robert Taylor', 'Design Studios', 5, 'Maria created a beautiful, intuitive design for our SaaS product. Her attention to detail and user experience is remarkable.', 'SaaS Dashboard', TRUE, TRUE),
((SELECT id FROM freelancers WHERE display_name = 'Maria Garcia'), 'Lisa Anderson', 'E-Shop Pro', 5, 'Best designer I''ve worked with! The UI she created increased our conversion rate by 40%. Amazing work!', 'E-commerce Redesign', TRUE, TRUE),
((SELECT id FROM freelancers WHERE display_name = 'David Chen'), 'Michael Brown', 'FitApp Co', 5, 'David built a fantastic mobile app for our fitness business. Clean code, great performance, and excellent communication throughout.', 'Fitness Tracking App', TRUE, TRUE),
((SELECT id FROM freelancers WHERE display_name = 'Sarah Williams'), 'Jennifer Lee', 'Marketing Plus', 5, 'Sarah''s SEO strategies increased our organic traffic by 300% in just 3 months. Outstanding results!', 'SEO Campaign', TRUE, TRUE);

-- Insert sample testimonials for homepage
INSERT INTO testimonials (client_name, client_role, client_company, testimonial_text, rating, is_featured, display_order) VALUES
('Sarah Johnson', 'CEO', 'TechStart', 'Best platform I''ve used! Found amazing developers at great prices. The Price Beat Guarantee is real!', 5, TRUE, 1),
('Michael Chen', 'Marketing Director', 'GrowthHub', 'Incredible service and quality. Saved 40% compared to other platforms. Highly recommended!', 5, TRUE, 2),
('Emily Rodriguez', 'Startup Founder', 'InnovateNow', 'Game changer for my business. Quick turnaround and professional freelancers. Worth every penny!', 5, TRUE, 3),
('David Kim', 'Product Manager', 'CloudTech', 'Found the perfect developer in just 2 days. TalentHub Pro made hiring so easy!', 5, TRUE, 4),
('Amanda White', 'CTO', 'DataDrive', 'Outstanding platform with verified freelancers. The quality of work is consistently excellent.', 5, TRUE, 5),
('Carlos Martinez', 'Creative Director', 'DesignWorks', 'Best investment for our design needs. The freelancers here are top-notch professionals.', 5, TRUE, 6);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON freelancers_public TO anon, authenticated;
GRANT SELECT ON portfolio_public TO anon, authenticated;
GRANT SELECT ON reviews TO anon, authenticated;
GRANT SELECT ON testimonials TO anon, authenticated;
