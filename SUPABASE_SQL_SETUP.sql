-- DoctorMX Production Database Setup for Supabase
-- Copy and paste this entire script into the Supabase SQL Editor
-- Run this script to create all required tables and policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('masculino', 'femenino', 'otro', 'prefiero_no_decir')),
    blood_type TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    address JSONB,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(auth_user_id),
    UNIQUE(email)
);

-- Doctor profiles table (for medical professionals)
CREATE TABLE IF NOT EXISTS public.doctor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    license_number TEXT NOT NULL,
    specialty TEXT NOT NULL,
    subspecialty TEXT,
    medical_school TEXT,
    years_experience INTEGER DEFAULT 0,
    languages JSONB DEFAULT '["español"]'::jsonb,
    certifications JSONB DEFAULT '[]'::jsonb,
    hospital_affiliations JSONB DEFAULT '[]'::jsonb,
    consultation_fee DECIMAL(10,2),
    accepts_insurance BOOLEAN DEFAULT true,
    office_address JSONB,
    office_hours JSONB,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
    verification_documents JSONB DEFAULT '[]'::jsonb,
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(auth_user_id),
    UNIQUE(license_number)
);

-- Admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'moderator')),
    permissions JSONB DEFAULT '[]'::jsonb,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(auth_user_id)
);

-- Family members table
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('masculino', 'femenino', 'otro')),
    blood_type TEXT,
    medical_conditions JSONB DEFAULT '[]'::jsonb,
    allergies JSONB DEFAULT '[]'::jsonb,
    medications JSONB DEFAULT '[]'::jsonb,
    emergency_contact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical history table
CREATE TABLE IF NOT EXISTS public.medical_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    family_member_id UUID REFERENCES public.family_members(id) ON DELETE CASCADE,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('condition', 'allergy', 'medication', 'procedure', 'test_result', 'vaccination')),
    title TEXT NOT NULL,
    description TEXT,
    date_recorded DATE NOT NULL,
    doctor_name TEXT,
    hospital_clinic TEXT,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'ongoing', 'inactive')),
    metadata JSONB DEFAULT '{}'::jsonb,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced appointments table
CREATE TABLE IF NOT EXISTS public.enhanced_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
    family_member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    appointment_type TEXT DEFAULT 'consultation' CHECK (appointment_type IN ('consultation', 'follow_up', 'emergency', 'procedure', 'test')),
    consultation_mode TEXT DEFAULT 'in_person' CHECK (consultation_mode IN ('in_person', 'video', 'phone')),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    chief_complaint TEXT,
    symptoms JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    doctor_notes TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    total_cost DECIMAL(10,2),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partially_paid', 'refunded')),
    meeting_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced prescriptions table
CREATE TABLE IF NOT EXISTS public.enhanced_prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.enhanced_appointments(id) ON DELETE SET NULL,
    prescription_number TEXT UNIQUE NOT NULL,
    diagnosis TEXT,
    medications JSONB NOT NULL,
    instructions TEXT,
    valid_until DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'expired', 'cancelled')),
    pharmacy_notes TEXT,
    digital_signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab results table
CREATE TABLE IF NOT EXISTS public.lab_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctor_profiles(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.enhanced_appointments(id) ON DELETE SET NULL,
    test_name TEXT NOT NULL,
    test_type TEXT NOT NULL,
    test_date DATE NOT NULL,
    results JSONB NOT NULL,
    reference_ranges JSONB,
    abnormal_flags JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    lab_name TEXT,
    technician_notes TEXT,
    doctor_interpretation TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community groups table
CREATE TABLE IF NOT EXISTS public.community_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    creator_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    moderators JSONB DEFAULT '[]'::jsonb,
    member_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    guidelines TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community discussions table
CREATE TABLE IF NOT EXISTS public.community_discussions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    replies_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Educational content table
CREATE TABLE IF NOT EXISTS public.educational_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('article', 'video', 'infographic', 'quiz', 'checklist')),
    category TEXT NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    author_id UUID REFERENCES public.doctor_profiles(id) ON DELETE SET NULL,
    difficulty_level TEXT DEFAULT 'basic' CHECK (difficulty_level IN ('basic', 'intermediate', 'advanced')),
    estimated_read_time INTEGER DEFAULT 5,
    mexican_context BOOLEAN DEFAULT true,
    medical_review_status TEXT DEFAULT 'pending' CHECK (medical_review_status IN ('pending', 'approved', 'rejected', 'needs_revision')),
    reviewer_id UUID REFERENCES public.doctor_profiles(id) ON DELETE SET NULL,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation history table (for AI doctor chats)
