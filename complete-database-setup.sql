-- Complete DoctorMX Database Setup
-- This includes all tables needed for the application to function properly

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- AUTH PROFILE TABLES
-- =====================================================

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.doctor_profiles CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Create user_profiles table
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    blood_type VARCHAR(5) CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    address JSONB DEFAULT '{}'::jsonb,
    preferences JSONB DEFAULT '{"language": "es", "notifications": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(auth_user_id)
);

-- Create doctor_profiles table
CREATE TABLE public.doctor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    subspecialty VARCHAR(100),
    medical_school VARCHAR(255),
    graduation_year INTEGER,
    years_experience INTEGER DEFAULT 0,
    languages TEXT[] DEFAULT ARRAY['español']::TEXT[],
    certifications JSONB DEFAULT '[]'::jsonb,
    consultation_fee DECIMAL(10, 2),
    accepts_insurance BOOLEAN DEFAULT true,
    insurance_providers TEXT[],
    office_address JSONB DEFAULT '{}'::jsonb,
    office_hours JSONB DEFAULT '{}'::jsonb,
    verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMP WITH TIME ZONE,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
    bio TEXT,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(auth_user_id)
);

-- Create admin_users table
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'moderator', 'support')),
    permissions JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(auth_user_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_user_profiles_auth_user_id ON public.user_profiles(auth_user_id);
CREATE INDEX idx_doctor_profiles_auth_user_id ON public.doctor_profiles(auth_user_id);
CREATE INDEX idx_doctor_profiles_specialty ON public.doctor_profiles(specialty);
CREATE INDEX idx_doctor_profiles_verified ON public.doctor_profiles(verified);
CREATE INDEX idx_admin_users_auth_user_id ON public.admin_users(auth_user_id);
CREATE INDEX idx_admin_users_role ON public.admin_users(role);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_doctor_profiles_updated_at BEFORE UPDATE ON public.doctor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- MEDICAL TABLES
-- =====================================================

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

-- Create doctors table (for directory, different from doctor_profiles)
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
    distance INTEGER,
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show')),
    reason_for_visit TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    instructions TEXT,
    refills INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'filled', 'expired', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Doctor Profiles Policies
CREATE POLICY "Public can view verified doctors" ON public.doctor_profiles
    FOR SELECT USING (verified = true);

CREATE POLICY "Doctors can update their own profile" ON public.doctor_profiles
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- Admin Users Policies
CREATE POLICY "Admins can view admin users" ON public.admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE auth_user_id = auth.uid()
        )
    );

-- Appointments Policies
CREATE POLICY "Users can view their own appointments" ON public.appointments
    FOR SELECT USING (
        patient_id IN (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()) OR
        doctor_id IN (SELECT id FROM public.doctor_profiles WHERE auth_user_id = auth.uid())
    );

-- Prescriptions Policies
CREATE POLICY "Users can view their own prescriptions" ON public.prescriptions
    FOR SELECT USING (
        patient_id IN (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()) OR
        doctor_id IN (SELECT id FROM public.doctor_profiles WHERE auth_user_id = auth.uid())
    );

-- Medical Knowledge Policy (public read)
CREATE POLICY "Anyone can read medical knowledge" ON public.medical_knowledge
    FOR SELECT USING (true);

-- Doctors Directory Policy (public read)
CREATE POLICY "Anyone can view doctors directory" ON public.doctors
    FOR SELECT USING (true);

-- Medications Policy (public read)
CREATE POLICY "Anyone can view medications" ON public.medications
    FOR SELECT USING (true);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE auth_user_id = user_id AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is verified doctor
CREATE OR REPLACE FUNCTION is_verified_doctor(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.doctor_profiles
        WHERE auth_user_id = user_id AND verified = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SAMPLE DATA (MEDICAL KNOWLEDGE)
-- =====================================================

-- Insert sample medical knowledge data
INSERT INTO public.medical_knowledge (terms, description, symptoms, treatments, severity_level, specialty) VALUES
('Dolor de cabeza', 'Dolor o molestia en la cabeza, cuero cabelludo o cuello', 
 ARRAY['dolor punzante', 'presión', 'sensibilidad a la luz', 'náuseas'], 
 ARRAY['paracetamol', 'ibuprofeno', 'descanso', 'hidratación', 'compresas frías'], 
 3, 'Neurología'),
 
('Gripe', 'Infección viral respiratoria común', 
 ARRAY['fiebre', 'tos', 'dolor muscular', 'fatiga', 'congestión nasal'], 
 ARRAY['reposo', 'líquidos abundantes', 'paracetamol para fiebre', 'antivirales si es necesario'], 
 4, 'Medicina General'),
 
('Diabetes tipo 2', 'Trastorno metabólico caracterizado por niveles altos de azúcar en sangre', 
 ARRAY['sed excesiva', 'micción frecuente', 'fatiga', 'visión borrosa', 'heridas que sanan lentamente'], 
 ARRAY['metformina', 'dieta balanceada', 'ejercicio regular', 'monitoreo de glucosa', 'insulina si es necesario'], 
 7, 'Endocrinología'),
 
('Hipertensión', 'Presión arterial elevada de forma crónica', 
 ARRAY['dolor de cabeza', 'mareos', 'visión borrosa', 'dolor en el pecho', 'dificultad para respirar'], 
 ARRAY['enalapril', 'losartán', 'dieta baja en sodio', 'ejercicio regular', 'control de peso'], 
 6, 'Cardiología'),
 
('Gastritis', 'Inflamación del revestimiento del estómago', 
 ARRAY['dolor abdominal', 'náuseas', 'vómitos', 'pérdida de apetito', 'sensación de plenitud'], 
 ARRAY['omeprazol', 'ranitidina', 'dieta blanda', 'evitar irritantes', 'antiácidos'], 
 5, 'Gastroenterología')
ON CONFLICT DO NOTHING;

-- =====================================================
-- FINAL MESSAGE
-- =====================================================

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE 'Tables created: user_profiles, doctor_profiles, admin_users, medical_knowledge, doctors, medications, appointments, prescriptions';
    RAISE NOTICE 'Row Level Security policies applied';
    RAISE NOTICE 'Sample medical knowledge data inserted';
END $$;