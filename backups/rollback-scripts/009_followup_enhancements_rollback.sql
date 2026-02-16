-- ============================================================
-- ROLLBACK SCRIPT: 009_followup_enhancements.sql
-- DoctorMX Database Migration Rollback
-- Generated: 2026-02-16T09:42:35-06:00
-- ============================================================

BEGIN;

-- Verify migration was applied
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'followup_audit') THEN
        RAISE EXCEPTION 'Cannot rollback: followup_audit table does not exist';
    END IF;
END $$;

-- ============================================================
-- DROP POLICIES
-- ============================================================

ALTER TABLE IF EXISTS followup_audit DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS followup_opt_outs DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own followup audit" ON followup_audit;
DROP POLICY IF EXISTS "Service role can insert audit" ON followup_audit;
DROP POLICY IF EXISTS "Patients can view own opt-outs" ON followup_opt_outs;
DROP POLICY IF EXISTS "Patients can manage own opt-outs" ON followup_opt_outs;
DROP POLICY IF EXISTS "Service role can manage opt-outs" ON followup_opt_outs;

-- ============================================================
-- DROP INDEXES
-- ============================================================

DROP INDEX IF EXISTS idx_followups_retry;
DROP INDEX IF EXISTS idx_followups_status_retry;
DROP INDEX IF EXISTS idx_followup_audit_followup;
DROP INDEX IF EXISTS idx_followup_audit_created;
DROP INDEX IF EXISTS idx_followup_opt_outs_patient;

-- ============================================================
-- DROP TABLES
-- ============================================================

DROP TABLE IF EXISTS followup_audit CASCADE;
DROP TABLE IF EXISTS followup_opt_outs CASCADE;

-- Note: Columns added to followups table are not dropped to prevent data loss
-- ALTER TABLE followups DROP COLUMN IF EXISTS next_retry_at;
-- ALTER TABLE followups DROP COLUMN IF EXISTS retry_count;
-- ALTER TABLE followups DROP COLUMN IF EXISTS max_retries;
-- ALTER TABLE followups DROP COLUMN IF EXISTS channel;

COMMIT;

DO $$
BEGIN
    RAISE NOTICE 'Successfully rolled back 009_followup_enhancements.sql';
END $$;
