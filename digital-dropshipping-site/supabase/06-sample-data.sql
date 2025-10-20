-- ============================================================================
-- SAMPLE DATA
-- Optional sample data for testing and development
-- ============================================================================

-- ============================================================================
-- ADMIN USER
-- ============================================================================

-- Insert default admin user (password generated during setup)
INSERT INTO users (id, email, name, password, role, is_verified, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@platform.com', 'Platform Admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8.4.2O', 'admin', true, true);

-- ============================================================================
-- SAMPLE TESTIMONIALS
-- ============================================================================

INSERT INTO testimonials (client_name, client_company, testimonial, rating, is_featured, is_verified) VALUES
('John Smith', 'TechStart Inc', 'TalentHub Pro connected us with amazing freelancers. Our project was delivered on time and exceeded expectations!', 5, true, true),
('Sarah Johnson', 'GrowthLabs', 'The quality of freelancers here is outstanding. We''ve completed 5 projects and each one was exceptional.', 5, true, true),
('Mike Chen', 'AppVenture', 'Fast, reliable, and professional. The freelancers we found here helped us launch our MVP in record time.', 5, true, true),
('Emily Davis', 'DesignStudio', 'Every freelancer we''ve hired has been pre-vetted and highly skilled. No more wasting time with bad hires!', 5, true, true),
('David Wilson', 'CloudTech', 'The platform is intuitive and the freelancers are world-class. Highly recommend TalentHub Pro!', 5, true, true),
('Lisa Anderson', 'SaaS Solutions', 'Outstanding service! We found the perfect developer for our project and the results speak for themselves.', 5, true, true);

-- ============================================================================
-- SAMPLE PRODUCTS
-- ============================================================================

INSERT INTO products (name, description, category, subcategory, cost_price, retail_price, images, is_active) VALUES
('Professional Website Design', 'Custom responsive website design with modern UI/UX principles. Perfect for businesses looking to establish their online presence.', 'Web Design', 'Custom Design', 150.00, 299.99, ARRAY['https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=500&h=300&fit=crop'], true),
('SEO Optimization Package', 'Complete SEO audit and optimization for your website. Includes keyword research, on-page optimization, and technical SEO.', 'Digital Marketing', 'SEO', 100.00, 199.99, ARRAY['https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=500&h=300&fit=crop'], true),
('Mobile App Development', 'Native mobile app development for iOS and Android platforms. Includes design, development, and deployment.', 'Mobile Development', 'Native Apps', 650.00, 1299.99, ARRAY['https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=300&fit=crop'], true),
('Social Media Marketing Kit', 'Complete social media marketing package including content creation, posting schedule, and analytics reporting.', 'Digital Marketing', 'Social Media', 75.00, 149.99, ARRAY['https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop'], true),
('E-commerce Setup', 'Full e-commerce website setup with payment integration, inventory management, and order processing.', 'Web Development', 'E-commerce', 300.00, 599.99, ARRAY['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=300&fit=crop'], true),
('Content Writing Package', 'Professional content writing service including blog posts, website copy, and marketing materials.', 'Content Writing', 'Copywriting', 40.00, 79.99, ARRAY['https://images.unsplash.com/photo-1455390582262-044cdead277a?w=500&h=300&fit=crop'], true),
('Logo Design Package', 'Professional logo design with multiple concepts, revisions, and final files in various formats.', 'Graphic Design', 'Logo Design', 50.00, 99.99, ARRAY['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop'], true),
('Data Analysis Report', 'Comprehensive data analysis with insights, visualizations, and actionable recommendations for your business.', 'Data Analytics', 'Business Intelligence', 125.00, 249.99, ARRAY['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop'], true);
