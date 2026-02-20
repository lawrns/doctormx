/**
 * DoctorMX Service Worker
 * 
 * Provides offline support, caching strategies, and background sync.
 * 
 * @version 1.0.0
 */

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// API routes that should use network-first strategy
const API_ROUTES = [
  '/api/health',
  '/api/doctores',
  '/api/specialties',
];

// Routes that should use cache-first strategy
const CACHE_FIRST_ROUTES = [
  '/_next/static/',
  '/fonts/',
  '/images/',
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('[SW] Static caching failed:', error);
      })
  );

  // Skip waiting to activate immediately
  self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name.startsWith('static-') ||
                     name.startsWith('dynamic-') ||
                     name.startsWith('images-');
            })
            .filter((name) => {
              return name !== STATIC_CACHE &&
                     name !== DYNAMIC_CACHE &&
                     name !== IMAGE_CACHE;
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - handle requests with appropriate strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle API requests with network-first strategy
  if (isApiRequest(url)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Handle image requests with cache-first strategy
  if (isImageRequest(request)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // Handle static assets with cache-first strategy
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Default: stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request));
});

/**
 * Check if request is for API
 */
function isApiRequest(url) {
  return API_ROUTES.some((route) => url.pathname.startsWith(route));
}

/**
 * Check if request is for an image
 */
function isImageRequest(request) {
  return request.destination === 'image';
}

/**
 * Check if request is for static asset
 */
function isStaticAsset(url) {
  return CACHE_FIRST_ROUTES.some((route) => url.pathname.startsWith(route));
}

/**
 * Network-first strategy
 * Try network first, fall back to cache
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline');
    }

    throw error;
  }
}

/**
 * Cache-first strategy
 * Serve from cache if available, otherwise fetch and cache
 */
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first failed:', error);
    throw error;
  }
}

/**
 * Stale-while-revalidate strategy
 * Serve from cache immediately, update cache in background
 */
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.error('[SW] Background fetch failed:', error);
      throw error;
    });

  return cachedResponse || fetchPromise;
}

/**
 * Message event - handle messages from the main thread
 */
self.addEventListener('message', (event) => {
  const { data } = event;

  switch (data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CLEAR_CACHES':
      event.waitUntil(
        caches.keys().then((names) =>
          Promise.all(names.map((name) => caches.delete(name)))
        )
      );
      break;

    case 'GET_CACHE_STATUS':
      event.waitUntil(
        caches.keys().then((names) => {
          event.ports[0].postMessage({
            caches: names,
            timestamp: Date.now(),
          });
        })
      );
      break;
  }
});

/**
 * Background sync event
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  switch (event.tag) {
    case 'sync-consultation-notes':
      event.waitUntil(syncConsultationNotes());
      break;

    case 'sync-chat-messages':
      event.waitUntil(syncChatMessages());
      break;

    case 'sync-appointments':
      event.waitUntil(syncAppointments());
      break;
  }
});

/**
 * Push notification event
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  const data = event.data?.json() || {};
  const title = data.title || 'DoctorMX';
  const options = {
    body: data.body || 'Tienes una nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
    data: data.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/**
 * Notification click event
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event);

  event.notification.close();

  const { notification } = event;
  const url = notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Focus existing window if available
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }

      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

/**
 * Sync consultation notes
 */
async function syncConsultationNotes() {
  // Implementation for syncing offline consultation notes
  console.log('[SW] Syncing consultation notes...');
  // TODO: Implement actual sync logic with IndexedDB
}

/**
 * Sync chat messages
 */
async function syncChatMessages() {
  // Implementation for syncing offline chat messages
  console.log('[SW] Syncing chat messages...');
  // TODO: Implement actual sync logic
}

/**
 * Sync appointments
 */
async function syncAppointments() {
  // Implementation for syncing offline appointments
  console.log('[SW] Syncing appointments...');
  // TODO: Implement actual sync logic
}
