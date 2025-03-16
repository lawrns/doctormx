-- Migration: Doctor.mx Community Foundation
-- Description: Sets up the database tables needed for the community features

-- Table for patient-doctor relationships (care team)
CREATE TABLE IF NOT EXISTS care_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('active', 'pending', 'removed')),
  added_at timestamptz NOT NULL DEFAULT now(),
  last_interaction_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(patient_id, doctor_id)
);

-- Table for provider broadcasts
CREATE TABLE IF NOT EXISTS provider_broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  broadcast_type TEXT NOT NULL CHECK (broadcast_type IN ('broadcast', 'health_tip', 'appointment_reminder', 'practice_update')),
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  target_audience JSONB NOT NULL DEFAULT '{"type": "all"}'::jsonb,
  scheduled_for timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table for broadcast recipients
CREATE TABLE IF NOT EXISTS broadcast_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id uuid REFERENCES provider_broadcasts(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at timestamptz,
  dismissed_at timestamptz,
  liked boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(broadcast_id, patient_id)
);

-- Table for community groups
CREATE TABLE IF NOT EXISTS community_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  icon_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table for group moderators
CREATE TABLE IF NOT EXISTS group_moderators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES community_groups(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(group_id, doctor_id)
);

-- Table for group members
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES community_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Table for educational content
CREATE TABLE IF NOT EXISTS educational_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('article', 'video', 'guide', 'infographic')),
  category TEXT NOT NULL,
  condition TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  cover_image_url TEXT,
  url TEXT,
  duration_minutes INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table for saved content
CREATE TABLE IF NOT EXISTS saved_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES educational_content(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  saved_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(content_id, user_id)
);

-- Table for content recommendations
CREATE TABLE IF NOT EXISTS content_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES educational_content(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(content_id, doctor_id, patient_id)
);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at triggers for all tables
CREATE TRIGGER update_care_team_members_updated_at
  BEFORE UPDATE ON care_team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_broadcasts_updated_at
  BEFORE UPDATE ON provider_broadcasts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_broadcast_recipients_updated_at
  BEFORE UPDATE ON broadcast_recipients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_groups_updated_at
  BEFORE UPDATE ON community_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_moderators_updated_at
  BEFORE UPDATE ON group_moderators
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_members_updated_at
  BEFORE UPDATE ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_educational_content_updated_at
  BEFORE UPDATE ON educational_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_content_updated_at
  BEFORE UPDATE ON saved_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_recommendations_updated_at
  BEFORE UPDATE ON content_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS care_team_members_patient_id_idx ON care_team_members(patient_id);
CREATE INDEX IF NOT EXISTS care_team_members_doctor_id_idx ON care_team_members(doctor_id);
CREATE INDEX IF NOT EXISTS provider_broadcasts_doctor_id_idx ON provider_broadcasts(doctor_id);
CREATE INDEX IF NOT EXISTS broadcast_recipients_broadcast_id_idx ON broadcast_recipients(broadcast_id);
CREATE INDEX IF NOT EXISTS broadcast_recipients_patient_id_idx ON broadcast_recipients(patient_id);
CREATE INDEX IF NOT EXISTS educational_content_doctor_id_idx ON educational_content(doctor_id);
CREATE INDEX IF NOT EXISTS educational_content_category_idx ON educational_content(category);
CREATE INDEX IF NOT EXISTS saved_content_user_id_idx ON saved_content(user_id);
CREATE INDEX IF NOT EXISTS content_recommendations_patient_id_idx ON content_recommendations(patient_id);

-- Set up Row Level Security (RLS)
ALTER TABLE care_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE educational_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS policies for care_team_members
CREATE POLICY "Patients can view their own care team"
  ON care_team_members
  FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view patients who have them in their care team"
  ON care_team_members
  FOR SELECT
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Patients can add doctors to their care team"
  ON care_team_members
  FOR INSERT
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can update their care team relationships"
  ON care_team_members
  FOR UPDATE
  USING (patient_id = auth.uid());

-- RLS policies for provider_broadcasts
CREATE POLICY "Doctors can view their own broadcasts"
  ON provider_broadcasts
  FOR SELECT
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Doctors can create broadcasts"
  ON provider_broadcasts
  FOR INSERT
  WITH CHECK (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Doctors can update their own broadcasts"
  ON provider_broadcasts
  FOR UPDATE
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

-- RLS policies for broadcast_recipients
CREATE POLICY "Patients can view broadcasts sent to them"
  ON broadcast_recipients
  FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view recipients of their broadcasts"
  ON broadcast_recipients
  FOR SELECT
  USING (broadcast_id IN (
    SELECT id FROM provider_broadcasts 
    WHERE doctor_id IN (
      SELECT id FROM doctors WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "System can insert broadcast recipients"
  ON broadcast_recipients
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Patients can update their broadcast status (read/like/dismiss)"
  ON broadcast_recipients
  FOR UPDATE
  USING (patient_id = auth.uid());

-- RLS policies for community_groups
CREATE POLICY "Everyone can view public community groups"
  ON community_groups
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "Members can view private groups they belong to"
  ON community_groups
  FOR SELECT
  USING (
    id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors who are moderators can update groups"
  ON community_groups
  FOR UPDATE
  USING (
    id IN (
      SELECT group_id FROM group_moderators 
      WHERE doctor_id IN (
        SELECT id FROM doctors WHERE user_id = auth.uid()
      )
    )
  );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON care_team_members TO authenticated;
GRANT SELECT, INSERT, UPDATE ON provider_broadcasts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON broadcast_recipients TO authenticated;
GRANT SELECT ON community_groups TO authenticated;
GRANT SELECT, INSERT ON group_members TO authenticated;
GRANT SELECT ON group_moderators TO authenticated;
GRANT SELECT ON educational_content TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saved_content TO authenticated;
GRANT SELECT ON content_recommendations TO authenticated;