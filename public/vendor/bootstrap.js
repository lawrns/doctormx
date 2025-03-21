// Bootstrap script to preload all modules before the app starts
// This ensures all dependencies are available

console.log('Loading dependencies...');

// Setup dependency loading mechanism
let resolvePromise;
let rejectPromise;

// Create a global promise that resolves when dependencies are loaded
window.depsLoaded = new Promise((resolve, reject) => {
  resolvePromise = resolve;
  rejectPromise = reject;
});

// Expose a helper function to wait for dependencies
window.waitForDeps = async function() {
  return window.depsLoaded;
};

// Create storage for modules
window.xstate = null;
window.xstateReact = null;

// Load modules in proper sequence with better error handling
function loadDependencies() {
  console.log('Starting dependency loading...');
  
  // Load all modules in parallel
  Promise.all([
    import('/vendor/react.js').catch(e => {
      console.error('Failed to load React:', e);
      return null;
    }),
    import('/vendor/react-dom.js').catch(e => {
      console.error('Failed to load ReactDOM:', e);
      return null;
    }), 
    import('/vendor/xstate.js').catch(e => {
      console.error('Failed to load XState:', e);
      return null;
    }),
    import('/vendor/xstate-react.js').catch(e => {
      console.error('Failed to load XState React:', e);
      return null;
    })
  ])
  .then(deps => {
    // Check for null modules (loading failures)
    const failedModules = deps.filter(dep => dep === null);
    if (failedModules.length > 0) {
      throw new Error(`${failedModules.length} modules failed to load`);
    }
    
    // Make modules accessible in the global scope
    window.xstate = deps[2];
    window.xstateReact = deps[3];
    
    console.log('All dependencies loaded successfully');
    
    // Signal that dependencies are ready
    resolvePromise({ xstate: deps[2], xstateReact: deps[3] });
  })
  .catch(error => {
    console.error('Error loading dependencies:', error);
    rejectPromise(error);
  });
}

// Start loading immediately
loadDependencies();
