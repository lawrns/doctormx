/*
  # Add Symptom Checker Tables

  1. New Tables
    - `body_regions` - Stores body regions and their hierarchical relationships
    - `symptoms` - Stores symptoms and their metadata
    - `symptom_questions` - Stores questions for each symptom
    - `symptoms_conditions` - Maps symptoms to possible conditions
    - `symptom_factors` - Stores factors that influence symptom analysis
    - `condition_specialties` - Maps conditions to medical specialties
    - `user_symptom_checks` - Stores user symptom check history

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access and authenticated user access where needed

  3. Changes
    - Add necessary indexes for performance
    - Add foreign key relationships
*/

-- Body regions table
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS body_regions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    parent_id uuid REFERENCES body_regions(id),
    description text,
    coordinates jsonb,
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE body_regions ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN invalid_parameter_value THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can view body regions" ON body_regions;
  CREATE POLICY "Public can view body regions" ON body_regions
    FOR SELECT TO public USING (true);
END $$;

-- Symptoms table
DO $$ BEGIN
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
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN invalid_parameter_value THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can view symptoms" ON symptoms;
  CREATE POLICY "Public can view symptoms" ON symptoms
    FOR SELECT TO public USING (true);
END $$;

-- Symptom questions table
DO $$ BEGIN
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
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE symptom_questions ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN invalid_parameter_value THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can view symptom questions" ON symptom_questions;
  CREATE POLICY "Public can view symptom questions" ON symptom_questions
    FOR SELECT TO public USING (true);
END $$;

-- Symptoms conditions table
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS symptoms_conditions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    symptom_id uuid REFERENCES symptoms(id) ON DELETE CASCADE,
    condition_name text NOT NULL,
    probability integer CHECK (probability >= 0 AND probability <= 100),
    severity_level integer CHECK (severity_level >= 1 AND severity_level <= 5),
    requires_emergency boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE symptoms_conditions ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN invalid_parameter_value THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can view symptoms conditions" ON symptoms_conditions;
  CREATE POLICY "Public can view symptoms conditions" ON symptoms_conditions
    FOR SELECT TO public USING (true);
END $$;

-- Symptom factors table
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS symptom_factors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    symptom_id uuid REFERENCES symptoms(id) ON DELETE CASCADE,
    factor_type text NOT NULL,
    factor_value jsonb,
    weight integer CHECK (weight >= 1 AND weight <= 10),
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE symptom_factors ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN invalid_parameter_value THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can view symptom factors" ON symptom_factors;
  CREATE POLICY "Public can view symptom factors" ON symptom_factors
    FOR SELECT TO public USING (true);
END $$;

-- Condition specialties table
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS condition_specialties (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    condition_id uuid REFERENCES symptoms_conditions(id) ON DELETE CASCADE,
    specialty_name text NOT NULL,
    priority integer CHECK (priority >= 1 AND priority <= 5),
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE condition_specialties ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN invalid_parameter_value THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can view condition specialties" ON condition_specialties;
  CREATE POLICY "Public can view condition specialties" ON condition_specialties
    FOR SELECT TO public USING (true);
END $$;

-- User symptom checks table
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS user_symptom_checks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    symptom_id uuid REFERENCES symptoms(id),
    severity_level integer NOT NULL DEFAULT 1,
    answers jsonb DEFAULT '{}'::jsonb,
    recommendation_id uuid,
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE user_symptom_checks ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN invalid_parameter_value THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can create symptom checks" ON user_symptom_checks;
  CREATE POLICY "Users can create symptom checks" ON user_symptom_checks
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own symptom checks" ON user_symptom_checks;
  CREATE POLICY "Users can view own symptom checks" ON user_symptom_checks
    FOR SELECT TO authenticated USING (auth.uid() = user_id);
END $$;

-- Create indexes for better performance
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS symptoms_body_region_idx ON symptoms(body_region);
  CREATE INDEX IF NOT EXISTS symptom_questions_symptom_id_idx ON symptom_questions(symptom_id);
  CREATE INDEX IF NOT EXISTS symptoms_conditions_symptom_id_idx ON symptoms_conditions(symptom_id);
  CREATE INDEX IF NOT EXISTS symptom_factors_symptom_id_idx ON symptom_factors(symptom_id);
  CREATE INDEX IF NOT EXISTS condition_specialties_condition_id_idx ON condition_specialties(condition_id);
  CREATE INDEX IF NOT EXISTS user_symptom_checks_user_id_idx ON user_symptom_checks(user_id);
END $$;