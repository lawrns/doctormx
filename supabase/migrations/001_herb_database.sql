-- Herb Database Migration for DoctorMX Phase 1
-- Creates tables for medicinal herb storage and management

-- Create herbs table
CREATE TABLE IF NOT EXISTS herbs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    latin_name TEXT NOT NULL UNIQUE,
    common_names TEXT[] NOT NULL DEFAULT '{}',
    active_compounds TEXT[] NOT NULL DEFAULT '{}',
    traditional_uses TEXT[] NOT NULL DEFAULT '{}',
    evidence_grade TEXT NOT NULL DEFAULT 'D' CHECK (evidence_grade IN ('A', 'B', 'C', 'D')),
    contraindications TEXT[] NOT NULL DEFAULT '{}',
    preparation JSONB NOT NULL DEFAULT '{}',
    sourcing JSONB NOT NULL DEFAULT '{}',
    synergies TEXT[] NOT NULL DEFAULT '{}', -- References to other herb IDs
    feature_enabled BOOLEAN DEFAULT true, -- Feature flag per herb
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for herbs table
CREATE INDEX IF NOT EXISTS idx_herbs_latin_name ON herbs(latin_name);
CREATE INDEX IF NOT EXISTS idx_herbs_common_names ON herbs USING GIN(common_names);
CREATE INDEX IF NOT EXISTS idx_herbs_traditional_uses ON herbs USING GIN(traditional_uses);
CREATE INDEX IF NOT EXISTS idx_herbs_evidence_grade ON herbs(evidence_grade);
CREATE INDEX IF NOT EXISTS idx_herbs_feature_enabled ON herbs(feature_enabled);

-- Create symptom_reports table
CREATE TABLE IF NOT EXISTS symptom_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    symptoms JSONB NOT NULL DEFAULT '[]',
    images_url TEXT[],
    analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create diagnoses table
CREATE TABLE IF NOT EXISTS diagnoses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symptom_report_id UUID REFERENCES symptom_reports(id) ON DELETE CASCADE,
    root_causes JSONB NOT NULL DEFAULT '[]',
    overall_confidence NUMERIC(3,2) DEFAULT 0.0 CHECK (overall_confidence >= 0 AND overall_confidence <= 1),
    red_flags JSONB NOT NULL DEFAULT '[]',
    recommendations JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create protocols table
CREATE TABLE IF NOT EXISTS protocols (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    diagnosis_id UUID REFERENCES diagnoses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    stages JSONB NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'paused')),
    constitutional_profile_id UUID, -- Will be created in Phase 2
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create feature_flags table for gradual rollout
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    flag_name TEXT NOT NULL UNIQUE,
    enabled BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    user_whitelist UUID[], -- Specific users who get the feature
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for other tables
CREATE INDEX IF NOT EXISTS idx_symptom_reports_session_id ON symptom_reports(session_id);
CREATE INDEX IF NOT EXISTS idx_symptom_reports_user_id ON symptom_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_symptom_report_id ON diagnoses(symptom_report_id);
CREATE INDEX IF NOT EXISTS idx_protocols_diagnosis_id ON protocols(diagnosis_id);
CREATE INDEX IF NOT EXISTS idx_protocols_user_id ON protocols(user_id);
CREATE INDEX IF NOT EXISTS idx_protocols_status ON protocols(status);

-- Create function to update updated_at timestamp (reuse existing if available)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_herbs_updated_at 
    BEFORE UPDATE ON herbs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_protocols_updated_at 
    BEFORE UPDATE ON protocols 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at 
    BEFORE UPDATE ON feature_flags 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Set up Row Level Security (RLS)
ALTER TABLE herbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for herbs (public read, expert write)
CREATE POLICY "Public can view enabled herbs" ON herbs
    FOR SELECT USING (feature_enabled = true);

CREATE POLICY "Experts can manage herbs" ON herbs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (
                auth.users.raw_user_meta_data->>'role' = 'expert' OR
                auth.users.raw_user_meta_data->>'role' = 'admin'
            )
        )
    );

-- RLS Policies for symptom_reports
CREATE POLICY "Users can view own symptom reports" ON symptom_reports
    FOR SELECT USING (auth.uid() = user_id OR session_id = current_setting('app.session_id', true));

CREATE POLICY "Users can create symptom reports" ON symptom_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for diagnoses (via symptom_reports)
CREATE POLICY "Users can view own diagnoses" ON diagnoses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM symptom_reports 
            WHERE symptom_reports.id = diagnoses.symptom_report_id 
            AND (symptom_reports.user_id = auth.uid() OR symptom_reports.session_id = current_setting('app.session_id', true))
        )
    );

CREATE POLICY "System can create diagnoses" ON diagnoses
    FOR INSERT WITH CHECK (true); -- Service role creates these

-- RLS Policies for protocols
CREATE POLICY "Users can view own protocols" ON protocols
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own protocols" ON protocols
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create protocols" ON protocols
    FOR INSERT WITH CHECK (true); -- Service role creates these

