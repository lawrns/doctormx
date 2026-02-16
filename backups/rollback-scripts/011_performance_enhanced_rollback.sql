-- ============================================================
-- ROLLBACK SCRIPT: 011_performance_indexes_enhanced.sql
-- DoctorMX Database Migration Rollback
-- Generated: 2026-02-16T09:42:35-06:00
-- ============================================================

BEGIN;

-- ============================================================
-- DROP INDEXES
-- ============================================================

DROP INDEX IF EXISTS idx_reviews_doctor_created;
DROP INDEX IF EXISTS idx_reviews_appointment_id;
DROP INDEX IF EXISTS idx_reviews_patient_id;
DROP INDEX IF EXISTS idx_reviews_appointment_patient;
DROP INDEX IF EXISTS idx_payments_status_created;
DROP INDEX IF EXISTS idx_payments_appointment_status;
DROP INDEX IF EXISTS idx_payments_status_amount;
DROP INDEX IF EXISTS idx_appointments_status_start;
DROP INDEX IF EXISTS idx_appointments_doctor_status_start;
DROP INDEX IF EXISTS idx_appointments_patient_status_start;
DROP INDEX IF EXISTS idx_appointments_doctor_video;
DROP INDEX IF EXISTS idx_chat_conversations_patient_lastmsg;
DROP INDEX IF EXISTS idx_chat_conversations_doctor_lastmsg;
DROP INDEX IF EXISTS idx_chat_conversations_appointment;
DROP INDEX IF EXISTS idx_chat_messages_conversation_sender;
DROP INDEX IF EXISTS idx_chat_message_receipts_user_message;
DROP INDEX IF EXISTS idx_doctors_status_rating;
DROP INDEX IF EXISTS idx_doctors_status_city;
DROP INDEX IF EXISTS idx_doctors_status_price;
DROP INDEX IF EXISTS idx_profiles_role_created;
DROP INDEX IF EXISTS idx_prescriptions_doctor_created;
DROP INDEX IF EXISTS idx_prescriptions_patient_created;
DROP INDEX IF EXISTS idx_followup_schedules_status_date;
DROP INDEX IF EXISTS idx_medical_images_patient_created_status;
DROP INDEX IF EXISTS idx_availability_rules_doctor_active;
DROP INDEX IF EXISTS idx_availability_exceptions_doctor_start;
DROP INDEX IF EXISTS idx_doctor_subscriptions_status_period;

COMMIT;

DO $$
BEGIN
    RAISE NOTICE 'Successfully rolled back 011_performance_indexes_enhanced.sql';
END $$;
