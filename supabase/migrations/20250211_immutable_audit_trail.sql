-- Migration: Immutable Audit Trail System
-- Description: Creates cryptographically secure, tamper-evident audit logs
-- Compliance: NOM-004-SSA3-2012 (5-year retention), LFPDPPP
-- Version: 1.0.0

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Audit event classification (from unified audit types)
  category TEXT NOT NULL CHECK (category IN (
    'auth', 'data_access', 'data_modification', 'data_deletion',
    'signature', 'certificate', 'consent', 'arco',
    'security', 'system', 'compliance'
  )),

  event_type TEXT NOT NULL,

  -- Timestamp information
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Actor information (who performed the action)
  actor JSONB NOT NULL DEFAULT '{
    "user_id": null,
    "role": null,
    "user_name": null,
    "type": "system"
  }'::jsonb,

  -- Resource information (what was affected)
  resource JSONB NOT NULL DEFAULT '{
    "type": null,
    "id": null,
    "name": null
  }'::jsonb,

  -- Event outcome
  outcome JSONB NOT NULL DEFAULT '{
    "status": "success",
    "status_code": null,
    "error_message": null,
    "error_code": null,
    "details": {}
  }'::jsonb,

  -- Cryptographic integrity (immutability)
  hash TEXT NOT NULL,
  previous_hash TEXT,
  sequence_number BIGINT NOT NULL,
  signature TEXT,

  -- Request metadata
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  request_id TEXT,

  -- Additional event data
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Retention management
  archived_at TIMESTAMP WITH TIME ZONE,
  archived_reason TEXT,

  -- Constraints
  CONSTRAINT audit_logs_hash_not_null CHECK (hash IS NOT NULL),
  CONSTRAINT audit_logs_sequence_positive CHECK (sequence_number >= 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON audit_logs(category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_user_id ON audit_logs((actor->>'user_id'));
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs((resource->>'type'));
CREATE INDEX IF NOT EXISTS idx_audit_logs_occurred_at ON audit_logs(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_sequence_number ON audit_logs(sequence_number ASC);

-- Unique index on sequence number for integrity
CREATE UNIQUE INDEX IF NOT EXISTS idx_audit_logs_sequence_unique ON audit_logs(sequence_number);

-- Index for hash chain traversal
CREATE INDEX IF NOT EXISTS idx_audit_logs_previous_hash ON audit_logs(previous_hash) WHERE previous_hash IS NOT NULL;

-- Index for retention queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_retention ON audit_logs(created_at) WHERE archived_at IS NULL;

-- RLS (Row Level Security)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Everyone can read audit logs (for compliance)
CREATE POLICY "Anyone can read audit logs" ON audit_logs
  FOR SELECT USING (true);

-- Only service role can insert audit logs (prevents tampering)
CREATE POLICY "Service role can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- No one can update audit logs (immutable)
CREATE POLICY "No updates to audit logs" ON audit_logs
  FOR UPDATE USING (false);

-- No one can delete audit logs (use archival instead)
CREATE POLICY "No deletes to audit logs" ON audit_logs
  FOR DELETE USING (false);

-- Function to get next sequence number
CREATE OR REPLACE FUNCTION get_next_audit_sequence()
RETURNS BIGINT AS $$
DECLARE
  last_seq BIGINT;
BEGIN
  SELECT COALESCE(MAX(sequence_number), 0) INTO last_seq
  FROM audit_logs
  FOR UPDATE OF audit_logs;

  RETURN last_seq + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify audit log integrity
CREATE OR REPLACE FUNCTION verify_audit_integrity(
  p_limit INTEGER DEFAULT NULL
)
RETURNS TABLE (
  is_intact BOOLEAN,
  total_logs BIGINT,
  first_tampered_id UUID,
  first_tampered_seq BIGINT,
  expected_hash TEXT,
  actual_hash TEXT
) AS $$
DECLARE
  log_record RECORD;
  expected_hash TEXT;
  actual_hash TEXT;
  prev_hash TEXT := NULL;
  log_count BIGINT := 0;
  is_intact BOOLEAN := TRUE;
  first_tampered_id UUID := NULL;
  first_tampered_seq BIGINT := NULL;

  cursor_logs CURSOR FOR
    SELECT *
    FROM audit_logs
    ORDER BY sequence_number ASC
    LIMIT p_limit;
BEGIN
  OPEN cursor_logs;

  LOOP
    FETCH cursor_logs INTO log_record;
    EXIT WHEN NOT FOUND;

    log_count := log_count + 1;

    -- Verify previous hash chain
    IF prev_hash IS NOT NULL AND log_record.previous_hash != prev_hash THEN
      is_intact := FALSE;
      first_tampered_id := log_record.id;
      first_tampered_seq := log_record.sequence_number;
      EXIT; -- Exit on first tamper detection
    END IF;

    -- Verify content hash
    -- Note: This is a simplified check. Production should use pgcrypto
    SELECT encode(sha256(
      log_record.id::text ||
      log_record.category ||
      log_record.event_type ||
      log_record.occurred_at::text ||
      log_record.actor ||
      log_record.resource ||
      log_record.outcome ||
      COALESCE(log_record.previous_hash, 'genesis') ||
      log_record.sequence_number::text
    ), 'hex')
    INTO expected_hash;

    actual_hash := log_record.hash;

    IF expected_hash != actual_hash THEN
      is_intact := FALSE;
      first_tampered_id := log_record.id;
      first_tampered_seq := log_record.sequence_number;
      EXIT; -- Exit on first tamper detection
    END IF;

    prev_hash := log_record.hash;
  END LOOP;

  CLOSE cursor_logs;

  RETURN QUERY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON audit_logs TO service_role;
GRANT EXECUTE ON FUNCTION get_next_audit_sequence() TO service_role;
GRANT EXECUTE ON FUNCTION verify_audit_integrity(INTEGER) TO service_role;

-- Comment for documentation
COMMENT ON TABLE audit_logs IS '
Immutable audit trail with cryptographic hash chain for tamper evidence.
Compliant with NOM-004-SSA3-2012 (5-year retention) and LFPDPPP.

Security features:
- Hash chain ensures any tampering is detectable
- Sequential numbering prevents log insertion
- RLS prevents unauthorized modifications
- No UPDATE or DELETE allowed (only archival)
';

COMMENT ON COLUMN audit_logs.hash IS 'SHA-256 hash of log entry for tamper detection';
COMMENT ON COLUMN audit_logs.previous_hash IS 'Previous log hash in the integrity chain';
COMMENT ON COLUMN audit_logs.sequence_number IS 'Sequential number for ordering and integrity';
COMMENT ON COLUMN audit_logs.signature IS 'Optional digital signature for non-repudiation';
