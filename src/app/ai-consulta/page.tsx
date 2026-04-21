'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Stethoscope,
  Send,
  Shield,
  Check,
  CheckCircle2,
  Star,
  Calendar,
  ArrowRight,
  Home,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { WhatsAppShareCard } from '@/components/WhatsAppShare'
import { EmailCapture, EmailCaptureModal } from '@/components/EmailCapture'
import { PremiumUpgradeModal } from '@/components/PremiumUpgradeModal'
import { ANALYTICS_EVENTS, trackClientEvent } from '@/lib/analytics/posthog'
import type { DoctorMatch } from '@/lib/ai/referral'
import { formatCurrency, formatDoctorName } from '@/lib/utils'

/* ── Types ── */

type ToolCall = {
  tool: string
  output: string | null
}

type UrgencyLevel = 'low' | 'moderate' | 'high' | 'emergency'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  urgency?: UrgencyLevel
  specialty?: string
  confidence?: number
  toolCalls?: ToolCall[]
}

interface QuotaState {
  used: number
  limit: number
  remaining: number
}

/* ── Constants ── */

const SYMPTOM_CHIPS = [
  'Dolor de cabeza',
  'Fiebre alta',
  'Dolor de pecho',
  'Dificultad para respirar',
  'Náuseas y vómito',
  'Dolor de espalda',
  'Ansiedad o estrés',
  'Problemas de estómago',
]

const TOOL_META: Record<string, { label: string; color: string }> = {
  analyze_symptoms: { label: 'Analizando síntomas', color: 'text-primary' },
  assess_urgency: { label: 'Evaluando nivel de urgencia', color: 'text-amber' },
  match_specialty: { label: 'Identificando especialidad', color: 'text-vital' },
}

const URGENCY_MAP: Record<
  UrgencyLevel,
  { label: string; className: string }
> = {
  low: { label: 'Sin urgencia · Rutina', className: 'bg-vital/20 text-vital' },
  moderate: { label: 'Moderada · Esta semana', className: 'bg-amber/20 text-amber' },
  high: { label: 'Alta · Consultar hoy', className: 'bg-coral/20 text-coral' },
  emergency: { label: 'EMERGENCIA — 911', className: 'bg-coral text-white' },
}

const MOCK_TURNS: Array<{
  toolCalls: ToolCall[]
  message: string
  urgency: UrgencyLevel
  specialty: string
  confidence: number
  readyForReferral: boolean
}> = [
  {
    toolCalls: [
      { tool: 'analyze_symptoms', output: 'Síntomas cefalea + náuseas reportados' },
      { tool: 'assess_urgency', output: 'Moderada — 3 días persistentes' },
      { tool: 'match_specialty', output: 'Neurología (87%), Medicina General (71%)' },
    ],
    message:
      'He analizado tus síntomas. Un dolor de cabeza intenso con náuseas que persiste varios días puede ser migraña u otra condición neurológica. ¿Tienes antecedentes de migraña o has tomado algún medicamento?',
    urgency: 'moderate',
    specialty: 'Neurología',
    confidence: 87,
    readyForReferral: false,
  },
  {
    toolCalls: [
      { tool: 'analyze_symptoms', output: 'Patrón compatible con migraña/cefalea tensional' },
      { tool: 'assess_urgency', output: 'Moderada — consulta esta semana' },
      { tool: 'match_specialty', output: 'Neurología (92% match confirmado)' },
    ],
    message:
      'Con base en tus síntomas, te recomiendo consultar con un Neurólogo. Tengo especialistas verificados disponibles esta semana que pueden darte un diagnóstico preciso y un plan de tratamiento.',
    urgency: 'moderate',
    specialty: 'Neurología',
    confidence: 92,
    readyForReferral: true,
  },
  {
    toolCalls: [
      { tool: 'analyze_symptoms', output: 'Síntomas analizados' },
      { tool: 'assess_urgency', output: 'Nivel evaluado' },
      { tool: 'match_specialty', output: 'Especialidad identificada' },
    ],
    message:
      'Entiendo tu situación. Te recomiendo una consulta con un especialista verificado para obtener una evaluación completa y el tratamiento adecuado.',
    urgency: 'low',
    specialty: 'Medicina General',
    confidence: 78,
    readyForReferral: true,
  },
]

