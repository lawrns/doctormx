-- ================================================
-- ARCO Rights System Migration
-- Implements LFPDPPP compliance for Mexican data protection law
-- Derechos ARCO: Acceso, Rectificación, Cancelación, Oposición
-- ================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- ENUMS
-- ================================================

-- ARCO request types (Derechos ARCO)
CREATE TYPE arco_request_type AS ENUM (
  'ACCESS',       -- Acceso: User requests access to their data
  'RECTIFY',      -- Rectificación: User requests correction of inaccurate data
  'CANCEL',       -- Cancelación: User requests deletion/removal of data
  'OPPOSE'        -- Oposición: User opposes processing of data for specific purposes
);

-- ARCO request status
CREATE TYPE arco_request_status AS ENUM (
  'pending',          -- Request submitted, awaiting acknowledgment
  'acknowledged',     -- Request acknowledged, being processed
  'processing',       -- Active processing in progress
  'info_required',    -- Additional information needed from user
  'escalated',        -- Escalated to compliance officer/legal
  'completed',        -- Request fulfilled
  'denied',           -- Request denied with justification
  'cancelled'         -- Request cancelled by user
);

-- Escalation levels
CREATE TYPE escalation_level AS ENUM (
  'tier_1',           -- Customer support (0-5 business days)
  'tier_2',           -- Data protection officer (5-10 business days)
  'tier_3',           -- Legal counsel (10-15 business days)
  'tier_4'            -- External legal counsel (15-20 business days)
);

-- ================================================
-- CORE TABLES
-- ================================================

-- ARCO Requests table
-- Tracks all data rights requests from users
CREATE TABLE arco_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  request_type arco_request_type NOT NULL,
  status arco_request_status NOT NULL DEFAULT 'pending',

  -- Request details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data_scope TEXT[], -- Tables/fields affected (e.g., '{profiles,appointments,prescriptions}')
  specific_records TEXT[], -- Specific record IDs if applicable
  justification TEXT,

  -- Request metadata
  submitted_via TEXT NOT NULL DEFAULT 'web', -- 'web', 'email', 'phone', 'mail'
  ip_address INET,
  user_agent TEXT,

  -- Processing details
  assigned_to UUID REFERENCES profiles(id), -- Staff member assigned
  escalation_level escalation_level DEFAULT 'tier_1',
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'

  -- SLA tracking
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ NOT NULL, -- 20 business days from created_at
  completed_at TIMESTAMPTZ,

  -- Response details
  response TEXT,
  denial_reason TEXT,
  denial_legal_basis TEXT,

  -- Audit trail
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_reminder_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ARCO Request History table
-- Tracks all changes to ARCO requests for audit purposes
CREATE TABLE arco_request_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES arco_requests(id) ON DELETE CASCADE,

  -- Change details
  old_status arco_request_status,
  new_status arco_request_status NOT NULL,
  changed_by UUID NOT NULL REFERENCES profiles(id),
  change_reason TEXT,

  -- Additional context
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ARCO Request Attachments table
-- Stores supporting documents for ARCO requests
CREATE TABLE arco_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES arco_requests(id) ON DELETE CASCADE,

  -- File details
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes INTEGER,
  mime_type TEXT,
  file_hash TEXT, -- SHA-256 for integrity

  -- Upload details
  uploaded_by UUID REFERENCES profiles(id),
  upload_purpose TEXT, -- 'identification', 'proof', 'authorization', etc.

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ARCO Communications table
-- Tracks all communications related to ARCO requests
CREATE TABLE arco_communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES arco_requests(id) ON DELETE CASCADE,

  -- Communication details
  direction TEXT NOT NULL, -- 'incoming', 'outgoing'
  channel TEXT NOT NULL, -- 'email', 'phone', 'portal', 'mail', 'sms'
  subject TEXT,
  content TEXT NOT NULL,

  -- Sender/recipient details
  sent_by UUID REFERENCES profiles(id),
  recipient_contact TEXT,

  -- Delivery tracking
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,

  -- Attachments
  attachments TEXT[], -- URLs to attachments

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Data Amendments table
-- Tracks all corrections/amendments to user data (RECTIFY)
CREATE TABLE data_amendments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  arco_request_id UUID REFERENCES arco_requests(id) ON DELETE SET NULL,

  -- Record identification
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  field_name TEXT NOT NULL,

  -- Amendment details
  old_value TEXT,
  new_value TEXT,
  amendment_reason TEXT,

  -- Approval workflow
  requested_by UUID NOT NULL REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Data Deletion Log table
