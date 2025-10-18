-- Drop existing policies, triggers, and constraints
-- Run this FIRST before running the migration

-- Drop ALL existing policies on all tables using dynamic SQL
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on freelancers table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'freelancers') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON freelancers';
    END LOOP;
    
    -- Drop all policies on portfolio_items table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'portfolio_items') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON portfolio_items';
    END LOOP;
    
    -- Drop all policies on reviews table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'reviews') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON reviews';
    END LOOP;
    
    -- Drop all policies on testimonials table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'testimonials') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON testimonials';
    END LOOP;
    
    -- Drop all policies on quote_requests table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'quote_requests') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON quote_requests';
    END LOOP;
    
    -- Drop all policies on freelancer_services table (if it exists)
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'freelancer_services') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON freelancer_services';
    END LOOP;
END $$;

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_freelancers_updated_at ON freelancers CASCADE;
DROP TRIGGER IF EXISTS update_portfolio_items_updated_at ON portfolio_items CASCADE;
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews CASCADE;
DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials CASCADE;
DROP TRIGGER IF EXISTS update_quote_requests_updated_at ON quote_requests CASCADE;
DROP TRIGGER IF EXISTS update_freelancer_services_updated_at ON freelancer_services CASCADE;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop the freelancer_services table if it exists (to start fresh)
DROP TABLE IF EXISTS freelancer_services CASCADE;