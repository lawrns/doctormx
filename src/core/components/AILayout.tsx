import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AINavbar from './AINavbar';
import AIFooter from './AIFooter';
import ChatAssistant from '../../components/ChatAssistant';
import { SocialIcons } from '../../components/icons/IconProvider';
import ClientOnly from '../../components/ClientOnly';
// Wizard context for onboarding
import { WizardProvider } from '../../contexts/WizardContext';
import { useChat } from '../hooks/useChat';

function AILayout() {
  const [showChatAssistant, setShowChatAssistant] = useState(false);

  const { isExpanded, setIsExpanded } = useChat();
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AINavbar />
      <main className="flex-grow">
        {/* Wizard context for onboarding steps */}
        <WizardProvider>
          <Outlet />
        </WizardProvider>
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
      
      {/* Chat Assistant Modal - open when toggled or via context expansion */}
      <ClientOnly>
        {(showChatAssistant || isExpanded) && (
          <ChatAssistant
            onClose={() => {
              setShowChatAssistant(false);
              setIsExpanded(false);
            }}
          />
        )}
      </ClientOnly>
    </div>
  );
}

export default AILayout;
