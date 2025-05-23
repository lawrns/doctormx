import React, { useEffect, useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

const ChatContainer: React.FC = () => {
  const { isOpen, closeChat } = useChat();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const containerStyle: React.CSSProperties = {
    width: isMobile ? '100%' : '420px',
    height: '90vh',
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
    transition: 'transform 300ms cubic-bezier(0.22,1,0.36,1)',
    transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
    paddingBottom: 'env(safe-area-inset-bottom)', // iOS safe area
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50 flex flex-col"
      style={containerStyle}
      data-testid="chat-container"
    >
      {/* Chat Header */}
      <div className="bg-teal-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
            🤖
          </div>
          <span className="font-semibold">Dr. Simeon</span>
        </div>
        <button
          onClick={closeChat}
          className="text-white hover:text-teal-200 transition-colors"
          aria-label="Cerrar chat"
        >
          ✕
        </button>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ChatMessages />
      </div>

      {/* Chat Input Area */}
      <div className="border-t border-gray-200">
        <ChatInput />
      </div>
    </div>
  );
};

export default ChatContainer; 