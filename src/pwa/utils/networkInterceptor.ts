/**
 * Network interceptor for offline-first PWA functionality
 * Handles API calls with caching and offline fallbacks
 */

import { cachedRequestDb, formDataDb } from './offlineDb';

/**
 * Default cache TTL (Time To Live) values in milliseconds
 */
const CACHE_TTL = {
  DOCTOR_LIST: 24 * 60 * 60 * 1000, // 24 hours
  SYMPTOM_INFO: 7 * 24 * 60 * 60 * 1000, // 7 days
  USER_PROFILE: 30 * 24 * 60 * 60 * 1000, // 30 days
  APPOINTMENTS: 1 * 60 * 60 * 1000, // 1 hour
  DEFAULT: 15 * 60 * 1000, // 15 minutes
};

/**
 * Endpoints that should always try network first
 */
const NETWORK_FIRST_ENDPOINTS = [
  '/api/appointments',
  '/api/auth',
  '/api/user',
  '/api/payment',
];

/**
 * Endpoints that can work with stale cache for offline use
 */
const CACHE_FIRST_ENDPOINTS = [
  '/api/doctors',
  '/api/specialties',
  '/api/symptoms',
  '/api/medical-info',
];

/**
 * Network status tracking
 */
let isOnline = navigator.onLine;
window.addEventListener('online', () => { isOnline = true; });
window.addEventListener('offline', () => { isOnline = false; });

/**
 * Determine cache TTL for a specific endpoint
 */
function getCacheTTL(url: string): number {
  if (url.includes('/api/doctors')) {
    return CACHE_TTL.DOCTOR_LIST;
  } else if (url.includes('/api/symptoms')) {
    return CACHE_TTL.SYMPTOM_INFO;
  } else if (url.includes('/api/user/profile')) {
    return CACHE_TTL.USER_PROFILE;
  } else if (url.includes('/api/appointments')) {
    return CACHE_TTL.APPOINTMENTS;
  }
  
  return CACHE_TTL.DEFAULT;
}

/**
 * Determine if a URL should use cache-first strategy
 */
