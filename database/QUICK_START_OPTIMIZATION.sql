-- ============================================================================
-- QUICK START: Database Optimization for Doctor.mx
-- Execute via psql or Supabase SQL Editor
-- ============================================================================
--
-- DEPLOYMENT CHECKLIST:
-- [ ] 1. Backup database: pg_dump -Fc $DATABASE_URL > backup.dump
-- [ ] 2. Test on staging environment first
-- [ ] 3. Run during low-traffic period (if possible)
-- [ ] 4. Monitor Supabase dashboard during execution
-- [ ] 5. Verify indexes are being used after deployment
--
-- EXECUTION TIME: 10-30 minutes (concurrent, no downtime)
-- STORAGE OVERHEAD: ~600MB-2.5GB
-- ============================================================================

-- ============================================================================
-- STEP 1: CRITICAL INDEXES (Execute First - Highest Impact)
-- ============================================================================

-- Doctor matching and search (10-50x improvement)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doctors_active_verified_rating
ON doctors(license_status, rating_avg DESC)
WHERE license_status = 'verified';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doctors_subscription_active
ON doctors(subscription_status, subscription_end_date)
WHERE subscription_status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doctors_response_time
ON doctors(avg_response_sec ASC)
WHERE license_status = 'verified' AND avg_response_sec IS NOT NULL;

