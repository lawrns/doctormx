import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ChatProvider } from './core/hooks/useChat';
import './index.css';
import App from './App';
import { SupabaseProvider } from './contexts/SupabaseContext';

// Import Supabase client but don't re-initialize it
// The client is already exported from supabaseClient.ts

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
