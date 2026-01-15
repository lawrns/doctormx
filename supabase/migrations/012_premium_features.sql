-- Premium Features System Database Schema
-- Adds tables for tracking premium feature usage, purchases, and billing

-- Premium Feature Usage Tracking Table
CREATE TABLE IF NOT EXISTS premium_feature_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL,
    usage_count INTEGER NOT NULL DEFAULT 0,
    bundle_quantity INTEGER NOT NULL DEFAULT 0,
    bundle_remaining INTEGER NOT NULL DEFAULT 0,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    purchase_session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(doctor_id, feature_key, period_start)
);

-- Premium Purchases Table (for one-time and bundle purchases)
CREATE TABLE IF NOT EXISTS premium_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL,
    purchase_type TEXT NOT NULL CHECK (purchase_type IN ('single', 'bundle')),
    quantity INTEGER NOT NULL DEFAULT 1,
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'MXN',
    stripe_session_id TEXT,
    stripe_payment_intent_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Premium Billing Records Table
CREATE TABLE IF NOT EXISTS premium_billing_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL,
    amount_cents INTEGER NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'MXN',
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    stripe_invoice_id TEXT,
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_premium_feature_usage_doctor_id ON premium_feature_usage(doctor_id);
CREATE INDEX IF NOT EXISTS idx_premium_feature_usage_feature_key ON premium_feature_usage(feature_key);
CREATE INDEX IF NOT EXISTS idx_premium_feature_usage_period ON premium_feature_usage(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_premium_purchases_doctor_id ON premium_purchases(doctor_id);
CREATE INDEX IF NOT EXISTS idx_premium_purchases_feature_key ON premium_purchases(feature_key);
CREATE INDEX IF NOT EXISTS idx_premium_purchases_status ON premium_purchases(status);
CREATE INDEX IF NOT EXISTS idx_premium_purchases_created_at ON premium_purchases(created_at);

CREATE INDEX IF NOT EXISTS idx_premium_billing_records_doctor_id ON premium_billing_records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_premium_billing_records_feature_key ON premium_billing_records(feature_key);
CREATE INDEX IF NOT EXISTS idx_premium_billing_records_status ON premium_billing_records(status);
CREATE INDEX IF NOT EXISTS idx_premium_billing_records_created_at ON premium_billing_records(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_premium_feature_usage_updated_at
    BEFORE UPDATE ON premium_feature_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_premium_purchases_updated_at
    BEFORE UPDATE ON premium_purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_premium_billing_records_updated_at
    BEFORE UPDATE ON premium_billing_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE premium_feature_usage IS 'Tracks usage of premium features per doctor per billing period';
COMMENT ON TABLE premium_purchases IS 'Records individual premium feature purchases (single and bundles)';
COMMENT ON TABLE premium_billing_records IS 'Records billing transactions for premium feature usage';
COMMENT ON COLUMN premium_feature_usage.feature_key IS 'Key identifier for the premium feature (e.g., image_analysis, clinical_copilot)';
COMMENT ON COLUMN premium_feature_usage.bundle_quantity IS 'Quantity of the bundle purchased';
COMMENT ON COLUMN premium_feature_usage.bundle_remaining IS 'Remaining uses in the bundle';
COMMENT ON COLUMN premium_purchases.purchase_type IS 'Type of purchase: single or bundle';
COMMENT ON COLUMN premium_billing_records.status IS 'Status of the billing record: pending, completed, failed, or refunded';
