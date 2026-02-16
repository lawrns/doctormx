-- ================================================
-- SCHEMA HARDENING - WEEK 0
-- DoctorMX Database Security & Integrity Enhancements
-- ================================================

-- ================================================
-- 1. UNIQUE CONSTRAINT FOR APPOINTMENT SLOTS
-- Prevents double-booking of the same doctor at the same time
-- ================================================

-- Drop existing index if it exists (for idempotency)
DROP INDEX IF EXISTS idx_unique_active_appointment;

-- Create unique index to prevent double-booking
-- Only applies to appointments that are pending_payment or confirmed
-- Cancelled, completed, no_show, and refunded appointments don't block the slot
CREATE UNIQUE INDEX idx_unique_active_appointment 
ON appointments (doctor_id, start_ts) 
WHERE status IN ('pending_payment', 'confirmed');

-- Add comment for documentation
COMMENT ON INDEX idx_unique_active_appointment IS 
'Prevents double-booking: only one active appointment per doctor per time slot';

-- ================================================
-- 2. ATOMIC SLOT RESERVATION FUNCTION
-- RPC function for race-condition-free appointment booking
-- ================================================

CREATE OR REPLACE FUNCTION reserve_slot_atomic(
  p_doctor_id UUID,
  p_patient_id UUID,
  p_start_ts TIMESTAMPTZ,
  p_end_ts TIMESTAMPTZ,
  p_reason_for_visit TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_appointment_id UUID;
  v_existing_appointment_id UUID;
  v_doctor_exists BOOLEAN;
  v_result JSONB;
BEGIN
  -- Validate doctor exists and is approved
  SELECT EXISTS(
    SELECT 1 FROM doctors 
    WHERE id = p_doctor_id 
    AND status = 'approved'
  ) INTO v_doctor_exists;
  
  IF NOT v_doctor_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'DOCTOR_NOT_AVAILABLE',
      'message', 'Doctor not found or not approved'
    );
  END IF;
  
  -- Check if slot is already reserved (active appointment exists)
  SELECT id INTO v_existing_appointment_id
  FROM appointments
  WHERE doctor_id = p_doctor_id
    AND start_ts = p_start_ts
    AND status IN ('pending_payment', 'confirmed')
  FOR UPDATE SKIP LOCKED;
  
  IF v_existing_appointment_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'SLOT_ALREADY_RESERVED',
      'message', 'This time slot has just been booked by another patient',
      'existing_appointment_id', v_existing_appointment_id
    );
  END IF;
  
  -- Validate time slot is in the future
  IF p_start_ts <= NOW() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_TIME_SLOT',
      'message', 'Cannot book appointments in the past'
    );
  END IF;
  
  -- Validate end time is after start time
  IF p_end_ts <= p_start_ts THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_TIME_RANGE',
      'message', 'End time must be after start time'
    );
  END IF;
  
  -- Create the appointment atomically
  INSERT INTO appointments (
    doctor_id,
    patient_id,
    start_ts,
    end_ts,
    status,
    reason_for_visit,
    notes,
    created_at,
    updated_at
  ) VALUES (
    p_doctor_id,
    p_patient_id,
    p_start_ts,
    p_end_ts,
    'pending_payment',
    p_reason_for_visit,
    p_notes,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_appointment_id;
  
  -- Return success with appointment details
  RETURN jsonb_build_object(
    'success', true,
    'appointment_id', v_appointment_id,
    'doctor_id', p_doctor_id,
    'patient_id', p_patient_id,
    'start_ts', p_start_ts,
    'end_ts', p_end_ts,
    'status', 'pending_payment',
    'message', 'Slot reserved successfully. Complete payment within 10 minutes.'
  );
  
EXCEPTION
  WHEN unique_violation THEN
    -- Handle race condition where another transaction created the appointment
    -- between our check and insert
    RETURN jsonb_build_object(
      'success', false,
      'error', 'SLOT_ALREADY_RESERVED',
      'message', 'This time slot has just been booked by another patient'
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INTERNAL_ERROR',
      'message', SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION reserve_slot_atomic(UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, TEXT) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION reserve_slot_atomic IS 
'Atomically reserves a doctor time slot. Prevents race conditions and double-booking.
Returns JSON with success flag and appointment details or error information.';

-- ================================================
-- 3. COMPLETE RLS POLICIES FOR MISSING TABLES
-- ================================================

-- Doctor Subscriptions RLS Policies (if not already present)
DO $$
BEGIN
  -- Check if policy exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'doctor_subscriptions' 
    AND policyname = 'Doctors can view their own subscriptions'
  ) THEN
    CREATE POLICY "Doctors can view their own subscriptions"
      ON doctor_subscriptions FOR SELECT
      USING (doctor_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'doctor_subscriptions' 
    AND policyname = 'Admins can manage all subscriptions'
  ) THEN
    CREATE POLICY "Admins can manage all subscriptions"
      ON doctor_subscriptions FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;
END
$$;

-- Follow-up Schedules RLS Policies (complete coverage)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'follow_up_schedules' 
    AND policyname = 'Patients can view their follow-ups'
  ) THEN
    CREATE POLICY "Patients can view their follow-ups"
      ON follow_up_schedules FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM appointments 
        WHERE id = appointment_id 
        AND patient_id = auth.uid()
      ));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'follow_up_schedules' 
    AND policyname = 'Doctors can manage their patient follow-ups'
  ) THEN
    CREATE POLICY "Doctors can manage their patient follow-ups"
      ON follow_up_schedules FOR ALL
      USING (EXISTS (
        SELECT 1 FROM appointments 
        WHERE id = appointment_id 
        AND doctor_id = auth.uid()
      ));
  END IF;
