/*
  # Symptom Checker Database Schema

  1. New Tables
    - `body_regions` - Stores anatomical regions for symptom mapping
    - `symptoms` - Core symptoms table with severity levels
    - `symptom_questions` - Questions for symptom assessment
    - `symptom_conditions` - Maps symptoms to possible conditions
    - `condition_specialties` - Links conditions to medical specialties
    - `symptom_factors` - Additional diagnostic criteria

  2. Security
    - Enable RLS on all tables
    - Public read access for symptom checker functionality

  3. Indexes
    - Optimized indexes for foreign key relationships
*/

-- Create body regions table
CREATE TABLE IF NOT EXISTS body_regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid REFERENCES body_regions(id),
  description text,
  coordinates jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create symptoms table
CREATE TABLE IF NOT EXISTS symptoms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  body_region text NOT NULL,
  severity_level integer NOT NULL CHECK (severity_level BETWEEN 1 AND 5),
  duration_relevance boolean DEFAULT false,
  age_specific boolean DEFAULT false,
  gender_specific boolean DEFAULT false,
  follow_up_questions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create symptom questions table
CREATE TABLE IF NOT EXISTS symptom_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symptom_id uuid REFERENCES symptoms(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_order integer NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('boolean', 'scale', 'multiple_choice', 'duration')),
  options jsonb,
  conditional_logic jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create symptom conditions table
CREATE TABLE IF NOT EXISTS symptom_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symptom_id uuid REFERENCES symptoms(id),
  condition_name text NOT NULL,
  probability integer CHECK (probability BETWEEN 0 AND 100),
  severity_level integer CHECK (severity_level BETWEEN 1 AND 5),
  requires_emergency boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create condition specialties table
CREATE TABLE IF NOT EXISTS condition_specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_id uuid REFERENCES symptom_conditions(id),
  specialty_name text NOT NULL,
  priority integer CHECK (priority BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now()
);

-- Create symptom factors table for additional diagnostic criteria
CREATE TABLE IF NOT EXISTS symptom_factors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symptom_id uuid REFERENCES symptoms(id),
  factor_type text NOT NULL,
  factor_value jsonb,
  weight integer CHECK (weight BETWEEN 1 AND 10),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE body_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE condition_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_factors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public can view body regions" ON body_regions;
  DROP POLICY IF EXISTS "Public can view symptoms" ON symptoms;
  DROP POLICY IF EXISTS "Public can view symptom questions" ON symptom_questions;
  DROP POLICY IF EXISTS "Public can view symptom conditions" ON symptom_conditions;
  DROP POLICY IF EXISTS "Public can view condition specialties" ON condition_specialties;
  DROP POLICY IF EXISTS "Public can view symptom factors" ON symptom_factors;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create policies for public read access
CREATE POLICY "Public can view body regions" 
  ON body_regions
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Public can view symptoms"
  ON symptoms
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Public can view symptom questions"
  ON symptom_questions
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Public can view symptom conditions"
  ON symptom_conditions
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Public can view condition specialties"
  ON condition_specialties
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Public can view symptom factors"
  ON symptom_factors
  FOR SELECT TO public
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS symptom_questions_symptom_id_idx ON symptom_questions(symptom_id);
CREATE INDEX IF NOT EXISTS symptom_conditions_symptom_id_idx ON symptom_conditions(symptom_id);
CREATE INDEX IF NOT EXISTS condition_specialties_condition_id_idx ON condition_specialties(condition_id);
CREATE INDEX IF NOT EXISTS symptom_factors_symptom_id_idx ON symptom_factors(symptom_id);