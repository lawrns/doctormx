-- ============================================================
-- ROLLBACK SCRIPT: 004_whatsapp_tables.sql
-- DoctorMX Database Migration Rollback
-- Generated: 2026-02-16T09:42:35-06:00
-- ============================================================

BEGIN;

-- Verify migration was applied
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'whatsapp_sessions') THEN
        RAISE EXCEPTION 'Cannot rollback: whatsapp_sessions table does not exist';
    END IF;
END $$;

-- ============================================================
-- DROP POLICIES
-- ============================================================

ALTER TABLE IF EXISTS whatsapp_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS whatsapp_messages DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage sessions" ON whatsapp_sessions;
DROP POLICY IF EXISTS "Admins manage messages" ON whatsapp_messages;

-- ============================================================
-- DROP INDEXES
-- ============================================================

DROP INDEX IF EXISTS idx_whatsapp_sessions_phone;
DROP INDEX IF EXISTS idx_whatsapp_messages_session;

-- ============================================================
-- DROP TABLES
-- ============================================================

DROP TABLE IF EXISTS whatsapp_messages CASCADE;
DROP TABLE IF EXISTS whatsapp_sessions CASCADE;

-- ============================================================
-- VERIFY ROLLBACK
-- ============================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'whatsapp_sessions') THEN
        RAISE EXCEPTION 'Rollback failed: whatsapp_sessions table still exists';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'whatsapp_messages') THEN
        RAISE EXCEPTION 'Rollback failed: whatsapp_messages table still exists';
    END IF;
END $$;

COMMIT;

DO $$
BEGIN
    RAISE NOTICE 'Successfully rolled back 004_whatsapp_tables.sql';
END $$;
