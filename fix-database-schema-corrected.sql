-- Fix database schema issues (corrected syntax)

-- 1. Enable pgvector extension for medical knowledge base
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create medical knowledge base table for RAG system
CREATE TABLE IF NOT EXISTS medical_knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  source VARCHAR(255),
  specialty VARCHAR(100),
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create vector similarity index for semantic search
CREATE INDEX IF NOT EXISTS medical_knowledge_embedding_idx 
  ON medical_knowledge 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 4. Create indexes for filtering
CREATE INDEX IF NOT EXISTS medical_knowledge_specialty_idx ON medical_knowledge(specialty);
CREATE INDEX IF NOT EXISTS medical_knowledge_source_idx ON medical_knowledge(source);

-- 5. Enable RLS and add policies for medical knowledge
ALTER TABLE medical_knowledge ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read medical knowledge" ON medical_knowledge;
DROP POLICY IF EXISTS "Allow service role to manage medical knowledge" ON medical_knowledge;

CREATE POLICY "Allow authenticated users to read medical knowledge" ON medical_knowledge
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to manage medical knowledge" ON medical_knowledge
  FOR ALL USING (auth.role() = 'service_role');

-- 6. Fix health_scores table by adding missing 'level' column
ALTER TABLE health_scores ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Update existing records to have level 1
UPDATE health_scores SET level = 1 WHERE level IS NULL;

-- Drop existing constraint if it exists
ALTER TABLE health_scores DROP CONSTRAINT IF EXISTS health_scores_level_check;

-- Add constraint to ensure level is positive
ALTER TABLE health_scores ADD CONSTRAINT health_scores_level_check CHECK (level > 0);

-- Add index for level queries
CREATE INDEX IF NOT EXISTS health_scores_level_idx ON health_scores(level);

-- 7. Fix user_free_questions table
-- Drop existing table if it exists to recreate with correct structure
DROP TABLE IF EXISTS user_free_questions CASCADE;

CREATE TABLE user_free_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    questions_used INTEGER DEFAULT 0,
    questions_remaining INTEGER DEFAULT 5,
    reset_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS user_free_questions_user_id_idx ON user_free_questions(user_id);
CREATE INDEX IF NOT EXISTS user_free_questions_reset_date_idx ON user_free_questions(reset_date);

-- Enable RLS
ALTER TABLE user_free_questions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own free questions" ON user_free_questions;
DROP POLICY IF EXISTS "Users can update their own free questions" ON user_free_questions;
DROP POLICY IF EXISTS "Service role can manage all free questions" ON user_free_questions;

-- Add RLS policies
CREATE POLICY "Users can view their own free questions" ON user_free_questions
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own free questions" ON user_free_questions
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY "Service role can manage all free questions" ON user_free_questions
    FOR ALL USING (auth.role() = 'service_role');

-- 8. Insert some sample medical knowledge for testing
INSERT INTO medical_knowledge (content, source, specialty, metadata) VALUES
('Headaches can be classified as primary (tension, migraine, cluster) or secondary (due to underlying conditions). Migraine headaches typically present with unilateral throbbing pain, photophobia, phonophobia, and nausea.', 'NOM-004-SSA3-2012', 'Neurología', '{"type": "clinical_guideline", "severity": "moderate"}'),
('Chest pain evaluation should include assessment of cardiac risk factors, pain characteristics, associated symptoms, and physical examination findings. Red flags include radiation to arm/jaw, diaphoresis, and shortness of breath.', 'American Heart Association Guidelines', 'Cardiología', '{"type": "clinical_guideline", "severity": "high"}'),
('Fever in adults is defined as temperature >38°C (100.4°F). Evaluation should include duration, associated symptoms, travel history, and risk factors for serious infection.', 'CDC Guidelines', 'Medicina General', '{"type": "clinical_guideline", "severity": "moderate"}')
ON CONFLICT DO NOTHING;

