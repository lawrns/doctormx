'use client';

import { useState, useRef, useEffect } from 'react';
import type { PreConsultaMessage } from '@/lib/ai/types';
import { RecommendedDoctorsCard } from './RecommendedDoctorsCard';
import type { DoctorMatch } from '@/lib/ai/referral';
import { logger } from '@/lib/observability/logger';
import { LiveRegion, useFocusTrap } from '@/components/ui/accessibility';

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
  const [announcement, setAnnouncement] = useState('');
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Focus trap for modal
  useFocusTrap({
    containerRef: modalRef,
    isActive: isOpen,
    onEscape: onCloseAction,
  });

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
      const initialMessage = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: '¡Hola! Soy tu asistente médico virtual. Antes de agendar tu consulta, déjame hacerte algunas preguntas para entender mejor tu situación.\n\n¿Cuál es el motivo principal de tu consulta?',
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
      setAnnouncement('Chat de pre-consulta abierto. El asistente médico te está esperando.');
    }
  }, [isOpen, messages.length]);

  // Announce new messages
  useEffect(() => {
    if (messages.length > previousMessageCount && messages.length > 1) {
      const lastMessage = messages[messages.length - 1];
      setAnnouncement(
        lastMessage.role === 'user'
          ? 'Mensaje enviado. Esperando respuesta...'
          : 'Tienes una nueva respuesta del asistente médico.'
      );
      setPreviousMessageCount(messages.length);
    }
  }, [messages.length, previousMessageCount]);

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
      logger.error('Error in pre-consulta chat', { error: error instanceof Error ? error.message : String(error) });
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Store trigger element reference when opening
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLButtonElement;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preconsulta-title"
      aria-describedby="precura-description"
    >
      <LiveRegion message={announcement} role="status" />
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl h-[600px] bg-white rounded-lg shadow-2xl flex flex-col mx-4"
        role="document"
      >
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 id="preconsulta-title" className="text-lg font-semibold text-gray-900">
              Pre-consulta inteligente
            </h2>
            <p id="precura-description" className="text-sm text-gray-500">
              Ayúdanos a entender tu situación
            </p>
          </div>
          <button
            onClick={onCloseAction}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Cerrar chat de pre-consulta"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4"
          role="log"
          aria-live="polite"
          aria-atomic="false"
          aria-label="Historial de conversación"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              role="article"
              aria-label={message.role === 'user' ? 'Tu mensaje' : 'Respuesta del asistente médico'}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
                  }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <time
                  className="text-xs opacity-70 mt-1 block"
                  dateTime={message.timestamp.toISOString()}
                >
                  {message.timestamp.toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              </div>
            </div>
          ))}

          {/* Recommended Doctors */}
          {referrals.length > 0 && (
            <RecommendedDoctorsCard
              recommendations={referrals}
              consultationType="Pre-consulta"
              onViewAllDoctors={() => window.location.href = "/doctores"}
              onBookDoctor={(doctorId) => {
                window.location.href = `/book/${doctorId}`;
              }}
            />
          )}

          {isLoading && (
            <div className="flex justify-start" role="status" aria-live="polite" aria-label="El asistente médico está escribiendo">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex space-x-2" aria-hidden="true">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="sr-only">El asistente médico está escribiendo...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} tabIndex={-1} aria-hidden="true" />
        </div>

        {/* Input */}
        <footer className="p-4 border-t">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex space-x-2">
            <label htmlFor="preconsulta-input" className="sr-only">
              Escribe tu respuesta para la pre-consulta
            </label>
            <textarea
              id="preconsulta-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Escribe tu respuesta..."
              className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              rows={2}
              disabled={isLoading}
              aria-describedby="preconsulta-input-help"
            />
            <span id="preconsulta-input-help" className="sr-only">
              Presiona Enter para enviar, Shift + Enter para nueva línea
            </span>
            <button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={isLoading ? 'Enviando mensaje...' : 'Enviar respuesta'}
            >
              Enviar
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2" role="note">
            Esta conversación es solo informativa. Un médico revisará tu caso.
          </p>
        </footer>
      </div>
    </div>
  );
}
