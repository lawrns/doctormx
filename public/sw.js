// Service Worker using Workbox
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

// Use workbox CDN to avoid ES module issues
workbox.core.clientsClaim();
self.skipWaiting();
workbox.precaching.cleanupOutdatedCaches();

// Precache all files in the __WB_MANIFEST
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

// Cache Google Fonts
workbox.routing.registerRoute(
  ({url}) => url.origin === 'https://fonts.googleapis.com',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

// Cache font files
workbox.routing.registerRoute(
  ({url}) => url.origin === 'https://fonts.gstatic.com',
  new workbox.strategies.CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

// Cache images
workbox.routing.registerRoute(
  ({request}) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  })
);

// Cache API responses
workbox.routing.registerRoute(
  ({url}) => url.pathname.startsWith('/api/'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'api-responses',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 2, // 2 hours
      }),
    ],
  })
);

// Cache JS and CSS
workbox.routing.registerRoute(
  ({request}) => 
    request.destination === 'script' || 
    request.destination === 'style',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      }),
    ],
  })
);

// Default navigation handler for offline support
workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      }),
    ],
    networkTimeoutSeconds: 3, // Fall back to cache if network takes more than 3 seconds
  })
);

// Offline fallback
workbox.routing.setDefaultHandler(
  new workbox.strategies.NetworkOnly()
);

// Special handling for navigation requests that fail
workbox.routing.setCatchHandler(async ({ request }) => {
  if (request.mode === 'navigate') {
    return caches.match('/offline.html')
      .then(response => response || Response.error());
  }
  
  // For images that fail while offline
  if (request.destination === 'image') {
    return caches.match('/offline-image.png')
      .then(response => response || Response.error());
  }
  
  return Response.error();
});

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'doctor-form-submission') {
    event.waitUntil(syncFormData());
  }
});

// Function to sync stored form data when back online
async function syncFormData() {
  try {
    // Get the stored form submissions from IndexedDB
    const offlineFormDb = await openFormDataDb();
    const formDataToSync = await getAllOfflineForms(offlineFormDb);

    if (!formDataToSync || formDataToSync.length === 0) {
      return [];
    }

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
          await deleteOfflineForm(offlineFormDb, formData.id);
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

    request.onerror = () => {
      reject(new Error('IndexedDB error: ' + request.error));
    };

    request.onsuccess = () => {
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

// Helper function to get all offline forms
function getAllOfflineForms(db) {
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(['offlineForms'], 'readonly');
      const store = transaction.objectStore('offlineForms');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Error retrieving offline forms: ' + request.error));
      };
    } catch (error) {
      reject(error);
    }
  });
}

// Helper function to delete an offline form
function deleteOfflineForm(db, id) {
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(['offlineForms'], 'readwrite');
      const store = transaction.objectStore('offlineForms');
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Error deleting offline form: ' + request.error));
      };
    } catch (error) {
      reject(error);
    }
  });
}

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const title = data.title || 'Doctor.mx';
    const options = {
      body: data.body || 'Tienes una nueva notificación',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: '/icons/badge-96x96.png',
      data: data.data || {},
    };
    
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error('Error processing push notification:', error);
  }
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

// Listen for messages from the client (for update handling)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
