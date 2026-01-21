'use client';

import { useState, useRef, useEffect } from 'react';
import type { PreConsultaMessage } from '@/lib/ai/types';
import type { DoctorMatch } from '@/lib/ai/referral';

type PreConsultaChatProps = {
  isOpen: boolean;
  onCloseAction: () => void;
  onCompleteAction: (sessionId: string, summary: {
    chiefComplaint: string;
    urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
    suggestedSpecialty: string;
  }, referrals?: DoctorMatch[]) => void;
};

export default function PreConsultaChat({ isOpen, onCloseAction, onCompleteAction }: PreConsultaChatProps) {
  const [messages, setMessages] = useState<PreConsultaMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [referrals, setReferrals] = useState<DoctorMatch[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final
  useEffect(() => {
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Scroll to top when opened
  useEffect(() => {
    if (isOpen) {
      window.scrollTo(0, 0);
    }
  }, [isOpen]);

  // Mensaje inicial
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '¡Hola! 👋 Soy tu asistente médico virtual. Antes de agendar tu consulta, déjame hacerte algunas preguntas para entender mejor tu situación.\n\n¿Cuál es el motivo principal de tu consulta?',
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: PreConsultaMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/preconsulta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) throw new Error('Error en la respuesta');

      const data = await response.json();

      // Agregar respuesta del asistente
      const assistantMessage: PreConsultaMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Si la conversación está completa
      if (data.completed && data.summary) {
        if (data.referrals && data.referrals.length > 0) {
          setReferrals(data.referrals);
        }
        setTimeout(() => {
          onCompleteAction(sessionId, data.summary, data.referrals);
        }, 1500);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: PreConsultaMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Disculpa, hubo un error. Por favor intenta de nuevo.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl h-[600px] bg-white rounded-lg shadow-2xl flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Pre-consulta inteligente</h2>
            <p className="text-sm text-gray-500">Ayúdanos a entender tu situación</p>
          </div>
          <button
            onClick={onCloseAction}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
                  }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}

          {/* Recommended Doctors */}
          {referrals.length > 0 && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="text-sm font-semibold text-gray-900 px-2">Especialistas recomendados:</h3>
              <div className="grid gap-3">
                {referrals.map((match) => (
                  <div key={match.doctorId} className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-blue-200">
                        <span className="text-lg">👨‍⚕️</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{match.doctor?.profile?.full_name || 'Especialista'}</p>
                        <p className="text-xs text-blue-600">{match.reasons[0]}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => window.location.href = `/book/${match.doctorId}`}
                      className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Agendar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu respuesta..."
              className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Enviar
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Esta conversación es solo informativa. Un médico revisará tu caso.
          </p>
        </div>
      </div>
    </div>
  );
}