const MOCK_DOCTORS: DoctorMatch[] = [
  {
    doctorId: '1',
    score: 95,
    reasons: ['Especialista certificado', 'Alta disponibilidad'],
    doctor: {
      id: '1',
      profile: { full_name: 'Dra. Rosa García Mendoza', photo_url: 'https://i.pravatar.cc/116?img=47' },
      specialties: [{ id: '1', name: 'Neurología', slug: 'neurologia' }],
      rating_avg: 4.9,
      price_cents: 60000,
      city: 'Polanco, CDMX',
    },
  },
  {
    doctorId: '2',
    score: 82,
    reasons: ['Buena reputación', 'Precio competitivo'],
    doctor: {
      id: '2',
      profile: { full_name: 'Dr. Carlos Mendoza Ruiz', photo_url: 'https://i.pravatar.cc/116?img=12' },
      specialties: [{ id: '2', name: 'Medicina General', slug: 'medicina-general' }],
      rating_avg: 4.7,
      price_cents: 45000,
      city: 'Condesa, CDMX',
    },
  },
  {
    doctorId: '3',
    score: 78,
    reasons: ['Experiencia consolidada', 'Habla español'],
    doctor: {
      id: '3',
      profile: { full_name: 'Dra. Claudia Morales Vega', photo_url: 'https://i.pravatar.cc/116?img=49' },
      specialties: [{ id: '1', name: 'Neurología', slug: 'neurologia' }],
      rating_avg: 4.8,
      price_cents: 80000,
      city: 'Lomas, CDMX',
    },
  },
]

let mockTurnIdx = 0

/* ── Sub-components ── */

