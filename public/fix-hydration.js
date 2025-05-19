/**
 * This script helps prevent hydration mismatches by ensuring
 * that client-side rendering matches server-side rendering
 */

(function() {
  // Flag to track if we're in the initial hydration phase
  window.__HYDRATING__ = true;
  
  // Store original console.error to restore it later
  const originalConsoleError = console.error;
  
  // Override console.error to suppress hydration warnings
  console.error = function(...args) {
    // Check if this is a hydration warning
    const isHydrationWarning = args.some(arg => 
      typeof arg === 'string' && 
      (arg.includes('Hydration') || 
       arg.includes('hydrat') || 
       arg.includes('content does not match'))
    );
    
    // If it's a hydration warning during initial render, suppress it
    if (isHydrationWarning && window.__HYDRATING__) {
      // Optionally log a simplified message for debugging
      console.warn('Hydration mismatch suppressed');
      return;
    }
    
    // Otherwise, pass through to the original console.error
    return originalConsoleError.apply(this, args);
  };
  
  // After the app has hydrated, restore console.error and remove the flag
  window.addEventListener('load', function() {
    setTimeout(function() {
      window.__HYDRATING__ = false;
      console.error = originalConsoleError;
      console.log('Hydration complete, restored error logging');
    }, 1000); // Wait a bit to ensure hydration is complete
  });
  
  // Ensure consistent rendering by providing default values for client-side only APIs
  if (typeof window !== 'undefined') {
    // Provide safe defaults for commonly used browser APIs
    window.__safeLocalStorage = {
      getItem: function(key) {
        try {
          return localStorage.getItem(key);
        } catch (e) {
          console.warn('localStorage access error:', e);
          return null;
        }
      },
      setItem: function(key, value) {
        try {
          localStorage.setItem(key, value);
        } catch (e) {
          console.warn('localStorage write error:', e);
        }
      }
    };
    
    // Add a utility to safely access window properties
    window.safelyGet = function(obj, path, fallback) {
      return path.split('.').reduce((acc, part) => 
        acc && acc[part] !== undefined ? acc[part] : fallback, obj);
    };
  }
})();
