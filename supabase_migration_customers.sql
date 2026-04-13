-- CREATE CUSTOMERS TABLE
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Allow admin access (assuming you use a specific role or handle it via service role)
-- For now, simple policy to allow service role / admin logic
CREATE POLICY "Enable all for server operations" ON customers
  FOR ALL
  USING (true)
  WITH CHECK (true);
