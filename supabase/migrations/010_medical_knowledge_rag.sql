-- Migration: Medical Knowledge Base (RAG)
-- Created: 2026-02-09
-- Description: Creates table for storing medical knowledge with embeddings for RAG

-- Medical Knowledge Table with Vector Embeddings
CREATE TABLE IF NOT EXISTS medical_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  source TEXT NOT NULL,
  specialty TEXT NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension

  -- Metadata as JSONB for flexible querying
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_medical_knowledge_specialty ON medical_knowledge(specialty);
CREATE INDEX IF NOT EXISTS idx_medical_knowledge_source ON medical_knowledge(source);
CREATE INDEX IF NOT EXISTS idx_medical_knowledge_created ON medical_knowledge(created_at DESC);

-- GIN index on metadata for keyword/JSON queries
CREATE INDEX IF NOT EXISTS idx_medical_knowledge_metadata_gin ON medical_knowledge USING GIN (metadata);

-- Vector similarity search function using cosine similarity
-- This function matches documents by embedding similarity
CREATE OR REPLACE FUNCTION match_medical_documents(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 5,
  filter_specialty TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  source TEXT,
  specialty TEXT,
  metadata JSONB,
  similarity FLOAT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mk.id,
    mk.content,
    mk.source,
    mk.specialty,
    mk.metadata,
    -- Cosine similarity: (A · B) / (||A|| * ||B||)
    1 - (query_embedding <=> mk.embedding) AS similarity,
    mk.created_at,
    mk.updated_at
  FROM medical_knowledge mk
  WHERE
    -- Apply specialty filter if provided
    (filter_specialty IS NULL OR mk.specialty = filter_specialty)
    -- Only return results above threshold
    AND (1 - (query_embedding <=> mk.embedding)) >= match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_medical_knowledge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_medical_knowledge_updated_at ON medical_knowledge;
CREATE TRIGGER update_medical_knowledge_updated_at
  BEFORE UPDATE ON medical_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION update_medical_knowledge_updated_at();

-- Enable Row Level Security
ALTER TABLE medical_knowledge ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Only admins can manage medical knowledge
CREATE POLICY "Admins can do all operations on medical_knowledge"
  ON medical_knowledge
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p
    JOIN doctors d ON p.id = d.id
    WHERE p.id = auth.uid()
    AND d.subscription_tier IN ('pro', 'elite')
  ))
  OR EXISTS (
    -- Also allow service role
    SELECT 1 WHERE auth.uid() IS NULL
  );

-- Read-only access for AI endpoints (service role only)
CREATE POLICY "Service role can read medical_knowledge"
  ON medical_knowledge
  FOR SELECT
  USING (auth.uid() IS NULL);

-- Comments for documentation
COMMENT ON TABLE medical_knowledge IS 'Medical knowledge base with vector embeddings for RAG (Retrieval Augmented Generation)';
COMMENT ON COLUMN medical_knowledge.embedding IS 'OpenAI text-embedding-3-small vector (1536 dimensions)';
COMMENT ON COLUMN medical_knowledge.metadata IS 'Flexible metadata including: title, author, year, type, url, keywords';
COMMENT ON FUNCTION match_medical_documents IS 'Performs vector similarity search using cosine similarity to find relevant medical documents';
