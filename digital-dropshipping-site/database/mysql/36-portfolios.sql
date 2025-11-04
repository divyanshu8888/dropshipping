-- ============================================================================
-- Portfolios Table
-- ============================================================================
-- Stores portfolio items that freelancers can showcase their work
-- ============================================================================

CREATE TABLE IF NOT EXISTS portfolios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    freelancer_id INT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    summary TEXT NULL,                                          -- Brief description of the project
    description TEXT NULL,                                      -- Detailed description
    thumbnail_url VARCHAR(512) NULL,                           -- Main thumbnail image URL
    gallery_urls JSON NULL,                                     -- Array of image URLs for gallery
    project_url VARCHAR(512) NULL,                              -- Live project URL (if available)
    tags JSON NULL,                                             -- Array of tags/skills used
    is_public ENUM('TRUE', 'FALSE') NOT NULL DEFAULT 'TRUE',   -- Whether portfolio is visible publicly
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_portfolios_freelancer FOREIGN KEY (freelancer_id) REFERENCES freelancers(id) ON DELETE CASCADE,

    INDEX idx_portfolios_freelancer (freelancer_id),
    INDEX idx_portfolios_is_public (is_public),
    INDEX idx_portfolios_created_at (created_at DESC)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SAMPLE PORTFOLIO DATA
-- ============================================================================
-- Portfolio items for existing freelancers

-- Portfolio for John Freelancer (Full Stack Developer)
INSERT INTO portfolios (
    freelancer_id,
    title,
    summary,
    description,
    thumbnail_url,
    gallery_urls,
    project_url,
    tags,
    is_public,
    created_at
)
SELECT 
    f.id,
    'E-Commerce Platform with React & Node.js',
    'A full-stack e-commerce solution with real-time inventory management, payment processing, and admin dashboard.',
    'Built a scalable e-commerce platform using React for the frontend and Node.js with Express for the backend. Integrated Stripe payment gateway, implemented real-time inventory updates using WebSockets, and created a comprehensive admin dashboard with analytics. The platform handles thousands of concurrent users and processes transactions securely.',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop'
    ),
    'https://example-ecommerce.com',
    JSON_ARRAY('React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS', 'Stripe', 'WebSockets'),
    'TRUE',
    '2024-09-15 10:30:00'
FROM freelancers f 
WHERE f.display_name = 'John Freelancer'
LIMIT 1;

INSERT INTO portfolios (
    freelancer_id,
    title,
    summary,
    description,
    thumbnail_url,
    gallery_urls,
    project_url,
    tags,
    is_public,
    created_at
)
SELECT 
    f.id,
    'Cloud-Based Task Management System',
    'A collaborative task management application with real-time updates, file sharing, and team collaboration features.',
    'Developed a cloud-based task management system using React, TypeScript, and AWS services. Implemented real-time collaboration using WebSockets, file upload and storage with S3, and user authentication with AWS Cognito. The application supports multiple teams, projects, and integrates with popular productivity tools.',
    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'
    ),
    'https://example-taskmanager.com',
    JSON_ARRAY('React', 'TypeScript', 'AWS', 'MongoDB', 'WebSockets', 'S3'),
    'TRUE',
    '2024-08-20 14:15:00'
FROM freelancers f 
WHERE f.display_name = 'John Freelancer'
LIMIT 1;

-- Portfolio for Sarah Designer (UI/UX Designer)
INSERT INTO portfolios (
    freelancer_id,
    title,
    summary,
    description,
    thumbnail_url,
    gallery_urls,
    project_url,
    tags,
    is_public,
    created_at
)
SELECT 
    f.id,
    'FinTech Mobile App Design',
    'Complete UI/UX design for a financial management mobile application with intuitive navigation and modern aesthetics.',
    'Designed a comprehensive mobile app for personal finance management. Created user personas, conducted user research, and developed wireframes and high-fidelity prototypes in Figma. The design focuses on simplicity, accessibility, and trust-building for financial transactions. Implemented a design system with consistent components and animations.',
    'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1561070791-2526d69294b0?w=800&h=600&fit=crop'
    ),
    'https://dribbble.com/sarah-fintech',
    JSON_ARRAY('Figma', 'UI Design', 'UX Design', 'Prototyping', 'User Research', 'Design Systems'),
    'TRUE',
    '2024-10-05 09:00:00'
