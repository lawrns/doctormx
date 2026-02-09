-- Performance indexes for improved query performance
-- Created: 2026-02-09

-- Appointments availability checks
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_start
ON appointments(doctor_id, start_ts DESC);

-- Appointments patient history
CREATE INDEX IF NOT EXISTS idx_appointments_patient_start
ON appointments(patient_id, start_ts DESC);

-- Chat messages pagination
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_created
ON chat_messages(conversation_id, created_at DESC);

-- Profile metrics
CREATE INDEX IF NOT EXISTS idx_profiles_role_created
ON profiles(role, created_at DESC);

-- Medical image history
CREATE INDEX IF NOT EXISTS idx_medical_images_patient_created
ON medical_image_analyses(patient_id, created_at DESC);

-- Chat receipts read tracking
CREATE INDEX IF NOT EXISTS idx_chat_receipts_message_user
ON chat_message_receipts(message_id, user_id);