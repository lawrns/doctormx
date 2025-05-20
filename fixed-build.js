// DoctorMX Fixed Build Script
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting DoctorMX fixed build script...');

// Function to handle errors
function handleError(error, message) {
  console.error(`❌ ${message}:`, error.message);
  process.exit(1);
}

try {
  // Step 1: Install Vite and critical dependencies
  console.log('📦 Installing Vite and critical dependencies...');
  try {
    execSync('npm install --no-save vite@4.5.0 @vitejs/plugin-react@4.1.0 tailwindcss@3.3.3 postcss@8.4.31 autoprefixer@10.4.16', { 
      stdio: 'inherit' 
    });
    console.log('✅ Successfully installed Vite and critical dependencies');
  } catch (installError) {
    handleError(installError, 'Failed to install Vite dependencies');
  }
  
  // Step 2: Install project dependencies
  console.log('📦 Installing project dependencies...');
  try {
    execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
    console.log('✅ Project dependencies installed');
  } catch (dependencyError) {
    console.warn('⚠️ Full dependency installation had issues, continuing anyway');
    // Continue anyway - core dependencies might be installed
  }

  // Step 3: Rename App.jsx to prevent it from being used
  console.log('🔧 Setting up to use TypeScript components...');
  if (fs.existsSync('src/App.jsx')) {
    fs.renameSync('src/App.jsx', 'src/App.jsx.bak');
    console.log('✅ Backed up App.jsx');
  }
  
  // Make sure index.jsx is also not used
  if (fs.existsSync('src/index.jsx')) {
    fs.renameSync('src/index.jsx', 'src/index.jsx.bak');
    console.log('✅ Backed up index.jsx');
  }
  
  // Ensure index.tsx is used with proper import
  console.log('🔧 Checking index.tsx for proper imports...');
  if (fs.existsSync('src/index.tsx')) {
    let indexContent = fs.readFileSync('src/index.tsx', 'utf8');
    
    // Make sure it's importing App from './App' (not from './App.jsx')
    if (indexContent.includes("import App from './App.jsx'")) {
      indexContent = indexContent.replace("import App from './App.jsx'", "import App from './App'");
      fs.writeFileSync('src/index.tsx', indexContent);
      console.log('✅ Fixed App import in index.tsx');
    }
  }
  
  // Ensure App.tsx has proper imports
  console.log('🔧 Checking App.tsx configuration...');
  if (fs.existsSync('src/App.tsx')) {
    let appContent = fs.readFileSync('src/App.tsx', 'utf8');
    
    // Make sure PwaWrapper is in the App.tsx if it uses it
    if (appContent.includes('import { PwaWrapper }') && !appContent.includes('<PwaWrapper>')) {
      console.log('⚠️ App.tsx references PwaWrapper but doesn\'t use it, attempting fix...');
      appContent = appContent.replace(
        '<Suspense fallback={<SplashScreen />}>',
        '<PwaWrapper><Suspense fallback={<SplashScreen />}>'
      );
      appContent = appContent.replace(
        '</Suspense>',
        '</Suspense></PwaWrapper>'
      );
      fs.writeFileSync('src/App.tsx', appContent);
      console.log('✅ Added PwaWrapper to App.tsx render');
    }
  }

  // Step 4: Create a targeted Vite config for building
  console.log('🔧 Creating fixed Vite config...');
  const fixedViteConfig = `
// Fixed Vite config for Netlify build
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');
const path = require('path');

module.exports = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  build: {
    outDir: 'dist',
    minify: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'xstate',
      '@xstate/react'
    ]
  }
});
  `;
  
  fs.writeFileSync('vite.fixed.config.js', fixedViteConfig);
  console.log('✅ Created fixed Vite config');

  // Step 5: Run build with the fixed config
  console.log('🏗️ Building application with fixed config...');
  try {
    execSync('npx vite build --config vite.fixed.config.js', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'production'
      }
    });
    console.log('✅ Build completed successfully!');
    
    // Restore original files
    if (fs.existsSync('src/App.jsx.bak')) {
      fs.renameSync('src/App.jsx.bak', 'src/App.jsx');
    }
    if (fs.existsSync('src/index.jsx.bak')) {
      fs.renameSync('src/index.jsx.bak', 'src/index.jsx');
    }
    
    process.exit(0);
  } catch (buildError) {
    console.error('❌ Build failed:', buildError.message);
    
    // Restore original files before exiting
    if (fs.existsSync('src/App.jsx.bak')) {
      fs.renameSync('src/App.jsx.bak', 'src/App.jsx');
    }
    if (fs.existsSync('src/index.jsx.bak')) {
      fs.renameSync('src/index.jsx.bak', 'src/index.jsx');
    }
    
    handleError(buildError, 'Build process failed');
  }

} catch (error) {
  handleError(error, 'An unexpected error occurred');
}