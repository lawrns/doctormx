-- Telemedicine System Database Schema
-- For 13,000 doctors providing 50 MXN consultations

-- Doctor availability status table
CREATE TABLE doctor_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id UUID REFERENCES doctor_profiles(user_id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT false,
    consultation_price DECIMAL(10,2) DEFAULT 50.00,
    current_capacity INTEGER DEFAULT 0,
    max_concurrent_consults INTEGER DEFAULT 3,
    average_response_time INTEGER DEFAULT 120, -- seconds
    specialties TEXT[],
    availability_hours JSONB, -- {"monday": {"start": "09:00", "end": "18:00"}, ...}
    last_online TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consultation requests from patients
CREATE TABLE consultation_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high')) DEFAULT 'medium',
    symptoms TEXT[],
    description TEXT,
    preferred_specialty TEXT,
    max_wait_time INTEGER DEFAULT 600, -- seconds
    status TEXT CHECK (status IN ('pending', 'matched', 'cancelled', 'expired')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 minutes')
);

-- Telemedicine sessions
CREATE TABLE telemedicine_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_code TEXT UNIQUE NOT NULL,
    doctor_id UUID REFERENCES doctor_profiles(user_id) ON DELETE CASCADE,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    consultation_request_id UUID REFERENCES consultation_requests(id),
    meeting_link TEXT,
    status TEXT CHECK (status IN ('waiting', 'active', 'completed', 'cancelled')) DEFAULT 'waiting',
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    consultation_fee DECIMAL(10,2) DEFAULT 50.00,
    platform_fee DECIMAL(10,2) DEFAULT 5.00,
    doctor_earnings DECIMAL(10,2) DEFAULT 45.00,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    patient_feedback TEXT,
    doctor_notes TEXT,
    prescription_issued BOOLEAN DEFAULT false,
    follow_up_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctor earnings tracking
CREATE TABLE doctor_earnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id UUID REFERENCES doctor_profiles(user_id) ON DELETE CASCADE,
    session_id UUID REFERENCES telemedicine_sessions(id),
    amount DECIMAL(10,2) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    month INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE),
    year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    status TEXT CHECK (status IN ('pending', 'paid', 'hold')) DEFAULT 'pending',
    payout_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time consultation queue
CREATE TABLE consultation_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consultation_request_id UUID REFERENCES consultation_requests(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctor_profiles(user_id) ON DELETE CASCADE,
    queue_position INTEGER,
    estimated_wait_time INTEGER, -- seconds
    status TEXT CHECK (status IN ('queued', 'matched', 'expired')) DEFAULT 'queued',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctor performance metrics
CREATE TABLE doctor_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id UUID REFERENCES doctor_profiles(user_id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    total_consultations INTEGER DEFAULT 0,
    completed_consultations INTEGER DEFAULT 0,
    cancelled_consultations INTEGER DEFAULT 0,
    average_session_duration INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    online_hours INTEGER DEFAULT 0,
    response_time_avg INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(doctor_id, date)
);

-- Indexes for performance
CREATE INDEX idx_doctor_availability_available ON doctor_availability(is_available, doctor_id);
CREATE INDEX idx_doctor_availability_specialty ON doctor_availability USING GIN(specialties);
CREATE INDEX idx_consultation_requests_status ON consultation_requests(status, created_at);
CREATE INDEX idx_consultation_requests_urgency ON consultation_requests(urgency_level, created_at);
CREATE INDEX idx_telemedicine_sessions_status ON telemedicine_sessions(status, created_at);
CREATE INDEX idx_telemedicine_sessions_doctor ON telemedicine_sessions(doctor_id, start_time);
CREATE INDEX idx_doctor_earnings_doctor_date ON doctor_earnings(doctor_id, date);
CREATE INDEX idx_consultation_queue_status ON consultation_queue(status, created_at);

-- Real-time functions
CREATE OR REPLACE FUNCTION update_doctor_availability_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.last_online = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER doctor_availability_updated
    BEFORE UPDATE ON doctor_availability
    FOR EACH ROW
    EXECUTE FUNCTION update_doctor_availability_timestamp();

-- Automatic session completion
CREATE OR REPLACE FUNCTION auto_complete_sessions()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.end_time = NOW();
        NEW.duration_minutes = EXTRACT(EPOCH FROM (NOW() - NEW.start_time)) / 60;
        
        -- Create earnings record
        INSERT INTO doctor_earnings (doctor_id, session_id, amount)
        VALUES (NEW.doctor_id, NEW.id, NEW.doctor_earnings);
        
        -- Update doctor metrics
        INSERT INTO doctor_metrics (doctor_id, total_consultations, completed_consultations, total_earnings)
        VALUES (NEW.doctor_id, 1, 1, NEW.doctor_earnings)
        ON CONFLICT (doctor_id, date)
        DO UPDATE SET
            total_consultations = doctor_metrics.total_consultations + 1,
            completed_consultations = doctor_metrics.completed_consultations + 1,
            total_earnings = doctor_metrics.total_earnings + NEW.doctor_earnings,
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER session_completion_trigger
    BEFORE UPDATE ON telemedicine_sessions
    FOR EACH ROW
    EXECUTE FUNCTION auto_complete_sessions();

-- Row Level Security
ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemedicine_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Doctors can manage their availability" ON doctor_availability
    FOR ALL USING (doctor_id = auth.uid());

CREATE POLICY "Patients can create consultation requests" ON consultation_requests
    FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can view their requests" ON consultation_requests
    FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view matched sessions" ON telemedicine_sessions
    FOR SELECT USING (doctor_id = auth.uid() OR patient_id = auth.uid());

CREATE POLICY "Doctors can update their sessions" ON telemedicine_sessions
    FOR UPDATE USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can view their earnings" ON doctor_earnings
    FOR SELECT USING (doctor_id = auth.uid());

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON doctor_availability TO authenticated;
GRANT SELECT, INSERT, UPDATE ON consultation_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON telemedicine_sessions TO authenticated;
GRANT SELECT ON doctor_earnings TO authenticated;
GRANT SELECT, INSERT ON consultation_queue TO authenticated;
GRANT SELECT ON doctor_metrics TO authenticated;