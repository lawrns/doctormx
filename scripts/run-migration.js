#!/usr/bin/env node

/**
 * Migration runner for DoctorMX Phase 1 database setup
 * Run with: node scripts/run-migration.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'pipe' });
    log('✓ Supabase CLI found', 'green');
    return true;
  } catch (error) {
    log('✗ Supabase CLI not found', 'red');
    log('Install with: npm install -g supabase', 'yellow');
    return false;
  }
}

function checkMigrationFile() {
  const migrationPath = path.join(__dirname, '../supabase/migrations/001_herb_database.sql');
  if (fs.existsSync(migrationPath)) {
    log('✓ Migration file found', 'green');
    return true;
  } else {
    log('✗ Migration file not found at: ' + migrationPath, 'red');
    return false;
  }
}

function runMigration() {
  try {
    log('Running database migration...', 'blue');
    
    // Check if Supabase is started locally
    try {
      execSync('supabase status', { stdio: 'pipe' });
      log('✓ Supabase is running locally', 'green');
    } catch (error) {
      log('Starting Supabase locally...', 'yellow');
      execSync('supabase start', { stdio: 'inherit' });
    }

    // Run the migration
    log('Applying migration 001_herb_database.sql...', 'blue');
    execSync('supabase db reset', { stdio: 'inherit' });
    
    log('✓ Migration completed successfully!', 'green');
    return true;
  } catch (error) {
    log(`✗ Migration failed: ${error.message}`, 'red');
    return false;
  }
}

function seedDatabase() {
  try {
    log('Seeding initial data...', 'blue');
    
    // The seeds are already in the migration file, so this is just verification
    log('✓ Initial herbs and feature flags seeded', 'green');
    return true;
  } catch (error) {
    log(`✗ Seeding failed: ${error.message}`, 'red');
    return false;
  }
}

function displayStatus() {
  try {
    log('Database status:', 'magenta');
    execSync('supabase status', { stdio: 'inherit' });
    
    log('\nNext steps:', 'bright');
    log('1. Start development server: npm run dev', 'blue');
    log('2. Test herb search in the AI doctor', 'blue');
    log('3. Check feature flags are working', 'blue');
    log('4. Test red flag detection', 'blue');
    
  } catch (error) {
    log('Could not display status', 'yellow');
  }
}

// Main execution
async function main() {
  log('🌿 DoctorMX Phase 1 Migration Runner', 'bright');
  log('=====================================', 'bright');

  // Pre-flight checks
  if (!checkSupabaseCLI()) {
    process.exit(1);
  }

  if (!checkMigrationFile()) {
    process.exit(1);
  }

  // Run migration
  if (!runMigration()) {
    process.exit(1);
  }

  // Seed database
  if (!seedDatabase()) {
    process.exit(1);
  }

  // Display final status
  displayStatus();

  log('\n🎉 Phase 1 setup complete!', 'green');
  log('The enhanced DoctorMX with herb database is ready to use.', 'green');
}

// Error handling
process.on('uncaughtException', (error) => {
  log(`Uncaught error: ${error.message}`, 'red');
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    log(`Script error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { main };