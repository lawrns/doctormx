-- Create doctor_profiles table for DoctorMX
CREATE TABLE IF NOT EXISTS doctor_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_completo TEXT NOT NULL,
    especialidad TEXT NOT NULL,
    cedula_profesional TEXT NOT NULL,
    telefono TEXT NOT NULL,
    email TEXT NOT NULL,
    anos_experiencia TEXT NOT NULL,
    institucion TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    verificado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id),
    UNIQUE(cedula_profesional),
    UNIQUE(email)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_user_id ON doctor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_status ON doctor_profiles(status);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_especialidad ON doctor_profiles(especialidad);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_cedula ON doctor_profiles(cedula_profesional);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_doctor_profiles_updated_at 
    BEFORE UPDATE ON doctor_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Set up Row Level Security (RLS)
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own doctor profile" ON doctor_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own doctor profile" ON doctor_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own doctor profile" ON doctor_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all profiles (for admin interface)
-- Note: You'll need to create an admin role and assign it to admin users
CREATE POLICY "Admins can view all doctor profiles" ON doctor_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Grant necessary permissions
GRANT ALL ON doctor_profiles TO authenticated;
GRANT ALL ON doctor_profiles TO service_role;

-- Insert some sample data for testing (optional)
-- Note: Replace these UUIDs with actual user IDs from your auth.users table
/*
INSERT INTO doctor_profiles (
    user_id, 
    nombre_completo, 
    especialidad, 
    cedula_profesional, 
    telefono, 
    email, 
    anos_experiencia, 
    institucion, 
    status, 
    verificado
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'Dr. María González Hernández',
    'Cardiología',
    '1234567',
    '55 1234 5678',
    'maria.gonzalez@ejemplo.com',
    '11-20',
    'Hospital General de México',
    'approved',
    true
),
(
    '00000000-0000-0000-0000-000000000002',
    'Dr. Carlos Mendoza López',
    'Pediatría',
    '2345678',
    '55 2345 6789',
    'carlos.mendoza@ejemplo.com',
    '4-10',
    'Hospital Infantil de México',
    'approved',
    true
);
*/

-- Create view for public doctor information (for listings)
CREATE OR REPLACE VIEW public_doctor_profiles AS
SELECT 
    dp.id,
    dp.nombre_completo,
    dp.especialidad,
    dp.anos_experiencia,
    dp.institucion,
    dp.created_at
FROM doctor_profiles dp
WHERE dp.status = 'approved' AND dp.verificado = true;

-- Grant select on the view
GRANT SELECT ON public_doctor_profiles TO authenticated;
GRANT SELECT ON public_doctor_profiles TO anon; 