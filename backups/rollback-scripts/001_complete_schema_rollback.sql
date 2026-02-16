-- ============================================================
-- ROLLBACK SCRIPT: 001_complete_schema.sql
-- DoctorMX Database Migration Rollback
-- Generated: 2026-02-16T09:42:35-06:00
-- CRITICAL: This will DELETE ALL DATA in the affected tables
-- ============================================================

-- Start transaction
BEGIN;

-- Verify we can rollback (check if tables exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        RAISE EXCEPTION 'Cannot rollback: profiles table does not exist. Migration may not have been applied.';
    END IF;
END $$;

-- ============================================================
-- DISABLE ROW LEVEL SECURITY FIRST
-- ============================================================

ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS doctor_specialties DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS doctor_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS follow_up_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS availability_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS availability_exceptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS specialties DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- DROP POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Everyone can view approved doctors" ON doctors;
DROP POLICY IF EXISTS "Doctors can update their own profile" ON doctors;
DROP POLICY IF EXISTS "Doctors can view draft/pending doctors (own)" ON doctors;
DROP POLICY IF EXISTS "Everyone can view doctor specialties" ON doctor_specialties;
DROP POLICY IF EXISTS "Doctors can manage their own specialties" ON doctor_specialties;
DROP POLICY IF EXISTS "Doctors can update their own specialties" ON doctor_specialties;
DROP POLICY IF EXISTS "Doctors can delete their own specialties" ON doctor_specialties;
DROP POLICY IF EXISTS "Admins can manage all specialties" ON doctor_specialties;
DROP POLICY IF EXISTS "Patients can view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can create appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can update appointment status" ON appointments;
DROP POLICY IF EXISTS "Patients can view their payments" ON payments;
DROP POLICY IF EXISTS "Doctors can view their payment appointments" ON payments;
DROP POLICY IF EXISTS "Doctors can create prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Patients can view their prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Doctors can manage their availability" ON availability_rules;
DROP POLICY IF EXISTS "Everyone can view active availability" ON availability_rules;
DROP POLICY IF EXISTS "Doctors can manage their exceptions" ON availability_exceptions;

-- ============================================================
-- DROP INDEXES
-- ============================================================

DROP INDEX IF EXISTS idx_appointments_doctor_id;
DROP INDEX IF EXISTS idx_appointments_patient_id;
DROP INDEX IF EXISTS idx_appointments_status;
DROP INDEX IF EXISTS idx_appointments_start_ts;
DROP INDEX IF EXISTS idx_doctor_specialties_doctor_id;
DROP INDEX IF EXISTS idx_doctor_specialties_specialty_id;
DROP INDEX IF EXISTS idx_doctors_status;
DROP INDEX IF EXISTS idx_doctors_city;
DROP INDEX IF EXISTS idx_doctors_state;
DROP INDEX IF EXISTS idx_payments_appointment_id;
DROP INDEX IF EXISTS idx_payments_stripe_id;
DROP INDEX IF EXISTS idx_specialties_slug;

-- ============================================================
-- DROP TABLES (in dependency order - child tables first)
-- ============================================================

-- Audit-related dependent tables (if exist)
-- Note: These might be created by later migrations

-- Core dependent tables
DROP TABLE IF EXISTS availability_exceptions CASCADE;
DROP TABLE IF EXISTS availability_rules CASCADE;
DROP TABLE IF EXISTS follow_up_schedules CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS doctor_subscriptions CASCADE;
DROP TABLE IF EXISTS doctor_specialties CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS specialties CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================================
-- DROP TYPES
-- ============================================================

DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;
DROP TYPE IF EXISTS doctor_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- ============================================================
-- VERIFY ROLLBACK
-- ============================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        RAISE EXCEPTION 'Rollback failed: profiles table still exists';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'doctors') THEN
        RAISE EXCEPTION 'Rollback failed: doctors table still exists';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'appointments') THEN
        RAISE EXCEPTION 'Rollback failed: appointments table still exists';
    END IF;
END $$;

-- ============================================================
-- ROLLBACK COMPLETE
-- ============================================================

COMMIT;

-- Log rollback completion
DO $$
BEGIN
    RAISE NOTICE 'Successfully rolled back 001_complete_schema.sql';
    RAISE NOTICE 'All core tables, types, and indexes have been removed';
END $$;
