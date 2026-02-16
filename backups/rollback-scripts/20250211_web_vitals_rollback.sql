-- ============================================================
-- ROLLBACK SCRIPT: 20250211150000_web_vitals_metrics.sql
-- DoctorMX Database Migration Rollback
-- Web Vitals Metrics
-- Generated: 2026-02-16T09:42:35-06:00
-- ============================================================

BEGIN;

-- Verify migration was applied
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'web_vitals_metrics') THEN
        RAISE EXCEPTION 'Cannot rollback: web_vitals_metrics table does not exist';
    END IF;
END $$;

-- ============================================================
-- DROP POLICIES
-- ============================================================

ALTER TABLE IF EXISTS web_vitals_metrics DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service role inserts" ON web_vitals_metrics;
DROP POLICY IF EXISTS "Allow admin reads" ON web_vitals_metrics;

-- ============================================================
-- DROP INDEXES
-- ============================================================

DROP INDEX IF EXISTS idx_web_vitals_name;
DROP INDEX IF EXISTS idx_web_vitals_timestamp;
DROP INDEX IF EXISTS idx_web_vitals_page_path;
DROP INDEX IF EXISTS idx_web_vitals_rating;
DROP INDEX IF EXISTS idx_web_vitals_name_timestamp;

-- ============================================================
-- DROP TABLES
-- ============================================================

DROP TABLE IF EXISTS web_vitals_metrics CASCADE;

-- ============================================================
-- VERIFY ROLLBACK
-- ============================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'web_vitals_metrics') THEN
        RAISE EXCEPTION 'Rollback failed: web_vitals_metrics table still exists';
    END IF;
END $$;

COMMIT;

DO $$
BEGIN
    RAISE NOTICE 'Successfully rolled back 20250211150000_web_vitals_metrics.sql';
END $$;
