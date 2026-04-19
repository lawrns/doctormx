-- Clinics / Facilities system
-- Mirrors Doctoralia's clinic listing, specialty+city, and profile pages

CREATE TABLE clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  address text,
  city_id uuid REFERENCES cities(id),
  district_id uuid REFERENCES districts(id),
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  phone text,
  website text,
  logo_url text,
  rating_avg numeric(3,2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  verified boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE clinic_specialties (
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  specialty_id uuid NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
  PRIMARY KEY (clinic_id, specialty_id)
);

CREATE TABLE doctor_clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  room_number text,
  schedule text,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (doctor_id, clinic_id)
);

-- Indexes for clinic lookups
CREATE INDEX idx_clinics_slug ON clinics(slug);
CREATE INDEX idx_clinics_city_id ON clinics(city_id);
CREATE INDEX idx_clinics_district_id ON clinics(district_id);
CREATE INDEX idx_clinics_active ON clinics(is_active) WHERE is_active = true;
CREATE INDEX idx_clinics_verified ON clinics(verified) WHERE verified = true;
CREATE INDEX idx_clinic_specialties_clinic ON clinic_specialties(clinic_id);
CREATE INDEX idx_clinic_specialties_specialty ON clinic_specialties(specialty_id);
CREATE INDEX idx_doctor_clinics_doctor ON doctor_clinics(doctor_id);
CREATE INDEX idx_doctor_clinics_clinic ON doctor_clinics(clinic_id);

-- Row Level Security
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_clinics ENABLE ROW LEVEL SECURITY;

-- Public read for all
CREATE POLICY "Clinics are publicly readable" ON clinics FOR SELECT USING (true);
CREATE POLICY "Clinic specialties are publicly readable" ON clinic_specialties FOR SELECT USING (true);
CREATE POLICY "Doctor clinics are publicly readable" ON doctor_clinics FOR SELECT USING (true);

-- Doctors can manage their clinic associations
CREATE POLICY "Doctors can insert their clinic associations" ON doctor_clinics
  FOR INSERT WITH CHECK (
    doctor_id IN (SELECT id FROM doctors WHERE id = auth.uid())
  );
CREATE POLICY "Doctors can update their clinic associations" ON doctor_clinics
  FOR UPDATE USING (
    doctor_id IN (SELECT id FROM doctors WHERE id = auth.uid())
  );
CREATE POLICY "Doctors can delete their clinic associations" ON doctor_clinics
  FOR DELETE USING (
    doctor_id IN (SELECT id FROM doctors WHERE id = auth.uid())
  );

-- Admins can manage all clinics
CREATE POLICY "Admins can manage clinics" ON clinics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can manage clinic specialties" ON clinic_specialties
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can manage doctor clinics" ON doctor_clinics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Seed: Missing specialties needed for clinic associations
INSERT INTO specialties (name, slug, description) VALUES
  ('Oncologia', 'oncologia', 'Diagnostico y tratamiento del cancer'),
  ('Cirugia General', 'cirugia-general', 'Procedimientos quirurgicos generales')
ON CONFLICT (slug) DO NOTHING;

