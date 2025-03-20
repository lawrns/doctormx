import { createContext, useContext, useState, ReactNode } from 'react';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  severity?: number;
  isEmergency?: boolean;
};

type ChatContextType = {
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  severityLevel: number;
  setSeverityLevel: (level: number) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    text: '¡Hola! Soy el asistente virtual de Doctor.mx. ¿En qué puedo ayudarte hoy?',
    sender: 'bot',
    timestamp: new Date()
  }]);
  const [severityLevel, setSeverityLevel] = useState(10);
  const [isExpanded, setIsExpanded] = useState(false);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <ChatContext.Provider value={{
      messages,
      addMessage,
      severityLevel,
      setSeverityLevel,
      isExpanded,
      setIsExpanded
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}