-- ================================================
-- DOCTORY DATABASE SCHEMA v2 - ALIGNED WITH CODEBASE
-- Production-ready Supabase schema for telemedicine platform
-- ================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ================================================
-- ENUMS
-- ================================================

CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin');
CREATE TYPE doctor_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'suspended');
CREATE TYPE appointment_status AS ENUM ('pending_payment', 'confirmed', 'cancelled', 'completed', 'no_show', 'refunded');
CREATE TYPE payment_status AS ENUM ('requires_action', 'pending', 'paid', 'failed', 'refunded');

-- ================================================
-- CORE TABLES
-- ================================================

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'patient',
  full_name TEXT NOT NULL,
  phone TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Specialties
CREATE TABLE specialties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Doctors
CREATE TABLE doctors (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  status doctor_status NOT NULL DEFAULT 'draft',
  bio TEXT,
  languages TEXT[] DEFAULT ARRAY['es'],
  license_number TEXT,
  years_experience INTEGER,
  city TEXT,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'MX',
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MXN',
  video_enabled BOOLEAN NOT NULL DEFAULT false,
  accepts_insurance BOOLEAN NOT NULL DEFAULT false,
  rating_avg NUMERIC(3, 2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Doctor Specialties (many-to-many)
CREATE TABLE doctor_specialties (
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  specialty_id UUID NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
  PRIMARY KEY (doctor_id, specialty_id)
);

-- Doctor Subscriptions
CREATE TABLE doctor_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  plan_price_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_ts TIMESTAMPTZ NOT NULL,
  end_ts TIMESTAMPTZ NOT NULL,
  status appointment_status NOT NULL DEFAULT 'pending_payment',
  reason_for_visit TEXT,
  notes TEXT,
  video_room_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_ts > start_ts)
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MXN',
  status payment_status NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  stripe_payment_intent_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prescriptions
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  medications JSONB NOT NULL,
  notes TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Follow-up Schedules
CREATE TABLE follow_up_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================
-- AVAILABILITY TABLES
-- ================================================

-- Availability Rules
CREATE TABLE availability_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_minutes INTEGER NOT NULL DEFAULT 30,
  buffer_minutes INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (doctor_id, day_of_week, start_time)
);

-- Availability Exceptions
CREATE TABLE availability_exceptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  start_ts TIMESTAMPTZ NOT NULL,
  end_ts TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_ts > start_ts)
);

-- ================================================
-- INDEXES
-- ================================================

CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_start_ts ON appointments(start_ts);
CREATE INDEX idx_doctor_specialties_doctor_id ON doctor_specialties(doctor_id);
CREATE INDEX idx_doctor_specialties_specialty_id ON doctor_specialties(specialty_id);
CREATE INDEX idx_doctors_status ON doctors(status);
CREATE INDEX idx_doctors_city ON doctors(city);
CREATE INDEX idx_doctors_state ON doctors(state);
CREATE INDEX idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX idx_payments_stripe_id ON payments(stripe_payment_intent_id);
CREATE INDEX idx_specialties_slug ON specialties(slug);

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_exceptions ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Doctors RLS
CREATE POLICY "Everyone can view approved doctors"
  ON doctors FOR SELECT
  USING (status = 'approved' OR auth.uid() = id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Doctors can update their own profile"
  ON doctors FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Doctors can view draft/pending doctors (own)"
  ON doctors FOR SELECT
  USING (auth.uid() = id);

-- Doctor Specialties RLS
CREATE POLICY "Everyone can view doctor specialties"
  ON doctor_specialties FOR SELECT
  USING (true);

CREATE POLICY "Doctors can manage their own specialties"
  ON doctor_specialties FOR INSERT
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update their own specialties"
  ON doctor_specialties FOR UPDATE
  USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can delete their own specialties"
  ON doctor_specialties FOR DELETE
  USING (doctor_id = auth.uid());

CREATE POLICY "Admins can manage all specialties"
  ON doctor_specialties FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Appointments RLS
CREATE POLICY "Patients can view their own appointments"
  ON appointments FOR SELECT
  USING (patient_id = auth.uid() OR doctor_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Doctors can view their appointments"
  ON appointments FOR SELECT
  USING (doctor_id = auth.uid());

CREATE POLICY "Patients can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors can update appointment status"
  ON appointments FOR UPDATE
  USING (doctor_id = auth.uid());

-- Payments RLS
CREATE POLICY "Patients can view their payments"
  ON payments FOR SELECT
  USING (EXISTS (SELECT 1 FROM appointments WHERE id = appointment_id AND patient_id = auth.uid()) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Doctors can view their payment appointments"
  ON payments FOR SELECT
  USING (EXISTS (SELECT 1 FROM appointments WHERE id = appointment_id AND doctor_id = auth.uid()));

-- Prescriptions RLS
CREATE POLICY "Doctors can create prescriptions"
  ON prescriptions FOR INSERT
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Patients can view their prescriptions"
  ON prescriptions FOR SELECT
  USING (patient_id = auth.uid() OR doctor_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Availability Rules RLS
CREATE POLICY "Doctors can manage their availability"
  ON availability_rules FOR ALL
  USING (doctor_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Everyone can view active availability"
  ON availability_rules FOR SELECT
  USING (active = true);

-- Availability Exceptions RLS
CREATE POLICY "Doctors can manage their exceptions"
  ON availability_exceptions FOR ALL
  USING (doctor_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ================================================
-- SEED DATA
-- ================================================

-- Insert specialties
INSERT INTO specialties (name, slug, description) VALUES
  ('Medicina General', 'medicina-general', 'Consulta médica general y prevención'),
  ('Cardiología', 'cardiologia', 'Enfermedades del corazón y sistema cardiovascular'),
  ('Dermatología', 'dermatologia', 'Enfermedades de la piel, cabello y uñas'),
  ('Pediatría', 'pediatria', 'Atención médica para niños y adolescentes'),
  ('Ginecología', 'ginecologia', 'Salud reproductiva femenina'),
  ('Psiquiatría', 'psiquiatria', 'Salud mental y trastornos psiquiátricos'),
  ('Traumatología', 'traumatologia', 'Lesiones del sistema musculoesquelético'),
  ('Oftalmología', 'oftalmologia', 'Enfermedades de los ojos y sistema visual'),
  ('Nutrición', 'nutricion', 'Alimentación y control de peso'),
  ('Neurología', 'neurologia', 'Enfermedades del sistema nervioso')
ON CONFLICT (name) DO NOTHING;
