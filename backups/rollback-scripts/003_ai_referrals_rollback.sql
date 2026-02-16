-- ============================================================
-- ROLLBACK SCRIPT: 003_ai_referrals_tracking.sql
-- DoctorMX Database Migration Rollback
-- Generated: 2026-02-16T09:42:35-06:00
-- ============================================================

BEGIN;

-- ============================================================
-- DROP INDEXES
-- ============================================================

-- Drop AI referral indexes from appointments table
DROP INDEX IF EXISTS idx_appointments_consultation_id;
DROP INDEX IF EXISTS idx_appointments_ai_referral;

-- ============================================================
-- REMOVE COLUMNS (if they exist and no data depends on them)
-- ============================================================

-- Note: Dropping columns with data is dangerous
-- This only removes columns if they were added by this migration
-- ALTER TABLE appointments DROP COLUMN IF EXISTS consultation_id;
-- ALTER TABLE appointments DROP COLUMN IF EXISTS ai_referral;

-- Comment explaining why columns are not dropped:
-- The consultation_id and ai_referral columns in appointments table
-- are typically added by migration 003. However, dropping these columns
-- would result in DATA LOSS. If you need to remove these columns,
-- uncomment the lines above after ensuring no critical data depends on them.

COMMIT;

DO $$
BEGIN
    RAISE NOTICE 'Successfully rolled back 003_ai_referrals_tracking.sql';
    RAISE NOTICE 'Note: Columns consultation_id and ai_referral were not dropped to prevent data loss';
END $$;
