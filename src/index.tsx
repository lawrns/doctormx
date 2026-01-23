// Importing without 'as' to avoid duplicate declaration
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';
import './mobile.css'; // Import mobile-specific styles
import './styles/chat-fixes.css';
import './styles/ai-doctor-fixes.css';
import './styles/responsive-fixes.css';
import { AuthProvider } from './contexts/AuthContext';
import { DoctorAuthProvider } from './contexts/DoctorAuthContext';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { QuestionnaireProvider } from './contexts/QuestionnaireContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ToastProvider from './contexts/ToastContext';

import SimpleErrorBoundary from './components/SimpleErrorBoundary';
import './env-check';
import './i18n/config'; // Initialize i18n

// Debug: Log all environment variables that Vite is loading
console.log('[DEBUG] Vite environment variables:', import.meta.env);
console.log('[DEBUG] Available env keys:', Object.keys(import.meta.env));
console.log('[DEBUG] VITE_OPENAI_API_KEY:', import.meta.env.VITE_OPENAI_API_KEY);

// Simple validation at startup - defer full validation until needed
const criticalEnvVars = ['VITE_OPENAI_API_KEY', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
const missingCritical = criticalEnvVars.filter(key => !import.meta.env[key]);

if (missingCritical.length > 0) {
  console.error('[STARTUP ERROR] Missing critical environment variables:', missingCritical);
  // Show user-friendly error
  document.body.innerHTML = `
    <div style="padding: 20px; background: #fee; border: 1px solid #f00; margin: 20px; border-radius: 8px; font-family: sans-serif;">
      <h2>Configuration Error</h2>
      <p>Missing required environment variables: <strong>${missingCritical.join(', ')}</strong></p>
      <p>Please ensure your .env.local file contains these variables with valid values.</p>
      <details style="margin-top: 10px;">
        <summary>Debug Info</summary>
        <pre>Available keys: ${Object.keys(import.meta.env).join(', ')}</pre>
      </details>
    </div>
  `;
} else {
  console.log('[ENV] All critical environment variables are present');
}

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
