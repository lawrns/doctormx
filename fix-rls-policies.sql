-- Fix RLS policies for doctor onboarding
-- This script ensures users can insert into users and doctors tables during signup

-- Enable RLS on users table if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Service role can manage all users" ON users;

-- Create comprehensive RLS policies for users table
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can manage all users" ON users
    FOR ALL USING (auth.role() = 'service_role');

-- Enable RLS on doctors table if not already enabled
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Doctors can view own profile" ON doctors;
DROP POLICY IF EXISTS "Doctors can update own profile" ON doctors;
DROP POLICY IF EXISTS "Doctors can insert own profile" ON doctors;
DROP POLICY IF EXISTS "Service role can manage all doctors" ON doctors;

-- Create comprehensive RLS policies for doctors table
CREATE POLICY "Doctors can view own profile" ON doctors
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Doctors can update own profile" ON doctors
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Doctors can insert own profile" ON doctors
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all doctors" ON doctors
    FOR ALL USING (auth.role() = 'service_role');

-- Enable RLS on referrals table if not already enabled
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view own referrals" ON referrals;
DROP POLICY IF EXISTS "Users can insert own referrals" ON referrals;
DROP POLICY IF EXISTS "Service role can manage all referrals" ON referrals;

-- Create comprehensive RLS policies for referrals table
CREATE POLICY "Users can view own referrals" ON referrals
    FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = source_id);

CREATE POLICY "Users can insert own referrals" ON referrals
    FOR INSERT WITH CHECK (auth.uid() = patient_id OR auth.uid() = source_id);

CREATE POLICY "Service role can manage all referrals" ON referrals
    FOR ALL USING (auth.role() = 'service_role');

-- Enable RLS on onboarding_analytics table if not already enabled
ALTER TABLE onboarding_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Doctors can view own onboarding analytics" ON onboarding_analytics;
DROP POLICY IF EXISTS "Doctors can insert own onboarding analytics" ON onboarding_analytics;
DROP POLICY IF EXISTS "Service role can manage all onboarding analytics" ON onboarding_analytics;

-- Create comprehensive RLS policies for onboarding_analytics table
CREATE POLICY "Doctors can view own onboarding analytics" ON onboarding_analytics
    FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can insert own onboarding analytics" ON onboarding_analytics
    FOR INSERT WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Service role can manage all onboarding analytics" ON onboarding_analytics
    FOR ALL USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
