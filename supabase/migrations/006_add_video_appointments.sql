-- Add video appointment fields to appointments table
-- This migration enables the video consultation feature

-- Add appointment type column (in_person or video)
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS appointment_type TEXT NOT NULL DEFAULT 'in_person'
  CHECK (appointment_type IN ('in_person', 'video'));

-- Add video status tracking
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS video_status TEXT DEFAULT 'pending'
  CHECK (video_status IN ('pending', 'ready', 'in_progress', 'completed', 'missed'));

-- Add video call timestamps
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS video_started_at TIMESTAMPTZ;

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS video_ended_at TIMESTAMPTZ;

-- Add consultation notes for post-call summary
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS consultation_notes TEXT;

-- Add video_room_id for provider integration (Daily.co room ID)
-- Note: video_room_url already exists for storing the full join URL
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS video_room_id TEXT;

-- Add indexes for video appointment queries
CREATE INDEX IF NOT EXISTS idx_appointments_video_status ON appointments(video_status);
CREATE INDEX IF NOT EXISTS idx_appointments_type ON appointments(appointment_type);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_video ON appointments(patient_id, video_status)
  WHERE video_status IN ('ready', 'in_progress');

-- Add comment for documentation
COMMENT ON COLUMN appointments.appointment_type IS 'Type of appointment: in_person or video consultation';
COMMENT ON COLUMN appointments.video_status IS 'Status of video call: pending, ready (can join), in_progress, completed, missed';
COMMENT ON COLUMN appointments.video_started_at IS 'Timestamp when video call started';
COMMENT ON COLUMN appointments.video_ended_at IS 'Timestamp when video call ended';
COMMENT ON COLUMN appointments.consultation_notes IS 'Doctor notes after consultation';
COMMENT ON COLUMN appointments.video_room_id IS 'Video provider room ID (e.g., Daily.co room ID)';
