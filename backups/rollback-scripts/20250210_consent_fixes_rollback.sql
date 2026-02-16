-- ============================================================
-- ROLLBACK SCRIPT: 20250210_consent_system_fixes.sql
-- DoctorMX Database Migration Rollback
-- Consent System Fixes
-- Generated: 2026-02-16T09:42:35-06:00
-- ============================================================

BEGIN;

-- ============================================================
-- DROP POLICIES
-- ============================================================

ALTER TABLE IF EXISTS audit_logs DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can read all audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Service can insert audit logs" ON audit_logs;

-- ============================================================
-- DROP INDEXES
-- ============================================================

DROP INDEX IF EXISTS idx_audit_logs_category;
DROP INDEX IF EXISTS idx_audit_logs_event_type;
DROP INDEX IF EXISTS idx_audit_logs_occurred_at;
DROP INDEX IF EXISTS idx_audit_logs_user_id;
DROP INDEX IF EXISTS idx_audit_logs_resource_id;

-- Note: This migration creates/updates audit_logs table which is shared
-- with other migrations. We don't drop the table here.

COMMIT;

DO $$
BEGIN
    RAISE NOTICE 'Successfully rolled back 20250210_consent_system_fixes.sql';
END $$;
