#!/usr/bin/env node
/**
 * Database Setup Script for Doctor.mx
 * This script will:
 * 1. Test the Supabase connection
 * 2. Check if tables exist
 * 3. Optionally run the migration
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('🔍 Testing Supabase connection...');
console.log(`URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    // Test basic query
    const { data, error } = await supabase.from('users').select('count').limit(1);

    if (error) {
      if (error.message.includes('relation "public.users" does not exist')) {
        console.log('⚠️  Database connected but tables do not exist yet');
        return 'no_tables';
      }
      throw error;
    }

    console.log('✅ Database connection successful!');
    console.log('✅ Tables already exist');
    return 'tables_exist';
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    throw error;
  }
}

async function checkTables() {
  try {
    const { data, error } = await supabase.rpc('pg_tables', {});

    const tables = [
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

    console.log('\n📊 Checking required tables...');

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('count').limit(1);
      if (error) {
        console.log(`❌ ${table} - NOT FOUND`);
      } else {
        console.log(`✅ ${table} - exists`);
      }
    }
  } catch (error) {
    console.log('⚠️  Could not check tables:', error.message);
  }
}

async function main() {
  console.log('🚀 Doctor.mx Database Setup\n');

  const status = await testConnection();

  if (status === 'no_tables') {
    console.log('\n📝 Next steps:');
    console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard/project/oxlbametpfubwnrmrbsv');
    console.log('2. Go to SQL Editor');
    console.log('3. Copy contents of: database/migrations/001_initial_schema.sql');
    console.log('4. Paste and run in SQL Editor');
    console.log('5. Run this script again to verify\n');
  } else if (status === 'tables_exist') {
    await checkTables();
    console.log('\n✅ Database is ready to use!');
    console.log('\n🎉 You can now start using Doctor.mx');
    console.log('   Frontend: http://localhost:5176');
    console.log('   Backend:  npm run dev:api\n');
  }
}

main().catch(console.error);
