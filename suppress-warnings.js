// This script is used to suppress npm deprecation warnings during build
const originalConsoleWarn = console.warn;

// Override console.warn to filter out npm deprecation warnings
console.warn = function(...args) {
  // Check if this is a deprecation warning
  const message = args.join(' ');
  if (message.includes('WARN deprecated') || 
      message.includes('DeprecationWarning') ||
      message.includes('is deprecated')) {
    // Skip logging this warning
    return;
  }
  
  // Otherwise log as normal
  originalConsoleWarn.apply(console, args);
};

// Run the actual build command
require('./node_modules/.bin/craco');
