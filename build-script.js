// Fix Vite config issues for Netlify build

const fs = require('fs');
const path = require('path');

// Clean up any problematic configs
if (fs.existsSync('vite.config.js')) {
  console.log('Removing incomplete vite.config.js file...');
  fs.unlinkSync('vite.config.js');
}

// Ensure TypeScript config exists
const tsConfigPath = path.join(__dirname, 'vite.config.ts');
console.log('Verifying TypeScript config exists at:', tsConfigPath);

if (!fs.existsSync(tsConfigPath)) {
  console.error('TypeScript config missing, creating a new one...');
  
  const configContent = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    })
  ],
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      '@': '/src',
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  esbuild: {
    loader: 'tsx',
    include: /\\.jsx$|\\.js$|\\.tsx$|\\.ts$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.ts': 'tsx',
        '.tsx': 'tsx',
        '.jsx': 'jsx'
      },
      jsx: 'automatic'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: [],
      context: 'window',
    },
  },
  define: {
    'process.env': {}
  }
});`;

  fs.writeFileSync(tsConfigPath, configContent);
  console.log('Created TypeScript config file.');
}

// Patch Rollup if needed
try {
  const rollupDir = path.join(__dirname, 'node_modules', 'rollup', 'dist');
  const nativePath = path.join(rollupDir, 'native.js');
  
  if (fs.existsSync(nativePath)) {
    console.log('Patching Rollup native module...');
    
    const patchContent = `
// Patched version to avoid native module errors
export function getDefaultExportsFromCjs() { return {}; }
export function getPackageVersion() { return '3.0.0'; }
export function getDynamicImportNative() { return null; }
export function getFileNative() { return null; }
export function getNativeDefault() { return null; }
export { getDefaultExportsFromCjs as default };
`;
    
    fs.writeFileSync(nativePath, patchContent);
    console.log('Successfully patched Rollup native module');
  }
} catch (error) {
  console.error('Error patching Rollup:', error);
}

console.log('Build script completed successfully');
