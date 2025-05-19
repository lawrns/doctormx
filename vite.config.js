const path = require('path');
const react = require('@vitejs/plugin-react');
const { defineConfig } = require('vite');
const hydrationSafePlugin = require('./vite-hydration-plugin');

module.exports = defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: undefined
    }),
    hydrationSafePlugin(),
  ],
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
      output: {
        manualChunks: undefined,
        format: 'es',
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.cjs'],
      strictRequires: false,
      transformMixedEsModules: true,
    }
  },
  publicDir: 'public',
  base: '/'
});
