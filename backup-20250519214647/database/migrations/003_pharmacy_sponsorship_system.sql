CREATE TABLE IF NOT EXISTS pharmacies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  location GEOGRAPHY(POINT),
  phone TEXT,
  website TEXT,
  opening_hours JSONB,
  available_medications TEXT[] DEFAULT '{}',
  is_sponsored BOOLEAN DEFAULT FALSE,
  sponsorship_level INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pharmacies_location ON pharmacies USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_pharmacies_sponsored ON pharmacies(is_sponsored);

CREATE TABLE IF NOT EXISTS pharmacy_medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacies(id),
  medication_name TEXT NOT NULL,
  price DECIMAL,
  inventory_count INTEGER,
  is_prescription_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pharmacy_medications_pharmacy ON pharmacy_medications(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_medications_name ON pharmacy_medications(medication_name);

ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pharmacies are readable by everyone" 
ON pharmacies FOR SELECT 
USING (true);

ALTER TABLE pharmacy_medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pharmacy medications are readable by everyone" 
ON pharmacy_medications FOR SELECT 
USING (true);

CREATE TRIGGER update_pharmacies_timestamp
BEFORE UPDATE ON pharmacies
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_pharmacy_medications_timestamp
BEFORE UPDATE ON pharmacy_medications
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
