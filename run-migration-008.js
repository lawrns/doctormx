#!/usr/bin/env node
/**
 * Run Migration 008: Complete Doctor Profile Fields
 */

import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

const { Client } = pg;
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Read migration file
    const migrationSQL = fs.readFileSync('database/migrations/008_doctor_profile_completion.sql', 'utf8');
    
    console.log('📊 Running migration 008: Complete Doctor Profile Fields...\n');
    
    // Execute migration
    await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!\n');
    
    // Verify the changes
    console.log('🔍 Verifying new fields...');
    const schema = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'doctors'
      AND column_name IN ('education', 'certifications', 'experience_years', 'languages', 'graduation_year', 'location', 'total_reviews')
      ORDER BY column_name;
    `);
    
    console.log('New fields added:');
    schema.rows.forEach(row => {
      console.log(`  ✅ ${row.column_name}: ${row.data_type}`);
    });
    
    // Check sample data
    console.log('\n🔍 Sample updated doctor data...');
    const sample = await client.query('SELECT full_name, education, experience_years, languages, location FROM doctors LIMIT 1');
    if (sample.rows.length > 0) {
      console.log('Sample doctor:', JSON.stringify(sample.rows[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

runMigration();
