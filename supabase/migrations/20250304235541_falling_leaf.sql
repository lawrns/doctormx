-- Enable Supabase Auth for admin users
ALTER TABLE admin_users
ADD COLUMN auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update admin_sessions table
ALTER TABLE admin_sessions
ADD COLUMN auth_token text NOT NULL;

-- Create function to hash passwords
CREATE OR REPLACE FUNCTION hash_password(password text)
RETURNS text AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(password text, hashed_password text)
RETURNS boolean AS $$
BEGIN
  RETURN hashed_password = crypt(password, hashed_password);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update admin_users policies
DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;

CREATE POLICY "Admins can view their own profile"
  ON admin_users
  FOR SELECT
  USING (
    auth.uid() = auth_id
  );

CREATE POLICY "Super admins can manage all admin users"
  ON admin_users
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE auth_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Update admin_sessions policies
DROP POLICY IF EXISTS "Admins can access their own sessions" ON admin_sessions;

CREATE POLICY "Admins can manage their own sessions"
  ON admin_sessions
  USING (
    admin_id IN (
      SELECT id FROM admin_users
      WHERE auth_id = auth.uid()
    )
  );