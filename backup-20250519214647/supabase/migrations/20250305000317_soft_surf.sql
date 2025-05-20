/*
  # Fix Admin RLS Policies

  1. Changes
    - Simplify RLS policies to avoid recursion
    - Update auth user linking
    - Add proper role-based access
    
  2. Security
    - Enable RLS
    - Add non-recursive policies
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

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage all users" ON admin_users;

-- Create new simplified policies
CREATE POLICY "Enable read access for authenticated users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable write access for super admins"
  ON admin_users
  FOR ALL 
  TO authenticated
  USING (
    role = 'super_admin'
  );

-- Create index on auth_id for better performance
CREATE INDEX IF NOT EXISTS admin_users_auth_id_idx ON admin_users(auth_id);