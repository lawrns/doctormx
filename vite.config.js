import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: false,
    host: 'localhost',
    proxy: { '/api': 'http://localhost:3001' }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    
    // Performance optimizations
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    
    // Asset optimization
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'react-toastify'],
          icons: ['@heroicons/react'],
          
          // Feature chunks
          auth: [
            './src/contexts/AuthContext.jsx',
            './src/pages/Login.jsx',
            './src/pages/Register.jsx'
          ],
          doctor: [
            './src/pages/DoctorDashboard.jsx',
            './src/pages/DoctorDirectory.jsx',
            './src/pages/DoctorProfile.jsx',
            './src/pages/DoctorSignup.jsx',
            './src/pages/DoctorVerification.jsx'
          ],
          patient: [
            './src/pages/PatientDashboard.jsx',
            './src/pages/DoctorAI.jsx'
          ],
          features: [
            './src/components/GamificationDashboard.jsx',
            './src/components/HealthMarketplace.jsx',
            './src/components/QABoard.jsx',
            './src/components/AffiliateDashboard.jsx',
            './src/components/AIReferralSystem.jsx'
          ]
        }
      }
    }
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      '@heroicons/react',
      '@supabase/supabase-js'
    ]
  },
  
  // CSS optimization
  css: {
    devSourcemap: true,
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: true,
  },
})
