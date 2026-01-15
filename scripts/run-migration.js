const fs = require('fs');
const path = require('path');

// Hardcoded credentials from .env.local
const SUPABASE_URL = 'https://oxlbametpfubwnrmrbsv.supabase.co';

async function runMigration() {
  console.log('🔄 Running database migration...\n');
  console.log(`🌐 Supabase URL: ${SUPABASE_URL}\n`);

  // Read migration file
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log(`📁 Migration file: ${migrationPath}`);
  console.log(`📊 SQL size: ${(sql.length / 1024).toFixed(1)} KB\n`);

  console.log('⚠️  Note: Supabase JS client cannot execute raw DDL SQL directly.');
  console.log('    You need to run this migration manually in Supabase SQL Editor.\n');
  console.log('📝 Manual Steps:');
  console.log('   1. Go to: https://supabase.com/dashboard/project/oxlbametpfubwnrmrbsv/sql/new');
  console.log('   2. Copy all content from: supabase/migrations/001_initial_schema.sql');
  console.log('   3. Paste in SQL Editor');
  console.log('   4. Click "Run"');
  console.log('\n✅ After running, your database will have:');
  console.log('   - All tables (profiles, doctors, appointments, payments, etc.)');
  console.log('   - Row Level Security policies');
  console.log('   - 10 medical specialties');
  console.log('   - Triggers and functions\n');

  process.exit(0);
}

runMigration();
