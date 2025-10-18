-- AI Referral System Migration
-- This migration adds tables and functionality for AI-powered doctor referrals

-- Create ai_referrals table
CREATE TABLE IF NOT EXISTS ai_referrals (
    id TEXT PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ai_analysis JSONB NOT NULL,
    matched_doctors JSONB NOT NULL,
    selected_doctor_id UUID REFERENCES doctors(user_id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_ai_referrals_patient_id ON ai_referrals(patient_id);
CREATE INDEX IF NOT EXISTS idx_ai_referrals_status ON ai_referrals(status);
CREATE INDEX IF NOT EXISTS idx_ai_referrals_created_at ON ai_referrals(created_at);

-- Add RLS policies for ai_referrals
ALTER TABLE ai_referrals ENABLE ROW LEVEL SECURITY;

-- Patients can view their own referrals
CREATE POLICY "Patients can view own referrals" ON ai_referrals
    FOR SELECT USING (auth.uid() = patient_id);

-- Patients can update their own referrals
CREATE POLICY "Patients can update own referrals" ON ai_referrals
    FOR UPDATE USING (auth.uid() = patient_id);

-- Doctors can view referrals where they are selected
CREATE POLICY "Doctors can view selected referrals" ON ai_referrals
    FOR SELECT USING (
        selected_doctor_id IN (
            SELECT user_id FROM doctors WHERE user_id = auth.uid()
        )
    );

-- Doctors can update referrals where they are selected
CREATE POLICY "Doctors can update selected referrals" ON ai_referrals
    FOR UPDATE USING (
        selected_doctor_id IN (
            SELECT user_id FROM doctors WHERE user_id = auth.uid()
        )
    );

-- Add columns to doctors table for better matching
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS availability_slots JSONB DEFAULT '[]';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS consultation_fees JSONB DEFAULT '{"base_fee": 500, "currency": "MXN"}';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS insurance_providers TEXT[] DEFAULT '{}';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS response_time_avg INTEGER DEFAULT 24; -- hours
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS ratings JSONB DEFAULT '[]';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS specializations TEXT[] DEFAULT '{}';

-- Create doctor_availability table for more detailed availability tracking
CREATE TABLE IF NOT EXISTS doctor_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(user_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    max_patients INTEGER DEFAULT 1,
    current_bookings INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(doctor_id, date, start_time)
);

-- Create index for efficient availability queries
CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor_date ON doctor_availability(doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_available ON doctor_availability(is_available) WHERE is_available = true;

-- Add RLS policies for doctor_availability
ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;

-- Doctors can manage their own availability
CREATE POLICY "Doctors can manage own availability" ON doctor_availability
    FOR ALL USING (
        doctor_id IN (
            SELECT user_id FROM doctors WHERE user_id = auth.uid()
        )
    );

-- Patients can view available slots
CREATE POLICY "Patients can view available slots" ON doctor_availability
    FOR SELECT USING (is_available = true);

-- Create doctor_ratings table for better rating system
CREATE TABLE IF NOT EXISTS doctor_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(user_id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    consultation_id UUID REFERENCES consults(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(doctor_id, patient_id, consultation_id)
);

-- Create index for efficient rating queries
CREATE INDEX IF NOT EXISTS idx_doctor_ratings_doctor_id ON doctor_ratings(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_ratings_patient_id ON doctor_ratings(patient_id);
CREATE INDEX IF NOT EXISTS idx_doctor_ratings_rating ON doctor_ratings(rating);

-- Add RLS policies for doctor_ratings
ALTER TABLE doctor_ratings ENABLE ROW LEVEL SECURITY;

-- Patients can create ratings for doctors they've consulted
CREATE POLICY "Patients can create ratings" ON doctor_ratings
    FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Patients can view their own ratings
CREATE POLICY "Patients can view own ratings" ON doctor_ratings
    FOR SELECT USING (auth.uid() = patient_id);

-- Doctors can view ratings about them
CREATE POLICY "Doctors can view own ratings" ON doctor_ratings
    FOR SELECT USING (
        doctor_id IN (
            SELECT user_id FROM doctors WHERE user_id = auth.uid()
        )
    );

-- Everyone can view ratings (for public display)
CREATE POLICY "Everyone can view ratings" ON doctor_ratings
    FOR SELECT USING (true);

-- Create appointment_bookings table for appointment management
CREATE TABLE IF NOT EXISTS appointment_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(user_id) ON DELETE CASCADE,
    availability_id UUID NOT NULL REFERENCES doctor_availability(id) ON DELETE CASCADE,
    referral_id TEXT REFERENCES ai_referrals(id),
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    consultation_fee DECIMAL(10,2),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient booking queries
CREATE INDEX IF NOT EXISTS idx_appointment_bookings_patient_id ON appointment_bookings(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointment_bookings_doctor_id ON appointment_bookings(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointment_bookings_status ON appointment_bookings(status);
CREATE INDEX IF NOT EXISTS idx_appointment_bookings_date ON appointment_bookings(created_at);

-- Add RLS policies for appointment_bookings
ALTER TABLE appointment_bookings ENABLE ROW LEVEL SECURITY;

-- Patients can view their own bookings
CREATE POLICY "Patients can view own bookings" ON appointment_bookings
    FOR SELECT USING (auth.uid() = patient_id);

-- Patients can create bookings
CREATE POLICY "Patients can create bookings" ON appointment_bookings
    FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Patients can update their own bookings
CREATE POLICY "Patients can update own bookings" ON appointment_bookings
    FOR UPDATE USING (auth.uid() = patient_id);

-- Doctors can view bookings for their appointments
CREATE POLICY "Doctors can view own bookings" ON appointment_bookings
    FOR SELECT USING (
        doctor_id IN (
            SELECT user_id FROM doctors WHERE user_id = auth.uid()
        )
    );

-- Doctors can update bookings for their appointments
CREATE POLICY "Doctors can update own bookings" ON appointment_bookings
    FOR UPDATE USING (
        doctor_id IN (
            SELECT user_id FROM doctors WHERE user_id = auth.uid()
        )
    );

-- Create function to update availability when booking is made
CREATE OR REPLACE FUNCTION update_availability_on_booking()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment current_bookings when a new booking is made
    IF TG_OP = 'INSERT' THEN
        UPDATE doctor_availability 
        SET current_bookings = current_bookings + 1,
            updated_at = NOW()
        WHERE id = NEW.availability_id;
        
        -- Mark as unavailable if max_patients reached
        UPDATE doctor_availability 
        SET is_available = false,
            updated_at = NOW()
        WHERE id = NEW.availability_id 
        AND current_bookings >= max_patients;
        
        RETURN NEW;
    END IF;
    
    -- Decrement current_bookings when a booking is cancelled
    IF TG_OP = 'DELETE' THEN
        UPDATE doctor_availability 
        SET current_bookings = current_bookings - 1,
            is_available = true,
            updated_at = NOW()
        WHERE id = OLD.availability_id;
        
        RETURN OLD;
    END IF;
    
    -- Handle status changes
    IF TG_OP = 'UPDATE' THEN
        -- If status changed to cancelled, decrement bookings
        IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
            UPDATE doctor_availability 
            SET current_bookings = current_bookings - 1,
                is_available = true,
                updated_at = NOW()
            WHERE id = NEW.availability_id;
        END IF;
        
        -- If status changed from cancelled to active, increment bookings
        IF OLD.status = 'cancelled' AND NEW.status != 'cancelled' THEN
            UPDATE doctor_availability 
            SET current_bookings = current_bookings + 1,
                updated_at = NOW()
            WHERE id = NEW.availability_id;
            
            -- Mark as unavailable if max_patients reached
            UPDATE doctor_availability 
            SET is_available = false,
                updated_at = NOW()
            WHERE id = NEW.availability_id 
            AND current_bookings >= max_patients;
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking updates
DROP TRIGGER IF EXISTS trigger_update_availability_on_booking ON appointment_bookings;
CREATE TRIGGER trigger_update_availability_on_booking
    AFTER INSERT OR UPDATE OR DELETE ON appointment_bookings
    FOR EACH ROW EXECUTE FUNCTION update_availability_on_booking();

-- Create function to update doctor ratings
CREATE OR REPLACE FUNCTION update_doctor_ratings()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the ratings JSONB in doctors table
    UPDATE doctors 
    SET ratings = (
        SELECT jsonb_agg(
            jsonb_build_object(
                'rating', rating,
                'review', review,
                'created_at', created_at
            )
        )
        FROM doctor_ratings 
        WHERE doctor_id = NEW.doctor_id
    ),
    response_time_avg = (
        SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600), 24)
        FROM ai_referrals 
        WHERE selected_doctor_id = NEW.doctor_id
        AND status = 'completed'
    )
    WHERE id = NEW.doctor_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for rating updates
DROP TRIGGER IF EXISTS trigger_update_doctor_ratings ON doctor_ratings;
CREATE TRIGGER trigger_update_doctor_ratings
    AFTER INSERT OR UPDATE OR DELETE ON doctor_ratings
    FOR EACH ROW EXECUTE FUNCTION update_doctor_ratings();

-- Insert sample data for testing
INSERT INTO doctor_availability (doctor_id, date, start_time, end_time, is_available, max_patients)
SELECT 
    d.user_id,
    CURRENT_DATE + INTERVAL '1 day',
    '09:00'::TIME,
    '17:00'::TIME,
    true,
    8
FROM doctors d
WHERE d.verification_status = 'verified'
LIMIT 5;

-- Insert sample ratings
INSERT INTO doctor_ratings (doctor_id, patient_id, rating, review)
SELECT 
    d.user_id,
    u.id,
    CASE 
        WHEN random() < 0.3 THEN 5
        WHEN random() < 0.5 THEN 4
        WHEN random() < 0.7 THEN 3
        WHEN random() < 0.9 THEN 2
        ELSE 1
    END,
    CASE 
        WHEN random() < 0.5 THEN 'Excelente atención médica'
        WHEN random() < 0.7 THEN 'Muy profesional y atento'
        WHEN random() < 0.9 THEN 'Buen servicio'
        ELSE 'Atención regular'
    END
FROM doctors d
CROSS JOIN users u
WHERE d.verification_status = 'verified'
AND u.role = 'patient'
LIMIT 10;

-- Update doctors table with sample data
UPDATE doctors 
SET 
    availability_slots = '[
        {"start_time": "2024-01-25T09:00:00Z", "end_time": "2024-01-25T10:00:00Z", "available": true},
        {"start_time": "2024-01-25T10:00:00Z", "end_time": "2024-01-25T11:00:00Z", "available": true},
        {"start_time": "2024-01-25T11:00:00Z", "end_time": "2024-01-25T12:00:00Z", "available": true}
    ]'::jsonb,
    consultation_fees = '{"base_fee": 500, "currency": "MXN", "follow_up": 300}'::jsonb,
    insurance_providers = ARRAY['IMSS', 'ISSSTE', 'Seguro Popular'],
    response_time_avg = FLOOR(RANDOM() * 12) + 1,
    specializations = ARRAY['Medicina General', 'Medicina Interna']
WHERE verification_status = 'verified';

-- Create view for doctor statistics
CREATE OR REPLACE VIEW doctor_stats AS
SELECT 
    d.user_id as id,
    d.user_id,
    d.specialties,
    d.verification_status,
    d.license_status,
    COUNT(DISTINCT ab.id) as total_appointments,
    COUNT(DISTINCT dr.id) as total_ratings,
    COALESCE(AVG(dr.rating), 0) as avg_rating,
    COUNT(DISTINCT ar.id) as total_referrals,
    COALESCE(AVG(d.response_time_avg), 24) as avg_response_time
FROM doctors d
LEFT JOIN appointment_bookings ab ON d.user_id = ab.doctor_id
LEFT JOIN doctor_ratings dr ON d.user_id = dr.doctor_id
LEFT JOIN ai_referrals ar ON d.user_id = ar.selected_doctor_id
GROUP BY d.user_id, d.specialties, d.verification_status, d.license_status;

-- Grant access to the view
GRANT SELECT ON doctor_stats TO authenticated;
