-- Schema for Doctor.mx broadcasting and community features

-- Broadcasts table (adjusted to match existing schema)
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
    doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    analytics JSONB DEFAULT '{"total": 0, "read": 0, "readRate": 0, "likes": 0}'::jsonb
);

-- Patient Broadcasts junction table
CREATE TABLE patient_broadcasts (
    id UUID PRIMARY KEY,
    broadcast_id UUID NOT NULL REFERENCES broadcasts(id) ON DELETE CASCADE,
    patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT FALSE,
    liked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (broadcast_id, patient_id)
);

-- Doctor-Patient Relationships
CREATE TABLE doctor_patient_relationships (
    id UUID PRIMARY KEY,
    doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
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
    created_by BIGINT REFERENCES doctors(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT TRUE,
    is_moderated BOOLEAN DEFAULT TRUE
);

-- Community Group Members
CREATE TABLE community_group_members (
    id UUID PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('patient', 'doctor')),
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (group_id, user_id)
);

-- Community Group Posts
CREATE TABLE community_group_posts (
    id UUID PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL,
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
    author_id BIGINT NOT NULL,
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
    author_id BIGINT REFERENCES doctors(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT TRUE
);

-- Saved Educational Content (for patients)
CREATE TABLE saved_educational_content (
    id UUID PRIMARY KEY,
    content_id UUID NOT NULL REFERENCES educational_content(id) ON DELETE CASCADE,
    patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (content_id, patient_id)
);

-- Doctor Content Recommendations
CREATE TABLE doctor_content_recommendations (
    id UUID PRIMARY KEY,
    doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES educational_content(id) ON DELETE CASCADE,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (doctor_id, patient_id, content_id)
);

-- Function to update the broadcast analytics
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
-- Broadcasts
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY broadcasts_insert_policy 
ON broadcasts FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM doctors 
        WHERE id = doctor_id AND user_id = auth.uid()
    )
);

CREATE POLICY broadcasts_select_policy 
ON broadcasts FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM doctors 
        WHERE id = doctor_id AND user_id = auth.uid()
    )
);

CREATE POLICY broadcasts_update_policy 
ON broadcasts FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM doctors 
        WHERE id = doctor_id AND user_id = auth.uid()
    )
);

CREATE POLICY broadcasts_delete_policy 
ON broadcasts FOR DELETE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM doctors 
        WHERE id = doctor_id AND user_id = auth.uid()
    )
);

-- Patient Broadcasts
ALTER TABLE patient_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY patient_broadcasts_select_policy 
ON patient_broadcasts FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM patients 
        WHERE id = patient_id AND user_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM broadcasts b 
        JOIN doctors d ON b.doctor_id = d.id 
        WHERE b.id = broadcast_id AND d.user_id = auth.uid()
    )
);

CREATE POLICY patient_broadcasts_update_policy 
ON patient_broadcasts FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM patients 
        WHERE id = patient_id AND user_id = auth.uid()
    )
);

-- Indexes for performance
CREATE INDEX idx_patient_broadcasts_broadcast_id ON patient_broadcasts(broadcast_id);
CREATE INDEX idx_patient_broadcasts_patient_id ON patient_broadcasts(patient_id);
CREATE INDEX idx_doctor_patient_relationships_doctor_id ON doctor_patient_relationships(doctor_id);
CREATE INDEX idx_doctor_patient_relationships_patient_id ON doctor_patient_relationships(patient_id);
CREATE INDEX idx_community_group_members_group_id ON community_group_members(group_id);
CREATE INDEX idx_community_group_members_user_id ON community_group_members(user_id);
CREATE INDEX idx_community_group_posts_group_id ON community_group_posts(group_id);
CREATE INDEX idx_educational_content_category ON educational_content(category);
