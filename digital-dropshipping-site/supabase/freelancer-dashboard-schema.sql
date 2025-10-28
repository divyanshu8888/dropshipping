-- Freelancer Dashboard Database Schema
-- This script creates the necessary tables for freelancer functionality

-- Step 1: Create test users if they don't exist
INSERT INTO users (id, email, password_hash, role, is_active, email_verified, created_at, updated_at) VALUES
-- Admin users
('550e8400-e29b-41d4-a716-446655440001', 'admin@uniti.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2C', 'admin', true, true, NOW() - INTERVAL '10 days', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'admin2@uniti.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2C', 'admin', true, true, NOW() - INTERVAL '9 days', NOW()),
-- Team members
('550e8400-e29b-41d4-a716-446655440003', 'team@uniti.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2C', 'team_member', true, true, NOW() - INTERVAL '8 days', NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'moderator@uniti.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2C', 'team_member', true, true, NOW() - INTERVAL '7 days', NOW()),
-- Freelancers
('550e8400-e29b-41d4-a716-446655440005', 'freelancer1@uniti.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2C', 'freelancer', true, true, NOW() - INTERVAL '6 days', NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'freelancer2@uniti.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2C', 'freelancer', true, true, NOW() - INTERVAL '5 days', NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'freelancer3@uniti.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2C', 'freelancer', true, true, NOW() - INTERVAL '4 days', NOW()),
-- Clients
('550e8400-e29b-41d4-a716-446655440008', 'client1@uniti.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2C', 'client', true, true, NOW() - INTERVAL '3 days', NOW()),
('550e8400-e29b-41d4-a716-446655440009', 'client2@uniti.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2C', 'client', true, true, NOW() - INTERVAL '2 days', NOW()),
('550e8400-e29b-41d4-a716-446655440010', 'client3@uniti.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2C', 'client', true, true, NOW() - INTERVAL '1 day', NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 1b: Create corresponding client records
INSERT INTO clients (id, user_id, company_name, contact_name, phone, address, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440008', 'TechCorp Inc', 'John Smith', '+1-555-0101', '123 Tech Street, Silicon Valley, CA', NOW() - INTERVAL '3 days', NOW()),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440009', 'DesignStudio LLC', 'Sarah Johnson', '+1-555-0102', '456 Design Ave, New York, NY', NOW() - INTERVAL '2 days', NOW()),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440010', 'StartupXYZ', 'Mike Chen', '+1-555-0103', '789 Innovation Blvd, Austin, TX', NOW() - INTERVAL '1 day', NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 1c: Create corresponding freelancer records (without status to use default)
INSERT INTO freelancers (id, user_id, display_name, title, bio, description, country, skills, rating, total_reviews, completed_projects, response_time, availability, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440005', 'Alex Developer', 'Full Stack Developer', 'Experienced developer with 5+ years', 'I specialize in React, Node.js, and modern web technologies', 'United States', ARRAY['React', 'Node.js', 'JavaScript', 'TypeScript'], 4.8, 25, 15, '1 hour', 'Available', NOW() - INTERVAL '6 days', NOW()),
('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440006', 'Maria Designer', 'UI/UX Designer', 'Creative designer passionate about user experience', 'I create beautiful and functional designs', 'Canada', ARRAY['UI Design', 'UX Research', 'Figma', 'Adobe Creative Suite'], 4.9, 18, 12, '2 hours', 'Available', NOW() - INTERVAL '5 days', NOW()),
('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440007', 'David Writer', 'Content Writer', 'Professional content creator', 'I write engaging content for websites and marketing', 'United Kingdom', ARRAY['Content Writing', 'SEO', 'Copywriting', 'Blog Writing'], 4.7, 30, 20, '3 hours', 'Available', NOW() - INTERVAL '4 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop existing tables to start fresh
DROP TABLE IF EXISTS deliverables CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- Step 3: Create projects table with all columns
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  budget INTEGER NOT NULL,
  deadline DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'in_progress', 'review', 'completed', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  client_id UUID,
  freelancer_id UUID,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create messages table with all columns
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID,
  sender VARCHAR(20) NOT NULL CHECK (sender IN ('client', 'freelancer', 'admin')),
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

-- Step 5: Create deliverables table with all columns
CREATE TABLE deliverables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('code', 'document', 'image', 'video')),
  url TEXT NOT NULL,
  description TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID
);

-- Step 6: Add foreign key constraints
DO $$
BEGIN
    -- Add foreign key to projects table
    BEGIN
        ALTER TABLE projects ADD CONSTRAINT fk_projects_client 
        FOREIGN KEY (client_id) REFERENCES clients(id);
        RAISE NOTICE 'Added fk_projects_client constraint';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'fk_projects_client constraint already exists';
        WHEN OTHERS THEN
            RAISE NOTICE 'Error adding fk_projects_client: %', SQLERRM;
    END;
    
    BEGIN
        ALTER TABLE projects ADD CONSTRAINT fk_projects_freelancer 
        FOREIGN KEY (freelancer_id) REFERENCES freelancers(id);
        RAISE NOTICE 'Added fk_projects_freelancer constraint';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'fk_projects_freelancer constraint already exists';
        WHEN OTHERS THEN
            RAISE NOTICE 'Error adding fk_projects_freelancer: %', SQLERRM;
    END;
    
    BEGIN
        ALTER TABLE messages ADD CONSTRAINT fk_messages_project 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added fk_messages_project constraint';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'fk_messages_project constraint already exists';
        WHEN OTHERS THEN
            RAISE NOTICE 'Error adding fk_messages_project: %', SQLERRM;
    END;
    
    BEGIN
        ALTER TABLE deliverables ADD CONSTRAINT fk_deliverables_project 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added fk_deliverables_project constraint';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'fk_deliverables_project constraint already exists';
        WHEN OTHERS THEN
            RAISE NOTICE 'Error adding fk_deliverables_project: %', SQLERRM;
    END;
    
    BEGIN
        ALTER TABLE deliverables ADD CONSTRAINT fk_deliverables_user 
        FOREIGN KEY (uploaded_by) REFERENCES users(id);
        RAISE NOTICE 'Added fk_deliverables_user constraint';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'fk_deliverables_user constraint already exists';
        WHEN OTHERS THEN
            RAISE NOTICE 'Error adding fk_deliverables_user: %', SQLERRM;
    END;
END $$;

-- Step 8: Create freelancers table extensions (if freelancers table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'freelancers') THEN
        ALTER TABLE freelancers ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE;
        ALTER TABLE freelancers ADD COLUMN IF NOT EXISTS working_hours VARCHAR(50) DEFAULT '9 AM - 6 PM';
        ALTER TABLE freelancers ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC';
        ALTER TABLE freelancers ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0;
        ALTER TABLE freelancers ADD COLUMN IF NOT EXISTS total_projects INTEGER DEFAULT 0;
        ALTER TABLE freelancers ADD COLUMN IF NOT EXISTS completed_projects INTEGER DEFAULT 0;
        RAISE NOTICE 'Extended freelancers table with additional columns';
    END IF;
END $$;

-- Step 9: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_freelancer ON projects(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_messages_project ON messages(project_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_project ON deliverables(project_id);

-- Step 10: Create RLS policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Freelancers can view their projects" ON projects
  FOR SELECT USING (
    freelancer_id IN (
      SELECT user_id FROM freelancers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can view their projects" ON projects
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all projects" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Messages policies
CREATE POLICY "Project participants can view messages" ON messages
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE freelancer_id IN (
        SELECT user_id FROM freelancers WHERE user_id = auth.uid()
      ) OR client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Project participants can send messages" ON messages
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects 
      WHERE freelancer_id IN (
        SELECT user_id FROM freelancers WHERE user_id = auth.uid()
      ) OR client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
      )
    )
  );

-- Deliverables policies
CREATE POLICY "Project participants can view deliverables" ON deliverables
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE freelancer_id IN (
        SELECT user_id FROM freelancers WHERE user_id = auth.uid()
      ) OR client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Freelancers can upload deliverables" ON deliverables
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects 
      WHERE freelancer_id IN (
        SELECT user_id FROM freelancers WHERE user_id = auth.uid()
      )
    )
  );

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_projects_updated_at();

