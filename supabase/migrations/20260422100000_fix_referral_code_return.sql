CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  alphabet TEXT := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  attempt INTEGER := 0;
  code TEXT;
BEGIN
  LOOP
    attempt := attempt + 1;
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    END LOOP;

    IF NOT EXISTS (SELECT 1 FROM profiles WHERE referral_code = code) THEN
      RETURN code;
    END IF;

    IF attempt > 20 THEN
      RAISE EXCEPTION 'Could not generate unique referral code after 20 attempts';
    END IF;
  END LOOP;

  RAISE EXCEPTION 'Could not generate unique referral code';
END;
$$;
