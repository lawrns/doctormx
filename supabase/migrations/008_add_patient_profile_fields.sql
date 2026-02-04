-- Migration: Add patient-specific fields to profiles table
-- Created: 2026-02-04
-- Description: Adds fields needed by PatientProfile interface that were missing

-- Add email column (may already exist from auth, but adding to profiles for easier access)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Date of birth
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth TIMESTAMPTZ;

-- Gender
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));

-- Insurance fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS insurance_provider TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS insurance_policy_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS insurance_group_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS insurance_coverage_type TEXT;

-- Emergency contact fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;

-- Notification preferences
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_email BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_sms BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_whatsapp BOOLEAN DEFAULT true;

-- Create index on date_of_birth for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_date_of_birth ON profiles(date_of_birth);

-- Update updated_at trigger to include new columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure trigger exists for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
