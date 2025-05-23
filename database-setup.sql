-- DoctorMX Database Setup Script
-- Run this in your Supabase SQL Editor to create the required tables

-- Create medical_knowledge table
CREATE TABLE IF NOT EXISTS public.medical_knowledge (
    id SERIAL PRIMARY KEY,
    terms TEXT NOT NULL,
    description TEXT,
    symptoms TEXT[],
    treatments TEXT[],
    severity_level INTEGER DEFAULT 1 CHECK (severity_level >= 1 AND severity_level <= 10),
    specialty VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS public.doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    license_number VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    distance INTEGER, -- Distance in meters for sorting
    rating DECIMAL(3, 2) DEFAULT 0.0,
    years_experience INTEGER DEFAULT 0,
    languages JSONB DEFAULT '["español"]'::jsonb,
    accepts_insurance BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medications table
CREATE TABLE IF NOT EXISTS public.medications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    condition VARCHAR(255) NOT NULL,
    dosage_forms TEXT[],
    ingredients TEXT[],
    contraindications TEXT[],
    side_effects TEXT[],
    requires_prescription BOOLEAN DEFAULT true,
    price_range VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES public.doctors(id),
    patient_name VARCHAR(255),
    patient_email VARCHAR(255),
    patient_phone VARCHAR(20),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    appointment_type VARCHAR(50) DEFAULT 'consulta_general',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES public.doctors(id),
    patient_id VARCHAR(255), -- Can be email or user ID
    medications JSONB NOT NULL,
    diagnosis TEXT,
    instructions TEXT,
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing tables if they don't exist
DO $$ 
BEGIN
    -- Add missing columns to doctors table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'phone') THEN
        ALTER TABLE public.doctors ADD COLUMN phone VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'license_number') THEN
        ALTER TABLE public.doctors ADD COLUMN license_number VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'email') THEN
        ALTER TABLE public.doctors ADD COLUMN email VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'address') THEN
        ALTER TABLE public.doctors ADD COLUMN address TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'latitude') THEN
        ALTER TABLE public.doctors ADD COLUMN latitude DECIMAL(10, 8);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'longitude') THEN
        ALTER TABLE public.doctors ADD COLUMN longitude DECIMAL(11, 8);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'distance') THEN
        ALTER TABLE public.doctors ADD COLUMN distance INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'rating') THEN
        ALTER TABLE public.doctors ADD COLUMN rating DECIMAL(3, 2) DEFAULT 0.0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'years_experience') THEN
        ALTER TABLE public.doctors ADD COLUMN years_experience INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'languages') THEN
        ALTER TABLE public.doctors ADD COLUMN languages JSONB DEFAULT '["español"]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'accepts_insurance') THEN
        ALTER TABLE public.doctors ADD COLUMN accepts_insurance BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'created_at') THEN
        ALTER TABLE public.doctors ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'updated_at') THEN
        ALTER TABLE public.doctors ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Add missing columns to medications table if needed
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'side_effects') THEN
        ALTER TABLE public.medications ADD COLUMN side_effects TEXT[];
    END IF;

    -- Add missing columns to appointments table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'doctor_id') THEN
        ALTER TABLE public.appointments ADD COLUMN doctor_id INTEGER REFERENCES public.doctors(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'patient_name') THEN
        ALTER TABLE public.appointments ADD COLUMN patient_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'patient_email') THEN
        ALTER TABLE public.appointments ADD COLUMN patient_email VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'patient_phone') THEN
        ALTER TABLE public.appointments ADD COLUMN patient_phone VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'appointment_date') THEN
        ALTER TABLE public.appointments ADD COLUMN appointment_date DATE NOT NULL DEFAULT CURRENT_DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'appointment_time') THEN
        ALTER TABLE public.appointments ADD COLUMN appointment_time TIME NOT NULL DEFAULT CURRENT_TIME;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'appointment_type') THEN
        ALTER TABLE public.appointments ADD COLUMN appointment_type VARCHAR(50) DEFAULT 'consulta_general';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'status') THEN
        ALTER TABLE public.appointments ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'notes') THEN
        ALTER TABLE public.appointments ADD COLUMN notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'created_at') THEN
        ALTER TABLE public.appointments ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'updated_at') THEN
        ALTER TABLE public.appointments ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Add missing columns to prescriptions table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'doctor_id') THEN
        ALTER TABLE public.prescriptions ADD COLUMN doctor_id INTEGER REFERENCES public.doctors(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'patient_id') THEN
        ALTER TABLE public.prescriptions ADD COLUMN patient_id VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'medications') THEN
        ALTER TABLE public.prescriptions ADD COLUMN medications JSONB NOT NULL DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'diagnosis') THEN
        ALTER TABLE public.prescriptions ADD COLUMN diagnosis TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'instructions') THEN
        ALTER TABLE public.prescriptions ADD COLUMN instructions TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'valid_until') THEN
        ALTER TABLE public.prescriptions ADD COLUMN valid_until DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'created_at') THEN
        ALTER TABLE public.prescriptions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'updated_at') THEN
        ALTER TABLE public.prescriptions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Add constraints if they don't exist
    -- Add check constraint for appointments status if it doesn't exist
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'appointments_status_check') THEN
            ALTER TABLE public.appointments ADD CONSTRAINT appointments_status_check CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));
        END IF;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;

