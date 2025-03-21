// Global type declarations for the application

interface Window {
  // PWA registration reference
  __SW_REGISTRATION?: ServiceWorkerRegistration;
  
  // Module fixer utilities
  __MODULE_SHIMS__?: Record<string, string>;
  loadModule?: (name: string) => boolean;
  
  // Preloaded modules
  xstate?: any;
  xstateReact?: any;
}
