-- Lab Testing System Database Schema

-- Lab Tests Catalog
CREATE TABLE IF NOT EXISTS lab_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  instructions TEXT,
  preparation_required BOOLEAN DEFAULT TRUE,
  fast_required BOOLEAN DEFAULT FALSE,
  fast_hours INTEGER,
  processing_time_hours INTEGER NOT NULL DEFAULT 24,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab Test Categories
CREATE TABLE IF NOT EXISTS lab_test_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mapping between tests and categories (many-to-many)
CREATE TABLE IF NOT EXISTS lab_test_category_mapping (
  test_id UUID REFERENCES lab_tests(id) ON DELETE CASCADE,
  category_id UUID REFERENCES lab_test_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (test_id, category_id)
);

-- Lab Technicians
CREATE TABLE IF NOT EXISTS lab_technicians (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  license_number TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  service_areas JSONB, -- Array of zip codes/locations they service
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab Test Requests (order)
CREATE TABLE IF NOT EXISTS lab_test_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  instructions TEXT,
  special_requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_status TEXT DEFAULT 'pending', -- pending, paid, refunded
  total_amount DECIMAL(10,2)
);

-- Many-to-many relationship between requests and tests
CREATE TABLE IF NOT EXISTS lab_test_request_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES lab_test_requests(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES lab_tests(id),
  price_at_order DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab Appointments (scheduling)
CREATE TABLE IF NOT EXISTS lab_appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES lab_test_requests(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES lab_technicians(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab Results
CREATE TABLE IF NOT EXISTS lab_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES lab_test_requests(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES lab_tests(id),
  result_data JSONB NOT NULL,
  is_abnormal BOOLEAN DEFAULT FALSE,
  pdf_url TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample Collection
CREATE TABLE IF NOT EXISTS lab_samples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES lab_appointments(id) ON DELETE CASCADE,
  sample_type TEXT NOT NULL,
  sample_id TEXT NOT NULL,
  collection_time TIMESTAMP WITH TIME ZONE NOT NULL,
  collected_by UUID REFERENCES lab_technicians(id),
  status TEXT NOT NULL DEFAULT 'collected', -- collected, in_transit, received, processed
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lab_tests_active ON lab_tests(is_active);
CREATE INDEX IF NOT EXISTS idx_lab_test_requests_patient ON lab_test_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_test_requests_status ON lab_test_requests(status);
CREATE INDEX IF NOT EXISTS idx_lab_appointments_date ON lab_appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_lab_appointments_technician ON lab_appointments(technician_id);
CREATE INDEX IF NOT EXISTS idx_lab_appointments_status ON lab_appointments(status);
CREATE INDEX IF NOT EXISTS idx_lab_results_request ON lab_results(request_id);
CREATE INDEX IF NOT EXISTS idx_lab_technicians_active ON lab_technicians(is_active);

-- RLS Policies
ALTER TABLE lab_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lab tests are readable by everyone" 
  ON lab_tests FOR SELECT USING (true);

ALTER TABLE lab_test_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lab test categories are readable by everyone" 
  ON lab_test_categories FOR SELECT USING (true);

ALTER TABLE lab_test_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own lab test requests" 
  ON lab_test_requests FOR SELECT 
  USING (auth.uid() = patient_id);
CREATE POLICY "Admin users can view all lab test requests" 
  ON lab_test_requests FOR SELECT 
  USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Users can create their own lab test requests" 
  ON lab_test_requests FOR INSERT 
  WITH CHECK (auth.uid() = patient_id);

ALTER TABLE lab_appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own lab appointments" 
  ON lab_appointments FOR SELECT 
  USING (auth.uid() IN (
    SELECT patient_id FROM lab_test_requests 
    WHERE id = lab_appointments.request_id
  ));
CREATE POLICY "Technicians can view their assigned appointments" 
  ON lab_appointments FOR SELECT 
  USING (auth.uid() IN (
    SELECT user_id FROM lab_technicians
    WHERE id = lab_appointments.technician_id
  ));
CREATE POLICY "Admin users can view all lab appointments" 
  ON lab_appointments FOR SELECT 
  USING (auth.jwt() ->> 'role' = 'admin');

ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own lab results" 
  ON lab_results FOR SELECT 
  USING (auth.uid() IN (
    SELECT patient_id FROM lab_test_requests 
    WHERE id = lab_results.request_id
  ));
CREATE POLICY "Admin users can view all lab results" 
  ON lab_results FOR SELECT 
  USING (auth.jwt() ->> 'role' = 'admin');

-- Update modified timestamps
CREATE TRIGGER update_lab_tests_timestamp
  BEFORE UPDATE ON lab_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_lab_test_categories_timestamp
  BEFORE UPDATE ON lab_test_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_lab_technicians_timestamp
  BEFORE UPDATE ON lab_technicians
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_lab_test_requests_timestamp
  BEFORE UPDATE ON lab_test_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_lab_appointments_timestamp
  BEFORE UPDATE ON lab_appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_lab_results_timestamp
  BEFORE UPDATE ON lab_results
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_lab_samples_timestamp
  BEFORE UPDATE ON lab_samples
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- Insert some sample lab tests
INSERT INTO lab_tests (code, name, description, price, instructions, preparation_required, fast_required, fast_hours, processing_time_hours)
VALUES
  ('CBC', 'Hemograma Completo', 'Conteo de células sanguíneas para evaluar la salud general', 120.00, 'No se requiere preparación especial', FALSE, FALSE, 0, 24),
  ('GLUC', 'Glucosa', 'Mide el nivel de azúcar en la sangre', 80.00, 'Ayuno de 8 horas antes de la toma de muestra', TRUE, TRUE, 8, 24),
  ('LIPID', 'Perfil Lipídico', 'Mide colesterol total, HDL, LDL y triglicéridos', 180.00, 'Ayuno de 12 horas antes de la toma de muestra', TRUE, TRUE, 12, 24),
  ('URINE', 'Examen General de Orina', 'Análisis de orina completa', 100.00, 'Recolección en recipiente estéril proporcionado', TRUE, FALSE, 0, 24),
  ('CHEM12', 'Química Sanguínea 12 elementos', 'Perfil metabólico básico', 200.00, 'Ayuno de 8 horas antes de la toma de muestra', TRUE, TRUE, 8, 24),
  ('HBA1C', 'Hemoglobina Glucosilada', 'Mide el nivel promedio de glucosa de los últimos 3 meses', 150.00, 'No se requiere ayuno', FALSE, FALSE, 0, 48),
  ('TSH', 'Hormona Estimulante de la Tiroides', 'Evalúa la función tiroidea', 160.00, 'No se requiere preparación especial', FALSE, FALSE, 0, 48),
  ('FERR', 'Ferritina', 'Mide los niveles de hierro almacenado', 130.00, 'No se requiere preparación especial', FALSE, FALSE, 0, 48),
  ('VIT-D', 'Vitamina D', 'Mide los niveles de 25-OH vitamina D', 220.00, 'No se requiere preparación especial', FALSE, FALSE, 0, 72),
  ('COVID', 'Prueba COVID-19 PCR', 'Detecta material genético del virus SARS-CoV-2', 290.00, 'No se requiere preparación especial', FALSE, FALSE, 0, 24);

-- Insert sample categories
INSERT INTO lab_test_categories (name, description)
VALUES
  ('Hematología', 'Pruebas relacionadas con la sangre y células sanguíneas'),
  ('Bioquímica', 'Análisis químicos en sangre'),
  ('Hormonas', 'Medición de hormonas y función endocrina'),
  ('Microbiología', 'Detección de microorganismos'),
  ('Pruebas Especiales', 'Pruebas especializadas no rutinarias');

-- Map tests to categories
INSERT INTO lab_test_category_mapping (test_id, category_id)
VALUES
  ((SELECT id FROM lab_tests WHERE code = 'CBC'), (SELECT id FROM lab_test_categories WHERE name = 'Hematología')),
  ((SELECT id FROM lab_tests WHERE code = 'GLUC'), (SELECT id FROM lab_test_categories WHERE name = 'Bioquímica')),
  ((SELECT id FROM lab_tests WHERE code = 'LIPID'), (SELECT id FROM lab_test_categories WHERE name = 'Bioquímica')),
  ((SELECT id FROM lab_tests WHERE code = 'CHEM12'), (SELECT id FROM lab_test_categories WHERE name = 'Bioquímica')),
  ((SELECT id FROM lab_tests WHERE code = 'HBA1C'), (SELECT id FROM lab_test_categories WHERE name = 'Bioquímica')),
  ((SELECT id FROM lab_tests WHERE code = 'TSH'), (SELECT id FROM lab_test_categories WHERE name = 'Hormonas')),
  ((SELECT id FROM lab_tests WHERE code = 'FERR'), (SELECT id FROM lab_test_categories WHERE name = 'Bioquímica')),
  ((SELECT id FROM lab_tests WHERE code = 'VIT-D'), (SELECT id FROM lab_test_categories WHERE name = 'Bioquímica')),
  ((SELECT id FROM lab_tests WHERE code = 'COVID'), (SELECT id FROM lab_test_categories WHERE name = 'Microbiología'));