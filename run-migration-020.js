import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    console.log('📊 Running migration 020: Onboarding Completion Fields...\n');
    const migrationSql = await fs.readFile(path.join(__dirname, 'database/migrations/020_onboarding_completion.sql'), 'utf8');
    await client.query(migrationSql);
    console.log('✅ Migration completed successfully!\n');

    console.log('🔍 Verifying new fields...');
    const schemaCheck = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'doctors' AND column_name IN ('onboarding_completed', 'onboarding_completed_at', 'subscription_trial_end', 'notification_preferences', 'verification_data');
    `);
    console.log('New fields added to doctors table:');
    schemaCheck.rows.forEach(row => console.log(`  ✅ ${row.column_name}: ${row.data_type}`));

    console.log('\n🔍 Verifying new tables...');
    const tablesCheck = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name IN ('subscription_events', 'doctor_verifications', 'onboarding_analytics');
    `);
    console.log('New tables created:');
    tablesCheck.rows.forEach(row => console.log(`  ✅ ${row.table_name}`));

    console.log('\n🔍 Verifying indexes...');
    const indexesCheck = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename IN ('doctors', 'subscription_events', 'doctor_verifications', 'onboarding_analytics')
      AND indexname LIKE 'idx_%';
    `);
    console.log('New indexes created:');
    indexesCheck.rows.forEach(row => console.log(`  ✅ ${row.indexname}`));

    console.log('\n🔍 Sample updated doctor data...');
    const sampleDoctor = await client.query(`
      SELECT user_id, onboarding_completed, subscription_status, verification_status, license_status FROM doctors LIMIT 1;
    `);
    if (sampleDoctor.rows.length > 0) {
      console.log('Sample doctor:', sampleDoctor.rows[0]);
    } else {
      console.log('No doctors found to display sample data.');
    }

  } catch (error) {
    console.error('❌ Error running migration:', error.message);
  } finally {
    await client.end();
  }
}

runMigration();
