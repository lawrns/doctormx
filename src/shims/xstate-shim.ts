// This shim provides access to the xstate module
// It bridges the vendor xstate module to the application

// Use browser global from bootstrap.js
declare global {
  interface Window {
    xstate: any;
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

// Function to ensure xstate is loaded with proper locking
async function ensureXState() {
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
      console.log('[XState-Shim] Waiting for XState dependency...');
      
      // If window.depsLoaded isn't available, create a fallback
      if (!window.depsLoaded) {
        console.warn('[XState-Shim] No global depsLoaded promise found, creating fallback');
        window.depsLoaded = Promise.resolve();
      }
      
      // Wait for dependencies to be loaded
      await window.depsLoaded;
      
      // Check if xstate is available
      if (!window.xstate) {
        throw new Error('XState module not found after dependencies loaded');
      }
      
      // Store the module
      state.module = window.xstate;
      state.initialized = true;
      state.initializing = false;
      
      console.log('[XState-Shim] XState module loaded successfully');
      resolve(state.module);
    } catch (error) {
      state.error = error instanceof Error ? error : new Error(String(error));
      state.initializing = false;
      console.error('[XState-Shim] Failed to load XState:', error);
      reject(error);
    }
  });
  
  return state.initPromise;
}

// Pre-initialize in the background
ensureXState().catch(err => {
  console.warn('[XState-Shim] Background initialization failed:', err);
});

// Create a safe wrapper for xstate functions
function createSafeFunction(fnName: string) {
  return (...args: any[]) => {
    try {
      // If module is already loaded, use it directly
      if (state.initialized && state.module) {
        return state.module[fnName](...args);
      }
      
      // If not initialized, throw a helpful error
      console.error(`[XState-Shim] ${fnName} called before XState was loaded`);
      throw new Error(
        `XState module not yet loaded when calling ${fnName}. This usually means your app ` +
        'is executing code before the bootstrap script finished loading. ' +
        'Make sure your state machines are initialized after the application has mounted.'
      );
    } catch (error) {
      console.error(`[XState-Shim] Error in ${fnName}:`, error);
      throw error;
    }
  };
}

// Export the main xstate functions
export const createMachine = createSafeFunction('createMachine');
export const assign = createSafeFunction('assign');
export const interpret = createSafeFunction('interpret');
export const send = createSafeFunction('send');
export const spawn = createSafeFunction('spawn');

// Export a way to wait for xstate
export const waitForXState = ensureXState;
