-- Migración 003: Tablas para sistema de IA cooperativa
-- Ejecutar: npm run db:migrate

-- ============================================
-- PRE-CONSULTA INTELIGENTE
-- ============================================

CREATE TABLE IF NOT EXISTS pre_consulta_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  specialty TEXT,
  
  -- Conversación serializada
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Resumen generado por IA
  summary JSONB,
  -- Formato: { chiefComplaint, symptoms[], urgencyLevel, suggestedSpecialty, aiConfidence }
  
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'escalated-to-doctor', 'redirected-to-emergency')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  
  -- Índices para búsqueda
  CONSTRAINT valid_summary CHECK (
    summary IS NULL OR (
      summary ? 'chiefComplaint' AND
      summary ? 'urgencyLevel'
    )
  )
);

CREATE INDEX idx_pre_consulta_patient ON pre_consulta_sessions(patient_id);
CREATE INDEX idx_pre_consulta_status ON pre_consulta_sessions(status);
CREATE INDEX idx_pre_consulta_created ON pre_consulta_sessions(created_at DESC);

-- ============================================
-- TRANSCRIPCIONES
-- ============================================

CREATE TABLE IF NOT EXISTS consultation_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  
  audio_url TEXT NOT NULL, -- Supabase Storage URL
  
  -- Segmentos con timestamps
  segments JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Formato: [{ text, speaker, timestamp, confidence }]
  
  -- Resumen estructurado generado por IA
  summary JSONB,
  -- Formato: { diagnosis, symptoms[], prescriptions[], followUpInstructions, nextSteps[] }
  
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  
  -- Metadata técnica
  metadata JSONB,
  -- Formato: { durationMinutes, cost, model }
  
  UNIQUE(appointment_id)
);

CREATE INDEX idx_transcripts_appointment ON consultation_transcripts(appointment_id);
CREATE INDEX idx_transcripts_status ON consultation_transcripts(status);

-- ============================================
-- SEGUIMIENTO POST-CONSULTA
-- ============================================

CREATE TABLE IF NOT EXISTS follow_up_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL
    CHECK (type IN ('24h-check', '7d-progress', '30d-outcome')),
  
  scheduled_for TIMESTAMPTZ NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'responded', 'no-response', 'escalated')),
  
  channel TEXT NOT NULL DEFAULT 'whatsapp'
    CHECK (channel IN ('whatsapp', 'email', 'sms')),
  
  -- Mensaje enviado
  message TEXT NOT NULL,
  
  -- Respuesta del paciente
  response TEXT,
  responded_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(appointment_id, type)
);

CREATE INDEX idx_follow_ups_scheduled ON follow_up_schedules(scheduled_for)
  WHERE status = 'pending';
CREATE INDEX idx_follow_ups_patient ON follow_up_schedules(patient_id);

-- ============================================
-- AUDITORÍA DE IA
-- ============================================

CREATE TABLE IF NOT EXISTS ai_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  operation TEXT NOT NULL
    CHECK (operation IN ('pre-consulta', 'transcription', 'follow-up', 'prescription-assist', 'matching')),
  
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL
    CHECK (user_type IN ('patient', 'doctor', 'admin')),
  
  -- Input/output de la operación
  input JSONB NOT NULL,
  output JSONB NOT NULL,
  
  -- Metadata técnica
  model TEXT NOT NULL,
  tokens INTEGER,
  cost NUMERIC(10, 6), -- Hasta $9999.999999
  latency_ms INTEGER NOT NULL,
  
  status TEXT NOT NULL
    CHECK (status IN ('success', 'error')),
  error TEXT,
  
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_audit_operation ON ai_audit_logs(operation);
CREATE INDEX idx_ai_audit_user ON ai_audit_logs(user_id);
CREATE INDEX idx_ai_audit_timestamp ON ai_audit_logs(timestamp DESC);

-- ============================================
-- DISCLAIMERS & COMPLIANCE
-- ============================================

CREATE TABLE IF NOT EXISTS ai_disclaimers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL
    CHECK (type IN ('pre-consulta', 'transcription', 'prescription')),
  
  text TEXT NOT NULL, -- El disclaimer mostrado
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, type)
);

CREATE INDEX idx_disclaimers_user ON ai_disclaimers(user_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Pre-consulta: solo el paciente puede ver su sesión
ALTER TABLE pre_consulta_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus propias sesiones"
  ON pre_consulta_sessions FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "Usuarios pueden crear sesiones"
  ON pre_consulta_sessions FOR INSERT
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Usuarios pueden actualizar sus sesiones activas"
  ON pre_consulta_sessions FOR UPDATE
  USING (patient_id = auth.uid() AND status = 'active');

-- Transcripciones: doctor y paciente pueden ver
ALTER TABLE consultation_transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participantes pueden ver transcripciones"
  ON consultation_transcripts FOR SELECT
  USING (
    appointment_id IN (
      SELECT id FROM appointments
      WHERE patient_id = auth.uid() OR doctor_id = auth.uid()
    )
  );

-- Follow-ups: paciente puede ver y responder
ALTER TABLE follow_up_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pacientes pueden ver sus follow-ups"
  ON follow_up_schedules FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "Pacientes pueden responder follow-ups"
  ON follow_up_schedules FOR UPDATE
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

-- Auditoría: solo admins
ALTER TABLE ai_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo admins pueden ver auditoría"
  ON ai_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Disclaimers: usuarios ven solo los suyos
ALTER TABLE ai_disclaimers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus disclaimers"
  ON ai_disclaimers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Usuarios pueden crear disclaimers"
  ON ai_disclaimers FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuarios pueden actualizar disclaimers"
  ON ai_disclaimers FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- FUNCIONES HELPER
-- ============================================

-- Crear follow-ups automáticamente después de una consulta
CREATE OR REPLACE FUNCTION schedule_follow_ups_for_appointment()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo si la cita fue completada
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- 24h check
    INSERT INTO follow_up_schedules (appointment_id, patient_id, type, scheduled_for, message, channel)
    VALUES (
      NEW.id,
      NEW.patient_id,
      '24h-check',
      NEW.end_time + INTERVAL '24 hours',
      'Mensaje generado automáticamente',
      'whatsapp'
    );
    
    -- 7d progress
    INSERT INTO follow_up_schedules (appointment_id, patient_id, type, scheduled_for, message, channel)
    VALUES (
      NEW.id,
      NEW.patient_id,
      '7d-progress',
      NEW.end_time + INTERVAL '7 days',
      'Mensaje generado automáticamente',
      'whatsapp'
    );
    
    -- 30d outcome
    INSERT INTO follow_up_schedules (appointment_id, patient_id, type, scheduled_for, message, channel)
    VALUES (
      NEW.id,
      NEW.patient_id,
      '30d-outcome',
      NEW.end_time + INTERVAL '30 days',
      'Mensaje generado automáticamente',
      'email'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear follow-ups
DROP TRIGGER IF EXISTS create_follow_ups_on_completion ON appointments;
CREATE TRIGGER create_follow_ups_on_completion
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION schedule_follow_ups_for_appointment();

COMMENT ON TABLE pre_consulta_sessions IS 'Sesiones de triaje pre-consulta con IA';
COMMENT ON TABLE consultation_transcripts IS 'Transcripciones de consultas con resumen IA';
COMMENT ON TABLE follow_up_schedules IS 'Seguimientos automáticos post-consulta';
COMMENT ON TABLE ai_audit_logs IS 'Auditoría de todas las operaciones de IA';
COMMENT ON TABLE ai_disclaimers IS 'Disclaimers de IA aceptados por usuarios';
