-- AI Audit Logs Table
-- Track all AI operations for compliance and cost monitoring

CREATE TABLE IF NOT EXISTS ai_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  operation TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  cost_cents INTEGER DEFAULT 0,
  latency_ms INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_audit_user ON ai_audit_logs(user_id);
CREATE INDEX idx_ai_audit_operation ON ai_audit_logs(operation);
CREATE INDEX idx_ai_audit_created ON ai_audit_logs(created_at);
CREATE INDEX idx_ai_audit_model ON ai_audit_logs(model);

-- Enable RLS
ALTER TABLE ai_audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own audit logs
CREATE POLICY "Users can view own ai_audit_logs" ON ai_audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert
CREATE POLICY "Service role insert ai_audit_logs" ON ai_audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Admins can view all
CREATE POLICY "Admins can view all ai_audit_logs" ON ai_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

COMMENT ON TABLE ai_audit_logs IS 'Audit trail for AI operations including costs and performance';
