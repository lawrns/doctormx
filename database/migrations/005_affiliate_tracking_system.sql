-- Affiliate Tracking System Migration
-- Enhanced affiliate system with detailed tracking and analytics

-- Create affiliate_tracking table for detailed analytics
CREATE TABLE IF NOT EXISTS affiliate_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES affiliate_users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('click', 'signup', 'consultation', 'payment', 'referral')),
    event_data JSONB DEFAULT '{}',
    user_ip INET,
    user_agent TEXT,
    referrer_url TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    conversion_value DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create affiliate_commissions table for commission tracking
CREATE TABLE IF NOT EXISTS affiliate_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES affiliate_users(id) ON DELETE CASCADE,
    referral_id UUID REFERENCES affiliate_referrals(id) ON DELETE CASCADE,
    commission_type TEXT NOT NULL CHECK (commission_type IN ('signup', 'consultation', 'subscription', 'recurring')),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'MXN',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
    payment_method TEXT,
    payment_reference TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create affiliate_marketing_materials table
CREATE TABLE IF NOT EXISTS affiliate_marketing_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES affiliate_users(id) ON DELETE CASCADE,
    material_type TEXT NOT NULL CHECK (material_type IN ('banner', 'social_post', 'email_template', 'landing_page')),
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    image_url TEXT,
    link_url TEXT,
    utm_parameters JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create affiliate_performance table for aggregated metrics