-- RLS Policies for feature_flags (admin only)
CREATE POLICY "Admins can manage feature flags" ON feature_flags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Grant permissions
GRANT ALL ON herbs TO authenticated;
GRANT ALL ON symptom_reports TO authenticated;
GRANT ALL ON diagnoses TO authenticated;
GRANT ALL ON protocols TO authenticated;
GRANT ALL ON feature_flags TO authenticated;

GRANT ALL ON herbs TO service_role;
GRANT ALL ON symptom_reports TO service_role;
GRANT ALL ON diagnoses TO service_role;
GRANT ALL ON protocols TO service_role;
GRANT ALL ON feature_flags TO service_role;

-- Insert initial feature flags
INSERT INTO feature_flags (flag_name, enabled, description, rollout_percentage) VALUES
('herb_database', true, 'Enable herb database and search functionality', 100),
('root_cause_analysis', true, 'Enable enhanced root cause correlation engine', 50),
('protocol_builder', false, 'Enable protocol generation and management', 0),
('red_flag_detection', true, 'Enable emergency red flag detection', 100),
('image_analysis_v2', false, 'Enhanced image analysis with better prompts', 25)
ON CONFLICT (flag_name) DO NOTHING;

-- Insert sample herbs for Phase 1 (Top 25 Mexican medicinal herbs)
INSERT INTO herbs (latin_name, common_names, active_compounds, traditional_uses, evidence_grade, contraindications, preparation, sourcing) VALUES
('Aloe vera', '{"sábila", "aloe"}', '{"aloin", "emodin", "polysaccharides"}', '{"burns", "wounds", "digestive issues"}', 'B', '{"pregnancy", "breastfeeding", "severe kidney disease"}', '{"forms": ["gel", "juice"], "dosage": [{"form": "topical gel", "amount": "apply thin layer", "frequency": "2-3 times daily"}]}', '{"nativeRegion": ["Mexico", "Caribbean"], "availability": "common", "sustainabilityRating": "high"}'),

('Matricaria chamomilla', '{"manzanilla", "camomila"}', '{"chamazulene", "bisabolol", "apigenin"}', '{"anxiety", "insomnia", "digestive issues", "skin inflammation"}', 'A', '{"allergy to asteraceae family"}', '{"forms": ["tea", "oil", "tincture"], "dosage": [{"form": "tea", "amount": "1-2 tsp dried flowers", "frequency": "3 times daily"}]}', '{"nativeRegion": ["Europe", "cultivated in Mexico"], "availability": "common", "sustainabilityRating": "high"}'),

('Echinacea purpurea', '{"equinácea"}', '{"echinacoside", "cichoric acid", "polysaccharides"}', '{"immune support", "cold", "flu", "wound healing"}', 'B', '{"autoimmune diseases", "pregnancy"}', '{"forms": ["tincture", "capsule", "tea"], "dosage": [{"form": "tincture", "amount": "1-2 ml", "frequency": "3 times daily"}]}', '{"nativeRegion": ["North America"], "availability": "common", "sustainabilityRating": "medium"}'),

('Curcuma longa', '{"cúrcuma", "turmeric"}', '{"curcumin", "turmerones"}', '{"inflammation", "arthritis", "digestive issues", "antioxidant"}', 'A', '{"gallstones", "blood thinning medications"}', '{"forms": ["powder", "capsule", "fresh"], "dosage": [{"form": "powder", "amount": "1-3 g", "frequency": "daily with black pepper"}]}', '{"nativeRegion": ["India", "cultivated worldwide"], "availability": "common", "sustainabilityRating": "high"}'),

('Zingiber officinale', '{"jengibre", "ginger"}', '{"gingerol", "shogaol", "zingiberene"}', '{"nausea", "motion sickness", "inflammation", "digestive issues"}', 'A', '{"gallstones", "blood thinning medications"}', '{"forms": ["fresh", "powder", "tea"], "dosage": [{"form": "fresh", "amount": "1-4 g", "frequency": "daily"}]}', '{"nativeRegion": ["Asia", "cultivated in Mexico"], "availability": "common", "sustainabilityRating": "high"}')

ON CONFLICT (latin_name) DO NOTHING;

-- Create a simple function to search herbs (will be enhanced in HerbService)
CREATE OR REPLACE FUNCTION search_herbs(
    search_query TEXT DEFAULT '',
    evidence_filter TEXT[] DEFAULT NULL,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    latin_name TEXT,
    common_names TEXT[],
    traditional_uses TEXT[],
    evidence_grade TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.latin_name,
        h.common_names,
        h.traditional_uses,
        h.evidence_grade
    FROM herbs h
    WHERE 
        h.feature_enabled = true
        AND (
            search_query = '' OR
            h.latin_name ILIKE '%' || search_query || '%' OR
            EXISTS (SELECT 1 FROM unnest(h.common_names) AS name WHERE name ILIKE '%' || search_query || '%') OR
            EXISTS (SELECT 1 FROM unnest(h.traditional_uses) AS use WHERE use ILIKE '%' || search_query || '%')
        )
        AND (
            evidence_filter IS NULL OR
            h.evidence_grade = ANY(evidence_filter)
        )
    ORDER BY 
        CASE WHEN h.latin_name ILIKE search_query || '%' THEN 1 ELSE 2 END,
        h.evidence_grade,
        h.latin_name
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;