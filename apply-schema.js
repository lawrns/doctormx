#!/usr/bin/env node
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

await client.connect();
console.log('✅ Connected\n');

try {
  // Create enums
  const enums = [
    ["dm_license_status", "('pending', 'verified', 'rejected')"],
    ["dm_consult_status", "('triage', 'assigned', 'active', 'resolved', 'er_redirect', 'cancelled')"],
    ["dm_consult_channel", "('whatsapp', 'web', 'video')"],
    ["dm_payment_provider", "('stripe', 'conekta', 'openpay')"],
    ["dm_payment_method", "('card', 'spei', 'oxxo', 'codi')"],
    ["dm_payment_status", "('requires_action', 'succeeded', 'refunded', 'failed')"],
    ["dm_erx_status", "('issued', 'routed', 'filled', 'cancelled')"],
    ["dm_pharmacy_fill_status", "('received', 'ready', 'delivered')"],
    ["dm_referral_source", "('whatsapp', 'qr', 'doctor', 'employer', 'university')"],
    ["dm_credit_reason", "('referral_earned', 'referral_spent', 'promo', 'refund')"]
  ];

  for (const [name, values] of enums) {
    try {
      await client.query(`CREATE TYPE ${name} AS ENUM ${values}`);
      console.log(`✅ Created enum: ${name}`);
    } catch (e) {
      if (e.code === '42710') console.log(`⏭️  Enum exists: ${name}`);
      else throw e;
    }
  }

  // Create tables
  console.log('\n📊 Creating tables...\n');

  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      role user_role NOT NULL DEFAULT 'patient',
      phone TEXT UNIQUE,
      email TEXT UNIQUE,
      name TEXT,
      whatsapp_optin BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('✅ users');

  await client.query(`
    CREATE TABLE IF NOT EXISTS doctors (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      cedula TEXT UNIQUE NOT NULL,
      specialties TEXT[] NOT NULL DEFAULT '{}',
      license_status dm_license_status NOT NULL DEFAULT 'pending',
      kpis JSONB DEFAULT '{}',
      payout_account JSONB,
      calendar JSONB,
      bio TEXT,
      avg_response_sec INTEGER DEFAULT 0,
      rating_avg NUMERIC(3,2) DEFAULT 5.0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('✅ doctors');

  await client.query(`
    CREATE TABLE IF NOT EXISTS pharmacies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      store_id TEXT UNIQUE NOT NULL,
      address TEXT,
      qr_code TEXT UNIQUE,
      contact_phone TEXT,
      revshare_percent NUMERIC(4,2) DEFAULT 10.0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('✅ pharmacies');

  await client.query(`
    CREATE TABLE IF NOT EXISTS referrals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      source dm_referral_source NOT NULL,
      source_id TEXT,
      ref_code TEXT UNIQUE,
      patient_id UUID REFERENCES users(id) ON DELETE SET NULL,
      attribution JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('✅ referrals');

  await client.query(`
    CREATE TABLE IF NOT EXISTS consults (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      doctor_id UUID REFERENCES doctors(user_id) ON DELETE SET NULL,
      channel dm_consult_channel NOT NULL DEFAULT 'whatsapp',
      status dm_consult_status NOT NULL DEFAULT 'triage',
      price_mxn INTEGER NOT NULL DEFAULT 79,
      paid BOOLEAN DEFAULT false,
      specialty TEXT,
      red_flags TEXT[] DEFAULT '{}',
      triage JSONB,
      notes JSONB,
      started_at TIMESTAMPTZ,
      ended_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('✅ consults');

  await client.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      consult_id UUID NOT NULL REFERENCES consults(id) ON DELETE CASCADE,
      provider dm_payment_provider NOT NULL,
      method dm_payment_method NOT NULL,
      amount_mxn INTEGER NOT NULL,
      fee_split JSONB,
      status dm_payment_status NOT NULL DEFAULT 'requires_action',
      cfdi JSONB,
      provider_payment_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('✅ payments');

  await client.query(`
    CREATE TABLE IF NOT EXISTS erx (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      consult_id UUID NOT NULL REFERENCES consults(id) ON DELETE CASCADE,
      doctor_id UUID NOT NULL REFERENCES doctors(user_id) ON DELETE CASCADE,
      patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      payload JSONB NOT NULL,
      controlled BOOLEAN DEFAULT false,
      status dm_erx_status NOT NULL DEFAULT 'issued',
      pdf_url TEXT,
      xml_url TEXT,
      qr_token TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('✅ erx');

  await client.query(`
    CREATE TABLE IF NOT EXISTS pharmacy_fills (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      erx_id UUID NOT NULL REFERENCES erx(id) ON DELETE CASCADE,
      pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
      status dm_pharmacy_fill_status NOT NULL DEFAULT 'received',
      prices JSONB,
      delivery_eta_minutes INTEGER,
      events JSONB DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('✅ pharmacy_fills');

  await client.query(`
    CREATE TABLE IF NOT EXISTS credits_ledger (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      delta_mxn INTEGER NOT NULL,
      reason dm_credit_reason NOT NULL,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('✅ credits_ledger');

  await client.query(`
    CREATE TABLE IF NOT EXISTS audit_trail (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      entity TEXT NOT NULL,
      entity_id UUID,
      action TEXT NOT NULL,
      diff JSONB,
      ip TEXT,
      ua TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('✅ audit_trail');

  // Seed data
  await client.query(`
    INSERT INTO pharmacies (name, store_id, qr_code, address, contact_phone) VALUES
      ('Farmacia Piloto Centro', 'PILOTO-001', 'QR-PILOTO-001', 'Av. Centro 123, Ciudad de México', '+52-555-0001'),
      ('Farmacia Piloto Norte', 'PILOTO-002', 'QR-PILOTO-002', 'Av. Norte 456, Ciudad de México', '+52-555-0002')
    ON CONFLICT (store_id) DO NOTHING
  `);

  console.log('\n🎉 Database ready!');
  console.log('📱 Visit: http://localhost:5176/\n');

} catch (e) {
  console.error('❌ Error:', e.message);
} finally {
  await client.end();
}
