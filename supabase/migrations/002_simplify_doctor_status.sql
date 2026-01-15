-- Simplificar estados del doctor según DECISIONES.md
-- Solo 3 estados: pending (no verificado) y approved (verificado), suspended
-- Si admin rechaza, doctor sigue en pending y admin deja nota

-- 1. Eliminar políticas que dependen de la columna status
DROP POLICY IF EXISTS "Anyone can view approved doctors" ON doctors;
DROP POLICY IF EXISTS "Doctors can update their own profile" ON doctors;
DROP POLICY IF EXISTS "Admins can manage all doctors" ON doctors;

-- 2. Migrar estados existentes
UPDATE doctors SET status = 'pending' WHERE status = 'draft';
UPDATE doctors SET status = 'pending' WHERE status = 'rejected';

-- 3. Eliminar default antes de cambiar el tipo
ALTER TABLE doctors ALTER COLUMN status DROP DEFAULT;

-- 4. Eliminar el enum antiguo y crear uno nuevo simplificado
ALTER TABLE doctors ALTER COLUMN status TYPE TEXT;
DROP TYPE IF EXISTS doctor_status CASCADE;
CREATE TYPE doctor_status AS ENUM ('pending', 'approved', 'suspended');
ALTER TABLE doctors ALTER COLUMN status TYPE doctor_status USING status::doctor_status;

-- 5. Actualizar default
ALTER TABLE doctors ALTER COLUMN status SET DEFAULT 'pending';

-- 6. Recrear políticas con los nuevos estados
CREATE POLICY "Anyone can view approved doctors"
  ON doctors FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Doctors can update their own profile"
  ON doctors FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage all doctors"
  ON doctors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 7. Eliminar estados innecesarios de document_status
DROP TYPE IF EXISTS document_status CASCADE;

-- 8. Comentario explicativo
COMMENT ON TYPE doctor_status IS 'Estados del doctor: pending (puede configurar todo, no visible en catálogo), approved (verificado, visible en catálogo), suspended (suspendido por admin)';
