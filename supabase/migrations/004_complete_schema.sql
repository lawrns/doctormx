-- ================================================
-- MIGRATION 004: COMPLETE SCHEMA FOR MONETIZATION & FEATURES
-- ================================================
-- This migration adds all missing tables for:
-- - Doctor subscriptions (monetization)
-- - WhatsApp system (patient acquisition)
-- - Pharmacy sponsorships (revenue)
-- - Medical knowledge base (RAG)
-- - Enhanced AI audit logging
-- ================================================

-- ================================================
-- DOCTOR SUBSCRIPTION SYSTEM
-- ================================================

CREATE TABLE IF NOT EXISTS doctor_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  
  -- Stripe subscription details
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  
  -- Plan information
  plan_id TEXT NOT NULL DEFAULT 'basic_499',
  plan_name TEXT NOT NULL DEFAULT 'Plan Básico',
  plan_price_cents INTEGER NOT NULL DEFAULT 49900, -- 499 MXN
  plan_currency TEXT NOT NULL DEFAULT 'MXN',
  
  -- Subscription status
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'past_due', 'cancelled', 'unpaid')),
  
  -- Billing cycle
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  
  -- Cancellation info
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(doctor_id)
);

CREATE INDEX idx_doctor_subscriptions_status ON doctor_subscriptions(status);
CREATE INDEX idx_doctor_subscriptions_period_end ON doctor_subscriptions(current_period_end);

-- ================================================
-- WHATSAPP SYSTEM
-- ================================================

CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Session identification
  phone_number TEXT NOT NULL,
  patient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Session state
  state TEXT NOT NULL DEFAULT 'triage'
    CHECK (state IN ('triage', 'awaiting_handoff', 'with_doctor', 'completed', 'escalated')),
  
  -- Triage results
  triage_summary JSONB,
  -- Format: { chiefComplaint, symptoms[], urgencyLevel, suggestedSpecialty, recommendedAction }
  
  -- Handoff information
  assigned_doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  handoff_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_sessions_phone ON whatsapp_sessions(phone_number);
CREATE INDEX idx_whatsapp_sessions_patient ON whatsapp_sessions(patient_id);
CREATE INDEX idx_whatsapp_sessions_state ON whatsapp_sessions(state);
CREATE INDEX idx_whatsapp_sessions_doctor ON whatsapp_sessions(assigned_doctor_id);

-- WhatsApp messages
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  session_id UUID NOT NULL REFERENCES whatsapp_sessions(id) ON DELETE CASCADE,
  
  -- Message direction
  direction TEXT NOT NULL
    CHECK (direction IN ('inbound', 'outbound')),
  
  -- Sender
  sender_type TEXT NOT NULL
    CHECK (sender_type IN ('patient', 'ai', 'doctor')),
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Message content
  body TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT,
  
  -- Processing
  processed BOOLEAN NOT NULL DEFAULT false,
  ai_response JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_messages_session ON whatsapp_messages(session_id, created_at DESC);

-- WhatsApp handoff limits (track doctor capacity)
CREATE TABLE IF NOT EXISTS whatsapp_handoff_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES doctor_subscriptions(id) ON DELETE CASCADE,
  
  -- Billing period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Handoff tracking
  handoffs_used INTEGER NOT NULL DEFAULT 0,
  handoffs_limit INTEGER NOT NULL DEFAULT 30, -- Basic plan: 30/month
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(doctor_id, period_start, period_end)
);

-- ================================================
-- PHARMACY SPONSORSHIP SYSTEM
-- ================================================

CREATE TABLE IF NOT EXISTS pharmacy_sponsors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Pharmacy information
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  
  -- Coverage
  cities TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  states TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  
  -- Delivery capability
  offers_delivery BOOLEAN NOT NULL DEFAULT true,
  delivery_time_hours INTEGER,
  
  -- Sponsorship details
  monthly_budget_cents INTEGER NOT NULL,
  cost_per_prescription_cents INTEGER NOT NULL,
  
  -- Status
  active BOOLEAN NOT NULL DEFAULT true,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pharmacy_sponsors_active ON pharmacy_sponsors(active);
CREATE INDEX idx_pharmacy_sponsors_cities ON pharmacy_sponsors USING GIN(cities);

-- Appointment sponsorships (track which pharmacy was suggested)
CREATE TABLE IF NOT EXISTS appointment_sponsorships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  pharmacy_id UUID NOT NULL REFERENCES pharmacy_sponsors(id) ON DELETE RESTRICT,
  
  -- Disclosure tracking
  disclosed BOOLEAN NOT NULL DEFAULT true,
  disclosed_at TIMESTAMPTZ,
  
  -- Engagement tracking
  clicked BOOLEAN NOT NULL DEFAULT false,
  clicked_at TIMESTAMPTZ,
  
  -- Cost tracking
  cost_cents INTEGER NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(appointment_id)
);

