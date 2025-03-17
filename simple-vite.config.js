const path = require('path');
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

module.exports = defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic',
    // Never auto-inject, we'll handle imports in components
    jsxImportSource: undefined
  })],
  
  // Add resolve aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // Critical aliases for problematic dependencies
      'date-fns': path.resolve(__dirname, 'node_modules/date-fns'),
      'date-fns/locale': path.resolve(__dirname, 'node_modules/date-fns/locale'),
      '@xstate/react': path.resolve(__dirname, 'src/shims/xstate-react.js')
    }
  },
  
  // No automatic JSX imports
  esbuild: {
    jsx: 'automatic',
    jsxInject: undefined
  },
  
  // Pre-bundle date-fns to ensure it's available
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    },
    include: ['date-fns']
  },
  
  // Basic build configuration
  build: {
    outDir: 'dist'
  }
});
