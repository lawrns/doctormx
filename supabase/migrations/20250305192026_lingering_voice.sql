/*
  # Create symptom checker tables

  1. New Tables
    - `symptoms`
      - Basic symptom information and body regions
    - `symptom_questions` 
      - Follow-up questions for each symptom
    - `recommendations`
      - Recommendations based on severity and conditions
    - `user_symptom_checks`
      - User symptom check history and responses

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create symptoms table
CREATE TABLE IF NOT EXISTS symptoms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  body_region text NOT NULL,
  severity_level int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view symptoms" 
  ON symptoms
  FOR SELECT 
  TO public
  USING (true);

-- Create symptom questions table
CREATE TABLE IF NOT EXISTS symptom_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symptom_id uuid REFERENCES symptoms(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  "order" int NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE symptom_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view symptom questions" 
  ON symptom_questions
  FOR SELECT 
  TO public
  USING (true);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_id uuid,
  severity_level int NOT NULL,
  recommendation_text text NOT NULL,
  telemedicine_option boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view recommendations" 
  ON recommendations
  FOR SELECT 
  TO public
  USING (true);

-- Create user symptom checks table
CREATE TABLE IF NOT EXISTS user_symptom_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom_id uuid REFERENCES symptoms(id),
  severity_level int NOT NULL DEFAULT 1,
  answers jsonb DEFAULT '{}',
  recommendation_id uuid REFERENCES recommendations(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_symptom_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own symptom checks"
  ON user_symptom_checks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptom checks"
  ON user_symptom_checks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert initial data
INSERT INTO symptoms (name, description, body_region, severity_level) VALUES
('Dolor de cabeza', 'Dolor o molestia en cualquier parte de la cabeza', 'head', 2),
('Dolor de garganta', 'Dolor o irritación en la garganta', 'neck', 2),
('Dolor en el pecho', 'Dolor o presión en el pecho', 'torso', 4),
('Dolor abdominal', 'Dolor o malestar en el abdomen', 'torso', 3),
('Dolor en brazo izquierdo', 'Dolor o molestia en el brazo izquierdo', 'left_arm', 3),
('Dolor en brazo derecho', 'Dolor o molestia en el brazo derecho', 'right_arm', 2),
('Dolor en pierna izquierda', 'Dolor o molestia en la pierna izquierda', 'left_leg', 2),
('Dolor en pierna derecha', 'Dolor o molestia en la pierna derecha', 'right_leg', 2);

INSERT INTO symptom_questions (symptom_id, question_text, "order") 
SELECT 
  id,
  '¿Hace cuánto tiempo comenzó el dolor?',
  1
FROM symptoms;

INSERT INTO recommendations (severity_level, recommendation_text, telemedicine_option) VALUES
(1, 'Monitorea tus síntomas. Si persisten, agenda una consulta.', true),
(2, 'Recomendamos consultar con un médico en los próximos días.', true),
(3, 'Deberías consultar con un médico lo antes posible.', true),
(4, 'Busca atención médica inmediata.', false),
(5, 'Llama a emergencias (911) o acude al hospital más cercano.', false);