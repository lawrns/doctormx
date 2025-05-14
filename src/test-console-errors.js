// Script to check for console errors
console.log('Testing for console errors...');

// Function to check for common React errors
function checkForReactErrors() {
  // Check if React is loaded
  if (typeof React === 'undefined') {
    console.error('React is not defined - possible import error');
  }
  
  // Check for invalid component errors
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found - possible mounting issue');
  }
  
  console.log('React error check complete');
}

// Run checks when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  checkForReactErrors();
  console.log('DOM loaded, all checks complete');
});
