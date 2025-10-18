-- Additional Sample Data for TalentHub Pro
-- Run this after the main schema

-- Insert more freelancers
INSERT INTO freelancers (display_name, title, bio, description, country, skills, hourly_rate, base_fee, contact_email, rating, total_reviews, completed_projects, response_time, availability, status) VALUES
('Jessica Park', 'Brand Strategist', 'Creative brand expert with 12+ years', 'Award-winning brand strategist who has helped 200+ companies build memorable brands. Expert in brand identity, positioning, and storytelling.', 'South Korea', ARRAY['Brand Strategy', 'Logo Design', 'Brand Guidelines', 'Market Research', 'Creative Direction'], 8000, 450000, 'jessica.p@example.com', 4.9, 145, 198, '1 hour', 'Available', 'approved'),
('Carlos Rodriguez', 'DevOps Engineer', 'Cloud infrastructure specialist', 'Senior DevOps engineer specializing in AWS, Kubernetes, and CI/CD pipelines. Built scalable infrastructure for Fortune 500 companies.', 'Mexico', ARRAY['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Jenkins', 'CI/CD'], 9500, 580000, 'carlos.r@example.com', 4.8, 89, 134, '2 hours', 'Available', 'approved'),
('Aisha Hassan', 'Video Editor', 'Professional video editing and motion graphics', 'Creative video editor with expertise in Adobe Premiere, After Effects, and DaVinci Resolve. Created content for major brands and influencers.', 'Nigeria', ARRAY['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Motion Graphics', 'Color Grading'], 6500, 350000, 'aisha.h@example.com', 5.0, 276, 389, '3 hours', 'Available', 'approved'),
('Oliver Schmidt', 'Blockchain Developer', 'Smart contract and DApp expert', 'Experienced blockchain developer specializing in Ethereum, Solidity, and Web3. Built secure smart contracts and decentralized applications.', 'Germany', ARRAY['Solidity', 'Web3.js', 'Ethereum', 'Smart Contracts', 'DeFi'], 11000, 700000, 'oliver.s@example.com', 4.7, 67, 89, '4 hours', 'Busy', 'approved'),
('Priya Sharma', 'Product Designer', 'User-centered product design', 'Senior product designer with experience at Google and Airbnb. Specialist in creating intuitive, beautiful products that users love.', 'India', ARRAY['Product Design', 'UX Research', 'Figma', 'Prototyping', 'Design Systems'], 7800, 420000, 'priya.s@example.com', 4.9, 198, 267, '1 hour', 'Available', 'approved'),
('Lucas Silva', 'E-commerce Expert', 'Shopify and WooCommerce specialist', 'E-commerce consultant who has generated $50M+ in online sales. Expert in conversion optimization and growth strategies.', 'Brazil', ARRAY['Shopify', 'WooCommerce', 'E-commerce Strategy', 'Conversion Optimization', 'Google Analytics'], 8500, 480000, 'lucas.s@example.com', 5.0, 234, 312, '2 hours', 'Available', 'approved');

-- Insert more reviews
INSERT INTO reviews (freelancer_id, client_name, client_company, rating, review_text, project_title, is_featured, is_verified) VALUES
((SELECT id FROM freelancers WHERE display_name = 'Jessica Park'), 'Tom Wilson', 'BrandCo', 5, 'Jessica completely transformed our brand identity. Her strategic thinking and creative execution are unmatched. Best money we ever spent!', 'Complete Brand Overhaul', TRUE, TRUE),
((SELECT id FROM freelancers WHERE display_name = 'Jessica Park'), 'Rachel Green', 'StyleHub', 5, 'Working with Jessica was a dream! She understood our vision perfectly and delivered beyond expectations. Our sales increased 60% after the rebrand.', 'Brand Strategy & Design', TRUE, TRUE),
((SELECT id FROM freelancers WHERE display_name = 'Carlos Rodriguez'), 'Steve Johnson', 'CloudTech Inc', 5, 'Carlos set up our entire AWS infrastructure flawlessly. Zero downtime since deployment. Highly skilled and professional!', 'AWS Infrastructure Setup', TRUE, TRUE),
((SELECT id FROM freelancers WHERE display_name = 'Aisha Hassan'), 'Mark Thompson', 'ContentKing', 5, 'Aisha created stunning video content for our campaign. The engagement rate increased by 250%! Truly talented editor.', 'Video Ad Campaign', TRUE, TRUE),
((SELECT id FROM freelancers WHERE display_name = 'Aisha Hassan'), 'Nina Patel', 'Influencer Agency', 5, 'Best video editor we''ve worked with! Fast turnaround, creative, and always exceeds expectations. Our clients love her work!', 'Social Media Videos', TRUE, TRUE),
((SELECT id FROM freelancers WHERE display_name = 'Priya Sharma'), 'Alex Turner', 'StartupXYZ', 5, 'Priya''s product design skills are world-class. She redesigned our entire app and user satisfaction went from 3.2 to 4.8 stars!', 'Mobile App Redesign', TRUE, TRUE),
((SELECT id FROM freelancers WHERE display_name = 'Priya Sharma'), 'Diana Lee', 'TechFlow', 5, 'Incredible designer with deep UX knowledge. Our conversion rate doubled after implementing her designs. Worth every penny!', 'SaaS Dashboard Design', TRUE, TRUE),
((SELECT id FROM freelancers WHERE display_name = 'Lucas Silva'), 'Brian Chen', 'E-Shop Pro', 5, 'Lucas increased our Shopify store revenue by 400% in 3 months! His e-commerce strategies are game-changing. Highly recommend!', 'E-commerce Optimization', TRUE, TRUE),
((SELECT id FROM freelancers WHERE display_name = 'Oliver Schmidt'), 'Peter Adams', 'CryptoVentures', 5, 'Oliver built our smart contracts with top-notch security. Passed all audits with flying colors. True blockchain expert!', 'DeFi Smart Contracts', TRUE, TRUE),
((SELECT id FROM freelancers WHERE display_name = 'David Chen'), 'Laura Martinez', 'HealthApp Co', 5, 'David delivered an amazing cross-platform app in record time. Clean code, great performance, and excellent communication!', 'Healthcare Mobile App', TRUE, TRUE);

