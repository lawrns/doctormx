// This shim provides access to the xstate-react module
// It bridges the vendor xstate-react module to the application

// Use browser global from bootstrap.js
declare global {
  interface Window {
    xstateReact: any;
    depsLoaded: Promise<any>;
    waitForDeps: () => Promise<any>;
  }
}

// Initialize state
const state = {
  module: null as any,
  initializing: false,
  initialized: false,
  error: null as Error | null,
  initPromise: null as Promise<any> | null,
};

// Function to ensure xstate-react is loaded with proper locking
async function ensureXStateReact() {
  // Already initialized successfully
  if (state.initialized && state.module) {
    return state.module;
  }
  
  // Return existing promise if initialization is in progress
  if (state.initializing && state.initPromise) {
    return state.initPromise;
  }
  
  // Start initialization
  state.initializing = true;
  state.initPromise = new Promise(async (resolve, reject) => {
    try {
      console.log('[XState-React-Shim] Waiting for XState React dependency...');
      
      // If window.depsLoaded isn't available, create a fallback
      if (!window.depsLoaded) {
        console.warn('[XState-React-Shim] No global depsLoaded promise found, creating fallback');
        window.depsLoaded = Promise.resolve();
      }
      
      // Wait for dependencies to be loaded
      await window.depsLoaded;
      
      // Check if xstate-react is available
      if (!window.xstateReact) {
        throw new Error('XState React module not found after dependencies loaded');
      }
      
      // Store the module
      state.module = window.xstateReact;
      state.initialized = true;
      state.initializing = false;
      
      console.log('[XState-React-Shim] XState React module loaded successfully');
      resolve(state.module);
    } catch (error) {
      state.error = error instanceof Error ? error : new Error(String(error));
      state.initializing = false;
      console.error('[XState-React-Shim] Failed to load XState React:', error);
      reject(error);
    }
  });
  
  return state.initPromise;
}

// Pre-initialize in the background
ensureXStateReact().catch(err => {
  console.warn('[XState-React-Shim] Background initialization failed:', err);
});

// Create a safe wrapper for xstate-react functions
function createSafeFunction(fnName: string) {
  return (...args: any[]) => {
    try {
      // If module is already loaded, use it directly
      if (state.initialized && state.module) {
        return state.module[fnName](...args);
      }
      
      // If not initialized, throw a helpful error
      console.error(`[XState-React-Shim] ${fnName} called before XState React was loaded`);
      throw new Error(
        `XState React module not yet loaded when calling ${fnName}. This usually means your app ` +
        'is executing code before the bootstrap script finished loading. ' +
        'Make sure you are using hooks after the application has properly mounted.'
      );
    } catch (error) {
      console.error(`[XState-React-Shim] Error in ${fnName}:`, error);
      
      // Provide a fallback for hooks when possible
      if (fnName === 'useMachine') {
        console.warn('[XState-React-Shim] Providing fallback for useMachine');
        return [{ context: {}, matches: () => false }, () => {}];
      }
      
      throw error;
    }
  };
}

// Export the main xstate-react hooks
export const useMachine = createSafeFunction('useMachine');
export const useActor = createSafeFunction('useActor');
export const useSelector = createSafeFunction('useSelector');
export const useInterpret = createSafeFunction('useInterpret');

// Export a way to wait for xstate-react
export const waitForXStateReact = ensureXStateReact;
