-- Sponsored Visibility System - Doctors pay for featured placement in search results

CREATE TABLE IF NOT EXISTS sponsored_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL,
  city_slug TEXT NOT NULL,
  position INTEGER NOT NULL CHECK (position IN (1, 2, 3)),
  price_cents_per_day INTEGER NOT NULL DEFAULT 5000, -- $50 MXN/day
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(specialty, city_slug, position)
);

CREATE INDEX IF NOT EXISTS idx_sponsored_slots_market
  ON sponsored_slots(specialty, city_slug, status);

CREATE INDEX IF NOT EXISTS idx_sponsored_slots_doctor
  ON sponsored_slots(doctor_id, status);

ALTER TABLE sponsored_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active slots"
  ON sponsored_slots FOR SELECT
  USING (status = 'active');

CREATE POLICY "Doctors can view their own slots"
  ON sponsored_slots FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Service role can manage slots"
  ON sponsored_slots FOR ALL
  USING (true)
  WITH CHECK (true);
