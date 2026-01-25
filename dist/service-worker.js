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
  // Explicitly let browser handle manifest and favicon requests normally
  if (event.request.url.includes('manifest.json') || 
      event.request.url.includes('favicon.ico') ||
      event.request.url.includes('%PUBLIC_URL%')) {
    return; // Let browser handle these normally
  }
  
  // Do nothing for all other requests - let the browser handle them normally
  return;
});
