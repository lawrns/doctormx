
-- ============================================================
-- Phase 1: Appointment Reminders + Patient Intake Forms
-- ============================================================

-- Reminder schedule entries per appointment
CREATE TABLE IF NOT EXISTS appointment_reminder_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    -- Timing: hours before appointment to send (-48, -24, -2, etc.)
    hours_before INTEGER NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
    scheduled_at TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    patient_response TEXT CHECK (patient_response IN ('confirm', 'cancel', 'reschedule', NULL)),
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reminder_schedules_appointment ON appointment_reminder_schedules(appointment_id);
CREATE INDEX idx_reminder_schedules_scheduled ON appointment_reminder_schedules(scheduled_at, status) WHERE status = 'pending';
CREATE INDEX idx_reminder_schedules_doctor ON appointment_reminder_schedules(doctor_id);

-- Doctor reminder preferences (global + per-appointment overrides)
CREATE TABLE IF NOT EXISTS doctor_reminder_preferences (
    doctor_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    -- Default channels enabled
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    sms_enabled BOOLEAN NOT NULL DEFAULT false,
    whatsapp_enabled BOOLEAN NOT NULL DEFAULT true,
    -- Default reminder timings (hours before)
    reminder_48h BOOLEAN NOT NULL DEFAULT true,
    reminder_24h BOOLEAN NOT NULL DEFAULT true,
    reminder_2h BOOLEAN NOT NULL DEFAULT true,
    -- Languages
    preferred_language TEXT NOT NULL DEFAULT 'es' CHECK (preferred_language IN ('es', 'en')),
    -- Custom message template overrides (NULL = use default)
    custom_subject TEXT,
    custom_body TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Intake form templates (doctors create reusable forms)
CREATE TABLE IF NOT EXISTS intake_form_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    specialty_context TEXT, -- e.g. 'general', 'dermatology', 'gynecology'
    description TEXT,
    -- JSON array of field definitions
    fields_json JSONB NOT NULL DEFAULT '[]',
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_intake_templates_doctor ON intake_form_templates(doctor_id);

-- Ensure only one default per doctor
CREATE UNIQUE INDEX idx_intake_templates_doctor_default 
    ON intake_form_templates(doctor_id) 
    WHERE is_default = true;

-- Patient intake responses (filled before appointment)
CREATE TABLE IF NOT EXISTS patient_intake_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES intake_form_templates(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    -- JSON object keyed by field id
    responses_json JSONB NOT NULL DEFAULT '{}',
    -- Computed flag for red flags / urgent items
    has_red_flags BOOLEAN NOT NULL DEFAULT false,
    red_flags JSONB DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'reviewed')),
    completed_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_intake_responses_appointment ON patient_intake_responses(appointment_id);
CREATE INDEX idx_intake_responses_doctor ON patient_intake_responses(doctor_id);
CREATE INDEX idx_intake_responses_status ON patient_intake_responses(status);

-- Enable RLS
ALTER TABLE appointment_reminder_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_reminder_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_intake_responses ENABLE ROW LEVEL SECURITY;

-- RLS policies for appointment_reminder_schedules
CREATE POLICY "Doctors can view their own reminders"
    ON appointment_reminder_schedules
    FOR SELECT
    USING (doctor_id = auth.uid());

CREATE POLICY "System can manage reminders"
    ON appointment_reminder_schedules
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- RLS policies for doctor_reminder_preferences
CREATE POLICY "Doctors can manage their own preferences"
    ON doctor_reminder_preferences
    FOR ALL
    USING (doctor_id = auth.uid());

-- RLS policies for intake_form_templates
CREATE POLICY "Doctors can CRUD their own templates"
    ON intake_form_templates
    FOR ALL
    USING (doctor_id = auth.uid());

CREATE POLICY "Anyone can view active templates"
    ON intake_form_templates
    FOR SELECT
    USING (is_active = true);

-- RLS policies for patient_intake_responses
CREATE POLICY "Doctors can view responses for their appointments"
    ON patient_intake_responses
    FOR SELECT
    USING (doctor_id = auth.uid());

CREATE POLICY "Patients can create/update their own responses"
    ON patient_intake_responses
    FOR ALL
    USING (patient_id = auth.uid());

