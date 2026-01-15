-- Función para guardar onboarding de doctor (bypass PostgREST cache)
CREATE OR REPLACE FUNCTION save_doctor_onboarding(
  p_doctor_id UUID,
  p_years_experience INTEGER,
  p_bio TEXT,
  p_license_number TEXT,
  p_price_cents INTEGER,
  p_availability JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_day_config JSONB;
  v_day_name TEXT;
  v_day_num INTEGER;
BEGIN
  -- Actualizar datos del doctor
  UPDATE doctors
  SET
    years_experience = p_years_experience,
    bio = p_bio,
    license_number = p_license_number,
    price_cents = p_price_cents,
    status = 'pending',
    updated_at = NOW()
  WHERE id = p_doctor_id;

  -- Eliminar disponibilidad existente
  DELETE FROM availability_rules WHERE doctor_id = p_doctor_id;

  -- Insertar nueva disponibilidad
  FOR v_day_name, v_day_config IN SELECT * FROM jsonb_each(p_availability)
  LOOP
    IF (v_day_config->>'enabled')::boolean THEN
      v_day_num := CASE v_day_name
        WHEN 'monday' THEN 1
        WHEN 'tuesday' THEN 2
        WHEN 'wednesday' THEN 3
        WHEN 'thursday' THEN 4
        WHEN 'friday' THEN 5
        WHEN 'saturday' THEN 6
        WHEN 'sunday' THEN 0
      END;

      INSERT INTO availability_rules (doctor_id, day_of_week, start_time, end_time, slot_minutes, buffer_minutes, active)
      VALUES (
        p_doctor_id,
        v_day_num,
        (v_day_config->>'start')::TIME,
        (v_day_config->>'end')::TIME,
        30,
        0,
        true
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object('success', true);
END;
$$;
