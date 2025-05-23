import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  metadata?: any;
}

export interface ChatMetadata {
  age?: string;
  sex?: string;
  symptoms?: string;
}

interface ChatContextType {
  messages: ChatMessage[];
  metadata: ChatMetadata;
  isOpen: boolean;
  sessionStarted: boolean;
  addMessage: (message: Omit<ChatMessage, 'timestamp'>) => void;
  openChat: () => void;
  closeChat: () => void;
  setMetadata: (metadata: ChatMetadata) => void;
  getLastMessage: () => ChatMessage | undefined;
  startSession: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [metadata, setMetadataState] = useState<ChatMetadata>({});
  const [isOpen, setIsOpen] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  const addMessage = (message: Omit<ChatMessage, 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const openChat = () => {
    setIsOpen(true);
    if (!sessionStarted) {
      addMessage({
        id: 'sys-onboard-1',
        sender: 'bot',
        text: '¡Hola! Soy Dr. Simeon 🤖. Para comenzar, ¿puedes decirme tu edad y sexo?',
      });
    }
  };

  const closeChat = () => setIsOpen(false);

  const setMetadata = (newMetadata: ChatMetadata) => {
    setMetadataState(prev => ({ ...prev, ...newMetadata }));
  };

  const getLastMessage = () => {
    return messages[messages.length - 1];
  };

  const startSession = () => setSessionStarted(true);

  const value: ChatContextType = {
    messages,
    metadata,
    isOpen,
    sessionStarted,
    addMessage,
    openChat,
    closeChat,
    setMetadata,
    getLastMessage,
    startSession,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 