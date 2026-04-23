-- Phase 3.2: patient insurance, checkout eligibility, and claim tracking.

ALTER TABLE insurances
  ADD COLUMN IF NOT EXISTS coverage_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS default_copay_cents integer NOT NULL DEFAULT 30000,
  ADD COLUMN IF NOT EXISTS reimbursement_rate numeric(5, 2) NOT NULL DEFAULT 0.70,
  ADD COLUMN IF NOT EXISTS supports_real_time_eligibility boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS requires_folio boolean NOT NULL DEFAULT false;

UPDATE insurances
SET
  default_copay_cents = CASE
    WHEN slug IN ('imss', 'issste', 'insabi', 'sedena', 'pemex') THEN 0
    WHEN slug IN ('gnp', 'gnp-provincial', 'axa', 'metlife') THEN 25000
    ELSE 30000
  END,
  reimbursement_rate = CASE
    WHEN slug IN ('imss', 'issste', 'insabi', 'sedena', 'pemex') THEN 1.00
    WHEN slug IN ('gnp', 'gnp-provincial', 'axa', 'metlife') THEN 0.80
    ELSE 0.70
  END,
  supports_real_time_eligibility = slug IN ('gnp', 'gnp-provincial', 'axa', 'metlife'),
  requires_folio = slug IN ('imss', 'issste', 'insabi', 'sedena', 'pemex')
WHERE is_active = true;

CREATE TABLE IF NOT EXISTS patient_insurances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  insurance_id uuid NOT NULL REFERENCES insurances(id) ON DELETE RESTRICT,
  policy_number text,
  member_id text,
  holder_name text,
  coverage_type text,
  is_active boolean NOT NULL DEFAULT true,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (patient_id, insurance_id, policy_number, member_id)
);

CREATE TABLE IF NOT EXISTS appointment_insurance_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_insurance_id uuid NOT NULL REFERENCES patient_insurances(id) ON DELETE RESTRICT,
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'eligibility_checked'
    CHECK (status IN ('eligibility_checked', 'pending_folio', 'submitted', 'approved', 'rejected', 'paid')),
  eligibility_status text NOT NULL DEFAULT 'estimated'
    CHECK (eligibility_status IN ('estimated', 'verified', 'requires_review', 'not_supported')),
  claim_number text,
  estimated_copay_cents integer NOT NULL DEFAULT 0,
  reimbursement_amount_cents integer NOT NULL DEFAULT 0,
  reimbursement_amount_cents_final integer,
  notes text,
  submitted_at timestamptz,
  approved_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (appointment_id)
);

CREATE INDEX IF NOT EXISTS idx_patient_insurances_patient
  ON patient_insurances(patient_id, is_active);

CREATE INDEX IF NOT EXISTS idx_patient_insurances_insurance
  ON patient_insurances(insurance_id);

CREATE INDEX IF NOT EXISTS idx_insurance_claims_doctor_status
  ON appointment_insurance_claims(doctor_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_insurance_claims_patient
  ON appointment_insurance_claims(patient_id, created_at DESC);

ALTER TABLE patient_insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_insurance_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can manage their insurance"
  ON patient_insurances FOR ALL
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors can read appointment insurance claims"
  ON appointment_insurance_claims FOR SELECT
  USING (doctor_id = auth.uid() OR patient_id = auth.uid());

CREATE POLICY "Patients can create appointment insurance claims"
  ON appointment_insurance_claims FOR INSERT
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors can update their appointment insurance claims"
  ON appointment_insurance_claims FOR UPDATE
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

CREATE OR REPLACE FUNCTION update_patient_insurances_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS patient_insurances_updated_at ON patient_insurances;
CREATE TRIGGER patient_insurances_updated_at
  BEFORE UPDATE ON patient_insurances
  FOR EACH ROW EXECUTE FUNCTION update_patient_insurances_updated_at();

CREATE OR REPLACE FUNCTION update_appointment_insurance_claims_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS appointment_insurance_claims_updated_at ON appointment_insurance_claims;
CREATE TRIGGER appointment_insurance_claims_updated_at
  BEFORE UPDATE ON appointment_insurance_claims
  FOR EACH ROW EXECUTE FUNCTION update_appointment_insurance_claims_updated_at();
