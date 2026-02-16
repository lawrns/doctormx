-- ============================================================
-- ROLLBACK SCRIPT: 008_performance_indexes.sql
-- DoctorMX Database Migration Rollback
-- Generated: 2026-02-16T09:42:35-06:00
-- ============================================================

BEGIN;

-- ============================================================
-- DROP INDEXES
-- ============================================================

DROP INDEX IF EXISTS idx_appointments_doctor_start;
DROP INDEX IF EXISTS idx_appointments_patient_start;
DROP INDEX IF EXISTS idx_chat_messages_conversation_created;
DROP INDEX IF EXISTS idx_profiles_role_created;
DROP INDEX IF EXISTS idx_medical_images_patient_created;
DROP INDEX IF EXISTS idx_chat_receipts_message_user;

COMMIT;

DO $$
BEGIN
    RAISE NOTICE 'Successfully rolled back 008_performance_indexes.sql';
END $$;
