import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ChatProvider } from './core/hooks/useChat';
import './index.css';
import App from './App';
import { SupabaseProvider } from './contexts/SupabaseContext';

// Create and export the Supabase client
import './lib/supabaseClient';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <SupabaseProvider>
          <ChatProvider>
            <App />
          </ChatProvider>
        </SupabaseProvider>
      </HelmetProvider>
    </BrowserRouter>
  </React.StrictMode>
);
