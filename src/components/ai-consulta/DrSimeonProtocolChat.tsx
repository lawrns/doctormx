'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Home,
  Menu,
  Send,
  Shield,
  Stethoscope,
  User,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { DoctorMxLogo } from '@/components/brand/DoctorMxLogo'
import type { DoctorMatch } from '@/lib/ai/referral'
import { formatDoctorName } from '@/lib/utils'
import {
  applyProtocolTurn,
  createInitialProtocolState,
  getCaseSummary,
  getInitialAssistantMessage,
  looksLikeClinicalPrompt,
  seedChiefComplaintBeforeName,
  type CaseSummary,
  type ProtocolState,
} from './protocol'

type ChatMessage = {
  id: string
  role: 'assistant' | 'user'
  text: string
  subtle?: boolean
}

type QuotaState = {
  used: number
  limit: number
  remaining: number
}

type ApiResponse = {
  assistantMessage?: string
  nextQuestion?: string
  protocolStep?: ProtocolState['step']
  caseSummary?: Partial<CaseSummary>
  urgency?: CaseSummary['urgency'] | 'medium'
  specialty?: string
  completed?: boolean
  referrals?: DoctorMatch[]
  quota?: QuotaState
  response?: string
  responseMode?: string
}

const QUICK_STARTS = [
  'Tengo dolor de espalda',
  'Me duele la cabeza desde ayer',
  'Tengo fiebre y cuerpo cortado',
  'Me cuesta respirar',
  'Siento presión en el pecho',
  'No sé si debo ir a urgencias',
]

function makeMessage(role: ChatMessage['role'], text: string, subtle = false): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    text,
    subtle,
  }
}

function normalizeUrgency(value?: string): CaseSummary['urgency'] {
  if (value === 'medium') return 'moderate'
  if (value === 'low' || value === 'moderate' || value === 'high' || value === 'emergency') return value
  return 'pending'
}

function urgencyLabel(value: CaseSummary['urgency']) {
  const labels: Record<CaseSummary['urgency'], string> = {
    pending: 'Pendiente',
    low: 'Rutina',
    moderate: 'Esta semana',
    high: 'Consultar hoy',
    emergency: 'Urgencias ahora',
  }
  return labels[value]
}

function AssistantBubble({ message }: { message: ChatMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start gap-3"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-ink text-primary-foreground">
        <Stethoscope className="size-4" />
      </div>
      <div className="min-w-0 max-w-[720px] rounded-xl border border-border bg-card px-4 py-3 shadow-dx-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-vital">Dr. Simeon</span>
          <span className="text-[10px] text-muted-foreground">Orientación clínica inicial</span>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{message.text}</p>
      </div>
    </motion.div>
  )
}

function UserBubble({ message }: { message: ChatMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="flex justify-end"
    >
      <div className="max-w-[76%] rounded-xl rounded-br-lg bg-ink px-4 py-3 text-sm leading-6 text-primary-foreground">
        {message.text}
      </div>
    </motion.div>
  )
}

function SafetyNote() {
  return (
    <div className="rounded-lg border border-coral/20 bg-coral/5 p-3">
      <div className="flex items-start gap-2">
        <Shield className="mt-0.5 size-4 shrink-0 text-coral" />
        <p className="text-xs leading-5 text-foreground">
          Si hay dolor fuerte en el pecho, falta de aire, desmayo, confusión, debilidad de un lado o sangrado importante, llama al 911.
        </p>
      </div>
    </div>
  )
}

