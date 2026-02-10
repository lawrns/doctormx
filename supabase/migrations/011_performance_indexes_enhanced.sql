-- Enhanced Performance Indexes for Doctor.mx
-- Created: 2025-02-09
-- Description: Comprehensive composite indexes to eliminate N+1 queries and optimize performance

-- ============================================
-- REVIEWS TABLE INDEXES
-- ============================================

-- Index for doctor reviews queries with pagination (doctor_id, created_at DESC)
-- Used by: getDoctorReviews() in src/lib/reviews.ts
CREATE INDEX IF NOT EXISTS idx_reviews_doctor_created
ON reviews(doctor_id, created_at DESC);

-- Index for appointment review lookups
-- Used by: getReviewByAppointment(), canPatientReview()
CREATE INDEX IF NOT EXISTS idx_reviews_appointment_id
ON reviews(appointment_id);

-- Index for patient reviews lookup
-- Used by: hasPatientReviewedAppointment()
CREATE INDEX IF NOT EXISTS idx_reviews_patient_id
ON reviews(patient_id);

-- Composite index for checking if appointment has review
-- Used by: getPatientReviewableAppointments() with LEFT JOIN optimization
CREATE INDEX IF NOT EXISTS idx_reviews_appointment_patient
ON reviews(appointment_id, patient_id);

-- ============================================
-- PAYMENTS TABLE INDEXES
-- ============================================

-- Index for revenue analytics by status and date
-- Used by: getRevenueMetrics(), getAdminMetrics()
CREATE INDEX IF NOT EXISTS idx_payments_status_created
ON payments(status, created_at DESC);

-- Index for payment lookups by appointment with status
-- Used by: analytics queries joining payments to appointments
CREATE INDEX IF NOT EXISTS idx_payments_appointment_status
ON payments(appointment_id, status);

-- Index for payment statistics and filtering
CREATE INDEX IF NOT EXISTS idx_payments_status_amount
ON payments(status, amount_cents);

-- ============================================
-- APPOINTMENTS TABLE INDEXES
-- ============================================

-- Composite index for filtering by status and time range
-- Used by: getDoctorMetrics(), analytics queries
CREATE INDEX IF NOT EXISTS idx_appointments_status_start
ON appointments(status, start_ts DESC);

-- Composite index for doctor status queries with time
-- Used by: doctor analytics, appointment history
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_status_start
ON appointments(doctor_id, status, start_ts DESC);

-- Composite index for patient appointment history
-- Used by: patient appointments, reviewable appointments
CREATE INDEX IF NOT EXISTS idx_appointments_patient_status_start
ON appointments(patient_id, status, start_ts DESC);

-- Index for video appointments lookup
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_video
ON appointments(doctor_id, video_room_url)
WHERE video_room_url IS NOT NULL;

-- ============================================
-- CHAT TABLES INDEXES
-- ============================================

-- Composite index for conversations by patient with last message ordering
-- Used by: getConversations() for patients
CREATE INDEX IF NOT EXISTS idx_chat_conversations_patient_lastmsg
ON chat_conversations(patient_id, last_message_at DESC NULLS LAST);

-- Composite index for conversations by doctor with last message ordering
-- Used by: getConversations() for doctors
CREATE INDEX IF NOT EXISTS idx_chat_conversations_doctor_lastmsg
ON chat_conversations(doctor_id, last_message_at DESC NULLS LAST);

-- Index for conversation lookups by appointment
CREATE INDEX IF NOT EXISTS idx_chat_conversations_appointment
ON chat_conversations(appointment_id)
WHERE appointment_id IS NOT NULL;

-- Composite index for unread message queries
-- Used by: getConversations() unread count, getTotalUnreadCount()
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_sender
ON chat_messages(conversation_id, sender_id, created_at DESC);

-- Composite index for read receipt tracking
-- Used by: markAsRead(), getUnreadCount()
CREATE INDEX IF NOT EXISTS idx_chat_message_receipts_user_message
ON chat_message_receipts(user_id, message_id, read_at DESC);

-- ============================================
-- DOCTORS TABLE INDEXES
-- ============================================

-- Composite index for discovery queries (status + rating)
-- Used by: discoverDoctors() in src/lib/discovery.ts
CREATE INDEX IF NOT EXISTS idx_doctors_status_rating
ON doctors(status, rating_avg DESC NULLS LAST)
WHERE status = 'approved';

-- Composite index for location-based discovery
-- Used by: city/state filtering in discovery
CREATE INDEX IF NOT EXISTS idx_doctors_status_city
ON doctors(status, city, state)
WHERE status = 'approved';

-- Index for doctor specialty lookups
CREATE INDEX IF NOT EXISTS idx_doctors_status_price
ON doctors(status, price_cents)
WHERE status = 'approved';

-- ============================================
-- PROFILES TABLE INDEXES
-- ============================================

-- Composite index for role-based user queries with creation date
-- Used by: getAdminMetrics(), user metrics
CREATE INDEX IF NOT EXISTS idx_profiles_role_created
ON profiles(role, created_at DESC);

-- ============================================
-- PRESCRIPTIONS TABLE INDEXES
-- ============================================

-- Index for doctor prescription history
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_created
ON prescriptions(doctor_id, created_at DESC);

-- Index for patient prescription history
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_created
ON prescriptions(patient_id, created_at DESC);

-- ============================================
-- FOLLOW-UP SCHEDULES INDEXES
-- ============================================

-- Composite index for active follow-ups by date
CREATE INDEX IF NOT EXISTS idx_followup_schedules_status_date
ON follow_up_schedules(status, scheduled_for)
WHERE status IN ('pending', 'scheduled');

-- ============================================
-- MEDICAL IMAGE ANALYSES INDEXES
-- ============================================

-- Composite index for patient medical history with dates
CREATE INDEX IF NOT EXISTS idx_medical_images_patient_created_status
ON medical_image_analyses(patient_id, created_at DESC, analysis_status);

-- ============================================
-- AVAILABILITY TABLES INDEXES
-- ============================================

-- Index for active availability rules
CREATE INDEX IF NOT EXISTS idx_availability_rules_doctor_active
ON availability_rules(doctor_id, active)
WHERE active = true;

-- Index for availability exceptions by date range
CREATE INDEX IF NOT EXISTS idx_availability_exceptions_doctor_start
ON availability_exceptions(doctor_id, start_ts, end_ts);

-- ============================================
-- DOCTOR SUBSCRIPTIONS INDEXES
-- ============================================

-- Composite index for active subscription lookups
-- Used by: discoverDoctors() for filtering active doctors
CREATE INDEX IF NOT EXISTS idx_doctor_subscriptions_status_period
ON doctor_subscriptions(doctor_id, status, current_period_end)
WHERE status = 'active';

-- ============================================
-- INDEX STATISTICS UPDATE
-- ============================================

-- Ensure statistics are updated for query optimization
-- This helps the query planner make better decisions
ANALYZE reviews;
ANALYZE payments;
ANALYZE appointments;
ANALYZE chat_conversations;
ANALYZE chat_messages;
ANALYZE chat_message_receipts;
ANALYZE doctors;
ANALYZE profiles;
ANALYZE prescriptions;
ANALYZE follow_up_schedules;
ANALYZE medical_image_analyses;
ANALYZE availability_rules;
ANALYZE availability_exceptions;
ANALYZE doctor_subscriptions;
