import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { conversationMemoryService, ConversationSession } from '../features/ai-doctor/services/ConversationMemoryService';

export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  imageUrl?: string;
  audioUrl?: string;
  containsImage?: boolean;
  imageAnalysis?: {
    findings: string;
    confidence: number;
  };
  isEmergency?: boolean;
  severity?: number;
  suggestedSpecialty?: string;
  suggestedConditions?: string[];
  suggestedMedications?: string[];
  followUpQuestions?: string[];
  answerOptions?: any[];
  nearbyProviders?: any[];
  interactiveOptions?: {
    type: 'symptom_category' | 'symptom_duration' | 'symptom_severity' | 'yes_no' | 'follow_up_preference';
    options: string[];
    questionId: string;
  };
  nextQuestionId?: string;
  previousQuestionId?: string;
  isStreaming?: boolean;
  isComplete?: boolean;
  emotionalState?: any;
  personalityApplied?: boolean;
  thinkingStages?: string[];
  culturalFactors?: string[];
  status?: 'sent' | 'delivered' | 'read';
};

type ConversationState = {
  messages: Message[];
  sessionId: string;
  isLoading: boolean;
  conversationStarted: boolean;
  familyMember: string;
  location: { latitude: number; longitude: number } | null;
};

type ConversationAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<Message> } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CONVERSATION_STARTED'; payload: boolean }
  | { type: 'SET_FAMILY_MEMBER'; payload: string }
  | { type: 'SET_LOCATION'; payload: { latitude: number; longitude: number } }
  | { type: 'LOAD_SESSION'; payload: Message[] }
  | { type: 'CLEAR_CONVERSATION' };

const initialState: ConversationState = {
  messages: [
    {
      id: '1',
      text: '¡Hola! Soy Dr. Simeon, tu médico mexicano inteligente. ¿Para quién es la consulta de hoy? Estoy aquí para ayudarte con cualquier problema de salud de tu familia.',
      sender: 'bot',
      timestamp: new Date(),
      personalityApplied: true,
      interactiveOptions: {
        type: 'symptom_category',
        options: ['Para mí', 'Para mi familia', 'Emergencia', 'Consulta general'],
        questionId: 'initial'
      }
    }
  ],
  sessionId: `session_${Date.now()}`,
  isLoading: false,
  conversationStarted: false,
  familyMember: 'myself',
  location: null
};

function conversationReducer(state: ConversationState, action: ConversationAction): ConversationState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      const newMessages = [...state.messages, action.payload];
      // Persist to memory service
      conversationMemoryService.updateSession(state.sessionId, action.payload);
      // Persist to localStorage for instant recovery
      localStorage.setItem(`conversation_${state.sessionId}`, JSON.stringify(newMessages));
      return {
        ...state,
        messages: newMessages
      };

    case 'UPDATE_MESSAGE':
      const updatedMessages = state.messages.map(msg =>
        msg.id === action.payload.id ? { ...msg, ...action.payload.updates } : msg
      );
      // Persist to localStorage
      localStorage.setItem(`conversation_${state.sessionId}`, JSON.stringify(updatedMessages));
      return {
        ...state,
        messages: updatedMessages
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_CONVERSATION_STARTED':
      const started = action.payload;
      localStorage.setItem(`conversation_started_${state.sessionId}`, String(started));
      return { ...state, conversationStarted: started };

    case 'SET_FAMILY_MEMBER':
      localStorage.setItem(`family_member_${state.sessionId}`, action.payload);
      return { ...state, familyMember: action.payload };

    case 'SET_LOCATION':
      localStorage.setItem(`location_${state.sessionId}`, JSON.stringify(action.payload));
      return { ...state, location: action.payload };

    case 'LOAD_SESSION':
      return {
        ...state,
        messages: action.payload
      };

    case 'CLEAR_CONVERSATION':
      // Clear from localStorage
      localStorage.removeItem(`conversation_${state.sessionId}`);
      localStorage.removeItem(`conversation_started_${state.sessionId}`);
      localStorage.removeItem(`family_member_${state.sessionId}`);
      localStorage.removeItem(`location_${state.sessionId}`);
      
      const newSessionId = `session_${Date.now()}`;
      return {
        ...initialState,
        sessionId: newSessionId
      };

    default:
      return state;
  }
}

interface ConversationContextType {
  state: ConversationState;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  setLoading: (loading: boolean) => void;
  setConversationStarted: (started: boolean) => void;
  setFamilyMember: (member: string) => void;
  setLocation: (location: { latitude: number; longitude: number }) => void;
  clearConversation: () => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(conversationReducer, initialState);

  // Load persisted conversation on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(`conversation_${state.sessionId}`);
    const savedStarted = localStorage.getItem(`conversation_started_${state.sessionId}`);
    const savedFamilyMember = localStorage.getItem(`family_member_${state.sessionId}`);
    const savedLocation = localStorage.getItem(`location_${state.sessionId}`);

    if (savedMessages) {
      try {
        const messages = JSON.parse(savedMessages);
        // Ensure dates are properly parsed
        const messagesWithDates = messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        dispatch({ type: 'LOAD_SESSION', payload: messagesWithDates });
      } catch (error) {
        console.error('Failed to load saved messages:', error);
      }
    }

    if (savedStarted) {
      dispatch({ type: 'SET_CONVERSATION_STARTED', payload: savedStarted === 'true' });
    }

    if (savedFamilyMember) {
      dispatch({ type: 'SET_FAMILY_MEMBER', payload: savedFamilyMember });
    }

    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        dispatch({ type: 'SET_LOCATION', payload: location });
      } catch (error) {
        console.error('Failed to load saved location:', error);
      }
    }
  }, [state.sessionId]);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
  };

  const updateMessage = (id: string, updates: Partial<Message>) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload: { id, updates } });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setConversationStarted = (started: boolean) => {
    dispatch({ type: 'SET_CONVERSATION_STARTED', payload: started });
  };

  const setFamilyMember = (member: string) => {
    dispatch({ type: 'SET_FAMILY_MEMBER', payload: member });
  };

  const setLocation = (location: { latitude: number; longitude: number }) => {
    dispatch({ type: 'SET_LOCATION', payload: location });
  };

  const clearConversation = () => {
    dispatch({ type: 'CLEAR_CONVERSATION' });
  };

  return (
    <ConversationContext.Provider
      value={{
        state,
        addMessage,
        updateMessage,
        setLoading,
        setConversationStarted,
        setFamilyMember,
        setLocation,
        clearConversation
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
}