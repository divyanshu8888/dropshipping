-- ============================================================================
-- TALENTHUB PRO - COMPLETE DATABASE SETUP
-- ============================================================================
-- This is the ONLY SQL file you need to run
-- Run this in your Supabase SQL editor to set up the complete database

-- ============================================================================
-- CLEANUP: Drop everything first to start fresh
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
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- FREELANCERS TABLE
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

-- PORTFOLIO ITEMS TABLE
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

-- REVIEWS TABLE
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

-- TESTIMONIALS TABLE (for homepage)
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

-- FREELANCER SERVICES TABLE
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

-- QUOTE REQUESTS TABLE
CREATE TABLE quote_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID NOT NULL REFERENCES freelancers(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  company_name TEXT,
  project_title TEXT NOT NULL,
  project_description TEXT NOT NULL,
  budget_range TEXT,
  timeline TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'accepted', 'rejected')),
  freelancer_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADMINS TABLE
CREATE TABLE admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS TABLE (for the store)
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS TABLE
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER ITEMS TABLE
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update freelancer rating when reviews change
CREATE OR REPLACE FUNCTION update_freelancer_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE freelancers 
        SET 
            rating = COALESCE((
                SELECT ROUND(AVG(rating)::DECIMAL, 2) 
                FROM reviews 
                WHERE freelancer_id = OLD.freelancer_id
            ), 0.00),
            total_reviews = (
                SELECT COUNT(*) 
                FROM reviews 
                WHERE freelancer_id = OLD.freelancer_id
            )
        WHERE id = OLD.freelancer_id;
        RETURN OLD;
    ELSE
        UPDATE freelancers 
        SET 
            rating = COALESCE((
                SELECT ROUND(AVG(rating)::DECIMAL, 2) 
                FROM reviews 
                WHERE freelancer_id = NEW.freelancer_id
            ), 0.00),
            total_reviews = (
                SELECT COUNT(*) 
                FROM reviews 
                WHERE freelancer_id = NEW.freelancer_id
            )
        WHERE id = NEW.freelancer_id;
        RETURN NEW;
    END IF;
END;
$$ language 'plpgsql';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at for freelancers
CREATE TRIGGER update_freelancers_updated_at
  BEFORE UPDATE ON freelancers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at for portfolio_items
CREATE TRIGGER update_portfolio_items_updated_at
  BEFORE UPDATE ON portfolio_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update freelancer rating on review insert
CREATE TRIGGER update_rating_on_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_freelancer_rating();

-- Update freelancer rating on review update
CREATE TRIGGER update_rating_on_review_update
  AFTER UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_freelancer_rating();

-- Update freelancer rating on review delete
CREATE TRIGGER update_rating_on_review_delete
  AFTER DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_freelancer_rating();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Public view for freelancers (without private data)
CREATE VIEW freelancers_public AS
SELECT 
  id,
  display_name,
  title,
  bio,
  description,
  country,
  skills,
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

-- Public view for portfolio items
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
WHERE p.is_public = TRUE AND f.status = 'approved';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE freelancers ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Freelancers policies
CREATE POLICY "Freelancers are viewable by everyone" ON freelancers
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Freelancers can update their own profile" ON freelancers
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Portfolio items policies
CREATE POLICY "Portfolio items are viewable by everyone" ON portfolio_items
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Freelancers can manage their own portfolio" ON portfolio_items
  FOR ALL USING (auth.uid()::text = freelancer_id::text);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create reviews" ON reviews
  FOR INSERT WITH CHECK (true);

-- Testimonials policies
CREATE POLICY "Testimonials are viewable by everyone" ON testimonials
  FOR SELECT USING (is_featured = TRUE);

CREATE POLICY "Admins can manage testimonials" ON testimonials
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM admins));

-- Freelancer services policies
CREATE POLICY "Services are viewable by everyone" ON freelancer_services
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Freelancers can manage their own services" ON freelancer_services
  FOR ALL USING (auth.uid()::text = freelancer_id::text);

-- Quote requests policies
CREATE POLICY "Freelancers can view their quote requests" ON quote_requests
  FOR SELECT USING (auth.uid()::text = freelancer_id::text);

CREATE POLICY "Anyone can create quote requests" ON quote_requests
  FOR INSERT WITH CHECK (true);

