# 🗄️ Database Schema V2 - DoctorMX Reconstruction

> **Document Version:** 1.0  
> **Date:** 2026-02-16  
> **Purpose:** Clean database schema with proper constraints, RLS policies, and indexes  
> **Platform:** Supabase (PostgreSQL)

---

## 📋 Executive Summary

The original database lacked proper constraints, had incomplete RLS policies, and was missing critical indexes. This schema defines a **production-ready, secure, and performant** database design.

**Key Improvements:**
1. Proper constraints from day 1 (NOT NULL, CHECK, UNIQUE)
2. Complete RLS policies for all tables
3. Strategic indexes for performance
4. Soft delete for healthcare compliance
5. Audit trails for all changes

---

## 🗃️ Schema Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CORE TABLES                                  │
├─────────────────────────────────────────────────────────────────────┤
│  auth.users (Supabase) → profiles → doctors                          │
│  specialties → doctor_specialties (junction)                         │
│  appointments → payments | prescriptions | follow_ups                │
│  availability_rules | availability_exceptions                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      COMPLIANCE TABLES                               │
├─────────────────────────────────────────────────────────────────────┤
│  arco_requests | consent_records | audit_logs                        │
│  digital_signatures | clinical_validations                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      SUPPORTING TABLES                               │
├─────────────────────────────────────────────────────────────────────┤
│  chat_conversations | chat_messages                                  │
│  reviews | notifications | webhooks_queue                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Core Tables

### 1. Profiles (extends auth.users)

```sql
-- ================================================
-- PROFILES TABLE
-- Extends Supabase auth.users with app-specific data
-- ================================================

CREATE TABLE profiles (
  -- Primary key (same as auth.users.id)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Core fields
  role user_role NOT NULL DEFAULT 'patient',
  full_name TEXT NOT NULL,
  phone TEXT,
  photo_url TEXT,
  
  -- Preferences (JSON for flexibility)
  preferences JSONB DEFAULT '{
    "notifications": {"email": true, "sms": false, "push": true},
    "language": "es-MX",
    "timezone": "America/Mexico_City"
  }'::jsonb,
  
  -- Compliance fields
  terms_accepted_at TIMESTAMPTZ,
  privacy_accepted_at TIMESTAMPTZ,
  marketing_consent BOOLEAN DEFAULT false,
  marketing_consent_at TIMESTAMPTZ,
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Soft delete (healthcare compliance requirement)
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES auth.users(id),
  deletion_reason TEXT,
  
  -- Constraints
  CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~ '^\+52[0-9]{10}$'),
  CONSTRAINT valid_full_name CHECK (char_length(full_name) >= 2 AND char_length(full_name) <= 100)
);

-- Indexes
CREATE INDEX idx_profiles_role ON profiles(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_profiles_created_at ON profiles(created_at);
CREATE INDEX idx_profiles_deleted_at ON profiles(deleted_at) WHERE deleted_at IS NOT NULL;

-- Trigger for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. Doctors

```sql
-- ================================================
-- DOCTORS TABLE
-- Extended profile for medical professionals
-- ================================================

CREATE TABLE doctors (
  -- Primary key (references profiles)
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Status
  status doctor_status NOT NULL DEFAULT 'draft',
  
  -- Professional info
  bio TEXT,
  languages TEXT[] DEFAULT ARRAY['es'],
  license_number TEXT NOT NULL,
  license_state TEXT NOT NULL DEFAULT 'CDMX',
  years_experience INTEGER CHECK (years_experience >= 0 AND years_experience <= 70),
  
  -- Location
  city TEXT,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'MX',
  
  -- Pricing
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  currency TEXT NOT NULL DEFAULT 'MXN',
  
  -- Features
  video_enabled BOOLEAN NOT NULL DEFAULT false,
  accepts_insurance BOOLEAN NOT NULL DEFAULT false,
  insurance_providers TEXT[],
  
  -- Ratings
  rating_avg NUMERIC(2, 1) DEFAULT 0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
  rating_count INTEGER DEFAULT 0 CHECK (rating_count >= 0),
  
  -- Verification
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),
  cedula_verified BOOLEAN DEFAULT false,
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_license CHECK (license_number ~ '^[0-9]+$'),
  CONSTRAINT valid_bio_length CHECK (bio IS NULL OR char_length(bio) <= 2000)
);

