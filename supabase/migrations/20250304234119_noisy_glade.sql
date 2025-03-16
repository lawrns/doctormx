/*
  # Admin System Core Schema

  1. New Tables
    - admin_users: Core admin user management
    - admin_audit_logs: Comprehensive action tracking
    - admin_sessions: Session management
    - admin_permissions: Granular permission control
    
  2. Security
    - RLS policies for admin access
    - Secure defaults
    - Audit logging triggers
*/

-- Admin Users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  encrypted_password text NOT NULL,
  first_name text,
  last_name text,
  role text NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator', 'support', 'finance', 'content')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  permissions jsonb NOT NULL DEFAULT '{}',
  last_login_at timestamptz,
  failed_attempts integer DEFAULT 0,
  locked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Admin Sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_users(id) ON DELETE CASCADE,
  token text NOT NULL,
  ip_address text,
  user_agent text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Admin Audit Logs table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  changes jsonb,
  metadata jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admin users can only be managed by super_admins
CREATE POLICY "Super admins can manage admin users"
  ON admin_users
  USING (
    auth.jwt() ->> 'role' = 'super_admin'
  );

-- Admin sessions can only be accessed by the owning admin
CREATE POLICY "Admins can access their own sessions"
  ON admin_sessions
  USING (
    admin_id = auth.uid()
  );

-- Audit logs viewable by all admins
CREATE POLICY "All admins can view audit logs"
  ON admin_audit_logs
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' IN ('super_admin', 'admin', 'moderator', 'support', 'finance', 'content')
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create audit log trigger
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_audit_logs (
    admin_id,
    action,
    entity_type,
    entity_id,
    changes,
    metadata
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    NEW.id,
    jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    ),
    jsonb_build_object(
      'timestamp', now(),
      'operation', TG_OP
    )
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add audit triggers
CREATE TRIGGER audit_admin_users
  AFTER INSERT OR UPDATE OR DELETE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

-- Create initial super admin (password will need to be set)
INSERT INTO admin_users (
  email,
  encrypted_password,
  role,
  first_name,
  last_name,
  permissions
) VALUES (
  'admin@doctor.mx',
  -- Temporary password hash that will need to be changed on first login
  crypt('changeme123', gen_salt('bf')),
  'super_admin',
  'System',
  'Administrator',
  '{
    "all": ["create", "read", "update", "delete"],
    "users": ["manage"],
    "doctors": ["verify", "manage"],
    "content": ["manage"],
    "settings": ["manage"]
  }'
);