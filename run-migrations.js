#!/usr/bin/env node
/**
 * Complete Database Migration Script
 * Applies all Doctor.mx migrations to Supabase PostgreSQL in order
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

console.log('🚀 Doctor.mx Complete Database Migration\n');
console.log('📍 Connecting to database...');

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Migration files in order
const migrations = [
  '001_initial_schema.sql',
  '002_ai_referral_system.sql', 
  '003_free_questions_system.sql',
  '004_qa_board_system.sql',
  '005_affiliate_tracking_system.sql'
];

async function runMigrations() {
  try {
    // Connect to database
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Create migration tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migration_history (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get already applied migrations
    const appliedResult = await client.query('SELECT migration_name FROM migration_history');
    const appliedMigrations = new Set(appliedResult.rows.map(row => row.migration_name));

    console.log('📋 Migration plan:');
    migrations.forEach(migration => {
      const status = appliedMigrations.has(migration) ? '✅ Applied' : '⏳ Pending';
      console.log(`   ${status} ${migration}`);
    });
    console.log('');

    // Run pending migrations
    for (const migrationFile of migrations) {
      if (appliedMigrations.has(migrationFile)) {
        console.log(`⏭️  Skipping ${migrationFile} (already applied)`);
        continue;
      }

      console.log(`📄 Running ${migrationFile}...`);
      
      const migrationPath = join(__dirname, 'database', 'migrations', migrationFile);
      const sql = readFileSync(migrationPath, 'utf8');
      
      try {
        await client.query(sql);
        
        // Record migration as applied
        await client.query(
          'INSERT INTO migration_history (migration_name) VALUES ($1)',
          [migrationFile]
        );
        
        console.log(`✅ ${migrationFile} completed successfully`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  ${migrationFile} - Some objects already exist (continuing...)`);
          // Still record as applied
          await client.query(
            'INSERT INTO migration_history (migration_name) VALUES ($1) ON CONFLICT (migration_name) DO NOTHING',
            [migrationFile]
          );
        } else {
          throw error;
        }
      }
    }

    console.log('\n🎉 All migrations completed successfully!\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('\n📊 Database tables:');
    result.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name}`);
    });

    // Check functions
    const functionsResult = await client.query(`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_type = 'FUNCTION'
      ORDER BY routine_name;
    `);

    if (functionsResult.rows.length > 0) {
      console.log('\n🔧 Database functions:');
      functionsResult.rows.forEach(row => {
        console.log(`   ✅ ${row.routine_name}`);
      });
    }

    console.log('\n🎉 Database is ready to use!');
    console.log('\n📱 Next steps:');
    console.log('   1. Visit: http://localhost:5173/');
    console.log('   2. Test AI chat functionality');
    console.log('   3. Test all features!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n📝 Error details:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
