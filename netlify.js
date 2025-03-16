// This file is run by Netlify's build process before building the app
// It ensures environment variables are properly set and dependencies are installed

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔍 Checking for Vite...');
try {
  // Verify if vite is installed globally or locally
  execSync('npx vite --version', { stdio: 'inherit' });
  console.log('✅ Vite is accessible');
} catch (error) {
  console.log('⚠️ Vite not found, installing it now...');
  try {
    execSync('npm install vite@5.4.14 @vitejs/plugin-react@4.2.1 --no-save', { stdio: 'inherit' });
    console.log('✅ Vite installed successfully');
  } catch (installError) {
    console.error('❌ Failed to install Vite:', installError.message);
  }
}

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

console.log('🚀 Netlify setup complete, proceeding with build...');