function isCacheFirst(url: string): boolean {
  return CACHE_FIRST_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

/**
 * A wrapper around fetch that provides offline support
 */
export async function offlineFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = options.method?.toUpperCase() || 'GET';
  const isCacheable = method === 'GET';
  const shouldUseCacheFirst = isCacheable && isCacheFirst(url);
  
  // Extract headers
  const headers: Record<string, string> = {};
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, options.headers);
    }
  }
  
  // Try to get from cache if cache-first
  if (shouldUseCacheFirst) {
    try {
      const cachedResponse = await cachedRequestDb.getCachedResponse(url, method);
      if (cachedResponse) {
        console.log(`[PWA] Using cached response for ${url}`);
        
        // Return a synthetic response
        return new Response(JSON.stringify(cachedResponse), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'X-From-Cache': 'true'
          }
        });
      }
    } catch (error) {
      console.error('[PWA] Error accessing cache:', error);
    }
  }
  
  // Try network if online
  if (isOnline) {
    try {
      const response = await fetch(url, options);
      
      // Cache successful GET responses
      if (isCacheable && response.ok) {
        try {
          const clonedResponse = response.clone();
          const data = await clonedResponse.json();
          
          cachedRequestDb.cacheResponse(
            url,
            data,
            getCacheTTL(url),
            method,
            headers
          );
        } catch (error) {
          console.error('[PWA] Error caching response:', error);
        }
      }
      
      return response;
    } catch (error) {
      console.warn(`[PWA] Network error for ${url}:`, error);
      
      // If POST/PUT/DELETE, store for later sync
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        try {
          const body = options.body 
            ? typeof options.body === 'string' 
              ? JSON.parse(options.body) 
              : options.body
            : {};
            
          await formDataDb.storeFormSubmission(
            url,
            method,
            body,
            url,
            method,
            headers
          );
          
          console.log(`[PWA] Stored ${method} request for later sync:`, url);
          
          // Return a synthetic "accepted" response
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Request stored for later submission',
            offline: true
          }), {
            status: 202,
            headers: { 
              'Content-Type': 'application/json',
              'X-Offline-Stored': 'true'
            }
          });
        } catch (storageError) {
          console.error('[PWA] Error storing offline request:', storageError);
        }
      }
      
      // For cache-first GET, try fallback to cache even if it's stale
      if (isCacheable) {
        try {
          const cachedResponse = await cachedRequestDb.getCachedResponse(url, method);
          if (cachedResponse) {
            console.log(`[PWA] Using stale cached response for ${url}`);
            
            return new Response(JSON.stringify(cachedResponse), {
              status: 200,
              headers: { 
                'Content-Type': 'application/json',
                'X-From-Cache': 'true',
                'X-Cache-Status': 'stale'
              }
            });
          }
        } catch (cacheError) {
          console.error('[PWA] Error accessing cache for fallback:', cacheError);
        }
      }
    }
  } else {
    console.log(`[PWA] Offline, trying cache for ${url}`);
    
    // We're offline - for GET, try cache
    if (isCacheable) {
      try {
        const cachedResponse = await cachedRequestDb.getCachedResponse(url, method);
        if (cachedResponse) {
          console.log(`[PWA] Using cached response for ${url} while offline`);
          
          return new Response(JSON.stringify(cachedResponse), {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'X-From-Cache': 'true',
              'X-Offline': 'true'
            }
          });
        }
      } catch (error) {
        console.error('[PWA] Error accessing cache while offline:', error);
      }
    }
    
    // For POST/PUT/DELETE, store for later sync
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      try {
        const body = options.body 
          ? typeof options.body === 'string' 
            ? JSON.parse(options.body) 
            : options.body
          : {};
          
        await formDataDb.storeFormSubmission(
          url,
          method,
          body,
          url,
          method,
          headers
        );
        
        console.log(`[PWA] Stored offline ${method} request for later sync:`, url);
        
        // Return a synthetic "accepted" response
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'You are offline. Request stored for later submission.',
          offline: true
        }), {
          status: 202,
          headers: { 
            'Content-Type': 'application/json',
            'X-Offline-Stored': 'true'
          }
        });
      } catch (storageError) {
        console.error('[PWA] Error storing offline request:', storageError);
      }
    }
  }
  
  // If we got here, we couldn't get a response from network or cache
  return new Response(JSON.stringify({ 
    error: 'NetworkError',
    message: 'No network connection and no cached data available' 
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Background sync functionality to retry stored requests
 */
export async function syncOfflineRequests(): Promise<{ 
  success: number; 
  failed: number; 
  remaining: number 
}> {
  if (!isOnline) {
    return { success: 0, failed: 0, remaining: 0 };
  }
  
  const pendingSubmissions = await formDataDb.getPendingSubmissions();
  
  if (pendingSubmissions.length === 0) {
    return { success: 0, failed: 0, remaining: 0 };
  }
  
  let successCount = 0;
  let failedCount = 0;
  
  for (const submission of pendingSubmissions) {
    try {
      const { url, method, data, headers, id } = submission;
      
      if (!id) continue;
      
      const response = await fetch(url, {
        method,
        headers: headers || { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        await formDataDb.delete(id);
        successCount++;
      } else {
        // Increment retry count and update
        const updatedSubmission = {
          ...submission,
          retryCount: submission.retryCount + 1
        };
        
        // If we've tried too many times (5), give up
        if (updatedSubmission.retryCount >= 5) {
          await formDataDb.delete(id);
        } else {
          await formDataDb.put(updatedSubmission);
        }
        
        failedCount++;
      }
    } catch (error) {
      console.error('[PWA] Error syncing offline request:', error);
      failedCount++;
    }
  }
  
  // Get remaining count
  const remainingSubmissions = await formDataDb.getPendingSubmissions();
  
  return {
    success: successCount,
    failed: failedCount,
    remaining: remainingSubmissions.length
  };
}

/**
 * Register to retry offline requests when coming online
 */
export function setupOfflineSync(): void {
  window.addEventListener('online', () => {
    console.log('[PWA] Back online, syncing offline requests...');
    syncOfflineRequests()
      .then(result => {
        if (result.success > 0) {
          console.log(`[PWA] Successfully synced ${result.success} offline requests`);
          
          // Maybe show a notification to the user
          if ('serviceWorker' in navigator && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              navigator.serviceWorker.ready.then(registration => {
                registration.showNotification('Doctor.mx - Sincronización', {
                  body: `Se han sincronizado ${result.success} solicitudes pendientes.`,
                  icon: '/icons/icon-192x192.png',
                  badge: '/icons/badge-72x72.png'
                });
              });
            }
          }
        }
        
        if (result.failed > 0) {
          console.warn(`[PWA] Failed to sync ${result.failed} offline requests`);
        }
        
        if (result.remaining > 0) {
          console.log(`[PWA] ${result.remaining} offline requests still pending`);
        }
      })
      .catch(error => {
        console.error('[PWA] Error during offline sync:', error);
      });
  });
}

/**
 * Clean expired cache entries periodically
 */
export function setupCacheCleanup(intervalMs: number = 3600000): void { // Default 1 hour
  // Clean on startup
  cachedRequestDb.cleanExpiredEntries()
    .catch(error => {
      console.error('[PWA] Error cleaning cache:', error);
    });
  
  // Setup interval for regular cleaning
  setInterval(() => {
    cachedRequestDb.cleanExpiredEntries()
      .catch(error => {
        console.error('[PWA] Error cleaning cache:', error);
      });
  }, intervalMs);
}
