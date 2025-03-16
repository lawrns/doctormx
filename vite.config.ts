import { defineConfig } from 'vite';
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
    include: /\.jsx$|\.js$|\.tsx$|\.ts$/,
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
    // Explicitly tell Vite what files to build
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
  define: {
    // Add any global constants here
    'process.env': {}
  }
});