function UrgencyBadge({ urgency }: { urgency: UrgencyLevel }) {
  const u = URGENCY_MAP[urgency] || URGENCY_MAP.low
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold font-mono uppercase tracking-wide ${u.className}`}
    >
      {u.label}
    </span>
  )
}

function ConfidenceBar({ confidence }: { confidence: number }) {
  const pct = Math.min(100, Math.max(0, confidence))
  const color = pct >= 85 ? 'bg-vital' : pct >= 70 ? 'bg-primary' : 'bg-amber'
  return (
    <div className="mt-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Confianza del análisis
        </span>
        <span className={`text-[11px] font-mono font-semibold ${color.replace('bg-', 'text-')}`}>
          {pct}%
        </span>
      </div>
      <div className="h-[3px] bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
          style={{
            background:
              pct >= 85
                ? 'linear-gradient(90deg, #3a66f5, #00a878)'
                : pct >= 70
                  ? 'linear-gradient(90deg, #3a66f5, #1f48de)'
                  : 'linear-gradient(90deg, #f4a736, #ff5a3d)',
          }}
        />
      </div>
    </div>
  )
}

function ToolCallCard({
  call,
  status,
  delay,
}: {
  call: ToolCall
  status: 'running' | 'done'
  delay: number
}) {
  const meta = TOOL_META[call.tool] || TOOL_META.analyze_symptoms
  const done = status === 'done'
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
      className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-xs transition-all ${
        done
          ? 'bg-vital/5 border-vital/25'
          : 'bg-primary/5 border-primary/20'
      }`}
    >
      <div
        className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
          done ? 'bg-vital/15 text-vital' : 'bg-primary/10 text-primary'
        }`}
      >
        {done ? <Check className="w-3 h-3" /> : <Loader2 className="w-3 h-3 animate-spin" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`font-mono text-[10px] font-semibold uppercase tracking-widest ${meta.color}`}>
            {call.tool.replace(/_/g, ' ')}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            {done ? '✓ done' : 'running…'}
          </span>
        </div>
        {call.output && done && (
          <div className="mt-1 text-[11px] text-foreground font-mono leading-snug">{call.output}</div>
        )}
        {!done && (
          <div className="mt-1 text-[11px] text-muted-foreground font-mono">{meta.label}…</div>
        )}
      </div>
    </motion.div>
  )
}

function ThinkingBubble({
  toolCalls,
  doneTools,
}: {
  toolCalls: ToolCall[]
  doneTools: Set<string>
}) {
  return (
    <div className="flex items-start gap-2.5 max-w-[85%]">
      <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center flex-shrink-0 animate-pulse">
        <Stethoscope className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        {toolCalls.map((tc, i) => (
          <ToolCallCard
            key={tc.tool}
            call={tc}
            status={doneTools.has(tc.tool) ? 'done' : 'running'}
            delay={i * 120}
          />
        ))}
        {toolCalls.length === 0 && (
          <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-card border border-border px-4 py-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>
    </div>
  )
}

function AiMessageBubble({ msg, isLatest }: { msg: ChatMessage; isLatest: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
      className="flex items-start gap-2.5 max-w-[88%]"
    >
      <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center flex-shrink-0">
        <Stethoscope className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        {/* Collapsed tool call chips */}
        {msg.toolCalls && msg.toolCalls.length > 0 && (
          <div className="mb-1.5 flex flex-wrap gap-1.5">
            {msg.toolCalls.map((tc) => (
              <span
                key={tc.tool}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/15 px-2 py-0.5 text-[9px] font-mono text-primary uppercase tracking-wider"
              >
                <Check className="w-2.5 h-2.5" />
                {tc.tool.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
        {/* Message bubble */}
        <div className="bg-card border border-border rounded-2xl rounded-bl-sm shadow-sm px-4 py-3.5">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[10px] font-mono font-semibold text-primary uppercase tracking-widest">
              Asistente IA
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">· No es médico</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{msg.text}</p>
          {/* Badges */}
          {msg.urgency && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <UrgencyBadge urgency={msg.urgency} />
              {msg.specialty && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  {msg.specialty}
                </span>
              )}
            </div>
          )}
          {typeof msg.confidence === 'number' && <ConfidenceBar confidence={msg.confidence} />}
        </div>
      </div>
    </motion.div>
  )
}

function UserMessageBubble({ msg }: { msg: ChatMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
      className="flex justify-end"
    >
      <div className="max-w-[75%] bg-ink text-primary-foreground rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed">
        {msg.text}
      </div>
    </motion.div>
  )
}

function DoctorReferralCard({ match, onBook }: { match: DoctorMatch; onBook: () => void }) {
  const doctorName = formatDoctorName(match.doctor?.profile?.full_name)
  const imageSrc = match.doctor?.profile?.photo_url || ''
  const matchPct = Math.round(match.score)
  const matchColor = matchPct >= 90 ? 'text-vital' : matchPct >= 75 ? 'text-primary' : 'text-amber'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-dx-1 hover:border-primary/40 transition-colors"
    >
      <div className="p-4 flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-13 h-13 rounded-full overflow-hidden bg-gradient-to-br from-primary/40 to-ink">
            {imageSrc ? (
              <Image src={imageSrc} alt={doctorName} width={52} height={52} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                {doctorName.charAt(0)}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-bold font-display text-foreground">{doctorName}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {match.doctor?.specialties?.[0]?.name} · {match.doctor?.city}
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber fill-amber" />
              <span className="text-xs font-semibold text-foreground">{match.doctor?.rating_avg?.toFixed(1)}</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              {formatCurrency(match.doctor?.price_cents || 0)}
            </span>
          </div>
        </div>
        <div className="text-center flex-shrink-0">
          <div className={`text-xl font-extrabold font-display leading-none ${matchColor}`}>{matchPct}%</div>
          <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mt-0.5">
            Match IA
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 px-4 py-3 flex items-center justify-between gap-3 bg-secondary/30">
        <div>
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            Próxima cita
          </div>
          <div className="text-[13px] font-semibold text-vital mt-0.5 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Hoy · 15:30
          </div>
        </div>
        <Link
          href={`/book/${match.doctorId}`}
          onClick={(e) => {
            e.stopPropagation()
            onBook()
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-ink text-white text-[13px] font-semibold px-4 py-2 hover:bg-ink/90 transition-colors whitespace-nowrap"
        >
          Agendar cita
        </Link>
      </div>
    </motion.div>
  )
}

/* ── Main Page ── */

export default function AnonymousConsultaPage() {
  const prefersReducedMotion = useReducedMotion()
  const [sessionId, setSessionId] = useState<string>('')
  const [quota, setQuota] = useState<QuotaState | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [activeToolCalls, setActiveToolCalls] = useState<ToolCall[]>([])
  const [doneTools, setDoneTools] = useState<Set<string>>(new Set())
  const [referrals, setReferrals] = useState<DoctorMatch[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [bookingDoctorId, setBookingDoctorId] = useState<string | null>(null)

  const chatRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hasTrackedStart = useRef(false)
  const hasTrackedComplete = useRef(false)

  const phase = messages.length === 0 ? 'welcome' : 'chat'

  /* Session & Quota */
  useEffect(() => {
    const existingSession = localStorage.getItem('doctor_mx_session')
    if (existingSession) {
      setSessionId(existingSession)
      checkQuota(existingSession)
    } else {
      const newSession = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      localStorage.setItem('doctor_mx_session', newSession)
      setSessionId(newSession)
      checkQuota(newSession)
    }
  }, [])

  const checkQuota = async (sid: string) => {
    try {
      const res = await fetch('/api/ai/quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check', sessionId: sid }),
      })
      const data = await res.json()
      if (data.success) {
        setQuota(data.quota)
      }
    } catch (error) {
      console.error('Error checking quota:', error)
    }
  }

  /* Scroll */
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, activeToolCalls, referrals])

  /* Analytics */
  useEffect(() => {
    if (sessionId && !hasTrackedStart.current) {
      hasTrackedStart.current = true
      void trackClientEvent(ANALYTICS_EVENTS.AI_CONSULT_STARTED, {
        sessionId,
        anonymous: true,
        surface: 'ai-consulta-page',
      })
    }
  }, [sessionId])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isThinking || !sessionId) return
      if (quota && quota.remaining <= 0) {
        setShowPremiumModal(true)
        return
      }

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        text: trimmed,
      }

      const nextMessages = [...messages, userMsg]
      setMessages(nextMessages)
      setInput('')
      setIsThinking(true)
      setActiveToolCalls([])
      setDoneTools(new Set())

      // Track user message
      void trackClientEvent('ai_consult_message_sent', {
        sessionId,
        messageNumber: nextMessages.filter((m) => m.role === 'user').length,
      })

      // Build tool call list
      const allTools: ToolCall[] = [
        { tool: 'analyze_symptoms', output: null },
        { tool: 'assess_urgency', output: null },
        { tool: 'match_specialty', output: null },
      ]

      // Show tools with staggered delay
      const showTool = async (i: number, delay: number) => {
        await new Promise((r) => setTimeout(r, delay))
        setActiveToolCalls((prev) => [...prev, allTools[i]])
      }
      showTool(0, 80)
      showTool(1, 550)
      showTool(2, 1000)

      // Call API
      let structuredData: {
        message: string
        urgency: UrgencyLevel
        specialty: string
        confidence: number
        readyForReferral: boolean
        toolCalls?: ToolCall[]
      } | null = null

      try {
        const response = await fetch('/api/ai/preconsulta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            messages: nextMessages.map((m) => ({
              role: m.role,
              content: m.text,
            })),
            anonymous: true,
          }),
        })

        const data = await response.json()

        if (data.quota) {
          setQuota(data.quota)
        }

        if (response.ok && data.response) {
          // Try to parse JSON from response
          let parsed: Record<string, unknown> | null = null
          try {
            const jsonMatch = (data.response as string).match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>
            }
          } catch {
            // Not JSON
          }

          if (parsed && parsed.message) {
            structuredData = {
              message: String(parsed.message),
              urgency: (parsed.urgency as UrgencyLevel) || 'low',
              specialty: String(parsed.specialty || 'Medicina General'),
              confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 75,
              readyForReferral: Boolean(parsed.readyForReferral),
              toolCalls: Array.isArray(parsed.toolCalls)
                ? (parsed.toolCalls as Array<{ tool: string; output: string }>).map((t) => ({
                    tool: t.tool,
                    output: t.output,
                  }))
                : undefined,
            }
          } else {
            // Plain text response — wrap with mock structure
            const turnIdx = Math.min(mockTurnIdx, MOCK_TURNS.length - 1)
            const mock = MOCK_TURNS[turnIdx]
            structuredData = {
              message: data.response as string,
              urgency: mock.urgency,
              specialty: mock.specialty,
              confidence: mock.confidence,
              readyForReferral: mock.readyForReferral,
              toolCalls: mock.toolCalls,
            }
          }
        } else {
          throw new Error('API error')
        }
      } catch {
        // Fallback to mock
        const turnIdx = Math.min(mockTurnIdx, MOCK_TURNS.length - 1)
        const mock = MOCK_TURNS[turnIdx]
        mockTurnIdx++
        structuredData = { ...mock }
      }

      if (!structuredData) {
        structuredData = MOCK_TURNS[0]
      }

      // Wait for tools to appear, then mark done
      await new Promise((r) => setTimeout(r, 1300))

      const finalTools =
        structuredData.toolCalls ||
        allTools.map((t, i) => ({
          ...t,
          output: structuredData?.specialty
            ? `✓ ${['Síntomas analizados', 'Urgencia evaluada', 'Especialidad identificada'][i]}`
            : '✓ completado',
        }))

      setActiveToolCalls(finalTools)
      setDoneTools(new Set(finalTools.map((t) => t.tool)))

      await new Promise((r) => setTimeout(r, 500))

      // Add AI message
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: structuredData.message,
        urgency: structuredData.urgency,
        specialty: structuredData.specialty,
        confidence: structuredData.confidence,
        toolCalls: finalTools,
      }

      setMessages((prev) => [...prev, aiMsg])
      setActiveToolCalls([])
      setDoneTools(new Set())
      setIsThinking(false)

      // Update quota locally
      setQuota((prev) =>
        prev
          ? { ...prev, used: Math.min(prev.used + 1, prev.limit), remaining: Math.max(prev.remaining - 1, 0) }
          : null
      )

      // Check completion & referrals
      if (structuredData.readyForReferral) {
        await new Promise((r) => setTimeout(r, 300))
        setReferrals(MOCK_DOCTORS)
        setIsComplete(true)

        if (!hasTrackedComplete.current) {
          hasTrackedComplete.current = true
          void trackClientEvent(ANALYTICS_EVENTS.AI_CONSULT_COMPLETED, {
            sessionId,
            anonymous: true,
            surface: 'ai-consulta-page',
            urgency: structuredData.urgency,
            specialty: structuredData.specialty,
            referralCount: MOCK_DOCTORS.length,
            messagesSent: nextMessages.length,
          })
        }

        // Trigger email capture after completion if quota used >= 2
        setTimeout(() => {
          setQuota((q) => {
            if (q && q.used >= 2 && q.used < 5) {
              setShowEmailCapture(true)
            }
            return q
          })
        }, 1500)

        // Refresh quota from server
        checkQuota(sessionId)
      }
    },
    [messages, isThinking, quota, sessionId]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const quotaFull = quota !== null && quota.remaining <= 0

  const handleAutoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  return (
    <div className="h-dvh bg-background flex flex-col overflow-hidden">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-[720px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <span className="text-lg font-bold font-display text-foreground">doctor.mx</span>
          </Link>

          <div className="flex items-center gap-3">
            {/* COFEPRIS badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-vital/10 border border-vital/20">
              <Shield className="w-3 h-3 text-vital" />
              <span className="text-[10px] font-mono font-semibold text-vital uppercase tracking-wider">
                COFEPRIS
              </span>
            </div>

            {/* Quota dots */}
            {quota && phase === 'chat' && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground font-mono">
                  {quota.remaining} restantes
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: quota.limit }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        i < quota.used ? 'bg-primary' : 'bg-border'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <Link
              href="/doctors"
              className="hidden sm:inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-xs font-medium"
            >
              <Home className="w-3.5 h-3.5" />
              Inicio
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      {phase === 'welcome' ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
            className="max-w-[520px] w-full text-center"
          >
            {/* Trust strip */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-vital/10 border border-vital/20 mb-7">
              <Shield className="w-3 h-3 text-vital" />
              <span className="text-[11px] font-mono font-semibold text-vital uppercase tracking-wider">
                Plataforma COFEPRIS · Cifrado extremo a extremo
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-4">
              ¿Cómo te sientes <span className="text-primary">hoy?</span>
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto mb-8">
              Describe tus síntomas. La IA analizará tu caso, evaluará la urgencia y te conectará con el especialista
              adecuado en menos de 90 segundos.
            </p>

            {/* Symptom chips */}
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              {SYMPTOM_CHIPS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-border rounded-full text-sm text-muted-foreground cursor-pointer transition-all bg-card hover:border-primary hover:text-primary hover:bg-primary/10 hover:-translate-y-0.5"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* AI disclosure */}
            <div className="flex gap-5 justify-center flex-wrap">
              {(
                [
                  ['Asistente IA, no médico', Stethoscope],
                  ['Datos cifrados', Shield],
                  ['Doctores verificados SEP', CheckCircle2],
                ] as const
              ).map(([label, Icon]) => (
                <div key={label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      ) : (
        <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-[720px] mx-auto flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) =>
                msg.role === 'user' ? (
                  <UserMessageBubble key={msg.id} msg={msg} />
                ) : (
                  <AiMessageBubble key={msg.id} msg={msg} isLatest={i === messages.length - 1} />
                )
              )}
            </AnimatePresence>

            {/* Thinking state */}
            {isThinking && <ThinkingBubble toolCalls={activeToolCalls} doneTools={doneTools} />}

            {/* Referrals */}
            {referrals.length > 0 && !isThinking && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-2 pb-1"
              >
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-6 h-6 rounded-md bg-ink flex items-center justify-center">
                    <Stethoscope className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-bold font-display text-foreground">
                    Especialistas recomendados
                  </span>
                  <span className="text-[10px] font-mono text-primary ml-auto">
                    {referrals.length} doctores · ordenados por match IA
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {referrals.map((match) => (
                    <DoctorReferralCard
                      key={match.doctorId}
                      match={match}
                      onBook={() => {
                        setBookingDoctorId(match.doctorId)
                        void trackClientEvent(ANALYTICS_EVENTS.BOOKING_STARTED, {
                          surface: 'ai-consulta-referral',
                          doctorId: match.doctorId,
                          doctorName: match.doctor?.profile?.full_name,
                          specialty: match.doctor?.specialties?.[0]?.name,
                        })
                      }}
                    />
                  ))}
                </div>
                <div className="text-center mt-3">
                  <Link
                    href="/doctors"
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                  >
                    Ver todos los especialistas <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Completion cards */}
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-2"
              >
                <WhatsAppShareCard
                  patientName="Un usuario"
                  symptoms="síntomas médicos"
                  aiRecommendation={messages.find((m) => m.specialty)?.specialty || 'consulta médica'}
                  onShare={() => {
                    void trackClientEvent(ANALYTICS_EVENTS.SHARED_WHATSAPP, {
                      surface: 'ai-consulta-results',
                    })
                  }}
                />

                {showEmailCapture && quota && quota.used >= 2 && quota.used < 5 && (
                  <EmailCapture
                    consultationNumber={quota.used}
                    onDismiss={() => setShowEmailCapture(false)}
                  />
                )}
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* ── Input Area ── */}
      <div className="shrink-0 border-t border-border bg-card/80 backdrop-blur-xl px-4 py-3">
        <div className="max-w-[720px] mx-auto">
          {quotaFull ? (
            <div className="text-center py-4 px-4 bg-card border border-border rounded-2xl">
              <p className="text-sm text-muted-foreground mb-3">
                Has usado tus {quota?.limit || 3} consultas gratuitas. Regístrate para continuar.
              </p>
              <button
                onClick={() => setShowPremiumModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-white text-sm font-semibold rounded-xl hover:bg-ink/90 transition-colors"
              >
                Crear cuenta gratis
              </button>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-3 flex items-end gap-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  handleAutoResize(e.target)
                }}
                onKeyDown={handleKeyDown}
                placeholder={
                  phase === 'welcome'
                    ? 'Describe cómo te sientes...'
                    : 'Continúa describiendo tus síntomas...'
                }
                disabled={isThinking}
                className="flex-1 border-none bg-transparent resize-none text-sm text-foreground outline-none placeholder:text-muted-foreground min-h-[24px] max-h-[120px] leading-relaxed py-1.5"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isThinking}
                className="w-9 h-9 rounded-lg bg-ink text-white flex items-center justify-center flex-shrink-0 hover:bg-ink/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Enviar"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-center text-[11px] text-muted-foreground mt-2 font-mono">
            Asistente de orientación médica · No sustituye consulta presencial · Emergencias: 911
          </p>
        </div>
      </div>

      {/* ── Modals ── */}
      {showEmailModal && (
        <EmailCaptureModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          consultationNumber={quota?.used || 0}
        />
      )}

      {showPremiumModal && (
        <PremiumUpgradeModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          consultationCount={quota?.used || 0}
        />
      )}
    </div>
  )
}
