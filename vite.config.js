import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { sentryVitePlugin } from "@sentry/vite-plugin";

// Unified configuration combining best elements from all config files
export default defineConfig({
  plugins: [
    react(),
    // Sentry plugin for sourcemap uploads and release tracking
    sentryVitePlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "fyves",
      project: "doctormx",
      // Disable telemetry in CI/CD
      telemetry: false,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
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
    // Enable sourcemaps for Sentry error tracking
    sourcemap: true,
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