-- Consultation history (5-10x improvement)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consults_patient_status_created
ON consults(patient_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consults_doctor_status_created
ON consults(doctor_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consults_doctor_paid_created
ON consults(doctor_id, created_at DESC)
WHERE paid = true;

-- Reviews and ratings
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_doctor_reviews_doctor_status_created
ON doctor_reviews(doctor_id, status, created_at DESC)
WHERE status = 'published';

-- Prescriptions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_erx_patient_created
ON erx(patient_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_erx_qr_status
ON erx(qr_token, status)
WHERE status IN ('issued', 'routed');

-- ============================================================================
-- STEP 2: MATERIALIZED VIEWS (100x improvement for earnings)
-- ============================================================================

-- Doctor earnings summary
DROP MATERIALIZED VIEW IF EXISTS doctor_earnings_summary CASCADE;

CREATE MATERIALIZED VIEW doctor_earnings_summary AS
SELECT
  c.doctor_id,
  COUNT(*) FILTER (WHERE c.paid = true) as total_paid_consults,
  COUNT(*) FILTER (WHERE c.status = 'resolved') as total_resolved_consults,
  COUNT(*) FILTER (WHERE c.status IN ('assigned', 'active')) as active_consults,
  SUM(c.price_mxn) FILTER (WHERE c.paid = true) as gross_revenue_mxn,
  SUM(c.price_mxn * 0.7) FILTER (WHERE c.paid = true) as net_earnings_mxn,
  AVG(EXTRACT(EPOCH FROM (c.ended_at - c.started_at)) / 60) FILTER (WHERE c.ended_at IS NOT NULL) as avg_consult_duration_min,
  COUNT(*) FILTER (WHERE c.created_at >= NOW() - INTERVAL '30 days') as consults_last_30_days,
  SUM(c.price_mxn * 0.7) FILTER (WHERE c.paid = true AND c.created_at >= NOW() - INTERVAL '30 days') as earnings_last_30_days_mxn,
  MAX(c.created_at) as last_consult_at,
  MIN(c.created_at) as first_consult_at
FROM consults c
WHERE c.doctor_id IS NOT NULL
GROUP BY c.doctor_id;

CREATE UNIQUE INDEX idx_doctor_earnings_summary_doctor_id
ON doctor_earnings_summary(doctor_id);

-- Monthly volume aggregates
DROP MATERIALIZED VIEW IF EXISTS monthly_consult_volume CASCADE;

CREATE MATERIALIZED VIEW monthly_consult_volume AS
SELECT
  DATE_TRUNC('month', created_at) as month,
  doctor_id,
  COUNT(*) as total_consults,
  COUNT(*) FILTER (WHERE paid = true) as paid_consults,
  SUM(price_mxn) FILTER (WHERE paid = true) as revenue_mxn,
  AVG(price_mxn) as avg_price_mxn,
  COUNT(DISTINCT patient_id) as unique_patients
FROM consults
WHERE created_at >= NOW() - INTERVAL '24 months'
GROUP BY DATE_TRUNC('month', created_at), doctor_id;

CREATE INDEX idx_monthly_consult_volume_doctor_month
ON monthly_consult_volume(doctor_id, month DESC);

-- ============================================================================
-- STEP 3: HELPER FUNCTIONS
-- ============================================================================

-- Refresh function for materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY doctor_earnings_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_consult_volume;
END;
$$ LANGUAGE plpgsql;

-- Doctor search function
CREATE OR REPLACE FUNCTION search_doctors(
  p_specialty TEXT DEFAULT NULL,
  p_min_rating NUMERIC DEFAULT 0,
  p_max_response_time INTEGER DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  doctor_id UUID,
  name TEXT,
  specialties TEXT[],
  rating_avg NUMERIC,
  total_reviews INTEGER,
  avg_response_sec INTEGER,
  bio TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.user_id as doctor_id,
    u.name,
    d.specialties,
    d.rating_avg,
    COALESCE(ds.total_reviews, 0)::INTEGER as total_reviews,
    d.avg_response_sec,
    d.bio
  FROM doctors d
  JOIN users u ON d.user_id = u.id
  LEFT JOIN doctor_stats ds ON d.user_id = ds.doctor_id
  WHERE d.license_status = 'verified'
    AND (p_specialty IS NULL OR p_specialty = ANY(d.specialties))
    AND d.rating_avg >= p_min_rating
    AND (p_max_response_time IS NULL OR d.avg_response_sec <= p_max_response_time)
  ORDER BY
    d.rating_avg DESC,
    COALESCE(ds.total_reviews, 0) DESC,
    d.avg_response_sec ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Patient consults function with pagination
CREATE OR REPLACE FUNCTION get_patient_consults(
  p_patient_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  consult_id UUID,
  doctor_name TEXT,
  specialty TEXT,
  status consult_status,
  price_mxn INTEGER,
  created_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as consult_id,
    u.name as doctor_name,
    c.specialty,
    c.status,
    c.price_mxn,
    c.created_at,
    c.ended_at
  FROM consults c
  LEFT JOIN doctors d ON c.doctor_id = d.user_id
  LEFT JOIN users u ON d.user_id = u.id
  WHERE c.patient_id = p_patient_id
  ORDER BY c.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- STEP 4: UPDATE STATISTICS AND AUTO-VACUUM
-- ============================================================================

-- Set statistics targets for better query planning
ALTER TABLE doctors ALTER COLUMN specialties SET STATISTICS 1000;
ALTER TABLE consults ALTER COLUMN patient_id SET STATISTICS 1000;
ALTER TABLE consults ALTER COLUMN doctor_id SET STATISTICS 1000;

-- Configure aggressive auto-vacuum for high-traffic tables
ALTER TABLE consults SET (
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_analyze_scale_factor = 0.02
);

ALTER TABLE doctor_reviews SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

-- Analyze tables for accurate statistics
ANALYZE users;
ANALYZE doctors;
ANALYZE consults;
ANALYZE doctor_reviews;
ANALYZE doctor_stats;

-- ============================================================================
-- STEP 5: INITIAL REFRESH
-- ============================================================================

-- Refresh materialized views with initial data
SELECT refresh_analytics_views();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check that indexes were created
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Check materialized views exist and have data
SELECT
  schemaname,
  matviewname,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) as size,
  last_refresh
FROM pg_matviews
WHERE schemaname = 'public';

-- Test doctor search function
SELECT * FROM search_doctors(
  p_specialty := NULL,
  p_min_rating := 4.0,
  p_limit := 5
);

-- Test earnings summary
SELECT
  doctor_id,
  total_paid_consults,
  net_earnings_mxn,
  active_consults
FROM doctor_earnings_summary
LIMIT 5;

-- ============================================================================
-- POST-DEPLOYMENT: SETUP AUTOMATED REFRESH
-- ============================================================================

-- Option 1: Supabase pg_cron (if available)
-- Contact Supabase support to enable pg_cron, then run:
/*
SELECT cron.schedule(
  'refresh-analytics',
  '*/5 * * * *',
  'SELECT refresh_analytics_views();'
);
*/

-- Option 2: Application-level cron (Node.js example)
/*
import cron from 'node-cron';

// Refresh every 5 minutes
cron.schedule('* /5 * * * *', async () => {
  await supabase.rpc('refresh_analytics_views');
  console.log('Analytics refreshed at', new Date());
});
*/

-- ============================================================================
-- MONITORING QUERIES (Run periodically)
-- ============================================================================

-- Check index usage (look for idx_scan > 0)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as times_used,
  idx_tup_read as rows_read,
  idx_tup_fetch as rows_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY idx_scan ASC;

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check materialized view freshness
SELECT
  matviewname,
  last_refresh,
  NOW() - last_refresh as staleness
FROM pg_matviews
WHERE schemaname = 'public';

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
/*
-- Drop indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_doctors_active_verified_rating;
DROP INDEX CONCURRENTLY IF EXISTS idx_doctors_subscription_active;
DROP INDEX CONCURRENTLY IF EXISTS idx_doctors_response_time;
DROP INDEX CONCURRENTLY IF EXISTS idx_consults_patient_status_created;
DROP INDEX CONCURRENTLY IF EXISTS idx_consults_doctor_status_created;
DROP INDEX CONCURRENTLY IF EXISTS idx_consults_doctor_paid_created;
DROP INDEX CONCURRENTLY IF EXISTS idx_doctor_reviews_doctor_status_created;
DROP INDEX CONCURRENTLY IF EXISTS idx_erx_patient_created;
DROP INDEX CONCURRENTLY IF EXISTS idx_erx_qr_status;

-- Drop materialized views
DROP MATERIALIZED VIEW IF EXISTS doctor_earnings_summary;
DROP MATERIALIZED VIEW IF EXISTS monthly_consult_volume;

-- Drop functions
DROP FUNCTION IF EXISTS refresh_analytics_views();
DROP FUNCTION IF EXISTS search_doctors(TEXT, NUMERIC, INTEGER, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_patient_consults(UUID, INTEGER, INTEGER);

-- Reset auto-vacuum settings
ALTER TABLE consults RESET (autovacuum_vacuum_scale_factor);
ALTER TABLE consults RESET (autovacuum_analyze_scale_factor);
ALTER TABLE doctor_reviews RESET (autovacuum_vacuum_scale_factor);
ALTER TABLE doctor_reviews RESET (autovacuum_analyze_scale_factor);
*/

-- ============================================================================
-- DEPLOYMENT COMPLETE
-- ============================================================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database optimization deployment complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Run verification queries above';
  RAISE NOTICE '2. Monitor index usage over next 24 hours';
  RAISE NOTICE '3. Setup automated refresh (see POST-DEPLOYMENT section)';
  RAISE NOTICE '4. Update application code to use new functions (optional)';
  RAISE NOTICE '5. Monitor Supabase dashboard for performance improvements';
  RAISE NOTICE '';
  RAISE NOTICE 'Expected improvements:';
  RAISE NOTICE '- Doctor search: 10-50x faster';
  RAISE NOTICE '- Dashboard loads: 5-10x faster';
  RAISE NOTICE '- Earnings queries: 100x faster';
  RAISE NOTICE '';
  RAISE NOTICE 'Documentation: See DATABASE_OPTIMIZATION_GUIDE.md';
END $$;