CREATE INDEX idx_appointment_sponsorships_pharmacy ON appointment_sponsorships(pharmacy_id);
CREATE INDEX idx_appointment_sponsorships_disclosed ON appointment_sponsorships(disclosed);

-- ================================================
-- MEDICAL KNOWLEDGE BASE (RAG)
-- ================================================

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS medical_knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Document metadata
  title TEXT NOT NULL,
  source TEXT NOT NULL, -- 'NOM', 'IMSS', 'ISSSTE', 'WHO', 'CDC', etc.
  source_url TEXT,
  
  -- Content
  content TEXT NOT NULL,
  
  -- Embeddings for semantic search
  embedding vector(1536), -- OpenAI embedding dimension
  
  -- Classification
  specialty TEXT,
  keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Versioning
  version TEXT DEFAULT '1.0',
  published_date DATE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vector similarity search index
CREATE INDEX idx_medical_knowledge_embedding ON medical_knowledge USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX idx_medical_knowledge_source ON medical_knowledge(source);
CREATE INDEX idx_medical_knowledge_specialty ON medical_knowledge(specialty);
CREATE INDEX idx_medical_knowledge_keywords ON medical_knowledge USING GIN(keywords);

-- ================================================
-- ENHANCED AI AUDIT LOGGING
-- ================================================

-- Extend ai_audit_logs with more detailed tracking
ALTER TABLE ai_audit_logs ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL;
ALTER TABLE ai_audit_logs ADD COLUMN IF NOT EXISTS session_id UUID;
ALTER TABLE ai_audit_logs ADD COLUMN IF NOT EXISTS model_version TEXT;
ALTER TABLE ai_audit_logs ADD COLUMN IF NOT EXISTS temperature NUMERIC(3, 2);
ALTER TABLE ai_audit_logs ADD COLUMN IF NOT EXISTS max_tokens INTEGER;

-- ================================================
-- CLINICAL COPILOT SESSIONS
-- ================================================

CREATE TABLE IF NOT EXISTS clinical_copilot_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  
  -- Session state
  active BOOLEAN NOT NULL DEFAULT true,
  
  -- Conversation history
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- AI suggestions
  suggestions JSONB,
  -- Format: { differentialDiagnoses[], quickReplies[], nextSteps[] }
  
  -- SOAP note generation
  soap_note JSONB,
  -- Format: { subjective, objective, assessment, plan }
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_copilot_sessions_appointment ON clinical_copilot_sessions(appointment_id);
CREATE INDEX idx_copilot_sessions_doctor ON clinical_copilot_sessions(doctor_id);
CREATE INDEX idx_copilot_sessions_active ON clinical_copilot_sessions(active);

-- ================================================
-- MEDICAL IMAGE ANALYSIS
-- ================================================

CREATE TABLE IF NOT EXISTS medical_image_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Image information
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  image_url TEXT NOT NULL,
  image_type TEXT NOT NULL
    CHECK (image_type IN ('xray', 'ct', 'mri', 'ultrasound', 'lab_result', 'skin', 'other')),
  
  -- AI Analysis
  findings TEXT NOT NULL,
  confidence_percent INTEGER NOT NULL CHECK (confidence_percent >= 0 AND confidence_percent <= 100),
  urgency_level TEXT NOT NULL
    CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
  
  -- Specialty context
  specialty TEXT,
  
  -- Metadata
  model TEXT NOT NULL DEFAULT 'gpt-4-vision',
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medical_images_patient ON medical_image_analyses(patient_id);
CREATE INDEX idx_medical_images_appointment ON medical_image_analyses(appointment_id);
CREATE INDEX idx_medical_images_urgency ON medical_image_analyses(urgency_level);

-- ================================================
-- OTC MEDICATION RECOMMENDATIONS
-- ================================================

CREATE TABLE IF NOT EXISTS otc_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Context
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  
  -- Recommendation
  medication_name TEXT NOT NULL,
  category TEXT NOT NULL
    CHECK (category IN ('analgesic', 'antipyretic', 'antigripal', 'gastrointestinal', 'topical', 'ophthalmic', 'vitamin', 'supplement')),
  
  -- Dosage
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  
  -- Safety
  warnings TEXT[] DEFAULT ARRAY[]::TEXT[],
  contraindications TEXT[] DEFAULT ARRAY[]::TEXT[],
  when_to_stop TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_otc_recommendations_patient ON otc_recommendations(patient_id);
