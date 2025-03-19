import React, { useState, useEffect, useRef } from 'react';
import { useChat } from './ChatContext';

interface ChatAssistantProps {
  onClose: () => void;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ onClose }) => {
  const { messages, addMessage, clearMessages, isTyping } = useChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      addMessage(inputValue, 'user');
      setInputValue('');
    }
  };
  
  // Format timestamp to display time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="fixed bottom-20 right-6 w-80 md:w-96 h-96 bg-white rounded-lg shadow-xl overflow-hidden z-50 flex flex-col border border-gray-200">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center mr-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold">Asistente Doctor.mx</h3>
            <p className="text-xs text-blue-100">¿En qué podemos ayudarte?</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={clearMessages}
            className="text-white hover:text-blue-200 transition-colors"
            aria-label="Borrar conversación"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button 
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors"
            aria-label="Cerrar chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-sm">No hay mensajes aún.</p>
            <p className="text-xs mt-1">Haz una pregunta para comenzar la conversación.</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-3 flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p
                    className={`text-xs mt-1 text-right ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="mb-3 flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-2 bg-white text-gray-800 rounded-bl-none border border-gray-200">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Input area */}
      <form onSubmit={handleSubmit} className="border-t p-2">
        <div className="flex">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Escribe un mensaje..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-r-md px-3 py-2 hover:bg-blue-700 transition-colors"
            disabled={!inputValue.trim()}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatAssistant;