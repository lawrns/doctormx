-- ============================================================
-- ROLLBACK SCRIPT: 20250209_arco_system.sql
-- DoctorMX Database Migration Rollback
-- ARCO Rights System (Data Protection)
-- Generated: 2026-02-16T09:42:35-06:00
-- CRITICAL: This contains audit data for legal compliance
-- ============================================================

BEGIN;

-- Verify migration was applied
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'arco_requests') THEN
        RAISE EXCEPTION 'Cannot rollback: arco_requests table does not exist';
    END IF;
END $$;

-- ============================================================
-- DROP VIEWS
-- ============================================================

DROP VIEW IF EXISTS arco_requests_dashboard;
DROP VIEW IF EXISTS arco_sla_compliance;

-- ============================================================
-- DROP TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS trigger_set_arco_due_date ON arco_requests;
DROP TRIGGER IF EXISTS trigger_update_arco_updated_at ON arco_requests;
DROP TRIGGER IF EXISTS trigger_update_privacy_prefs_updated_at ON privacy_preferences;

-- ============================================================
-- DROP FUNCTIONS
-- ============================================================

DROP FUNCTION IF EXISTS calculate_business_days(TIMESTAMPTZ, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS calculate_arco_due_date(TIMESTAMPTZ);
DROP FUNCTION IF EXISTS set_arco_due_date();
DROP FUNCTION IF EXISTS update_arco_updated_at();

-- ============================================================
-- DROP POLICIES
-- ============================================================

ALTER TABLE IF EXISTS arco_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS arco_request_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS arco_attachments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS arco_communications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS data_amendments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS data_deletions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS privacy_preferences DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own ARCO requests" ON arco_requests;
DROP POLICY IF EXISTS "Admins can view all ARCO requests" ON arco_requests;
DROP POLICY IF EXISTS "Users can create ARCO requests" ON arco_requests;
DROP POLICY IF EXISTS "Admins can update ARCO requests" ON arco_requests;
DROP POLICY IF EXISTS "Users can view history for their requests" ON arco_request_history;
DROP POLICY IF EXISTS "Admins can view all ARCO history" ON arco_request_history;
DROP POLICY IF EXISTS "Users can view attachments for their requests" ON arco_attachments;
DROP POLICY IF EXISTS "Users can upload attachments to their requests" ON arco_attachments;
DROP POLICY IF EXISTS "Admins can manage all ARCO attachments" ON arco_attachments;
DROP POLICY IF EXISTS "Users can view communications for their requests" ON arco_communications;
DROP POLICY IF EXISTS "Admins can manage all ARCO communications" ON arco_communications;
DROP POLICY IF EXISTS "Users can view amendments for their requests" ON data_amendments;
DROP POLICY IF EXISTS "Admins can manage all data amendments" ON data_amendments;
DROP POLICY IF EXISTS "Users can view deletions for their requests" ON data_deletions;
DROP POLICY IF EXISTS "Admins can manage all data deletions" ON data_deletions;
DROP POLICY IF EXISTS "Users can view and update their own privacy preferences" ON privacy_preferences;
DROP POLICY IF EXISTS "Admins can view all privacy preferences" ON privacy_preferences;

-- ============================================================
-- DROP INDEXES
-- ============================================================

DROP INDEX IF EXISTS idx_arco_requests_user_id;
DROP INDEX IF EXISTS idx_arco_requests_status;
DROP INDEX IF EXISTS idx_arco_requests_type;
DROP INDEX IF EXISTS idx_arco_requests_due_date;
DROP INDEX IF EXISTS idx_arco_requests_created_at;
DROP INDEX IF EXISTS idx_arco_requests_assigned_to;
DROP INDEX IF EXISTS idx_arco_requests_escalation;
DROP INDEX IF EXISTS idx_arco_requests_priority;
DROP INDEX IF EXISTS idx_arco_history_request_id;
DROP INDEX IF EXISTS idx_arco_history_created_at;
DROP INDEX IF EXISTS idx_arco_attachments_request_id;
DROP INDEX IF EXISTS idx_arco_communications_request_id;
DROP INDEX IF EXISTS idx_arco_communications_created_at;
DROP INDEX IF EXISTS idx_amendments_request_id;
DROP INDEX IF EXISTS idx_amendments_table_record;
DROP INDEX IF EXISTS idx_amendments_requested_by;
DROP INDEX IF EXISTS idx_deletions_request_id;
DROP INDEX IF EXISTS idx_deletions_table_record;
DROP INDEX IF EXISTS idx_privacy_prefs_user_id;

-- ============================================================
-- DROP TABLES (dependency order)
-- ============================================================

DROP TABLE IF EXISTS data_deletions CASCADE;
DROP TABLE IF EXISTS data_amendments CASCADE;
DROP TABLE IF EXISTS arco_communications CASCADE;
DROP TABLE IF EXISTS arco_attachments CASCADE;
DROP TABLE IF EXISTS arco_request_history CASCADE;
DROP TABLE IF EXISTS privacy_preferences CASCADE;
DROP TABLE IF EXISTS arco_requests CASCADE;

-- ============================================================
-- DROP TYPES
-- ============================================================

DROP TYPE IF EXISTS escalation_level CASCADE;
DROP TYPE IF EXISTS arco_request_status CASCADE;
DROP TYPE IF EXISTS arco_request_type CASCADE;

-- ============================================================
-- VERIFY ROLLBACK
-- ============================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'arco_requests') THEN
        RAISE EXCEPTION 'Rollback failed: arco_requests table still exists';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'privacy_preferences') THEN
        RAISE EXCEPTION 'Rollback failed: privacy_preferences table still exists';
    END IF;
END $$;

COMMIT;

DO $$
BEGIN
    RAISE NOTICE 'Successfully rolled back 20250209_arco_system.sql';
    RAISE NOTICE 'WARNING: All ARCO request data has been deleted';
END $$;
