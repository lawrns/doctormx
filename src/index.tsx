// Importing without 'as' to avoid duplicate declaration
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';
import './mobile.css'; // Import mobile-specific styles
import { AuthProvider } from './contexts/AuthContext';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { QuestionnaireProvider } from './contexts/QuestionnaireContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ToastProvider from './contexts/ToastContext';
import { DoctorAuthProvider } from './contexts/DoctorAuthContext';
import SimpleErrorBoundary from './components/SimpleErrorBoundary';
import './env-check';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <SimpleErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <SupabaseProvider>
              <AuthProvider>
                <DoctorAuthProvider>
                  <BrowserRouter>
                    <ToastProvider>
                      <QuestionnaireProvider>
                        <App />
                      </QuestionnaireProvider>
                    </ToastProvider>
                  </BrowserRouter>
                </DoctorAuthProvider>
              </AuthProvider>
            </SupabaseProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </SimpleErrorBoundary>
  </React.StrictMode>
);
