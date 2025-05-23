import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AINavbar from './AINavbar';
import AISidebar from './AISidebar';
import AIFooter from './AIFooter';
import ChatAssistant from '../../components/ChatAssistant';
import { SocialIcons } from '../../components/icons/IconProvider';
import ClientOnly from '../../components/ClientOnly';

function DoctorLayout() {
  const [showChatAssistant, setShowChatAssistant] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <AINavbar 
        onSidebarToggle={handleSidebarToggle}
        isSidebarOpen={isSidebarOpen}
      />
      
      {/* Main content area with sidebar */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <AISidebar 
          isOpen={isSidebarOpen} 
          onClose={closeSidebar}
        />
        
        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <AIFooter />

      {/* Chat Assistant */}
      <ClientOnly>
        {showChatAssistant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl h-96 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">Asistente Virtual</h3>
                <button
                  onClick={() => setShowChatAssistant(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 p-4">
                <ChatAssistant onClose={() => setShowChatAssistant(false)} />
              </div>
            </div>
          </div>
        )}
      </ClientOnly>

      {/* Chat Assistant Button */}
      <button
        onClick={() => setShowChatAssistant(!showChatAssistant)}
        className="fixed bottom-6 right-6 bg-brand-jade-600 text-white p-3 rounded-full shadow-lg hover:bg-brand-jade-700 transition-colors z-50 flex items-center justify-center"
        aria-label="Abrir asistente de chat"
      >
        <SocialIcons.MessageCircle size={20} />
      </button>
    </div>
  );
}

export default DoctorLayout; 