-- Second Opinion Messages table for doctor-patient communication

CREATE TABLE IF NOT EXISTS second_opinion_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES second_opinion_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('patient', 'doctor', 'system')),
  content TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_second_opinion_messages_request_id
  ON second_opinion_messages(request_id);

CREATE INDEX IF NOT EXISTS idx_second_opinion_messages_sender_id
  ON second_opinion_messages(sender_id);

ALTER TABLE second_opinion_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view messages on their requests"
  ON second_opinion_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM second_opinion_requests
      WHERE second_opinion_requests.id = second_opinion_messages.request_id
      AND second_opinion_requests.patient_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can view messages on assigned requests"
  ON second_opinion_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM second_opinion_requests
      WHERE second_opinion_requests.id = second_opinion_messages.request_id
      AND second_opinion_requests.assigned_doctor_id = auth.uid()
    )
  );

CREATE POLICY "Patients can send messages on their requests"
  ON second_opinion_messages FOR INSERT
  WITH CHECK (
    sender_role = 'patient'
    AND EXISTS (
      SELECT 1 FROM second_opinion_requests
      WHERE second_opinion_requests.id = request_id
      AND second_opinion_requests.patient_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can send messages on assigned requests"
  ON second_opinion_messages FOR INSERT
  WITH CHECK (
    sender_role = 'doctor'
    AND EXISTS (
      SELECT 1 FROM second_opinion_requests
      WHERE second_opinion_requests.id = request_id
      AND second_opinion_requests.assigned_doctor_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage messages"
  ON second_opinion_messages FOR ALL
  USING (true)
  WITH CHECK (true);
