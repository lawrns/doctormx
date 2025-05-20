// Ultra minimal Vite config that avoids module resolution issues
module.exports = {
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true
  },
  publicDir: 'public',
  base: '/'
};