-- ================================================
-- MIGRATION 007: PRESCRIPTION PDF GENERATION
-- ================================================
-- Adds PDF generation and storage capabilities to prescriptions
-- ================================================

-- ================================================
-- PDF URL COLUMN
-- ================================================

ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS pdf_url TEXT;

ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS pdf_generated_at TIMESTAMPTZ;

ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS sent_to_patient BOOLEAN DEFAULT false;

ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

-- ================================================
-- INDEXES
-- ================================================

CREATE INDEX IF NOT EXISTS idx_prescriptions_pdf_url ON prescriptions(pdf_url);
CREATE INDEX IF NOT EXISTS idx_prescriptions_sent ON prescriptions(sent_to_patient);

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

-- Update RLS policy for prescriptions to include PDF access
CREATE OR REPLACE POLICY "Prescription access policy"
  ON prescriptions FOR SELECT
  USING (
    appointment_id IN (
      SELECT id FROM appointments WHERE patient_id = auth.uid() OR doctor_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Doctors can update prescription PDFs"
  ON prescriptions FOR UPDATE
  USING (
    appointment_id IN (
      SELECT id FROM appointments WHERE doctor_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON COLUMN prescriptions.pdf_url IS 'URL to the PDF file in Supabase Storage';
COMMENT ON COLUMN prescriptions.pdf_generated_at IS 'Timestamp when the PDF was generated';
COMMENT ON COLUMN prescriptions.sent_to_patient IS 'Whether the prescription was sent to the patient';
COMMENT ON COLUMN prescriptions.sent_at IS 'Timestamp when the prescription was sent to the patient';

-- ================================================
-- MIGRATION COMPLETE
-- ================================================
