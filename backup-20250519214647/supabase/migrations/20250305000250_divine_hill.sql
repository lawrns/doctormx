/*
  # Fix Admin Authentication

  1. Changes
    - Create auth user for admin
    - Link admin_users with auth.users
    - Update RLS policies
    
  2. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Create auth user for admin if not exists
DO $$
DECLARE
  auth_user_id uuid;
BEGIN
  -- First check if auth user already exists
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = 'admin@doctor.mx'
  LIMIT 1;

  -- If auth user doesn't exist, create it
  IF auth_user_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@doctor.mx',
      crypt('changeme123', gen_salt('bf')),
      now(),
      now(),
      now()
    )
    RETURNING id INTO auth_user_id;
  END IF;

  -- Update admin user with auth_id
  UPDATE admin_users
  SET auth_id = auth_user_id
  WHERE email = 'admin@doctor.mx';
END $$;

-- Update RLS policies
DROP POLICY IF EXISTS "Admins can view their own profile" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage all admin users" ON admin_users;

-- Allow authenticated users to view their own profile
CREATE POLICY "Users can view their own profile"
  ON admin_users
  FOR SELECT
  USING (auth.uid() = auth_id);

-- Allow super_admins to manage all users
CREATE POLICY "Super admins can manage all users"
  ON admin_users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE auth_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Create index on auth_id for better performance
CREATE INDEX IF NOT EXISTS admin_users_auth_id_idx ON admin_users(auth_id);