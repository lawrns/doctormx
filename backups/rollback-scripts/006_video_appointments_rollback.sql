-- ============================================================
-- ROLLBACK SCRIPT: 006_add_video_appointments.sql
-- DoctorMX Database Migration Rollback
-- Generated: 2026-02-16T09:42:35-06:00
-- ============================================================

BEGIN;

-- ============================================================
-- DROP INDEXES
-- ============================================================

DROP INDEX IF EXISTS idx_appointments_video_status;
DROP INDEX IF EXISTS idx_appointments_type;
DROP INDEX IF EXISTS idx_appointments_patient_video;

-- Note: This migration adds columns to appointments table
-- Columns are NOT dropped to prevent data loss
-- ALTER TABLE appointments DROP COLUMN IF EXISTS video_status;
-- ALTER TABLE appointments DROP COLUMN IF EXISTS appointment_type;

COMMIT;

DO $$
BEGIN
    RAISE NOTICE 'Successfully rolled back 006_add_video_appointments.sql';
    RAISE NOTICE 'Note: Columns were not dropped to prevent data loss';
END $$;
