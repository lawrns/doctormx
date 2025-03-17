// Standalone build script for Netlify
// This bypasses Vite's configuration system and calls the build directly

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up simplified build environment...');

// Install ALL necessary dependencies explicitly
console.log('📦 Installing core dependencies with Tailwind CSS...');
try {
  // Install React, Vite, AND Tailwind CSS dependencies
  execSync('npm install --no-save vite@latest @vitejs/plugin-react@latest tailwindcss@latest postcss@latest autoprefixer@latest react react-dom', {
    stdio: 'inherit'
  });
  console.log('✅ All dependencies installed');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Execute the build
console.log('🏗️ Running Vite build...');
try {
  process.env.ROLLUP_NATIVE_DISABLE = 'true'; // Disable Rollup native modules
  execSync('npx vite build', {
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
