import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({ include: [/\.jsx$/, /\.js$/, /\.tsx$/, /\.ts$/] }),
    VitePWA({
      // Set to true to enable injection of the service worker at build time
      injectRegister: 'auto',
      
      // Register service worker through programmatic API
      registerType: 'autoUpdate',
      
      // Service worker strategy - use 'injectManifest' for more control
      strategies: 'injectManifest',
      
      // Path to the service worker to be injected & precached
      injectManifest: {
        swSrc: 'src/pwa/sw.js',
        swDest: 'dist/sw.js',
        injectionPoint: 'self.__WB_MANIFEST'
      },
      
      // PWA Manifest configuration
      manifest: {
        name: 'Doctor.mx - Encuentra médicos y agenda citas',
        short_name: 'Doctor.mx',
        description: 'Plataforma para encontrar médicos, agendar citas y consultar tu salud',
        theme_color: '#0066cc',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: '/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/maskable-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      
      // Workbox options for the service worker
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        
        // Handle offline fallbacks
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/dashboard/],
        
        // Cache configuration for different types of assets
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-responses',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 2 // 2 hours
              }
            }
          }
        ]
      }
    })
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
