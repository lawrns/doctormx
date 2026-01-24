// This script tries to load modules from CDN for unresolved modules
(function() {
  // List of problematic modules and their CDN URLs
  window.__MODULE_SHIMS__ = {
    '@xstate/react': 'https://esm.sh/@xstate/react@3.2.2',
    'xstate': 'https://esm.sh/xstate@4.38.2',
    'localforage': 'https://esm.sh/localforage@1.10.0'
  };
  
  // Function to dynamically load a script
  window.loadModule = function(name) {
    if (window.__MODULE_SHIMS__[name]) {
      console.log(`[Module Fixer] Loading ${name} from CDN`);
      const script = document.createElement('script');
      script.type = 'module';
      script.src = window.__MODULE_SHIMS__[name];
      document.head.appendChild(script);
      return true;
    }
    return false;
  };
  
  // Listen for unhandled errors that might be module resolution issues
  window.addEventListener('error', function(event) {
    const error = event.error || {};
    const errorMsg = error.message || event.message || '';
    
    // Check if it's a module resolution error
    if (errorMsg.includes('Failed to resolve module specifier')) {
      // Extract the module name from the error message
      const moduleMatch = errorMsg.match(/module specifier "([^"]+)"/);
      if (moduleMatch && moduleMatch[1]) {
        const moduleName = moduleMatch[1];
        if (window.__MODULE_SHIMS__[moduleName]) {
          console.warn(`[Module Fixer] Attempting to load ${moduleName} from CDN`);
          window.loadModule(moduleName);
        }
      }
    }
  }, true); // Use capture phase to catch all errors
  
  console.log('[Module Fixer] Ready - Will try to handle module resolution errors');
})();
