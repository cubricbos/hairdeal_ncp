-- CS Management Tables & Roles Update
-- Run this in Supabase SQL Editor

-- 1. Update profiles table to support CS Admin role and Business Status
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_cs_admin BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_status TEXT DEFAULT 'active' CHECK (business_status IN ('active', 'closed', 'dormant'));

-- 2. Create CS Incidents Table
CREATE TABLE IF NOT EXISTS cs_incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  severity INTEGER CHECK (severity IN (1, 2, 3, 4)) NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  root_cause TEXT,
  prevention_plan TEXT,
  sla_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  reporter_id UUID REFERENCES auth.users(id),
  notify_customers BOOLEAN DEFAULT false
);

-- 3. Create CS Notices Table
CREATE TABLE IF NOT EXISTS cs_notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  author_id UUID REFERENCES auth.users(id)
);

-- RLS Policies
ALTER TABLE cs_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE cs_notices ENABLE ROW LEVEL SECURITY;

-- Allow read/write for CS Admins and Main Admin
DROP POLICY IF EXISTS "Allow full access to CS admins for incidents" ON cs_incidents;
CREATE POLICY "Allow full access to CS admins for incidents" ON cs_incidents FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_cs_admin = true OR email = 'cubric.ceo@gmail.com'))
);

DROP POLICY IF EXISTS "Allow full access to CS admins for notices" ON cs_notices;
CREATE POLICY "Allow full access to CS admins for notices" ON cs_notices FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_cs_admin = true OR email = 'cubric.ceo@gmail.com'))
);

-- Allow public read for published notices
DROP POLICY IF EXISTS "Allow public read for published notices" ON cs_notices;
CREATE POLICY "Allow public read for published notices" ON cs_notices FOR SELECT USING (is_published = true);
