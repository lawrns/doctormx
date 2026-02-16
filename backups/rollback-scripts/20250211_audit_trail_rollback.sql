-- ============================================================
-- ROLLBACK SCRIPT: 20250211_immutable_audit_trail.sql
-- DoctorMX Database Migration Rollback
-- Immutable Audit Trail
-- Generated: 2026-02-16T09:42:35-06:00
-- CRITICAL: This contains compliance audit data
-- ============================================================

BEGIN;

-- ============================================================
-- DROP POLICIES
-- ============================================================

ALTER TABLE IF EXISTS audit_logs DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Service role can insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "No updates to audit logs" ON audit_logs;
DROP POLICY IF EXISTS "No deletes to audit logs" ON audit_logs;

-- ============================================================
-- DROP INDEXES
-- ============================================================

DROP INDEX IF EXISTS idx_audit_logs_category;
DROP INDEX IF EXISTS idx_audit_logs_event_type;
DROP INDEX IF EXISTS idx_audit_logs_actor_user_id;
DROP INDEX IF EXISTS idx_audit_logs_resource_type;
DROP INDEX IF EXISTS idx_audit_logs_occurred_at;
DROP INDEX IF EXISTS idx_audit_logs_created_at;
DROP INDEX IF EXISTS idx_audit_logs_sequence_number;
DROP INDEX IF EXISTS idx_audit_logs_previous_hash;
DROP INDEX IF EXISTS idx_audit_logs_retention;

-- ============================================================
-- DROP TABLES
-- ============================================================

DROP TABLE IF EXISTS audit_logs CASCADE;

-- ============================================================
-- VERIFY ROLLBACK
-- ============================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
        RAISE EXCEPTION 'Rollback failed: audit_logs table still exists';
    END IF;
END $$;

COMMIT;

DO $$
BEGIN
    RAISE NOTICE 'Successfully rolled back 20250211_immutable_audit_trail.sql';
    RAISE NOTICE 'WARNING: All audit logs have been deleted';
END $$;
