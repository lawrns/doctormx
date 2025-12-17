-- Agregar columnas city y state si no existen
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'doctors' AND column_name = 'city'
  ) THEN
    ALTER TABLE doctors ADD COLUMN city TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'doctors' AND column_name = 'state'
  ) THEN
    ALTER TABLE doctors ADD COLUMN state TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'doctors' AND column_name = 'specialty'
  ) THEN
    ALTER TABLE doctors ADD COLUMN specialty TEXT;
  END IF;
END $$;
