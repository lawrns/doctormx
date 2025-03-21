import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({ include: [/\.jsx$/, /\.js$/, /\.tsx$/, /\.ts$/] })
  ],
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      '@': '/src',
      // Explicitly alias @xstate/react to the node_modules path
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
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.ts': 'tsx'
      }
    },
    exclude: ['src/machines/questionnaireMachine.ts']
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    // Ensure these files get copied to the build directory
    assetsInlineLimit: 0,
    copyPublicDir: true
  },
  define: {
    'process.env': {}
  }
});
