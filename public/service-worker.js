// Service Worker for Doctor.mx
const CACHE_NAME = 'doctormx-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/maskable-icon.png'
];

// Install event - cache assets
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, then network
self.addEventListener('fetch', event => {
  // Skip non-GET requests and browser extensions
  if (event.request.method !== 'GET' || 
      !event.request.url.startsWith('http')) {
    return;
  }

  // Skip requests that might cause HTTP2 protocol errors
  if (event.request.url.includes('chrome-extension://') ||
      event.request.url.includes('moz-extension://') ||
      event.request.url.includes('localhost:5173') ||
      event.request.url.includes('localhost:5174')) {
    return;
  }

  // For API requests, use network first, then cache
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      Promise.race([
        fetch(event.request, {
          signal: AbortSignal.timeout(10000) // 10 second timeout
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
      ])
        .then(response => {
          // Clone the response to store in cache and return
          if (response.ok) {
            let responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // For non-API requests, use cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || Promise.race([
          fetch(event.request, {
            signal: AbortSignal.timeout(10000)
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 10000)
          )
        ])
          .then(fetchResponse => {
            // Clone and store non-API responses in cache
            if (fetchResponse.ok) {
              let responseToCache = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return fetchResponse;
          });
      })
      .catch(error => {
        console.log('[ServiceWorker] Fetch error', error);
        
        // For HTML navigations, return the offline page
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html').then(response => {
            return response || new Response('<html><body><h1>Offline</h1><p>Please check your connection.</p></body></html>', {
              headers: { 'Content-Type': 'text/html' }
            });
          });
        }
        
        return new Response('Network error happened', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-health-data') {
    event.waitUntil(syncHealthData());
  }
});

// Push notifications
self.addEventListener('push', event => {
  const title = 'Doctor.mx';
  const options = {
    body: event.data.text(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-icon.png'
  };
  
  event.waitUntil(self.registration.showNotification(title, options));
});

// Handler for notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  // Handle different notification actions
  if (event.action === 'view-appointment') {
    clients.openWindow('/dashboard');
  } else {
    clients.openWindow('/');
  }
});

// Function to sync health data
async function syncHealthData() {
  const outbox = await localforage.getItem('health-sync-outbox');
  
  if (!outbox || !outbox.length) {
    return;
  }
  
  for (const item of outbox) {
    try {
      await fetch('/api/health/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      });
      
      // Remove successfully synced items
      const updatedOutbox = await localforage.getItem('health-sync-outbox');
      const filteredOutbox = updatedOutbox.filter(i => i.id !== item.id);
      await localforage.setItem('health-sync-outbox', filteredOutbox);
    } catch (error) {
      console.error('Failed to sync health data:', error);
      return Promise.reject(new Error('Failed to sync health data'));
    }
  }
  
  return Promise.resolve();
}
