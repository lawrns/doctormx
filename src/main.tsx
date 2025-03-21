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
import { getSupabaseClient } from './lib/supabase';
import { initAuthHelper } from './lib/auth-helper';

// Initialize the auth helper to detect and prevent auth issues
initAuthHelper();

// Initialize Supabase client once at the application root
console.log('[App] Initializing Supabase client');
const supabaseClient = getSupabaseClient();

// Pre-warm the auth session to prevent race conditions
supabaseClient.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('[App] Error pre-warming auth session:', error);
  } else {
    console.log('[App] Auth session pre-warmed:', data.session ? 'Active session' : 'No session');
  }
}).catch(error => {
  console.error('[App] Unexpected error pre-warming auth session:', error);
});

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

// Initialize PWA functionality
window.addEventListener('load', () => {
  initializePwa().catch(error => {
    console.error('[PWA] Initialization error:', error);
  });
});

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