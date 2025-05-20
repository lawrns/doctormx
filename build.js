// Emergency no-dependencies build script
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create a temp index.html
console.log('Creating minimal build files...');

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
          <img src="./Doctorlogo.png" alt="Doctor MX Logo" class="h-24 mx-auto">
          <div class="mt-4">
            <p class="text-lg text-gray-500">Bienvenido a DoctorMX</p>
            <p class="text-sm text-gray-500 mt-2">Estamos en mantenimiento. Vuelva pronto.</p>
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