-- ================================================
-- SECOND OPINION SYSTEM
-- Migration: 015_second_opinion.sql
-- Purpose: Enable second opinion request and review flow
-- ================================================

-- UP Migration

-- Enums for second opinion system
DO $$ BEGIN
  CREATE TYPE second_opinion_type AS ENUM ('basic', 'specialist', 'panel');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE second_opinion_status AS ENUM (
    'draft',
    'submitted', 
    'ai_processing',
    'pending_review',
    'in_review',
    'completed',
    'expired',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE second_opinion_document_type AS ENUM (
    'lab_result',
    'imaging',
    'pathology', 
    'prescription',
    'referral',
    'medical_record',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Second Opinion Requests table
CREATE TABLE IF NOT EXISTS second_opinion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Patient info
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_name TEXT,
  patient_age INTEGER,
  patient_gender TEXT,
  
  -- Request type and status
  type second_opinion_type NOT NULL DEFAULT 'basic',
  status second_opinion_status NOT NULL DEFAULT 'draft',
  
  -- Clinical information
  chief_complaint TEXT NOT NULL,
  current_diagnosis TEXT,
  current_treatment TEXT,
  medical_history TEXT,
  allergies TEXT,
  medications TEXT,
  
  -- Patient questions
  questions JSONB DEFAULT '[]', -- Array of strings
  
  -- Pricing (in MXN cents)
  price_cents INTEGER NOT NULL DEFAULT 50000,
  currency TEXT NOT NULL DEFAULT 'MXN',
  payment_id UUID,
  payment_status TEXT DEFAULT 'pending',
  
  -- AI processing
  ai_preliminary_summary TEXT,
  ai_suggested_specialty TEXT,
  ai_urgency_score INTEGER, -- 1-10 scale
  ai_processed_at TIMESTAMPTZ,
  
  -- Doctor assignment
  assigned_doctor_id UUID REFERENCES doctors(user_id),
  assigned_at TIMESTAMPTZ,
  assignment_notes TEXT,
  
  -- Doctor opinion
  doctor_opinion TEXT,
  doctor_recommendations TEXT,
  doctor_follow_up_needed BOOLEAN,
  reviewed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for second_opinion_requests
CREATE INDEX IF NOT EXISTS idx_second_opinion_patient ON second_opinion_requests(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_second_opinion_doctor ON second_opinion_requests(assigned_doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_second_opinion_status ON second_opinion_requests(status) WHERE status IN ('submitted', 'pending_review', 'in_review');
CREATE INDEX IF NOT EXISTS idx_second_opinion_expires ON second_opinion_requests(expires_at) WHERE status = 'pending_review';

-- Second Opinion Documents table
CREATE TABLE IF NOT EXISTS second_opinion_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES second_opinion_requests(id) ON DELETE CASCADE,
  
  -- File info
  type second_opinion_document_type NOT NULL DEFAULT 'other',
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  
  -- AI analysis of document
  ai_analysis TEXT,
  ai_extracted_data JSONB,
  ai_analyzed_at TIMESTAMPTZ,
  
  -- Metadata
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_second_opinion_docs_request ON second_opinion_documents(request_id);

-- Second Opinion Panel Members (for panel reviews)
CREATE TABLE IF NOT EXISTS second_opinion_panel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES second_opinion_requests(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(user_id) ON DELETE CASCADE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'invited', -- invited, accepted, declined, completed
  specialty TEXT,
  
  -- Opinion
  opinion TEXT,
  submitted_at TIMESTAMPTZ,
  
  -- Timestamps
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  
  UNIQUE(request_id, doctor_id)
);

CREATE INDEX IF NOT EXISTS idx_panel_members_doctor ON second_opinion_panel_members(doctor_id, status);

-- Second Opinion Messages (communication between patient and doctor)
CREATE TABLE IF NOT EXISTS second_opinion_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES second_opinion_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  
  -- Message content
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  
  -- Read status
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_second_opinion_messages_request ON second_opinion_messages(request_id, created_at ASC);

-- Second Opinion Audit Log
CREATE TABLE IF NOT EXISTS second_opinion_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES second_opinion_requests(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor_id UUID REFERENCES users(id),
  old_status second_opinion_status,
  new_status second_opinion_status,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_second_opinion_audit_request ON second_opinion_audit(request_id, created_at DESC);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_second_opinion_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_second_opinion_requests_timestamp ON second_opinion_requests;
CREATE TRIGGER update_second_opinion_requests_timestamp
  BEFORE UPDATE ON second_opinion_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_second_opinion_updated_at();

-- Trigger to log status changes
CREATE OR REPLACE FUNCTION log_second_opinion_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO second_opinion_audit (request_id, action, actor_id, old_status, new_status)
    VALUES (NEW.id, 'status_change', auth.uid(), OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS log_second_opinion_status ON second_opinion_requests;
CREATE TRIGGER log_second_opinion_status
  AFTER UPDATE ON second_opinion_requests
  FOR EACH ROW
  EXECUTE FUNCTION log_second_opinion_status_change();

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

ALTER TABLE second_opinion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE second_opinion_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE second_opinion_panel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE second_opinion_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE second_opinion_audit ENABLE ROW LEVEL SECURITY;

-- Patients can view and create their own requests
CREATE POLICY "Patients can view own requests"
  ON second_opinion_requests FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create requests"
  ON second_opinion_requests FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update draft requests"
  ON second_opinion_requests FOR UPDATE
  USING (auth.uid() = patient_id AND status = 'draft');

-- Assigned doctors can view and update assigned requests
CREATE POLICY "Doctors can view assigned requests"
  ON second_opinion_requests FOR SELECT
  USING (auth.uid() = assigned_doctor_id);

CREATE POLICY "Doctors can update assigned requests"
  ON second_opinion_requests FOR UPDATE
  USING (
    auth.uid() = assigned_doctor_id 
    AND status IN ('pending_review', 'in_review')
  );

-- Service role bypass for backend operations
CREATE POLICY "Service role can manage all requests"
  ON second_opinion_requests FOR ALL
  USING (auth.role() = 'service_role');

-- Document policies
CREATE POLICY "Request participants can view documents"
  ON second_opinion_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM second_opinion_requests r
      WHERE r.id = request_id
      AND (r.patient_id = auth.uid() OR r.assigned_doctor_id = auth.uid())
    )
  );

CREATE POLICY "Patients can upload documents to own requests"
  ON second_opinion_documents FOR INSERT
  WITH CHECK (
    auth.uid() = uploaded_by
    AND EXISTS (
      SELECT 1 FROM second_opinion_requests r
      WHERE r.id = request_id
      AND r.patient_id = auth.uid()
      AND r.status IN ('draft', 'submitted')
    )
  );

CREATE POLICY "Service role can manage all documents"
  ON second_opinion_documents FOR ALL
  USING (auth.role() = 'service_role');

-- Message policies
CREATE POLICY "Participants can view messages"
  ON second_opinion_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM second_opinion_requests r
      WHERE r.id = request_id
      AND (r.patient_id = auth.uid() OR r.assigned_doctor_id = auth.uid())
    )
  );

CREATE POLICY "Participants can send messages"
  ON second_opinion_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM second_opinion_requests r
      WHERE r.id = request_id
      AND (r.patient_id = auth.uid() OR r.assigned_doctor_id = auth.uid())
    )
  );

