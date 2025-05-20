// Simple build script for Netlify
const { execSync } = require('child_process');
const fs = require('fs');

// Install dependencies
console.log('Installing dependencies...');
execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });

// Install Vite and React plugin
console.log('Installing Vite and plugin-react...');
execSync('npm install vite@4.5.1 @vitejs/plugin-react@4.1.0 --save-dev', { stdio: 'inherit' });

// Create ultra minimal Vite config to avoid dependency issues
console.log('Creating minimal Vite config...');
const minimalConfig = `
// Ultra minimal Vite config
module.exports = {
  build: { outDir: 'dist' },
  publicDir: 'public'
};
`;
fs.writeFileSync('vite.minimal.js', minimalConfig);

// Run build with minimal config
console.log('Building project...');
try {
  execSync('node_modules/.bin/vite build --config vite.minimal.js', { stdio: 'inherit' });
  console.log('Build successful!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}