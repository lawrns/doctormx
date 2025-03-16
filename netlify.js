// This file is run by Netlify's build process before building the app
// It ensures environment variables are properly set and dependencies are installed

const fs = require('fs');
const { execSync } = require('child_process');

// Create a temporary .env file if environment variables are set in Netlify 
// but not in a file (this helps Vite pick them up during build)
if (process.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_ANON_KEY) {
  console.log('📝 Creating temporary .env file for Netlify build...');
  
  let envContent = '';
  
  if (process.env.VITE_SUPABASE_URL) {
    envContent += `VITE_SUPABASE_URL=${process.env.VITE_SUPABASE_URL}\n`;
  }
  
  if (process.env.VITE_SUPABASE_ANON_KEY) {
    envContent += `VITE_SUPABASE_ANON_KEY=${process.env.VITE_SUPABASE_ANON_KEY}\n`;
  }
  
  // Write to .env file
  fs.writeFileSync('.env', envContent);
  console.log('✅ Temporary .env file created');
}

// Ensure Linux-specific Rollup dependencies are installed
try {
  console.log('📦 Installing Linux-specific Rollup dependencies...');
  execSync('npm install --no-save @rollup/rollup-linux-x64-gnu', { stdio: 'inherit' });
  console.log('✅ Rollup dependencies installed');
} catch (error) {
  console.error('❌ Error installing Rollup dependencies:', error.message);
  // Continue anyway - we don't want to fail the build for this
}

console.log('🚀 Netlify setup complete, proceeding with build...');