FROM freelancers f 
WHERE f.display_name = 'Sarah Designer'
LIMIT 1;

INSERT INTO portfolios (
    freelancer_id,
    title,
    summary,
    description,
    thumbnail_url,
    gallery_urls,
    project_url,
    tags,
    is_public,
    created_at
)
SELECT 
    f.id,
    'SaaS Dashboard Redesign',
    'Modern dashboard redesign for a B2B SaaS platform, improving user engagement by 40% through better UX.',
    'Redesigned the entire dashboard interface for a SaaS platform, focusing on information architecture and user workflows. Conducted extensive user interviews and A/B testing to validate design decisions. Created a comprehensive design system with reusable components, improved data visualization, and streamlined navigation. The redesign resulted in a 40% increase in user engagement and reduced support tickets by 25%.',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'
    ),
    'https://dribbble.com/sarah-dashboard',
    JSON_ARRAY('Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems', 'Data Visualization'),
    'TRUE',
    '2024-09-12 16:30:00'
FROM freelancers f 
WHERE f.display_name = 'Sarah Designer'
LIMIT 1;

-- Portfolio for Mark Developer (Backend Developer)
INSERT INTO portfolios (
    freelancer_id,
    title,
    summary,
    description,
    thumbnail_url,
    gallery_urls,
    project_url,
    tags,
    is_public,
    created_at
)
SELECT 
    f.id,
    'Microservices API Architecture',
    'Scalable microservices architecture handling 10M+ API requests per day with high availability.',
    'Designed and implemented a microservices architecture using Python (FastAPI) and Go for high-performance services. Implemented service mesh with Kubernetes, used Redis for caching, and PostgreSQL for persistent storage. The system handles over 10 million API requests per day with 99.9% uptime. Implemented comprehensive monitoring, logging, and auto-scaling capabilities.',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop'
    ),
    'https://github.com/mark-api',
    JSON_ARRAY('Python', 'Go', 'Kubernetes', 'Docker', 'PostgreSQL', 'Redis', 'Microservices', 'API'),
    'TRUE',
    '2024-08-25 11:20:00'
FROM freelancers f 
WHERE f.display_name = 'Mark Developer'
LIMIT 1;

INSERT INTO portfolios (
    freelancer_id,
    title,
    summary,
    description,
    thumbnail_url,
    gallery_urls,
    project_url,
    tags,
    is_public,
    created_at
)
SELECT 
    f.id,
    'Real-Time Data Processing Pipeline',
    'High-throughput data processing system processing millions of events in real-time with Kafka and Python.',
    'Built a real-time data processing pipeline using Apache Kafka for event streaming, Python for data transformation, and PostgreSQL for storage. The system processes millions of events per hour, implements data validation, error handling, and monitoring. Integrated with multiple data sources and provides real-time analytics dashboards.',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop'
    ),
    'https://github.com/mark-pipeline',
    JSON_ARRAY('Python', 'Kafka', 'PostgreSQL', 'Docker', 'Data Processing', 'Real-time'),
    'TRUE',
    '2024-07-18 13:45:00'
FROM freelancers f 
WHERE f.display_name = 'Mark Developer'
LIMIT 1;

