-- Migration: Free trial system for doctors
-- Doctors get 14 days of free access without credit card

CREATE TABLE IF NOT EXISTS doctor_trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(doctor_id)
);

CREATE INDEX IF NOT EXISTS idx_doctor_trials_doctor ON doctor_trials(doctor_id);

COMMENT ON TABLE doctor_trials IS 'Free trial records for doctors. One trial per doctor, expires after 14 days.';