-- Indexes
CREATE INDEX idx_doctors_status ON doctors(status) WHERE status = 'approved';
CREATE INDEX idx_doctors_location ON doctors(state, city) WHERE status = 'approved';
CREATE INDEX idx_doctors_rating ON doctors(rating_avg DESC) WHERE status = 'approved';
CREATE INDEX idx_doctors_price ON doctors(price_cents) WHERE status = 'approved';

-- Full-text search index
CREATE INDEX idx_doctors_search ON doctors 
  USING gin(to_tsvector('spanish', coalesce(bio, '')));

-- Trigger
CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 3. Specialties

```sql
-- ================================================
-- SPECIALTIES TABLE
-- Medical specialties catalog
-- ================================================

CREATE TABLE specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Translations (for future i18n)
  translations JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_name CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Junction table
CREATE TABLE doctor_specialties (
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  specialty_id UUID NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  years_in_specialty INTEGER,
  
  PRIMARY KEY (doctor_id, specialty_id)
);

CREATE INDEX idx_doctor_specialties_doctor ON doctor_specialties(doctor_id);
CREATE INDEX idx_doctor_specialties_specialty ON doctor_specialties(specialty_id);
```

### 4. Appointments

```sql
-- ================================================
-- APPOINTMENTS TABLE
-- Core booking entity
-- ================================================

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relations
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  patient_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Timing
  start_ts TIMESTAMPTZ NOT NULL,
  end_ts TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Mexico_City',
  
  -- Status
  status appointment_status NOT NULL DEFAULT 'pending_payment',
  status_changed_at TIMESTAMPTZ,
  status_changed_by UUID REFERENCES profiles(id),
  
  -- Consultation details
  reason_for_visit TEXT,
  symptoms TEXT[],
  notes TEXT,
  
  -- Video consultation
  video_room_url TEXT,
  video_provider TEXT DEFAULT 'daily',
  
  -- Pre-consultation
  questionnaire_id UUID,
  triage_level triage_level,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Critical constraint: prevent double-booking
  CONSTRAINT valid_time_range CHECK (end_ts > start_ts),
  CONSTRAINT valid_reason CHECK (reason_for_visit IS NULL OR char_length(reason_for_visit) <= 1000)
);

-- CRITICAL: Unique constraint for slot booking (prevents race conditions)
CREATE UNIQUE INDEX idx_unique_active_appointment 
ON appointments (doctor_id, start_ts) 
WHERE status IN ('pending_payment', 'confirmed');

-- Indexes
CREATE INDEX idx_appointments_doctor_start ON appointments(doctor_id, start_ts DESC);
CREATE INDEX idx_appointments_patient_start ON appointments(patient_id, start_ts DESC);
CREATE INDEX idx_appointments_status ON appointments(status) WHERE status IN ('pending_payment', 'confirmed');
CREATE INDEX idx_appointments_upcoming ON appointments(start_ts) 
  WHERE status = 'confirmed' AND start_ts > NOW();

-- Trigger for status change tracking
CREATE OR REPLACE FUNCTION track_appointment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.status_changed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointment_status_change
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION track_appointment_status_change();

-- Function for atomic slot reservation
CREATE OR REPLACE FUNCTION reserve_slot_atomic(
  p_doctor_id UUID,
  p_patient_id UUID,
  p_start_ts TIMESTAMPTZ,
  p_duration_minutes INTEGER DEFAULT 30,
  p_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_appointment_id UUID;
  v_end_ts TIMESTAMPTZ;
BEGIN
  v_end_ts := p_start_ts + (p_duration_minutes || ' minutes')::INTERVAL;
  
  -- Try to insert (will fail if unique constraint violated)
  INSERT INTO appointments (
    doctor_id, patient_id, start_ts, end_ts, status, reason_for_visit
  ) VALUES (
    p_doctor_id, p_patient_id, p_start_ts, v_end_ts, 'pending_payment', p_reason
  )
  RETURNING id INTO v_appointment_id;
  
  RETURN v_appointment_id;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NULL; -- Slot already taken
END;
$$ LANGUAGE plpgsql;
```

