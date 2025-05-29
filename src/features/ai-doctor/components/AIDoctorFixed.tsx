import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Send, MessageSquare } from 'lucide-react';
import { useConversation } from '../../../contexts/ConversationContext';
import { anonymousConsultationTracker } from '../../../services/AnonymousConsultationTracker';
import ConversionPrompt from '../../../components/ConversionPrompt';
import { useAuth } from '../../../contexts/AuthContext';
import AIDoctorMobile from './AIDoctorMobile';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

interface AIDoctorProps {
  onClose?: () => void;
  isEmbedded?: boolean;
  initialMessage?: string;
}

function AIDoctorFixed({ onClose, isEmbedded = false, initialMessage }: AIDoctorProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { state: conversationState, addMessage, updateMessage, setConversationStarted } = useConversation();
  const { isAuthenticated } = useAuth();
  const [showConversionPrompt, setShowConversionPrompt] = useState(false);
  const [consultationLimit, setConsultationLimit] = useState(anonymousConsultationTracker.getUsageData());
  
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialMessageSentRef = useRef(false);

  const { messages, sessionId, conversationStarted } = conversationState;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle initial message
  useEffect(() => {
    if (initialMessage && initialMessage.trim() && !initialMessageSentRef.current && !isProcessing) {
      initialMessageSentRef.current = true;
      setInput(initialMessage);
    }
  }, [initialMessage, isProcessing]);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isProcessing) return;

    // Check consultation limit for first message
    if (!conversationStarted) {
      setConversationStarted(true);
      
      // Track consultation for anonymous users
      if (!isAuthenticated) {
        const canStart = anonymousConsultationTracker.canStartConsultation();
        if (!canStart) {
          setShowConversionPrompt(true);
          return;
        }
        
        // Track the consultation
        anonymousConsultationTracker.trackConsultation(sessionId);
        setConsultationLimit(anonymousConsultationTracker.getUsageData());
        
        // Check if we should show a conversion prompt
        const prompt = anonymousConsultationTracker.getConversionPrompt();
        if (prompt?.show && prompt.type !== 'hard') {
          setTimeout(() => {
            setShowConversionPrompt(true);
          }, 3000);
        }
      }
    }

    // Add user message
    const userMessage = {
      text: input,
      sender: 'user' as const
    };
    addMessage(userMessage);
    
    const userInput = input;
    setInput('');
    setIsProcessing(true);

    // Add bot response
    const botMessageId = Date.now().toString();
    const botMessage = {
      id: botMessageId,
      text: '',
      sender: 'bot' as const,
      isStreaming: true,
      isComplete: false,
      timestamp: new Date()
    };
    addMessage(botMessage);

    // Simulate AI response
    setTimeout(() => {
      const response = generateSimpleResponse(userInput);
      updateMessage(botMessageId, {
        text: response,
        isStreaming: false,
        isComplete: true
      });
      setIsProcessing(false);
    }, 1500);
  }, [input, isProcessing, conversationStarted, isAuthenticated, sessionId, addMessage, updateMessage, setConversationStarted]);

  const generateSimpleResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('dolor') && lowerInput.includes('cabeza')) {
      return 'Entiendo que tienes dolor de cabeza. ¿Desde cuándo lo tienes? ¿Es un dolor punzante, opresivo o pulsátil?';
    } else if (lowerInput.includes('fiebre')) {
      return 'La fiebre es una señal importante. ¿Cuál es tu temperatura actual? ¿Tienes otros síntomas como escalofríos o dolor muscular?';
    } else if (lowerInput.includes('estómago') || lowerInput.includes('dolor abdominal')) {
      return 'El dolor abdominal puede tener varias causas. ¿El dolor es constante o viene y va? ¿Has comido algo inusual recientemente?';
    } else if (lowerInput.includes('emergencia') || lowerInput.includes('urgente')) {
      return '🚨 Si es una emergencia médica real, por favor llama al 911 o acude al hospital más cercano inmediatamente.';
    } else {
      return 'Gracias por compartir esa información. ¿Puedes darme más detalles sobre tus síntomas? Por ejemplo, ¿cuándo comenzaron y qué los empeora o mejora?';
    }
  };

  // Mobile version
  if (isMobile && !isEmbedded) {
    return <AIDoctorMobile initialMessage={initialMessage} onBack={onClose} />;
  }

  // Desktop version
  return (
    <div className="h-full flex flex-col bg-white relative">
      {/* Consultation limit indicator */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-[#D0F0EF] to-[#E6F7F5] px-6 py-2 border-b border-[#B8E6E2]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-[#006D77]">
                Consultas gratuitas: {consultationLimit.remaining} de {consultationLimit.total}
              </span>
              <div className="flex space-x-1">
                {Array.from({ length: consultationLimit.total }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < consultationLimit.used ? 'bg-[#006D77]' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <Link 
              to="/register" 
              className="text-sm font-medium text-[#006D77] hover:text-[#005B66] transition-colors"
            >
              Crear cuenta para más consultas →
            </Link>
          </div>
        </div>
      )}

      {/* Chat header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-[#006D77]" />
          <h1 className="text-xl font-semibold text-gray-900">Doctor IA - Chat Médico</h1>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Hola, soy el Dr. Simeon
              </h2>
              <p className="text-gray-600">
                Tu asistente médico virtual. ¿En qué puedo ayudarte hoy?
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-[#006D77] text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                {message.isStreaming && (
                  <span className="inline-flex ml-2">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse animation-delay-200">●</span>
                    <span className="animate-pulse animation-delay-400">●</span>
                  </span>
                )}
              </div>
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe tus síntomas..."
            disabled={isProcessing}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006D77] focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="px-4 py-2 bg-[#006D77] text-white rounded-lg hover:bg-[#005B66] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Conversion Prompt Modal */}
      {showConversionPrompt && (
        <ConversionPrompt
          onClose={() => setShowConversionPrompt(false)}
          onRegister={() => {
            console.log('User clicked register from conversion prompt');
          }}
        />
      )}
    </div>
  );
}

export default AIDoctorFixed;