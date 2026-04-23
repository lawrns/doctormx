'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { DoctorMxLogo } from '@/components/brand/DoctorMxLogo'

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

const STARTER_GROUPS = [
  {
    label: 'Me duele',
    prompts: ['Me duele la cabeza desde ayer', 'Tengo dolor de espalda', 'Me duele el estómago después de comer'],
  },
  {
    label: 'Tengo fiebre',
    prompts: ['Tengo fiebre y cuerpo cortado', 'Tengo tos y garganta irritada', 'Tengo náuseas y fiebre'],
  },
  {
    label: 'Me preocupa',
    prompts: ['Siento presión en el pecho', 'Me cuesta respirar', 'Tengo mareo repentino'],
  },
  {
    label: 'No sé si es urgente',
    prompts: ['Quiero saber si debo ir a urgencias', 'No sé qué especialista necesito', 'Quiero preparar mi consulta'],
  },
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
  emergency: { label: 'Emergencia · 911', className: 'bg-coral text-primary-foreground' },
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
          ? 'bg-vital/5 border-vital/20'
          : 'bg-secondary border-border'
      }`}
    >
      <div
        className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
          done ? 'bg-vital/15 text-vital' : 'bg-ink/10 text-ink'
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
            {done ? 'Listo' : 'Revisando'}
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
  reviewCount,
}: {
  reviewCount: number
}) {
  return (
    <div className="flex items-start gap-2.5 max-w-[85%]">
      <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center flex-shrink-0">
        <Stethoscope className="w-4 h-4 text-primary-foreground" />
      </div>
      <div className="rounded-xl rounded-bl-md border border-border bg-card px-4 py-3 shadow-sm">
        <p className="text-sm font-medium text-foreground">Voy a revisar señales de alarma y ordenar tu caso.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {reviewCount > 0 ? 'Ya tengo contexto suficiente para hacer la siguiente pregunta.' : 'Empezaré con lo más urgente primero.'}
        </p>
      </div>
    </div>
  )
}

function AiMessageBubble({ msg }: { msg: ChatMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
      className="flex items-start gap-2.5 max-w-[88%]"
    >
      <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center flex-shrink-0">
        <Stethoscope className="w-4 h-4 text-primary-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-card border border-border rounded-xl rounded-bl-md shadow-sm px-4 py-3.5">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[10px] font-mono font-semibold text-vital uppercase tracking-widest">
              Dr. Simeon
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">· Orientación clínica inicial</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{msg.text}</p>
          {msg.urgency && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <UrgencyBadge urgency={msg.urgency} />
              {msg.specialty && (
                <span className="inline-flex items-center rounded-lg border border-border bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground">
                  {msg.specialty}
                </span>
              )}
            </div>
          )}
          {msg.toolCalls && msg.toolCalls.length > 0 && (
            <details className="mt-3 border-t border-border pt-3">
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                Ver cómo se revisó
              </summary>
              <div className="mt-2 grid gap-2">
                {msg.toolCalls.map((tc, index) => (
                  <ToolCallCard key={tc.tool} call={tc} status="done" delay={index * 80} />
                ))}
              </div>
            </details>
          )}
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
      <div className="max-w-[75%] bg-ink text-primary-foreground rounded-xl rounded-br-md px-4 py-3 text-sm leading-relaxed">
        {msg.text}
      </div>
    </motion.div>
  )
}

function DoctorReferralCard({ match, onBook }: { match: DoctorMatch; onBook: () => void }) {
  const doctorName = formatDoctorName(match.doctor?.profile?.full_name)
  const imageSrc = match.doctor?.profile?.photo_url || ''
  const matchPct = Math.round(match.score)
  const matchColor = matchPct >= 90 ? 'text-vital' : matchPct >= 75 ? 'text-ink' : 'text-amber'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl overflow-hidden shadow-dx-1 hover:border-ink/25 transition-colors"
    >
      <div className="p-4 flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-13 h-13 rounded-full overflow-hidden border border-border bg-secondary">
            {imageSrc ? (
              <Image src={imageSrc} alt={doctorName} width={52} height={52} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-foreground text-sm font-bold">
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
            Afinidad
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
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-ink text-primary-foreground text-[13px] font-semibold px-4 py-2 hover:bg-ink/90 transition-colors whitespace-nowrap"
        >
          Agendar cita
        </Link>
      </div>
    </motion.div>
  )
}

function SafetyRow() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-coral/20 bg-coral/5 px-3 py-2 text-xs leading-5 text-foreground">
      <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-coral" aria-hidden="true" />
      <p>
        Si tienes dolor de pecho, falta de aire, pérdida de fuerza, confusión, sangrado intenso o ideas de hacerte daño,
        llama al 911 o acude a urgencias. Dr. Simeon no diagnostica.
      </p>
    </div>
  )
}

function DrSimeonPresenceCard() {
  return (
    <div className="border-y border-border py-6">
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 overflow-hidden rounded-full border border-border bg-card">
          <Image
            src="/images/simeon.png"
            alt="Dr. Simeon"
            fill
            sizes="56px"
            className="object-cover object-top"
            priority
          />
        </div>
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-vital">
            Orientación clínica inicial
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
            Soy Dr. Simeon.
          </h2>
        </div>
      </div>
      <p className="mt-5 max-w-[54ch] text-base leading-7 text-muted-foreground">
        Voy a escucharte, ordenar tu caso y hacerte una pregunta a la vez. Si aparece una señal de alarma, te diré que busques atención urgente.
      </p>
    </div>
  )
}

function StarterGroups({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {STARTER_GROUPS.map((group) => (
        <div key={group.label} className="border-t border-border pt-3">
          <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {group.label}
          </p>
          <div className="grid gap-2">
            {group.prompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onSelect(prompt)}
                className="rounded-lg px-2 py-2 text-left text-sm leading-5 text-foreground transition-colors hover:bg-secondary active:scale-[0.99]"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function WelcomeComposer({
  input,
  isThinking,
  quotaFull,
  onInputChange,
  onSubmit,
  onTextareaInput,
  onKeyDown,
}: {
  input: string
  isThinking: boolean
  quotaFull: boolean
  onInputChange: (value: string) => void
  onSubmit: (value: string) => void
  onTextareaInput: (el: HTMLTextAreaElement) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[0_18px_46px_-34px_hsl(var(--shadow-color)/0.45)]">
      <div className="mb-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-vital">
          Primera pregunta
        </p>
        <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-foreground">
          ¿Qué te preocupa hoy?
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Escribe como se lo contarías a un doctor. Con una frase basta para empezar.
        </p>
      </div>
      <SafetyRow />
      <div className="mt-4 rounded-lg border border-border bg-background p-3 focus-within:border-ink/35 focus-within:ring-2 focus-within:ring-ink/10">
        <textarea
          rows={4}
          value={input}
          onChange={(event) => {
            onInputChange(event.target.value)
            onTextareaInput(event.target)
          }}
          onKeyDown={onKeyDown}
          placeholder="Ej. Tengo dolor de cabeza desde ayer y me preocupa que sea migraña..."
          disabled={isThinking || quotaFull}
          className="max-h-[140px] min-h-[112px] w-full resize-none border-0 bg-transparent text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground focus:ring-0"
        />
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">Dr. Simeon hará una pregunta a la vez.</p>
          <button
            type="button"
            onClick={() => onSubmit(input)}
            disabled={!input.trim() || isThinking || quotaFull}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-ink/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Empezar
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}

function PatientContextNote({ text }: { text: string }) {
  return (
    <div className="ml-10 max-w-[680px] rounded-lg border border-border bg-secondary px-4 py-3 text-sm leading-6 text-muted-foreground">
      <span className="font-semibold text-foreground">Lo que entendí: </span>
      {text}
    </div>
  )
}

function ClinicalReviewRail({
  messages,
  referrals,
  isThinking,
  activeToolCalls,
  doneTools,
}: {
  messages: ChatMessage[]
  referrals: DoctorMatch[]
  isThinking: boolean
  activeToolCalls: ToolCall[]
  doneTools: Set<string>
}) {
  const latestUser = [...messages].reverse().find((message) => message.role === 'user')
  const latestAssistant = [...messages].reverse().find((message) => message.role === 'assistant')
  const urgency = latestAssistant?.urgency ? URGENCY_MAP[latestAssistant.urgency].label : isThinking ? 'En revisión' : 'Pendiente'
  const nextStep = referrals.length > 0
    ? 'Elige un doctor verificado'
    : latestAssistant?.specialty
      ? 'Responder la siguiente pregunta'
      : isThinking
        ? 'Revisar señales de alarma'
        : 'Describe el motivo principal'

  const items = [
    { label: 'Síntomas', value: latestUser?.text || 'Aún no descritos', icon: Stethoscope },
    { label: 'Urgencia', value: urgency, icon: Shield },
    { label: 'Especialidad', value: latestAssistant?.specialty || 'Por definir', icon: CheckCircle2 },
    { label: 'Siguiente paso', value: nextStep, icon: Calendar },
  ]

  return (
    <aside className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-vital">
            Revisión clínica
          </p>
          <h2 className="mt-1 font-display text-lg font-semibold text-foreground">Contexto del caso</h2>
        </div>
        <span className="h-2 w-2 rounded-full bg-vital" aria-hidden="true" />
      </div>
      <div className="divide-y divide-border border-y border-border">
        {items.map((item) => (
          <div key={item.label} className="grid grid-cols-[1.5rem_1fr] gap-3 py-3">
            <item.icon className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-foreground">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
      {activeToolCalls.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            Ver revisión técnica
          </summary>
          <div className="mt-2 grid gap-2">
            {activeToolCalls.map((tool, index) => (
              <ToolCallCard
                key={tool.tool}
                call={tool}
                status={doneTools.has(tool.tool) ? 'done' : 'running'}
                delay={index * 80}
              />
            ))}
          </div>
        </details>
      )}
    </aside>
  )
}

/* ── Main Page ── */

export default function AnonymousConsultaPage() {
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

  const firstUserText = messages.find((message) => message.role === 'user')?.text
  const firstUserMessageId = messages.find((message) => message.role === 'user')?.id
  const userMessageCount = messages.filter((message) => message.role === 'user').length

  return (
    <div className="h-dvh bg-background flex flex-col overflow-hidden">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link
            href="/"
            className="rounded-lg transition-transform active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Doctor.mx - Inicio"
          >
            <DoctorMxLogo markClassName="h-8 w-8" textClassName="text-[1.05rem]" />
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-vital/10 border border-vital/20">
              <Shield className="w-3 h-3 text-vital" />
              <span className="text-[10px] font-mono font-semibold text-vital uppercase tracking-wider">
                Seguridad clínica
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
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
            className="mx-auto grid min-h-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:pt-10"
          >
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-vital/20 bg-vital/10 px-3 py-2">
                <Shield className="w-3 h-3 text-vital" />
                <span className="text-[10px] font-mono font-semibold text-vital uppercase tracking-[0.14em]">
                  Orientación clínica · No sustituye urgencias
                </span>
              </div>

              <h1 className="mt-7 max-w-[11ch] font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Cuéntame qué te preocupa.
              </h1>
              <p className="mt-5 max-w-[58ch] text-base leading-7 text-muted-foreground sm:text-lg">
                Dr. Simeon te ayuda a ordenar síntomas, revisar señales de alarma y preparar una cita con un especialista verificado.
              </p>

              <div className="mt-8">
                <DrSimeonPresenceCard />
              </div>

              <div className="mt-7 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                <span className="inline-flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-vital" aria-hidden="true" />
                  Una pregunta a la vez
                </span>
                <span className="inline-flex items-center gap-2">
                  <Shield className="h-4 w-4 text-vital" aria-hidden="true" />
                  Alertas primero
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-vital" aria-hidden="true" />
                  Ruta hacia doctor
                </span>
              </div>
            </div>

            <div className="grid gap-5">
              <WelcomeComposer
                input={input}
                isThinking={isThinking}
                quotaFull={quotaFull}
                onInputChange={setInput}
                onSubmit={(value) => void sendMessage(value)}
                onTextareaInput={handleAutoResize}
                onKeyDown={handleKeyDown}
              />
              <StarterGroups onSelect={(prompt) => void sendMessage(prompt)} />
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden px-4 py-5 sm:px-6">
          <div className="mx-auto grid h-full max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div ref={chatRef} className="min-h-0 overflow-y-auto">
              <div className="mx-auto flex max-w-[760px] flex-col gap-4 pb-4">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <div key={msg.id} className="grid gap-3">
                      {msg.role === 'user' ? (
                        <UserMessageBubble msg={msg} />
                      ) : (
                        <AiMessageBubble msg={msg} />
                      )}
                      {msg.id === firstUserMessageId && firstUserText ? <PatientContextNote text={firstUserText} /> : null}
                    </div>
                  ))}
                </AnimatePresence>

                {isThinking && <ThinkingBubble reviewCount={userMessageCount} />}

                {referrals.length > 0 && !isThinking && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-2 pb-1"
                  >
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <div className="w-6 h-6 rounded-md bg-ink flex items-center justify-center">
                        <Stethoscope className="w-3.5 h-3.5 text-primary-foreground" />
                      </div>
                      <span className="text-sm font-bold font-display text-foreground">
                        Especialistas recomendados
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground ml-auto">
                        {referrals.length} doctores verificados
                      </span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {referrals.map((match) => (
                        <DoctorReferralCard
                          key={match.doctorId}
                          match={match}
                          onBook={() => {
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
                        className="text-xs font-semibold text-ink hover:text-ink/80 transition-colors inline-flex items-center gap-1"
                      >
                        Ver todos los especialistas <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </motion.div>
                )}

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

            <div className="hidden lg:block">
              <ClinicalReviewRail
                messages={messages}
                referrals={referrals}
                isThinking={isThinking}
                activeToolCalls={activeToolCalls}
                doneTools={doneTools}
              />
            </div>
          </div>
        </div>
      )}

      {phase === 'chat' && (
        <div className="shrink-0 border-t border-border bg-card/80 backdrop-blur-xl px-4 py-3">
          <div className="mx-auto max-w-[760px]">
            {quotaFull ? (
              <div className="text-center py-4 px-4 bg-card border border-border rounded-xl">
                <p className="text-sm text-muted-foreground mb-3">
                  Has usado tus {quota?.limit || 3} consultas gratuitas. Regístrate para continuar.
                </p>
                <button
                  onClick={() => setShowPremiumModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-primary-foreground text-sm font-semibold rounded-lg hover:bg-ink/90 transition-colors"
                >
                  Crear cuenta gratis
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-3 shadow-sm transition-all focus-within:border-ink/35 focus-within:ring-2 focus-within:ring-ink/10">
                <SafetyRow />
                <div className="mt-3 flex items-end gap-2">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value)
                      handleAutoResize(e.target)
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Continúa describiendo tus síntomas..."
                    disabled={isThinking}
                    className="max-h-[120px] min-h-[24px] flex-1 resize-none border-none bg-transparent py-1.5 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={() => void sendMessage(input)}
                    disabled={!input.trim() || isThinking}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-ink text-primary-foreground transition-colors hover:bg-ink/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Enviar"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            <p className="text-center text-[11px] text-muted-foreground mt-2 font-mono">
              Orientación clínica inicial · No sustituye consulta presencial · Emergencias: 911
            </p>
          </div>
        </div>
      )}

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
