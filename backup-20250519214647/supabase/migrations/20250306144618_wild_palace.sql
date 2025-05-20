/*
  # Symptom Checker Schema

  1. New Tables
    - Body regions, symptoms, questions, and diagnostic paths
    - Treatment recommendations and specialist referrals
    - User symptom checks and history

  2. Security
    - RLS enabled on all tables
    - Public read access for reference data
    - Authenticated user access for personal data

  3. Changes
    - Added policy existence checks
    - Maintained all table structures and relationships
    - Preserved all indexes and constraints
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop policies for each table if they exist
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view body regions') THEN
    DROP POLICY "Public can view body regions" ON body_regions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view symptoms') THEN
    DROP POLICY "Public can view symptoms" ON symptoms;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view symptom questions') THEN
    DROP POLICY "Public can view symptom questions" ON symptom_questions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view question groups') THEN
    DROP POLICY "Public can view question groups" ON symptom_question_groups;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view symptoms conditions') THEN
    DROP POLICY "Public can view symptoms conditions" ON symptoms_conditions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view treatments') THEN
    DROP POLICY "Public can view treatments" ON symptom_conditions_treatments;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view condition specialties') THEN
    DROP POLICY "Public can view condition specialties" ON condition_specialties;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view symptom factors') THEN
    DROP POLICY "Public can view symptom factors" ON symptom_factors;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view severity rules') THEN
    DROP POLICY "Public can view severity rules" ON symptom_severity_rules;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create symptom checks') THEN
    DROP POLICY "Users can create symptom checks" ON user_symptom_checks;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own symptom checks') THEN
    DROP POLICY "Users can view own symptom checks" ON user_symptom_checks;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view recommendations') THEN
    DROP POLICY "Public can view recommendations" ON recommendations;
  END IF;
END $$;

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
  severity_level integer NOT NULL DEFAULT 1,
  duration_relevance boolean DEFAULT false,
  age_specific boolean DEFAULT false,
  gender_specific boolean DEFAULT false,
  follow_up_questions jsonb DEFAULT '[]',
  typical_duration text,
  common_triggers jsonb DEFAULT '[]',
  warning_signs jsonb DEFAULT '[]',
  prevention_tips jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Create symptom question groups table
CREATE TABLE IF NOT EXISTS symptom_question_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  display_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create symptom questions table
CREATE TABLE IF NOT EXISTS symptom_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symptom_id uuid REFERENCES symptoms(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  display_order integer NOT NULL,
  question_type text NOT NULL CHECK (
    question_type = ANY (ARRAY[
      'boolean',
      'scale',
      'multiple_choice',
      'multi_select',
      'duration',
      'text',
      'textarea',
      'numeric',
      'date',
      'time',
      'range',
      'select',
      'radio',
      'checkbox'
    ])
  ),
  options jsonb,
  conditional_logic jsonb,
  group_id uuid REFERENCES symptom_question_groups(id),
  help_text text,
  validation_rules jsonb,
  skip_logic jsonb,
  required boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create symptoms conditions table
CREATE TABLE IF NOT EXISTS symptoms_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symptom_id uuid REFERENCES symptoms(id),
  condition_name text NOT NULL,
  probability integer CHECK (probability >= 0 AND probability <= 100),
  severity_level integer CHECK (severity_level >= 1 AND severity_level <= 5),
  requires_emergency boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create symptom conditions treatments table
CREATE TABLE IF NOT EXISTS symptom_conditions_treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_id uuid REFERENCES symptoms_conditions(id) ON DELETE CASCADE,
  treatment_name text NOT NULL,
  treatment_description text,
  treatment_type text CHECK (
    treatment_type = ANY (ARRAY[
      'medication',
      'therapy',
      'lifestyle',
      'surgery',
      'emergency'
    ])
  ),
  priority integer CHECK (priority >= 1 AND priority <= 5),
  requires_prescription boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create condition specialties table
CREATE TABLE IF NOT EXISTS condition_specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_id uuid REFERENCES symptoms_conditions(id),
  specialty_name text NOT NULL,
  priority integer CHECK (priority >= 1 AND priority <= 5),
  created_at timestamptz DEFAULT now()
);

-- Create symptom factors table
CREATE TABLE IF NOT EXISTS symptom_factors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symptom_id uuid REFERENCES symptoms(id),
  factor_type text NOT NULL,
  factor_value jsonb,
  weight integer CHECK (weight >= 1 AND weight <= 10),
  created_at timestamptz DEFAULT now()
);

-- Create symptom severity rules table
CREATE TABLE IF NOT EXISTS symptom_severity_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_id uuid REFERENCES symptoms_conditions(id) ON DELETE CASCADE,
  rule_type text CHECK (
    rule_type = ANY (ARRAY[
      'age',
      'duration',
      'comorbidity',
      'symptoms',
      'vitals'
    ])
  ),
  rule_criteria jsonb NOT NULL,
  severity_modifier integer CHECK (severity_modifier >= -2 AND severity_modifier <= 2),
  created_at timestamptz DEFAULT now()
);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_id uuid REFERENCES symptoms_conditions(id),
  severity_level integer NOT NULL,
  recommendation_text text NOT NULL,
  telemedicine_option boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create user symptom checks table
CREATE TABLE IF NOT EXISTS user_symptom_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom_id uuid REFERENCES symptoms(id),
  severity_level integer NOT NULL DEFAULT 1,
  answers jsonb DEFAULT '{}',
  recommendation_id uuid REFERENCES recommendations(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE body_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_question_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_conditions_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE condition_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_severity_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_symptom_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS symptoms_body_region_idx ON symptoms(body_region);
CREATE INDEX IF NOT EXISTS symptom_questions_symptom_id_idx ON symptom_questions(symptom_id);
CREATE INDEX IF NOT EXISTS symptom_questions_group_id_idx ON symptom_questions(group_id);
CREATE INDEX IF NOT EXISTS symptoms_conditions_symptom_id_idx ON symptoms_conditions(symptom_id);
CREATE INDEX IF NOT EXISTS condition_specialties_condition_id_idx ON condition_specialties(condition_id);
CREATE INDEX IF NOT EXISTS symptom_factors_symptom_id_idx ON symptom_factors(symptom_id);
CREATE INDEX IF NOT EXISTS symptom_severity_rules_condition_id_idx ON symptom_severity_rules(condition_id);
CREATE INDEX IF NOT EXISTS user_symptom_checks_user_id_idx ON user_symptom_checks(user_id);

-- Create RLS policies
CREATE POLICY "Public can view body regions"
  ON body_regions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view symptoms"
  ON symptoms
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view symptom questions"
  ON symptom_questions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view question groups"
  ON symptom_question_groups
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view symptoms conditions"
  ON symptoms_conditions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view treatments"
  ON symptom_conditions_treatments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view condition specialties"
  ON condition_specialties
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view symptom factors"
  ON symptom_factors
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view severity rules"
  ON symptom_severity_rules
  FOR SELECT
  TO public
  USING (true);

-- User symptom checks policies
CREATE POLICY "Users can create symptom checks"
  ON user_symptom_checks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own symptom checks"
  ON user_symptom_checks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view recommendations"
  ON recommendations
  FOR SELECT
  TO public
  USING (true);