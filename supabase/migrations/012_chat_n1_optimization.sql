-- Migration: Chat Module N+1 Query Optimization
-- Created: 2026-02-16
-- Description: Additional indexes and optimizations for PERF-008

-- ============================================
-- CHAT UNREAD COUNT OPTIMIZATION INDEXES
-- ============================================

-- Composite index for efficient unread count queries by conversation
-- Used by: getUnreadCount() optimized single query
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread_lookup
ON chat_messages(conversation_id, sender_id, id);

-- Composite index for user-specific unread count across all conversations
-- Used by: getTotalUnreadCount() single-query optimization
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_lookup
ON chat_conversations(patient_id, doctor_id, id);

-- Index for fast message receipt checking
-- Used by: markAsRead() and unread count queries
CREATE INDEX IF NOT EXISTS idx_chat_receipts_user_lookup
ON chat_message_receipts(user_id, message_id, read_at);

-- ============================================
-- INDEX STATISTICS UPDATE
-- ============================================
ANALYZE chat_messages;
ANALYZE chat_conversations;
ANALYZE chat_message_receipts;
