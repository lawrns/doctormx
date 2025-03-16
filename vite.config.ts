import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import { visualizer } from 'rollup-plugin-visualizer'; // Uncomment to enable bundle size visualization

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    // visualizer(), // Uncomment to visualize bundle size
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  
  // Build optimization
  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: command === 'build', // Remove console logs in production
        drop_debugger: command === 'build', // Remove debugger statements in production
        pure_funcs: command === 'build' ? ['console.log', 'console.info', 'console.debug'] : []
      },
      format: {
        comments: false, // Remove comments
      },
    },
    // Enable chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            'clsx',
            'tailwind-merge'
          ],
          utils: ['date-fns', 'dayjs', 'zod']
        },
        // Add hashing for cache busting
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    // Enable source maps only in development
    sourcemap: command !== 'build',
    // Set maximum chunk size warning threshold
    chunkSizeWarningLimit: 1000
  },
  server: {
    // Enable SPA routing in development
    historyApiFallback: true
  },
  preview: {
    // Enable SPA routing in preview mode
    historyApiFallback: true
  }
}));