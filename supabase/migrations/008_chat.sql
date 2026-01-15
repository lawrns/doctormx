-- ================================================
-- MIGRATION 008: REAL-TIME CHAT SYSTEM
-- ================================================
-- Direct messaging between patients and doctors
-- ================================================

-- ================================================
-- CHAT CONVERSATIONS
-- ================================================

CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Participants (always patient + doctor)
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  
  -- Optional appointment reference (for context)
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  
  -- Last message preview (for list view)
  last_message_preview TEXT,
  last_message_at TIMESTAMPTZ,
  
  -- Status
  is_archived BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(patient_id, doctor_id, appointment_id)
);

CREATE INDEX idx_chat_conversations_patient ON chat_conversations(patient_id);
CREATE INDEX idx_chat_conversations_doctor ON chat_conversations(doctor_id);
CREATE INDEX idx_chat_conversations_appointment ON chat_conversations(appointment_id);
CREATE INDEX idx_chat_conversations_last_message ON chat_conversations(last_message_at DESC);

COMMENT ON TABLE chat_conversations IS 'Direct messaging conversations between patients and doctors';

-- ================================================
-- CHAT MESSAGES
-- ================================================

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  
  -- Sender
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('patient', 'doctor')),
  
  -- Message content
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text'
    CHECK (message_type IN ('text', 'image', 'file')),
  
  -- Attachments
  attachment_url TEXT,
  attachment_name TEXT,
  attachment_type TEXT,
  
  -- Read status
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id, created_at DESC);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_unread ON chat_messages(conversation_id, read_at) WHERE read_at IS NULL;

COMMENT ON TABLE chat_messages IS 'Individual messages in chat conversations';

-- ================================================
-- MESSAGE READ RECEIPTS (for tracking read status per user)
-- ================================================

CREATE TABLE IF NOT EXISTS chat_message_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(message_id, user_id)
);

CREATE INDEX idx_chat_receipts_message ON chat_message_receipts(message_id);
CREATE INDEX idx_chat_receipts_user ON chat_message_receipts(user_id);

COMMENT ON TABLE chat_message_receipts IS 'Read receipts for messages';

-- ================================================
-- ONLINE STATUS (for real-time presence)
-- ================================================

CREATE TABLE IF NOT EXISTS chat_user_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  
  -- Presence status
  status TEXT NOT NULL DEFAULT 'online'
    CHECK (status IN ('online', 'away', 'offline')),
  
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id, conversation_id)
);

CREATE INDEX idx_chat_presence_user ON chat_user_presence(user_id);
CREATE INDEX idx_chat_presence_conversation ON chat_conversations(id, user_id);

COMMENT ON TABLE chat_user_presence IS 'User online status per conversation for real-time features';

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Chat conversations
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their conversations"
  ON chat_conversations FOR SELECT
  USING (
    patient_id = auth.uid() OR
    doctor_id IN (SELECT id FROM doctors WHERE id = auth.uid())
  );

CREATE POLICY "Participants can create conversations"
  ON chat_conversations FOR INSERT
  WITH CHECK (
    patient_id = auth.uid() OR
    doctor_id IN (SELECT id FROM doctors WHERE id = auth.uid())
  );

CREATE POLICY "Participants can update conversations"
  ON chat_conversations FOR UPDATE
  USING (
    patient_id = auth.uid() OR
    doctor_id IN (SELECT id FROM doctors WHERE id = auth.uid())
  );

-- Chat messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view messages"
  ON chat_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM chat_conversations
      WHERE patient_id = auth.uid() OR doctor_id IN (SELECT id FROM doctors WHERE id = auth.uid())
    )
  );

CREATE POLICY "Participants can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM chat_conversations
      WHERE patient_id = auth.uid() OR doctor_id IN (SELECT id FROM doctors WHERE id = auth.uid())
    )
  );

-- Chat message receipts
ALTER TABLE chat_message_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own receipts"
  ON chat_message_receipts FOR ALL
  USING (user_id = auth.uid());

-- Chat user presence
ALTER TABLE chat_user_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own presence"
  ON chat_user_presence FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Participants can view presence in conversations"
  ON chat_user_presence FOR SELECT
  USING (
    conversation_id IS NULL OR
    conversation_id IN (
      SELECT id FROM chat_conversations
      WHERE patient_id = auth.uid() OR doctor_id IN (SELECT id FROM doctors WHERE id = auth.uid())
    )
  );

-- ================================================
-- FUNCTIONS & TRIGGERS
-- ================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_updated_at()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON chat_conversations
  FOR EACH ROW EXECUTE FUNCTION update_chat_updated_at();

CREATE TRIGGER update_chat_user_presence_updated_at
  BEFORE UPDATE ON chat_user_presence
  FOR EACH ROW EXECUTE FUNCTION update_chat_updated_at();

-- Function to get unread message count for a user in a conversation
CREATE OR REPLACE FUNCTION get_unread_count(conversation_id UUID, user_id UUID)
RETURNS INTEGER AS $
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM chat_messages m
    WHERE m.conversation_id = conversation_id
    AND m.sender_id != user_id
    AND m.id NOT IN (
      SELECT message_id FROM chat_message_receipts WHERE user_id = user_id
    )
  );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_read(conversation_id UUID, user_id UUID)
RETURNS VOID AS $
DECLARE
  message_id UUID;
BEGIN
  FOR message_id IN
    SELECT m.id
    FROM chat_messages m
    WHERE m.conversation_id = conversation_id
    AND m.sender_id != user_id
    AND m.id NOT IN (
      SELECT message_id FROM chat_message_receipts WHERE user_id = user_id
    )
  LOOP
    INSERT INTO chat_message_receipts (message_id, user_id, read_at)
    VALUES (message_id, user_id, NOW())
    ON CONFLICT (message_id, user_id) DO UPDATE SET read_at = NOW();
  END LOOP;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- REALTIME SUBSCRIPTIONS
-- ================================================

ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_user_presence;

-- ================================================
-- MIGRATION COMPLETE
-- ================================================

COMMENT ON COLUMN chat_conversations.last_message_preview IS 'Preview of the last message for list display';
COMMENT ON COLUMN chat_messages.message_type IS 'Type of message: text, image, or file';
COMMENT ON COLUMN chat_user_presence.status IS 'Online status: online, away, or offline';
