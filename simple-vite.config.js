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
      '@xstate/react': path.resolve(__dirname, 'src/shims/xstate-react.js'),
      'date-fns': path.resolve(__dirname, 'node_modules/date-fns'),
      'date-fns/locale': path.resolve(__dirname, 'node_modules/date-fns/locale')
    }
  },
  
  // No automatic JSX imports
  esbuild: {
    jsx: 'automatic',
    jsxInject: undefined
  },
  
  // Pre-bundle dependencies to ensure they're available
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    },
    include: ['date-fns', '@xstate/react']
  },
  
  // Basic build configuration
  build: {
    outDir: 'dist',
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
});