-- Insert sample projects for testing
DO $$
DECLARE
    project1_id UUID;
    project2_id UUID;
    freelancer1_id UUID := '550e8400-e29b-41d4-a716-446655440014'; -- Alex Developer (freelancer record)
    freelancer2_id UUID := '550e8400-e29b-41d4-a716-446655440015'; -- Maria Designer (freelancer record)
    client1_id UUID := '550e8400-e29b-41d4-a716-446655440011';     -- TechCorp Inc (client record)
    client2_id UUID := '550e8400-e29b-41d4-a716-446655440012';     -- DesignStudio LLC (client record)
BEGIN
    -- Verify users exist before inserting projects
    IF EXISTS (SELECT 1 FROM users WHERE id = freelancer1_id) AND EXISTS (SELECT 1 FROM users WHERE id = client1_id) THEN
        INSERT INTO projects (title, description, budget, deadline, status, progress, client_id, freelancer_id) 
        VALUES (
            'E-commerce Website Development',
            'Build a modern e-commerce website with React and Node.js',
            5000,
            CURRENT_DATE + INTERVAL '30 days',
            'in_progress',
            45,
            client1_id,
            freelancer1_id
        ) RETURNING id INTO project1_id;
        
        RAISE NOTICE 'Created project 1: E-commerce Website Development';
    END IF;
    
    IF EXISTS (SELECT 1 FROM users WHERE id = freelancer2_id) AND EXISTS (SELECT 1 FROM users WHERE id = client2_id) THEN
        INSERT INTO projects (title, description, budget, deadline, status, progress, client_id, freelancer_id) 
        VALUES (
            'Mobile App Design',
            'Design UI/UX for a mobile application',
            3000,
            CURRENT_DATE + INTERVAL '20 days',
            'approved',
            0,
            client2_id,
            freelancer2_id
        ) RETURNING id INTO project2_id;
        
        RAISE NOTICE 'Created project 2: Mobile App Design';
    END IF;
