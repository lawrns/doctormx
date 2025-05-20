/*
  # Doctor and Appointment Schema

  1. New Tables
    - `doctors`: Stores doctor information
    - `appointments`: Patient appointments with doctors
    - `medical_records`: Patient medical records
    - `insurance_info`: Patient insurance information
    
  2. Security
    - Enable RLS on all tables
    - Create policies for proper access control
    
  3. Foreign Key Relationships
    - Link appointments to doctors and users
    - Link medical records to users
*/

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  specialty text NOT NULL,
  image text,
  bio text,
  credentials jsonb DEFAULT '[]'::jsonb,
  education jsonb DEFAULT '[]'::jsonb,
  languages jsonb DEFAULT '[]'::jsonb,
  address text,
  location jsonb,
  is_verified boolean DEFAULT false,
  is_accepting_patients boolean DEFAULT true,
  consultation_fee decimal(10,2),
  telemedicine_available boolean DEFAULT true,
  in_person_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES doctors(id) ON DELETE SET NULL,
  date timestamptz NOT NULL,
  duration_minutes integer DEFAULT 30,
  type text NOT NULL CHECK (type IN ('telemedicine', 'in-person')),
  status text NOT NULL CHECK (status IN ('upcoming', 'completed', 'cancelled', 'rescheduled', 'no-show')),
  reason text,
  notes text,
  cancel_reason text,
  address text,
  meeting_link text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create medical records table
CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  allergies jsonb DEFAULT '[]'::jsonb,
  medications jsonb DEFAULT '[]'::jsonb,
  conditions jsonb DEFAULT '[]'::jsonb,
  surgeries jsonb DEFAULT '[]'::jsonb,
  family_history jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create insurance information table
CREATE TABLE IF NOT EXISTS insurance_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  policy_number text NOT NULL,
  group_number text,
  coverage_details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_info ENABLE ROW LEVEL SECURITY;

-- Create policies for doctors table
CREATE POLICY "Public can view verified doctors"
  ON doctors
  FOR SELECT
  TO public
  USING (is_verified = true);

CREATE POLICY "Doctors can update their own profile"
  ON doctors
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for appointments table
CREATE POLICY "Patients can view their own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view appointments where they are the doctor"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

CREATE POLICY "Patients can create appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can update their own appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Doctors can update their appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

-- Create policies for medical records
CREATE POLICY "Users can view their own medical records"
  ON medical_records
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own medical records"
  ON medical_records
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own medical records"
  ON medical_records
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create policies for insurance information
CREATE POLICY "Users can view their own insurance info"
  ON insurance_info
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own insurance info"
  ON insurance_info
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own insurance info"
  ON insurance_info
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Add updated_at trigger function (if not exists already)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at triggers
CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_info_updated_at
  BEFORE UPDATE ON insurance_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS doctors_user_id_idx ON doctors(user_id);
CREATE INDEX IF NOT EXISTS doctors_specialty_idx ON doctors(specialty);
CREATE INDEX IF NOT EXISTS appointments_patient_id_idx ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS appointments_doctor_id_idx ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS appointments_date_idx ON appointments(date);
CREATE INDEX IF NOT EXISTS appointments_status_idx ON appointments(status);
CREATE INDEX IF NOT EXISTS medical_records_user_id_idx ON medical_records(user_id);
CREATE INDEX IF NOT EXISTS insurance_info_user_id_idx ON insurance_info(user_id);