-- Tracks all data deletions (CANCEL)
CREATE TABLE data_deletions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  arco_request_id UUID REFERENCES arco_requests(id) ON DELETE SET NULL,

  -- Record identification
  table_name TEXT NOT NULL,
  record_id UUID,
  deletion_type TEXT NOT NULL, -- 'hard_delete', 'anonymize', 'soft_delete'

  -- Deletion details
  reason TEXT NOT NULL,
  legal_basis TEXT, -- Legal requirement preventing deletion
  retention_period TEXT, -- How long before final deletion

  -- Data snapshot (before deletion)
  data_snapshot JSONB,

  -- Execution details
  requested_by UUID NOT NULL REFERENCES profiles(id),
  executed_by UUID REFERENCES profiles(id),
  executed_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Privacy Preferences table
-- Stores user privacy preferences and consent (OPPOSE)
CREATE TABLE privacy_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,

  -- Marketing preferences
  marketing_emails BOOLEAN DEFAULT true,
  marketing_sms BOOLEAN DEFAULT false,
  marketing_push BOOLEAN DEFAULT false,

  -- Data processing preferences
  analytics_consent BOOLEAN DEFAULT true,
  personalization_consent BOOLEAN DEFAULT true,
  research_consent BOOLEAN DEFAULT false,

  -- Third-party sharing
  share_with_insurance BOOLEAN DEFAULT false,
  share_with_pharmacies BOOLEAN DEFAULT false,
  share_with_labs BOOLEAN DEFAULT false,

  -- AI and ML
  ai_training_consent BOOLEAN DEFAULT false,
  voice_recording_consent BOOLEAN DEFAULT false,

  -- Metadata
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consent_version TEXT DEFAULT '1.0',
  last_consent_update TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================
-- INDEXES
-- ================================================

-- ARCO Requests indexes
CREATE INDEX idx_arco_requests_user_id ON arco_requests(user_id);
CREATE INDEX idx_arco_requests_status ON arco_requests(status);
CREATE INDEX idx_arco_requests_type ON arco_requests(request_type);
CREATE INDEX idx_arco_requests_due_date ON arco_requests(due_date);
CREATE INDEX idx_arco_requests_created_at ON arco_requests(created_at);
CREATE INDEX idx_arco_requests_assigned_to ON arco_requests(assigned_to);
CREATE INDEX idx_arco_requests_escalation ON arco_requests(escalation_level);
CREATE INDEX idx_arco_requests_priority ON arco_requests(priority);

-- ARCO Request History indexes
CREATE INDEX idx_arco_history_request_id ON arco_request_history(request_id);
CREATE INDEX idx_arco_history_created_at ON arco_request_history(created_at);

-- ARCO Attachments indexes
CREATE INDEX idx_arco_attachments_request_id ON arco_attachments(request_id);

-- ARCO Communications indexes
CREATE INDEX idx_arco_communications_request_id ON arco_communications(request_id);
CREATE INDEX idx_arco_communications_created_at ON arco_communications(created_at);

-- Data Amendments indexes
CREATE INDEX idx_amendments_request_id ON data_amendments(arco_request_id);
CREATE INDEX idx_amendments_table_record ON data_amendments(table_name, record_id);
CREATE INDEX idx_amendments_requested_by ON data_amendments(requested_by);

-- Data Deletions indexes
CREATE INDEX idx_deletions_request_id ON data_deletions(arco_request_id);
CREATE INDEX idx_deletions_table_record ON data_deletions(table_name, record_id);

-- Privacy Preferences indexes
CREATE INDEX idx_privacy_prefs_user_id ON privacy_preferences(user_id);

-- ================================================
-- FUNCTIONS
-- ================================================

-- Calculate business days between two timestamps (excluding weekends and Mexican holidays)
CREATE OR REPLACE FUNCTION calculate_business_days(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
) RETURNS INTEGER AS $$
DECLARE
  business_days INTEGER := 0;
  current_date DATE := DATE(start_date);
  end_date_only DATE := DATE(end_date);
  day_of_week INTEGER;
