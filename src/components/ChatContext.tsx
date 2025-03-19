import React, { createContext, useContext, useState, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatContextType {
  messages: Message[];
  addMessage: (text: string, sender: 'user' | 'bot') => void;
  clearMessages: () => void;
  isTyping: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert string timestamps back to Date objects
        const messagesWithDateObjects = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDateObjects);
      } catch (error) {
        console.error('Error parsing saved chat messages:', error);
        // If there's an error parsing, clear the localStorage
        localStorage.removeItem('chatMessages');
      }
    }
  }, []);
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);
  
  const addMessage = (text: string, sender: 'user' | 'bot') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
    };
    
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    
    // If this is a user message, simulate bot typing and response
    if (sender === 'user') {
      simulateBotResponse(text);
    }
  };
  
  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
  };
  
  // Simple bot response simulation
  const simulateBotResponse = (userMessage: string) => {
    setIsTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      let botResponse = '';
      
      // Very simple pattern matching for demo purposes
      const lowerCaseMessage = userMessage.toLowerCase();
      
      if (lowerCaseMessage.includes('hola') || lowerCaseMessage.includes('saludos')) {
        botResponse = '¡Hola! ¿En qué puedo ayudarte hoy?';
      } else if (lowerCaseMessage.includes('cita') || lowerCaseMessage.includes('agendar')) {
        botResponse = 'Para agendar una cita, puedes usar nuestra sección de búsqueda para encontrar un médico disponible y seleccionar un horario conveniente.';
      } else if (lowerCaseMessage.includes('médico') || lowerCaseMessage.includes('doctor')) {
        botResponse = 'Tenemos especialistas en todas las áreas médicas. ¿Qué tipo de especialista estás buscando?';
      } else if (lowerCaseMessage.includes('precio') || lowerCaseMessage.includes('costo')) {
        botResponse = 'Los precios varían según el especialista y el tipo de consulta. Puedes ver los precios específicos en el perfil de cada médico.';
      } else if (lowerCaseMessage.includes('gracias')) {
        botResponse = '¡De nada! Estoy aquí para ayudarte. ¿Necesitas algo más?';
      } else if (lowerCaseMessage.includes('adios') || lowerCaseMessage.includes('adiós') || lowerCaseMessage.includes('chao')) {
        botResponse = '¡Hasta luego! No dudes en volver si tienes más preguntas.';
      } else {
        botResponse = 'Entiendo. ¿Podrías proporcionar más detalles para ayudarte mejor?';
      }
      
      addMessage(botResponse, 'bot');
      setIsTyping(false);
    }, 1500); // Simulate typing delay
  };
  
  return (
    <ChatContext.Provider value={{ messages, addMessage, clearMessages, isTyping }}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;