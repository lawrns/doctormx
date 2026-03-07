-- ================================================
-- CARE MEMORY, FAMILY PROFILES, AND PARTNER HANDOFFS
-- Migration: Adds longitudinal family care profiles, memory items,
-- and partner handoff tracking on top of unified care cases.
-- ================================================

CREATE TABLE IF NOT EXISTS family_care_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  related_patient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  relationship TEXT NOT NULL,
  display_name TEXT NOT NULL,
  birth_date DATE,
  sex TEXT,
  blood_type TEXT,
  allergies TEXT[] NOT NULL DEFAULT '{}',
  chronic_conditions TEXT[] NOT NULL DEFAULT '{}',
  medications TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS care_memory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_case_id UUID REFERENCES care_cases(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  family_profile_id UUID REFERENCES family_care_profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  source_type TEXT NOT NULL,
  source_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS care_partner_handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_case_id UUID NOT NULL REFERENCES care_cases(id) ON DELETE CASCADE,
  partner_type TEXT NOT NULL,
  partner_id TEXT,
  status TEXT NOT NULL DEFAULT 'recommended',
  reason TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_family_care_profiles_owner_patient_id ON family_care_profiles(owner_patient_id);
CREATE INDEX IF NOT EXISTS idx_family_care_profiles_related_patient_id ON family_care_profiles(related_patient_id);
CREATE INDEX IF NOT EXISTS idx_care_memory_items_care_case_id ON care_memory_items(care_case_id);
CREATE INDEX IF NOT EXISTS idx_care_memory_items_patient_id ON care_memory_items(patient_id);
CREATE INDEX IF NOT EXISTS idx_care_memory_items_family_profile_id ON care_memory_items(family_profile_id);
CREATE INDEX IF NOT EXISTS idx_care_partner_handoffs_care_case_id ON care_partner_handoffs(care_case_id);
CREATE INDEX IF NOT EXISTS idx_care_partner_handoffs_partner_type ON care_partner_handoffs(partner_type);
CREATE INDEX IF NOT EXISTS idx_care_partner_handoffs_status ON care_partner_handoffs(status);

ALTER TABLE family_care_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_memory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_partner_handoffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "family_profiles_owner_select" ON family_care_profiles
  FOR SELECT
  USING (owner_patient_id = auth.uid());

CREATE POLICY "family_profiles_owner_write" ON family_care_profiles
  FOR ALL
  USING (owner_patient_id = auth.uid() OR auth.role() = 'service_role')
  WITH CHECK (owner_patient_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "care_memory_patient_select" ON care_memory_items
  FOR SELECT
  USING (patient_id = auth.uid() OR family_profile_id IN (
    SELECT id FROM family_care_profiles WHERE owner_patient_id = auth.uid()
  ));

CREATE POLICY "care_memory_doctor_select" ON care_memory_items
  FOR SELECT
  USING (care_case_id IN (
    SELECT id FROM care_cases WHERE assigned_doctor_id = auth.uid()
  ));

CREATE POLICY "care_memory_service_role" ON care_memory_items
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "care_partner_handoffs_patient_select" ON care_partner_handoffs
  FOR SELECT
  USING (care_case_id IN (
    SELECT id FROM care_cases WHERE patient_id = auth.uid()
  ));

CREATE POLICY "care_partner_handoffs_doctor_select" ON care_partner_handoffs
  FOR SELECT
  USING (care_case_id IN (
    SELECT id FROM care_cases WHERE assigned_doctor_id = auth.uid()
  ));

CREATE POLICY "care_partner_handoffs_service_role" ON care_partner_handoffs
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION update_family_care_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_care_memory_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_care_partner_handoffs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_family_care_profiles_updated_at ON family_care_profiles;
CREATE TRIGGER update_family_care_profiles_updated_at
  BEFORE UPDATE ON family_care_profiles
  FOR EACH ROW EXECUTE FUNCTION update_family_care_profiles_updated_at();

DROP TRIGGER IF EXISTS update_care_memory_items_updated_at ON care_memory_items;
CREATE TRIGGER update_care_memory_items_updated_at
  BEFORE UPDATE ON care_memory_items
  FOR EACH ROW EXECUTE FUNCTION update_care_memory_items_updated_at();

DROP TRIGGER IF EXISTS update_care_partner_handoffs_updated_at ON care_partner_handoffs;
CREATE TRIGGER update_care_partner_handoffs_updated_at
  BEFORE UPDATE ON care_partner_handoffs
  FOR EACH ROW EXECUTE FUNCTION update_care_partner_handoffs_updated_at();
