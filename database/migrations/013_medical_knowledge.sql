-- Enable pgvector extension for medical knowledge base
CREATE EXTENSION IF NOT EXISTS vector;

-- Medical knowledge base table for RAG system
CREATE TABLE medical_knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  source VARCHAR(255),
  specialty VARCHAR(100),
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vector similarity index for semantic search
CREATE INDEX medical_knowledge_embedding_idx 
  ON medical_knowledge 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Index for specialty filtering
CREATE INDEX medical_knowledge_specialty_idx ON medical_knowledge(specialty);

-- Index for source filtering
CREATE INDEX medical_knowledge_source_idx ON medical_knowledge(source);

-- Add RLS policies
ALTER TABLE medical_knowledge ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read medical knowledge
CREATE POLICY "Allow authenticated users to read medical knowledge" ON medical_knowledge
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role to manage medical knowledge
CREATE POLICY "Allow service role to manage medical knowledge" ON medical_knowledge
  FOR ALL USING (auth.role() = 'service_role');

