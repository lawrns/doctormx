-- Cities and districts (colonias) for location-based SEO and discovery
-- Mirrors Doctoralia's specialty-city-district programmatic pages

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  state text NOT NULL,
  state_code text,
  country text NOT NULL DEFAULT 'MX',
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  population integer,
  is_major boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Districts (colonias/barrios) table
CREATE TABLE IF NOT EXISTS districts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  postal_code text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (city_id, slug)
);

-- Add city reference to doctors
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES cities(id);
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS district_id uuid REFERENCES districts(id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cities_slug ON cities(slug);
CREATE INDEX IF NOT EXISTS idx_cities_state ON cities(state);
CREATE INDEX IF NOT EXISTS idx_cities_major ON cities(is_major) WHERE is_major = true;
CREATE INDEX IF NOT EXISTS idx_districts_city ON districts(city_id);
CREATE INDEX IF NOT EXISTS idx_districts_slug ON districts(slug);
CREATE INDEX IF NOT EXISTS idx_doctors_city_id ON doctors(city_id);
CREATE INDEX IF NOT EXISTS idx_doctors_district_id ON doctors(district_id);

-- RLS
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cities are publicly readable" ON cities FOR SELECT USING (true);
CREATE POLICY "Districts are publicly readable" ON districts FOR SELECT USING (true);

-- Seed: Top Mexican cities
INSERT INTO cities (name, slug, state, state_code, latitude, longitude, population, is_major) VALUES
  ('Ciudad de México', 'ciudad-de-mexico', 'Ciudad de México', 'CMX', 19.4326080, -99.1332080, 9209944, true),
  ('Guadalajara', 'guadalajara', 'Jalisco', 'JAL', 20.6596988, -103.3496093, 1495189, true),
  ('Monterrey', 'monterrey', 'Nuevo León', 'NLE', 25.6866142, -100.3161126, 1142994, true),
  ('Puebla', 'puebla', 'Puebla', 'PUE', 19.0412973, -98.2062727, 1692181, true),
  ('Tijuana', 'tijuana', 'Baja California', 'BCN', 32.5149469, -117.0382471, 1810645, true),
  ('León', 'leon', 'Guanajuato', 'GTO', 21.1290792, -101.6737575, 1578626, true),
  ('Mérida', 'merida', 'Yucatán', 'YUC', 20.9673702, -89.5925857, 995129, true),
  ('Querétaro', 'queretaro', 'Querétaro', 'QRO', 20.5916708, -100.3919989, 1049777, true),
  ('Cancún', 'cancun', 'Quintana Roo', 'ROO', 21.1619070, -86.8515275, 888797, true),
  ('Toluca', 'toluca', 'Estado de México', 'MEX', 19.2826098, -99.6556658, 911625, true),
  ('Chihuahua', 'chihuahua', 'Chihuahua', 'CHH', 28.6329957, -106.0691004, 937674, true),
  ('Aguascalientes', 'aguascalientes', 'Aguascalientes', 'AGU', 21.8823386, -102.2825887, 948990, true),
  ('Morelia', 'morelia', 'Michoacán', 'MIC', 19.7060252, -101.1943408, 813466, true),
  ('Veracruz', 'veracruz', 'Veracruz', 'VER', 19.1737730, -96.1342266, 732845, true),
  ('Villahermosa', 'villahermosa', 'Tabasco', 'TAB', 17.9869096, -92.9194576, 683789, true),
  ('Hermosillo', 'hermosillo', 'Sonora', 'SON', 29.0729673, -110.9559192, 884223, true),
  ('Saltillo', 'saltillo', 'Coahuila', 'COA', 25.4230100, -101.0053101, 844030, true),
  ('Guadalupe', 'guadalupe', 'Nuevo León', 'NLE', 25.6766667, -100.2563889, 722408, false),
  ('Durango', 'durango', 'Durango', 'DUR', 24.0277200, -104.6532300, 654616, false),
  ('Chetumal', 'chetumal', 'Quintana Roo', 'ROO', 18.5000000, -88.3000000, 169468, false),
  ('Tuxtla Gutiérrez', 'tuxtla-gutierrez', 'Chiapas', 'CHP', 16.7499960, -93.1166850, 598710, false),
  ('Ciudad Juárez', 'ciudad-juarez', 'Chihuahua', 'CHH', 31.6903600, -106.4245470, 1501381, true),
  ('Mexicali', 'mexicali', 'Baja California', 'BCN', 32.6245386, -115.4522635, 1049792, true),
  ('Culiacán', 'culiacan', 'Sinaloa', 'SIN', 24.7903490, -107.2135980, 913841, false),
  ('Oaxaca', 'oaxaca', 'Oaxaca', 'OAX', 17.0604210, -96.7253480, 711480, false),
  ('Xalapa', 'xalapa', 'Veracruz', 'VER', 19.5312400, -96.9157560, 546678, false),
  ('La Paz', 'la-paz', 'Baja California Sur', 'BCS', 24.1423500, -110.3127500, 290425, false),
  ('San Luis Potosí', 'san-luis-potosi', 'San Luis Potosí', 'SLP', 22.1564690, -100.9855380, 921071, false),
  ('Zapopan', 'zapopan', 'Jalisco', 'JAL', 20.7235800, -103.3847900, 1463212, false),
  ('Tlaquepaque', 'tlaquepaque', 'Jalisco', 'JAL', 20.6408333, -103.2933333, 663758, false),
  ('Celaya', 'celaya', 'Guanajuato', 'GTO', 20.5218700, -100.8160600, 494304, false),
  ('Irapuato', 'irapuato', 'Guanajuato', 'GTO', 20.6702500, -101.3443100, 529440, false),
  ('Mazatlán', 'mazatlan', 'Sinaloa', 'SIN', 23.2493600, -106.4111400, 503639, false),
  ('Ensenada', 'ensenada', 'Baja California', 'BCN', 31.8664100, -116.5946900, 526474, false),
  ('Cuernavaca', 'cuernavaca', 'Morelos', 'MOR', 18.9242099, -99.2215655, 378744, false),
  ('Reynosa', 'reynosa', 'Tamaulipas', 'TAM', 26.0765600, -98.2974700, 694849, false),
  ('Matamoros', 'matamoros', 'Tamaulipas', 'TAM', 25.8796500, -97.5041700, 520369, false),
  ('Tepic', 'tepic', 'Nayarit', 'NAY', 21.5041700, -104.8945800, 499692, false),
  ('Campeche', 'campeche', 'Campeche', 'CAM', 19.8303300, -90.5349100, 293565, false),
  ('Colima', 'colima', 'Colima', 'COL', 19.2452370, -103.7240880, 310665, false);

-- Seed: Major districts for CDMX
INSERT INTO districts (name, slug, city_id, postal_code) VALUES
  ('Coyoacán', 'coyoacan', (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'), '04000'),
  ('Benito Juárez', 'benito-juarez', (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'), '03100'),
  ('Polanco', 'polanco', (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'), '11560'),
  ('Condesa', 'condesa', (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'), '06140'),
  ('Roma', 'roma', (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'), '06700'),
  ('Del Valle', 'del-valle', (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'), '03100'),
  ('Narvarte', 'narvarte', (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'), '03020'),
  ('Santa Ursula', 'santa-ursula', (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'), '04650'),
  ('Tlalpan', 'tlalpan', (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'), '14000'),
  ('Álvaro Obregón', 'alvaro-obregon', (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'), '01000'),
  ('Miguel Hidalgo', 'miguel-hidalgo', (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'), '11000'),
  ('Cuauhtémoc', 'cuauhtemoc', (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'), '06000'),
  ('Azcapotzalco', 'azcapotzalco', (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'), '02000'),
  ('Iztapalapa', 'iztapalapa', (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'), '09000'),
  ('Gustavo A. Madero', 'gustavo-a-madero', (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'), '07000'),
  ('Venustiano Carranza', 'venustiano-carranza', (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'), '15800'),
  ('Xochimilco', 'xochimilco', (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'), '16000'),
  ('Magdalena Contreras', 'magdalena-contreras', (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'), '10000'),
  ('Milpa Alta', 'milpa-alta', (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'), '12000'),
  ('Tláhuac', 'tlahuac', (SELECT id FROM cities WHERE slug = 'ciudad-de-mexico'), '13000');

-- Seed: Major districts for Guadalajara
INSERT INTO districts (name, slug, city_id, postal_code) VALUES
  ('Centro', 'centro', (SELECT id FROM cities WHERE slug = 'guadalajara'), '44100'),
  ('Chapalita', 'chapalita', (SELECT id FROM cities WHERE slug = 'guadalajara'), '45030'),
  ('Providencia', 'providencia', (SELECT id FROM cities WHERE slug = 'guadalajara'), '44630'),
  ('Minerva', 'minerva', (SELECT id FROM cities WHERE slug = 'guadalajara'), '44160'),
  ('Ladrón de Guevara', 'ladron-de-guevara', (SELECT id FROM cities WHERE slug = 'guadalajara'), '44600'),
  ('Americana', 'americana', (SELECT id FROM cities WHERE slug = 'guadalajara'), '44160'),
  ('Terranova', 'terranova', (SELECT id FROM cities WHERE slug = 'guadalajara'), '45150'),
  ('Juan Manuel', 'juan-manuel', (SELECT id FROM cities WHERE slug = 'guadalajara'), '44950'),
  ('Santa Tere', 'santa-tere', (SELECT id FROM cities WHERE slug = 'guadalajara'), '44610'),
  ('La Normal', 'la-normal', (SELECT id FROM cities WHERE slug = 'guadalajara'), '44270');

-- Seed: Major districts for Monterrey
INSERT INTO districts (name, slug, city_id, postal_code) VALUES
  ('Centro', 'centro', (SELECT id FROM cities WHERE slug = 'monterrey'), '64000'),
  ('Col. Del Valle', 'del-valle', (SELECT id FROM cities WHERE slug = 'monterrey'), '66200'),
  ('San Pedro Garza García', 'san-pedro', (SELECT id FROM cities WHERE slug = 'monterrey'), '66220'),
  ('Cumbres', 'cumbres', (SELECT id FROM cities WHERE slug = 'monterrey'), '64610'),
  ('Contry', 'contry', (SELECT id FROM cities WHERE slug = 'monterrey'), '64820'),
  ('Tec', 'tec', (SELECT id FROM cities WHERE slug = 'monterrey'), '64849'),
  ('Lincoln', 'lincoln', (SELECT id FROM cities WHERE slug = 'monterrey'), '66430'),
  ('Mitras', 'mitras', (SELECT id FROM cities WHERE slug = 'monterrey'), '64140');
