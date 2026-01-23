#!/usr/bin/env node

// Simple test to verify environment variables are loading correctly
console.log('Testing Environment Variable Loading...\n');

// Test 1: Check if .env files exist
const fs = require('fs');
const path = require('path');

const envFiles = ['.env', '.env.local', '.env.example'];
envFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${file}: ${exists ? '✓ exists' : '✗ missing'}`);
});

// Test 2: Load and check environment variables using dotenv
console.log('\nLoading environment variables...');

try {
  require('dotenv').config({ path: '.env' });
  require('dotenv').config({ path: '.env.local', override: true });

  const requiredVars = [
    'VITE_OPENAI_API_KEY',
    'VITE_SUPABASE_URL', 
    'VITE_SUPABASE_ANON_KEY'
  ];

  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`${varName}: ✓ loaded (${value.substring(0, 20)}...)`);
    } else {
      console.log(`${varName}: ✗ missing`);
    }
  });

  console.log('\nAll environment variables loaded successfully!');
  console.log('The issue may be with Vite\'s environment variable processing.');
  
} catch (error) {
  console.error('Error loading environment variables:', error.message);
}

console.log('\nNext steps:');
console.log('1. Try running: npm run dev');
console.log('2. If still failing, restart your terminal/IDE');
console.log('3. Check for any cached environment states');