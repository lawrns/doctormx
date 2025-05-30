-- Minimal Auth Tables Setup for DoctorMX
-- This creates only the essential tables needed for authentication to work

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (careful in production!)
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.doctor_profiles CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- Create user_profiles table (simplified)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create doctor_profiles table (simplified)
CREATE TABLE public.doctor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID NOT NULL UNIQUE,
    user_profile_id UUID,
    license_number VARCHAR(100),
    specialty VARCHAR(100),
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_users table (simplified)
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medical_knowledge table (for AI doctor)
CREATE TABLE IF NOT EXISTS public.medical_knowledge (
    id SERIAL PRIMARY KEY,
    terms TEXT NOT NULL,
    description TEXT,
    symptoms TEXT[],
    treatments TEXT[],
    severity_level INTEGER DEFAULT 1,
    specialty VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_knowledge ENABLE ROW LEVEL SECURITY;

-- Simple RLS Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth_user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Public can view medical knowledge" ON public.medical_knowledge
    FOR SELECT USING (true);

-- Insert sample medical knowledge
INSERT INTO public.medical_knowledge (terms, description, symptoms, treatments, severity_level, specialty) VALUES
('Dolor de cabeza', 'Dolor o molestia en la cabeza', 
 ARRAY['dolor punzante', 'presión', 'sensibilidad a la luz'], 
 ARRAY['paracetamol', 'ibuprofeno', 'descanso', 'hidratación'], 
 3, 'Neurología'),
 
('Gripe', 'Infección viral respiratoria', 
 ARRAY['fiebre', 'tos', 'dolor muscular', 'fatiga'], 
 ARRAY['reposo', 'líquidos', 'paracetamol'], 
 4, 'Medicina General'),
 
('Diabetes', 'Trastorno metabólico con azúcar elevada', 
 ARRAY['sed excesiva', 'micción frecuente', 'fatiga'], 
 ARRAY['metformina', 'dieta', 'ejercicio'], 
 7, 'Endocrinología')
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.doctor_profiles TO authenticated;
GRANT ALL ON public.admin_users TO authenticated;
GRANT SELECT ON public.medical_knowledge TO anon, authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_id ON public.user_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_auth_id ON public.doctor_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_auth_id ON public.admin_users(auth_user_id);