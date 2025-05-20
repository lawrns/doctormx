/*
  # Comprehensive Fix for Doctor Registration Issues
  
  This migration addresses all potential issues that could be blocking doctor registration:
  1. Ensures all columns are properly nullable
  2. Sets appropriate default values
  3. Creates proper RLS policies for inserting
  4. Fixes any potential constraint issues
*/

-- Make sure all sensitive columns are nullable or have defaults
ALTER TABLE doctors 
  ALTER COLUMN specialty SET DEFAULT '',
  ALTER COLUMN image DROP NOT NULL,
  ALTER COLUMN bio DROP NOT NULL,
  ALTER COLUMN credentials DROP NOT NULL,
  ALTER COLUMN education DROP NOT NULL,
  ALTER COLUMN languages DROP NOT NULL,
  ALTER COLUMN address DROP NOT NULL,
  ALTER COLUMN location DROP NOT NULL,
  ALTER COLUMN consultation_fee DROP NOT NULL;

-- Set appropriate defaults for boolean columns
ALTER TABLE doctors 
  ALTER COLUMN is_verified SET DEFAULT false,
  ALTER COLUMN is_accepting_patients SET DEFAULT true,
  ALTER COLUMN telemedicine_available SET DEFAULT true,
  ALTER COLUMN in_person_available SET DEFAULT true,
  ALTER COLUMN joined_via_referral SET DEFAULT false,
  ALTER COLUMN is_premium SET DEFAULT false;

-- Fix email uniqueness issues
ALTER TABLE doctors
  ALTER COLUMN email DROP NOT NULL;

-- Re-create the RLS policies with correct permissions
DROP POLICY IF EXISTS "Users can create their own doctor profile" ON doctors;
DROP POLICY IF EXISTS "Doctors can update their own profile" ON doctors;
DROP POLICY IF EXISTS "Public can view verified doctors" ON doctors;

-- Create better policies
CREATE POLICY "Public can view doctors" 
  ON doctors
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own doctor profile" 
  ON doctors
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own doctor profile" 
  ON doctors
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Create a function to handle simple doctor registration
CREATE OR REPLACE FUNCTION register_doctor_simple(
  p_name TEXT,
  p_email TEXT,
  p_specialty TEXT,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_doctor_id UUID;
BEGIN
  -- Create minimal doctor profile
  INSERT INTO doctors (
    user_id,
    name,
    specialty,
    email,
    verification_status,
    is_premium,
    premium_until
  ) VALUES (
    p_user_id,
    p_name,
    p_specialty,
    p_email,
    'pending',
    true,
    NOW() + INTERVAL '6 months'
  )
  RETURNING id INTO v_doctor_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'doctor_id', v_doctor_id
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION register_doctor_simple TO authenticated;
GRANT EXECUTE ON FUNCTION register_doctor_simple TO anon;