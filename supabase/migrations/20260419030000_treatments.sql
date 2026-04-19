-- ================================================
-- TREATMENTS TABLE + SEED 30+ COMMON TREATMENTS
-- Public-facing content system for SEO parity with Doctoralia
-- ================================================

-- Create treatments table
CREATE TABLE IF NOT EXISTS treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  popular BOOLEAN DEFAULT false,
  search_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create treatment-specialties junction table
CREATE TABLE IF NOT EXISTS treatment_specialties (
  treatment_id UUID NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
  specialty_id UUID NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
  PRIMARY KEY (treatment_id, specialty_id)
);

-- Enable RLS
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_specialties ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Anyone can view treatments"
  ON treatments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view treatment specialties"
  ON treatment_specialties FOR SELECT
  USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_treatments_slug ON treatments(slug);
CREATE INDEX IF NOT EXISTS idx_treatments_name_trgm ON treatments USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_treatments_popular ON treatments(popular) WHERE popular = true;
CREATE INDEX IF NOT EXISTS idx_treatments_category ON treatments(category);
CREATE INDEX IF NOT EXISTS idx_treatment_specialties_treatment ON treatment_specialties(treatment_id);
CREATE INDEX IF NOT EXISTS idx_treatment_specialties_specialty ON treatment_specialties(specialty_id);

-- ================================================
-- SEED DATA: 30+ common treatments in Mexico
-- ================================================

INSERT INTO treatments (name, slug, description, category, popular, search_count) VALUES
('Consulta general', 'consulta-general',
 'Consulta médica de evaluación general donde el médico revisa el estado de salud del paciente, escucha sus síntomas y determina el diagnóstico o los estudios necesarios.',
 'Consulta', true, 20000),

('Electrocardiograma', 'electrocardiograma',
 'Estudio que registra la actividad eléctrica del corazón para detectar arritmias, infartos previos y otras alteraciones cardiacas. Es rápido, indoloro y no invasivo.',
 'Diagnóstico', true, 8000),

('Análisis de sangre', 'analisis-de-sangre',
 'Estudio de laboratorio que evalúa diferentes parámetros de la sangre como glucosa, colesterol, triglicéridos, hemoglobina y función hepática y renal.',
 'Laboratorio', true, 15000),

('Radiografía', 'radiografia',
 'Estudio de imagen que utiliza rayos X para visualizar estructuras óseas y algunos tejidos blandos. Es fundamental para diagnosticar fracturas, infecciones y otras condiciones.',
 'Diagnóstico', true, 9000),

('Ultrasonido', 'ultrasonido',
 'Estudio de imagen que utiliza ondas sonoras de alta frecuencia para visualizar órganos internos, evaluar el embarazo y detectar anomalías en tejidos blandos.',
 'Diagnóstico', true, 8500),

('Resonancia magnética', 'resonancia-magnetica',
 'Estudio de imagen avanzado que utiliza campos magnéticos y ondas de radio para crear imágenes detalladas de órganos y tejidos. Ideal para evaluar cerebro, columna y articulaciones.',
 'Diagnóstico', true, 7000),

('Tomografía', 'tomografia',
 'Estudio de imagen que combina rayos X con tecnología computacional para obtener cortes transversales del cuerpo. Permite detectar tumores, hemorragias y lesiones internas.',
 'Diagnóstico', false, 5000),

('Endoscopia', 'endoscopia',
 'Procedimiento que utiliza un tubo flexible con cámara para visualizar el interior del tracto digestivo superior. Permite diagnosticar úlceras, inflamación y tumores.',
 'Procedimiento', false, 4500),

('Colonoscopia', 'colonoscopia',
 'Procedimiento que permite visualizar el interior del colon y recto para detectar pólipos, cáncer colorrectal y enfermedades inflamatorias intestinales.',
 'Procedimiento', false, 4000),

('Biopsia', 'biopsia',
 'Procedimiento en el que se extrae una pequeña muestra de tejido para analizarla en el laboratorio. Es fundamental para el diagnóstico de cáncer y otras enfermedades.',
 'Procedimiento', false, 3500),