function LeftRail({
  onQuickStart,
  disabled,
}: {
  onQuickStart: (prompt: string) => void
  disabled: boolean
}) {
  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-border bg-card/50 p-4">
      <div className="shrink-0 rounded-xl border border-border bg-background p-4 shadow-dx-1">
        <div className="flex items-center gap-3">
          <div className="relative size-11 overflow-hidden rounded-lg border border-border bg-card">
            <Image src="/images/simeon.png" alt="Dr. Simeon" fill sizes="44px" className="object-cover object-top" priority />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-vital">Orientación inicial</p>
            <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">Dr. Simeon</h2>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Primero tu nombre. Luego una sola pregunta clínica a la vez.
        </p>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Atajos</p>
          <span className="text-[10px] text-muted-foreground">Se guardan como motivo</span>
        </div>
        <div className="mt-3 grid max-h-[calc(100dvh-360px)] gap-2 overflow-hidden">
          {QUICK_STARTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={disabled}
              onClick={() => onQuickStart(prompt)}
              className="flex items-start gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-left transition-colors hover:bg-secondary/70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-vital" />
              <span className="text-sm leading-5 text-foreground">{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 shrink-0">
        <SafetyNote />
      </div>
    </aside>
  )
}

function CaseRail({
  summary,
  referrals,
}: {
  summary: CaseSummary
  referrals: DoctorMatch[]
}) {
  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-border bg-card/50 p-4">
      <div className="rounded-xl border border-border bg-background p-4 shadow-dx-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-vital">Contexto del caso</p>
        <div className="mt-4 grid gap-3">
          <CaseItem icon={User} label="Nombre" value={summary.firstName || 'Por preguntar'} />
          <CaseItem icon={Stethoscope} label="Motivo" value={summary.chiefComplaint || 'Pendiente'} />
          <CaseItem icon={Shield} label="Urgencia" value={urgencyLabel(summary.urgency)} />
          <CaseItem icon={CheckCircle2} label="Especialidad" value={summary.specialty || 'Por definir'} />
          <CaseItem icon={Calendar} label="Siguiente pregunta" value={summary.nextQuestion} />
        </div>
      </div>

      <details className="mt-4 rounded-xl border border-border bg-background p-4 shadow-dx-1">
        <summary className="cursor-pointer text-sm font-medium text-foreground">Derivación sugerida</summary>
        <div className="mt-3 grid gap-2">
          {referrals.length > 0 ? (
            referrals.map((match) => (
              <div key={match.doctorId} className="rounded-lg border border-border bg-card p-3">
                <p className="text-sm font-medium text-foreground">
                  {formatDoctorName(match.doctor?.profile?.full_name)}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {match.doctor?.specialties?.[0]?.name || 'Medicina General'} · {match.doctor?.city || 'Ubicación por confirmar'}
                </p>
                <Link href={`/book/${match.doctorId}`} className="mt-2 inline-flex text-xs font-semibold text-ink hover:text-ink/80">
                  Agendar
                </Link>
              </div>
            ))
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              Aparecerá cuando haya una recomendación real disponible.
            </p>
          )}
        </div>
      </details>
    </aside>
  )
}

function CaseItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-1 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        <p className="mt-0.5 line-clamp-3 text-sm leading-5 text-foreground">{value}</p>
      </div>
    </div>
  )
}

