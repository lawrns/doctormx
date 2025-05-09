CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS medical_knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  term TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  related_conditions TEXT[] DEFAULT '{}',
  severity_level INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medical_knowledge_term ON medical_knowledge(term);
CREATE INDEX IF NOT EXISTS idx_medical_knowledge_category ON medical_knowledge(category);

CREATE TABLE IF NOT EXISTS symptom_condition_map (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symptom_id UUID NOT NULL REFERENCES medical_knowledge(id),
  condition_id UUID NOT NULL REFERENCES medical_knowledge(id),
  correlation_strength FLOAT NOT NULL DEFAULT 0.5,
  is_primary_symptom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_symptom_condition_symptom ON symptom_condition_map(symptom_id);
CREATE INDEX IF NOT EXISTS idx_symptom_condition_condition ON symptom_condition_map(condition_id);

CREATE TABLE IF NOT EXISTS treatment_protocols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condition_id UUID NOT NULL REFERENCES medical_knowledge(id),
  protocol_name TEXT NOT NULL,
  description TEXT NOT NULL,
  steps JSONB NOT NULL,
  evidence_level TEXT NOT NULL,
  contraindications TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treatment_protocols_condition ON treatment_protocols(condition_id);

CREATE TABLE IF NOT EXISTS medical_literature (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL,
  publication_date DATE,
  journal TEXT,
  doi TEXT,
  url TEXT,
  abstract TEXT,
  keywords TEXT[] DEFAULT '{}',
  related_conditions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medical_literature_keywords ON medical_literature USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_medical_literature_conditions ON medical_literature USING GIN(related_conditions);

CREATE TABLE IF NOT EXISTS image_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  image_hash TEXT NOT NULL,
  image_url TEXT,
  findings TEXT,
  confidence FLOAT,
  suggested_conditions TEXT[] DEFAULT '{}',
  suggested_specialty TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_image_analysis_user ON image_analysis(user_id);

CREATE TABLE IF NOT EXISTS ai_analysis_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  symptoms TEXT[] DEFAULT '{}',
  severity_level INTEGER,
  is_emergency BOOLEAN DEFAULT FALSE,
  possible_conditions JSONB DEFAULT '[]',
  recommendations TEXT[] DEFAULT '{}',
  follow_up_questions TEXT[] DEFAULT '{}',
  suggested_specialty TEXT,
  image_analysis_id UUID REFERENCES image_analysis(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_sessions_user ON ai_analysis_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_sessions_emergency ON ai_analysis_sessions(is_emergency);

CREATE TABLE IF NOT EXISTS digital_prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES auth.users(id),
  patient_id UUID NOT NULL REFERENCES auth.users(id),
  medications JSONB NOT NULL,
  dosage_instructions TEXT NOT NULL,
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  pharmacy_id UUID,
  is_filled BOOLEAN DEFAULT FALSE,
  filled_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_digital_prescriptions_doctor ON digital_prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_digital_prescriptions_patient ON digital_prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_digital_prescriptions_valid_until ON digital_prescriptions(valid_until);


ALTER TABLE medical_knowledge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Medical knowledge is readable by everyone" 
ON medical_knowledge FOR SELECT 
USING (true);

ALTER TABLE symptom_condition_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Symptom-condition map is readable by everyone" 
ON symptom_condition_map FOR SELECT 
USING (true);

ALTER TABLE treatment_protocols ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Treatment protocols are readable by everyone" 
ON treatment_protocols FOR SELECT 
USING (true);

ALTER TABLE medical_literature ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Medical literature is readable by everyone" 
ON medical_literature FOR SELECT 
USING (true);

ALTER TABLE image_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own image analysis" 
ON image_analysis FOR SELECT 
USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own image analysis" 
ON image_analysis FOR INSERT 
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own image analysis" 
ON image_analysis FOR UPDATE 
USING (auth.uid() = user_id);

ALTER TABLE ai_analysis_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own AI analysis sessions" 
ON ai_analysis_sessions FOR SELECT 
USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own AI analysis sessions" 
ON ai_analysis_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own AI analysis sessions" 
ON ai_analysis_sessions FOR UPDATE 
USING (auth.uid() = user_id);

ALTER TABLE digital_prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors can create prescriptions" 
ON digital_prescriptions FOR INSERT 
WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "Doctors can view prescriptions they created" 
ON digital_prescriptions FOR SELECT 
USING (auth.uid() = doctor_id);
CREATE POLICY "Patients can view their own prescriptions" 
ON digital_prescriptions FOR SELECT 
USING (auth.uid() = patient_id);
CREATE POLICY "Doctors can update prescriptions they created" 
ON digital_prescriptions FOR UPDATE 
USING (auth.uid() = doctor_id);

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_medical_knowledge_timestamp
BEFORE UPDATE ON medical_knowledge
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_symptom_condition_map_timestamp
BEFORE UPDATE ON symptom_condition_map
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_treatment_protocols_timestamp
BEFORE UPDATE ON treatment_protocols
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_ai_analysis_sessions_timestamp
BEFORE UPDATE ON ai_analysis_sessions
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_digital_prescriptions_timestamp
BEFORE UPDATE ON digital_prescriptions
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
