-- Migration: Atomic referral redemption with monthly cap
-- Fixes TOCTOU race condition where two concurrent signups could exceed the 10/month cap
-- Both SELECT COUNT and INSERT happen inside a single serialized transaction via FOR UPDATE lock

CREATE OR REPLACE FUNCTION atomic_redeem_referral(
  p_referrer_id UUID,
  p_referee_id UUID,
  p_referral_code TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_monthly_count INTEGER;
  v_referral_id UUID;
  v_cap_exceeded BOOLEAN;
BEGIN
  -- Lock the referrer's profile row to serialize concurrent referral redemptions
  PERFORM id FROM profiles WHERE id = p_referrer_id FOR UPDATE;

  -- Count under lock: how many rewarded/redeemed referrals this month?
  SELECT COUNT(*) INTO v_monthly_count
  FROM patient_referrals
  WHERE referrer_id = p_referrer_id
    AND status IN ('redeemed', 'rewarded')
    AND created_at >= date_trunc('month', NOW());

  v_cap_exceeded := v_monthly_count >= 10;

  -- Check no self-referral
  IF p_referrer_id = p_referee_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'self_referral'
    );
  END IF;

  -- Insert atomically inside the locked transaction.
  -- ON CONFLICT (referee_id) DO NOTHING protects against double-redemption.
  -- Status reflects whether cap was exceeded so caller can decide on rewards.
  INSERT INTO patient_referrals (referrer_id, referee_id, code_used, status, rewards_granted_at)
  VALUES (
    p_referrer_id,
    p_referee_id,
    p_referral_code,
    CASE WHEN v_cap_exceeded THEN 'redeemed'::text ELSE 'rewarded'::text END,
    CASE WHEN v_cap_exceeded THEN NULL ELSE NOW() END
  )
  ON CONFLICT (referee_id) DO NOTHING
  RETURNING id INTO v_referral_id;

  -- Already redeemed by this referee
  IF v_referral_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'already_redeemed'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'referral_id', v_referral_id,
    'cap_exceeded', v_cap_exceeded,
    'monthly_count', v_monthly_count
  );
END;
$$;

COMMENT ON FUNCTION atomic_redeem_referral(UUID, UUID, TEXT) IS 'Atomically redeems a referral code, enforcing the 10/month cap with row-level locking to prevent TOCTOU races.';
