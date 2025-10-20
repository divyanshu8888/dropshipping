-- Fix image paths for products that have 404 errors
-- Update products to use existing image files with better relevance

-- Business Analysis -> use content-writing.jpg (writing/analysis related)
UPDATE products 
SET image_url = '/images/products/content-writing.jpg' 
WHERE name = 'Business Analysis';

-- Blockchain Development -> use OIP.jpg (specific blockchain image)
UPDATE products 
SET image_url = '/images/products/OIP.jpg' 
WHERE name = 'Blockchain Development';

-- AI/ML Development -> use data-analysis.jpg (data/analytics related)
UPDATE products 
SET image_url = '/images/products/data-analysis.jpg' 
WHERE name = 'AI/ML Development';

-- Game Development -> use mobile-app-development.jpg (mobile/gaming related)
UPDATE products 
SET image_url = '/images/products/mobile-app-development.jpg' 
WHERE name = 'Game Development';

-- Cybersecurity Services -> use devops-services.jpg (infrastructure/security related)
UPDATE products 
SET image_url = '/images/products/devops-services.jpg' 
WHERE name = 'Cybersecurity Services';

-- Cloud Architecture -> use devops-services.jpg (infrastructure related)
UPDATE products 
SET image_url = '/images/products/devops-services.jpg' 
WHERE name = 'Cloud Architecture';

-- API Development -> use website-development.jpg (web development related)
UPDATE products 
SET image_url = '/images/products/website-development.jpg' 
WHERE name = 'API Development';

-- Quality Assurance -> use technical-consulting.jpg (testing/consulting related)
UPDATE products 
SET image_url = '/images/products/technical-consulting.jpg' 
WHERE name = 'Quality Assurance';

-- Project Management -> use social-media-management.jpg (management/coordination related)
UPDATE products 
SET image_url = '/images/products/social-media-management.jpg' 
WHERE name = 'Project Management';

-- Brand Identity Design -> use logo-design.jpg (design related)
UPDATE products 
SET image_url = '/images/products/logo-design.jpg' 
WHERE name = 'Brand Identity Design';

-- Voice Over Services -> use voice-over-services.jpg (specific voice image)
UPDATE products 
SET image_url = '/images/products/voice-over-services.jpg' 
WHERE name = 'Voice Over Services';
