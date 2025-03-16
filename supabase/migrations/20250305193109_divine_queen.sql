/*
  # Enhanced Symptoms System Schema

  1. New Tables
    - `body_regions`: Detailed body regions and sub-regions
    - `symptoms_conditions`: Links symptoms to possible conditions
    - `symptom_factors`: Additional factors like age, gender, duration
    - `condition_specialties`: Links conditions to medical specialties
    - `emergency_services`: Emergency service contact information

  2. Schema Updates
    - Add more detailed symptom categorization
    - Enhanced diagnostic flow tracking
    - Improved recommendation system
*/

-- Create body regions table with hierarchical structure
CREATE TABLE IF NOT EXISTS body_regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid REFERENCES body_regions(id),
  description text,
  coordinates jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create symptoms conditions mapping
CREATE TABLE IF NOT EXISTS symptoms_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symptom_id uuid REFERENCES symptoms(id),
  condition_name text NOT NULL,
  probability integer CHECK (probability BETWEEN 0 AND 100),
  severity_level integer CHECK (severity_level BETWEEN 1 AND 5),
  requires_emergency boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create symptom factors table
CREATE TABLE IF NOT EXISTS symptom_factors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symptom_id uuid REFERENCES symptoms(id),
  factor_type text NOT NULL,
  factor_value jsonb,
  weight integer CHECK (weight BETWEEN 1 AND 10),
  created_at timestamptz DEFAULT now()
);

-- Create condition specialties mapping
CREATE TABLE IF NOT EXISTS condition_specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_id uuid REFERENCES symptoms_conditions(id),
  specialty_name text NOT NULL,
  priority integer CHECK (priority BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now()
);

-- Add new columns to symptoms table
ALTER TABLE symptoms 
ADD COLUMN IF NOT EXISTS duration_relevance boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS age_specific boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS gender_specific boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS follow_up_questions jsonb DEFAULT '[]'::jsonb;

-- Add new columns to symptom_questions
ALTER TABLE symptom_questions
ADD COLUMN IF NOT EXISTS question_type text CHECK (question_type IN ('boolean', 'scale', 'multiple_choice', 'duration')),
ADD COLUMN IF NOT EXISTS options jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS conditional_logic jsonb DEFAULT NULL;

-- Enable RLS
ALTER TABLE body_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE condition_specialties ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view body regions" ON body_regions
  FOR SELECT TO public USING (true);

CREATE POLICY "Public can view symptoms conditions" ON symptoms_conditions
  FOR SELECT TO public USING (true);

CREATE POLICY "Public can view symptom factors" ON symptom_factors
  FOR SELECT TO public USING (true);

CREATE POLICY "Public can view condition specialties" ON condition_specialties
  FOR SELECT TO public USING (true);

-- Seed body regions
INSERT INTO body_regions (name, description) VALUES
('head', 'Región de la cabeza y rostro'),
('forehead', 'Frente'),
('temples', 'Sienes'),
('back_head', 'Parte posterior de la cabeza'),
('eyes', 'Ojos'),
('nose', 'Nariz'),
('mouth', 'Boca'),
('jaw', 'Mandíbula'),
('ears', 'Oídos')
ON CONFLICT DO NOTHING;

-- Update parent_id for sub-regions
DO $$
DECLARE
  head_id uuid;
BEGIN
  SELECT id INTO head_id FROM body_regions WHERE name = 'head';
  
  UPDATE body_regions 
  SET parent_id = head_id 
  WHERE name IN ('forehead', 'temples', 'back_head', 'eyes', 'nose', 'mouth', 'jaw', 'ears');
END $$;