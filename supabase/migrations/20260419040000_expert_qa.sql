-- ================================================
-- EXPERT Q&A SYSTEM - Ask the Expert
-- SEO parity with Doctoralia Mexico
-- ================================================

-- Expert Questions table
CREATE TABLE expert_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES profiles(id),
  specialty_id uuid REFERENCES specialties(id),
  question text NOT NULL,
  email text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'answered', 'closed')),
  is_anonymous boolean NOT NULL DEFAULT true,
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Expert Answers table
CREATE TABLE expert_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES expert_questions(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES profiles(id),
  answer text NOT NULL,
  is_featured boolean NOT NULL DEFAULT false,
  helpful_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_expert_questions_status ON expert_questions(status);
CREATE INDEX idx_expert_questions_specialty ON expert_questions(specialty_id);
CREATE INDEX idx_expert_questions_created ON expert_questions(created_at DESC);
CREATE INDEX idx_expert_questions_email ON expert_questions(email);
CREATE INDEX idx_expert_answers_question ON expert_answers(question_id);
CREATE INDEX idx_expert_answers_doctor ON expert_answers(doctor_id);
CREATE INDEX idx_expert_answers_featured ON expert_answers(is_featured) WHERE is_featured = true;

-- Enable RLS
ALTER TABLE expert_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_answers ENABLE ROW LEVEL SECURITY;

-- Expert Questions RLS
CREATE POLICY "Public can view approved and answered questions"
  ON expert_questions FOR SELECT
  USING (status IN ('approved', 'answered', 'closed'));

CREATE POLICY "Authenticated users can submit questions"
  ON expert_questions FOR INSERT
  WITH CHECK (auth.uid() = patient_id OR patient_id IS NULL);

CREATE POLICY "Users can view their own questions"
  ON expert_questions FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Admins can manage all questions"
  ON expert_questions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Expert Answers RLS
CREATE POLICY "Public can view answers"
  ON expert_answers FOR SELECT
  USING (true);

CREATE POLICY "Doctors can submit answers"
  ON expert_answers FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM doctors WHERE id = auth.uid() AND status = 'approved')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Doctors can update their own answers"
  ON expert_answers FOR UPDATE
  USING (doctor_id = auth.uid());

CREATE POLICY "Admins can manage all answers"
  ON expert_answers FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ================================================
-- SEED DATA - Sample Q&A in Spanish
-- ================================================

-- Helper: get specialty IDs via subqueries
INSERT INTO expert_questions (id, patient_id, specialty_id, question, email, display_name, status, is_anonymous, view_count, created_at) VALUES
  (
    gen_random_uuid(),
    NULL,
    (SELECT id FROM specialties WHERE slug = 'dermatologia' LIMIT 1),
    'Tengo manchas rojas en la piel que pican mucho, especialmente en los brazos y piernas. Llevan unas tres semanas y no mejoran con crema hidratante. Podria ser algo grave? Que tipo de especialista debo consultar?',
    'maria.gonzalez@email.com',
    'Maria G.',
    'answered',
    true,
    342,
    now() - interval '15 days'
  ),
  (
    gen_random_uuid(),
    NULL,
    (SELECT id FROM specialties WHERE slug = 'cardiologia' LIMIT 1),
    'Ultimamente siento un dolor opreso en el pecho cuando hago ejercicio, como una presion. Me dura unos minutos y despues se quita. Tengo 45 anos, fumo y mi padre tuvo un infarto. Deberia preocuparme?',
    'carlos.ruiz@email.com',
    'Carlos R.',
    'answered',
    true,
    528,
    now() - interval '12 days'
  ),
  (
    gen_random_uuid(),
    NULL,
    (SELECT id FROM specialties WHERE slug = 'psiquiatria' LIMIT 1),
    'Desde hace varios meses tengo problemas para dormir, me despierto muy temprano y no puedo volver a dormir. Tambien he perdido el interes en cosas que antes disfrutaba. Mi esposa dice que estoy diferente. Podria ser depresion?',
    'anonymous@email.com',
    'Anonimo',
    'answered',
    true,
    891,
    now() - interval '10 days'
  ),
  (
    gen_random_uuid(),
    NULL,
    (SELECT id FROM specialties WHERE slug = 'nutricion' LIMIT 1),
    'Me diagnosticaron prediabetes y el medico me dijo que cambie mi alimentacion. Soy mexicano y como mucha tortilla, arroz y pan. Que cambios especificos debo hacer en mi dieta para evitar que se convierta en diabetes tipo 2?',
    'roberto.hernandez@email.com',
    'Roberto H.',
    'answered',
    true,
    623,
    now() - interval '8 days'
  ),
  (
    gen_random_uuid(),
    NULL,
    (SELECT id FROM specialties WHERE slug = 'pediatria' LIMIT 1),
    'Mi hija de 3 anos tiene fiebre de 38.5 grados desde hace dos dias, tiene la garganta roja y no quiere comer. Le he dado paracetamol pero la fiebre regresa. Deberia llevarla al pediatrico o esperar unos dias mas?',
    'laura.martinez@email.com',
    'Laura M.',
    'answered',
    true,
    445,
    now() - interval '5 days'
  )
ON CONFLICT DO NOTHING;

-- Insert answers from sample doctors
INSERT INTO expert_answers (question_id, doctor_id, answer, is_featured, helpful_count, created_at)
SELECT
  q.id,
  (SELECT id FROM profiles WHERE role = 'doctor' LIMIT 1),
  CASE
    WHEN q.question LIKE '%manchas rojas%' THEN
      'Gracias por tu pregunta, Maria. Las manchas rojas con picor que describes podrian tener varias causas: dermatitis atopica, urticaria, o incluso una reaccion alergica. El hecho de que no mejoren con crema hidratante sugiere que no es simplesmente piel seca.