('Cirugía laparoscópica', 'cirugia-laparoscopica',
 'Técnica quirúrgica mínimamente invasiva que utiliza pequeñas incisiones y una cámara para realizar procedimientos abdominales con menor recuperación y dolor postoperatorio.',
 'Cirugía', false, 4500),

('Fisioterapia', 'fisioterapia',
 'Tratamiento que utiliza ejercicios terapéuticos, masajes, electroestimulación y otras técnicas para rehabilitar lesiones musculoesqueléticas y mejorar la movilidad.',
 'Rehabilitación', true, 7000),

('Terapia cognitivo-conductual', 'terapia-cognitivo-conductual',
 'Forma de psicoterapia que ayuda a identificar y cambiar patrones de pensamiento negativos. Es muy efectiva para tratar depresión, ansiedad y otros trastornos mentales.',
 'Psicología', true, 5500),

('Consulta oftalmológica', 'consulta-oftalmologica',
 'Evaluación completa de la salud visual que incluye revisión de agudeza visual, presión intraocular, fondo de ojo y detección de enfermedades oculares.',
 'Consulta', false, 5000),

('Limpieza dental', 'limpieza-dental',
 'Procedimiento de higiene bucal profesional que elimina el sarro y la placa bacteriana acumulada. Recomendada cada 6 meses para mantener una buena salud dental.',
 'Odontología', true, 8000),

('Extracción dental', 'extraccion-dental',
 'Procedimiento quirúrgico para remover una pieza dental que está dañada, infectada o causa problemas de espacio. Se realiza con anestesia local.',
 'Odontología', false, 4500),

('Ortodoncia', 'ortodoncia',
 'Tratamiento para corregir la alineación de los dientes y la mandíbula utilizando brackets, alineadores u otros dispositivos. Mejora tanto la función como la estética dental.',
 'Odontología', true, 6000),

('Dermatología cosmética', 'dermatologia-cosmetica',
 'Tratamientos para mejorar la apariencia de la piel incluyendo peelings, láser, rellenos dérmicos y tratamiento de cicatrices, manchas y envejecimiento cutáneo.',
 'Estética', false, 4500),

('Cirugía láser ocular', 'cirugia-laser-ocular',
 'Procedimiento quirúrgico que utiliza láser para corregir problemas de visión como miopía, hipermetropía y astigmatismo, reduciendo o eliminando la necesidad de lentes.',
 'Cirugía', false, 3500),

('Implante dental', 'implante-dental',
 'Procedimiento que reemplaza dientes perdidos con una raíz de titanio y una corona artificial. Ofrece una solución permanente y de apariencia natural.',
 'Odontología', false, 3000),

('Audiometría', 'audiometria',
 'Estudio que evalúa la capacidad auditiva determinando el umbral mínimo de audición para diferentes frecuencias. Detecta pérdida auditiva y tipo de sordera.',
 'Diagnóstico', false, 2000),

('Espirometría', 'espirometria',
 'Prueba de función pulmonar que mide el volumen y flujo de aire al respirar. Es esencial para diagnosticar asma, EPOC y otras enfermedades respiratorias.',
 'Diagnóstico', false, 2500),

('Mamografía', 'mamografia',
 'Estudio radiológico especializado de las mamas para detectar cáncer de mama en etapas tempranas. Recomendada anualmente para mujeres mayores de 40 años.',
 'Diagnóstico', true, 5500),

('Papanicolaou', 'papanicolaou',
 'Estudio de detección temprana del cáncer cervical que consiste en la toma de una muestra de células del cuello uterino para analizarlas en el laboratorio.',
 'Diagnóstico', true, 6000),

('Examen de próstata', 'examen-de-prostata',
 'Evaluación que incluye tacto rectal y prueba de antígeno prostático específico (PSA) para detectar anomalías en la próstata, incluyendo cáncer.',
 'Diagnóstico', true, 4500),

('Densitometría ósea', 'densitometria-osea',
 'Estudio que mide la densidad mineral de los huesos para diagnosticar osteoporosis y evaluar el riesgo de fracturas. Recomendado para mujeres posmenopausicas.',
 'Diagnóstico', false, 2500),

