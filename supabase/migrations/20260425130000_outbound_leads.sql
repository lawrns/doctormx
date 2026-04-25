-- ================================================
-- OUTBOUND LEADS SYSTEM
-- WhatsApp outbound acquisition pipeline
-- ================================================

CREATE TABLE outbound_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  source TEXT NOT NULL DEFAULT 'doctoralia_scrape',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'responded', 'converted', 'unsubscribed')),
  whatsapp_message_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  contacted_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ
);

CREATE INDEX idx_outbound_leads_status ON outbound_leads(status);
CREATE INDEX idx_outbound_leads_source ON outbound_leads(source);

-- Insert blog category for para-medicos
INSERT INTO blog_categories (name, slug, description) VALUES
  ('Para Medicos', 'para-medicos', 'Recursos, guias y herramientas para medicos mexicanos que quieren digitalizar su practica')
ON CONFLICT (name) DO NOTHING;
