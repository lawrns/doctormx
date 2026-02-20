-- ================================================
-- GDPR Article 18: Right to Restriction of Processing
-- Migration to add RESTRICT request type and data_restrictions table
-- ================================================

-- ================================================
-- UPDATE ARCO REQUEST TYPE ENUM
-- ================================================

-- Add 'RESTRICT' to the arco_request_type enum
-- Note: PostgreSQL doesn't allow modifying enums directly, so we need to use ALTER TYPE
ALTER TYPE arco_request_type ADD VALUE 'RESTRICT';

-- ================================================
-- DATA RESTRICTIONS TABLE
-- ================================================

-- Table to track data restrictions (GDPR Article 18)
CREATE TABLE data_restrictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  arco_request_id UUID REFERENCES arco_requests(id) ON DELETE SET NULL,
  
  -- Restriction scope
  table_name TEXT NOT NULL, -- Table being restricted
  record_id UUID, -- Specific record (NULL = all records in table)
  field_name TEXT, -- Specific field (NULL = all fields)
  
  -- Restriction details
  restriction_reason TEXT NOT NULL CHECK (restriction_reason IN (
    'accuracy_contested',      -- User contests accuracy of data
    'unlawful_processing',     -- Processing is unlawful but user opposes deletion
    'legal_claims',            -- Need for legal claims
    'public_interest',         -- Public interest verification
    'objection_pending'        -- Pending verification of objection
  )),
  restriction_details TEXT,
  
  -- Status and duration
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'lifted', 'expired')),
  restricted_until TIMESTAMPTZ, -- NULL = permanent restriction
  
  -- Audit trail
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lifted_at TIMESTAMPTZ,
  lifted_reason TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ================================================
-- INDEXES
-- ================================================

-- Indexes for data_restrictions
CREATE INDEX idx_data_restrictions_user_id ON data_restrictions(user_id);
CREATE INDEX idx_data_restrictions_arco_request ON data_restrictions(arco_request_id);
CREATE INDEX idx_data_restrictions_status ON data_restrictions(status);
CREATE INDEX idx_data_restrictions_table ON data_restrictions(table_name);
CREATE INDEX idx_data_restrictions_active ON data_restrictions(user_id, table_name, status) 
  WHERE status = 'active';
CREATE INDEX idx_data_restrictions_expires ON data_restrictions(restricted_until) 
  WHERE restricted_until IS NOT NULL AND status = 'active';

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

-- Enable RLS on data_restrictions
ALTER TABLE data_restrictions ENABLE ROW LEVEL SECURITY;

-- Users can view their own restrictions
CREATE POLICY "Users can view their own data restrictions"
  ON data_restrictions FOR SELECT
  USING (user_id = auth.uid());

-- Users can create restrictions for themselves
CREATE POLICY "Users can create restrictions for themselves"
  ON data_restrictions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can view all restrictions
CREATE POLICY "Admins can view all data restrictions"
  ON data_restrictions FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Admins can update all restrictions
CREATE POLICY "Admins can update data restrictions"
  ON data_restrictions FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Admins can delete restrictions
CREATE POLICY "Admins can delete data restrictions"
  ON data_restrictions FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ================================================
-- FUNCTIONS
-- ================================================

-- Function to automatically lift expired restrictions
CREATE OR REPLACE FUNCTION lift_expired_restrictions()
RETURNS INTEGER AS $$
DECLARE
  lifted_count INTEGER := 0;
BEGIN
  UPDATE data_restrictions
  SET 
    status = 'expired',
    lifted_at = NOW(),
    lifted_reason = 'Automatically lifted - expiration date reached',
    metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{auto_lifted}',
      'true'::jsonb
    )
  WHERE 
    status = 'active'
    AND restricted_until IS NOT NULL
    AND restricted_until <= NOW();
  
  GET DIAGNOSTICS lifted_count = ROW_COUNT;
  
  RETURN lifted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to check if data is restricted