CREATE POLICY "Service role can manage all messages"
  ON second_opinion_messages FOR ALL
  USING (auth.role() = 'service_role');

-- Panel member policies
CREATE POLICY "Panel members can view own assignments"
  ON second_opinion_panel_members FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Panel members can update own status"
  ON second_opinion_panel_members FOR UPDATE
  USING (auth.uid() = doctor_id);

CREATE POLICY "Service role can manage panel members"
  ON second_opinion_panel_members FOR ALL
  USING (auth.role() = 'service_role');

-- Audit log policies (read-only for participants)
CREATE POLICY "Participants can view audit log"
  ON second_opinion_audit FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM second_opinion_requests r
      WHERE r.id = request_id
      AND (r.patient_id = auth.uid() OR r.assigned_doctor_id = auth.uid())
    )
  );

CREATE POLICY "Service role can manage audit log"
  ON second_opinion_audit FOR ALL
  USING (auth.role() = 'service_role');

-- ================================================
-- DOWN Migration (for rollback)
-- Run these commands to rollback:
--
-- DROP TABLE IF EXISTS second_opinion_audit CASCADE;
-- DROP TABLE IF EXISTS second_opinion_messages CASCADE;
-- DROP TABLE IF EXISTS second_opinion_panel_members CASCADE;
-- DROP TABLE IF EXISTS second_opinion_documents CASCADE;
-- DROP TABLE IF EXISTS second_opinion_requests CASCADE;
-- DROP TYPE IF EXISTS second_opinion_document_type;
-- DROP TYPE IF EXISTS second_opinion_status;
-- DROP TYPE IF EXISTS second_opinion_type;
-- DROP FUNCTION IF EXISTS update_second_opinion_updated_at();
-- DROP FUNCTION IF EXISTS log_second_opinion_status_change();
-- ================================================