CREATE TABLE IF NOT EXISTS affiliate_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES affiliate_users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    clicks INTEGER DEFAULT 0,
    signups INTEGER DEFAULT 0,
    consultations INTEGER DEFAULT 0,
    payments INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    commissions DECIMAL(10,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(affiliate_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_tracking_affiliate_id ON affiliate_tracking(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_tracking_event_type ON affiliate_tracking(event_type);
CREATE INDEX IF NOT EXISTS idx_affiliate_tracking_created_at ON affiliate_tracking(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_tracking_utm_source ON affiliate_tracking(utm_source);

CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate_id ON affiliate_commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_status ON affiliate_commissions(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_created_at ON affiliate_commissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_affiliate_marketing_materials_affiliate_id ON affiliate_marketing_materials(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_marketing_materials_type ON affiliate_marketing_materials(material_type);
CREATE INDEX IF NOT EXISTS idx_affiliate_marketing_materials_active ON affiliate_marketing_materials(is_active);

CREATE INDEX IF NOT EXISTS idx_affiliate_performance_affiliate_id ON affiliate_performance(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_performance_date ON affiliate_performance(date DESC);

-- Enable RLS
ALTER TABLE affiliate_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_marketing_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliate_tracking
CREATE POLICY "Affiliates can view own tracking" ON affiliate_tracking
    FOR SELECT USING (
        affiliate_id IN (
            SELECT id FROM affiliate_users WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can create tracking events" ON affiliate_tracking
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all tracking" ON affiliate_tracking
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- RLS Policies for affiliate_commissions
CREATE POLICY "Affiliates can view own commissions" ON affiliate_commissions
    FOR SELECT USING (
        affiliate_id IN (
            SELECT id FROM affiliate_users WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage commissions" ON affiliate_commissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- RLS Policies for affiliate_marketing_materials
CREATE POLICY "Affiliates can manage own materials" ON affiliate_marketing_materials
    FOR ALL USING (
        affiliate_id IN (
            SELECT id FROM affiliate_users WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all materials" ON affiliate_marketing_materials
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- RLS Policies for affiliate_performance
CREATE POLICY "Affiliates can view own performance" ON affiliate_performance
    FOR SELECT USING (
        affiliate_id IN (
            SELECT id FROM affiliate_users WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all performance" ON affiliate_performance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Create triggers for updated_at
CREATE TRIGGER update_affiliate_commissions_updated_at 
    BEFORE UPDATE ON affiliate_commissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_marketing_materials_updated_at 
    BEFORE UPDATE ON affiliate_marketing_materials 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_performance_updated_at 
    BEFORE UPDATE ON affiliate_performance 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to track affiliate events
CREATE OR REPLACE FUNCTION track_affiliate_event(
    p_affiliate_id UUID,
    p_event_type TEXT,
    p_event_data JSONB DEFAULT '{}',
    p_user_ip INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_referrer_url TEXT DEFAULT NULL,
    p_utm_source TEXT DEFAULT NULL,
    p_utm_medium TEXT DEFAULT NULL,
    p_utm_campaign TEXT DEFAULT NULL,
    p_utm_term TEXT DEFAULT NULL,
    p_utm_content TEXT DEFAULT NULL,
    p_conversion_value DECIMAL DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
    tracking_id UUID;
BEGIN
    INSERT INTO affiliate_tracking (
        affiliate_id, event_type, event_data, user_ip, user_agent,
        referrer_url, utm_source, utm_medium, utm_campaign, utm_term, utm_content,
        conversion_value
    ) VALUES (
        p_affiliate_id, p_event_type, p_event_data, p_user_ip, p_user_agent,
        p_referrer_url, p_utm_source, p_utm_medium, p_utm_campaign, p_utm_term, p_utm_content,
        p_conversion_value
    ) RETURNING id INTO tracking_id;
    
    RETURN tracking_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update affiliate performance
CREATE OR REPLACE FUNCTION update_affiliate_performance(p_affiliate_id UUID, p_date DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO affiliate_performance (
        affiliate_id, date,
        clicks, signups, consultations, payments, revenue, commissions, conversion_rate
    )
    SELECT 
        p_affiliate_id,
        p_date,
        COUNT(CASE WHEN event_type = 'click' THEN 1 END) as clicks,
        COUNT(CASE WHEN event_type = 'signup' THEN 1 END) as signups,
        COUNT(CASE WHEN event_type = 'consultation' THEN 1 END) as consultations,
        COUNT(CASE WHEN event_type = 'payment' THEN 1 END) as payments,
        COALESCE(SUM(CASE WHEN event_type = 'payment' THEN conversion_value END), 0) as revenue,
        COALESCE(SUM(CASE WHEN event_type = 'payment' THEN conversion_value * 0.1 END), 0) as commissions,
        CASE 
            WHEN COUNT(CASE WHEN event_type = 'click' THEN 1 END) > 0 
            THEN (COUNT(CASE WHEN event_type = 'signup' THEN 1 END)::DECIMAL / COUNT(CASE WHEN event_type = 'click' THEN 1 END)) * 100
            ELSE 0 
        END as conversion_rate
    FROM affiliate_tracking
    WHERE affiliate_id = p_affiliate_id 
    AND DATE(created_at) = p_date
    ON CONFLICT (affiliate_id, date) DO UPDATE SET
        clicks = EXCLUDED.clicks,
        signups = EXCLUDED.signups,
        consultations = EXCLUDED.consultations,
        payments = EXCLUDED.payments,
        revenue = EXCLUDED.revenue,
        commissions = EXCLUDED.commissions,
        conversion_rate = EXCLUDED.conversion_rate,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate affiliate commission
CREATE OR REPLACE FUNCTION calculate_affiliate_commission(
    p_affiliate_id UUID,
    p_referral_id UUID,
    p_commission_type TEXT,
    p_amount DECIMAL
)
RETURNS UUID AS $$
DECLARE
    commission_id UUID;
    commission_rate DECIMAL DEFAULT 0.1; -- 10% default
BEGIN
    -- Get commission rate based on type
    CASE p_commission_type
        WHEN 'signup' THEN commission_rate := 0.05; -- 5% for signups
        WHEN 'consultation' THEN commission_rate := 0.15; -- 15% for consultations
        WHEN 'subscription' THEN commission_rate := 0.20; -- 20% for subscriptions
        WHEN 'recurring' THEN commission_rate := 0.10; -- 10% for recurring
        ELSE commission_rate := 0.10;
    END CASE;
    
    INSERT INTO affiliate_commissions (
        affiliate_id, referral_id, commission_type, amount, status
    ) VALUES (
        p_affiliate_id, p_referral_id, p_commission_type, p_amount * commission_rate, 'pending'
    ) RETURNING id INTO commission_id;
    
    RETURN commission_id;
END;
$$ LANGUAGE plpgsql;

-- Insert sample marketing materials
INSERT INTO affiliate_marketing_materials (affiliate_id, material_type, title, description, content, image_url, link_url, utm_parameters) 
SELECT 
    au.id,
    'banner',
    'Banner Doctor.mx - Consulta Médica',
    'Banner promocional para Doctor.mx',
    '¡Consulta médica 24/7 desde tu casa!',
    'https://doctor.mx/images/banner-728x90.jpg',
    'https://doctor.mx/register',
    '{"utm_source": "affiliate", "utm_medium": "banner", "utm_campaign": "doctor_mx"}'
FROM affiliate_users au
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert sample performance data
INSERT INTO affiliate_performance (affiliate_id, date, clicks, signups, consultations, payments, revenue, commissions, conversion_rate)
SELECT 
    au.id,
    CURRENT_DATE - INTERVAL '1 day',
    150,
    12,
    8,
    6,
    3000.00,
    300.00,
    8.0
FROM affiliate_users au
LIMIT 1
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL ON affiliate_tracking TO anon, authenticated;
GRANT ALL ON affiliate_commissions TO anon, authenticated;
GRANT ALL ON affiliate_marketing_materials TO anon, authenticated;
GRANT ALL ON affiliate_performance TO anon, authenticated;
GRANT EXECUTE ON FUNCTION track_affiliate_event TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_affiliate_performance TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_affiliate_commission TO anon, authenticated;
