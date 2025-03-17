// Standalone build script for Netlify
// This bypasses Vite's configuration system and calls the build directly

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create a simple Vite config directly in JS
const tempConfigContent = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: [],
    }
  }
});
`;

console.log('🔧 Setting up simplified build environment...');

// Delete any existing config files to avoid conflicts
if (fs.existsSync('vite.config.js')) {
  fs.unlinkSync('vite.config.js');
  console.log('✅ Removed existing vite.config.js');
}

if (fs.existsSync('vite.config.ts')) {
  fs.unlinkSync('vite.config.ts');
  console.log('✅ Removed existing vite.config.ts');
}

// Create the temporary config file
fs.writeFileSync('vite.simple.config.js', tempConfigContent);
console.log('✅ Created simplified Vite config');

// Install necessary dependencies
console.log('📦 Installing core dependencies...');
try {
  // Install React and Vite explicitly
  execSync('npm install --no-save vite@latest @vitejs/plugin-react@latest react react-dom', {
    stdio: 'inherit'
  });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Execute the build
console.log('🏗️ Running Vite build with simplified config...');
try {
  process.env.ROLLUP_NATIVE_DISABLE = 'true'; // Disable Rollup native modules
  execSync('npx vite build --config vite.simple.config.js', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