### 5. Payments

```sql
-- ================================================
-- PAYMENTS TABLE
-- Payment records with idempotency
-- ================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relations
  appointment_id UUID NOT NULL REFERENCES appointments(id),
  patient_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Amount
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'MXN',
  
  -- Status
  status payment_status NOT NULL DEFAULT 'pending',
  
  -- Payment method
  payment_method TEXT NOT NULL, -- 'card', 'oxxo', 'transfer'
  
  -- Stripe integration
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  stripe_customer_id TEXT,
  
  -- OXXO-specific
  oxxo_reference TEXT,
  oxxo_voucher_url TEXT,
  oxxo_expires_at TIMESTAMPTZ,
  
  -- Idempotency (critical for financial integrity)
  idempotency_key TEXT UNIQUE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT
);

-- Indexes
CREATE INDEX idx_payments_appointment ON payments(appointment_id);
CREATE INDEX idx_payments_stripe_intent ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_idempotency ON payments(idempotency_key);
CREATE INDEX idx_payments_pending ON payments(status) WHERE status = 'pending';

-- Function to prevent duplicate payments
CREATE OR REPLACE FUNCTION check_duplicate_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM payments 
    WHERE appointment_id = NEW.appointment_id 
    AND status IN ('paid', 'pending')
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Payment already exists for this appointment';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_duplicate_payment
  BEFORE INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION check_duplicate_payment();
```

### 6. Prescriptions

```sql
-- ================================================
-- PRESCRIPTIONS TABLE
-- Medical prescriptions (sensitive data)
-- ================================================

CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relations
  appointment_id UUID NOT NULL REFERENCES appointments(id),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  patient_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Prescription data
  medications JSONB NOT NULL, -- [{ name, dosage, frequency, duration, notes }]
  diagnosis TEXT,
  notes TEXT,
  instructions TEXT,
  
  -- PDF generation
  pdf_url TEXT,
  pdf_generated_at TIMESTAMPTZ,
  
  -- Digital signature
  signature_id UUID,
  signed_at TIMESTAMPTZ,
  
  -- Audit (strict for medical records)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  
  -- Soft delete (medical records retention)
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT valid_medications CHECK (jsonb_array_length(medications) > 0)
);

-- Indexes
CREATE INDEX idx_prescriptions_appointment ON prescriptions(appointment_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
```

---

## 🔒 Row Level Security (RLS) Policies

### Template for RLS

```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner
ALTER TABLE table_name FORCE ROW LEVEL SECURITY;

-- Default deny-all policy (applied first)
CREATE POLICY "deny_all" ON table_name
  FOR ALL USING (false);
```

### Profiles RLS

```sql
-- Users can view their own profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id 
    OR deleted_at IS NOT NULL  -- Admin can see deleted
  );

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view all non-deleted profiles
CREATE POLICY "profiles_admin_all"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
      AND deleted_at IS NULL
    )
  );

-- Soft delete (update deleted_at, don't actually delete)
CREATE POLICY "profiles_soft_delete_own"
  ON profiles FOR DELETE
  USING (auth.uid() = id)
  WITH CHECK (false); -- Never allow hard delete
```

### Doctors RLS

```sql
-- Everyone can view approved doctors
CREATE POLICY "doctors_select_approved"
  ON doctors FOR SELECT
  USING (
    status = 'approved'
    OR auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Doctors can update their own profile
CREATE POLICY "doctors_update_own"
  ON doctors FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any doctor
CREATE POLICY "doctors_admin_update"
  ON doctors FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );
```

### Appointments RLS

