-- ================================================
-- Additional Database Constraints Migration
-- Adds critical data integrity constraints for production
-- Agrega restricciones críticas de integridad de datos para producción
-- ================================================

-- ================================================
-- EMAIL VALIDATION CONSTRAINTS
-- ================================================

-- Add email format validation for profiles table
DO $$
BEGIN
  -- Check if constraint exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_email_format'
  ) THEN
    ALTER TABLE profiles
    ADD CONSTRAINT valid_email_format
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR email IS NULL);
  END IF;
END $$;

-- ================================================
-- PHONE VALIDATION CONSTRAINTS
-- ================================================

-- Add phone format validation for profiles (Mexican phone numbers)
-- Accepts formats: +521234567890, 521234567890, 1234567890
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_phone_format'
  ) THEN
    ALTER TABLE profiles
    ADD CONSTRAINT valid_phone_format
    CHECK (phone IS NULL OR phone ~* '^(\+?52)?[0-9]{10,15}$');
  END IF;
END $$;

-- ================================================
-- APPOINTMENT VALIDATION CONSTRAINTS
-- ================================================

-- Ensure appointment end time is always after start time
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'appointment_end_after_start'
  ) THEN
    ALTER TABLE appointments
    ADD CONSTRAINT appointment_end_after_start
    CHECK (end_ts > start_ts);
  END IF;
END $$;

-- Ensure appointment duration is reasonable (5 min to 4 hours)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_appointment_duration'
  ) THEN
    ALTER TABLE appointments
    ADD CONSTRAINT valid_appointment_duration
    CHECK (EXTRACT(EPOCH FROM (end_ts - start_ts)) / 60 BETWEEN 5 AND 240);
  END IF;
END $$;

-- ================================================
-- PAYMENT VALIDATION CONSTRAINTS
-- ================================================

-- Ensure payment amount is positive
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'positive_payment_amount'
  ) THEN
    ALTER TABLE payments
    ADD CONSTRAINT positive_payment_amount
    CHECK (amount_cents > 0);
  END IF;
END $$;

-- Valid payment status constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_payment_status'
  ) THEN
    ALTER TABLE payments
    ADD CONSTRAINT valid_payment_status
    CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'refunded', 'partial_refund'));
  END IF;
END $$;

-- Valid currency constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_payment_currency'
  ) THEN
    ALTER TABLE payments
    ADD CONSTRAINT valid_payment_currency
    CHECK (currency IN ('MXN', 'USD'));
  END IF;
END $$;

-- ================================================
-- SOAP CONSULTATION VALIDATION
-- ================================================

-- Ensure consultation has at least patient or doctor
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'soap_has_required_fields'
  ) THEN
    ALTER TABLE soap_consultations
    ADD CONSTRAINT soap_has_required_fields
    CHECK (patient_id IS NOT NULL AND appointment_id IS NOT NULL);
  END IF;
END $$;

-- ================================================
-- PRESCRIPTION VALIDATION
-- ================================================

-- Ensure prescription has required medications field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'prescription_has_medications'
  ) THEN
    ALTER TABLE prescriptions
    ADD CONSTRAINT prescription_has_medications
    CHECK (medications IS NOT NULL AND LENGTH(TRIM(medications)) > 0);
  END IF;
END $$;

-- ================================================
-- SUBSCRIPTION VALIDATION
-- ================================================

-- Ensure subscription limits are valid
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_subscription_limits'
  ) THEN
    ALTER TABLE doctor_subscriptions
    ADD CONSTRAINT valid_subscription_limits
    CHECK (
      (whatsapp_messages_limit = -1 OR whatsapp_messages_limit >= 0) AND
      (ai_copilot_limit = -1 OR ai_copilot_limit >= 0) AND
      (image_analysis_limit = -1 OR image_analysis_limit >= 0)
    );
  END IF;
END $$;

-- Valid subscription status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_subscription_status'
  ) THEN
    ALTER TABLE doctor_subscriptions
    ADD CONSTRAINT valid_subscription_status
    CHECK (status IN ('active', 'past_due', 'cancelled', 'incomplete', 'trial'));
  END IF;
END $$;

-- ================================================
-- DOCTOR VALIDATION
-- ================================================

-- Valid doctor status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_doctor_status'
  ) THEN
    ALTER TABLE doctors
    ADD CONSTRAINT valid_doctor_status
    CHECK (status IN ('pending', 'active', 'suspended', 'inactive'));
  END IF;
