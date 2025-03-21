import { X as XIcon, User as UserIcon } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from './ChatContext';
import ExpandedChatAssistant from './ExpandedChatAssistant';
import { SocialIcons } from './icons/IconProvider';
import { Send } from './icons/IconProvider';

type ChatAssistantProps = {
  onClose: () => void;
};

function ChatAssistant({ onClose }: ChatAssistantProps) {
  const { messages, addMessage, isExpanded, setIsExpanded } = useChat();
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.chat-container') && !target.closest('button')) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  const handleSendMessage = () => {
    if (input.trim() === '') return;
    
    addMessage({
      text: input,
      sender: 'user'
    });
    
    setInput('');
    
    setTimeout(() => {
      addMessage({
        text: 'Para brindarte una mejor atención, ¿te gustaría acceder a nuestro asistente completo?',
        sender: 'bot'
      });
    }, 1000);
  };
  
  const toggleVoiceRecording = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      setTimeout(() => {
        setInput('Me gustaría hablar con un médico');
        setIsRecording(false);
      }, 2000);
    }
  };

  if (isExpanded) {
    return <ExpandedChatAssistant onClose={onClose} />;
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-20 right-6 w-80 sm:w-96 h-96 bg-white rounded-lg shadow-xl z-50 flex flex-col chat-container"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-blue-600 text-white rounded-t-lg">
          <h3 className="font-semibold">Asistente Doctor.mx</h3>
          <div className="flex items-center space-x-2">
            <motion.button 
              onClick={() => setIsExpanded(true)}
              className="text-white hover:text-gray-200 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Expandir asistente"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-2V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </motion.button>
            <motion.button 
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Cerrar asistente"
            >
              <XIcon size={20} />
            </motion.button>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          <motion.div layout className="space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 shadow-sm rounded-tl-none'
                }`}>
                  <div className="flex items-center mb-1">
                    {message.sender === 'bot' ? (
                      <SocialIcons.Bot size={16} className="mr-1 text-blue-600" />
                    ) : (
                      <UserIcon size={16} className="mr-1 text-white" />
                    )}
                    <span className={`text-xs ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p>{message.text}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="p-3 border-t border-gray-200 bg-white rounded-b-lg">
          <div className="flex items-center">
            <motion.button 
              className={`p-2 rounded-full mr-2 ${isRecording ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:text-blue-600'}`}
              onClick={toggleVoiceRecording}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Usar micrófono"
            >
              <SocialIcons.Mic size={20} />
            </motion.button>
            <motion.button 
              className="p-2 rounded-full mr-2 text-gray-500 hover:text-blue-600"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Adjuntar archivo"
            >
              <SocialIcons.Paperclip size={20} />
            </motion.button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Escribe tu mensaje..."
              className="flex-1 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <motion.button 
              onClick={handleSendMessage}
              disabled={input.trim() === ''}
              className={`p-2 ml-2 rounded-full ${
                input.trim() === '' 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
              whileHover={input.trim() !== '' ? { scale: 1.1 } : {}}
              whileTap={input.trim() !== '' ? { scale: 0.9 } : {}}
              aria-label="Enviar mensaje"
            >
              <Send size={20} />
            </motion.button>
          </div>
          {isRecording && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-center text-sm text-red-600"
            >
              <span className="inline-block animate-pulse">●</span> Escuchando... Habla ahora
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ChatAssistant;