export function DrSimeonProtocolChat({
  anonymous,
  userId,
}: {
  anonymous: boolean
  userId?: string
}) {
  const [sessionId, setSessionId] = useState('')
  const [protocol, setProtocol] = useState<ProtocolState>(() => createInitialProtocolState())
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: 'welcome', role: 'assistant', text: getInitialAssistantMessage() },
  ])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [quota, setQuota] = useState<QuotaState | null>(null)
  const [referrals, setReferrals] = useState<DoctorMatch[]>([])
  const [apiMode, setApiMode] = useState<string | null>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const summary = useMemo(() => getCaseSummary(protocol), [protocol])

  useEffect(() => {
    const key = anonymous ? 'doctor_mx_session' : `doctor_mx_patient_session_${userId || 'user'}`
    const existing = localStorage.getItem(key)
    const nextSession = existing || `${anonymous ? 'anon' : 'patient'}_${Date.now()}_${Math.random().toString(36).slice(2)}`
    if (!existing) localStorage.setItem(key, nextSession)
    setSessionId(nextSession)
  }, [anonymous, userId])

  useEffect(() => {
    if (!sessionId || !anonymous) return
    fetch('/api/ai/quota', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'check', sessionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data.quota) setQuota(data.quota)
      })
      .catch(() => undefined)
  }, [anonymous, sessionId])

  useEffect(() => {
    if (!chatRef.current) return
    chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, isSending])

  const syncWithApi = useCallback(
    async (nextMessages: ChatMessage[], nextProtocol: ProtocolState) => {
      if (!sessionId) return
      try {
        const response = await fetch('/api/ai/preconsulta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            anonymous,
            firstName: nextProtocol.answers.firstName,
            protocolStep: nextProtocol.step,
            answers: nextProtocol.answers,
            caseContext: getCaseSummary(nextProtocol),
            messages: nextMessages.map((message) => ({
              role: message.role,
              content: message.text,
            })),
          }),
        })
        const data = (await response.json()) as ApiResponse

        if (data.quota) setQuota(data.quota)
        if (data.responseMode) setApiMode(data.responseMode)
        if (Array.isArray(data.referrals) && data.referrals.length > 0) {
          setReferrals(data.referrals)
        }
      } catch {
        setApiMode('protocol-fallback')
      }
    },
    [anonymous, sessionId]
  )

  const submitText = useCallback(
    async (rawText: string, fromQuickStart = false) => {
      const text = rawText.trim()
      if (!text || isSending || !sessionId) return
      if (anonymous && quota && quota.remaining <= 0) return

      setIsSending(true)
      setInput('')

      const userMessage = makeMessage('user', text)
      let result
      if (protocol.step === 'first_name' && (fromQuickStart || looksLikeClinicalPrompt(text))) {
        result = seedChiefComplaintBeforeName(protocol, text)
      } else {
        result = applyProtocolTurn(protocol, text)
      }

      const assistantMessage = makeMessage('assistant', result.assistantMessage)
      const nextMessages = [...messages, userMessage, assistantMessage]

      setMessages(nextMessages)
      setProtocol(result.state)

      await syncWithApi(nextMessages, result.state)
      setIsSending(false)
    },
    [anonymous, isSending, messages, protocol, quota, sessionId, syncWithApi]
  )

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void submitText(input)
    }
  }

  const resizeTextarea = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto'
    element.style.height = `${Math.min(element.scrollHeight, 96)}px`
  }

  const quotaFull = anonymous && quota !== null && quota.remaining <= 0

  return (
    <div className="fixed inset-0 flex h-dvh flex-col overflow-hidden bg-background">
      <header className="z-20 h-14 shrink-0 border-b border-border bg-background/95">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
          <Link href="/" aria-label="Doctor.mx inicio" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <DoctorMxLogo markClassName="h-8 w-8" textClassName="text-[1.05rem]" />
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden rounded-lg sm:inline-flex">
              Seguridad clínica
            </Badge>
            {quota ? <span className="font-mono text-xs text-muted-foreground">{quota.remaining} restantes</span> : null}
            <Link href={anonymous ? '/' : '/app'} className="hidden items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground sm:inline-flex">
              <Home className="size-3.5" />
              Inicio
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-lg lg:hidden" aria-label="Abrir contexto">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[86vw] max-w-sm gap-0 p-0" showCloseButton>
                <SheetTitle className="sr-only">Atajos y contexto</SheetTitle>
                <div className="h-full overflow-hidden">
                  <LeftRail onQuickStart={(prompt) => void submitText(prompt, true)} disabled={isSending || quotaFull} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden">
        <div className="mx-auto grid h-full max-w-7xl lg:grid-cols-[280px_minmax(0,1fr)_320px]">
          <div className="hidden min-h-0 lg:block">
            <LeftRail onQuickStart={(prompt) => void submitText(prompt, true)} disabled={isSending || quotaFull} />
          </div>

          <section className="flex min-h-0 flex-col border-x border-border">
            <div ref={chatRef} data-chat-scroll className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              <div className="mx-auto flex max-w-[760px] flex-col gap-4 pb-4">
                <AnimatePresence initial={false}>
                  {messages.map((message) =>
                    message.role === 'user' ? (
                      <UserBubble key={message.id} message={message} />
                    ) : (
                      <AssistantBubble key={message.id} message={message} />
                    )
                  )}
                </AnimatePresence>
                {isSending ? (
                  <div className="flex items-center gap-2 pl-11 text-sm text-muted-foreground">
                    <span className="size-2 rounded-full bg-vital" />
                    Guardando contexto clínico...
                  </div>
                ) : null}
                {summary.urgency === 'emergency' ? (
                  <div className="rounded-xl border border-coral/20 bg-coral/5 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-coral" />
                      <p className="text-sm leading-6 text-foreground">
                        Esta orientación no reemplaza urgencias. Si el síntoma sigue activo, llama al 911 o acude a urgencias.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="shrink-0 border-t border-border bg-card/95 px-4 py-3">
              <div className="mx-auto max-w-[760px]">
                {quotaFull ? (
                  <div className="rounded-xl border border-border bg-background p-4 text-center">
                    <p className="text-sm text-muted-foreground">Terminaste tus consultas gratuitas. Crea una cuenta para continuar.</p>
                    <Link href="/auth/register" className="mt-3 inline-flex rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-primary-foreground">
                      Crear cuenta
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-background p-3 shadow-dx-1 focus-within:border-ink/35 focus-within:ring-2 focus-within:ring-ink/10">
                    <div className="mb-2 flex items-center justify-between gap-3 border-b border-border pb-2">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {summary.nextQuestion}
                      </span>
                      {apiMode ? <span className="hidden text-[10px] text-muted-foreground sm:inline">{apiMode}</span> : null}
                    </div>
                    <div className="flex items-end gap-2">
                      <textarea
                        ref={textareaRef}
                        rows={1}
                        value={input}
                        onChange={(event) => {
                          setInput(event.target.value)
                          resizeTextarea(event.target)
                        }}
                        onKeyDown={handleKeyDown}
                        disabled={isSending}
                        placeholder={summary.nextQuestion}
                        className="max-h-24 min-h-7 flex-1 resize-none border-none bg-transparent py-1.5 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground"
                      />
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => void submitText(input)}
                        disabled={!input.trim() || isSending}
                        className="h-9 w-9 rounded-lg"
                        aria-label="Enviar mensaje"
                      >
                        <Send className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="hidden min-h-0 lg:block">
            <CaseRail summary={summary} referrals={referrals} />
          </div>
        </div>
      </main>
    </div>
  )
}
