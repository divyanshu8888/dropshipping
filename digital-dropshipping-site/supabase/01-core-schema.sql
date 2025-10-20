-- ============================================================================
-- CORE DATABASE SCHEMA
-- Digital Dropshipping + Freelancer Marketplace Platform
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================
CREATE TYPE user_role AS ENUM ('admin', 'freelancer', 'client', 'supplier');
CREATE TYPE conversation_status AS ENUM ('active', 'paused', 'closed', 'escalated');
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read', 'redacted', 'blocked');
CREATE TYPE moderation_action AS ENUM ('warn', 'redact', 'block', 'mute');
CREATE TYPE moderation_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE project_status AS ENUM ('draft', 'quoted', 'sow_pending', 'active', 'completed', 'disputed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed');
CREATE TYPE escrow_status AS ENUM ('created', 'funded', 'released', 'disputed', 'refunded');
CREATE TYPE kyc_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
CREATE TYPE supplier_status AS ENUM ('pending', 'approved', 'suspended', 'terminated');

-- ============================================================================
-- CORE USER TABLES
-- ============================================================================

-- Users table with enhanced authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'client',
    phone VARCHAR(20),
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    two_fa_enabled BOOLEAN DEFAULT FALSE,
    two_fa_secret VARCHAR(255),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KYC verification for freelancers and suppliers
CREATE TABLE kyc_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status kyc_status DEFAULT 'pending',
    document_type VARCHAR(50) NOT NULL,
    document_url TEXT,
    verification_data JSONB,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- FREELANCER TABLES
-- ============================================================================

-- Freelancer profiles
CREATE TABLE freelancers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    bio TEXT,
    skills TEXT[],
    services JSONB,
    portfolio JSONB,
    certifications JSONB,
    experience_years INTEGER,
    hourly_rate_min DECIMAL(10,2),
    hourly_rate_max DECIMAL(10,2),
    availability VARCHAR(50) DEFAULT 'available',
    timezone VARCHAR(50),
    languages TEXT[],
    response_time_hours INTEGER DEFAULT 24,
    completion_rate DECIMAL(5,2) DEFAULT 100.00,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SUPPLIER & PRODUCT TABLES
-- ============================================================================

-- Supplier profiles
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100),
    status supplier_status DEFAULT 'pending',
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    website TEXT,
    address JSONB,
    tax_id VARCHAR(50),
    payment_terms INTEGER DEFAULT 30,
    minimum_order_value DECIMAL(10,2),
    lead_time_days INTEGER DEFAULT 7,
    shipping_regions TEXT[],
    certifications TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product catalog
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    sku VARCHAR(100) UNIQUE,
    supplier_id UUID REFERENCES suppliers(id),
    supplier_sku VARCHAR(100),
    cost_price DECIMAL(10,2),
    retail_price DECIMAL(10,2),
    markup_percentage DECIMAL(5,2),
    weight DECIMAL(8,3),
    dimensions JSONB,
    images TEXT[],
    specifications JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    stock_quantity INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 10,
    lead_time_days INTEGER DEFAULT 7,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PROJECT & QUOTE TABLES
-- ============================================================================

-- Quote requests
CREATE TABLE quote_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES users(id),
    project_title VARCHAR(255) NOT NULL,
    project_description TEXT NOT NULL,
    category VARCHAR(100),
    budget_range VARCHAR(50),
    timeline VARCHAR(50),
    requirements JSONB,
    files JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    assigned_freelancer_id UUID REFERENCES freelancers(id),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_request_id UUID REFERENCES quote_requests(id),
    client_id UUID REFERENCES users(id),
    freelancer_id UUID REFERENCES freelancers(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status project_status DEFAULT 'draft',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(10,2),
    milestones JSONB,
    sow_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- REVIEWS & TESTIMONIALS
-- ============================================================================

-- Reviews for freelancers
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id),
    reviewer_id UUID REFERENCES users(id),
    reviewee_id UUID REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name VARCHAR(255) NOT NULL,
    client_company VARCHAR(255),
    client_avatar_url TEXT,
    testimonial TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    project_type VARCHAR(100),
    is_featured BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Freelancer indexes
CREATE INDEX idx_freelancers_user_id ON freelancers(user_id);
CREATE INDEX idx_freelancers_verified ON freelancers(is_verified);
CREATE INDEX idx_freelancers_featured ON freelancers(is_featured);

-- Product indexes
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_supplier ON products(supplier_id);

-- Project indexes
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_freelancer ON projects(freelancer_id);
CREATE INDEX idx_projects_status ON projects(status);

-- Quote request indexes
CREATE INDEX idx_quote_requests_client ON quote_requests(client_id);
CREATE INDEX idx_quote_requests_status ON quote_requests(status);

-- Review indexes
CREATE INDEX idx_reviews_project ON reviews(project_id);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);

-- Testimonial indexes
CREATE INDEX idx_testimonials_featured ON testimonials(is_featured);
