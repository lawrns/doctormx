// Dependency loader - ensures external dependencies are loaded before the app initializes

declare global {
  interface Window {
    depsLoaded: Promise<any>;
    waitForDeps: () => Promise<any>;
    xstate: any;
    xstateReact: any;
  }
}

// Keep track of dependency status
const state = {
  initialized: false,
  initializing: false,
  initializationPromise: null as Promise<boolean> | null,
  timeoutMs: 10000, // 10 seconds timeout
  requiredDependencies: ['xstate', 'xstateReact'] as const,
};

// Create a timeout promise helper
function timeout(ms: number) {
  return new Promise<never>((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(`Dependency loading timed out after ${ms}ms`));
    }, ms);
  });
}

/**
 * Ensures all external dependencies are loaded before proceeding
 */
export async function ensureDependenciesLoaded(): Promise<boolean> {
  // If we've already initialized, return immediately
  if (state.initialized) return true;
  
  // If we're in the process of initializing, return that promise
  if (state.initializing && state.initializationPromise) {
    return state.initializationPromise;
  }
  
  // Start initialization
  state.initializing = true;
  state.initializationPromise = new Promise<boolean>(async (resolve, reject) => {
    try {
      console.log('[DependencyLoader] Waiting for dependencies to load...');
      
      // Setup timeout for dependencies to load
      const timeoutPromise = timeout(state.timeoutMs);
      
      // Create fallback in case window.depsLoaded doesn't exist
      if (!window.depsLoaded) {
        console.warn('[DependencyLoader] window.depsLoaded not found, creating fallback');
        window.depsLoaded = Promise.resolve({ success: true });
      }
      
      // Initialize waitForDeps if it doesn't exist
      if (typeof window.waitForDeps !== 'function') {
        console.warn('[DependencyLoader] window.waitForDeps not found, creating fallback');
        window.waitForDeps = () => window.depsLoaded;
      }
      
      // Wait for dependencies to be loaded with a timeout
      const deps = await Promise.race([window.waitForDeps(), timeoutPromise]);
      
      // Perform explicit dependency check
      const missingDeps = state.requiredDependencies.filter(
        dep => typeof window[dep] === 'undefined' || window[dep] === null
      );
      
      if (missingDeps.length > 0) {
        throw new Error(
          `Dependencies still missing after load: ${missingDeps.join(', ')}. ` +
          'This could indicate a loading issue or incorrect script paths.'
        );
      }
      
      console.log('[DependencyLoader] All dependencies loaded successfully');
      state.initialized = true;
      state.initializing = false;
      resolve(true);
    } catch (error) {
      state.initializing = false;
      console.error('[DependencyLoader] Error loading dependencies:', error);
      reject(error);
    }
  });
  
  return state.initializationPromise;
}

/**
 * Check if dependencies are already loaded
 */
export function areDependenciesLoaded(): boolean {
  return state.initialized;
}

/**
 * Explicitly check for specific dependencies, returning a list of
 * any that are missing
 */
export function getMissingDependencies(): string[] {
  return state.requiredDependencies.filter(
    dep => typeof window[dep] === 'undefined' || window[dep] === null
  );
}

// Start loading dependencies immediately when this module is imported
ensureDependenciesLoaded().catch(error => {
  console.error('[DependencyLoader] Failed to preload dependencies:', error);
});
