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

  // Don't show footer on doctor chat page
  const isDoctosChatPage = location.pathname === '/doctor';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation - now consistent across all pages */}
      <AINavbar />
      
      {/* Main content area - full width without sidebar */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Main content with improved density */}
        <main className="flex-1 overflow-auto bg-white">
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>
        
        {/* Footer - redesigned (hidden on doctor chat page) */}
        {!isDoctosChatPage && <AIFooter />}

        {/* WhatsApp Button - floating at bottom-right */}
        <a
          href="https://wa.me/526144792338"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-20 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#20BA5A] transition-colors z-50 flex items-center justify-center group"
          aria-label="Contactar por WhatsApp"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
          <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            ¡Contáctanos!
          </span>
        </a>

        {/* Chat Assistant Button - repositioned to avoid WhatsApp conflict */}
        <button
          onClick={() => setShowChatAssistant(!showChatAssistant)}
          className="fixed bottom-6 right-6 bg-[#006D77] text-white p-3 rounded-full shadow-lg hover:bg-[#005B66] transition-all duration-200 hover:scale-[1.05] z-50 flex items-center justify-center"
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