BEGIN
  WHILE current_date <= end_date_only LOOP
    day_of_week := EXTRACT(DOW FROM current_date);
    -- 0 = Sunday, 6 = Saturday
    IF day_of_week NOT IN (0, 6) THEN
      business_days := business_days + 1;
    END IF;
    current_date := current_date + INTERVAL '1 day';
  END LOOP;

  -- Subtract Mexican holidays (simplified list - should be maintained separately)
  -- This is a placeholder - in production, maintain a holidays table
  business_days := business_days - (
    SELECT COUNT(*) FROM (
      SELECT DATE '2026-01-01' UNION ALL -- New Year's Day
      SELECT DATE '2026-02-05' UNION ALL -- Constitution Day
      SELECT DATE '2026-03-21' UNION ALL -- Benito Juárez's Birthday
      SELECT DATE '2026-05-01' UNION ALL -- Labor Day
      SELECT DATE '2026-09-16' UNION ALL -- Independence Day
      SELECT DATE '2026-11-20' UNION ALL -- Revolution Day
      SELECT DATE '2026-12-25'            -- Christmas Day
    ) holidays
    WHERE holiday_date BETWEEN DATE(start_date) AND DATE(end_date)
  );

  RETURN business_days;
END;
$$ LANGUAGE plpgsql;