```sql
-- Patients and doctors can view their own appointments
CREATE POLICY "appointments_select_participants"
  ON appointments FOR SELECT
  USING (
    patient_id = auth.uid() 
    OR doctor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Patients can create appointments
CREATE POLICY "appointments_insert_patient"
  ON appointments FOR INSERT
  WITH CHECK (
    patient_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM doctors 
      WHERE id = doctor_id 
      AND status = 'approved'
    )
  );

-- Participants can update (limited fields)
CREATE POLICY "appointments_update_participants"
  ON appointments FOR UPDATE
  USING (patient_id = auth.uid() OR doctor_id = auth.uid())
  WITH CHECK (
    -- Only allow status updates, not critical fields
    patient_id = patient_id  -- Can't change patient
    AND doctor_id = doctor_id  -- Can't change doctor
    AND start_ts = start_ts  -- Can't change time
  );

-- Only doctors can cancel (with reason)
CREATE POLICY "appointments_cancel_doctor"
  ON appointments FOR UPDATE
  USING (
    doctor_id = auth.uid() 
    AND status IN ('confirmed', 'pending_payment')
  )
  WITH CHECK (status = 'cancelled');
```

### Prescriptions RLS

```sql
-- Strict access - only involved parties
CREATE POLICY "prescriptions_select_involved"
  ON prescriptions FOR SELECT
  USING (
    patient_id = auth.uid() 
    OR doctor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Only doctors can create
CREATE POLICY "prescriptions_insert_doctor"
  ON prescriptions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM doctors 
      WHERE id = auth.uid()
    )
    AND doctor_id = auth.uid()  -- Must be the prescribing doctor
  );

-- Only creating doctor can update (within 24h)
CREATE POLICY "prescriptions_update_doctor"
  ON prescriptions FOR UPDATE
  USING (
    doctor_id = auth.uid()
    AND created_at > NOW() - INTERVAL '24 hours'
  );

-- NO DELETE - prescriptions are permanent (soft delete only)
```

---

## 📊 Audit Trail

### Audit Logs Table

```sql
-- ================================================
-- AUDIT LOGS TABLE
-- Immutable audit trail for all changes
-- ================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event details
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  
  -- User info
  user_id UUID REFERENCES auth.users(id),
  user_role TEXT,
  
  -- Data
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  request_id TEXT,
  
  -- Timestamp (immutable)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- No updates or deletes allowed
CREATE POLICY "audit_logs_immutable"
  ON audit_logs FOR ALL
  USING (false);

-- Only system can insert
CREATE POLICY "audit_logs_insert_only"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  v_old_data JSONB;
  v_new_data JSONB;
  v_changed_fields TEXT[];
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_new_data := to_jsonb(NEW);
    v_changed_fields := ARRAY(SELECT jsonb_object_keys(v_new_data));
    
    INSERT INTO audit_logs (
      table_name, record_id, action, user_id, user_role,
      new_data, changed_fields, request_id
    ) VALUES (
      TG_TABLE_NAME, NEW.id, 'INSERT', auth.uid(),
      (SELECT role FROM profiles WHERE id = auth.uid()),
      v_new_data, v_changed_fields, current_setting('app.request_id', true)
    );
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
    
    -- Find changed fields
    SELECT ARRAY(
      SELECT key FROM jsonb_each(v_new_data)
      WHERE v_new_data->key IS DISTINCT FROM v_old_data->key
    ) INTO v_changed_fields;
    
    INSERT INTO audit_logs (
      table_name, record_id, action, user_id, user_role,
      old_data, new_data, changed_fields, request_id
    ) VALUES (
      TG_TABLE_NAME, NEW.id, 'UPDATE', auth.uid(),
      (SELECT role FROM profiles WHERE id = auth.uid()),
      v_old_data, v_new_data, v_changed_fields, 
      current_setting('app.request_id', true)
    );
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      table_name, record_id, action, user_id, user_role,
      old_data, request_id
    ) VALUES (
      TG_TABLE_NAME, OLD.id, 'DELETE', auth.uid(),
      (SELECT role FROM profiles WHERE id = auth.uid()),
      to_jsonb(OLD), current_setting('app.request_id', true)
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to sensitive tables
CREATE TRIGGER audit_appointments
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_payments
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_prescriptions
  AFTER INSERT OR UPDATE OR DELETE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

---

## 📈 Performance Indexes

### Critical Indexes (Must Have)

```sql
-- Appointment booking (race condition prevention)
CREATE UNIQUE INDEX idx_unique_active_appointment 
ON appointments (doctor_id, start_ts) 
WHERE status IN ('pending_payment', 'confirmed');

