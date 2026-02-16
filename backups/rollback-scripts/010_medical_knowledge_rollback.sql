-- ============================================================
-- ROLLBACK SCRIPT: 010_medical_knowledge_rag.sql
-- DoctorMX Database Migration Rollback
-- Generated: 2026-02-16T09:42:35-06:00
-- ============================================================

BEGIN;

-- Verify migration was applied
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'medical_knowledge') THEN
        RAISE EXCEPTION 'Cannot rollback: medical_knowledge table does not exist';
    END IF;
END $$;

-- ============================================================
-- DROP POLICIES
-- ============================================================

ALTER TABLE IF EXISTS medical_knowledge DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can do all operations on medical_knowledge" ON medical_knowledge;
DROP POLICY IF EXISTS "Service role can read medical_knowledge" ON medical_knowledge;

-- ============================================================
-- DROP INDEXES
-- ============================================================

DROP INDEX IF EXISTS idx_medical_knowledge_specialty;
DROP INDEX IF EXISTS idx_medical_knowledge_source;
DROP INDEX IF EXISTS idx_medical_knowledge_created;
DROP INDEX IF EXISTS idx_medical_knowledge_metadata_gin;

-- ============================================================
-- DROP TABLES
-- ============================================================

DROP TABLE IF EXISTS medical_knowledge CASCADE;

-- ============================================================
-- VERIFY ROLLBACK
-- ============================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'medical_knowledge') THEN
        RAISE EXCEPTION 'Rollback failed: medical_knowledge table still exists';
    END IF;
END $$;

COMMIT;

DO $$
BEGIN
    RAISE NOTICE 'Successfully rolled back 010_medical_knowledge_rag.sql';
END $$;
