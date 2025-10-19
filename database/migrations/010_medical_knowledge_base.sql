-- Medical Knowledge Base Migration
-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Medical knowledge base table
CREATE TABLE medical_knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  source VARCHAR(255) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimensions
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vector similarity index for fast retrieval
CREATE INDEX medical_knowledge_embedding_idx 
  ON medical_knowledge 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Indexes for filtering and searching
CREATE INDEX idx_medical_knowledge_specialty ON medical_knowledge(specialty);
CREATE INDEX idx_medical_knowledge_source ON medical_knowledge(source);
CREATE INDEX idx_medical_knowledge_created_at ON medical_knowledge(created_at);
CREATE INDEX idx_medical_knowledge_updated_at ON medical_knowledge(updated_at);

-- GIN index for metadata JSONB queries
CREATE INDEX idx_medical_knowledge_metadata ON medical_knowledge USING GIN (metadata);

-- Add RLS policies
ALTER TABLE medical_knowledge ENABLE ROW LEVEL SECURITY;

-- Only service role can access medical knowledge base
CREATE POLICY "Service role can access medical knowledge" ON medical_knowledge
  FOR ALL USING (auth.role() = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE medical_knowledge IS 'Medical knowledge base with vector embeddings for semantic search';
COMMENT ON COLUMN medical_knowledge.content IS 'Medical guideline, protocol, or reference content';
COMMENT ON COLUMN medical_knowledge.source IS 'Source of the medical information (NOM, IMSS, ISSSTE, WHO, CDC, UpToDate)';
COMMENT ON COLUMN medical_knowledge.specialty IS 'Medical specialty this content applies to';
COMMENT ON COLUMN medical_knowledge.embedding IS 'Vector embedding for semantic similarity search';
COMMENT ON COLUMN medical_knowledge.metadata IS 'Additional metadata (title, author, year, type, keywords, etc.)';

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_medical_knowledge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER medical_knowledge_updated_at_trigger
  BEFORE UPDATE ON medical_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION update_medical_knowledge_updated_at();

-- Create function to search medical knowledge by similarity
CREATE OR REPLACE FUNCTION search_medical_knowledge_by_similarity(
  query_embedding vector(1536),
  specialty_filter VARCHAR DEFAULT NULL,
  limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  source VARCHAR,
  specialty VARCHAR,
  metadata JSONB,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mk.id,
    mk.content,
    mk.source,
    mk.specialty,
    mk.metadata,
    1 - (mk.embedding <=> query_embedding) AS similarity
  FROM medical_knowledge mk
  WHERE 
    (specialty_filter IS NULL OR mk.specialty = specialty_filter OR mk.specialty = 'General')
  ORDER BY mk.embedding <=> query_embedding
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get medical knowledge statistics
CREATE OR REPLACE FUNCTION get_medical_knowledge_stats()
RETURNS TABLE (
  total_documents BIGINT,
  documents_by_specialty JSONB,
  documents_by_source JSONB,
  last_updated TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_documents,
    jsonb_object_agg(specialty, specialty_count) as documents_by_specialty,
    jsonb_object_agg(source, source_count) as documents_by_source,
    MAX(updated_at) as last_updated
  FROM (
    SELECT 
      specialty,
      COUNT(*) as specialty_count,
      source,
      COUNT(*) as source_count,
      updated_at
    FROM medical_knowledge
    GROUP BY specialty, source, updated_at
  ) stats;
END;
$$ LANGUAGE plpgsql;

-- Insert sample medical knowledge (these will be replaced by the initialization function)
INSERT INTO medical_knowledge (
  content,
  source,
  specialty,
  metadata
) VALUES (
  'La Norma Oficial Mexicana establece los requisitos para la prescripción electrónica de medicamentos. Incluye: identificación del prescriptor, datos del paciente, medicamento prescrito con dosis, frecuencia y duración, firma electrónica, y validación de la prescripción.',
  'Secretaría de Salud',
  'General',
  '{
    "title": "NOM-004-SSA3-2012 - Prescripción Electrónica",
    "author": "Secretaría de Salud",
    "year": 2012,
    "type": "nom",
    "keywords": ["prescripción", "electrónica", "medicamentos", "firma digital", "validación"]
  }'::jsonb
), (
  'Norma que regula la práctica de telemedicina en México. Establece requisitos para: consentimiento informado, confidencialidad de datos, calidad de la consulta, registro de actividades, y responsabilidades del prestador de servicios.',
  'Secretaría de Salud',
  'General',
  '{
    "title": "NOM-024-SSA3-2012 - Telemedicina",
    "author": "Secretaría de Salud",
    "year": 2012,
    "type": "nom",
    "keywords": ["telemedicina", "consentimiento", "confidencialidad", "calidad", "responsabilidad"]
  }'::jsonb
), (
  'Protocolo de atención para hipertensión arterial: diagnóstico con presión arterial ≥140/90 mmHg en dos ocasiones, evaluación de factores de riesgo cardiovascular, estudios de laboratorio básicos, tratamiento no farmacológico (dieta DASH, ejercicio, reducción de peso), y tratamiento farmacológico según escalones terapéuticos.',
  'IMSS',
  'Cardiología',
  '{
    "title": "Guía IMSS - Hipertensión Arterial",
    "author": "IMSS",
    "year": 2023,
    "type": "imss",
    "keywords": ["hipertensión", "presión arterial", "factores de riesgo", "dieta DASH", "tratamiento farmacológico"]
  }'::jsonb
), (
  'Manejo de diabetes tipo 2: diagnóstico con glucosa en ayunas ≥126 mg/dL o HbA1c ≥6.5%, monitoreo de glucosa, control de factores de riesgo, tratamiento con metformina como primera línea, insulinización cuando HbA1c >9%, y complicaciones micro y macrovasculares.',
  'IMSS',
  'Endocrinología',
  '{
    "title": "Guía IMSS - Diabetes Mellitus Tipo 2",
    "author": "IMSS",
    "year": 2023,
    "type": "imss",
    "keywords": ["diabetes", "glucosa", "HbA1c", "metformina", "insulina", "complicaciones"]
  }'::jsonb
), (
  'Escalera analgésica de la OMS: escalón 1 (paracetamol, AINEs), escalón 2 (opioides débiles como tramadol), escalón 3 (opioides fuertes como morfina), administración por vía oral cuando sea posible, dosis regulares, y evaluación continua del dolor.',
  'WHO',
  'Medicina del Dolor',
  '{
    "title": "Guía WHO - Manejo del Dolor",
    "author": "WHO",
    "year": 2022,
    "type": "who",
    "keywords": ["dolor", "analgésicos", "opioides", "paracetamol", "AINEs", "morfina"]
  }'::jsonb
);

