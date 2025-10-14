#!/usr/bin/env node
/**
 * Database Migration Script
 * Applies the Doctor.mx schema to Supabase PostgreSQL
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

console.log('🚀 Doctor.mx Database Migration\n');
console.log('📍 Connecting to database...');

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    // Connect to database
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Read migration file (safe version)
    const migrationPath = join(__dirname, 'database', 'migrations', '001_initial_schema_safe.sql');
    console.log('📄 Reading safe migration file...');
    const sql = readFileSync(migrationPath, 'utf8');
    console.log(`✅ Loaded migration (${sql.length} characters)\n`);

    // Execute migration
    console.log('⚡ Running migration...');
    console.log('This may take 10-20 seconds...\n');

    await client.query(sql);

    console.log('✅ Migration completed successfully!\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('\n📊 Created tables:');
    result.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name}`);
    });

    console.log('\n🎉 Database is ready to use!');
    console.log('\n📱 Next steps:');
    console.log('   1. Visit: http://localhost:5176/');
    console.log('   2. Register a new user');
    console.log('   3. Start testing the app!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);

    if (error.message.includes('already exists')) {
      console.log('\n⚠️  Tables already exist. This is fine!');
      console.log('   Your database is already set up.\n');
    } else {
      console.error('\n📝 Error details:', error);
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

runMigration();
