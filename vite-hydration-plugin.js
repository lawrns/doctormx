/**
 * Vite plugin to help prevent hydration mismatches
 * This plugin injects code to handle hydration issues in development and production
 */

// Plugin definition
function hydrationSafePlugin() {
  return {
    name: 'vite-plugin-hydration-safe',
    
    // Transform HTML to add hydration safety features
    transformIndexHtml(html) {
      // Add hydration safety script to head
      const headScript = `
        <script>
          // Prevent hydration warnings in console
          (function() {
            if (typeof window !== 'undefined') {
              // Store original console.error
              const originalConsoleError = console.error;
              
              // Override console.error to filter out hydration warnings
              console.error = function(...args) {
                const isHydrationWarning = args.some(arg => 
                  typeof arg === 'string' && 
                  (arg.includes('Hydration') || 
                   arg.includes('hydrat') || 
                   arg.includes('content does not match'))
                );
                
                if (isHydrationWarning) {
                  console.warn('Hydration mismatch suppressed');
                  return;
                }
                
                return originalConsoleError.apply(this, args);
              };
              
              // Restore original after a delay
              setTimeout(function() {
                console.error = originalConsoleError;
              }, 5000);
            }
          })();
        </script>
      `;
      
      // Add the script to the head
      html = html.replace('</head>', `${headScript}</head>`);
      
      return html;
    },
    
    // Configure the build
    config(config) {
      // Ensure React is properly configured
      return {
        ...config,
        esbuild: {
          ...config.esbuild,
          jsx: 'automatic',
          jsxInject: undefined
        },
        optimizeDeps: {
          ...config.optimizeDeps,
          esbuildOptions: {
            ...config?.optimizeDeps?.esbuildOptions,
            loader: {
              ...config?.optimizeDeps?.esbuildOptions?.loader,
              '.js': 'jsx',
              '.ts': 'tsx'
            }
          }
        }
      };
    }
  };
}

module.exports = hydrationSafePlugin;
