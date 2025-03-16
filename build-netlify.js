
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Netlify build script...');

// Add missing dependencies
console.log('📦 Installing missing dependencies...');
try {
  execSync('npm install react-refresh --save-dev', { stdio: 'inherit' });
  console.log('✅ react-refresh installed successfully');
} catch (error) {
  console.error('❌ Failed to install react-refresh:', error);
  process.exit(1);
}

// Run the build
console.log('🔨 Building project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}

console.log('🎉 Netlify build script completed successfully!');
