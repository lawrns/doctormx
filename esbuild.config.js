module.exports = {
  target: 'es2020',
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',  // This will use React 17+ JSX transform
  jsxImportSource: 'react',
  logLevel: 'verbose', // Show detailed errors
  bundle: true,
  minify: false,     // During development, no need to minify
  sourcemap: true,
  loader: {
    '.svg': 'file', 
    '.png': 'file',
    '.jpg': 'file',
    '.jpeg': 'file'
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
};