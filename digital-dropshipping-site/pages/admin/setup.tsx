import { useState } from 'react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Header from '../../src/components/Header'

export default function AdminSetup() {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const sqlScript = `-- First, check if products table exists and drop it if needed
DROP TABLE IF EXISTS products;

-- Create products table with correct structure
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
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_created_at ON products(created_at);

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
('Business Analysis', 'Business analysis and requirements gathering services including process optimization, workflow design, and strategic planning.', 90000, 'Business Analysis', '/images/products/content-writing.jpg', 999, true);`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Head>
        <title>Admin Setup - TalentHub Pro</title>
      </Head>

      <div className="min-h-screen bg-bg-base">
        <Header />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Database Setup</h1>
            <p className="text-text-soft mt-2">Set up your products table and insert sample data</p>
          </div>

          <div className="bg-bg-surface rounded-2xl border border-white/10 p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Step 1: Create Products Table</h2>
                <p className="text-text-mute mb-4">
                  Go to your Supabase Dashboard and run the following SQL in the SQL Editor:
                </p>
                
                <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-text-mute">SQL Script</span>
                    <button
                      onClick={copyToClipboard}
                      className="px-3 py-1 bg-accent-blue/20 text-accent-blue text-sm rounded-lg hover:bg-accent-blue/30 transition-colors"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="text-xs text-green-400 overflow-x-auto">
                    <code>{sqlScript}</code>
                  </pre>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h2 className="text-xl font-semibold text-white mb-4">Step 2: Instructions</h2>
                <div className="space-y-3 text-text-mute">
                  <div className="flex items-start space-x-3">
                    <span className="bg-accent-blue text-white text-xs px-2 py-1 rounded-full">1</span>
                    <p>Open your Supabase Dashboard</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="bg-accent-blue text-white text-xs px-2 py-1 rounded-full">2</span>
                    <p>Go to SQL Editor in the left sidebar</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="bg-accent-blue text-white text-xs px-2 py-1 rounded-full">3</span>
                    <p>Copy and paste the SQL script above</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="bg-accent-blue text-white text-xs px-2 py-1 rounded-full">4</span>
                    <p>Click "Run" to execute the script</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="bg-accent-blue text-white text-xs px-2 py-1 rounded-full">5</span>
                    <p>This will drop any existing products table and create a fresh one with 30 sample products</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h2 className="text-xl font-semibold text-white mb-4">Step 3: Fix Image Paths (if needed)</h2>
                <p className="text-text-mute mb-4">
                  If you see 404 errors for images, run this additional SQL script to fix the image paths:
                </p>
                <div className="bg-black/20 rounded-lg p-4 border border-white/10 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-text-mute">Image Path Fix Script</span>
                    <button
                      onClick={() => {
                        const fixScript = `UPDATE products SET image_url = '/images/products/content-writing.jpg' WHERE name = 'Business Analysis';
UPDATE products SET image_url = '/images/products/OIP.jpg' WHERE name = 'Blockchain Development';
UPDATE products SET image_url = '/images/products/data-analysis.jpg' WHERE name = 'AI/ML Development';
UPDATE products SET image_url = '/images/products/mobile-app-development.jpg' WHERE name = 'Game Development';
UPDATE products SET image_url = '/images/products/technical-consulting.jpg' WHERE name = 'Cybersecurity Services';
UPDATE products SET image_url = '/images/products/devops-services.jpg' WHERE name = 'Cloud Architecture';
UPDATE products SET image_url = '/images/products/website-development.jpg' WHERE name = 'API Development';
UPDATE products SET image_url = '/images/products/data-analysis.jpg' WHERE name = 'Quality Assurance';
UPDATE products SET image_url = '/images/products/digital-marketing.jpg' WHERE name = 'Project Management';
UPDATE products SET image_url = '/images/products/logo-design.jpg' WHERE name = 'Brand Identity Design';
UPDATE products SET image_url = '/images/products/voice-over-services.jpg' WHERE name = 'Voice Over Services';`
                        navigator.clipboard.writeText(fixScript)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                      className="px-3 py-1 bg-accent-blue/20 text-accent-blue text-sm rounded-lg hover:bg-accent-blue/30 transition-colors"
                    >
                      {copied ? 'Copied!' : 'Copy Fix Script'}
                    </button>
                  </div>
                  <pre className="text-xs text-green-400 overflow-x-auto">
                    <code>{`UPDATE products SET image_url = '/images/products/content-writing.jpg' WHERE name = 'Business Analysis';
UPDATE products SET image_url = '/images/products/OIP.jpg' WHERE name = 'Blockchain Development';
UPDATE products SET image_url = '/images/products/data-analysis.jpg' WHERE name = 'AI/ML Development';
UPDATE products SET image_url = '/images/products/mobile-app-development.jpg' WHERE name = 'Game Development';
UPDATE products SET image_url = '/images/products/technical-consulting.jpg' WHERE name = 'Cybersecurity Services';
UPDATE products SET image_url = '/images/products/devops-services.jpg' WHERE name = 'Cloud Architecture';
UPDATE products SET image_url = '/images/products/website-development.jpg' WHERE name = 'API Development';
UPDATE products SET image_url = '/images/products/data-analysis.jpg' WHERE name = 'Quality Assurance';
UPDATE products SET image_url = '/images/products/digital-marketing.jpg' WHERE name = 'Project Management';
UPDATE products SET image_url = '/images/products/logo-design.jpg' WHERE name = 'Brand Identity Design';
UPDATE products SET image_url = '/images/products/voice-over-services.jpg' WHERE name = 'Voice Over Services';`}</code>
                  </pre>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h2 className="text-xl font-semibold text-white mb-4">Step 4: Verify Setup</h2>
                <p className="text-text-mute mb-4">
                  After running the SQL, you should see 30 products in your products table.
                </p>
                <div className="flex space-x-4">
                  <Link href="/admin/products-enhanced">
                    <button className="px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-cyan text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200">
                      Go to Products Management
                    </button>
                  </Link>
                  <Link href="/products">
                    <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200">
                      View Products Page
                    </button>
                  </Link>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h2 className="text-xl font-semibold text-white mb-4">What This Script Does</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text-mute">
                  <div>
                    <h3 className="font-semibold text-white mb-2">Creates Products Table:</h3>
                    <ul className="space-y-1">
                      <li>• Product ID (auto-increment)</li>
                      <li>• Name, description, price</li>
                      <li>• Category and image URL</li>
                      <li>• Stock and active status</li>
                      <li>• Timestamps for tracking</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Inserts Sample Products:</h3>
                    <ul className="space-y-1">
                      <li>• Website Development ($1,500)</li>
                      <li>• Mobile App Development ($2,500)</li>
                      <li>• Logo Design ($500)</li>
                      <li>• Content Writing ($250)</li>
                      <li>• Blockchain Development ($3,500)</li>
                      <li>• AI/ML Development ($3,000)</li>
                      <li>• Game Development ($2,000)</li>
                      <li>• And 23 more services...</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Check if user is logged in and is an admin
  const userData = context.req.cookies.user || null
  
  if (!userData) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  try {
    const userObj = JSON.parse(userData)
    if (userObj.role !== 'ADMIN' && userObj.role !== 'TEAM_MEMBER') {
      return {
        redirect: {
          destination: '/admin',
          permanent: false,
        },
      }
    }
  } catch (error) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  return {
    props: {},
  }
}
