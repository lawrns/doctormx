'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Crown, SendHorizonal, Stethoscope, X } from 'lucide-react';
import type { PreConsultaMessage } from '@/lib/ai/types';
import type { DoctorMatch } from '@/lib/ai/referral';
import { DoctorAvatar, UserAvatar } from '@/components/ui/avatar';
import { QuotaCounter } from '@/components/QuotaCounter';
import { ReasoningVisualizer } from '@/components/ReasoningVisualizer';
import { ANALYTICS_EVENTS, trackClientEvent } from '@/lib/analytics/posthog';
import { cn, formatCurrency, formatDoctorName } from '@/lib/utils';

type PreConsultaSummary = {
  chiefComplaint: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  suggestedSpecialty: string;
  confidence?: number;
  reasoning?: string;
  redFlags?: string[];
};

type QuotaState = {
  used: number;
  limit: number;
  remaining: number;
};

type ChatMode = 'modal' | 'embedded';

type PreConsultaChatProps = {
  isOpen: boolean;
  onCloseAction: () => void;
  onCompleteAction: (sessionId: string, summary: PreConsultaSummary, referrals?: DoctorMatch[]) => void;
  mode?: ChatMode;
  anonymous?: boolean;
  initialSessionId?: string;
  showQuota?: boolean;
  className?: string;
};

const AI_DOCTOR_NAME = 'Dr. Simeon';
const AI_AVATAR_URL = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=240&q=80';
const PATIENT_AVATAR_URL = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80';
const WELCOME_MESSAGE = 'Hola, soy Dr. Simeon. Te voy a ayudar a resumir tu caso, detectar señales de alerta y orientarte hacia el especialista correcto.\n\nCuéntame cuál es el motivo principal de tu consulta y desde cuándo te sientes así.';

function toSummary(summary: Record<string, unknown> | null | undefined): PreConsultaSummary | null {
  if (!summary) {
    return null;
  }

  return {
    chiefComplaint: typeof summary.chiefComplaint === 'string'
      ? summary.chiefComplaint
      : typeof summary.specialty === 'string'
        ? summary.specialty
        : 'Consulta médica',
    urgencyLevel: summary.urgencyLevel === 'low' || summary.urgencyLevel === 'medium' || summary.urgencyLevel === 'high' || summary.urgencyLevel === 'emergency'
      ? summary.urgencyLevel
      : summary.urgency === 'low' || summary.urgency === 'medium' || summary.urgency === 'high' || summary.urgency === 'emergency'
        ? summary.urgency
        : 'medium',
    suggestedSpecialty: typeof summary.suggestedSpecialty === 'string'
      ? summary.suggestedSpecialty
      : typeof summary.specialty === 'string'
        ? summary.specialty
        : 'Medicina general',
    confidence: typeof summary.confidence === 'number' ? summary.confidence : undefined,
    reasoning: typeof summary.reasoning === 'string' ? summary.reasoning : undefined,
    redFlags: Array.isArray(summary.redFlags) ? summary.redFlags as string[] : undefined,
  };
}

function buildErrorCopy(code?: string) {
  switch (code) {
    case 'quota_exceeded':
      return 'Ya usaste tus consultas gratuitas. Puedes continuar registrándote o actualizar a Premium para recibir orientación ilimitada.';
    case 'configuration_error':
      return 'La experiencia médica asistida no está disponible en este momento. Ya registré el problema para que podamos corregirlo.';
    case 'service_unavailable':
      return 'Nuestros motores clínicos están ocupados temporalmente. Intenta nuevamente en unos minutos.';
    case 'invalid_request':
      return 'No pude procesar tu mensaje. Revisa el texto y vuelve a intentarlo.';
    default:
      return 'Disculpa, hubo un problema temporal. Intenta nuevamente y, si persiste, prueba con un mensaje más breve.';
  }
}

function formatMessageTime(timestamp: Date) {
  return timestamp.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function urgencyBadge(urgency: PreConsultaSummary['urgencyLevel']) {
  const map = {
    low: 'bg-vital/10 text-vital border-vital/20',
    medium: 'bg-coral/10 text-coral border-coral/20',
    high: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    emergency: 'bg-red-500/10 text-red-600 border-red-500/20',
  } as const;

  const label = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    emergency: 'Emergencia',
  } as const;

  return { label: label[urgency], className: map[urgency] };
}

