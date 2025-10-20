-- Migration: Create doctor_specialties table
-- This table stores the relationship between doctors and their specialties

CREATE TABLE IF NOT EXISTS doctor_specialties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(user_id) ON DELETE CASCADE,
    specialty VARCHAR(100) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    years_experience INTEGER DEFAULT 0,
    certification_date DATE,
    certification_body VARCHAR(200),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doctor_specialties_doctor_id ON doctor_specialties(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_specialties_specialty ON doctor_specialties(specialty);
CREATE INDEX IF NOT EXISTS idx_doctor_specialties_is_primary ON doctor_specialties(is_primary);

-- Add RLS policies
ALTER TABLE doctor_specialties ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Public read access for doctor specialties" ON doctor_specialties
    FOR SELECT USING (true);

-- Policy for authenticated users to insert their own specialties
CREATE POLICY "Doctors can insert their own specialties" ON doctor_specialties
    FOR INSERT WITH CHECK (
        auth.uid() = doctor_id OR 
        EXISTS (
            SELECT 1 FROM doctors 
            WHERE user_id = auth.uid() AND role = 'doctor'
        )
    );

-- Policy for doctors to update their own specialties
CREATE POLICY "Doctors can update their own specialties" ON doctor_specialties
    FOR UPDATE USING (
        auth.uid() = doctor_id OR 
        EXISTS (
            SELECT 1 FROM doctors 
            WHERE user_id = auth.uid() AND role = 'doctor'
        )
    );

-- Policy for doctors to delete their own specialties
CREATE POLICY "Doctors can delete their own specialties" ON doctor_specialties
    FOR DELETE USING (
        auth.uid() = doctor_id OR 
        EXISTS (
            SELECT 1 FROM doctors 
            WHERE user_id = auth.uid() AND role = 'doctor'
        )
    );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_doctor_specialties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_doctor_specialties_updated_at
    BEFORE UPDATE ON doctor_specialties
    FOR EACH ROW
    EXECUTE FUNCTION update_doctor_specialties_updated_at();

-- Insert some common specialties for reference
INSERT INTO doctor_specialties (doctor_id, specialty, is_primary, years_experience) VALUES
    ('00000000-0000-0000-0000-000000000000', 'Medicina General', true, 0),
    ('00000000-0000-0000-0000-000000000000', 'Cardiología', true, 0),
    ('00000000-0000-0000-0000-000000000000', 'Dermatología', true, 0),
    ('00000000-0000-0000-0000-000000000000', 'Ginecología', true, 0),
    ('00000000-0000-0000-0000-000000000000', 'Pediatría', true, 0),
    ('00000000-0000-0000-0000-000000000000', 'Psiquiatría', true, 0),
    ('00000000-0000-0000-0000-000000000000', 'Neurología', true, 0),
    ('00000000-0000-0000-0000-000000000000', 'Oftalmología', true, 0),
    ('00000000-0000-0000-0000-000000000000', 'Otorrinolaringología', true, 0),
    ('00000000-0000-0000-0000-000000000000', 'Traumatología', true, 0),
    ('00000000-0000-0000-0000-000000000000', 'Urología', true, 0),
    ('00000000-0000-0000-0000-000000000000', 'Gastroenterología', true, 0),
    ('00000000-0000-0000-0000-000000000000', 'Endocrinología', true, 0),
    ('00000000-0000-0000-0000-000000000000', 'Neumología', true, 0),
    ('00000000-0000-0000-0000-000000000000', 'Oncología', true, 0),
    ('00000000-0000-0000-0000-000000000000', 'Anestesiología', true, 0),
    ('00000000-0000-0000-0000-000000000000', 'Radiología', true, 0),
    ('00000000-0000-0000-0000-000000000000', 'Patología', true, 0),
    ('00000000-0000-0000-0000-000000000000', 'Medicina Preventiva', true, 0),
    ('00000000-0000-0000-0000-000000000000', 'Medicina del Trabajo', true, 0),
    ('00000000-0000-0000-0000-000000000000', 'Medicina Forense', true, 0),
    ('00000000-0000-0000-0000-000000000000', 'Nutriología', true, 0),
    ('00000000-0000-0000-0000-000000000000', 'Psicología', true, 0),
    ('00000000-0000-0000-0000-000000000000', 'Fisioterapia', true, 0),
    ('00000000-0000-0000-0000-000000000000', 'Odontología', true, 0)
ON CONFLICT DO NOTHING;

-- Delete the dummy records
DELETE FROM doctor_specialties WHERE doctor_id = '00000000-0000-0000-0000-000000000000';