CREATE TABLE IF NOT EXISTS public.conversation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    summary TEXT,
    symptoms JSONB DEFAULT '[]'::jsonb,
    ai_assessment JSONB,
    urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high', 'emergency')),
    follow_up_recommendations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create update triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to all relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctor_profiles_updated_at BEFORE UPDATE ON public.doctor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON public.family_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_history_updated_at BEFORE UPDATE ON public.medical_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_enhanced_appointments_updated_at BEFORE UPDATE ON public.enhanced_appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_enhanced_prescriptions_updated_at BEFORE UPDATE ON public.enhanced_prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lab_results_updated_at BEFORE UPDATE ON public.lab_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_groups_updated_at BEFORE UPDATE ON public.community_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_discussions_updated_at BEFORE UPDATE ON public.community_discussions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_educational_content_updated_at BEFORE UPDATE ON public.educational_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversation_history_updated_at BEFORE UPDATE ON public.conversation_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = auth_user_id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Doctor profiles policies
CREATE POLICY "Doctors can view own profile" ON public.doctor_profiles FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Doctors can update own profile" ON public.doctor_profiles FOR UPDATE USING (auth.uid() = auth_user_id);
CREATE POLICY "Public can view verified doctors" ON public.doctor_profiles FOR SELECT USING (verification_status = 'verified');

-- Admin users policies
CREATE POLICY "Admins can view own profile" ON public.admin_users FOR SELECT USING (auth.uid() = auth_user_id);

-- Family members policies
CREATE POLICY "Users can manage own family members" ON public.family_members FOR ALL USING (
    user_profile_id IN (
        SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()
    )
);

-- Medical history policies
CREATE POLICY "Users can manage own medical history" ON public.medical_history FOR ALL USING (
    user_profile_id IN (
        SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()
    ) OR
    family_member_id IN (
        SELECT fm.id FROM public.family_members fm
        JOIN public.user_profiles up ON fm.user_profile_id = up.id
        WHERE up.auth_user_id = auth.uid()
    )
);

-- Appointments policies
CREATE POLICY "Users can view own appointments" ON public.enhanced_appointments FOR SELECT USING (
    patient_id IN (
        SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()
    ) OR
    doctor_id IN (
        SELECT id FROM public.doctor_profiles WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can create appointments" ON public.enhanced_appointments FOR INSERT WITH CHECK (
    patient_id IN (
        SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()
    )
);

-- Educational content policies
CREATE POLICY "Public can view approved educational content" ON public.educational_content FOR SELECT USING (
    medical_review_status = 'approved' AND published_at IS NOT NULL
);

-- Conversation history policies
CREATE POLICY "Users can manage own conversations" ON public.conversation_history FOR ALL USING (
    user_id IN (
        SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()
    )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id ON public.user_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_auth_user_id ON public.doctor_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_specialty ON public.doctor_profiles(specialty);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_verification_status ON public.doctor_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_enhanced_appointments_patient_id ON public.enhanced_appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_appointments_doctor_id ON public.enhanced_appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_appointments_date ON public.enhanced_appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_medical_history_user_profile_id ON public.medical_history(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_conversation_history_user_id ON public.conversation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_history_session_id ON public.conversation_history(session_id);

-- Success message
SELECT 'DoctorMX production database schema setup completed successfully!' as status;