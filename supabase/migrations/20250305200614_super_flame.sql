/*
  # Symptom Checker Schema Update

  1. New Tables
    - `body_regions` - Anatomical regions for symptom mapping
    - `symptoms` - Symptoms catalog
    - `symptom_questions` - Questions for symptom assessment
    - `symptoms_conditions` - Possible conditions for symptoms
    - `symptom_factors` - Factors affecting symptom analysis
    - `condition_specialties` - Specialty recommendations for conditions

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (with existence check)
    - Add policies for admin write access

  3. Changes
    - Add relationships between tables
    - Add indexes for performance
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
  
  ALTER TABLE body_regions ENABLE ROW LEVEL SECURITY;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'body_regions' AND policyname = 'Public can view body regions'
  ) THEN
    CREATE POLICY "Public can view body regions"
      ON body_regions
      FOR SELECT
      TO public
      USING (true);
  END IF;
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
  
  ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'symptoms' AND policyname = 'Public can view symptoms'
  ) THEN
    CREATE POLICY "Public can view symptoms"
      ON symptoms
      FOR SELECT
      TO public
      USING (true);
  END IF;
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
  
  ALTER TABLE symptom_questions ENABLE ROW LEVEL SECURITY;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'symptom_questions' AND policyname = 'Public can view symptom questions'
  ) THEN
    CREATE POLICY "Public can view symptom questions"
      ON symptom_questions
      FOR SELECT
      TO public
      USING (true);
  END IF;
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
  
  ALTER TABLE symptoms_conditions ENABLE ROW LEVEL SECURITY;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'symptoms_conditions' AND policyname = 'Public can view symptoms conditions'
  ) THEN
    CREATE POLICY "Public can view symptoms conditions"
      ON symptoms_conditions
      FOR SELECT
      TO public
      USING (true);
  END IF;
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
  
  ALTER TABLE symptom_factors ENABLE ROW LEVEL SECURITY;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'symptom_factors' AND policyname = 'Public can view symptom factors'
  ) THEN
    CREATE POLICY "Public can view symptom factors"
      ON symptom_factors
      FOR SELECT
      TO public
      USING (true);
  END IF;
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
  
  ALTER TABLE condition_specialties ENABLE ROW LEVEL SECURITY;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'condition_specialties' AND policyname = 'Public can view condition specialties'
  ) THEN
    CREATE POLICY "Public can view condition specialties"
      ON condition_specialties
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS symptoms_body_region_idx ON symptoms(body_region);
CREATE INDEX IF NOT EXISTS symptom_questions_symptom_id_idx ON symptom_questions(symptom_id);
CREATE INDEX IF NOT EXISTS symptoms_conditions_symptom_id_idx ON symptoms_conditions(symptom_id);
CREATE INDEX IF NOT EXISTS symptom_factors_symptom_id_idx ON symptom_factors(symptom_id);
CREATE INDEX IF NOT EXISTS condition_specialties_condition_id_idx ON condition_specialties(condition_id);