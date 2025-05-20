// Standalone build script for Netlify
// This bypasses Vite's configuration system and calls the build directly

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up simplified build environment...');

// Install ALL necessary dependencies explicitly
console.log('📦 Installing core dependencies with Tailwind CSS and Babel...');
try {
  // Install React, Vite, AND Tailwind CSS dependencies
  execSync('npm install --no-save vite@latest @vitejs/plugin-react@latest tailwindcss@latest postcss@latest autoprefixer@latest @babel/plugin-transform-react-jsx @esbuild-kit/cjs-loader react react-dom', {
    stdio: 'inherit'
  });
  console.log('✅ All dependencies installed');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Create a .babelrc file that properly configures the react-jsx plugin
console.log('📝 Creating proper Babel configuration...');
const babelConfig = {
  "presets": [
    ["@babel/preset-env", {
      "targets": {
        "browsers": [">0.5%", "not dead", "not op_mini all"]
      }
    }],
    ["@babel/preset-react", {
      "runtime": "automatic"
    }],
    "@babel/preset-typescript"
  ],
  "plugins": [
    ["@babel/plugin-transform-react-jsx", { "runtime": "automatic" }]
  ]
};

fs.writeFileSync('.babelrc.json', JSON.stringify(babelConfig, null, 2));
console.log('✅ Babel configuration created');

// Execute the build
console.log('🏗️ Running Vite build...');
try {
  process.env.ROLLUP_NATIVE_DISABLE = 'true'; // Disable Rollup native modules
  process.env.VITE_CJS_IGNORE_WARNING = 'true'; // Suppress Vite CJS API deprecation warning
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
