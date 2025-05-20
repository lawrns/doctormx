// Ultra simplified Vite config for Netlify builds - fallback option
const { defineConfig } = require('vite');

// This simplified config is used when the main config fails
// It doesn't require any plugins and uses just essential options
module.exports = defineConfig({
  esbuild: {
    jsxInject: "import React from 'react'",
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    target: 'es2018',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  publicDir: 'public',
  base: '/'
});