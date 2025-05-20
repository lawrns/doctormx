// Standalone build script for Netlify
// This bypasses Vite's configuration system and calls the build directly

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up simplified build environment...');

// Make sure all necessary dependencies are installed
console.log('📦 Verifying core dependencies with Tailwind CSS and Babel...');
try {
  // Create a package.json backup
  if (fs.existsSync('package.json')) {
    fs.copyFileSync('package.json', 'package.json.bak');
    console.log('📦 Created package.json backup');
  }
  
  // Add a fallback mechanism for vite.config.js
  if (fs.existsSync('vite.config.js')) {
    console.log('📦 Backing up and preparing fallback Vite config...');
    
    // Backup the original config
    fs.copyFileSync('vite.config.js', 'vite.config.js.original');
    
    // Check if we have a simple config to use as fallback
    if (fs.existsSync('simple-vite.config.js')) {
      console.log('📦 Found simple-vite.config.js as fallback option');
    }
    
    // Add error handler for fallback
    process.on('uncaughtException', (err) => {
      if (err.message && err.message.includes('Cannot find module')) {
        console.error('⚠️ Error loading Vite config:', err.message);
        
        if (fs.existsSync('simple-vite.config.js')) {
          console.log('⚠️ Falling back to simplified Vite config');
          fs.copyFileSync('simple-vite.config.js', 'vite.config.js');
          console.log('✅ Using simplified Vite config instead');
          
          // Try restarting the build if it was Vite execution that failed
          if (err.message.includes('npx vite build')) {
            console.log('⚠️ Retrying build with simplified config...');
            execSync('npx vite build', { stdio: 'inherit' });
          }
        }
      }
    });
  }
  
  // First install Vite and plugin-react specifically to ensure vite.config.js can be processed
  console.log('📦 Installing Vite and React plugin first...');
  execSync('npm install --no-save vite@4.5.1 @vitejs/plugin-react@4.1.0 --force', {
    stdio: 'inherit'
  });
  
  // Then install the rest of the dependencies
  console.log('📦 Installing remaining dependencies...');
  execSync('npm install --no-save tailwindcss@3.3.3 postcss@8.4.31 autoprefixer@10.4.16 @babel/plugin-transform-react-jsx @babel/preset-env @babel/preset-react @babel/preset-typescript @esbuild-kit/cjs-loader react react-dom', {
    stdio: 'inherit'
  });
  
  console.log('✅ All dependencies installed');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  // Restore package.json if backup exists
  if (fs.existsSync('package.json.bak')) {
    fs.copyFileSync('package.json.bak', 'package.json');
    console.log('📦 Restored package.json from backup');
  }
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
  // Set environment variables to avoid errors
  process.env.ROLLUP_NATIVE_DISABLE = 'true'; // Disable Rollup native modules
  process.env.VITE_CJS_IGNORE_WARNING = 'true'; // Suppress Vite CJS API deprecation warning
  
  // First validate that the config can be loaded without errors
  try {
    console.log('🔍 Validating Vite config...');
    require('./vite.config.js');
    console.log('✅ Vite config loaded successfully');
  } catch (configError) {
    console.error('❌ Error loading Vite config:', configError.message);
    
    if (configError.message.includes('Cannot find module') && fs.existsSync('simple-vite.config.js')) {
      console.log('⚠️ Using simple Vite config instead');
      fs.copyFileSync('simple-vite.config.js', 'vite.config.js');
    } else {
      throw configError;
    }
  }
  
  // Run the build after config is validated
  console.log('🏗️ Starting Vite build process...');
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
  
  // Last resort - try with inline config
  if (error.message.includes('Cannot find module')) {
    console.log('⚠️ Attempting build with inline config...');
    try {
      // Create minimal inline config file
      const minimalConfig = `
        const { defineConfig } = require('vite');
        const react = require('@vitejs/plugin-react');
        module.exports = defineConfig({
          plugins: [react()],
          build: { outDir: 'dist' }
        });
      `;
      
      fs.writeFileSync('vite.inline.config.js', minimalConfig);
      
      // Try building with the inline config
      execSync('npx vite --config vite.inline.config.js build', {
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_ENV: 'production'
        }
      });
      
      console.log('✅ Build completed successfully with inline config!');
    } catch (inlineError) {
      console.error('❌ Final build attempt failed:', inlineError.message);
      process.exit(1);
    }
  } else {
    process.exit(1);
  }
}