CREATE INDEX idx_otc_recommendations_appointment ON otc_recommendations(appointment_id);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Doctor subscriptions
ALTER TABLE doctor_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view their own subscription"
  ON doctor_subscriptions FOR SELECT
  USING (doctor_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage all subscriptions"
  ON doctor_subscriptions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- WhatsApp sessions
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their WhatsApp sessions"
  ON whatsapp_sessions FOR SELECT
  USING (patient_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- WhatsApp messages
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Session participants can view messages"
  ON whatsapp_messages FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM whatsapp_sessions
      WHERE patient_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Pharmacy sponsors
ALTER TABLE pharmacy_sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active pharmacies"
  ON pharmacy_sponsors FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage pharmacies"
  ON pharmacy_sponsors FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Appointment sponsorships
ALTER TABLE appointment_sponsorships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view sponsorships"
  ON appointment_sponsorships FOR SELECT
  USING (
    appointment_id IN (
      SELECT id FROM appointments
      WHERE patient_id = auth.uid() OR doctor_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Medical knowledge
ALTER TABLE medical_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view medical knowledge"
  ON medical_knowledge FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage medical knowledge"
  ON medical_knowledge FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Clinical copilot sessions
ALTER TABLE clinical_copilot_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view copilot sessions"
  ON clinical_copilot_sessions FOR SELECT
  USING (
    doctor_id = auth.uid() OR
    appointment_id IN (
      SELECT id FROM appointments WHERE patient_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Medical image analyses
ALTER TABLE medical_image_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their image analyses"
  ON medical_image_analyses FOR SELECT
  USING (patient_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- OTC recommendations
ALTER TABLE otc_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their recommendations"
  ON otc_recommendations FOR SELECT
  USING (patient_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- Appointments - additional indexes for common queries
CREATE INDEX IF NOT EXISTS idx_appointments_start_ts ON appointments(start_ts DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at DESC);

-- Doctors - additional indexes
CREATE INDEX IF NOT EXISTS idx_doctors_status ON doctors(status);
CREATE INDEX IF NOT EXISTS idx_doctors_city ON doctors(city);

-- Profiles - additional indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ================================================
-- FUNCTIONS & TRIGGERS
-- ================================================

-- Update updated_at for new tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Apply triggers to new tables
CREATE TRIGGER update_doctor_subscriptions_updated_at BEFORE UPDATE ON doctor_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_sessions_updated_at BEFORE UPDATE ON whatsapp_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pharmacy_sponsors_updated_at BEFORE UPDATE ON pharmacy_sponsors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_knowledge_updated_at BEFORE UPDATE ON medical_knowledge
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_copilot_sessions_updated_at BEFORE UPDATE ON clinical_copilot_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check if doctor has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(doctor_id UUID)
RETURNS BOOLEAN AS $
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM doctor_subscriptions
    WHERE doctor_subscriptions.doctor_id = $1
    AND status = 'active'
    AND current_period_end > NOW()
  );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get available doctors (approved + active subscription)
CREATE OR REPLACE FUNCTION get_available_doctors()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  bio TEXT,
  price_cents INTEGER,
  rating_avg NUMERIC,
  status TEXT
) AS $
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    p.full_name,
    d.bio,
    d.price_cents,
    d.rating_avg,
    d.status
  FROM doctors d
  JOIN profiles p ON d.id = p.id
  WHERE d.status = 'approved'
  AND has_active_subscription(d.id);
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON TABLE doctor_subscriptions IS 'Doctor subscription plans for catalog visibility';
COMMENT ON TABLE whatsapp_sessions IS 'WhatsApp triage and consultation sessions';
COMMENT ON TABLE whatsapp_messages IS 'WhatsApp message history for audit and context';
COMMENT ON TABLE pharmacy_sponsors IS 'Partner pharmacies for sponsored delivery';
COMMENT ON TABLE appointment_sponsorships IS 'Pharmacy sponsorship tracking per appointment';
COMMENT ON TABLE medical_knowledge IS 'Medical guidelines and knowledge base for RAG';
COMMENT ON TABLE clinical_copilot_sessions IS 'AI-assisted clinical decision support sessions';
COMMENT ON TABLE medical_image_analyses IS 'Medical image analysis results with AI findings';
COMMENT ON TABLE otc_recommendations IS 'Over-the-counter medication recommendations';

-- ================================================
-- MIGRATION COMPLETE
-- ================================================
