-- Migration: WhatsApp Notification Logs Table
-- Executar: npm run db:migrate

CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  phone_number TEXT NOT NULL,
  template TEXT NOT NULL,
  
  status TEXT NOT NULL
    CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  
  twilio_sid TEXT,
  message_body TEXT,
  
  context JSONB DEFAULT '{}',
  error TEXT,
  
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_logs_phone ON notification_logs(phone_number);
CREATE INDEX idx_notification_logs_status ON notification_logs(status);
CREATE INDEX idx_notification_logs_template ON notification_logs(template);
CREATE INDEX idx_notification_logs_created ON notification_logs(created_at DESC);

COMMENT ON TABLE notification_logs IS 'Audit trail for all WhatsApp notifications sent via Twilio';
