/*
  # Expand Symptom Checker Database

  1. New Tables
    - `symptom_question_groups` - Groups related questions together
    - `symptom_conditions_treatments` - Links conditions to recommended treatments
    - `symptom_severity_rules` - Rules for determining condition severity
    
  2. Changes
    - Add new fields to existing tables
    - Add validation rules and constraints
    
  3. Security
    - Enable RLS on new tables
    - Add policies for public read access
*/

-- Create symptom question groups table
CREATE TABLE IF NOT EXISTS symptom_question_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  display_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add group_id to symptom_questions
ALTER TABLE symptom_questions 
ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES symptom_question_groups(id);

-- Create symptom conditions treatments table
CREATE TABLE IF NOT EXISTS symptom_conditions_treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_id uuid REFERENCES symptoms_conditions(id) ON DELETE CASCADE,
  treatment_name text NOT NULL,
  treatment_description text,
  treatment_type text NOT NULL CHECK (treatment_type IN ('medication', 'therapy', 'lifestyle', 'surgery', 'emergency')),
  priority integer CHECK (priority BETWEEN 1 AND 5),
  requires_prescription boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create symptom severity rules table
CREATE TABLE IF NOT EXISTS symptom_severity_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_id uuid REFERENCES symptoms_conditions(id) ON DELETE CASCADE,
  rule_type text NOT NULL CHECK (rule_type IN ('age', 'duration', 'comorbidity', 'symptoms', 'vitals')),
  rule_criteria jsonb NOT NULL,
  severity_modifier integer NOT NULL CHECK (severity_modifier BETWEEN -2 AND 2),
  created_at timestamptz DEFAULT now()
);

-- Add more fields to symptoms table
ALTER TABLE symptoms
ADD COLUMN IF NOT EXISTS typical_duration text,
ADD COLUMN IF NOT EXISTS common_triggers jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS warning_signs jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS prevention_tips jsonb DEFAULT '[]'::jsonb;

-- Add more fields to symptom_questions
ALTER TABLE symptom_questions
ADD COLUMN IF NOT EXISTS help_text text,
ADD COLUMN IF NOT EXISTS validation_rules jsonb,
ADD COLUMN IF NOT EXISTS skip_logic jsonb,
ADD COLUMN IF NOT EXISTS required boolean DEFAULT true;

-- Enable RLS on new tables
ALTER TABLE symptom_question_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_conditions_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_severity_rules ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can view question groups"
  ON symptom_question_groups
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Public can view treatments"
  ON symptom_conditions_treatments
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Public can view severity rules"
  ON symptom_severity_rules
  FOR SELECT TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS symptom_questions_group_id_idx ON symptom_questions(group_id);
CREATE INDEX IF NOT EXISTS symptom_conditions_treatments_condition_id_idx ON symptom_conditions_treatments(condition_id);
CREATE INDEX IF NOT EXISTS symptom_severity_rules_condition_id_idx ON symptom_severity_rules(condition_id);

-- Insert initial question groups
INSERT INTO symptom_question_groups (name, description, display_order) VALUES
('Características principales', 'Preguntas sobre las características principales del síntoma', 1),
('Factores temporales', 'Preguntas sobre duración y patrones temporales', 2),
('Factores agravantes', 'Preguntas sobre lo que empeora los síntomas', 3),
('Factores de alivio', 'Preguntas sobre lo que mejora los síntomas', 4),
('Síntomas asociados', 'Preguntas sobre otros síntomas relacionados', 5),
('Historial médico', 'Preguntas sobre condiciones y tratamientos previos', 6),
('Señales de alarma', 'Preguntas sobre signos y síntomas preocupantes', 7);

-- Insert example severity rules
INSERT INTO symptom_severity_rules (condition_id, rule_type, rule_criteria, severity_modifier) 
SELECT 
  id as condition_id,
  'age' as rule_type,
  '{"min_age": 65}' as rule_criteria,
  1 as severity_modifier
FROM symptoms_conditions 
WHERE condition_name = 'Dolor abdominal'
ON CONFLICT DO NOTHING;

-- Insert example treatments
INSERT INTO symptom_conditions_treatments (condition_id, treatment_name, treatment_description, treatment_type, priority, requires_prescription) 
SELECT 
  id as condition_id,
  'Reposo y observación' as treatment_name,
  'Descansar y monitorear los síntomas por 24-48 horas' as treatment_description,
  'lifestyle' as treatment_type,
  1 as priority,
  false as requires_prescription
FROM symptoms_conditions 
WHERE condition_name = 'Dolor abdominal'
ON CONFLICT DO NOTHING;