import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ChatProvider } from './core/hooks/useChat';
import './index.css';
import './mobile.css'; // Import mobile-specific styles
import './styles/chat-fixes.css'; // Import custom CSS fixes for chat UI
import App from './App';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { AuthProvider } from './contexts/AuthContext';
import SimpleErrorBoundary from './components/SimpleErrorBoundary';

// Import Supabase client but don't re-initialize it
// The client is already exported from supabaseClient.ts

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <SupabaseProvider>
          <AuthProvider>
            <ChatProvider>
              <SimpleErrorBoundary>
                <App />
              </SimpleErrorBoundary>
            </ChatProvider>
          </AuthProvider>
        </SupabaseProvider>
      </HelmetProvider>
    </BrowserRouter>
  </React.StrictMode>
);
