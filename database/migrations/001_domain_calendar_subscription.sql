-- Migration for Doctor.mx Platform Enhancement

-- Doctor Domains Table
CREATE TABLE doctor_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    subdomain_prefix TEXT UNIQUE,
    subdomain_url TEXT UNIQUE,
    custom_domain TEXT UNIQUE,
    verification_code TEXT,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
    verified_at TIMESTAMPTZ,
    ssl_status TEXT DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'issued', 'error')),
    ssl_updated_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doctor_domains_doctor_id ON doctor_domains(doctor_id);

-- Doctor Calendars Table
CREATE TABLE doctor_calendars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    source TEXT DEFAULT 'doctormx' CHECK (source IN ('doctormx', 'doctoralia', 'google', 'outlook', 'apple')),
    is_primary BOOLEAN DEFAULT FALSE,
    is_synchronized BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doctor_calendars_doctor_id ON doctor_calendars(doctor_id);

-- Doctor Calendar Integration Table
CREATE TABLE calendar_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_data JSONB NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(doctor_id, provider)
);

CREATE INDEX idx_calendar_integrations_doctor_id ON calendar_integrations(doctor_id);

-- Appointments Table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    calendar_id UUID NOT NULL REFERENCES doctor_calendars(id) ON DELETE CASCADE,
    patient_id BIGINT REFERENCES patients(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    appointment_type TEXT NOT NULL,
    location_type TEXT NOT NULL DEFAULT 'in_person' CHECK (location_type IN ('in_person', 'telemedicine')),
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    external_id TEXT,
    external_source TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_calendar_id ON appointments(calendar_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_external_id ON appointments(external_id) WHERE external_id IS NOT NULL;

-- Doctor Availability Table
CREATE TABLE doctor_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(doctor_id, day_of_week, start_time, end_time)
);

CREATE INDEX idx_doctor_availability_doctor_id ON doctor_availability(doctor_id);

-- Doctor Subscriptions Table
CREATE TABLE doctor_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing')),
    billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    payment_method_id TEXT,
    price NUMERIC NOT NULL,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doctor_subscriptions_doctor_id ON doctor_subscriptions(doctor_id);
CREATE INDEX idx_doctor_subscriptions_status ON doctor_subscriptions(status);

-- Subscription Items Table
CREATE TABLE subscription_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES doctor_subscriptions(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    item_type TEXT NOT NULL DEFAULT 'addon' CHECK (item_type IN ('addon', 'feature')),
    price NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(subscription_id, item_id)
);

CREATE INDEX idx_subscription_items_subscription_id ON subscription_items(subscription_id);

-- Payment Transactions Table
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES doctor_subscriptions(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'MXN',
    payment_method TEXT NOT NULL,
    payment_method_details JSONB,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed')),
    receipt_url TEXT,
    invoice_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_transactions_doctor_id ON payment_transactions(doctor_id);
CREATE INDEX idx_payment_transactions_subscription_id ON payment_transactions(subscription_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);

-- Add subscription_plan and feature_flags columns to doctors table
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'basic';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS feature_flags JSONB DEFAULT '{}'::jsonb;

-- Trigger to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all tables with updated_at
CREATE TRIGGER update_doctor_domains_modtime
BEFORE UPDATE ON doctor_domains
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_doctor_calendars_modtime
BEFORE UPDATE ON doctor_calendars
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_calendar_integrations_modtime
BEFORE UPDATE ON calendar_integrations
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_appointments_modtime
BEFORE UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_doctor_availability_modtime
BEFORE UPDATE ON doctor_availability
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_doctor_subscriptions_modtime
BEFORE UPDATE ON doctor_subscriptions
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_subscription_items_modtime
BEFORE UPDATE ON subscription_items
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_payment_transactions_modtime
BEFORE UPDATE ON payment_transactions
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Row-level security policies for each table
ALTER TABLE doctor_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Policy for doctors to see their own domains
CREATE POLICY doctor_domains_user_policy ON doctor_domains
    USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

-- Policy for doctors to see their own calendars
CREATE POLICY doctor_calendars_user_policy ON doctor_calendars
    USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

-- Policy for doctors to see their own calendar integrations
CREATE POLICY calendar_integrations_user_policy ON calendar_integrations
    USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

-- Policy for doctors to see their own appointments
CREATE POLICY appointments_doctor_policy ON appointments
    USING (calendar_id IN (SELECT id FROM doctor_calendars WHERE doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())));

-- Policy for patients to see their own appointments
CREATE POLICY appointments_patient_policy ON appointments
    USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

-- Policy for doctors to see their own availability
CREATE POLICY doctor_availability_user_policy ON doctor_availability
    USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

-- Policy for doctors to see their own subscriptions
CREATE POLICY doctor_subscriptions_user_policy ON doctor_subscriptions
    USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

-- Policy for doctors to see their own subscription items
CREATE POLICY subscription_items_user_policy ON subscription_items
    USING (subscription_id IN (SELECT id FROM doctor_subscriptions WHERE doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())));

-- Policy for doctors to see their own payment transactions
CREATE POLICY payment_transactions_user_policy ON payment_transactions
    USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));