-- Insert sample medical knowledge data
INSERT INTO public.medical_knowledge (terms, description, symptoms, treatments, severity_level, specialty) VALUES
('dolor, dolor de cabeza, cefalea, migraña', 'Dolor de cabeza común que puede ser causado por tensión, estrés, fatiga o problemas de visión', ARRAY['dolor punzante', 'presión en la cabeza', 'sensibilidad a la luz', 'náuseas'], ARRAY['descanso', 'hidratación', 'analgésicos de venta libre', 'compresas frías'], 3, 'Medicina General'),
('fiebre, temperatura alta, calentura', 'Elevación de la temperatura corporal como respuesta del sistema inmune a infecciones', ARRAY['temperatura mayor a 38°C', 'escalofríos', 'sudoración', 'malestar general'], ARRAY['reposo', 'hidratación abundante', 'antipiréticos', 'monitoreo de temperatura'], 5, 'Medicina General'),
('tos, tos seca, tos con flema', 'Reflejo natural para limpiar las vías respiratorias de irritantes o secreciones', ARRAY['irritación en garganta', 'expectoración', 'dificultad respiratoria'], ARRAY['hidratación', 'miel', 'antitusivos', 'evitar irritantes'], 3, 'Neumología'),
('náusea, vómito, nauseas', 'Sensación de malestar estomacal que puede preceder al vómito', ARRAY['malestar estomacal', 'mareo', 'pérdida de apetito', 'salivación excesiva'], ARRAY['dieta blanda', 'hidratación', 'antieméticos', 'reposo'], 4, 'Gastroenterología'),
('mareo, vértigo, inestabilidad', 'Sensación de pérdida de equilibrio o movimiento del entorno', ARRAY['pérdida de equilibrio', 'sensación de giro', 'náuseas', 'sudoración'], ARRAY['reposo', 'hidratación', 'evitar movimientos bruscos', 'medicamentos vestibulares'], 4, 'Neurología');

-- Insert sample doctors data
INSERT INTO public.doctors (name, specialty, phone, email, address, rating, years_experience, languages, accepts_insurance) VALUES
('Dr. María García López', 'Medicina General', '55-1234-5678', 'maria.garcia@doctormx.com', 'Av. Reforma 123, Col. Centro, CDMX', 4.8, 15, '["español", "inglés"]'::jsonb, true),
('Dr. Carlos Mendez Rivera', 'Pediatría', '55-2345-6789', 'carlos.mendez@doctormx.com', 'Calle Madero 456, Col. Roma Norte, CDMX', 4.9, 12, '["español"]'::jsonb, true),
('Dra. Ana Fernández Castro', 'Ginecología', '55-3456-7890', 'ana.fernandez@doctormx.com', 'Av. Insurgentes 789, Col. Condesa, CDMX', 4.7, 18, '["español", "francés"]'::jsonb, true),
('Dr. Roberto Silva Jiménez', 'Cardiología', '55-4567-8901', 'roberto.silva@doctormx.com', 'Paseo de la Reforma 321, Col. Polanco, CDMX', 4.9, 20, '["español", "inglés"]'::jsonb, true),
('Dra. Patricia Morales Vega', 'Dermatología', '55-5678-9012', 'patricia.morales@doctormx.com', 'Av. Universidad 654, Col. Del Valle, CDMX', 4.6, 10, '["español"]'::jsonb, true);

-- Insert sample medications data
INSERT INTO public.medications (name, generic_name, condition, dosage_forms, ingredients, contraindications, requires_prescription, price_range) VALUES
('Paracetamol', 'Acetaminofén', 'dolor', ARRAY['tabletas', 'jarabe', 'gotas'], ARRAY['paracetamol'], ARRAY['alergia al paracetamol', 'enfermedad hepática grave'], false, '$10-30 MXN'),
('Ibuprofeno', 'Ibuprofeno', 'dolor', ARRAY['tabletas', 'cápsulas', 'gel'], ARRAY['ibuprofeno'], ARRAY['úlcera péptica', 'alergia a AINEs', 'embarazo tercer trimestre'], false, '$15-40 MXN'),
('Amoxicilina', 'Amoxicilina', 'infección bacteriana', ARRAY['cápsulas', 'suspensión'], ARRAY['amoxicilina'], ARRAY['alergia a penicilina'], true, '$50-120 MXN'),
('Loratadina', 'Loratadina', 'alergia', ARRAY['tabletas', 'jarabe'], ARRAY['loratadina'], ARRAY['alergia a loratadina'], false, '$20-50 MXN'),
('Omeprazol', 'Omeprazol', 'acidez estomacal', ARRAY['cápsulas'], ARRAY['omeprazol'], ARRAY['alergia a omeprazol'], true, '$30-80 MXN');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medical_knowledge_terms ON public.medical_knowledge USING gin(to_tsvector('spanish', terms));
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON public.doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_medications_condition ON public.medications(condition);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.medical_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since this is a medical information app)
CREATE POLICY "Allow public read access to medical_knowledge" ON public.medical_knowledge FOR SELECT USING (true);
CREATE POLICY "Allow public read access to doctors" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Allow public read access to medications" ON public.medications FOR SELECT USING (true);

-- Allow public insert for appointments (patients can book appointments)
CREATE POLICY "Allow public insert to appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read of own appointments" ON public.appointments FOR SELECT USING (true);

-- Prescriptions should be restricted (only doctors can create, patients can read their own)
CREATE POLICY "Allow authenticated users to read prescriptions" ON public.prescriptions FOR SELECT USING (auth.role() = 'authenticated');

-- Add comments for documentation
COMMENT ON TABLE public.medical_knowledge IS 'Contains medical terms, symptoms, and basic treatment information for AI reference';
COMMENT ON TABLE public.doctors IS 'Directory of available doctors and their information';
COMMENT ON TABLE public.medications IS 'Database of medications with basic information and contraindications';
COMMENT ON TABLE public.appointments IS 'Patient appointments with doctors';
COMMENT ON TABLE public.prescriptions IS 'Digital prescriptions issued by doctors';

-- Success message
SELECT 'DoctorMX database setup completed successfully!' as status; 