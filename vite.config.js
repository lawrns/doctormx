import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Unified configuration combining best elements from all config files
export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@pkg': path.resolve(__dirname, 'packages'),
      '@svc': path.resolve(__dirname, 'packages/services')
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  esbuild: {
    target: 'esnext',
    jsx: 'automatic'
  },
  build: {
    outDir: 'dist',
    minify: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    // Ensure these files get copied to the build directory
    assetsInlineLimit: 0,
    copyPublicDir: true
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'recharts'
    ]
  },
  define: {
    'process.env': {}
  }
});