-- Insert more testimonials
INSERT INTO testimonials (client_name, client_role, client_company, testimonial_text, rating, is_featured, display_order) VALUES
('James Wilson', 'VP of Engineering', 'TechGiant', 'Hired 3 developers from TalentHub Pro. All were exceptional! Saved us months of recruitment time and thousands in fees.', 5, TRUE, 7),
('Sophie Anderson', 'Marketing Lead', 'GrowthLabs', 'The Price Beat Guarantee is legit! Found a designer $10 cheaper elsewhere, TalentHub Pro gave me 10% off. Plus, the quality was way better!', 5, TRUE, 8),
('Ryan Thompson', 'Founder', 'AppStart', 'Built my entire MVP with freelancers from here. Launched in 6 weeks and raised $2M seed round. This platform is a game changer!', 5, TRUE, 9),
('Maria Santos', 'Creative Director', 'BrandWorks', 'Every freelancer I''ve hired here has been pre-vetted and highly skilled. No more wasting time with bad hires. Love it!', 5, TRUE, 10),
('Kevin Zhang', 'Product Manager', 'SaaS Solutions', 'The quality of freelancers here is consistently excellent. We''ve completed 15+ projects, all delivered on time and on budget.', 5, TRUE, 11),
('Isabella Rossi', 'CEO', 'DesignHub', 'TalentHub Pro has become our go-to for finding top talent. The platform is easy to use and the freelancers are world-class.', 5, TRUE, 12);

-- Insert portfolio items for new freelancers
INSERT INTO portfolio_items (freelancer_id, title, summary, tags, is_public) VALUES
((SELECT id FROM freelancers WHERE display_name = 'Jessica Park'), 'Global Tech Brand Identity', 'Complete brand identity for a Fortune 500 tech company including logo, guidelines, and marketing materials.', ARRAY['Branding', 'Logo Design', 'Corporate Identity'], TRUE),
((SELECT id FROM freelancers WHERE display_name = 'Jessica Park'), 'Sustainable Fashion Brand', 'Award-winning brand strategy and visual identity for eco-friendly fashion startup. Resulted in 300% growth.', ARRAY['Brand Strategy', 'Fashion', 'Sustainability'], TRUE),
((SELECT id FROM freelancers WHERE display_name = 'Carlos Rodriguez'), 'Multi-Region AWS Deployment', 'Designed and deployed highly available AWS infrastructure across 5 regions for 10M+ users.', ARRAY['AWS', 'DevOps', 'Cloud Architecture'], TRUE),
((SELECT id FROM freelancers WHERE display_name = 'Aisha Hassan'), 'Viral Marketing Campaign', 'Created video content that generated 50M+ views and increased brand awareness by 400%.', ARRAY['Video Editing', 'Marketing', 'Social Media'], TRUE),
((SELECT id FROM freelancers WHERE display_name = 'Priya Sharma'), 'FinTech Mobile App', 'Designed intuitive mobile app for financial services with 4.9-star rating and 500K+ downloads.', ARRAY['Product Design', 'Mobile UX', 'FinTech'], TRUE),
((SELECT id FROM freelancers WHERE display_name = 'Lucas Silva'), '$5M Revenue E-commerce Store', 'Optimized Shopify store that grew from $100K to $5M annual revenue in 18 months.', ARRAY['E-commerce', 'Shopify', 'Growth'], TRUE);

-- Update freelancer stats
UPDATE freelancers SET 
  rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE freelancer_id = freelancers.id),
  total_reviews = (SELECT COUNT(*) FROM reviews WHERE freelancer_id = freelancers.id)
WHERE id IN (SELECT DISTINCT freelancer_id FROM reviews);