-- Calculate due date (20 business days from start)
CREATE OR REPLACE FUNCTION calculate_arco_due_date(
  start_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS TIMESTAMPTZ AS $$
DECLARE
  business_days_needed INTEGER := 20;
  business_days_counted INTEGER := 0;
  current_date TIMESTAMPTZ := start_date;
  day_of_week INTEGER;
BEGIN
  WHILE business_days_counted < business_days_needed LOOP
    current_date := current_date + INTERVAL '1 day';
    day_of_week := EXTRACT(DOW FROM current_date);

    -- Skip weekends
    IF day_of_week NOT IN (0, 6) THEN
      -- Check for holidays (simplified - use holidays table in production)
      IF NOT EXISTS (
        SELECT 1 FROM (
          SELECT DATE '2026-01-01' UNION ALL
          SELECT DATE '2026-02-05' UNION ALL
          SELECT DATE '2026-03-21' UNION ALL
          SELECT DATE '2026-05-01' UNION ALL
          SELECT DATE '2026-09-16' UNION ALL
          SELECT DATE '2026-11-20' UNION ALL
          SELECT DATE '2026-12-25'
        ) holidays
        WHERE holiday_date = DATE(current_date)
      ) THEN
        business_days_counted := business_days_counted + 1;
      END IF;
    END IF;
  END LOOP;

  RETURN current_date;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate due date on insert
CREATE OR REPLACE FUNCTION set_arco_due_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.due_date IS NULL OR NEW.due_date = '1970-01-01'::timestamptz THEN
    NEW.due_date := calculate_arco_due_date(NEW.created_at);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_arco_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- TRIGGERS
-- ================================================

-- Auto-calculate due date on insert
CREATE TRIGGER trigger_set_arco_due_date
  BEFORE INSERT ON arco_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_arco_due_date();

-- Auto-update updated_at timestamp
CREATE TRIGGER trigger_update_arco_updated_at
  BEFORE UPDATE ON arco_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_arco_updated_at();

-- Auto-update privacy preferences updated_at
CREATE TRIGGER trigger_update_privacy_prefs_updated_at
  BEFORE UPDATE ON privacy_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_arco_updated_at();

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

-- Enable RLS on ARCO tables
ALTER TABLE arco_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE arco_request_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE arco_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE arco_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_amendments ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_deletions ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_preferences ENABLE ROW LEVEL SECURITY;

-- ARCO Requests RLS
CREATE POLICY "Users can view their own ARCO requests"
  ON arco_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all ARCO requests"
  ON arco_requests FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can create ARCO requests"
  ON arco_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update ARCO requests"
  ON arco_requests FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ARCO Request History RLS
CREATE POLICY "Users can view history for their requests"
  ON arco_request_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM arco_requests
    WHERE id = request_id AND user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all ARCO history"
  ON arco_request_history FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ARCO Attachments RLS
CREATE POLICY "Users can view attachments for their requests"
  ON arco_attachments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM arco_requests
    WHERE id = request_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can upload attachments to their requests"
  ON arco_attachments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM arco_requests
    WHERE id = request_id AND user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all ARCO attachments"
  ON arco_attachments FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ARCO Communications RLS
CREATE POLICY "Users can view communications for their requests"
  ON arco_communications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM arco_requests
    WHERE id = request_id AND user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all ARCO communications"
  ON arco_communications FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Data Amendments RLS
CREATE POLICY "Users can view amendments for their requests"
  ON data_amendments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM arco_requests
    WHERE id = arco_request_id AND user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all data amendments"
  ON data_amendments FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Data Deletions RLS
CREATE POLICY "Users can view deletions for their requests"
  ON data_deletions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM arco_requests
    WHERE id = arco_request_id AND user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all data deletions"
  ON data_deletions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Privacy Preferences RLS
CREATE POLICY "Users can view and update their own privacy preferences"
  ON privacy_preferences FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all privacy preferences"
  ON privacy_preferences FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ================================================
-- VIEWS
-- ================================================

-- ARCO Requests Dashboard View
CREATE OR REPLACE VIEW arco_requests_dashboard AS
SELECT
  ar.id,
  ar.user_id,
  ar.request_type,
  ar.status,
  ar.escalation_level,
  ar.priority,
  ar.title,
  ar.created_at,
  ar.due_date,
  ar.assigned_to,
  ar.completed_at,
  p.full_name as user_name,
  p.email,
  p.phone,
  -- Calculate business days elapsed
  calculate_business_days(ar.created_at, NOW()) as business_days_elapsed,
  -- Calculate business days remaining
  calculate_business_days(NOW(), ar.due_date) as business_days_remaining,
  -- Check if overdue
  CASE
    WHEN NOW() > ar.due_date AND ar.status NOT IN ('completed', 'denied', 'cancelled')
    THEN true
    ELSE false
  END as is_overdue,
  -- Days until/since due date
  EXTRACT(DAY FROM (ar.due_date - NOW())) as days_until_due
FROM arco_requests ar
JOIN profiles p ON ar.user_id = p.id;

-- ARCO SLA Compliance View
CREATE OR REPLACE VIEW arco_sla_compliance AS
SELECT
  DATE_TRUNC('month', created_at) as month,
  request_type,
  COUNT(*) as total_requests,
  COUNT(*) FILTER (WHERE status IN ('completed', 'denied', 'cancelled')) as completed_requests,
  COUNT(*) FILTER (WHERE is_overdue = true) as overdue_requests,
  ROUND(
    100.0 * COUNT(*) FILTER (
      WHERE completed_at IS NOT NULL AND completed_at <= due_date
    ) / NULLIF(COUNT(*) FILTER (WHERE status IN ('completed', 'denied', 'cancelled')), 0),
    2
  ) as sla_compliance_percentage
FROM arco_requests_dashboard
GROUP BY 1, 2
ORDER BY 1 DESC, 2;

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON TABLE arco_requests IS 'ARCO rights requests (Acceso, Rectificación, Cancelación, Oposición) for LFPDPPP compliance';
COMMENT ON TABLE arco_request_history IS 'Audit trail for all ARCO request status changes';
COMMENT ON TABLE arco_attachments IS 'Supporting documents for ARCO requests';
COMMENT ON TABLE arco_communications IS 'All communications related to ARCO requests';
COMMENT ON TABLE data_amendments IS 'Track all data corrections (RECTIFY right)';
COMMENT ON TABLE data_deletions IS 'Track all data deletions (CANCEL right)';
COMMENT ON TABLE privacy_preferences IS 'User privacy preferences and consent (OPPOSE right)';

COMMENT ON COLUMN arco_requests.due_date IS '20 business days from request submission (legal maximum per LFPDPPP)';
COMMENT ON COLUMN arco_requests.escalation_level IS 'Automatic escalation based on time and complexity';
COMMENT ON COLUMN privacy_preferences.ai_training_consent IS 'Consent for using data in AI model training';
COMMENT ON COLUMN privacy_preferences.voice_recording_consent IS 'Consent for recording consultations';

-- ================================================
-- INITIAL DATA
-- ================================================

-- No initial data needed - ARCO system is user-driven

-- ================================================
-- END OF MIGRATION
-- ================================================
