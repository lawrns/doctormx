// Google Maps API loader singleton
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let loadingPromise = null;
let isLoaded = false;

/**
 * Load Google Maps API script (singleton pattern)
 * Ensures the script is only loaded once even if called multiple times
 * @param {string[]} libraries - Optional libraries to load (e.g., ['places'])
 * @returns {Promise<boolean>} - Resolves when Google Maps is loaded
 */
export function loadGoogleMapsAPI(libraries = []) {
  // Return immediately if already loaded
  if (isLoaded && window.google && window.google.maps) {
    return Promise.resolve(true);
  }

  // Return existing promise if already loading
  if (loadingPromise) {
    return loadingPromise;
  }

  // Check if API key is available
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not found. Maps will not load.');
    return Promise.reject(new Error('Google Maps API key not configured'));
  }

  // Check if script already exists in DOM
  if (window.google && window.google.maps) {
    isLoaded = true;
    return Promise.resolve(true);
  }

  // Create loading promise
  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const librariesParam = libraries.length > 0 ? `&libraries=${libraries.join(',')}` : '';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}${librariesParam}&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isLoaded = true;
      resolve(true);
    };

    script.onerror = () => {
      loadingPromise = null; // Reset so it can be retried
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });

  return loadingPromise;
}

/**
 * Check if Google Maps API is loaded
 * @returns {boolean}
 */
export function isGoogleMapsLoaded() {
  return isLoaded && window.google && window.google.maps;
}
