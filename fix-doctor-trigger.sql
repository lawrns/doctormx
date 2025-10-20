-- Fix the doctor badges trigger to use the correct column name
DROP TRIGGER IF EXISTS trigger_doctors_badges ON doctors;

CREATE OR REPLACE FUNCTION trigger_update_doctor_badges()
RETURNS TRIGGER AS $$
BEGIN
  -- Update badges for the affected doctor using user_id instead of doctor_id
  PERFORM update_doctor_badges(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_doctors_badges
  AFTER INSERT OR UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION trigger_update_doctor_badges();
