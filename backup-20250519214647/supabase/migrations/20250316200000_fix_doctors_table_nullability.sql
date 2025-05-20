/*
  # Additional fixes for the doctors table
  
  1. Ensure nullable columns have proper default values
  2. Modify columns that might be causing issues during registration
*/

-- Ensure all potentially problematic columns have defaults or are nullable
ALTER TABLE doctors 
  ALTER COLUMN image DROP NOT NULL,
  ALTER COLUMN bio DROP NOT NULL,
  ALTER COLUMN address DROP NOT NULL,
  ALTER COLUMN location DROP NOT NULL;

-- Some columns might have NOT NULL constraints but no defaults
-- Let's make sure they have defaults if they're required
ALTER TABLE doctors 
  ALTER COLUMN specialty SET DEFAULT '',
  ALTER COLUMN is_verified SET DEFAULT false,
  ALTER COLUMN is_accepting_patients SET DEFAULT true,
  ALTER COLUMN telemedicine_available SET DEFAULT true,
  ALTER COLUMN in_person_available SET DEFAULT true;

-- Make email column nullable to avoid potential uniqueness issues
ALTER TABLE doctors 
  ALTER COLUMN email DROP NOT NULL;

-- Ensure our new connect program fields are properly nullable
ALTER TABLE doctors 
  ALTER COLUMN joined_via_referral SET DEFAULT false,
  ALTER COLUMN referral_id DROP NOT NULL,
  ALTER COLUMN is_premium SET DEFAULT false,
  ALTER COLUMN premium_until DROP NOT NULL;

-- Add policy to allow admins to insert doctor profiles (in case we need to do it manually)
CREATE POLICY "Admin can manage doctor profiles"
  ON doctors
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_app_meta_data->>'role' = 'admin'
  ));