END $$;

-- Insert sample messages
DO $$
DECLARE
    project_id_var UUID;
    freelancer_id_var UUID := '550e8400-e29b-41d4-a716-446655440005'; -- freelancer1@uniti.com
BEGIN
    -- Get project ID
    SELECT id INTO project_id_var FROM projects WHERE title = 'E-commerce Website Development' LIMIT 1;
    
    -- Insert messages if project exists
    IF project_id_var IS NOT NULL THEN
        INSERT INTO messages (project_id, sender, content) VALUES
        (project_id_var, 'client', 'Hi! I''m excited to work with you on this project. When can we start?'),
        (project_id_var, 'freelancer', 'Hello! I''m ready to start. I''ll begin with the initial setup and wireframes.');
        
        RAISE NOTICE 'Created sample messages for project';
        
        -- Insert sample deliverable
        INSERT INTO deliverables (project_id, name, type, url, description, uploaded_by) VALUES
        (project_id_var, 'initial-wireframes.pdf', 'document', 'https://example.com/wireframes.pdf', 'Initial wireframes and project structure', freelancer_id_var);
        
        RAISE NOTICE 'Created sample deliverable';
    END IF;
END $$;

-- Update freelancer stats (only if freelancers table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'freelancers') THEN
        UPDATE freelancers 
        SET 
          is_available = true,
          working_hours = '9 AM - 6 PM',
          timezone = 'UTC',
          rating = 4.8,
          total_projects = 1,
          completed_projects = 0
        WHERE user_id IN (
          '550e8400-e29b-41d4-a716-446655440005', -- freelancer1@uniti.com
          '550e8400-e29b-41d4-a716-446655440006', -- freelancer2@uniti.com
          '550e8400-e29b-41d4-a716-446655440007'  -- freelancer3@uniti.com
        );
        
        RAISE NOTICE 'Updated freelancer stats';
    END IF;
END $$;

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '✅ Freelancer Dashboard Database Schema Created Successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Tables Created:';
    RAISE NOTICE '  - projects (with status tracking)';
    RAISE NOTICE '  - messages (for client communication)';
    RAISE NOTICE '  - deliverables (for file uploads)';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Security:';
    RAISE NOTICE '  - Row Level Security (RLS) enabled';
    RAISE NOTICE '  - Policies for freelancers, clients, and admins';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Sample Data:';
    RAISE NOTICE '  - 2 sample projects';
    RAISE NOTICE '  - Sample messages';
    RAISE NOTICE '  - Sample deliverables';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Ready for freelancer dashboard testing!';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 Login Credentials:';
    RAISE NOTICE '  - freelancer1@uniti.com / admin123';
    RAISE NOTICE '  - client1@uniti.com / admin123';
    RAISE NOTICE '  - admin@uniti.com / admin123';
END $$;