-- Seed: 10 sample Mexican clinics/hospitals
INSERT INTO clinics (name, slug, description, address, city_id, district_id, latitude, longitude, phone, website, logo_url, rating_avg, rating_count, verified) VALUES
  (
    'Hospital Angeles - Ciudad de Mexico',
    'hospital-angeles-cdmx',
    'Hospital de alta especialidad con mas de 50 especialidades medicas. Parte del grupo Angeles, uno de los mas grandes de Latinoamerica.',
    'Av. Universidad 2016, Col. Copilco Universidad, Coyoacan, 04360 CDMX',
    (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'),
    (SELECT id FROM districts WHERE slug = 'coyoacan' AND city_id = (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico')),
    19.3475000, -99.1768000,
    '55 5449 2800',
    'https://www.hospitalangeles.com',
    '/logos/hospital-angeles.png',
    4.50, 320, true
  ),
  (
    'Star Medica Queretaro',
    'star-medica-queretaro',
    'Hospital privado de alta especialidad en Queretaro. Centro medico con tecnologia de vanguardia y mas de 40 especialidades.',
    'Av. de la Luz 22, Centro Sur, 76090 Queretaro, Qro.',
    (SELECT id FROM cities WHERE slug = 'queretaro'),
    NULL,
    20.5738000, -100.3913000,
    '442 290 0900',
    'https://www.starmedica.com',
    '/logos/star-medica.png',
    4.30, 185, true
  ),
  (
    'Christus Muguerza Monterrey',
    'christus-muguerza-monterrey',
    'Red hospitalaria de alta especialidad con presencia en Nuevo Leon. Mas de 70 anos de experiencia en atencion medica de calidad.',
    'Av. Hidalgo 2525 Poniente, Col. Obispado, 64060 Monterrey, N.L.',
    (SELECT id FROM cities WHERE slug = 'monterrey'),
    NULL,
    25.6747000, -100.3553000,
    '81 8339 1000',
    'https://www.christusmuguerza.com',
    '/logos/christus-muguerza.png',
    4.40, 240, true
  ),
  (
    'Hospital Espanol - Ciudad de Mexico',
    'hospital-espanol-cdmx',
    'Institucion medica con mas de 80 anos de tradicion. Hospital privado de alta especialidad en el corazon de la Ciudad de Mexico.',
    'Av. Ejercito Nacional 613, Col. Granada, Alcaldia Miguel Hidalgo, 11520 CDMX',
    (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'),
    (SELECT id FROM districts WHERE slug = 'miguel-hidalgo' AND city_id = (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico')),
    19.4379000, -99.1872000,
    '55 5272 3900',
    'https://www.hospitalespanol.com.mx',
    '/logos/hospital-espanol.png',
    4.60, 410, true
  ),
  (
    'Medica Sur',
    'medica-sur-cdmx',
    'Hospital privado de alta especialidad reconocido por su excelencia medica. Ubicado en Tlalpan, al sur de la Ciudad de Mexico.',
    'Puente de Piedra 150, Col. Toriello Guerra, Tlalpan, 14050 CDMX',
    (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'),
    (SELECT id FROM districts WHERE slug = 'tlalpan' AND city_id = (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico')),
    19.2928000, -99.1469000,
    '55 5424 7200',
    'https://www.medicasur.com.mx',
    '/logos/medica-sur.png',
    4.70, 520, true
  ),
  (
    'San Angel Inn Universidad',
    'san-angel-inn-universidad',
    'Hospital privado ubicado en la zona sur de la CDMX. Especialidades en cirugia, traumatologia, ginecologia y mas.',
    'Av. Universidad 2039, Col. Copilco Universidad, Coyoacan, 04360 CDMX',
    (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'),
    (SELECT id FROM districts WHERE slug = 'coyoacan' AND city_id = (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico')),
    19.3480000, -99.1760000,
    '55 5449 2200',
    'https://www.sanangelinuniversidad.com',
    '/logos/san-angel-inn.png',
    4.20, 150, true
  ),
  (
    'Hospital Zambrano Hellion - Monterrey',
    'hospital-zambrano-hellion-monterrey',
    'Hospital Tec de Monterrey, institucion de alta especialidad con tecnologia de punta y programas academicos de vanguardia.',
    'Av. Batallon de San Patricio 112, Real San Agustin, 66278 San Pedro Garza Garcia, N.L.',
    (SELECT id FROM cities WHERE slug = 'monterrey'),
    NULL,
    25.6602000, -100.4038000,
    '81 8888 0600',
    'https://hospitalzambrano.tec.mx',
    '/logos/zambrano-hellion.png',
    4.80, 380, true
  ),
  (
    'Hospital Civil de Guadalajara',
    'hospital-civil-guadalajara',
    'Hospital publico de alta especialidad, el mas antiguo de Jalisco. Atencion medica de calidad con compromiso social.',
    'Av. Hospital 328, El Retiro, 44280 Guadalajara, Jal.',
    (SELECT id FROM cities WHERE slug = 'guadalajara'),
    NULL,
    20.6807000, -103.3420000,
    '33 3942 4200',
    'https://www.hcvg.mx',
    '/logos/hospital-civil.png',
    4.10, 290, true
  ),
  (
    'Clinica ISSSTE - Ciudad de Mexico',
    'clinica-issste-cdmx',
    'Clinica del Instituto de Seguridad y Servicios Sociales de los Trabajadores del Estado. Atencion medica integral para derechohabientes.',
    'Av. Insurgentes Sur 288, Col. Roma Norte, 06600 CDMX',
    (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'),
    (SELECT id FROM districts WHERE slug = 'roma' AND city_id = (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico')),
    19.4208000, -99.1615000,
    '55 5062 0000',
    'https://www.gob.mx/issste',
    '/logos/issste.png',
    3.80, 180, true
  ),
  (
    'Clinica IMSS - Ciudad de Mexico',
    'clinica-imss-cdmx',
    'Clinica del Instituto Mexicano del Seguro Social. Atencion medica de primer nivel para asegurados y derechohabientes.',
    'Av. Cuauhtemoc 330, Doctores, 06720 CDMX',
    (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'),
    NULL,
    19.4144000, -99.1443000,
    '55 5761 0900',
    'https://www.imss.gob.mx',
    '/logos/imss.png',
    3.70, 210, true
  );

-- Seed: clinic_specialties associations
INSERT INTO clinic_specialties (clinic_id, specialty_id) VALUES
  -- Hospital Angeles: Cardiologia, Neurologia, Traumatologia, Oncologia
  ((SELECT id FROM clinics WHERE slug = 'hospital-angeles-cdmx'), (SELECT id FROM specialties WHERE slug = 'cardiologia')),
  ((SELECT id FROM clinics WHERE slug = 'hospital-angeles-cdmx'), (SELECT id FROM specialties WHERE slug = 'neurologia')),
  ((SELECT id FROM clinics WHERE slug = 'hospital-angeles-cdmx'), (SELECT id FROM specialties WHERE slug = 'traumatologia')),
  ((SELECT id FROM clinics WHERE slug = 'hospital-angeles-cdmx'), (SELECT id FROM specialties WHERE slug = 'oncologia')),
  -- Star Medica: Pediatria, Ginecologia, Cardiologia
  ((SELECT id FROM clinics WHERE slug = 'star-medica-queretaro'), (SELECT id FROM specialties WHERE slug = 'pediatria')),
  ((SELECT id FROM clinics WHERE slug = 'star-medica-queretaro'), (SELECT id FROM specialties WHERE slug = 'ginecologia')),
  ((SELECT id FROM clinics WHERE slug = 'star-medica-queretaro'), (SELECT id FROM specialties WHERE slug = 'cardiologia')),
  -- Christus Muguerza: Traumatologia, Cardiologia, Neurologia, Pediatria
  ((SELECT id FROM clinics WHERE slug = 'christus-muguerza-monterrey'), (SELECT id FROM specialties WHERE slug = 'traumatologia')),
  ((SELECT id FROM clinics WHERE slug = 'christus-muguerza-monterrey'), (SELECT id FROM specialties WHERE slug = 'cardiologia')),
  ((SELECT id FROM clinics WHERE slug = 'christus-muguerza-monterrey'), (SELECT id FROM specialties WHERE slug = 'neurologia')),
  ((SELECT id FROM clinics WHERE slug = 'christus-muguerza-monterrey'), (SELECT id FROM specialties WHERE slug = 'pediatria')),
  -- Hospital Espanol: Cardiologia, Dermatologia, Oftalmologia, Medicina General
  ((SELECT id FROM clinics WHERE slug = 'hospital-espanol-cdmx'), (SELECT id FROM specialties WHERE slug = 'cardiologia')),
  ((SELECT id FROM clinics WHERE slug = 'hospital-espanol-cdmx'), (SELECT id FROM specialties WHERE slug = 'dermatologia')),
  ((SELECT id FROM clinics WHERE slug = 'hospital-espanol-cdmx'), (SELECT id FROM specialties WHERE slug = 'oftalmologia')),
  ((SELECT id FROM clinics WHERE slug = 'hospital-espanol-cdmx'), (SELECT id FROM specialties WHERE slug = 'medicina-general')),
  -- Medica Sur: Oncologia, Gastroenterologia, Cardiologia, Neurologia
  ((SELECT id FROM clinics WHERE slug = 'medica-sur-cdmx'), (SELECT id FROM specialties WHERE slug = 'oncologia')),
  ((SELECT id FROM clinics WHERE slug = 'medica-sur-cdmx'), (SELECT id FROM specialties WHERE slug = 'gastroenterologia')),
  ((SELECT id FROM clinics WHERE slug = 'medica-sur-cdmx'), (SELECT id FROM specialties WHERE slug = 'cardiologia')),
  ((SELECT id FROM clinics WHERE slug = 'medica-sur-cdmx'), (SELECT id FROM specialties WHERE slug = 'neurologia')),
  -- San Angel Inn: Ginecologia, Pediatria, Traumatologia
  ((SELECT id FROM clinics WHERE slug = 'san-angel-inn-universidad'), (SELECT id FROM specialties WHERE slug = 'ginecologia')),
  ((SELECT id FROM clinics WHERE slug = 'san-angel-inn-universidad'), (SELECT id FROM specialties WHERE slug = 'pediatria')),
  ((SELECT id FROM clinics WHERE slug = 'san-angel-inn-universidad'), (SELECT id FROM specialties WHERE slug = 'traumatologia')),
  -- Zambrano Hellion: Cardiologia, Oncologia, Neurologia, Traumatologia
  ((SELECT id FROM clinics WHERE slug = 'hospital-zambrano-hellion-monterrey'), (SELECT id FROM specialties WHERE slug = 'cardiologia')),
  ((SELECT id FROM clinics WHERE slug = 'hospital-zambrano-hellion-monterrey'), (SELECT id FROM specialties WHERE slug = 'oncologia')),
  ((SELECT id FROM clinics WHERE slug = 'hospital-zambrano-hellion-monterrey'), (SELECT id FROM specialties WHERE slug = 'neurologia')),
  ((SELECT id FROM clinics WHERE slug = 'hospital-zambrano-hellion-monterrey'), (SELECT id FROM specialties WHERE slug = 'traumatologia')),
  -- Hospital Civil: Medicina General, Pediatria, Ginecologia, Traumatologia
  ((SELECT id FROM clinics WHERE slug = 'hospital-civil-guadalajara'), (SELECT id FROM specialties WHERE slug = 'medicina-general')),
  ((SELECT id FROM clinics WHERE slug = 'hospital-civil-guadalajara'), (SELECT id FROM specialties WHERE slug = 'pediatria')),
  ((SELECT id FROM clinics WHERE slug = 'hospital-civil-guadalajara'), (SELECT id FROM specialties WHERE slug = 'ginecologia')),
  ((SELECT id FROM clinics WHERE slug = 'hospital-civil-guadalajara'), (SELECT id FROM specialties WHERE slug = 'traumatologia')),
  -- ISSSTE: Medicina General, Pediatria, Cardiologia
  ((SELECT id FROM clinics WHERE slug = 'clinica-issste-cdmx'), (SELECT id FROM specialties WHERE slug = 'medicina-general')),
  ((SELECT id FROM clinics WHERE slug = 'clinica-issste-cdmx'), (SELECT id FROM specialties WHERE slug = 'pediatria')),
  ((SELECT id FROM clinics WHERE slug = 'clinica-issste-cdmx'), (SELECT id FROM specialties WHERE slug = 'cardiologia')),
  -- IMSS: Medicina General, Pediatria, Ginecologia, Traumatologia
  ((SELECT id FROM clinics WHERE slug = 'clinica-imss-cdmx'), (SELECT id FROM specialties WHERE slug = 'medicina-general')),
  ((SELECT id FROM clinics WHERE slug = 'clinica-imss-cdmx'), (SELECT id FROM specialties WHERE slug = 'pediatria')),
  ((SELECT id FROM clinics WHERE slug = 'clinica-imss-cdmx'), (SELECT id FROM specialties WHERE slug = 'ginecologia')),
  ((SELECT id FROM clinics WHERE slug = 'clinica-imss-cdmx'), (SELECT id FROM specialties WHERE slug = 'traumatologia'));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_clinics_updated_at
  BEFORE UPDATE ON clinics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
