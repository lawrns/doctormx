-- Migration: Security Events Table
-- Purpose: Track security events for session management and audit trails
-- Created: 2025-02-09

-- Create security_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('password_change', 'suspicious_activity', 'role_change')),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient queries by user and creation time
CREATE INDEX IF NOT EXISTS idx_security_events_user_created
  ON security_events(user_id, created_at DESC);

-- Create index for event type filtering
CREATE INDEX IF NOT EXISTS idx_security_events_event_type
  ON security_events(event_type);

-- Create index for IP address lookups (useful for security analysis)
CREATE INDEX IF NOT EXISTS idx_security_events_ip_address
  ON security_events(ip_address) WHERE ip_address IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can insert security events
CREATE POLICY "Service role can insert security events"
  ON security_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Service role can view all security events
CREATE POLICY "Service role can view all security events"
  ON security_events
  FOR SELECT
  TO service_role
  USING (true);

-- Policy: Users can view their own security events (read-only audit)
CREATE POLICY "Users can view own security events"
  ON security_events
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Add comment for documentation
COMMENT ON TABLE security_events IS '
  Tracks security-related events for session management and audit purposes.
  Events include password changes, suspicious activity detection, and role changes.
  This table supports automatic session invalidation on security events.
';

COMMENT ON COLUMN security_events.event_type IS '
  Type of security event:
  - password_change: User changed their password (invalidates all sessions)
  - suspicious_activity: Potential security threat detected (may invalidate sessions)
  - role_change: User role was modified (invalidates all sessions)
';

COMMENT ON COLUMN security_events.metadata IS '
  Additional context about the security event in JSON format.
  Can include timestamp, source, and other relevant information.
';
