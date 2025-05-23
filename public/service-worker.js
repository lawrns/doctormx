// Service Worker for Doctor.mx - DISABLED
// Temporary fix for HTTP2 protocol and caching errors

console.log('[ServiceWorker] Service worker is disabled');

// No-op service worker - all functionality disabled
self.addEventListener('install', function(event) {
  console.log('[ServiceWorker] Install - disabled');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('[ServiceWorker] Activate - disabled');
  return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // Do nothing - let the browser handle all requests normally
  return;
});
