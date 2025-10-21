#!/usr/bin/env node

import { SCRAPER_CONFIG, TEST_CONFIG, FULL_CONFIG, USAGE_INSTRUCTIONS } from './scraper-config.js';

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

console.log('🇲🇽 Doctoralia Scraper Launcher');
console.log('===============================');

switch (command) {
  case 'test':
    console.log('🧪 Starting TEST scraper...');
    console.log(`📊 Test scope: ${TEST_CONFIG.TEST_LOCATIONS.length} locations × ${TEST_CONFIG.TEST_SPECIALTIES.length} specialties`);
    console.log('⏱️  Estimated time: 10-15 minutes');
    console.log('👥 Expected doctors: 50-150');
    console.log('');
    
    // Import and run test scraper
    const { testMassiveScraper } = await import('./test-massive-scraper.js');
    break;
    
  case 'massive':
    console.log('🚀 Starting MASSIVE scraper...');
    console.log(`📊 Full scope: ${FULL_CONFIG.LOCATIONS.length} states × ${FULL_CONFIG.SPECIALTIES.length} specialties`);
    console.log('⏱️  Estimated time: 8-12 hours');
    console.log('👥 Expected doctors: 5,000-10,000+');
    console.log('');
    console.log('⚠️  WARNING: This will take HOURS to complete!');
    console.log('⚠️  Make sure you have enough disk space and time.');
    console.log('');
    
    // Import and run massive scraper
    const { scrapeMassiveDoctorData } = await import('./massive-doctoralia-scraper.js');
    break;
    
  case 'config':
    console.log('⚙️  Current Configuration:');
    console.log(JSON.stringify(SCRAPER_CONFIG, null, 2));
    break;
    
  case 'help':
  case '--help':
  case '-h':
    console.log(USAGE_INSTRUCTIONS);
    break;
    
  default:
    console.log('❌ Invalid command. Available commands:');
    console.log('');
    console.log('  test     - Run test scraper (recommended first)');
    console.log('  massive  - Run massive scraper (thousands of doctors)');
    console.log('  config   - Show current configuration');
    console.log('  help     - Show detailed usage instructions');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/run-scraper.js test');
    console.log('  node scripts/run-scraper.js massive');
    console.log('  node scripts/run-scraper.js help');
    console.log('');
    console.log('🚀 Quick start: node scripts/run-scraper.js test');
    break;
}
