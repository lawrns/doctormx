-- Analytics Tables Migration
-- Creates tables for tracking analytics events and daily aggregations

-- Analytics Events Table - Track individual events for detailed analysis
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    user_id UUID,
    user_role VARCHAR(20),
    session_id VARCHAR(255),
    page_path VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Aggregations Table - Pre-computed daily metrics for fast dashboard loading
CREATE TABLE IF NOT EXISTS analytics_daily_aggregations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    metric_type VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    dimension JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, metric_type, dimension)
);

-- Create indexes for analytics tables
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_date ON analytics_daily_aggregations(date);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_metric ON analytics_daily_aggregations(metric_type);

-- Function to insert analytics event
CREATE OR REPLACE FUNCTION track_analytics_event(
    p_event_type VARCHAR,
    p_user_id UUID,
    p_user_role VARCHAR,
    p_session_id VARCHAR,
    p_page_path VARCHAR,
    p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO analytics_events (
        event_type,
        user_id,
        user_role,
        session_id,
        page_path,
        metadata
    ) VALUES (
        p_event_type,
        p_user_id,
        p_user_role,
        p_session_id,
        p_page_path,
        p_metadata
    ) RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update daily aggregation
CREATE OR REPLACE FUNCTION update_daily_aggregation(
    p_date DATE,
    p_metric_type VARCHAR,
    p_value NUMERIC,
    p_dimension JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
    INSERT INTO analytics_daily_aggregations (date, metric_type, metric_value, dimension)
    VALUES (p_date, p_metric_type, p_value, p_dimension)
    ON CONFLICT (date, metric_type, dimension)
    DO UPDATE SET 
        metric_value = analytics_daily_aggregations.metric_value + p_value,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-track page views
CREATE OR REPLACE FUNCTION track_page_view_event()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_user_role VARCHAR;
BEGIN
    -- Try to get user info from session
    -- This is a simplified version - in production you'd check auth context
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- View for admin dashboard metrics
CREATE OR REPLACE VIEW v_admin_metrics AS
SELECT 
    DATE(p.created_at) as date,
    COUNT(DISTINCT p.id) as total_payments,
    SUM(p.amount_cents) / 100 as total_revenue,
    COUNT(DISTINCT a.id) as total_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) as completed_appointments,
    COUNT(DISTINCT d.id) as active_doctors,
    COUNT(DISTINCT pf.id) as total_patients
FROM payments p
LEFT JOIN appointments a ON a.id = p.appointment_id
LEFT JOIN doctors d ON d.id = a.doctor_id AND d.status = 'approved'
LEFT JOIN profiles pf ON pf.role = 'patient'
WHERE p.status = 'paid'
GROUP BY DATE(p.created_at)
ORDER BY date DESC;

-- View for doctor dashboard metrics
CREATE OR REPLACE VIEW v_doctor_metrics AS
SELECT 
    a.doctor_id,
    DATE(a.start_ts) as date,
    COUNT(DISTINCT a.id) as total_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) as completed_appointments,
    COUNT(DISTINCT CASE WHEN a.status IN ('cancelled', 'no_show') THEN a.id END) as cancelled_no_show,
    SUM(p.amount_cents - p.fee_cents) / 100 as net_revenue,
    AVG(r.rating) as avg_rating
FROM appointments a
LEFT JOIN payments p ON p.appointment_id = a.id AND p.status = 'paid'
LEFT JOIN reviews r ON r.doctor_id = a.doctor_id
WHERE a.doctor_id IS NOT NULL
GROUP BY a.doctor_id, DATE(a.start_ts);

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION track_analytics_event TO authenticated, anon;
GRANT EXECUTE ON FUNCTION update_daily_aggregation TO authenticated, anon;
