import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AINavbar from './AINavbar';
import AIFooter from './AIFooter';
import ChatAssistant from '../../components/ChatAssistant';
import { SocialIcons } from '../../components/icons/IconProvider';
import ClientOnly from '../../components/ClientOnly';

function AILayout() {
  const [showChatAssistant, setShowChatAssistant] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AINavbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <AIFooter />

      {/* Chat Assistant Button */}
      <button
        onClick={() => setShowChatAssistant(!showChatAssistant)}
        className="fixed bottom-6 right-6 bg-brand-jade-600 text-white p-4 rounded-full shadow-lg hover:bg-brand-jade-700 transition-colors z-50 flex items-center justify-center"
        aria-label="Abrir asistente de chat"
      >
        <SocialIcons.MessageCircle size={24} />
      </button>
      
      {/* Chat Assistant Modal - Wrapped in ClientOnly to prevent hydration mismatch */}
      <ClientOnly>
        {showChatAssistant && (
          <ChatAssistant onClose={() => setShowChatAssistant(false)} />
        )}
      </ClientOnly>
    </div>
  );
}

export default AILayout;
