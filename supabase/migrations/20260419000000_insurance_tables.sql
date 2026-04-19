-- Insurance provider system for Mexican health insurance filtering
-- Mirrors Doctoralia's specialty-city-insurance programmatic SEO

-- Insurance providers table
CREATE TABLE IF NOT EXISTS insurances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  type text NOT NULL DEFAULT 'private' CHECK (type IN ('public', 'private', 'social_security')),
  website text,
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Doctor-insurance junction table
CREATE TABLE IF NOT EXISTS doctor_insurances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  insurance_id uuid NOT NULL REFERENCES insurances(id) ON DELETE CASCADE,
  plan_name text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (doctor_id, insurance_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_doctor_insurances_doctor ON doctor_insurances(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_insurances_insurance ON doctor_insurances(insurance_id);
CREATE INDEX IF NOT EXISTS idx_insurances_slug ON insurances(slug);
CREATE INDEX IF NOT EXISTS idx_insurances_type ON insurances(type);

-- RLS
ALTER TABLE insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_insurances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Insurances are publicly readable" ON insurances FOR SELECT USING (true);
CREATE POLICY "Doctors can manage their insurances" ON doctor_insurances FOR ALL USING (
  doctor_id IN (SELECT id FROM doctors WHERE id = auth.uid())
);
CREATE POLICY "Doctor insurances are publicly readable" ON doctor_insurances FOR SELECT USING (true);
CREATE POLICY "Admins can manage all doctor insurances" ON doctor_insurances FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Seed: Top Mexican insurance providers
INSERT INTO insurances (name, slug, type, website) VALUES
  -- Public/Social Security
  ('IMSS', 'imss', 'social_security', 'https://www.imss.gob.mx'),
  ('ISSSTE', 'issste', 'social_security', 'https://www.gob.mx/issste'),
  ('INSABI (Seguro Popular)', 'insabi', 'public', 'https://www.gob.mx/insabi'),
  ('SEDENA', 'sedena', 'social_security', 'https://www.gob.mx/sedena'),
  ('PEMEX', 'pemex', 'social_security', 'https://www.pemex.com'),
  -- Private
  ('AXA Seguros', 'axa', 'private', 'https://www.axa.mx'),
  ('MetLife México', 'metlife', 'private', 'https://www.metlife.com.mx'),
  ('GNP Seguros', 'gnp', 'private', 'https://www.gnp.com.mx'),
  ('Allianz México', 'allianz', 'private', 'https://www.allianz.com.mx'),
  ('Mapfre México', 'mapfre', 'private', 'https://www.mapfre.com.mx'),
  ('Zurich Seguros', 'zurich', 'private', 'https://www.zurich.com.mx'),
  ('Seguros Monterrey', 'seguros-monterrey', 'private', 'https://www.segurosmonterrey.com.mx'),
  ('Chubb Seguros', 'chubb', 'private', 'https://www.chubb.com/mx'),
  ('Bupa México', 'bupa', 'private', 'https://www.bupa.com.mx'),
  ('HSBC Seguros', 'hsbc', 'private', 'https://www.hsbc.com.mx'),
  ('Qualitas', 'qualitas', 'private', 'https://www.qualitas.com.mx'),
  ('Grupo Nacional Provincial', 'gnp-provincial', 'private', 'https://www.gnp.com.mx'),
  ('Star Médica', 'star-medica', 'private', 'https://www.starmedica.com'),
  ('Ángeles Seguros', 'angeles', 'private', 'https://www.hospitalangeles.com'),
  ('Sura México', 'sura', 'private', 'https://www.sura.com.mx');