-- Portfolio for Emily Content (Content Writer)
INSERT INTO portfolios (
    freelancer_id,
    title,
    summary,
    description,
    thumbnail_url,
    gallery_urls,
    project_url,
    tags,
    is_public,
    created_at
)
SELECT 
    f.id,
    'SaaS Company Blog Content Strategy',
    'Developed and executed content strategy that increased organic traffic by 300% and generated 500+ qualified leads.',
    'Created a comprehensive content strategy for a SaaS company, including blog posts, case studies, whitepapers, and email campaigns. Wrote over 50 SEO-optimized articles that increased organic traffic by 300%. Developed content calendars, keyword research strategies, and conversion-optimized landing pages. The content generated 500+ qualified leads and established the company as a thought leader in their industry.',
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop'
    ),
    'https://example-blog.com',
    JSON_ARRAY('Content Writing', 'SEO', 'Content Strategy', 'Blog Writing', 'Copywriting'),
    'TRUE',
    '2024-10-01 10:00:00'
FROM freelancers f 
WHERE f.display_name = 'Emily Content'
LIMIT 1;

INSERT INTO portfolios (
    freelancer_id,
    title,
    summary,
    description,
    thumbnail_url,
    gallery_urls,
    project_url,
    tags,
    is_public,
    created_at
)
SELECT 
    f.id,
    'Technical Documentation Suite',
    'Comprehensive technical documentation for developer tools, reducing support tickets by 60%.',
    'Created extensive technical documentation including API references, developer guides, tutorials, and troubleshooting guides. The documentation improved developer onboarding time by 50% and reduced support tickets by 60%. Wrote clear, concise technical content that made complex concepts accessible to developers of all skill levels.',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop'
    ),
    'https://docs.example.com',
    JSON_ARRAY('Technical Writing', 'Documentation', 'API Documentation', 'Developer Guides'),
    'TRUE',
    '2024-09-05 14:30:00'
FROM freelancers f 
WHERE f.display_name = 'Emily Content'
LIMIT 1;

-- Portfolio for David Mobile (Mobile Developer)
INSERT INTO portfolios (
    freelancer_id,
    title,
    summary,
    description,
    thumbnail_url,
    gallery_urls,
    project_url,
    tags,
    is_public,
    created_at
)
SELECT 
    f.id,
    'Fitness Tracking iOS App',
    'Native iOS fitness app with 50K+ downloads, featuring workout tracking, social features, and Apple Health integration.',
    'Developed a native iOS fitness tracking application using Swift and SwiftUI. The app features workout tracking, progress analytics, social sharing, and seamless integration with Apple Health. Implemented Core Data for local storage, CloudKit for sync, and In-App Purchases for premium features. The app has 50,000+ downloads with a 4.8-star rating on the App Store.',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop'
    ),
    'https://apps.apple.com/example-fitness',
    JSON_ARRAY('Swift', 'iOS', 'SwiftUI', 'Core Data', 'CloudKit', 'Apple Health'),
    'TRUE',
    '2024-09-20 15:00:00'
FROM freelancers f 
WHERE f.display_name = 'David Mobile'
LIMIT 1;

INSERT INTO portfolios (
    freelancer_id,
    title,
    summary,
    description,
    thumbnail_url,
    gallery_urls,
    project_url,
    tags,
    is_public,
    created_at
)
SELECT 
    f.id,
    'Cross-Platform E-Commerce App',
    'React Native e-commerce app for iOS and Android with 100K+ users and seamless shopping experience.',
    'Built a cross-platform e-commerce mobile application using React Native for both iOS and Android. Implemented features including product catalog, shopping cart, payment integration (Stripe), push notifications, and user authentication. The app maintains native performance on both platforms and has 100,000+ active users with excellent reviews.',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
    JSON_ARRAY(
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop'
    ),
    'https://play.google.com/example-shop',
    JSON_ARRAY('React Native', 'iOS', 'Android', 'TypeScript', 'Stripe', 'Push Notifications'),
    'TRUE',
    '2024-08-10 12:00:00'
FROM freelancers f 
WHERE f.display_name = 'David Mobile'
LIMIT 1;

