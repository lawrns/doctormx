// Service Worker using Workbox for Doctor.mx PWA
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { clientsClaim } from 'workbox-core';

// Use with precache injection
self.__WB_MANIFEST = self.__WB_MANIFEST || [];

// Enable immediate claiming of clients
self.skipWaiting();
clientsClaim();

// Clean up old caches from previous versions
cleanupOutdatedCaches();

// Precache and route all static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache Google Fonts stylesheets with a stale-while-revalidate strategy
registerRoute(
  ({url}) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

// Cache Google Fonts webfont files with a cache-first strategy for 1 year
registerRoute(
  ({url}) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

// Cache images with a cache-first strategy
registerRoute(
  ({request}) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  })
);

// Cache Doctor.mx API requests with a stale-while-revalidate strategy
registerRoute(
  ({url}) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-responses',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 2, // 2 hours
      }),
    ],
  })
);

// Cache other JS and CSS files with a stale-while-revalidate strategy
registerRoute(
  ({request}) => 
    request.destination === 'script' || 
    request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      }),
    ],
  })
);

// Use a NetworkFirst strategy for HTML navigation requests
registerRoute(
  ({request}) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      }),
    ],
    networkTimeoutSeconds: 3, // Try network for 3 seconds before falling back to cache
  })
);

// Handle offline fallback
const FALLBACK_HTML_URL = '/offline.html';
const FALLBACK_IMAGE_URL = '/offline-image.png';

// Register a specific fallback for HTML navigation requests
registerRoute(
  ({ request }) => request.mode === 'navigate',
  async (args) => {
    try {
      // Try to get the page from the network first
      return await new NetworkFirst({
        cacheName: 'pages',
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          new ExpirationPlugin({ maxEntries: 30 }),
        ],
      }).handle(args);
    } catch (error) {
      // If offline, return the fallback page from the cache
      return caches
        .match(FALLBACK_HTML_URL)
        .then((response) => response || Response.error());
    }
  }
);

// Register a generic fallback for image requests
registerRoute(
  ({ request }) => request.destination === 'image',
  async (args) => {
    try {
      // Try to get the image from the cache/network
      return await new CacheFirst({
        cacheName: 'images',
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          new ExpirationPlugin({ maxEntries: 60 }),
        ],
      }).handle(args);
    } catch (error) {
      // If offline and image not available, return placeholder
      return caches
        .match(FALLBACK_IMAGE_URL)
        .then((response) => response || Response.error());
    }
  }
);

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'doctor-form-submission') {
    event.waitUntil(syncFormData());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();

  const title = data.title || 'Doctor.mx';
  const options = {
    body: data.body || 'Tienes una nueva notificación',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge-96x96.png',
    data: data.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Navigate to the relevant URL when notification is clicked
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }

      // If no window/tab is open with the target URL, open one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Function to sync stored form data when back online
async function syncFormData() {
  try {
    // Get the stored form submissions from IndexedDB
    const offlineFormDb = await openFormDataDb();
    const formDataToSync = await offlineFormDb.getAll('offlineForms');

    const syncPromises = formDataToSync.map(async (formData) => {
      try {
        // Attempt to send the form data to the server
        const response = await fetch(formData.url, {
          method: formData.method,
          headers: formData.headers,
          body: formData.body,
          credentials: formData.credentials,
        });

        if (response.ok) {
          // If successful, remove the item from the DB
          await offlineFormDb.delete('offlineForms', formData.id);
          return { status: 'success', id: formData.id };
        } else {
          return { status: 'error', id: formData.id };
        }
      } catch (error) {
        return { status: 'error', id: formData.id, error };
      }
    });

    return Promise.all(syncPromises);
  } catch (error) {
    console.error('Error syncing offline forms:', error);
    return [];
  }
}

// Helper function to open and initialize the form data IndexedDB
function openFormDataDb() {
  return new Promise((resolve, reject) => {
    const dbName = 'doctormx-offline-forms';
    const dbVersion = 1;
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = (event) => {
      reject(new Error('IndexedDB error: ' + request.error));
    };

    request.onsuccess = (event) => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create a store for offline form submissions
      if (!db.objectStoreNames.contains('offlineForms')) {
        db.createObjectStore('offlineForms', {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    };
  });
}
