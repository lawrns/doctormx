const path = require('path');
const react = require('@vitejs/plugin-react');
const { defineConfig } = require('vite');

module.exports = defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic',
    jsxImportSource: undefined
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // Removed explicit alias for @xstate/react to use the actual package
      'date-fns': path.resolve(__dirname, 'node_modules/date-fns'),
      'date-fns/locale': path.resolve(__dirname, 'node_modules/date-fns/locale'),
    },
    mainFields: ['module', 'jsnext:main', 'jsnext', 'main'],
  },
  // Don't auto-inject React imports
  esbuild: {
    jsx: 'automatic',
    jsxInject: undefined
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.ts': 'tsx'
      }
    },
    include: ['date-fns']
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: ['@xstate/react'],
    },
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.cjs'],
      strictRequires: true,
      transformMixedEsModules: true,
    }
  },
  publicDir: 'public',
  base: '/'
});
