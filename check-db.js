#!/usr/bin/env node
/**
 * Check Database Status
 */

import pg from 'pg';
import dotenv from 'dotenv';

const { Client } = pg;
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkDatabase() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Check tables
    console.log('📊 Checking tables...\n');
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const requiredTables = [
      'users',
      'doctors',
      'pharmacies',
      'referrals',
      'consults',
      'payments',
      'erx',
      'pharmacy_fills',
      'credits_ledger',
      'audit_trail'
    ];

    const existingTables = tables.rows.map(r => r.table_name);

    console.log('Required Tables Status:');
    requiredTables.forEach(table => {
      const exists = existingTables.includes(table);
      console.log(`  ${exists ? '✅' : '❌'} ${table}`);
    });

    console.log('\nOther Tables:');
    existingTables.forEach(table => {
      if (!requiredTables.includes(table)) {
        console.log(`  ℹ️  ${table}`);
      }
    });

    // Check if we can query users table
    console.log('\n🔍 Testing users table...');
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    console.log(`  Users in database: ${userCount.rows[0].count}`);

    console.log('\n🎉 Database is ready to use!');
    console.log('\n📱 Next steps:');
    console.log('   1. Visit: http://localhost:5176/');
    console.log('   2. Register a new user');
    console.log('   3. Start testing!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkDatabase();