END
$$;

-- Payments RLS - Complete INSERT/UPDATE/DELETE policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payments' 
    AND policyname = 'System can create payments'
  ) THEN
    CREATE POLICY "System can create payments"
      ON payments FOR INSERT
      WITH CHECK (EXISTS (
        SELECT 1 FROM appointments 
        WHERE id = appointment_id 
        AND patient_id = auth.uid()
      ) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payments' 
    AND policyname = 'System can update payment status'
  ) THEN
    CREATE POLICY "System can update payment status"
      ON payments FOR UPDATE
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;
END
$$;

-- Prescriptions RLS - Complete policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'prescriptions' 
    AND policyname = 'Doctors can update their prescriptions'
  ) THEN
    CREATE POLICY "Doctors can update their prescriptions"
      ON prescriptions FOR UPDATE
      USING (doctor_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'prescriptions' 
    AND policyname = 'Doctors can delete their prescriptions'
  ) THEN
    CREATE POLICY "Doctors can delete their prescriptions"
      ON prescriptions FOR DELETE
      USING (doctor_id = auth.uid());
  END IF;
END
$$;

-- ================================================
-- 4. ADDITIONAL INDEXES FOR PERFORMANCE
-- ================================================

-- Index for slot availability checks
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_start_status 
ON appointments(doctor_id, start_ts, status);

-- Index for patient's upcoming appointments
CREATE INDEX IF NOT EXISTS idx_appointments_patient_start 
ON appointments(patient_id, start_ts) 
WHERE status IN ('pending_payment', 'confirmed');

-- Index for doctor's appointment lookup
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date 
ON appointments(doctor_id, start_ts DESC);

-- ================================================
-- 5. AUDIT TRIGGER FOR APPOINTMENT CHANGES
-- ================================================

-- Create audit log table if not exists
CREATE TABLE IF NOT EXISTS appointment_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE appointment_audit_log ENABLE ROW LEVEL SECURITY;

-- Audit log RLS policies
CREATE POLICY "Users can view audit for their appointments"
  ON appointment_audit_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM appointments 
    WHERE id = appointment_id 
    AND (patient_id = auth.uid() OR doctor_id = auth.uid())
  ) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_appointment_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO appointment_audit_log (
      appointment_id, changed_by, action, old_values, new_values
    ) VALUES (
      NEW.id,
      auth.uid(),
      'UPDATE',
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO appointment_audit_log (
      appointment_id, changed_by, action, old_values
    ) VALUES (
      OLD.id,
      auth.uid(),
      'DELETE',
      to_jsonb(OLD)
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach trigger to appointments table
DROP TRIGGER IF EXISTS appointment_audit_trigger ON appointments;
CREATE TRIGGER appointment_audit_trigger
  AFTER UPDATE OR DELETE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION audit_appointment_changes();

-- ================================================
-- VERIFICATION QUERIES (Run manually to verify)
-- ================================================

/*
-- Test unique constraint (should fail on second insert):
BEGIN;
INSERT INTO appointments (doctor_id, patient_id, start_ts, end_ts, status)
VALUES ('doctor-uuid', 'patient-uuid', '2025-03-01 10:00:00', '2025-03-01 11:00:00', 'confirmed');
INSERT INTO appointments (doctor_id, patient_id, start_ts, end_ts, status)
VALUES ('doctor-uuid', 'patient-uuid', '2025-03-01 10:00:00', '2025-03-01 11:00:00', 'confirmed');
ROLLBACK;

-- Test atomic reservation function:
SELECT reserve_slot_atomic(
  'doctor-uuid'::UUID,
  'patient-uuid'::UUID,
  '2025-03-01 14:00:00'::TIMESTAMPTZ,
  '2025-03-01 15:00:00'::TIMESTAMPTZ,
  'Consulta general',
  NULL
);

-- Check RLS policies:
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('appointments', 'payments', 'prescriptions', 'follow_up_schedules', 'doctor_subscriptions')
ORDER BY tablename, policyname;
*/
