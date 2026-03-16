-- ================================================
-- PLATFORM FEE SYSTEM - Revenue from Consultations
-- Tables to track platform fees and doctor payouts
-- ================================================

-- Platform fees table - tracks revenue from each consultation
CREATE TABLE IF NOT EXISTS platform_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    
    -- Fee breakdown
    gross_amount_cents INTEGER NOT NULL,
    platform_fee_cents INTEGER NOT NULL DEFAULT 0,
    doctor_net_cents INTEGER NOT NULL,
    
    -- Tier info
    tier TEXT NOT NULL DEFAULT 'starter',
    fee_percent INTEGER NOT NULL DEFAULT 10, -- 10, 5, or 0
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending_transfer', -- pending_transfer, transferred, transfer_failed, refunded
    error_message TEXT,
    
    -- Stripe transfer info
    stripe_transfer_id TEXT,
    transferred_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Doctor transfers table - scheduled payouts to doctors
CREATE TABLE IF NOT EXISTS doctor_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    
    -- Transfer details
    doctor_stripe_account_id TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    
    -- Scheduling
    scheduled_for TIMESTAMPTZ NOT NULL,
    processed_at TIMESTAMPTZ,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
    stripe_transfer_id TEXT,
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Daily revenue summary (for fast dashboard queries)
CREATE TABLE IF NOT EXISTS daily_revenue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    
    -- Subscription revenue
    subscription_revenue_cents INTEGER NOT NULL DEFAULT 0,
    new_subscriptions INTEGER NOT NULL DEFAULT 0,
    
    -- Platform fee revenue
    platform_fee_revenue_cents INTEGER NOT NULL DEFAULT 0,
    total_consults INTEGER NOT NULL DEFAULT 0,
    
    -- Breakdown by tier
    starter_consults INTEGER NOT NULL DEFAULT 0,
    starter_fees_cents INTEGER NOT NULL DEFAULT 0,
    pro_consults INTEGER NOT NULL DEFAULT 0,
    pro_fees_cents INTEGER NOT NULL DEFAULT 0,
    elite_consults INTEGER NOT NULL DEFAULT 0,
    elite_fees_cents INTEGER NOT NULL DEFAULT 0,
    
    -- Doctor payouts
    doctor_payouts_cents INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_platform_fees_payment_id ON platform_fees(payment_id);
CREATE INDEX IF NOT EXISTS idx_platform_fees_doctor_id ON platform_fees(doctor_id);
CREATE INDEX IF NOT EXISTS idx_platform_fees_created_at ON platform_fees(created_at);
CREATE INDEX IF NOT EXISTS idx_platform_fees_status ON platform_fees(status);

CREATE INDEX IF NOT EXISTS idx_doctor_transfers_payment_id ON doctor_transfers(payment_id);
CREATE INDEX IF NOT EXISTS idx_doctor_transfers_status ON doctor_transfers(status);
CREATE INDEX IF NOT EXISTS idx_doctor_transfers_scheduled_for ON doctor_transfers(scheduled_for);

-- Enable RLS
ALTER TABLE platform_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_revenue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all platform fees"
    ON platform_fees FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Doctors can view their own fees"
    ON platform_fees FOR SELECT
    USING (auth.uid() = doctor_id);

CREATE POLICY "Service role can manage platform fees"
    ON platform_fees FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admins can view all transfers"
    ON doctor_transfers FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can manage transfers"
    ON doctor_transfers FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admins can view revenue summaries"
    ON daily_revenue FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

-- Trigger to update daily revenue summary
CREATE OR REPLACE FUNCTION update_daily_revenue()
RETURNS TRIGGER AS $$
DECLARE
    v_date DATE;
    v_tier TEXT;
BEGIN
    v_date := DATE(NEW.created_at);
    v_tier := NEW.tier;
    
    -- Insert or update daily revenue record
    INSERT INTO daily_revenue (
        date,
        platform_fee_revenue_cents,
        total_consults,
        starter_consults,
        starter_fees_cents,
        pro_consults,
        pro_fees_cents,
        elite_consults,
        elite_fees_cents,
        doctor_payouts_cents
    ) VALUES (
        v_date,
        NEW.platform_fee_cents,
        1,
        CASE WHEN v_tier = 'starter' THEN 1 ELSE 0 END,
        CASE WHEN v_tier = 'starter' THEN NEW.platform_fee_cents ELSE 0 END,
        CASE WHEN v_tier = 'pro' THEN 1 ELSE 0 END,
        CASE WHEN v_tier = 'pro' THEN NEW.platform_fee_cents ELSE 0 END,
        CASE WHEN v_tier = 'elite' THEN 1 ELSE 0 END,
        CASE WHEN v_tier = 'elite' THEN NEW.platform_fee_cents ELSE 0 END,
        NEW.doctor_net_cents
    )
    ON CONFLICT (date) DO UPDATE SET
        platform_fee_revenue_cents = daily_revenue.platform_fee_revenue_cents + NEW.platform_fee_cents,
        total_consults = daily_revenue.total_consults + 1,
        starter_consults = daily_revenue.starter_consults + CASE WHEN v_tier = 'starter' THEN 1 ELSE 0 END,
        starter_fees_cents = daily_revenue.starter_fees_cents + CASE WHEN v_tier = 'starter' THEN NEW.platform_fee_cents ELSE 0 END,
        pro_consults = daily_revenue.pro_consults + CASE WHEN v_tier = 'pro' THEN 1 ELSE 0 END,
        pro_fees_cents = daily_revenue.pro_fees_cents + CASE WHEN v_tier = 'pro' THEN NEW.platform_fee_cents ELSE 0 END,
        elite_consults = daily_revenue.elite_consults + CASE WHEN v_tier = 'elite' THEN 1 ELSE 0 END,
        elite_fees_cents = daily_revenue.elite_fees_cents + CASE WHEN v_tier = 'elite' THEN NEW.platform_fee_cents ELSE 0 END,
        doctor_payouts_cents = daily_revenue.doctor_payouts_cents + NEW.doctor_net_cents,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_daily_revenue
    AFTER INSERT ON platform_fees
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_revenue();

-- Add stripe_account_id to doctors table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'doctors' 
        AND column_name = 'stripe_account_id'
    ) THEN
        ALTER TABLE doctors ADD COLUMN stripe_account_id TEXT;
        RAISE NOTICE 'Added stripe_account_id to doctors table';
    END IF;
END $$;

-- Add subscription_tier to doctors table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'doctors' 
        AND column_name = 'subscription_tier'
    ) THEN
        ALTER TABLE doctors ADD COLUMN subscription_tier TEXT DEFAULT 'starter';
        RAISE NOTICE 'Added subscription_tier to doctors table';
    END IF;
END $$;

-- Grant permissions
GRANT ALL ON platform_fees TO service_role;
GRANT ALL ON doctor_transfers TO service_role;
GRANT ALL ON daily_revenue TO service_role;
GRANT SELECT ON daily_revenue TO authenticated;

-- Comments
COMMENT ON TABLE platform_fees IS 'Tracks platform revenue from each consultation';
COMMENT ON TABLE doctor_transfers IS 'Scheduled payouts to doctors via Stripe Connect';
COMMENT ON TABLE daily_revenue IS 'Daily aggregated revenue metrics for dashboard';