export default function PreConsultaChat({
  isOpen,
  onCloseAction,
  onCompleteAction,
  mode = 'modal',
  anonymous = false,
  initialSessionId,
  showQuota = false,
  className,
}: PreConsultaChatProps) {
  const prefersReducedMotion = useReducedMotion();
  const [messages, setMessages] = useState<PreConsultaMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<PreConsultaSummary | null>(null);
  const [referrals, setReferrals] = useState<DoctorMatch[]>([]);
  const [quota, setQuota] = useState<QuotaState | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [sessionId] = useState(() => initialSessionId || crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasTrackedStart = useRef(false);
  const hasTrackedComplete = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (messages.length === 0) {
      setMessages([
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: WELCOME_MESSAGE,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  }, [messages, referrals, prefersReducedMotion]);

  useEffect(() => {
    if (!isOpen || hasTrackedStart.current) {
      return;
    }

    hasTrackedStart.current = true
    void trackClientEvent(ANALYTICS_EVENTS.AI_CONSULT_STARTED, {
      sessionId,
      anonymous,
      mode,
      surface: 'preconsulta',
    })
  }, [anonymous, isOpen, mode, sessionId])

  const containerClasses = mode === 'modal'
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xl'
    : 'flex-1 flex flex-col min-h-0';

  const panelClasses = mode === 'modal'
    ? 'relative flex h-[min(88vh,860px)] w-full max-w-6xl overflow-hidden rounded-2xl border border-border bg-background shadow-dx-2'
    : 'flex-1 flex flex-col min-h-0 overflow-hidden rounded-2xl border border-border bg-card shadow-dx-1 lg:flex-row';

  const userMessageCount = useMemo(
    () => messages.filter((m) => m.role === 'user').length,
    [messages],
  );

  const statusTone = useMemo(() => {
    if (summary?.urgencyLevel === 'emergency') {
      return 'text-red-400';
    }
    if (summary?.urgencyLevel === 'high') {
      return 'text-orange-400';
    }
    return 'text-vital';
  }, [summary]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) {
      return;
    }

    const userMessage: PreConsultaMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);
    setErrorCode(null);

    try {
      const response = await fetch('/api/ai/preconsulta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          messages: nextMessages,
          anonymous,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorCode(typeof data.error === 'string' ? data.error : 'unknown_error');
        if (data.quota) {
          setQuota(data.quota);
        }
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: buildErrorCopy(typeof data.error === 'string' ? data.error : undefined),
            timestamp: new Date(),
          },
        ]);
        return;
      }

      const assistantMessage: PreConsultaMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: typeof data.response === 'string' ? data.response : 'He registrado tu información clínica correctamente.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setQuota(data.quota ?? null);

      if (Array.isArray(data.referrals)) {
        setReferrals(data.referrals);
      }

      if (data.completed) {
        const normalizedSummary = toSummary(data.summary);
        if (normalizedSummary) {
          setSummary(normalizedSummary);
          if (!hasTrackedComplete.current) {
            hasTrackedComplete.current = true
            void trackClientEvent(ANALYTICS_EVENTS.AI_CONSULT_COMPLETED, {
              sessionId,
              anonymous,
              mode,
              urgency: normalizedSummary.urgencyLevel,
              specialty: normalizedSummary.suggestedSpecialty,
              referralCount: Array.isArray(data.referrals) ? data.referrals.length : 0,
              messagesSent: nextMessages.length,
            })
          }
          setTimeout(() => {
            onCompleteAction(sessionId, normalizedSummary, Array.isArray(data.referrals) ? data.referrals : []);
          }, 900);
        }
      }
    } catch (error) {
      console.error('[PRE-CONSULTA UI] Error sending message:', error);
      setErrorCode('network_error');
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: buildErrorCopy(),
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={cn(containerClasses, className)}>
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: mode === 'modal' ? 20 : 12, scale: mode === 'modal' ? 0.98 : 1 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
        className={panelClasses}
      >
        <div className="hidden w-[360px] shrink-0 self-stretch border-r border-border bg-muted lg:flex lg:flex-col">
          <div className="flex h-full min-h-full flex-col p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DoctorAvatar src={AI_AVATAR_URL} alt={AI_DOCTOR_NAME} name={AI_DOCTOR_NAME} size="xl" isOnline />
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground font-mono">Asistente clínico</p>
                  <h2 className="text-2xl font-semibold font-display text-foreground">{AI_DOCTOR_NAME}</h2>
                </div>
              </div>
              {mode === 'modal' && (
                <button onClick={onCloseAction} className="rounded-full border border-border bg-card p-2 text-foreground transition hover:bg-secondary" aria-label="Cerrar">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="mt-6 flex flex-1 flex-col gap-5 overflow-y-auto">
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm leading-7 text-muted-foreground">
                  Resume tus síntomas con claridad, detecta alertas importantes y llega a tu consulta con una ruta clínica mejor estructurada.
                </p>
              </div>

              <ReasoningVisualizer
                isLoading={isLoading}
                messageCount={userMessageCount}
                summary={summary}
              />

              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground font-mono">Estado actual</p>
                <div className={cn('mt-3 flex items-center gap-3 text-sm font-medium', statusTone)}>
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-current" />
                  {summary ? 'Evaluación lista para compartir con el especialista' : isLoading ? 'Analizando tu conversación en tiempo real' : 'Esperando tu siguiente mensaje'}
                </div>
                {summary ? (
                  <div className="mt-6 space-y-4 rounded-2xl border border-border bg-background p-6 text-sm text-foreground">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-foreground">Urgencia clínica</span>
                      <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', urgencyBadge(summary.urgencyLevel).className)}>
                        {urgencyBadge(summary.urgencyLevel).label}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-muted-foreground">Especialidad sugerida</p>
                      <p className="font-medium text-foreground">{summary.suggestedSpecialty}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 min-h-0 flex-col bg-background">
          <div className="border-b border-border bg-card/80 px-5 py-4 backdrop-blur-xl sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <DoctorAvatar src={AI_AVATAR_URL} alt={AI_DOCTOR_NAME} name={AI_DOCTOR_NAME} size="lg" isOnline className="lg:hidden" />
                <div>
                  <h3 className="text-lg font-semibold font-display text-foreground">Pre-consulta asistida</h3>
                  <p className="text-sm text-muted-foreground">Describe tus síntomas con confianza. Yo me encargo de estructurar el caso.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {showQuota && quota && (
                  <div className="hidden rounded-full border border-border bg-secondary px-3 py-2 sm:flex sm:items-center sm:gap-3">
                    <QuotaCounter used={quota.used} limit={quota.limit} size="sm" />
                  </div>
                )}
                {mode === 'modal' && (
                  <button onClick={onCloseAction} className="rounded-full border border-border p-2 text-muted-foreground transition hover:bg-secondary lg:hidden" aria-label="Cerrar">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-5">
              <AnimatePresence initial={false}>
                {messages.map((message) => {
                  const isAssistant = message.role === 'assistant';
                  return (
                    <motion.div
                      key={message.id}
                      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
                      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
                      className={cn('flex items-end gap-3', isAssistant ? 'justify-start' : 'justify-end')}
                    >
                      {isAssistant && (
                        <DoctorAvatar src={AI_AVATAR_URL} alt={AI_DOCTOR_NAME} name={AI_DOCTOR_NAME} size="default" isOnline className="shadow-md shadow-primary/10" />
                      )}

                      <div className={cn('max-w-[84%] space-y-1', isAssistant ? 'items-start' : 'items-end')}>
                        <div
                          className={cn(
                            'rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm sm:px-5',
                            isAssistant
                              ? 'rounded-bl-md border border-border bg-card text-foreground shadow-dx-1'
                              : 'rounded-br-md bg-ink text-white'
                          )}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <div className={cn('px-1 text-xs text-muted-foreground', isAssistant ? 'text-left' : 'text-right')}>
                          {isAssistant ? AI_DOCTOR_NAME : 'Tú'} · {formatMessageTime(message.timestamp)}
                        </div>
                      </div>

                      {!isAssistant && (
                        <UserAvatar src={PATIENT_AVATAR_URL} alt="Paciente" name="Paciente" size="default" fallbackVariant="primary" className="shadow-md shadow-border" />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1 }}
                  className="flex items-end gap-3"
                >
                  <DoctorAvatar src={AI_AVATAR_URL} alt={AI_DOCTOR_NAME} name={AI_DOCTOR_NAME} size="default" isOnline />
                  <div className="rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3 shadow-dx-1" role="status" aria-live="polite">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary/70 [animation-delay:160ms]" />
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary/40 [animation-delay:320ms]" />
                      <span className="ml-2 text-sm text-muted-foreground">Analizando síntomas y contexto clínico…</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {errorCode && (
                <motion.div
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  className="rounded-2xl border border-coral/20 bg-coral/5 px-4 py-4 text-sm text-coral-foreground shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-coral" />
                    <div>
                      <p className="font-semibold text-coral">Atención temporal</p>
                      <p className="mt-1 text-coral/80">{buildErrorCopy(errorCode)}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {summary && (
                <motion.div
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  className="rounded-2xl border border-vital/20 bg-card p-5 shadow-dx-1"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-vital/10 p-3 text-vital">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold font-display text-foreground">Resumen clínico listo</h4>
                        <p className="text-sm text-muted-foreground">Lo compartiremos al continuar con tu cita.</p>
                      </div>
                    </div>
                    <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', urgencyBadge(summary.urgencyLevel).className)}>
                      {urgencyBadge(summary.urgencyLevel).label}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-secondary p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-mono">Motivo principal</p>
                      <p className="mt-2 text-sm font-medium text-foreground">{summary.chiefComplaint}</p>
                    </div>
                    <div className="rounded-2xl bg-secondary p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-mono">Especialidad sugerida</p>
                      <p className="mt-2 text-sm font-medium text-foreground">{summary.suggestedSpecialty}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {referrals.length > 0 && (
                <motion.div
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 px-1 text-sm font-semibold text-foreground">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    Especialistas mejor posicionados para tu caso
                  </div>
                  <div className="grid gap-4">
                    {referrals.map((match) => {
                      const doctorName = formatDoctorName(match.doctor?.profile?.full_name);
                      const imageSrc = match.doctor?.profile?.photo_url || AI_AVATAR_URL;
                      return (
                        <motion.div
                          key={match.doctorId}
                          whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                          className="overflow-hidden rounded-2xl border border-border bg-card shadow-dx-1"
                        >
                          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-4">
                              <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-secondary">
                                <Image src={imageSrc} alt={doctorName} fill className="object-cover" sizes="64px" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-base font-semibold text-foreground">{doctorName}</p>
                                <p className="truncate text-sm text-muted-foreground">{match.doctor?.specialties?.[0]?.name || 'Especialista recomendado'}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  {typeof match.doctor?.rating_avg === 'number' && <span className="rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-700">★ {match.doctor.rating_avg.toFixed(1)}</span>}
                                  {match.doctor?.city && <span className="rounded-full bg-secondary px-2.5 py-1 font-medium text-foreground">{match.doctor.city}</span>}
                                  {typeof match.doctor?.price_cents === 'number' && <span className="rounded-full bg-vital/10 px-2.5 py-1 font-medium text-vital">{formatCurrency(match.doctor.price_cents)}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-stretch gap-3 sm:items-end">
                              <div className="max-w-xs text-sm text-muted-foreground sm:text-right">{match.reasons?.[0] || 'Perfil recomendado para tu síntoma principal.'}</div>
                              <button
                                onClick={() => { window.location.href = `/book/${match.doctorId}`; }}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink hover:bg-cobalt-800 px-5 py-3 text-sm font-semibold text-white transition-colors"
                              >
                                Agendar con este doctor
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-border bg-card/90 px-4 py-4 backdrop-blur-xl sm:px-6">
            <div className="mx-auto max-w-3xl">
              {showQuota && quota && (
                <div className="mb-3 flex items-center justify-between rounded-2xl border border-border bg-secondary px-4 py-3 sm:hidden">
                  <div>
                    <p className="text-sm font-medium text-foreground">Consultas disponibles</p>
                    <p className="text-xs text-muted-foreground">{quota.remaining} restantes</p>
                  </div>
                  <QuotaCounter used={quota.used} limit={quota.limit} size="sm" />
                </div>
              )}

              <div className="rounded-2xl border border-border bg-secondary p-2 shadow-inner shadow-border/30">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe tus síntomas, su duración y cualquier señal que te preocupe…"
                    className="min-h-[72px] flex-1 resize-none rounded-xl border-0 bg-transparent px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-0"
                    rows={3}
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-ink hover:bg-cobalt-800 px-5 text-sm font-semibold text-white transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {quota?.remaining === 0 ? <Crown className="h-4 w-4" /> : <SendHorizonal className="h-4 w-4" />}
                    {isLoading ? 'Analizando…' : 'Enviar'}
                  </button>
                </div>
              </div>

              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Esta conversación es informativa y no sustituye una valoración médica presencial. Si presentas dolor torácico intenso, falta de aire severa o pérdida de conciencia, busca atención de emergencia de inmediato.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
