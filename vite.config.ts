import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    // Enable SPA routing in development
    historyApiFallback: true
  },
  preview: {
    // Enable SPA routing in preview mode
    historyApiFallback: true
  }
});