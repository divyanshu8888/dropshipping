-- Drop existing products table if it exists (to avoid column conflicts)
DROP TABLE IF EXISTS products;

-- Create products table for freelancer services
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  category VARCHAR(100) NOT NULL,
  image_url VARCHAR(500),
  stock INTEGER DEFAULT 999,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Insert sample products
INSERT INTO products (name, description, price, category, image_url, stock, is_active) VALUES
('Website Development', 'Professional website development services including responsive design, modern frameworks, and SEO optimization. Perfect for businesses looking to establish their online presence.', 150000, 'Web Development', '/images/products/website-development.jpg', 999, true),
('Mobile App Development', 'Native and cross-platform mobile app development for iOS and Android. Includes UI/UX design, backend integration, and app store deployment.', 250000, 'Mobile Development', '/images/products/mobile-app-development.jpg', 999, true),
('Logo Design', 'Custom logo design services with multiple concepts, revisions, and brand guidelines. Perfect for startups and businesses looking to establish their brand identity.', 50000, 'Graphic Design', '/images/products/logo-design.jpg', 999, true),
('Content Writing', 'Professional content writing services including blog posts, articles, website copy, and marketing materials. SEO-optimized and engaging content.', 25000, 'Content Writing', '/images/products/content-writing.jpg', 999, true),
('Digital Marketing', 'Comprehensive digital marketing services including social media management, PPC campaigns, email marketing, and analytics reporting.', 100000, 'Digital Marketing', '/images/products/digital-marketing.jpg', 999, true),
('E-commerce Development', 'Complete e-commerce solutions including online store setup, payment integration, warehousing, and order management systems.', 300000, 'E-commerce', '/images/products/ecommerce-development.jpg', 999, true),
('UI/UX Design', 'User interface and user experience design services including wireframing, prototyping, and design systems for web and mobile applications.', 120000, 'UI/UX Design', '/images/products/ui-ux-design.jpg', 999, true),
('Data Analysis', 'Data analysis and visualization services including business intelligence, reporting dashboards, and data-driven insights for decision making.', 80000, 'Data Analysis', '/images/products/data-analysis.jpg', 999, true),
('Video Editing', 'Professional video editing services including corporate videos, promotional content, social media videos, and post-production work.', 75000, 'Video Production', '/images/products/video-editing.jpg', 999, true),
('SEO Optimization', 'Search engine optimization services including keyword research, on-page optimization, link building, and performance tracking.', 60000, 'SEO', '/images/products/seo-optimization.jpg', 999, true),
('Translation Services', 'Professional translation services for documents, websites, and marketing materials in multiple languages with native speaker quality.', 35000, 'Translation', '/images/products/translation-services.jpg', 999, true),
('Technical Consulting', 'Expert technical consulting services for software architecture, system optimization, technology stack recommendations, and implementation guidance.', 200000, 'Consulting', '/images/products/technical-consulting.jpg', 999, true),
('Social Media Management', 'Complete social media management services including content creation, posting schedules, engagement strategies, and performance analytics across all platforms.', 90000, 'Social Media', '/images/products/social-media-management.jpg', 999, true),
('Brand Identity Design', 'Comprehensive brand identity packages including brand guidelines, color palettes, typography, and brand strategy consultation (different from logo design).', 80000, 'Branding', '/images/products/logo-design.jpg', 999, true),
('WordPress Development', 'Custom WordPress website development including theme customization, plugin development, performance optimization, and security implementation.', 120000, 'Web Development', '/images/products/wordpress-development.jpg', 999, true),
('Database Design', 'Professional database design and optimization services including schema design, performance tuning, data migration, and backup strategies.', 150000, 'Database', '/images/products/database-design.jpg', 999, true),
('Photography Services', 'Professional photography services including product photography, corporate headshots, event photography, and photo editing services.', 60000, 'Photography', '/images/products/photography-services.jpg', 999, true),
('Email Marketing', 'Complete email marketing solutions including campaign design, automation setup, list management, A/B testing, and performance analytics.', 70000, 'Email Marketing', '/images/products/email-marketing.jpg', 999, true),
('DevOps Services', 'DevOps and cloud infrastructure services including CI/CD setup, containerization, cloud migration, monitoring, and automation solutions.', 250000, 'DevOps', '/images/products/devops-services.jpg', 999, true),
('Voice Over Services', 'Professional voice over services for commercials, audiobooks, artistic content, and promotional videos with multiple voice options.', 40000, 'Voice Over', '/images/products/voice-over-services.jpg', 999, true),
('Blockchain Development', 'Blockchain and cryptocurrency development services including smart contracts, DApps, DeFi protocols, and NFT marketplaces.', 350000, 'Blockchain', '/images/products/technical-consulting.jpg', 999, true),
('AI/ML Development', 'Artificial Intelligence and Machine Learning solutions including chatbots, recommendation systems, predictive analytics, and custom AI models.', 300000, 'AI/ML', '/images/products/data-analysis.jpg', 999, true),
('Game Development', 'Mobile and web game development services including Unity development, game design, character creation, and monetization strategies.', 200000, 'Game Development', '/images/products/mobile-app-development.jpg', 999, true),
('Cybersecurity Services', 'Comprehensive cybersecurity services including penetration testing, security audits, vulnerability assessments, and security consulting.', 180000, 'Cybersecurity', '/images/products/technical-consulting.jpg', 999, true),
('Cloud Architecture', 'Cloud infrastructure design and implementation including AWS, Azure, Google Cloud setup, migration, and optimization services.', 220000, 'Cloud Computing', '/images/products/devops-services.jpg', 999, true),
('API Development', 'RESTful and GraphQL API development services including documentation, testing, integration, and performance optimization.', 120000, 'API Development', '/images/products/website-development.jpg', 999, true),
('Quality Assurance', 'Comprehensive QA and testing services including automated testing, manual testing, performance testing, and bug reporting.', 80000, 'QA Testing', '/images/products/data-analysis.jpg', 999, true),
('Project Management', 'Professional project management services including Agile methodologies, team coordination, timeline management, and delivery optimization.', 100000, 'Project Management', '/images/products/digital-marketing.jpg', 999, true),
('Business Analysis', 'Business analysis and requirements gathering services including process optimization, workflow design, and strategic planning.', 90000, 'Business Analysis', '/images/products/content-writing.jpg', 999, true);

-- Add a trigger to update the updated_at column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for products table
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
