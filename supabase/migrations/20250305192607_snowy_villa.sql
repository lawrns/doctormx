/*
  # Symptoms System Schema

  1. New Tables
    - `symptoms`: Stores symptom definitions and metadata
    - `symptom_questions`: Questions for each symptom
    - `recommendations`: Treatment recommendations based on symptoms
    - `user_symptom_checks`: User symptom check history

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for public read access where appropriate

  3. Changes
    - Initial schema creation
    - Basic data seeding for common symptoms
*/

-- Create symptoms table
CREATE TABLE IF NOT EXISTS symptoms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  body_region text NOT NULL,
  severity_level integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create symptom questions table
CREATE TABLE IF NOT EXISTS symptom_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symptom_id uuid REFERENCES symptoms(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_id uuid,
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
  answers jsonb DEFAULT '{}'::jsonb,
  recommendation_id uuid REFERENCES recommendations(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_symptom_checks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public can view symptoms" ON symptoms;
  DROP POLICY IF EXISTS "Public can view symptom questions" ON symptom_questions;
  DROP POLICY IF EXISTS "Public can view recommendations" ON recommendations;
  DROP POLICY IF EXISTS "Users can view own symptom checks" ON user_symptom_checks;
  DROP POLICY IF EXISTS "Users can create symptom checks" ON user_symptom_checks;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create policies
CREATE POLICY "Public can view symptoms" 
  ON symptoms FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Public can view symptom questions" 
  ON symptom_questions FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Public can view recommendations" 
  ON recommendations FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Users can view own symptom checks" 
  ON user_symptom_checks FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create symptom checks" 
  ON user_symptom_checks FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Seed some initial data
INSERT INTO symptoms (name, description, body_region, severity_level) VALUES
('Dolor de cabeza', 'Dolor o molestia en cualquier parte de la cabeza', 'head', 2),
('Dolor de garganta', 'Dolor o irritación en la garganta', 'neck', 2),
('Dolor en el pecho', 'Dolor o presión en el pecho', 'torso', 4),
('Dolor abdominal', 'Dolor o malestar en el abdomen', 'torso', 3),
('Dolor en brazo izquierdo', 'Dolor o molestia en el brazo izquierdo', 'left_arm', 3),
('Dolor en pierna derecha', 'Dolor o molestia en la pierna derecha', 'right_leg', 2)
ON CONFLICT DO NOTHING;

INSERT INTO symptom_questions (symptom_id, question_text, "order") 
SELECT 
  id,
  'El dolor es intenso o severo?',
  1
FROM symptoms
ON CONFLICT DO NOTHING;

INSERT INTO recommendations (severity_level, recommendation_text, telemedicine_option) VALUES
(1, 'Monitorea tus síntomas. Si empeoran, consulta a un médico.', true),
(2, 'Se recomienda consultar con un médico en los próximos días.', true),
(3, 'Busca atención médica pronto. Considera una consulta por telemedicina.', true),
(4, 'Busca atención médica inmediata. Tus síntomas requieren evaluación urgente.', false),
(5, 'Dirígete a emergencias o llama a una ambulancia inmediatamente.', false)
ON CONFLICT DO NOTHING;