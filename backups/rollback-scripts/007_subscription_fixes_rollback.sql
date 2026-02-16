-- ============================================================
-- ROLLBACK SCRIPT: 007_fix_subscription_tables.sql
-- DoctorMX Database Migration Rollback
-- Generated: 2026-02-16T09:42:35-06:00
-- ============================================================

BEGIN;

-- ============================================================
-- DROP POLICIES
-- ============================================================

ALTER TABLE IF EXISTS doctor_subscription_usage DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors can view their own usage" ON doctor_subscription_usage;
DROP POLICY IF EXISTS "Service role can manage usage" ON doctor_subscription_usage;

-- ============================================================
-- DROP INDEXES
-- ============================================================

DROP INDEX IF EXISTS idx_doctor_subscription_usage_doctor_id;
DROP INDEX IF EXISTS idx_doctor_subscription_usage_period;
DROP INDEX IF EXISTS idx_doctor_subscriptions_doctor_id;
DROP INDEX IF EXISTS idx_doctor_subscriptions_stripe_sub_id;
DROP INDEX IF EXISTS idx_doctor_subscriptions_status;

-- ============================================================
-- DROP TABLES
-- ============================================================

DROP TABLE IF EXISTS doctor_subscription_usage CASCADE;

COMMIT;

DO $$
BEGIN
    RAISE NOTICE 'Successfully rolled back 007_fix_subscription_tables.sql';
END $$;
