/*
  # Symptom Checker Schema

  1. New Tables
    - symptoms: Stores symptom definitions and metadata
    - symptom_questions: Questions for each symptom
    - body_regions: Hierarchical body regions
    - symptoms_conditions: Links symptoms to possible conditions
    - symptom_factors: Additional factors affecting symptom analysis
    - condition_specialties: Links conditions to medical specialties
    - user_symptom_checks: Records user symptom evaluations

  2. Security
    - Enable RLS on all tables
    - Public read access for reference data
    - Authenticated user access for personal symptom checks

  3. Changes
    - Create all necessary tables with proper relationships
    - Add indexes for performance
    - Set up RLS policies with existence checks
*/

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

-- Create body regions table with hierarchy support
CREATE TABLE IF NOT EXISTS body_regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid REFERENCES body_regions(id),
  description text,
  coordinates jsonb,
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

-- Create symptom factors table
CREATE TABLE IF NOT EXISTS symptom_factors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symptom_id uuid REFERENCES symptoms(id),
  factor_type text NOT NULL,
  factor_value jsonb,
  weight integer CHECK (weight >= 1 AND weight <= 10),
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

-- Create user symptom checks table
CREATE TABLE IF NOT EXISTS user_symptom_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom_id uuid REFERENCES symptoms(id),
  severity_level integer NOT NULL DEFAULT 1,
  answers jsonb DEFAULT '{}'::jsonb,
  recommendation_id uuid REFERENCES recommendations(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE condition_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_symptom_checks ENABLE ROW LEVEL SECURITY;

-- Add RLS policies with existence checks
DO $$ 
BEGIN
  -- Symptoms policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'symptoms' AND policyname = 'Public can view symptoms'
  ) THEN
    CREATE POLICY "Public can view symptoms" ON symptoms FOR SELECT TO public USING (true);
  END IF;

  -- Symptom questions policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'symptom_questions' AND policyname = 'Public can view symptom questions'
  ) THEN
    CREATE POLICY "Public can view symptom questions" ON symptom_questions FOR SELECT TO public USING (true);
  END IF;

  -- Body regions policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'body_regions' AND policyname = 'Public can view body regions'
  ) THEN
    CREATE POLICY "Public can view body regions" ON body_regions FOR SELECT TO public USING (true);
  END IF;

  -- Symptoms conditions policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'symptoms_conditions' AND policyname = 'Public can view symptoms conditions'
  ) THEN
    CREATE POLICY "Public can view symptoms conditions" ON symptoms_conditions FOR SELECT TO public USING (true);
  END IF;

  -- Symptom factors policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'symptom_factors' AND policyname = 'Public can view symptom factors'
  ) THEN
    CREATE POLICY "Public can view symptom factors" ON symptom_factors FOR SELECT TO public USING (true);
  END IF;

  -- Condition specialties policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'condition_specialties' AND policyname = 'Public can view condition specialties'
  ) THEN
    CREATE POLICY "Public can view condition specialties" ON condition_specialties FOR SELECT TO public USING (true);
  END IF;

  -- User symptom checks policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_symptom_checks' AND policyname = 'Users can insert own symptom checks'
  ) THEN
    CREATE POLICY "Users can insert own symptom checks" ON user_symptom_checks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_symptom_checks' AND policyname = 'Users can view own symptom checks'
  ) THEN
    CREATE POLICY "Users can view own symptom checks" ON user_symptom_checks FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS symptoms_body_region_idx ON symptoms(body_region);
CREATE INDEX IF NOT EXISTS symptom_questions_symptom_id_idx ON symptom_questions(symptom_id);
CREATE INDEX IF NOT EXISTS symptoms_conditions_symptom_id_idx ON symptoms_conditions(symptom_id);
CREATE INDEX IF NOT EXISTS symptom_factors_symptom_id_idx ON symptom_factors(symptom_id);
CREATE INDEX IF NOT EXISTS condition_specialties_condition_id_idx ON condition_specialties(condition_id);
CREATE INDEX IF NOT EXISTS user_symptom_checks_user_id_idx ON user_symptom_checks(user_id);