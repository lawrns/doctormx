-- Cache Optimization Migrations
-- Creates indexes for frequently queried columns and optimizes slow queries

-- Index for doctor status queries (used in discovery and search)
CREATE INDEX IF NOT EXISTS idx_doctors_status ON doctors(status);
CREATE INDEX IF NOT EXISTS idx_doctors_status_rating ON doctors(status, rating_avg DESC);

-- Index for specialty filtering
CREATE INDEX IF NOT EXISTS idx_doctor_specialties_doctor_id ON doctor_specialties(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_specialties_specialty_id ON doctor_specialties(specialty_id);

-- Index for location-based queries
CREATE INDEX IF NOT EXISTS idx_doctors_city_state ON doctors(city, state);

-- Index for price filtering
CREATE INDEX IF NOT EXISTS idx_doctors_price ON doctors(price_cents);

-- Index for subscription status (premium features)
CREATE INDEX IF NOT EXISTS idx_doctor_subscriptions_doctor_status ON doctor_subscriptions(doctor_id, status);

-- Index for appointment queries (availability)
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments(doctor_id, start_ts);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Index for profile queries
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- Materialized view for doctor search (refreshed on doctor changes)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_doctors_search AS
SELECT
  d.id,
  d.bio,
  d.price_cents,
  d.rating_avg,
  d.rating_count,
  d.city,
  d.state,
  d.years_experience,
  d.languages,
  d.status,
  p.full_name,
  p.photo_url,
  array_agg(DISTINCT s.slug) FILTER (WHERE s.slug IS NOT NULL) as specialty_slugs,
  array_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) as specialty_names
FROM doctors d
LEFT JOIN profiles p ON p.id = d.id
LEFT JOIN doctor_specialties ds ON ds.doctor_id = d.id
LEFT JOIN specialties s ON s.id = ds.specialty_id
WHERE d.status = 'approved'
GROUP BY d.id, p.full_name, p.photo_url, d.bio, d.price_cents, d.rating_avg, d.rating_count, d.city, d.state, d.years_experience, d.languages, d.status;

-- Index for materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_doctors_search_id ON mv_doctors_search(id);
CREATE INDEX IF NOT EXISTS idx_mv_doctors_search_city ON mv_doctors_search(city);
CREATE INDEX IF NOT EXISTS idx_mv_doctors_search_rating ON mv_doctors_search(rating_avg DESC);
CREATE INDEX IF NOT EXISTS idx_mv_doctors_search_price ON mv_doctors_search(price_cents);

-- Function to refresh materialized view (call after doctor inserts/updates)
CREATE OR REPLACE FUNCTION refresh_doctors_search_mv()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_doctors_search;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-refresh materialized view (uncomment if needed)
-- CREATE TRIGGER refresh_doctors_search
-- AFTER INSERT OR UPDATE ON doctors
-- FOR EACH ROW EXECUTE FUNCTION refresh_doctors_search_mv();

-- Optimize availability rules queries
CREATE INDEX IF NOT EXISTS idx_availability_rules_doctor_day ON availability_rules(doctor_id, day_of_week);

-- Function to invalidate cache on doctor update
CREATE OR REPLACE FUNCTION invalidate_doctor_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- This function is designed to work with application-level cache invalidation
  -- The application should listen for these changes and invalidate Redis cache
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic cache invalidation hints
-- Note: Actual cache invalidation is done via application logic using the API endpoints

-- Stats function for monitoring
CREATE OR REPLACE FUNCTION get_cache_stats()
RETURNS TABLE (
  cache_type text,
  entry_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'doctors'::text, COUNT(*)::bigint FROM mv_doctors_search
  UNION ALL
  SELECT 'appointments_today'::text, COUNT(*)::bigint FROM appointments
    WHERE DATE(start_ts) = CURRENT_DATE
    AND status IN ('pending_payment', 'confirmed');
END;
$$ LANGUAGE plpgsql;
