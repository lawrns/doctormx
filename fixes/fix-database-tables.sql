-- Fix for DoctorMX Database Tables and RLS Policies
-- Run this in your Supabase SQL editor

-- First, ensure the tables exist with proper structure
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  blood_type TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  address JSONB,
  preferences JSONB DEFAULT '{"language": "es", "notifications": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctor_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  license_number TEXT NOT NULL,
  specialty TEXT NOT NULL,
  subspecialty TEXT,
  medical_school TEXT,
  years_experience INTEGER DEFAULT 0,
  languages TEXT[] DEFAULT ARRAY['Spanish'],
  certifications JSONB DEFAULT '[]'::jsonb,
  consultation_fee DECIMAL(10,2),
  accepts_insurance BOOLEAN DEFAULT true,
  office_address JSONB,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id ON user_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_auth_user_id ON doctor_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_auth_user_id ON admin_users(auth_user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role can do anything" ON user_profiles;

DROP POLICY IF EXISTS "Doctors can view own profile" ON doctor_profiles;
DROP POLICY IF EXISTS "Doctors can update own profile" ON doctor_profiles;
DROP POLICY IF EXISTS "Public can view verified doctors" ON doctor_profiles;
DROP POLICY IF EXISTS "Service role can do anything" ON doctor_profiles;

DROP POLICY IF EXISTS "Admins can view own profile" ON admin_users;
DROP POLICY IF EXISTS "Service role can do anything" ON admin_users;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can create own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Service role can do anything" ON user_profiles
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Create RLS policies for doctor_profiles
CREATE POLICY "Doctors can view own profile" ON doctor_profiles
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Doctors can update own profile" ON doctor_profiles
  FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Public can view verified doctors" ON doctor_profiles
  FOR SELECT USING (verification_status = 'verified');

CREATE POLICY "Service role can do anything" ON doctor_profiles
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Create RLS policies for admin_users
CREATE POLICY "Admins can view own profile" ON admin_users
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Service role can do anything" ON admin_users
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Create functions for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_doctor_profiles_updated_at ON doctor_profiles;
CREATE TRIGGER update_doctor_profiles_updated_at 
  BEFORE UPDATE ON doctor_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at 
  BEFORE UPDATE ON admin_users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON doctor_profiles TO authenticated;
GRANT SELECT ON admin_users TO authenticated;

-- For the API to work properly, ensure anon role has proper access
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON user_profiles TO anon;
GRANT SELECT ON doctor_profiles TO anon;