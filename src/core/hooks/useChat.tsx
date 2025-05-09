import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  imageUrl?: string;
  isLoading?: boolean;
};

export type ChatContextType = {
  messages: Message[];
  addMessage: (text: string, sender: 'user' | 'bot', imageUrl?: string) => void;
  updateLastMessage: (updates: Partial<Message>) => void;
  clearMessages: () => void;
  severityLevel: number;
  setSeverityLevel: React.Dispatch<React.SetStateAction<number>>;
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  isAnalyzing: boolean;
  setIsAnalyzing: React.Dispatch<React.SetStateAction<boolean>>;
  sessionId: string | null;
  setSessionId: React.Dispatch<React.SetStateAction<string | null>>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [severityLevel, setSeverityLevel] = useState(10);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const addMessage = (text: string, sender: 'user' | 'bot', imageUrl?: string) => {
    const newMessage = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      imageUrl
    };
    
    setMessages(prev => [...prev, newMessage]);
  };
  
  const updateLastMessage = (updates: Partial<Message>) => {
    setMessages(prev => {
      if (prev.length === 0) return prev;
      
      const lastIndex = prev.length - 1;
      const updatedMessages = [...prev];
      updatedMessages[lastIndex] = {
        ...updatedMessages[lastIndex],
        ...updates
      };
      
      return updatedMessages;
    });
  };
  
  const clearMessages = () => {
    setMessages([]);
    setSessionId(null);
    setSeverityLevel(10);
  };
  
  return (
    <ChatContext.Provider value={{
      messages,
      addMessage,
      updateLastMessage,
      clearMessages,
      severityLevel,
      setSeverityLevel,
      isExpanded,
      setIsExpanded,
      isAnalyzing,
      setIsAnalyzing,
      sessionId,
      setSessionId
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