('Vacunación', 'vacunacion',
 'Administración de vacunas para prevenir enfermedades infecciosas. Incluye vacunas del esquema nacional, influenza, COVID-19, HPV y otras según el perfil del paciente.',
 'Prevención', true, 7500),

('Pruebas de alergia', 'pruebas-de-alergia',
 'Estudios que identifican los alergenos específicos que causan reacciones alérgicas en el paciente. Incluyen pruebas cutáneas y análisis de sangre específicos.',
 'Diagnóstico', false, 3500),

('Estudio del sueño', 'estudio-del-sueno',
 'Estudio especializado que monitorea la actividad cerebral, respiración, ritmo cardíaco y otros parámetros durante el sueño para diagnosticar apnea del sueño y otros trastornos.',
 'Diagnóstico', false, 2500),

('Terapia de rehabilitación', 'terapia-de-rehabilitacion',
 'Programa integral de recuperación que combina fisioterapia, terapia ocupacional y ejercicios para recuperar funcionalidad después de lesiones, cirugías o enfermedades.',
 'Rehabilitación', false, 4000),

('Chequeo preventivo', 'chequeo-preventivo',
 'Evaluación médica completa que incluye historia clínica, exploración física y estudios de laboratorio para detectar enfermedades en etapas tempranas.',
 'Prevención', true, 9000),

('Terapia nutricional', 'terapia-nutricional',
 'Consulta especializada para diseñar un plan de alimentación personalizado según las necesidades del paciente, ya sea para controlar peso, diabetes u otras condiciones.',
 'Nutrición', false, 4000),

('Ozonoterapia', 'ozonoterapia',
 'Terapia complementaria que utiliza ozono medicinal para tratar diversas condiciones como dolor crónico, inflamación y problemas circulatorios.',
 'Alternativa', false, 2000),

('Acupuntura', 'acupuntura',
 'Terapia de la medicina tradicional china que consiste en la inserción de agujas finas en puntos específicos del cuerpo para aliviar dolor y tratar diversas condiciones.',
 'Alternativa', false, 2500)

ON CONFLICT (slug) DO NOTHING;

-- ================================================
-- LINK TREATMENTS TO SPECIALTIES
-- ================================================

INSERT INTO treatment_specialties (treatment_id, specialty_id)
SELECT t.id, s.id FROM treatments t
CROSS JOIN specialties s
WHERE
  (s.slug = 'medicina-general' AND t.slug IN ('consulta-general', 'analisis-de-sangre', 'radiografia', 'chequeo-preventivo', 'vacunacion'))
  OR (s.slug = 'cardiologia' AND t.slug IN ('electrocardiograma', 'analisis-de-sangre'))
  OR (s.slug = 'dermatologia' AND t.slug IN ('dermatologia-cosmetica', 'biopsia'))
  OR (s.slug = 'pediatria' AND t.slug IN ('consulta-general', 'vacunacion', 'pruebas-de-alergia'))
  OR (s.slug = 'ginecologia' AND t.slug IN ('papanicolaou', 'ultrasonido', 'mamografia'))
  OR (s.slug = 'psiquiatria' AND t.slug IN ('terapia-cognitivo-conductual'))
  OR (s.slug = 'traumatologia' AND t.slug IN ('fisioterapia', 'radiografia', 'resonancia-magnetica', 'terapia-de-rehabilitacion'))
  OR (s.slug = 'oftalmologia' AND t.slug IN ('consulta-oftalmologica', 'cirugia-laser-ocular', 'audiometria'))
  OR (s.slug = 'nutricion' AND t.slug IN ('terapia-nutricional', 'analisis-de-sangre', 'chequeo-preventivo'))
  OR (s.slug = 'neurologia' AND t.slug IN ('resonancia-magnetica', 'electrocardiograma', 'estudio-del-sueno'))
  OR (s.slug = 'gastroenterologo' AND t.slug IN ('endoscopia', 'colonoscopia', 'biopsia', 'ultrasonido'))
ON CONFLICT (treatment_id, specialty_id) DO NOTHING;
