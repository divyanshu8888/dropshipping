-- Add missing fields to quote_requests table
-- This migration adds the fields we need for the quote request form

-- Add new columns to quote_requests table
ALTER TABLE quote_requests 
ADD COLUMN IF NOT EXISTS client_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS budget DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium';

-- Update the existing columns to match our form structure
-- Note: project_title, project_description, category, timeline already exist
-- We just need to make sure they're properly set up

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quote_requests_client_email ON quote_requests(client_email);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON quote_requests(created_at);

-- Add comments for documentation
COMMENT ON COLUMN quote_requests.client_name IS 'Full name of the client requesting the quote';
COMMENT ON COLUMN quote_requests.client_email IS 'Email address of the client';
COMMENT ON COLUMN quote_requests.client_phone IS 'Phone number of the client (optional)';
COMMENT ON COLUMN quote_requests.budget IS 'Budget amount in USD';
COMMENT ON COLUMN quote_requests.priority IS 'Priority level: low, medium, high, urgent';
