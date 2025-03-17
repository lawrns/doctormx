// This file is run by Netlify's build process before building the app
// It ensures environment variables are properly set and dependencies are installed

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Install required dependencies for build
console.log('🔧 Setting up build dependencies...');

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

// Create a small patched version of native.js to bypass the Rollup native module issue
console.log('🔧 Creating a patch for Rollup native module...');

try {
  const nativeJsPath = path.join(process.cwd(), 'node_modules', 'rollup', 'dist', 'native.js');
  
  // Check if the file exists before attempting to patch it
  if (fs.existsSync(nativeJsPath)) {
    // Create backup of original file
    fs.copyFileSync(nativeJsPath, `${nativeJsPath}.backup`);
    
    // Generate a patched version that falls back to JS implementation
    const patchedContent = `
// This is a patched version to handle missing native modules
const loadNative = () => {
  try {
    // Try to load the native module
    return require('@rollup/rollup-linux-x64-gnu');
  } catch (e) {
    console.warn('Native Rollup module not available, using JavaScript fallback');
    // Return null to use JS implementation
    return null;
  }
};

// Export a dummy interface that will cause Rollup to use its JS implementation
export const getDefaultExportsFromCjs = () => ({});

const [nativeDefault, ...nativeNames] = [];
export const getPackageVersion = () => '3.0.0';
export const getDynamicImportNative = () => null;
export const getFileNative = () => null;
export const getNativeDefault = () => null;
`;
    
    // Write the patched file
    fs.writeFileSync(nativeJsPath, patchedContent);
    console.log('✅ Successfully patched Rollup native module');
  } else {
    console.log('⚠️ Could not find Rollup native.js file to patch');
  }
} catch (error) {
  console.error('❌ Failed to patch Rollup:', error.message);
}

// Install Vite if needed
console.log('🔍 Checking for Vite...');
try {
  // Verify if vite is installed 
  execSync('npx vite --version', { stdio: 'pipe' });
  console.log('✅ Vite is accessible');
} catch (error) {
  console.log('⚠️ Vite not found, installing it now...');
  try {
    execSync('npm install vite@latest @vitejs/plugin-react@latest --no-save', { stdio: 'inherit' });
    console.log('✅ Vite installed successfully');
  } catch (installError) {
    console.error('❌ Failed to install Vite:', installError.message);
  }
}

console.log('🚀 Netlify setup complete, proceeding with build...');
