-- ============================================================
-- ROLLBACK SCRIPT: 20250209_consent_system.sql
-- DoctorMX Database Migration Rollback
-- Consent Management System
-- Generated: 2026-02-16T09:42:35-06:00
-- CRITICAL: This contains legal consent records
-- ============================================================

BEGIN;

-- Verify migration was applied
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'consent_versions') THEN
        RAISE EXCEPTION 'Cannot rollback: consent_versions table does not exist';
    END IF;
END $$;

-- ============================================================
-- DROP POLICIES
-- ============================================================

ALTER TABLE IF EXISTS consent_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_consent_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS guardian_consent_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS consent_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS consent_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS consent_audit_logs DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active consent versions" ON consent_versions;
DROP POLICY IF EXISTS "Admins can manage consent versions" ON consent_versions;
DROP POLICY IF EXISTS "Users can read own consent records" ON user_consent_records;
DROP POLICY IF EXISTS "Users can insert own consent records" ON user_consent_records;
DROP POLICY IF EXISTS "Users can update own consent records" ON user_consent_records;
DROP POLICY IF EXISTS "Admins can manage all consent records" ON user_consent_records;
DROP POLICY IF EXISTS "Users can read own guardian records" ON guardian_consent_records;
DROP POLICY IF EXISTS "Admins can manage all guardian records" ON guardian_consent_records;
DROP POLICY IF EXISTS "Users can read own consent history" ON consent_history;
DROP POLICY IF EXISTS "Admins can read all consent history" ON consent_history;
DROP POLICY IF EXISTS "Users can read own consent requests" ON consent_requests;
DROP POLICY IF EXISTS "Users can update own consent requests" ON consent_requests;
DROP POLICY IF EXISTS "Admins can manage all consent requests" ON consent_requests;
DROP POLICY IF EXISTS "Users can read own consent audit logs" ON consent_audit_logs;
DROP POLICY IF EXISTS "Admins can read all consent audit logs" ON consent_audit_logs;
DROP POLICY IF EXISTS "System can insert consent audit logs" ON consent_audit_logs;

-- ============================================================
-- DROP INDEXES
-- ============================================================

DROP INDEX IF EXISTS idx_consent_versions_type;
DROP INDEX IF EXISTS idx_consent_versions_effective_date;
DROP INDEX IF EXISTS idx_consent_versions_deprecated_date;
DROP INDEX IF EXISTS idx_consent_versions_active;
DROP INDEX IF EXISTS idx_user_consent_user_id;
DROP INDEX IF EXISTS idx_user_consent_type;
DROP INDEX IF EXISTS idx_user_consent_status;
DROP INDEX IF EXISTS idx_user_consent_version_id;
DROP INDEX IF EXISTS idx_user_consent_expires_at;
DROP INDEX IF EXISTS idx_user_consent_granted_at;
DROP INDEX IF EXISTS idx_guardian_consent_user_id;
DROP INDEX IF EXISTS idx_guardian_consent_guardian_user_id;
DROP INDEX IF EXISTS idx_guardian_consent_status;
DROP INDEX IF EXISTS idx_consent_history_record_id;
DROP INDEX IF EXISTS idx_consent_history_user_id;
DROP INDEX IF EXISTS idx_consent_history_action;
DROP INDEX IF EXISTS idx_consent_history_created_at;
DROP INDEX IF EXISTS idx_consent_requests_user_id;
DROP INDEX IF EXISTS idx_consent_requests_status;
DROP INDEX IF EXISTS idx_consent_requests_type;
DROP INDEX IF EXISTS idx_consent_requests_expires_at;
DROP INDEX IF EXISTS idx_consent_requests_created_at;
DROP INDEX IF EXISTS idx_consent_audit_user_id;
DROP INDEX IF EXISTS idx_consent_audit_event_type;
DROP INDEX IF EXISTS idx_consent_audit_occurred_at;
DROP INDEX IF EXISTS idx_consent_audit_correlation_id;
DROP INDEX IF EXISTS idx_consent_audit_consent_type;
DROP INDEX IF EXISTS idx_user_consent_user_type_status;
DROP INDEX IF EXISTS idx_consent_history_user_action_date;

-- ============================================================
-- DROP TABLES (dependency order)
-- ============================================================

DROP TABLE IF EXISTS consent_audit_logs CASCADE;
DROP TABLE IF EXISTS consent_requests CASCADE;
DROP TABLE IF EXISTS consent_history CASCADE;
DROP TABLE IF EXISTS guardian_consent_records CASCADE;
DROP TABLE IF EXISTS user_consent_records CASCADE;
DROP TABLE IF EXISTS consent_versions CASCADE;

-- ============================================================
-- DROP TYPES
-- ============================================================

DROP TYPE IF EXISTS consent_audit_event_type CASCADE;
DROP TYPE IF EXISTS consent_history_action CASCADE;
DROP TYPE IF EXISTS consent_request_status CASCADE;
DROP TYPE IF EXISTS guardian_relationship CASCADE;
DROP TYPE IF EXISTS age_verification_status CASCADE;
DROP TYPE IF EXISTS consent_category CASCADE;
DROP TYPE IF EXISTS consent_delivery_method CASCADE;
DROP TYPE IF EXISTS consent_status CASCADE;
DROP TYPE IF EXISTS consent_type CASCADE;

-- ============================================================
-- VERIFY ROLLBACK
-- ============================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'consent_versions') THEN
        RAISE EXCEPTION 'Rollback failed: consent_versions table still exists';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_consent_records') THEN
        RAISE EXCEPTION 'Rollback failed: user_consent_records table still exists';
    END IF;
END $$;

COMMIT;

DO $$
BEGIN
    RAISE NOTICE 'Successfully rolled back 20250209_consent_system.sql';
    RAISE NOTICE 'WARNING: All consent records have been deleted';
END $$;
