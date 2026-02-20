-- ============================================================
-- PERF-009: Composite Indexes for Common Query Patterns
-- Created: 2026-02-16
-- Description: Strategic composite indexes to optimize frequent
--              filter + sort patterns and multi-column WHERE clauses
-- ============================================================

-- ============================================================
-- 1. APPOINTMENTS TABLE - Enhanced Query Performance
-- ============================================================

-- Index: Appointments by doctor + status + date (for availability checks)
-- Pattern: getOccupiedSlots() filters by doctor_id, date range, and status IN ('pending_payment', 'confirmed')
-- Query: SELECT start_ts, end_ts FROM appointments WHERE doctor_id = ? AND start_ts BETWEEN ? AND ? AND status IN (?, ?)
-- File: src/lib/availability.ts:119-126
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_status_start
ON appointments(doctor_id, status, start_ts DESC);

-- Index: Appointments by patient + status + date (for patient appointment history)
-- Pattern: getPatientReviewableAppointments() filters by patient_id, status = 'completed', orders by start_ts
-- Query: SELECT ... FROM appointments WHERE patient_id = ? AND status = 'completed' ORDER BY start_ts DESC
-- File: src/lib/reviews.ts:185-200
CREATE INDEX IF NOT EXISTS idx_appointments_patient_status_start
ON appointments(patient_id, status, start_ts DESC);

-- ============================================================
-- 2. DOCTORS TABLE - Discovery and Search Optimization
-- ============================================================

-- Index: Doctors by specialty + city + rating (for discovery queries)
-- Pattern: discoverDoctors() filters by specialty slug, city, and sorts by rating
-- Query: SELECT ... FROM doctores WHERE status = 'approved' AND city = ? ORDER BY rating_avg DESC
-- File: src/lib/discovery.ts:119-158, src/lib/doctors.ts:54-81
CREATE INDEX IF NOT EXISTS idx_doctors_status_city_rating
ON doctors(status, city, rating_avg DESC NULLS LAST)
WHERE status = 'approved';

-- Index: Doctors by status + price (for price filtering in discovery)
-- Pattern: discoverDoctors() filters by maxPrice and approved status
-- Query: SELECT ... FROM doctores WHERE status = 'approved' AND price_cents <= ? ORDER BY rating_avg DESC
-- File: src/lib/discovery.ts:188-190
CREATE INDEX IF NOT EXISTS idx_doctors_status_price_rating
ON doctors(status, price_cents, rating_avg DESC NULLS LAST)
WHERE status = 'approved';

-- Index: Doctors by status + video_enabled (for video consultation filtering)
-- Pattern: discoverDoctors() filters by video_enabled = true
-- Query: SELECT ... FROM doctores WHERE status = 'approved' AND video_enabled = true
-- File: src/lib/discovery.ts:205-215
CREATE INDEX IF NOT EXISTS idx_doctors_status_video
ON doctors(status, video_enabled)
WHERE status = 'approved' AND video_enabled = true;

-- ============================================================
-- 3. CHAT MESSAGES TABLE - Message Retrieval Optimization
-- ============================================================

-- Index: Messages by conversation + created (for chat message pagination)
-- Pattern: getMessages() filters by conversation_id and orders by created_at
-- Query: SELECT ... FROM chat_messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?
-- File: src/lib/chat.ts:341-376
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_created
ON chat_messages(conversation_id, created_at DESC);

-- ============================================================
-- 4. CHAT CONVERSATIONS TABLE - Conversation List Optimization
-- ============================================================

-- Index: Conversations by patient + last_message_at (for patient conversation list)
-- Pattern: getConversations() filters by patient_id and orders by last_message_at
-- Query: SELECT ... FROM chat_conversations WHERE patient_id = ? ORDER BY last_message_at DESC
-- File: src/lib/chat.ts:142-248
CREATE INDEX IF NOT EXISTS idx_chat_conversations_patient_lastmsg
ON chat_conversations(patient_id, last_message_at DESC NULLS LAST);

-- Index: Conversations by doctor + last_message_at (for doctor conversation list)
-- Pattern: getConversations() filters by doctor_id and orders by last_message_at
-- Query: SELECT ... FROM chat_conversations WHERE doctor_id = ? ORDER BY last_message_at DESC
-- File: src/lib/chat.ts:142-248
CREATE INDEX IF NOT EXISTS idx_chat_conversations_doctor_lastmsg
ON chat_conversations(doctor_id, last_message_at DESC NULLS LAST);

-- Index: Conversations by appointment_id (for appointment-linked conversations)
-- Pattern: createConversation() checks for existing conversation by appointment_id
-- Query: SELECT ... FROM chat_conversations WHERE appointment_id = ?
-- File: src/lib/chat.ts:39-79
CREATE INDEX IF NOT EXISTS idx_chat_conversations_appointment
ON chat_conversations(appointment_id)
WHERE appointment_id IS NOT NULL;

-- ============================================================
-- 5. REVIEWS TABLE - Review Listing Optimization
-- ============================================================

-- Index: Reviews by doctor + created (for doctor review pagination)
-- Pattern: getDoctorReviews() filters by doctor_id and orders by created_at
-- Query: SELECT ... FROM reviews WHERE doctor_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?
-- File: src/lib/reviews.ts:62-89
CREATE INDEX IF NOT EXISTS idx_reviews_doctor_created
ON reviews(doctor_id, created_at DESC);

