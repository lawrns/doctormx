-- ============================================================
-- ROLLBACK SCRIPT: 20250209_security_events.sql
-- DoctorMX Database Migration Rollback
-- Security Events System
-- Generated: 2026-02-16T09:42:35-06:00
-- ============================================================

BEGIN;

-- Verify migration was applied
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'security_events') THEN
        RAISE EXCEPTION 'Cannot rollback: security_events table does not exist';
    END IF;
END $$;

-- ============================================================
-- DROP POLICIES
-- ============================================================

ALTER TABLE IF EXISTS security_events DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can insert security events" ON security_events;
DROP POLICY IF EXISTS "Service role can view all security events" ON security_events;
DROP POLICY IF EXISTS "Users can view own security events" ON security_events;

-- ============================================================
-- DROP INDEXES
-- ============================================================

DROP INDEX IF EXISTS idx_security_events_user_created;
DROP INDEX IF EXISTS idx_security_events_event_type;
DROP INDEX IF EXISTS idx_security_events_ip_address;

-- ============================================================
-- DROP TABLES
-- ============================================================

DROP TABLE IF EXISTS security_events CASCADE;

-- ============================================================
-- VERIFY ROLLBACK
-- ============================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'security_events') THEN
        RAISE EXCEPTION 'Rollback failed: security_events table still exists';
    END IF;
END $$;

COMMIT;

DO $$
BEGIN
    RAISE NOTICE 'Successfully rolled back 20250209_security_events.sql';
END $$;