Te recomiendo agendar una consulta con un dermatologo para un diagnostico preciso. Mientras tanto, te sugiero: 1) Evita rascarte para prevenir infecciones, 2) Usa ropa de algodon suelto, 3) Evita cambios bruscos de temperatura, y 4) No apliques productos sin receta medica.

Un dermatologo podria realizar pruebas alergicas o una biopsia si es necesario. No suena urgente, pero si notas que las manchas se extienden rapidamente o aparecen en la cara, consulta lo antes posible.'
    WHEN q.question LIKE '%dolor%pecho%' THEN
      'Carlos, gracias por compartir tu situacion. Los sintomas que describes - dolor opresivo en el pecho durante ejercicio - junto con tus factores de riesgo (edad, tabaquismo, antecedente familiar) son motivos de preocupacion y requieren evaluacion cardiologica urgente.

Esto podria ser angina de pecho, que ocurre cuando el corazon no recibe suficiente sangre durante el esfuerzo. Dado tu historial familiar de infarto, NO debes ignorar estos sintomas.

Te recomiendo: 1) Consultar a un cardiologo LO ANTES POSIBLE, 2) Evitar ejercicio intenso hasta ser evaluado, 3) Dejar de fumar - es el cambio mas importante que puedes hacer, y 4) Si el dolor empeora, ocurre en reposo, o se acompana de dificultad para respirar, sudoracion o nausea, acude a urgencias inmediatamente.

Un cardiologo te realizara un electrocardiograma y posiblemente una prueba de esfuerzo para determinar la causa exacta.'
    WHEN q.question LIKE '%dormir%depresion%' THEN
      'Gracias por tu sinceridad, es el primer paso para sentirte mejor. Los sintomas que describes - insomnio (despertarse temprano), perdida de interes en actividades placenteras y cambios notados por tu familia - son senales clasicas de un episodio depresivo.

La depresion es una condicion medica comun y tratable. No es debilidad ni algo que puedas superar "con fuerza de voluntad" sola. Afecta la quimica de tu cerebro y requiere atencion profesional.

Te recomiendo: 1) Consultar con un psiquiatra o psicologo clinico para una evaluacion completa, 2) Hablar abiertamente con tu esposa sobre como te sientes - su apoyo es valioso, 3) Mantener una rutina de sueno regular, 4) Hacer ejercicio ligero como caminar 30 minutos al dia, y 5) No automedicar ni usar alcohol para dormir.

Recuerda: buscar ayuda es un acto de fortaleza, no de debilidad. La mayoria de las personas con depresion mejoran significativamente con el tratamiento adecuado.'
    WHEN q.question LIKE '%prediabetes%' THEN
      'Roberto, excelentemente que estas tomando accion preventiva. La prediabetes es reversible con cambios en el estilo de vida, y la dieta es fundamental.

Los alimentos que mencionas - tortilla, arroz y pan - son ricos en carbohidratos que elevan rapidamente el azucar en sangre. No tienes que eliminarlos completamente, sino ajustar las porciones y elegir mejores opciones:

1) Tortilla: Prefiere de maize nixtamalizado (la tradicional) sobre la de harina. Limita a 2-3 por comida.
2) Arroz: Cambia a arroz integral o quinoa. Reduce la porcion a un cuarto del plato.
3) Pan: Elige pan integral o de grano entero. Evita el pan blanco.
4) Aumenta verduras: Deben cubrir la mitad de tu plato.
5) Agrega proteina magra: pollo, pescado, frijoles, huevos.
6) Evita refrescos y jugos - toma agua.

Te recomiendo consultar con un nutricologo para un plan personalizado. Tambien es importante hacer ejercicio regular - 150 minutos por semana de actividad moderada.'
    WHEN q.question LIKE '%fiebre%hija%' THEN
      'Laura, entiendo tu preocupacion. La fiebre de 38.5C en una nina de 3 anos con dolor de garganta podria ser una infeccion viral comun, pero tambien podria requerir evaluacion medica.

Senales de alarma que requieren atencion inmediata: 1) Fiebre mayor a 39C que no baja con medicamentos, 2) Dificultad para respirar o respiracion rapida, 3) Erupcion cutanea, 4) Letargo extremo o irritabilidad inusual, 5) Senales de deshidratacion (boca seca, sin lagrimas al llorar, panial seco por mas de 4 horas).

Dado que ya han pasado dos dias con fiebre, te recomiendo agendar una consulta pediatrica. El pediatrico podria realizar un examen de garganta para descartar infeccion bacteriana como estreptococo, que requiere antibioticos.

Mientras tanto: 1) Continua el paracetamol en dosis apropiada para su peso (no su edad), 2) Ofrece liquidos frecuentemente en porciones pequenas, 3) Vestila con ropa ligera, y 4) No uses alcohol o banos frios para bajar la fiebre.'
  END,
  true,
  CASE
    WHEN q.question LIKE '%dormir%depresion%' THEN 89
    WHEN q.question LIKE '%dolor%pecho%' THEN 67
    WHEN q.question LIKE '%prediabetes%' THEN 72
    WHEN q.question LIKE '%manchas rojas%' THEN 45
    WHEN q.question LIKE '%fiebre%hija%' THEN 58
    ELSE 30
  END,
  q.created_at + interval '1 day'
FROM expert_questions q
WHERE q.status = 'answered'
ON CONFLICT DO NOTHING;

-- Update question statuses to answered after inserting answers
UPDATE expert_questions SET status = 'answered' WHERE id IN (
  SELECT q.id FROM expert_questions q WHERE status = 'answered'
);
