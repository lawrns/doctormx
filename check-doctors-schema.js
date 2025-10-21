#!/usr/bin/env node
/**
 * Check Doctors Table Schema
 */

import pg from 'pg';
import dotenv from 'dotenv';

const { Client } = pg;
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkDoctorsSchema() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Check doctors table schema
    console.log('📊 Checking doctors table schema...\n');
    const schema = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'doctors'
      ORDER BY ordinal_position;
    `);

    console.log('Doctors Table Columns:');
    schema.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
    });

    // Check sample data
    console.log('\n🔍 Sample doctor data...');
    const sample = await client.query('SELECT * FROM doctors LIMIT 1');
    if (sample.rows.length > 0) {
      console.log('Sample doctor:', JSON.stringify(sample.rows[0], null, 2));
    } else {
      console.log('No doctors found in database');
    }

    // Check total count
    const count = await client.query('SELECT COUNT(*) FROM doctors');
    console.log(`\nTotal doctors: ${count.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkDoctorsSchema();
