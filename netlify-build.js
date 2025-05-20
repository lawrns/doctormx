// Netlify build script for DoctorMX
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting DoctorMX build process...');

// Ensure proper dependency installation and build sequencing
try {
  // Make sure we have a valid package.json
  if (!fs.existsSync('package.json')) {
    throw new Error('package.json not found - aborting build');
  }
  
  // Install core dependencies first
  console.log('📦 Installing core dependencies...');
  execSync('npm install --legacy-peer-deps @vitejs/plugin-react@4.1.0 vite@4.5.0 react@18.2.0 react-dom@18.2.0', { 
    stdio: 'inherit' 
  });
  
  // Ensure Vite and React plugin are explicitly installed to avoid build issues
  console.log('📦 Verifying critical build dependencies...');
  try {
    require.resolve('@vitejs/plugin-react');
    console.log('✅ Vite React plugin verified');
  } catch (err) {
    console.log('⚠️ Vite React plugin not found, installing directly...');
    execSync('npm install --no-save @vitejs/plugin-react@4.1.0', { stdio: 'inherit' });
  }
  
  // Install remaining dependencies
  console.log('📦 Installing remaining dependencies...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  
  // Fix React imports to avoid issues in components
  if (fs.existsSync('./fix-react-imports.js')) {
    console.log('🔧 Running React import fixes...');
    execSync('node fix-react-imports.js', { stdio: 'inherit' });
  }
  
  // Run the build with specific fixed Vite version
  console.log('🏗️ Building full React app...');
  execSync('npx vite@4.5.0 build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Full React build failed:', error.message);
  console.log('⚠️ Attempting incremental rebuild with fixes...');
  
  try {
    // Create or verify the simpler Vite config
    console.log('🔧 Creating simplified Vite config...');
    const simpleViteConfig = `
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');
const path = require('path');

module.exports = defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  publicDir: 'public',
  base: '/'
});
    `;
    fs.writeFileSync('simple-vite-config.js', simpleViteConfig);
    
    // Try building with the simplified config
    console.log('🏗️ Attempting build with simplified config...');
    execSync('npx vite@4.5.0 --config simple-vite-config.js build', { stdio: 'inherit' });
    
    console.log('✅ Build with simplified config completed successfully!');
    process.exit(0);
  } catch (simpleBuildError) {
    console.error('❌ Simplified build also failed:', simpleBuildError.message);
    console.log('⚠️ Falling back to static site...');
  }
}

// If we get here, the full React build failed, so create a static page
// This will at least ensure something is deployed even if the build fails
console.log('Creating emergency fallback build...');

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Copy public directory to dist
if (fs.existsSync('public')) {
  try {
    execSync('cp -r public/* dist/', { stdio: 'inherit' });
    console.log('Copied public files to dist');
  } catch (error) {
    console.error('Error copying public files:', error.message);
  }
}

// Create minimal index.html with Tailwind
const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DoctorMX</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
  <div id="root">
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
            DoctorMX
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Asistente médico de IA para ayudar con consultas de salud
          </p>
        </div>
        <div class="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <img src="/mascot.png" alt="Doctor MX" class="h-36 mx-auto">
          <div class="mt-4">
            <p class="text-lg font-medium text-gray-700">Bienvenido a DoctorMX</p>
            <div class="mt-3 flex justify-center">
              <span class="h-2 w-2 mx-0.5 bg-green-500 rounded-full animate-ping"></span>
              <span class="h-2 w-2 mx-0.5 bg-green-500 rounded-full animate-ping delay-150"></span>
              <span class="h-2 w-2 mx-0.5 bg-green-500 rounded-full animate-ping delay-300"></span>
            </div>
            <p class="text-sm text-gray-500 mt-3">Estamos actualizando nuestros sistemas para servirle mejor.</p>
            <p class="text-sm text-gray-500 mt-1">Por favor vuelva pronto.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <style>
    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }
    .animate-ping {
      animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
    .delay-150 {
      animation-delay: 0.15s;
    }
    .delay-300 {
      animation-delay: 0.3s;
    }
  </style>
</body>
</html>`;

fs.writeFileSync('dist/index.html', html);
console.log('Created emergency index.html');
console.log('✅ Emergency build completed!');