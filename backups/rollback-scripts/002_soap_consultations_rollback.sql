-- ============================================================
-- ROLLBACK SCRIPT: 002_soap_consultations.sql
-- DoctorMX Database Migration Rollback
-- Generated: 2026-02-16T09:42:35-06:00
-- ============================================================

BEGIN;

-- Verify migration was applied
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'soap_consultations') THEN
        RAISE EXCEPTION 'Cannot rollback: soap_consultations table does not exist';
    END IF;
END $$;

-- ============================================================
-- DROP VIEWS
-- ============================================================

DROP VIEW IF EXISTS soap_consultation_summary;

-- ============================================================
-- DROP TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS soap_consultations_updated_at ON soap_consultations;

-- ============================================================
-- DROP FUNCTIONS
-- ============================================================

DROP FUNCTION IF EXISTS update_soap_consultation_timestamp();

-- ============================================================
-- DROP POLICIES
-- ============================================================

ALTER TABLE IF EXISTS soap_consultations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS soap_specialist_assessments DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients can view their own consultations" ON soap_consultations;
DROP POLICY IF EXISTS "Patients can create their own consultations" ON soap_consultations;
DROP POLICY IF EXISTS "Users can update their own consultations" ON soap_consultations;
DROP POLICY IF EXISTS "Doctors and admins can view specialist assessments" ON soap_specialist_assessments;
DROP POLICY IF EXISTS "Service role can insert specialist assessments" ON soap_specialist_assessments;

-- ============================================================
-- DROP INDEXES
-- ============================================================

DROP INDEX IF EXISTS idx_soap_consultations_patient_id;
DROP INDEX IF EXISTS idx_soap_consultations_status;
DROP INDEX IF EXISTS idx_soap_consultations_created_at;
DROP INDEX IF EXISTS idx_soap_specialist_assessments_consultation_id;
DROP INDEX IF EXISTS idx_soap_specialist_assessments_specialist_role;

-- ============================================================
-- DROP TABLES
-- ============================================================

DROP TABLE IF EXISTS soap_specialist_assessments CASCADE;
DROP TABLE IF EXISTS soap_consultations CASCADE;

-- ============================================================
-- DROP TYPES
-- ============================================================

DROP TYPE IF EXISTS soap_specialist_role CASCADE;
DROP TYPE IF EXISTS soap_urgency_level CASCADE;
DROP TYPE IF EXISTS soap_consultation_status CASCADE;

-- ============================================================
-- VERIFY ROLLBACK
-- ============================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'soap_consultations') THEN
        RAISE EXCEPTION 'Rollback failed: soap_consultations table still exists';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'soap_specialist_assessments') THEN
        RAISE EXCEPTION 'Rollback failed: soap_specialist_assessments table still exists';
    END IF;
END $$;

COMMIT;

DO $$
BEGIN
    RAISE NOTICE 'Successfully rolled back 002_soap_consultations.sql';
END $$;
