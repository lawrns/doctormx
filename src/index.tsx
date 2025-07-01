// Importing without 'as' to avoid duplicate declaration
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { QuestionnaireProvider } from './contexts/QuestionnaireContext';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ToastProvider from './contexts/ToastContext';
import './index.css';
import './mobile.css'; // Import mobile-specific styles
import './styles/ai-doctor-fixes.css';
import './styles/chat-fixes.css';
import './styles/responsive-fixes.css';

import SimpleErrorBoundary from './components/SimpleErrorBoundary';
import './env-check';
import './i18n/config'; // Initialize i18n

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
  <SimpleErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <SupabaseProvider>
              <AuthProvider>
                <BrowserRouter>
                  <ToastProvider>
                    <QuestionnaireProvider>
                      <App />
                    </QuestionnaireProvider>
                  </ToastProvider>
                </BrowserRouter>
              </AuthProvider>
            </SupabaseProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </SimpleErrorBoundary>
);
