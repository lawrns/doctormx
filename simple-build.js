#!/usr/bin/env node
// Ultra-simplified build script that ensures vite is installed first
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting DoctorMX simple build script...');

// Make sure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

try {
  console.log('📦 Installing exact versions of Vite and dependencies...');
  
  // Install Vite and critical dependencies to normal dependencies
  // This ensures they're available for the build
  execSync('npm install --save vite@4.5.0 @vitejs/plugin-react@4.1.0 postcss@8.4.31 autoprefixer@10.4.16 tailwindcss@3.3.3', {
    stdio: 'inherit'
  });
  
  console.log('✅ Dependencies installed successfully');
  
  // Check if vite is available
  try {
    require.resolve('vite');
    console.log('✅ Vite is available in node_modules');
  } catch (err) {
    console.error('❌ Vite still not found in node_modules after install');
    throw new Error('Vite installation failed');
  }
  
  // Backup JSX files that might conflict with TypeScript
  if (fs.existsSync('src/App.jsx') && !fs.existsSync('src/App.jsx.bak')) {
    fs.renameSync('src/App.jsx', 'src/App.jsx.bak');
    console.log('✅ Backed up App.jsx');
  }
  
  // Create vite.config.js
  const viteConfig = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
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
  
  fs.writeFileSync('vite.config.js', viteConfig);
  console.log('✅ Created vite.config.js using ES modules syntax');
  
  // Run build
  console.log('🏗️ Running build...');
  execSync('npx vite build', {
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
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  
  // Restore original files
  if (fs.existsSync('src/App.jsx.bak')) {
    fs.renameSync('src/App.jsx.bak', 'src/App.jsx');
  }
  
  // Create a basic fallback page
  console.log('⚠️ Creating emergency fallback page...');
  
  const fallbackHTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DoctorMX - Asistente Médico IA</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-blue-50 min-h-screen">
  <div class="min-h-screen flex items-center justify-center">
    <div class="max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
      <div class="flex justify-center mb-6">
        <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
      </div>
      <h1 class="text-2xl font-bold text-gray-800 mb-4">Doctor Simeon</h1>
      <p class="text-gray-600 mb-6">Estamos actualizando nuestro sistema para brindarte un mejor servicio.</p>
      <div class="flex justify-center space-x-2">
        <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-150"></div>
        <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-300"></div>
      </div>
      <style>
        .animate-bounce { animation: bounce 1s infinite; }
        .delay-150 { animation-delay: 0.15s; }
        .delay-300 { animation-delay: 0.3s; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      </style>
    </div>
  </div>
</body>
</html>`;
  
  fs.writeFileSync('dist/index.html', fallbackHTML);
  
  // Create a minimal _redirects file for Netlify
  const redirects = `# Netlify redirects file
/* /index.html 200`;
  
  fs.writeFileSync('dist/_redirects', redirects);
  
  console.log('✅ Fallback page created');
  process.exit(1);
}