-- Schema for Doctor.mx broadcasting and community features

-- Broadcasts table
CREATE TABLE broadcasts (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    broadcast_type TEXT NOT NULL CHECK (broadcast_type IN ('broadcast', 'health_tip', 'appointment_reminder', 'practice_update')),
    is_urgent BOOLEAN DEFAULT FALSE,
    target_audience JSONB NOT NULL,
    category TEXT,
    published_at TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    analytics JSONB DEFAULT '{"total": 0, "read": 0, "readRate": 0, "likes": 0}'::jsonb
);

-- Patient Broadcasts junction table (tracks which broadcasts were sent to which patients)
CREATE TABLE patient_broadcasts (
    id UUID PRIMARY KEY,
    broadcast_id UUID NOT NULL REFERENCES broadcasts(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT FALSE,
    liked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (broadcast_id, patient_id)
);

-- Doctor-Patient Relationships
CREATE TABLE doctor_patient_relationships (
    id UUID PRIMARY KEY,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (doctor_id, patient_id)
);

-- Community Groups
CREATE TABLE community_groups (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES doctors(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT TRUE,
    is_moderated BOOLEAN DEFAULT TRUE
);

-- Community Group Members
CREATE TABLE community_group_members (
    id UUID PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('patient', 'doctor')),
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (group_id, user_id)
);

-- Community Group Posts
CREATE TABLE community_group_posts (
    id UUID PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
    author_id UUID NOT NULL,
    author_type TEXT NOT NULL CHECK (author_type IN ('patient', 'doctor')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_pinned BOOLEAN DEFAULT FALSE
);

-- Community Group Post Comments
CREATE TABLE community_group_post_comments (
    id UUID PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES community_group_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL,
    author_type TEXT NOT NULL CHECK (author_type IN ('patient', 'doctor')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Educational Content
CREATE TABLE educational_content (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    time_to_read INTEGER NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    author_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT TRUE
);

-- Saved Educational Content (for patients)
CREATE TABLE saved_educational_content (
    id UUID PRIMARY KEY,
    content_id UUID NOT NULL REFERENCES educational_content(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (content_id, patient_id)
);

-- Doctor Content Recommendations
CREATE TABLE doctor_content_recommendations (
    id UUID PRIMARY KEY,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES educational_content(id) ON DELETE CASCADE,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (doctor_id, patient_id, content_id)
);

-- Function to update the broadcast analytics whenever a patient reads or likes a broadcast
CREATE OR REPLACE FUNCTION update_broadcast_analytics()
RETURNS TRIGGER AS $$
DECLARE
    total_count INTEGER;
    read_count INTEGER;
    like_count INTEGER;
    read_rate NUMERIC;
BEGIN
    -- Get counts
    SELECT 
        COUNT(*), 
        COUNT(*) FILTER (WHERE read = TRUE), 
        COUNT(*) FILTER (WHERE liked = TRUE)
    INTO total_count, read_count, like_count
    FROM patient_broadcasts
    WHERE broadcast_id = NEW.broadcast_id;
    
    -- Calculate read rate
    read_rate := CASE WHEN total_count > 0 THEN (read_count::NUMERIC / total_count) * 100 ELSE 0 END;
    
    -- Update analytics
    UPDATE broadcasts
    SET analytics = jsonb_build_object(
        'total', total_count,
        'read', read_count,
        'readRate', read_rate,
        'likes', like_count
    )
    WHERE id = NEW.broadcast_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating broadcast analytics
CREATE TRIGGER update_broadcast_analytics_trigger
AFTER INSERT OR UPDATE OF read, liked ON patient_broadcasts
FOR EACH ROW
EXECUTE FUNCTION update_broadcast_analytics();

-- Row Level Security Policies

-- Broadcasts - doctors can only see their own broadcasts
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY broadcasts_insert_policy 
ON broadcasts FOR INSERT 
TO authenticated 
WITH CHECK (
    auth.uid()::text = doctor_id::text
);

CREATE POLICY broadcasts_select_policy 
ON broadcasts FOR SELECT 
TO authenticated 
USING (
    auth.uid()::text = doctor_id::text
);

CREATE POLICY broadcasts_update_policy 
ON broadcasts FOR UPDATE 
TO authenticated 
USING (
    auth.uid()::text = doctor_id::text
);

CREATE POLICY broadcasts_delete_policy 
ON broadcasts FOR DELETE 
TO authenticated 
USING (
    auth.uid()::text = doctor_id::text
);

-- Patient Broadcasts - patients can only see their own broadcasts
ALTER TABLE patient_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY patient_broadcasts_select_policy 
ON patient_broadcasts FOR SELECT 
TO authenticated 
USING (
    auth.uid()::text = patient_id::text OR
    auth.uid()::text = (SELECT doctor_id FROM broadcasts WHERE id = broadcast_id)::text
);

CREATE POLICY patient_broadcasts_update_policy 
ON patient_broadcasts FOR UPDATE 
TO authenticated 
USING (
    auth.uid()::text = patient_id::text
);

-- Doctor-Patient Relationships
ALTER TABLE doctor_patient_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY doctor_patient_relationships_select_policy 
ON doctor_patient_relationships FOR SELECT 
TO authenticated 
USING (
    auth.uid()::text = doctor_id::text OR
    auth.uid()::text = patient_id::text
);

-- Community Groups
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY community_groups_select_policy 
ON community_groups FOR SELECT 
TO authenticated 
USING (
    is_public = TRUE OR 
    auth.uid()::text IN (
        SELECT user_id::text FROM community_group_members WHERE group_id = id
    ) OR
    auth.uid()::text = created_by::text
);

CREATE POLICY community_groups_insert_policy 
ON community_groups FOR INSERT 
TO authenticated 
WITH CHECK (
    -- Only doctors can create groups (could be changed based on requirements)
    auth.uid()::text IN (SELECT id::text FROM doctors)
);

CREATE POLICY community_groups_update_policy 
ON community_groups FOR UPDATE 
TO authenticated 
USING (
    auth.uid()::text = created_by::text OR
    auth.uid()::text IN (
        SELECT user_id::text FROM community_group_members 
        WHERE group_id = id AND role IN ('admin', 'moderator')
    )
);

-- Community Group Members
ALTER TABLE community_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY community_group_members_select_policy 
ON community_group_members FOR SELECT 
TO authenticated 
USING (
    TRUE  -- Anyone authenticated can view group members
);

CREATE POLICY community_group_members_insert_policy 
ON community_group_members FOR INSERT 
TO authenticated 
WITH CHECK (
    -- Users can only add themselves to groups
    auth.uid()::text = user_id::text AND
    -- Only if the group is public or they're invited
    (
        (SELECT is_public FROM community_groups WHERE id = group_id) = TRUE OR
        -- Add logic for invitations if needed
        FALSE
    )
);

-- Educational Content
ALTER TABLE educational_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY educational_content_select_policy 
ON educational_content FOR SELECT 
TO authenticated 
USING (
    is_published = TRUE OR
    auth.uid()::text = author_id::text
);

CREATE POLICY educational_content_insert_policy 
ON educational_content FOR INSERT 
TO authenticated 
WITH CHECK (
    -- Only doctors can create educational content
    auth.uid()::text = author_id::text AND
    auth.uid()::text IN (SELECT id::text FROM doctors)
);

CREATE POLICY educational_content_update_policy 
ON educational_content FOR UPDATE 
TO authenticated 
USING (
    auth.uid()::text = author_id::text
);

-- Saved Educational Content
ALTER TABLE saved_educational_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY saved_educational_content_select_policy 
ON saved_educational_content FOR SELECT 
TO authenticated 
USING (
    auth.uid()::text = patient_id::text
);

CREATE POLICY saved_educational_content_insert_policy 
ON saved_educational_content FOR INSERT 
TO authenticated 
WITH CHECK (
    auth.uid()::text = patient_id::text
);

CREATE POLICY saved_educational_content_delete_policy 
ON saved_educational_content FOR DELETE 
TO authenticated 
USING (
    auth.uid()::text = patient_id::text
);

-- Doctor Content Recommendations
ALTER TABLE doctor_content_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY doctor_content_recommendations_select_policy 
ON doctor_content_recommendations FOR SELECT 
TO authenticated 
USING (
    auth.uid()::text = doctor_id::text OR
    auth.uid()::text = patient_id::text
);

CREATE POLICY doctor_content_recommendations_insert_policy 
ON doctor_content_recommendations FOR INSERT 
TO authenticated 
WITH CHECK (
    auth.uid()::text = doctor_id::text
);

-- Index Creation for Performance
CREATE INDEX idx_patient_broadcasts_broadcast_id ON patient_broadcasts(broadcast_id);
CREATE INDEX idx_patient_broadcasts_patient_id ON patient_broadcasts(patient_id);
CREATE INDEX idx_doctor_patient_relationships_doctor_id ON doctor_patient_relationships(doctor_id);
CREATE INDEX idx_doctor_patient_relationships_patient_id ON doctor_patient_relationships(patient_id);
CREATE INDEX idx_community_group_members_group_id ON community_group_members(group_id);
CREATE INDEX idx_community_group_members_user_id ON community_group_members(user_id);
CREATE INDEX idx_community_group_posts_group_id ON community_group_posts(group_id);
CREATE INDEX idx_community_group_posts_author_id ON community_group_posts(author_id);
CREATE INDEX idx_educational_content_category ON educational_content(category);
CREATE INDEX idx_doctor_content_recommendations_patient_id ON doctor_content_recommendations(patient_id);
