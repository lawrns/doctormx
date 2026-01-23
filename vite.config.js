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
      },
      output: {
        // Manual chunks for better code splitting
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI libraries
          'ui-vendor': ['framer-motion', 'lucide-react', 'recharts'],
          // Data and state management
          'data-vendor': ['@tanstack/react-query', '@supabase/supabase-js', '@xstate/react'],
          // AI and medical logic
          'ai-vendor': ['openai', 'crypto-js'],
          // Utilities
          'utils-vendor': ['date-fns', 'dompurify', 'i18next']
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/js/${facadeModuleId}-[hash].js`;
        }
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    // Optimize asset handling
    assetsInlineLimit: 4096, // 4kb - inline small assets
    copyPublicDir: true,
    // Split CSS
    cssCodeSplit: true,
    // Chunk size warnings
    chunkSizeWarningLimit: 500
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
  server: {
    port: 5173,
    host: true,
    strictPort: true // Ensure it always uses port 5173
  },
  preview: {
    port: 5173
  }
});