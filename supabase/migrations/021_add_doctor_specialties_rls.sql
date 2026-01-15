-- ================================================
-- RLS POLICIES FOR DOCTOR_SPECIALTIES
-- ================================================

-- Allow SELECT for everyone (public can see doctor specialties)
CREATE POLICY "Everyone can view doctor specialties"
  ON doctor_specialties FOR SELECT
  USING (true);

-- Allow INSERT/UPDATE/DELETE for doctors managing their own specialties
CREATE POLICY "Doctors can manage their own specialties"
  ON doctor_specialties FOR INSERT
  WITH CHECK (
    doctor_id IN (
      SELECT id FROM doctors WHERE id = auth.uid()
    )
  );

CREATE POLICY "Doctors can update their own specialties"
  ON doctor_specialties FOR UPDATE
  USING (
    doctor_id IN (
      SELECT id FROM doctors WHERE id = auth.uid()
    )
  );

CREATE POLICY "Doctors can delete their own specialties"
  ON doctor_specialties FOR DELETE
  USING (
    doctor_id IN (
      SELECT id FROM doctors WHERE id = auth.uid()
    )
  );

-- Allow admins to manage all specialties
CREATE POLICY "Admins can manage all doctor specialties"
  ON doctor_specialties FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