-- Admins policies
CREATE POLICY "Admins can view admin table" ON admins
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Freelancers indexes
CREATE INDEX idx_freelancers_status ON freelancers(status);
CREATE INDEX idx_freelancers_rating ON freelancers(rating DESC);
CREATE INDEX idx_freelancers_availability ON freelancers(availability);
CREATE INDEX idx_freelancers_skills ON freelancers USING GIN(skills);

-- Reviews indexes
CREATE INDEX idx_reviews_freelancer_id ON reviews(freelancer_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_featured ON reviews(is_featured);

-- Portfolio items indexes
CREATE INDEX idx_portfolio_freelancer_id ON portfolio_items(freelancer_id);
CREATE INDEX idx_portfolio_public ON portfolio_items(is_public);
CREATE INDEX idx_portfolio_tags ON portfolio_items USING GIN(tags);

-- Quote requests indexes
CREATE INDEX idx_quote_requests_freelancer_id ON quote_requests(freelancer_id);
CREATE INDEX idx_quote_requests_status ON quote_requests(status);

-- Testimonials indexes
CREATE INDEX idx_testimonials_featured ON testimonials(is_featured);
CREATE INDEX idx_testimonials_display_order ON testimonials(display_order);

-- Products indexes
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_category ON products(category);

-- ============================================================================
-- SAMPLE DATA (OPTIONAL - UNCOMMENT IF YOU WANT DEMO DATA)
-- ============================================================================

-- Uncomment the section below if you want to add sample data for testing
/*
-- Insert sample testimonials
INSERT INTO testimonials (client_name, client_role, client_company, testimonial_text, rating, is_featured, display_order) VALUES
('John Smith', 'CEO', 'TechStart Inc', 'TalentHub Pro connected us with amazing freelancers. Our project was delivered on time and exceeded expectations!', 5, TRUE, 1),
('Sarah Johnson', 'Marketing Director', 'GrowthLabs', 'The quality of freelancers here is outstanding. We''ve completed 5 projects and each one was exceptional.', 5, TRUE, 2),
('Mike Chen', 'Founder', 'AppVenture', 'Fast, reliable, and professional. The freelancers we found here helped us launch our MVP in record time.', 5, TRUE, 3),
('Emily Davis', 'Creative Lead', 'DesignStudio', 'Every freelancer we''ve hired has been pre-vetted and highly skilled. No more wasting time with bad hires!', 5, TRUE, 4),
('David Wilson', 'CTO', 'CloudTech', 'The platform is intuitive and the freelancers are world-class. Highly recommend TalentHub Pro!', 5, TRUE, 5),
('Lisa Anderson', 'Product Manager', 'SaaS Solutions', 'Outstanding service! We found the perfect developer for our project and the results speak for themselves.', 5, TRUE, 6);

-- Insert sample products
INSERT INTO products (name, description, price, category, image_url, stock) VALUES
('Professional Website Design', 'Custom responsive website design with modern UI/UX principles. Perfect for businesses looking to establish their online presence.', 299.99, 'Web Design', 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=500&h=300&fit=crop', 50),
('SEO Optimization Package', 'Complete SEO audit and optimization for your website. Includes keyword research, on-page optimization, and technical SEO.', 199.99, 'Digital Marketing', 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=500&h=300&fit=crop', 25),
('Mobile App Development', 'Native mobile app development for iOS and Android platforms. Includes design, development, and deployment.', 1299.99, 'Mobile Development', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=300&fit=crop', 10),
('Social Media Marketing Kit', 'Complete social media marketing package including content creation, posting schedule, and analytics reporting.', 149.99, 'Digital Marketing', 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop', 100),
('E-commerce Setup', 'Full e-commerce website setup with payment integration, inventory management, and order processing.', 599.99, 'Web Development', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=300&fit=crop', 15),
('Content Writing Package', 'Professional content writing service including blog posts, website copy, and marketing materials.', 79.99, 'Content Writing', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=500&h=300&fit=crop', 200),
('Logo Design Package', 'Professional logo design with multiple concepts, revisions, and final files in various formats.', 99.99, 'Graphic Design', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop', 75),
('Data Analysis Report', 'Comprehensive data analysis with insights, visualizations, and actionable recommendations for your business.', 249.99, 'Data Analytics', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop', 30);
*/

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

-- This will show a success message when the script completes
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TALENTHUB PRO DATABASE SETUP COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database structure created successfully.';
    RAISE NOTICE 'All tables, functions, triggers, and policies are ready.';
    RAISE NOTICE 'You can now start using the application!';
    RAISE NOTICE '========================================';
END $$;
