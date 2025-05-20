// Extra simplified Vite config for Netlify builds - fallback option
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

// This simplified config is used when the main config fails
// Only includes the bare minimum needed for a build to complete
module.exports = defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  publicDir: 'public',
  base: '/'
});