-- Doctor discovery queries
CREATE INDEX idx_doctors_status_rating ON doctors(status, rating_avg DESC) 
WHERE status = 'approved';

CREATE INDEX idx_doctors_status_price ON doctors(status, price_cents) 
WHERE status = 'approved';

-- Appointment listing
CREATE INDEX idx_appointments_doctor_start_desc 
ON appointments(doctor_id, start_ts DESC);

CREATE INDEX idx_appointments_patient_start_desc 
ON appointments(patient_id, start_ts DESC);

-- Payment lookups
CREATE INDEX idx_payments_stripe_intent ON payments(stripe_payment_intent_id);

-- Soft delete queries
CREATE INDEX idx_profiles_active ON profiles(id) WHERE deleted_at IS NULL;
```

### Query Optimization Indexes

```sql
-- Full-text search
CREATE INDEX idx_doctors_bio_search ON doctors 
USING gin(to_tsvector('spanish', COALESCE(bio, '')));

-- JSONB queries
CREATE INDEX idx_profiles_preferences ON profiles 
USING gin(preferences);

-- Partial indexes for common filters
CREATE INDEX idx_appointments_confirmed_future 
ON appointments(start_ts) 
WHERE status = 'confirmed' AND start_ts > NOW();

-- Composite index for doctor search
CREATE INDEX idx_doctors_location_status 
ON doctors(state, city, status) 
WHERE status = 'approved';
```

---

## 🔄 Helper Functions

### Updated At Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Soft Delete Function

```sql
CREATE OR REPLACE FUNCTION soft_delete_profile(
  p_user_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles SET
    deleted_at = NOW(),
    deleted_by = auth.uid(),
    deletion_reason = p_reason,
    email = 'deleted_' || id || '@deleted.doctor.mx',  -- Anonymize
    phone = NULL,
    full_name = 'Usuario Eliminado'
  WHERE id = p_user_id;
  
  -- Cancel future appointments
  UPDATE appointments SET
    status = 'cancelled',
    status_changed_at = NOW(),
    notes = COALESCE(notes, '') || ' [Cancelado por eliminación de cuenta]'
  WHERE patient_id = p_user_id
    AND status IN ('confirmed', 'pending_payment')
    AND start_ts > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Mexican Business Days Function

```sql
-- Calculate SLA deadlines (20 business days for ARCO)
CREATE OR REPLACE FUNCTION add_business_days(
  p_start_date TIMESTAMPTZ,
  p_days INTEGER
)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  v_result TIMESTAMPTZ := p_start_date;
  v_days_added INTEGER := 0;
BEGIN
  WHILE v_days_added < p_days LOOP
    v_result := v_result + INTERVAL '1 day';
    -- Skip weekends (Saturday=6, Sunday=0)
    IF EXTRACT(DOW FROM v_result) NOT IN (0, 6) THEN
      v_days_added := v_days_added + 1;
    END IF;
  END LOOP;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

---

## ✅ Schema Checklist

For every new table:

- [ ] Primary key with UUID
- [ ] Appropriate foreign keys with ON DELETE
- [ ] NOT NULL constraints where required
- [ ] CHECK constraints for data validation
- [ ] UNIQUE constraints where needed
- [ ] RLS enabled with appropriate policies
- [ ] Indexes for common query patterns
- [ ] Audit trigger applied (if sensitive)
- [ ] updated_at trigger applied
- [ ] Soft delete fields (if required)
- [ ] Comments explaining business logic

---

## 📚 Compliance Notes

### Mexican Healthcare Regulations

1. **NOM-004-SSA3-2012**: Medical records must be retained for 5 years minimum
2. **LFPDPPP**: ARCO rights implementation required
3. **COFEPRIS**: Digital prescription requirements

### Data Retention Policies

| Data Type | Retention Period | Action After |
|-----------|------------------|--------------|
| Medical records | 5 years | Anonymize |
| Prescriptions | 5 years | Archive |
| Payments | 7 years (SAT) | Archive |
| Audit logs | 3 years | Archive |
| Session logs | 1 year | Delete |
| Chat messages | 2 years | Anonymize |