-- Index: Reviews by appointment + patient (for duplicate review prevention)
-- Pattern: hasPatientReviewedAppointment() checks by appointment_id and patient_id
-- Query: SELECT ... FROM reviews WHERE appointment_id = ? AND patient_id = ?
-- File: src/lib/reviews.ts:152-163
CREATE INDEX IF NOT EXISTS idx_reviews_appointment_patient
ON reviews(appointment_id, patient_id);

-- ============================================================
-- 6. PAYMENTS TABLE - Payment Lookup Optimization
-- ============================================================

-- Index: Payments by appointment + status (for payment status queries)
-- Pattern: confirmSuccessfulPayment() and processRefund() filter by appointment_id and status
-- Query: SELECT ... FROM payments WHERE appointment_id = ? AND status = 'paid'
-- File: src/lib/payment.ts:295-301
CREATE INDEX IF NOT EXISTS idx_payments_appointment_status
ON payments(appointment_id, status);

-- Index: Payments by status + created (for revenue analytics)
-- Pattern: Revenue reports filter by status and date range
-- Query: SELECT ... FROM payments WHERE status = 'paid' AND created_at >= ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_payments_status_created
ON payments(status, created_at DESC);

-- ============================================================
-- 7. PRESCRIPTIONS TABLE - Prescription Lookup Optimization
-- ============================================================

-- Index: Prescriptions by appointment (for prescription retrieval)
-- Pattern: getPrescriptionByAppointment() looks up by appointment_id
-- Query: SELECT ... FROM prescriptions WHERE appointment_id = ?
-- File: src/lib/prescriptions.ts:21-36
CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment
ON prescriptions(appointment_id);

-- Index: Prescriptions by patient + created (for patient prescription history)
-- Pattern: Patient prescription history queries
-- Query: SELECT ... FROM prescriptions WHERE patient_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_created
ON prescriptions(patient_id, created_at DESC);

-- ============================================================
-- 8. FOLLOWUPS TABLE - Follow-up Processing Optimization
-- ============================================================

-- Index: Followups by status + scheduled_at (for pending follow-up processing)
-- Pattern: getPendingFollowUps() filters by status = 'pending' and scheduled_at <= now
-- Query: SELECT ... FROM followups WHERE status = 'pending' AND scheduled_at <= ? ORDER BY scheduled_at
-- File: src/lib/followup.ts:564-575
CREATE INDEX IF NOT EXISTS idx_followups_status_scheduled
ON followups(status, scheduled_at)
WHERE status = 'pending';

-- Index: Followups by patient + created (for patient follow-up history)
-- Pattern: getPatientFollowUps() filters by patient_id and orders by scheduled_at
-- Query: SELECT ... FROM followups WHERE patient_id = ? ORDER BY scheduled_at DESC
-- File: src/lib/followup.ts:452-470
CREATE INDEX IF NOT EXISTS idx_followups_patient_scheduled
ON followups(patient_id, scheduled_at DESC);

-- Index: Followups by appointment + type + status (for follow-up type queries)
-- Pattern: Multiple functions query followups by appointment_id and type
-- Query: SELECT ... FROM followups WHERE appointment_id = ? AND type = ? AND status = ?
-- File: src/lib/followup.ts:171-184
CREATE INDEX IF NOT EXISTS idx_followups_appointment_type_status
ON followups(appointment_id, type, status);

-- ============================================================
-- 9. PROFILES TABLE - User Lookup Optimization
-- ============================================================

-- Index: Profiles by role + created (for user management and analytics)
-- Pattern: Admin queries for user lists filtered by role
-- Query: SELECT ... FROM profiles WHERE role = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_profiles_role_created
ON profiles(role, created_at DESC);

-- ============================================================
-- 10. DOCTOR_SPECIALTIES TABLE - Specialty Join Optimization
-- ============================================================

-- Index: Doctor specialties by specialty_id (for specialty-based doctor lookups)
-- Pattern: getDoctorsBySpecialty() joins with specialties on specialty_id
-- Query: SELECT ... FROM doctor_specialties WHERE specialty_id = ?
-- File: src/lib/doctors.ts:54-81
CREATE INDEX IF NOT EXISTS idx_doctor_specialties_specialty
ON doctor_specialties(specialty_id);

-- ============================================================
-- 11. AVAILABILITY RULES TABLE - Availability Query Optimization
-- ============================================================

-- Index: Availability rules by doctor + day + active (for availability queries)
-- Pattern: getDoctorAvailability() filters by doctor_id and orders by day_of_week
-- Query: SELECT ... FROM availability_rules WHERE doctor_id = ? ORDER BY day_of_week
-- File: src/lib/availability.ts:19-31
CREATE INDEX IF NOT EXISTS idx_availability_rules_doctor_day
ON availability_rules(doctor_id, day_of_week)
WHERE active = true;

-- ============================================================
-- INDEX STATISTICS UPDATE
-- ============================================================
-- Update statistics for the query planner to make optimal decisions
ANALYZE appointments;
ANALYZE doctors;
ANALYZE chat_messages;
ANALYZE chat_conversations;
ANALYZE reviews;
ANALYZE payments;
ANALYZE prescriptions;
ANALYZE followups;
ANALYZE profiles;
ANALYZE doctor_specialties;
ANALYZE availability_rules;
