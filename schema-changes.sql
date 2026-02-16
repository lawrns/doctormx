-- ================================================
-- SCHEMA CHANGES - WEEK 0 HARDENING
-- DoctorMX Database Security & Integrity
-- ================================================

-- 1. UNIQUE CONSTRAINT FOR APPOINTMENT SLOTS
-- Prevents double-booking of the same doctor at the same time
DROP INDEX IF EXISTS idx_unique_active_appointment;

CREATE UNIQUE INDEX idx_unique_active_appointment 
ON appointments (doctor_id, start_ts) 
WHERE status IN ('pending_payment', 'confirmed');

COMMENT ON INDEX idx_unique_active_appointment IS 
'Prevents double-booking: only one active appointment per doctor per time slot';

-- 2. ATOMIC SLOT RESERVATION FUNCTION
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
  
  -- Check if slot is already reserved
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
  
  -- Validate time constraints
  IF p_start_ts <= NOW() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_TIME_SLOT',
      'message', 'Cannot book appointments in the past'
    );
  END IF;
  
  IF p_end_ts <= p_start_ts THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_TIME_RANGE',
      'message', 'End time must be after start time'
    );
  END IF;
  
  -- Create appointment atomically
  INSERT INTO appointments (
    doctor_id, patient_id, start_ts, end_ts, status,
    reason_for_visit, notes, created_at, updated_at
  ) VALUES (
    p_doctor_id, p_patient_id, p_start_ts, p_end_ts, 'pending_payment',
    p_reason_for_visit, p_notes, NOW(), NOW()
  )
  RETURNING id INTO v_appointment_id;
  
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

GRANT EXECUTE ON FUNCTION reserve_slot_atomic(UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, TEXT) TO authenticated;

-- 3. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_start_status 
ON appointments(doctor_id, start_ts, status);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_start 
ON appointments(patient_id, start_ts) 
WHERE status IN ('pending_payment', 'confirmed');
