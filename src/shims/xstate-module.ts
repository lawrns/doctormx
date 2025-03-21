/**
 * XState dependency module loader
 * This provides a safe way to load xstate and xstate/react asynchronously
 */

import { ensureDependenciesLoaded } from '../lib/dependency-loader';

// Track dependency loading status
let xstateLoaded = false;
let xstateReactLoaded = false;
let xstateLoadPromise: Promise<any> | null = null;
let xstateReactLoadPromise: Promise<any> | null = null;

interface XStateModule {
  createMachine: any;
  assign: any;
  interpret: any;
  send: any;
  spawn: any;
}

interface XStateReactModule {
  useMachine: any;
  useActor: any;
  useSelector: any;
  useInterpret: any;
}

// Function to load XState
export async function loadXState(): Promise<XStateModule> {
  if (xstateLoaded && window.xstate) {
    return window.xstate;
  }
  
  if (xstateLoadPromise) {
    return xstateLoadPromise;
  }
  
  xstateLoadPromise = new Promise(async (resolve, reject) => {
    try {
      console.log('[XState-Module] Loading XState...');
      await ensureDependenciesLoaded();
      
      if (!window.xstate) {
        throw new Error('XState not available after dependencies loaded');
      }
      
      xstateLoaded = true;
      console.log('[XState-Module] XState loaded successfully');
      resolve(window.xstate);
    } catch (error) {
      console.error('[XState-Module] Error loading XState:', error);
      reject(error);
    }
  });
  
  return xstateLoadPromise;
}

// Function to load XState/React
export async function loadXStateReact(): Promise<XStateReactModule> {
  if (xstateReactLoaded && window.xstateReact) {
    return window.xstateReact;
  }
  
  if (xstateReactLoadPromise) {
    return xstateReactLoadPromise;
  }
  
  xstateReactLoadPromise = new Promise(async (resolve, reject) => {
    try {
      console.log('[XState-Module] Loading XState/React...');
      await ensureDependenciesLoaded();
      
      if (!window.xstateReact) {
        throw new Error('XState/React not available after dependencies loaded');
      }
      
      xstateReactLoaded = true;
      console.log('[XState-Module] XState/React loaded successfully');
      resolve(window.xstateReact);
    } catch (error) {
      console.error('[XState-Module] Error loading XState/React:', error);
      reject(error);
    }
  });
  
  return xstateReactLoadPromise;
}

// Preload both libraries
export async function preloadXStateLibraries(): Promise<[XStateModule, XStateReactModule]> {
  return Promise.all([loadXState(), loadXStateReact()]);
}

// Start preloading immediately
preloadXStateLibraries().catch(error => {
  console.warn('[XState-Module] Background preloading failed:', error);
});
