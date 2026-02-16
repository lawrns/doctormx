-- ============================================================
-- ROLLBACK SCRIPT: 005_chat_and_followup_tables.sql
-- DoctorMX Database Migration Rollback
-- Generated: 2026-02-16T09:42:35-06:00
-- ============================================================

BEGIN;

-- Verify migration was applied
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_conversations') THEN
        RAISE EXCEPTION 'Cannot rollback: chat_conversations table does not exist';
    END IF;
END $$;

-- ============================================================
-- DROP POLICIES
-- ============================================================

ALTER TABLE IF EXISTS chat_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_message_receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_user_presence DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS followups DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS followup_responses DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients can view their own conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Doctors can view their own conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Authenticated can create conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Conversation participants can view messages" ON chat_messages;
DROP POLICY IF EXISTS "Conversation participants can send messages" ON chat_messages;
DROP POLICY IF EXISTS "Patients can view their own followups" ON followups;
DROP POLICY IF EXISTS "Doctors can view followups for their patients" ON followups;

-- ============================================================
-- DROP INDEXES
-- ============================================================

DROP INDEX IF EXISTS idx_chat_conversations_patient;
DROP INDEX IF EXISTS idx_chat_conversations_doctor;
DROP INDEX IF EXISTS idx_chat_conversations_last_message;
DROP INDEX IF EXISTS idx_chat_messages_conversation;
DROP INDEX IF EXISTS idx_chat_messages_created;
DROP INDEX IF EXISTS idx_followups_patient;
DROP INDEX IF EXISTS idx_followups_doctor;
DROP INDEX IF EXISTS idx_followups_status;
DROP INDEX IF EXISTS idx_followups_scheduled;

-- ============================================================
-- DROP TABLES (dependency order)
-- ============================================================

DROP TABLE IF EXISTS followup_responses CASCADE;
DROP TABLE IF EXISTS followups CASCADE;
DROP TABLE IF EXISTS chat_user_presence CASCADE;
DROP TABLE IF EXISTS chat_message_receipts CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_conversations CASCADE;

-- ============================================================
-- VERIFY ROLLBACK
-- ============================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_conversations') THEN
        RAISE EXCEPTION 'Rollback failed: chat_conversations table still exists';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'followups') THEN
        RAISE EXCEPTION 'Rollback failed: followups table still exists';
    END IF;
END $$;

COMMIT;

DO $$
BEGIN
    RAISE NOTICE 'Successfully rolled back 005_chat_and_followup_tables.sql';
END $$;
