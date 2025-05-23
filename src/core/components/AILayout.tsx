import React, { useState, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AINavbar from './AINavbar';
import AIFooter from './AIFooter';
import ChatAssistant from '../../components/ChatAssistant';
import { SocialIcons } from '../../components/icons/IconProvider';
import ClientOnly from '../../components/ClientOnly';

function AILayout() {
  const [showChatAssistant, setShowChatAssistant] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Main content area - full width without sidebar */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <AINavbar />
        
        {/* Main content with improved density */}
        <main className="flex-1 overflow-auto bg-white">
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>
        
        {/* Footer - more compact */}
        <AIFooter />

        {/* Chat Assistant Button - repositioned for full-width layout */}
        <button
          onClick={() => setShowChatAssistant(!showChatAssistant)}
          className="fixed bottom-6 right-6 bg-brand-jade-600 text-white p-3 rounded-full shadow-lg hover:bg-brand-jade-700 transition-colors z-50 flex items-center justify-center"
          aria-label="Abrir asistente de chat"
        >
          <SocialIcons.MessageCircle size={20} />
        </button>
        
        {/* Chat Assistant Modal - open when toggled */}
        <ClientOnly>
          {showChatAssistant && (
            <ChatAssistant
              onClose={() => {
                setShowChatAssistant(false);
              }}
            />
          )}
        </ClientOnly>
      </div>
    </div>
  );
}

export default AILayout;
