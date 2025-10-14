import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Client } = pg;

async function checkSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Checking database schema...\n');
    await client.connect();

    // Check doctors table columns
    const doctorsSchema = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'doctors'
      ORDER BY ordinal_position;
    `);

    console.log('📋 DOCTORS TABLE COLUMNS:');
    doctorsSchema.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });

    // Check profiles table columns
    const profilesSchema = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles'
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 PROFILES TABLE COLUMNS:');
    profilesSchema.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });

    // Check providers table columns
    const providersSchema = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'providers'
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 PROVIDERS TABLE COLUMNS:');
    providersSchema.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkSchema();
