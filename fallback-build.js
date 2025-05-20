// Ultra-simple fallback build script for DoctorMX
// This script creates a static site with no build dependencies
// It's designed to work in any Node.js environment, including Netlify

const fs = require('fs');
const path = require('path');

console.log('🏗️ Starting fallback DoctorMX build...');

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
  console.log('✅ Created dist directory');
}

// Copy all static assets from public to dist
if (fs.existsSync('public')) {
  try {
    // List all files in public directory
    const publicFiles = fs.readdirSync('public');
    
    // Create each file individually to avoid shell command issues
    for (const file of publicFiles) {
      const sourcePath = path.join('public', file);
      const destPath = path.join('dist', file);
      
      if (fs.statSync(sourcePath).isDirectory()) {
        // Recursively copy directories
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        
        const dirFiles = fs.readdirSync(sourcePath);
        for (const dirFile of dirFiles) {
          const dirSourcePath = path.join(sourcePath, dirFile);
          const dirDestPath = path.join(destPath, dirFile);
          
          if (!fs.statSync(dirSourcePath).isDirectory()) {
            fs.copyFileSync(dirSourcePath, dirDestPath);
          }
        }
      } else {
        // Copy regular files
        fs.copyFileSync(sourcePath, destPath);
      }
    }
    
    console.log('✅ Copied public assets to dist directory');
  } catch (error) {
    console.error('❌ Error copying public assets:', error.message);
  }
}

// Create the index.html file with a static version
const indexHTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="DoctorMX - Asistente médico impulsado por IA que te ayuda a entender tus síntomas y encontrar los especialistas adecuados.">
  <title>DoctorMX - Asistente Médico IA</title>
  <link rel="icon" href="/favicon.ico">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-25%); }
    }
    .animate-bounce {
      animation: bounce 1s infinite;
    }
  </style>
</head>
<body class="bg-blue-50 min-h-screen">
  <header class="bg-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
      <div class="flex items-center">
        <img src="/mascot.png" alt="DoctorMX Logo" class="h-10 w-10 mr-2">
        <h1 class="text-2xl font-bold text-blue-700">DoctorMX</h1>
      </div>
      <nav>
        <ul class="flex space-x-4">
          <li><a href="#" class="text-blue-600 hover:text-blue-800">Inicio</a></li>
          <li><a href="#" class="text-blue-600 hover:text-blue-800">Sobre Nosotros</a></li>
          <li><a href="#" class="text-blue-600 hover:text-blue-800">Contacto</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main>
    <section class="bg-gradient-to-b from-blue-500 to-blue-700 text-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 class="text-4xl font-bold mb-4">Tu Asistente Médico Personal</h2>
            <p class="text-xl mb-6">Consulta tus síntomas y encuentra los mejores especialistas cerca de ti.</p>
            <div class="flex space-x-4">
              <button class="bg-white text-blue-700 font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-blue-50 transition duration-200">
                Consultar Síntomas
              </button>
              <button class="bg-transparent border-2 border-white text-white font-bold py-2 px-6 rounded-lg hover:bg-white hover:text-blue-700 transition duration-200">
                Buscar Médicos
              </button>
            </div>
          </div>
          <div class="flex justify-center">
            <img src="/mascot.png" alt="DoctorMX Mascot" class="h-64">
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center mb-12 text-gray-800">Nuestros Servicios</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-blue-50 rounded-xl p-6 shadow-md">
            <div class="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center text-white mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-gray-800">Consulta de Síntomas</h3>
            <p class="text-gray-600">Describe tus síntomas y obtén información sobre posibles condiciones y recomendaciones.</p>
          </div>
          
          <div class="bg-blue-50 rounded-xl p-6 shadow-md">
            <div class="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center text-white mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-gray-800">Búsqueda de Especialistas</h3>
            <p class="text-gray-600">Encuentra los mejores médicos especialistas cerca de ti con opiniones verificadas.</p>
          </div>
          
          <div class="bg-blue-50 rounded-xl p-6 shadow-md">
            <div class="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center text-white mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-gray-800">Agenda de Citas</h3>
            <p class="text-gray-600">Programa citas médicas directamente desde nuestra plataforma con recordatorios automáticos.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 bg-blue-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold mb-2 text-gray-800">Estamos trabajando para ti</h2>
        <p class="text-xl text-gray-600 mb-8">Actualizando nuestros sistemas para brindarte un mejor servicio</p>
        
        <div class="flex justify-center space-x-2 mb-8">
          <div class="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
          <div class="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          <div class="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
        </div>
        
        <div class="inline-block bg-white rounded-lg shadow-md px-8 py-6">
          <p class="text-gray-700">Estamos actualizando nuestra plataforma. Pronto podrás disfrutar de todos nuestros servicios.</p>
          <p class="text-gray-700 mt-4">¡Vuelve pronto!</p>
        </div>
      </div>
    </section>
  </main>

  <footer class="bg-blue-800 text-white py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 class="text-lg font-semibold mb-4">DoctorMX</h3>
          <p class="text-blue-200">Asistencia médica inteligente para todos.</p>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold mb-4">Enlaces</h3>
          <ul class="space-y-2">
            <li><a href="#" class="text-blue-200 hover:text-white">Inicio</a></li>
            <li><a href="#" class="text-blue-200 hover:text-white">Servicios</a></li>
            <li><a href="#" class="text-blue-200 hover:text-white">Acerca de</a></li>
            <li><a href="#" class="text-blue-200 hover:text-white">Contacto</a></li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold mb-4">Legal</h3>
          <ul class="space-y-2">
            <li><a href="#" class="text-blue-200 hover:text-white">Términos de Servicio</a></li>
            <li><a href="#" class="text-blue-200 hover:text-white">Política de Privacidad</a></li>
            <li><a href="#" class="text-blue-200 hover:text-white">Aviso Legal</a></li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold mb-4">Contacto</h3>
          <p class="text-blue-200">info@doctormx.com</p>
          <p class="text-blue-200 mt-2">Ciudad de México, México</p>
        </div>
      </div>
      
      <div class="mt-8 pt-8 border-t border-blue-700 text-center">
        <p class="text-blue-200">&copy; 2025 DoctorMX. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
</body>
</html>`;

fs.writeFileSync('dist/index.html', indexHTML);
console.log('✅ Created index.html');

// Create a minimal _redirects file for Netlify
const redirects = `# Netlify redirects file
/api/v1/standard-model /.netlify/functions/standard-model 200
/api/v1/premium-model /.netlify/functions/premium-model 200
/api/v1/image-analysis /.netlify/functions/image-analysis 200
/api/v1/* /.netlify/functions/:splat 200
/* /index.html 200`;

fs.writeFileSync('dist/_redirects', redirects);
console.log('✅ Created _redirects file');

console.log('✅ Fallback build completed successfully!');
console.log('🎉 Your static site is ready to deploy');