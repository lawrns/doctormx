import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { QuestionnaireProvider } from './contexts/QuestionnaireContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import PwaWrapper from './pwa/components/PwaWrapper';
import { initializePwa } from './pwa';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Initialize PWA functionality
// We need to ensure this runs after the app has been mounted 
// to avoid issues with service worker registration timing
window.addEventListener('load', () => {
  initializePwa().catch(error => {
    console.error('[PWA] Initialization error:', error);
  });
});

// Remove time-based theming in favor of user preference and system settings via ThemeProvider

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