// Basic Vite configuration for Netlify builds
// This uses CommonJS syntax for maximum compatibility

const path = require('path');

/**
 * @type {import('vite').UserConfig}
 */
module.exports = {
  plugins: [],
  build: {
    outDir: 'dist',
    minify: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom'
    ]
  },
  publicDir: 'public',
  base: '/'
};