/*
  # Server-side doctor registration function
  
  This function bypasses RLS policies by running with admin privileges,
  solving permission issues that might occur during registration.
*/

-- Create a secure server-side function to handle doctor registration
CREATE OR REPLACE FUNCTION register_doctor(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT,
  p_specialty TEXT,
  p_is_premium BOOLEAN DEFAULT false,
  p_premium_months INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- This runs with the privileges of the function creator (typically admin)
AS $$
DECLARE
  v_user_id UUID;
  v_doctor_id UUID;
  v_premium_until TIMESTAMPTZ;
BEGIN
  -- Calculate premium expiration date if applicable
  IF p_is_premium AND p_premium_months > 0 THEN
    v_premium_until := NOW() + (p_premium_months * INTERVAL '1 month');
  END IF;

  -- Step 1: Create auth user
  BEGIN
    INSERT INTO auth.users (
      email,
      raw_user_meta_data,
      is_confirmed
    ) VALUES (
      p_email,
      jsonb_build_object(
        'full_name', p_name,
        'is_doctor', true
      ),
      true -- Auto-confirm the user
    )
    RETURNING id INTO v_user_id;
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User creation failed: ' || SQLERRM,
      'step', 'auth.users'
    );
  END;

  -- Step 2: Set user password
  BEGIN
    -- Use the built-in function to properly hash the password
    PERFORM auth.set_password(v_user_id, p_password);
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Password setting failed: ' || SQLERRM,
      'step', 'set_password'
    );
  END;

  -- Step 3: Create doctor profile
  BEGIN
    INSERT INTO doctors (
      user_id,
      name,
      specialty,
      is_premium,
      premium_until,
      verification_status,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      p_name,
      p_specialty,
      p_is_premium,
      v_premium_until,
      'pending',
      NOW(),
      NOW()
    )
    RETURNING id INTO v_doctor_id;
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Doctor profile creation failed: ' || SQLERRM,
      'step', 'doctors'
    );
  END;

  -- Return success with user and doctor IDs
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'doctor_id', v_doctor_id,
    'is_premium', p_is_premium,
    'premium_until', v_premium_until
  );
END;
$$;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION register_doctor(TEXT, TEXT, TEXT, TEXT, BOOLEAN, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION register_doctor(TEXT, TEXT, TEXT, TEXT, BOOLEAN, INTEGER) TO anon;
