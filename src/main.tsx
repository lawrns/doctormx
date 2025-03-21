import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { QuestionnaireProvider } from './contexts/QuestionnaireContextLazy';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import PwaWrapper from './pwa/components/PwaWrapper';
import { initAuthHelper } from './lib/auth-helper';
import { ensureDependenciesLoaded, getMissingDependencies } from './lib/dependency-loader';
// Import but don't immediately execute - we'll do that in a controlled way
import './init';

// Initialize the auth helper to detect and prevent auth issues
initAuthHelper();

// Create React Query client with improved error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      onError: (error) => {
        console.error('[QueryClient] Query error:', error);
      }
    },
    mutations: {
      onError: (error) => {
        console.error('[QueryClient] Mutation error:', error);
      }
    }
  }
});

// Show an error message in the UI
function renderErrorMessage(error: unknown) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  createRoot(document.getElementById('root')!).render(
    <div style={{ padding: '20px', color: 'red' }}>
      <h1>Application Error</h1>
      <p>Unable to load required dependencies. Please refresh the page or contact support if this problem persists.</p>
      <details>
        <summary>Error Details</summary>
        <pre>{errorMessage}</pre>
      </details>
    </div>
  );
}

// Wait for dependencies, then mount the application
async function mountApp() {
  // Display a loading message while we initialize
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = '<div style="padding: 20px; text-align: center;"><h3>Loading application...</h3><p>Please wait while we initialize the app.</p></div>';
  }
  
  try {
    // First, ensure all external dependencies are loaded
    console.log('[App] Waiting for dependencies to load...');
    await ensureDependenciesLoaded();
    
    // Perform an extra check to make sure dependencies are actually available
    const missingDeps = getMissingDependencies();
    if (missingDeps.length > 0) {
      throw new Error(`Missing dependencies after initialization: ${missingDeps.join(', ')}`);
    }
    
    console.log('[App] Dependencies loaded, mounting application');
    
    // Mount the application with proper provider nesting
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <SupabaseProvider>
              <AuthProvider>
                <BrowserRouter>
                  <ThemeProvider>
                    <QuestionnaireProvider>
                      <PwaWrapper>
                        <App />
                      </PwaWrapper>
                    </QuestionnaireProvider>
                  </ThemeProvider>
                </BrowserRouter>
              </AuthProvider>
            </SupabaseProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </StrictMode>
    );
  } catch (error) {
    console.error('[App] Error mounting application:', error);
    renderErrorMessage(error);
  }
}

// Start the mounting process with proper error handling
try {
  // Use a small delay to ensure the bootstrap script has a chance to start loading dependencies
  setTimeout(() => {
    mountApp().catch(error => {
      console.error('[App] Unhandled error during mounting:', error);
      renderErrorMessage(error);
    });
  }, 100);
} catch (error) {
  console.error('[App] Critical error during initialization:', error);
  renderErrorMessage(error);
}