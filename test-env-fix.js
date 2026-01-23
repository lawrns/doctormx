#!/usr/bin/env node

// Test environment variable loading for DoctorMX
console.log('Testing environment variable loading...');

// Simulate what Vite does with environment variables
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load .env files in the same order as Vite
const envFiles = [
  '.env.local',
  '.env',
  '.env.example'
];

const loadedVars = {};

envFiles.forEach(file => {
  const fullPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`✓ Found ${file}`);
    const result = dotenv.config({ path: fullPath });
    if (result.parsed) {
      Object.entries(result.parsed).forEach(([key, value]) => {
        if (key.startsWith('VITE_') && !loadedVars[key]) {
          loadedVars[key] = value;
        }
      });
    }
  } else {
    console.log(`✗ Missing ${file}`);
  }
});

console.log('\nLoaded VITE_ environment variables:');
Object.entries(loadedVars).forEach(([key, value]) => {
  const masked = key.includes('KEY') ? `${value.slice(0, 8)}...${value.slice(-8)}` : value;
  console.log(`  ${key}: ${masked}`);
});

const requiredVars = ['VITE_OPENAI_API_KEY', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
const missingVars = requiredVars.filter(key => !loadedVars[key]);

if (missingVars.length > 0) {
  console.log('\n❌ MISSING REQUIRED VARIABLES:', missingVars.join(', '));
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are present');
}

console.log('\nEnvironment variable loading test complete.');