END $$;

-- Doctor must have valid price
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_doctor_price'
  ) THEN
    ALTER TABLE doctors
    ADD CONSTRAINT valid_doctor_price
    CHECK (price_cents >= 0);
  END IF;
END $$;

-- Valid rating range (0-5)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_rating_range'
  ) THEN
    ALTER TABLE doctors
    ADD CONSTRAINT valid_rating_range
    CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5));
  END IF;
END $$;

-- ================================================
-- USER ROLE VALIDATION
-- ================================================

-- Valid user roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_user_role'
  ) THEN
    ALTER TABLE profiles
    ADD CONSTRAINT valid_user_role
    CHECK (role IN ('patient', 'doctor', 'admin'));
  END IF;
END $$;

-- ================================================
-- AVAILABILITY SLOT VALIDATION
-- ================================================

-- Valid availability slot duration
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_slot_duration'
  ) THEN
    ALTER TABLE doctor_availability_slots
    ADD CONSTRAINT valid_slot_duration
    CHECK (duration_minutes BETWEEN 5 AND 240);
  END IF;
END $$;

-- ================================================
-- CHAT MESSAGE VALIDATION
-- ================================================

-- Valid sender type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_chat_sender_type'
  ) THEN
    ALTER TABLE chat_messages
    ADD CONSTRAINT valid_chat_sender_type
    CHECK (sender_type IN ('patient', 'doctor', 'system'));
  END IF;
END $$;

-- ================================================
-- FOLLOWUP VALIDATION
-- ================================================

-- Valid followup types
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_followup_type'
  ) THEN
    ALTER TABLE followups
    ADD CONSTRAINT valid_followup_type
    CHECK (type IN ('follow_up_24h', 'follow_up_7d', 'medication_reminder', 'prescription_refill', 'chronic_care_check'));
  END IF;
END $$;

-- ================================================
-- REFERRAL VALIDATION
-- ================================================

-- Valid referral status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_referral_status'
  ) THEN
    ALTER TABLE referrals
    ADD CONSTRAINT valid_referral_status
    CHECK (status IN ('pending', 'contacted', 'scheduled', 'completed', 'cancelled', 'no_show'));
  END IF;
END $$;

-- ================================================
-- TRIGGERS FOR AUTOMATIC VALIDATION
-- ================================================

-- Function to validate email format before insert/update
CREATE OR REPLACE FUNCTION validate_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate email format (basic check)
  IF NEW.email IS NOT NULL AND NEW.email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format: %', NEW.email;
  END IF;

  -- Ensure email is lowercase
  IF NEW.email IS NOT NULL THEN
    NEW.email := LOWER(NEW.email);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate email on profiles
DROP TRIGGER IF EXISTS trigger_validate_profile_email_insert ON profiles;
CREATE TRIGGER trigger_validate_profile_email_insert
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_profile_email();

DROP TRIGGER IF EXISTS trigger_validate_profile_email_update ON profiles;
CREATE TRIGGER trigger_validate_profile_email_update
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (NEW.email IS DISTINCT FROM OLD.email)
  EXECUTE FUNCTION validate_profile_email();

-- ================================================
-- INDEXES FOR CONSTRAINT PERFORMANCE
-- ================================================

-- Create indexes for common constraint checks
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment ON prescriptions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON doctor_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_doctors_status ON doctors(status);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_followups_status ON followups(status);
CREATE INDEX IF NOT EXISTS idx_followups_scheduled_at ON followups(scheduled_at);

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON CONSTRAINT valid_email_format ON profiles IS 'Validates email format using regex pattern';
COMMENT ON CONSTRAINT valid_phone_format ON profiles IS 'Validates Mexican phone number formats';
COMMENT ON CONSTRAINT appointment_end_after_start ON appointments IS 'Ensures end time is after start time';
COMMENT ON CONSTRAINT valid_appointment_duration ON appointments IS 'Ensures appointment duration is between 5 min and 4 hours';
COMMENT ON CONSTRAINT positive_payment_amount ON payments IS 'Ensures payment amounts are always positive';
COMMENT ON CONSTRAINT valid_subscription_limits ON doctor_subscriptions IS 'Validates subscription limit values (-1 for unlimited, >=0 otherwise)';
COMMENT ON CONSTRAINT valid_user_role ON profiles IS 'Ensures user role is one of: patient, doctor, admin';

-- ================================================
-- END OF MIGRATION
-- ================================================
