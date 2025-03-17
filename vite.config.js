const path = require('path');
const react = require('@vitejs/plugin-react');
const { defineConfig } = require('vite');

module.exports = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // Explicit aliases for problematic imports
      '@xstate/react': path.resolve(__dirname, 'src/shims/xstate-react.js'),
      'date-fns': path.resolve(__dirname, 'node_modules/date-fns'),
      'date-fns/locale': path.resolve(__dirname, 'src/shims/date-fns-locale.js'),
    },
    mainFields: ['module', 'jsnext:main', 'jsnext', 'main'],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@xstate/react',
      'date-fns',
      'xstate'
    ],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.ts': 'tsx',
        '.tsx': 'tsx'
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.cjs'],
      strictRequires: true,
      transformMixedEsModules: true,
    }
  }
});
