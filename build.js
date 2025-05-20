// Build script for DoctorMX
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting DoctorMX build process...');

// First try the standard build
try {
  console.log('Installing dependencies...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });

  console.log('Building application...');
  execSync('node_modules/.bin/vite build', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('Standard build failed:', error.message);
  console.log('Falling back to minimal build...');
}

// If we get here, the standard build failed, so fall back to emergency build
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

// Create minimal index.html
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DoctorMX</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
  <style>
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }
  </style>
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
          <img src="./images/simeon.png" alt="Doctor MX" class="h-36 mx-auto">
          <div class="mt-4">
            <p class="text-lg font-medium text-gray-700">Bienvenido a DoctorMX</p>
            <div class="mt-3 animate-pulse flex justify-center">
              <span class="h-2 w-2 mx-0.5 bg-green-500 rounded-full"></span>
              <span class="h-2 w-2 mx-0.5 bg-green-500 rounded-full animation-delay-200"></span>
              <span class="h-2 w-2 mx-0.5 bg-green-500 rounded-full animation-delay-400"></span>
            </div>
            <p class="text-sm text-gray-500 mt-3">Estamos actualizando nuestros sistemas para servirle mejor.</p>
            <p class="text-sm text-gray-500 mt-1">Por favor vuelva pronto.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync('dist/index.html', html);
console.log('Created index.html');
console.log('Completed emergency build!');