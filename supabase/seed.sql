-- Seed data for Doctory development/testing
-- Idempotent: safe to run multiple times
BEGIN;

-- ================================================
-- SPECIALTIES
-- ================================================
DELETE FROM specialties WHERE id IN (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000011'
);

INSERT INTO specialties (id, name, slug, description) VALUES
  ('00000000-0000-0000-0000-000000000010', 'Medicina General', 'medicina-general', 'Consulta médica general y prevención'),
  ('00000000-0000-0000-0000-000000000011', 'Cardiología', 'cardiologia', 'Enfermedades del corazón y sistema cardiovascular');

-- ================================================
-- PROFILES
-- ================================================
DELETE FROM profiles WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005'
);

INSERT INTO profiles (id, role, full_name, phone) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin', 'Admin Doctory', '+5215510000001'),
  ('00000000-0000-0000-0000-000000000002', 'doctor', 'Dr. Juan Pérez', '+5215510000002'),
  ('00000000-0000-0000-0000-000000000003', 'doctor', 'Dra. María García', '+5215510000003'),
  ('00000000-0000-0000-0000-000000000004', 'patient', 'Carlos López', '+5215510000004'),
  ('00000000-0000-0000-0000-000000000005', 'patient', 'Ana Martínez', '+5215510000005');

-- ================================================
-- DOCTORS
-- ================================================
DELETE FROM doctors WHERE id IN (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003'
);

INSERT INTO doctors (id, status, bio, languages, license_number, years_experience, city, state, country, price_cents, currency, video_enabled, accepts_insurance, is_listed, rating_avg, rating_count)
VALUES
  (
    '00000000-0000-0000-0000-000000000002',
    'approved',
    'Médico general con 10 años de experiencia en atención primaria.',
    ARRAY['es', 'en'],
    'LIC-12345',
    10,
    'Ciudad de México',
    'CDMX',
    'MX',
    50000,
    'MXN',
    true,
    true,
    true,
    4.50,
    24
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'pending',
    'Cardióloga especialista en prevención y rehabilitación cardíaca.',
    ARRAY['es'],
    'LIC-67890',
    5,
    'Monterrey',
    'Nuevo León',
    'MX',
    80000,
    'MXN',
    false,
    false,
    false,
    0,
    0
  );

-- ================================================
-- DOCTOR SPECIALTIES
-- ================================================
DELETE FROM doctor_specialties WHERE (doctor_id, specialty_id) IN (
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000011')
);

INSERT INTO doctor_specialties (doctor_id, specialty_id) VALUES
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000011');

-- ================================================
-- APPOINTMENTS
-- ================================================
DELETE FROM appointments WHERE id IN ('00000000-0000-0000-0000-000000000020');

INSERT INTO appointments (id, doctor_id, patient_id, start_ts, end_ts, status, reason_for_visit)
VALUES (
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000004',
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day' + INTERVAL '30 minutes',
  'confirmed',
  'Consulta general de rutina'
);

-- ================================================
-- DOCTOR SUBSCRIPTIONS
-- ================================================
DELETE FROM doctor_subscriptions WHERE id IN ('00000000-0000-0000-0000-000000000030');

INSERT INTO doctor_subscriptions (id, doctor_id, plan_name, plan_price_cents, status, current_period_start, current_period_end)
VALUES (
  '00000000-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000002',
  'Profesional',
  29900,
  'active',
  DATE_TRUNC('month', NOW()),
  DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
);

COMMIT;