CREATE OR REPLACE FUNCTION is_data_restricted(
  p_user_id UUID,
  p_table_name TEXT,
  p_record_id UUID DEFAULT NULL,
  p_field_name TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  restriction_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM data_restrictions
    WHERE 
      user_id = p_user_id
      AND table_name = p_table_name
      AND status = 'active'
      AND (restricted_until IS NULL OR restricted_until > NOW())
      AND (
        record_id IS NULL 
        OR p_record_id IS NULL 
        OR record_id = p_record_id
      )
      AND (
        field_name IS NULL 
        OR p_field_name IS NULL 
        OR field_name = p_field_name
      )
  ) INTO restriction_exists;
  
  RETURN restriction_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get restriction details
CREATE OR REPLACE FUNCTION get_restriction_details(
  p_user_id UUID,
  p_table_name TEXT,
  p_record_id UUID DEFAULT NULL,
  p_field_name TEXT DEFAULT NULL
) RETURNS TABLE (
  restriction_id UUID,
  reason TEXT,
  details TEXT,
  restricted_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dr.id,
    dr.restriction_reason,
    dr.restriction_details,
    dr.restricted_until,
    dr.created_at
  FROM data_restrictions dr
  WHERE 
    dr.user_id = p_user_id
    AND dr.table_name = p_table_name
    AND dr.status = 'active'
    AND (dr.restricted_until IS NULL OR dr.restricted_until > NOW())
    AND (
      dr.record_id IS NULL 
      OR p_record_id IS NULL 
      OR dr.record_id = p_record_id
    )
    AND (
      dr.field_name IS NULL 
      OR p_field_name IS NULL 
      OR dr.field_name = p_field_name
    )
  ORDER BY dr.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- VIEWS
-- ================================================

-- View for active restrictions with user details
CREATE OR REPLACE VIEW active_data_restrictions AS
SELECT 
  dr.*,
  p.full_name as user_name,
  p.email as user_email,
  ar.title as arco_request_title,
  ar.status as arco_request_status,
  CASE 
    WHEN dr.restricted_until IS NULL THEN 'Permanent'
    ELSE 'Until ' || dr.restricted_until::text
  END as duration_text,
  CASE 
    WHEN dr.restricted_until IS NULL THEN NULL
    WHEN dr.restricted_until <= NOW() + INTERVAL '7 days' THEN true
    ELSE false
  END as expires_soon
FROM data_restrictions dr
JOIN profiles p ON dr.user_id = p.id
LEFT JOIN arco_requests ar ON dr.arco_request_id = ar.id
WHERE dr.status = 'active'
  AND (dr.restricted_until IS NULL OR dr.restricted_until > NOW())
ORDER BY dr.created_at DESC;

-- View for restriction statistics
CREATE OR REPLACE VIEW restriction_statistics AS
SELECT 
  restriction_reason,
  table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE restricted_until IS NULL) as permanent_count,
  COUNT(*) FILTER (WHERE restricted_until IS NOT NULL) as temporary_count,
  COUNT(*) FILTER (WHERE restricted_until <= NOW() + INTERVAL '7 days') as expiring_soon_count
FROM data_restrictions
WHERE status = 'active'
  AND (restricted_until IS NULL OR restricted_until > NOW())
GROUP BY restriction_reason, table_name;

-- ================================================
-- TRIGGERS
-- ================================================

-- Trigger to update metadata when restriction is lifted
CREATE OR REPLACE FUNCTION on_restriction_lifted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'lifted' AND OLD.status = 'active' THEN
    NEW.lifted_at = COALESCE(NEW.lifted_at, NOW());
    NEW.metadata = jsonb_set(
      COALESCE(NEW.metadata, '{}'::jsonb),
      '{lifted_timestamp}',
      to_jsonb(NOW())
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_on_restriction_lifted
  BEFORE UPDATE ON data_restrictions
  FOR EACH ROW
  EXECUTE FUNCTION on_restriction_lifted();

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON TABLE data_restrictions IS 'Tracks data restrictions per GDPR Article 18 (Right to Restriction of Processing)';
COMMENT ON COLUMN data_restrictions.restriction_reason IS 'GDPR Article 18 legal basis for restriction';
COMMENT ON COLUMN data_restrictions.restricted_until IS 'NULL = permanent restriction, otherwise expiration date';
COMMENT ON COLUMN data_restrictions.status IS 'active: restriction in effect, lifted: manually removed, expired: automatic expiration';

-- ================================================
-- END OF MIGRATION
-- ================================================
