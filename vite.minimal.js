// Ultra minimal Vite config that avoids module resolution issues
module.exports = {
  css: {
    postcss: {
      plugins: []  // Disable PostCSS to avoid module resolution errors
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true
  },
  publicDir: 'public',
  base: '/'
};