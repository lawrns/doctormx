-- Fix feature flags access for anonymous users
-- This migration adds a public read policy for feature flags

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Admins can manage feature flags" ON feature_flags;

-- Create new policies that allow public read access
CREATE POLICY "Public can read feature flags" ON feature_flags
    FOR SELECT USING (true);

-- Admins can still manage feature flags
CREATE POLICY "Admins can manage feature flags" ON feature_flags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Service role can also manage feature flags
CREATE POLICY "Service role can manage feature flags" ON feature_flags
    FOR ALL USING (
        auth.role() = 'service_role'
    );

-- Ensure the table has the correct structure and default flags
INSERT INTO feature_flags (flag_name, enabled, description, rollout_percentage) VALUES
('herb_database', true, 'Enable herb database and search functionality', 100),
('root_cause_analysis', true, 'Enable enhanced root cause correlation engine', 50),
('protocol_builder', false, 'Enable protocol generation and management', 0),
('constitutional_analysis', false, 'Enable constitutional analysis features', 25),
('red_flag_detection', true, 'Enable emergency red flag detection', 100),
('image_analysis_v2', false, 'Enhanced image analysis with better prompts', 25),
('progress_tracking', false, 'Enable treatment progress tracking', 0),
('knowledge_graph', false, 'Enable medical knowledge graph features', 0),
('expert_portal', false, 'Enable expert consultation portal', 0),
('marketplace', false, 'Enable herb marketplace features', 0),
('community', false, 'Enable community features', 0),
('multilingual', false, 'Enable multilingual support', 0)
ON CONFLICT (flag_name) DO UPDATE SET
    description = EXCLUDED.description,
    rollout_percentage = EXCLUDED.rollout_percentage;
