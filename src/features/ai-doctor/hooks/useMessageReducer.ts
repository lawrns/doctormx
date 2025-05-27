import { useReducer, useCallback } from 'react';

export interface Message {
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
}

type MessageAction =
  | { type: 'ADD_MESSAGE'; message: Message }
  | { type: 'UPDATE_STREAMING_MESSAGE'; messageId: string; text: string }
  | { type: 'COMPLETE_MESSAGE'; messageId: string; finalData?: Partial<Message> }
  | { type: 'UPDATE_MESSAGE_FIELD'; messageId: string; field: keyof Message; value: any }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'SET_MESSAGES'; messages: Message[] };

const messageReducer = (state: Message[], action: MessageAction): Message[] => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return [...state, action.message];
      
    case 'UPDATE_STREAMING_MESSAGE':
      return state.map(msg => 
        msg.id === action.messageId 
          ? { ...msg, text: action.text, isStreaming: true }
          : msg
      );
      
    case 'COMPLETE_MESSAGE':
      return state.map(msg => 
        msg.id === action.messageId 
          ? { 
              ...msg, 
              isStreaming: false, 
              isComplete: true,
              ...action.finalData
            }
          : msg
      );
      
    case 'UPDATE_MESSAGE_FIELD':
      return state.map(msg => 
        msg.id === action.messageId 
          ? { ...msg, [action.field]: action.value }
          : msg
      );
      
    case 'CLEAR_MESSAGES':
      return [];
      
    case 'SET_MESSAGES':
      return action.messages;
      
    default:
      return state;
  }
};

const initialMessages: Message[] = [
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
];

export function useMessageReducer() {
  const [messages, dispatch] = useReducer(messageReducer, initialMessages);

  const addMessage = useCallback((message: Message) => {
    dispatch({ type: 'ADD_MESSAGE', message });
  }, []);

  const updateStreamingMessage = useCallback((messageId: string, text: string) => {
    dispatch({ type: 'UPDATE_STREAMING_MESSAGE', messageId, text });
  }, []);

  const completeMessage = useCallback((messageId: string, finalData?: Partial<Message>) => {
    dispatch({ type: 'COMPLETE_MESSAGE', messageId, finalData });
  }, []);

  const updateMessageField = useCallback((messageId: string, field: keyof Message, value: any) => {
    dispatch({ type: 'UPDATE_MESSAGE_FIELD', messageId, field, value });
  }, []);

  const clearMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, []);

  const setMessages = useCallback((messages: Message[]) => {
    dispatch({ type: 'SET_MESSAGES', messages });
  }, []);

  return {
    messages,
    addMessage,
    updateStreamingMessage,
    completeMessage,
    updateMessageField,
    clearMessages,
    setMessages
  };
}