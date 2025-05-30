-- ==============================
-- Authentication Tables Setup
-- ==============================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================
-- USER PROFILES TABLE
-- ==============================

-- Drop existing table if it exists (be careful in production!)
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Create user_profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    address JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{"language": "es", "notifications": true}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_auth_user_id UNIQUE(auth_user_id)
);

-- Create indexes for user_profiles
CREATE INDEX idx_user_profiles_auth_user_id ON user_profiles(auth_user_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- ==============================
-- DOCTOR PROFILES TABLE
-- ==============================

-- Drop existing table if it exists
DROP TABLE IF EXISTS doctor_profiles CASCADE;

-- Create doctor_profiles table
CREATE TABLE doctor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    license_number TEXT NOT NULL,
    specialty TEXT NOT NULL,
    subspecialty TEXT,
    medical_school TEXT,
    years_experience INTEGER DEFAULT 0,
    languages TEXT[] DEFAULT ARRAY['es'],
    certifications JSONB DEFAULT '[]',
    consultation_fee DECIMAL(10, 2),
    accepts_insurance BOOLEAN DEFAULT true,
    office_address JSONB,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
    rating DECIMAL(3, 2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_doctor_auth_user_id UNIQUE(auth_user_id),
    CONSTRAINT unique_license_number UNIQUE(license_number)
);

-- Create indexes for doctor_profiles
CREATE INDEX idx_doctor_profiles_auth_user_id ON doctor_profiles(auth_user_id);
CREATE INDEX idx_doctor_profiles_user_profile_id ON doctor_profiles(user_profile_id);
CREATE INDEX idx_doctor_profiles_specialty ON doctor_profiles(specialty);
CREATE INDEX idx_doctor_profiles_verification_status ON doctor_profiles(verification_status);
CREATE INDEX idx_doctor_profiles_rating ON doctor_profiles(rating);

-- ==============================
-- ADMIN USERS TABLE
-- ==============================

-- Drop existing table if it exists
DROP TABLE IF EXISTS admin_users CASCADE;

-- Create admin_users table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'moderator', 'support')),
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_admin_auth_user_id UNIQUE(auth_user_id),
    CONSTRAINT unique_admin_email UNIQUE(email)
);

-- Create indexes for admin_users
CREATE INDEX idx_admin_users_auth_user_id ON admin_users(auth_user_id);
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);

-- ==============================
-- UPDATE TRIGGERS
-- ==============================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_profiles_updated_at BEFORE UPDATE ON doctor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================
-- ROW LEVEL SECURITY (RLS)
-- ==============================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ==============================
-- USER PROFILES POLICIES
-- ==============================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = auth_user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Doctors can view user profiles (for patient information)
CREATE POLICY "Doctors can view user profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM doctor_profiles 
            WHERE doctor_profiles.auth_user_id = auth.uid() 
            AND doctor_profiles.verification_status = 'verified'
        )
    );

-- Admins can view all profiles
CREATE POLICY "Admins can view all user profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.auth_user_id = auth.uid()
            AND admin_users.is_active = true
        )
    );

-- ==============================
-- DOCTOR PROFILES POLICIES
-- ==============================

-- Anyone can view verified doctor profiles
CREATE POLICY "Anyone can view verified doctor profiles" ON doctor_profiles
    FOR SELECT USING (verification_status = 'verified');

-- Doctors can view their own profile regardless of status
CREATE POLICY "Doctors can view own profile" ON doctor_profiles
    FOR SELECT USING (auth.uid() = auth_user_id);

-- Doctors can update their own profile
CREATE POLICY "Doctors can update own profile" ON doctor_profiles
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- Users can insert doctor profile for themselves
CREATE POLICY "Users can create doctor profile" ON doctor_profiles
    FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Admins can view all doctor profiles
CREATE POLICY "Admins can view all doctor profiles" ON doctor_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.auth_user_id = auth.uid()
            AND admin_users.is_active = true
        )
    );

-- Admins can update doctor profiles (for verification)
CREATE POLICY "Admins can update doctor profiles" ON doctor_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.auth_user_id = auth.uid()
            AND admin_users.is_active = true
            AND admin_users.role IN ('admin', 'super_admin')
        )
    );

-- ==============================
-- ADMIN USERS POLICIES
-- ==============================

-- Admins can view their own profile
CREATE POLICY "Admins can view own profile" ON admin_users
    FOR SELECT USING (auth.uid() = auth_user_id);

-- Super admins can view all admin profiles
CREATE POLICY "Super admins can view all admin profiles" ON admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.auth_user_id = auth.uid()
            AND admin_users.role = 'super_admin'
            AND admin_users.is_active = true
        )
    );

-- Super admins can create new admin users
CREATE POLICY "Super admins can create admin users" ON admin_users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.auth_user_id = auth.uid()
            AND admin_users.role = 'super_admin'
            AND admin_users.is_active = true
        )
    );

-- Super admins can update admin users
CREATE POLICY "Super admins can update admin users" ON admin_users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.auth_user_id = auth.uid()
            AND admin_users.role = 'super_admin'
            AND admin_users.is_active = true
        )
    );

-- ==============================
-- HELPFUL FUNCTIONS
-- ==============================

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE auth_user_id = user_id 
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is a verified doctor
CREATE OR REPLACE FUNCTION is_verified_doctor(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM doctor_profiles 
        WHERE auth_user_id = user_id 
        AND verification_status = 'verified'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================
-- SAMPLE DATA (Optional - Remove in production)
-- ==============================

-- Create a sample super admin (you'll need to create the auth user first)
-- INSERT INTO admin_users (auth_user_id, email, role) 
-- VALUES ('your-auth-user-id', 'admin@doctormx.com', 'super_admin');

-- ==============================
-- GRANTS (if needed for specific roles)
-- ==============================

-- Grant usage on the schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant permissions on tables
GRANT ALL ON user_profiles TO authenticated;
GRANT SELECT ON user_profiles TO anon;

GRANT ALL ON doctor_profiles TO authenticated;
GRANT SELECT ON doctor_profiles TO anon;

GRANT SELECT ON admin_users TO authenticated;

-- Grant permissions on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;