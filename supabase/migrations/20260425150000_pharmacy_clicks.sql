-- Pharmacy Affiliate Click Tracking

CREATE TABLE IF NOT EXISTS pharmacy_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  pharmacy TEXT NOT NULL,
  patient_id UUID REFERENCES profiles(id),
  prescription_id UUID,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  converted BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_pharmacy_clicks_product
  ON pharmacy_clicks(product_id, pharmacy);

CREATE INDEX IF NOT EXISTS idx_pharmacy_clicks_patient
  ON pharmacy_clicks(patient_id);

CREATE INDEX IF NOT EXISTS idx_pharmacy_clicks_clicked_at
  ON pharmacy_clicks(clicked_at);

ALTER TABLE pharmacy_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert clicks"
  ON pharmacy_clicks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can read all clicks"
  ON pharmacy_clicks FOR SELECT
  USING (true);

CREATE POLICY "Patients can view their own clicks"
  ON pharmacy_clicks FOR SELECT
  USING (auth.uid() = patient_id);
