import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Unified configuration combining best elements from all config files
export default defineConfig({
  plugins: [
    react({ include: [/\.jsx$/, /\.js$/, /\.tsx$/, /\.ts$/] })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // Explicitly alias problematic modules that might cause resolution issues
      '@xstate/react': path.resolve(__dirname, 'node_modules/@xstate/react/dist/esm/index.js'),
      'xstate': path.resolve(__dirname, 'node_modules/xstate/dist/esm/index.js')
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  esbuild: {
    loader: 'jsx',
    include: /\.jsx?$|\.tsx?$/,
    exclude: [],
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
      'xstate',
      '@xstate/react'
    ],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.ts': 'tsx'
      }
    },
  },
  define: {
    'process.env': {}
  }
});