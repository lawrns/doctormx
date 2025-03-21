import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

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
      // Removed the @xstate/react alias to use the actual package
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
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: ['@xstate/react', 'localforage'],
      output: {
        manualChunks: undefined
      }
    },
    // Ensure these files get copied to the build directory
    assetsInlineLimit: 0,
    copyPublicDir: true
  },
  define: {
    'process.env': {}
  }
});
