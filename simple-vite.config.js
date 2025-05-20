// Ultra simplified Vite config for Netlify builds
module.exports = {
  build: {
    outDir: 'dist',
    minify: true,
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  publicDir: 'public',
  base: '/'
};