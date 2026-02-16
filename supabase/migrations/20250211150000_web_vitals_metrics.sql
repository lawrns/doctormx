-- Migration: Create web_vitals_metrics table for Core Web Vitals tracking
-- Created: 2025-02-11
-- Description: Stores Web Vitals metrics for performance monitoring

CREATE TABLE IF NOT EXISTS web_vitals_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(10) NOT NULL CHECK (name IN ('CLS', 'FCP', 'LCP', 'TTFB', 'INP')),
    value DOUBLE PRECISION NOT NULL,
    rating VARCHAR(20) CHECK (rating IN ('good', 'needs-improvement', 'poor')),
    delta DOUBLE PRECISION,
    navigation_type VARCHAR(20) CHECK (navigation_type IN ('navigate', 'reload', 'back-forward', 'prerender', 'restore')),
    page_path TEXT,
    user_agent TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_web_vitals_name ON web_vitals_metrics(name);
CREATE INDEX IF NOT EXISTS idx_web_vitals_timestamp ON web_vitals_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_web_vitals_page_path ON web_vitals_metrics(page_path);
CREATE INDEX IF NOT EXISTS idx_web_vitals_rating ON web_vitals_metrics(rating);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_web_vitals_name_timestamp ON web_vitals_metrics(name, timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE web_vitals_metrics ENABLE ROW LEVEL SECURITY;

-- Only allow inserts from the service role (server-side)
CREATE POLICY "Allow service role inserts" ON web_vitals_metrics
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Allow admins to read all metrics
CREATE POLICY "Allow admin reads" ON web_vitals_metrics
    FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- Enable realtime for live monitoring (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE web_vitals_metrics;

-- Add table comment
COMMENT ON TABLE web_vitals_metrics IS 'Stores Core Web Vitals metrics collected from user browsers for performance monitoring';

-- Create a view for daily aggregates
CREATE OR REPLACE VIEW web_vitals_daily_summary AS
SELECT 
    name,
    DATE(timestamp) as date,
    COUNT(*) as count,
    AVG(value) as avg_value,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) as p50,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value) as p75,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) as p95,
    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY value) as p99,
    COUNT(*) FILTER (WHERE rating = 'good') as good_count,
    COUNT(*) FILTER (WHERE rating = 'needs-improvement') as needs_improvement_count,
    COUNT(*) FILTER (WHERE rating = 'poor') as poor_count
FROM web_vitals_metrics
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY name, DATE(timestamp)
ORDER BY date DESC, name;

COMMENT ON VIEW web_vitals_daily_summary IS 'Daily aggregated Web Vitals metrics for dashboards';
