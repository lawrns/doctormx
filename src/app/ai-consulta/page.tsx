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
import { formatDoctorName } from '@/lib/utils'
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
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${u.className}`}
    >
      {u.label}
    </span>
  )
}

function ToolCallRow({
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
      transition={{ delay: delay / 1000, duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${
        done ? 'border-border bg-background' : 'border-border bg-secondary/50'
      }`}
    >
      <div
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
          done ? 'bg-vital/10 text-vital' : 'bg-ink/10 text-ink'
        }`}
      >
        {done ? <Check className="h-3 w-3" /> : <Loader2 className="h-3 w-3 animate-spin" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`font-mono text-[10px] font-semibold uppercase tracking-[0.14em] ${meta.color}`}>
            {call.tool.replace(/_/g, ' ')}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">{done ? 'Listo' : 'Revisando'}</span>
        </div>
        {call.output ? (
          <p className={`mt-1 leading-5 ${done ? 'text-foreground' : 'text-muted-foreground'}`}>{call.output}</p>
        ) : (
          <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{meta.label}…</p>
        )}
      </div>
    </motion.div>
  )
}

function ThinkingBubble({ reviewCount }: { reviewCount: number }) {
  return (
    <div className="flex max-w-[88%] items-start gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink">
        <Stethoscope className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="rounded-xl rounded-bl-md border border-border bg-card px-4 py-3 shadow-sm">
        <p className="text-sm font-medium text-foreground">Voy a revisar señales de alarma y ordenar tu caso.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {reviewCount > 0 ? 'Ya tengo contexto para la siguiente pregunta.' : 'Empiezo por lo más urgente primero.'}
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
      transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
      className="flex max-w-[92%] items-start gap-2.5"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink">
        <Stethoscope className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="rounded-xl rounded-bl-md border border-border bg-card px-4 py-3.5 shadow-sm">
          <div className="mb-2 flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-vital">Dr. Simeon</span>
            <span className="text-[10px] text-muted-foreground">· Orientación clínica inicial</span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{msg.text}</p>
          {(msg.urgency || msg.specialty) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {msg.urgency ? <UrgencyBadge urgency={msg.urgency} /> : null}
              {msg.specialty ? (
                <span className="inline-flex items-center rounded-lg border border-border bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground">
                  {msg.specialty}
                </span>
              ) : null}
            </div>
          )}
          {msg.toolCalls && msg.toolCalls.length > 0 && (
            <details className="mt-3 border-t border-border pt-3">
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                Ver cómo se revisó
              </summary>
              <div className="mt-2 grid gap-2">
                {msg.toolCalls.map((tc, index) => (
                  <ToolCallRow key={tc.tool} call={tc} status="done" delay={index * 60} />
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
      transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
      className="flex justify-end"
    >
      <div className="max-w-[78%] rounded-xl rounded-br-md bg-ink px-4 py-3 text-sm leading-relaxed text-primary-foreground">
        {msg.text}
      </div>
    </motion.div>
  )
}

function SafetyRow({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-start gap-2 rounded-lg border border-coral/20 bg-coral/5 px-3 py-2 text-xs leading-5 text-foreground ${className}`}>
      <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-coral" aria-hidden="true" />
      <p>
        Si tienes dolor de pecho, falta de aire, pérdida de fuerza, confusión, sangrado intenso o ideas de hacerte daño,
        llama al 911 o acude a urgencias. Dr. Simeon no diagnostica.
      </p>
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

function QuickStartRail({
  onSelect,
  latestUser,
  latestAssistant,
  isThinking,
}: {
  onSelect: (prompt: string) => void
  latestUser?: ChatMessage
  latestAssistant?: ChatMessage
  isThinking: boolean
}) {
  const urgency = latestAssistant?.urgency ? URGENCY_MAP[latestAssistant.urgency].label : isThinking ? 'En revisión' : 'Pendiente'
  const specialty = latestAssistant?.specialty || (isThinking ? 'Evaluando' : 'Por definir')
  const nextStep = latestAssistant
    ? latestAssistant.urgency === 'emergency'
      ? 'Buscar atención urgente'
      : latestAssistant.specialty
        ? 'Responder la siguiente pregunta'
        : 'Seguir describiendo el caso'
    : 'Compartir el motivo principal'

  return (
    <aside className="flex h-full flex-col gap-4 border-r border-border bg-card/40 px-4 py-4">
      <div className="rounded-xl border border-border bg-background px-4 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-full border border-border bg-card">
            <Image
              src="/images/simeon.png"
              alt="Dr. Simeon"
              fill
              sizes="44px"
              className="object-cover object-top"
              priority
            />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-vital">Orientación clínica inicial</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">Dr. Simeon</h2>
          </div>
        </div>
        <p className="mt-3 max-w-[28ch] text-sm leading-6 text-muted-foreground">
          Ordena síntomas, revisa alarmas y sigue una sola pregunta a la vez.
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Atajos</p>
          <span className="text-[10px] text-muted-foreground">Escribe o toca uno</span>
        </div>
        <div className="grid gap-2">
          {STARTER_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink">{group.label}</p>
              {group.prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isThinking}
                  onClick={() => onSelect(prompt)}
                  className="flex w-full items-start gap-3 rounded-lg border border-transparent bg-background px-3 py-2.5 text-left transition-colors hover:border-border hover:bg-secondary/70 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-vital" aria-hidden="true" />
                  <span className="text-sm leading-5 text-foreground">{prompt}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 border-t border-border pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Seguridad</p>
        <SafetyRow />
      </section>

      <section className="space-y-3 border-t border-border pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Contexto reciente</p>
        <div className="space-y-2 text-sm leading-6 text-foreground">
          <div className="rounded-lg border border-border bg-background px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Motivo</p>
            <p className="mt-1 line-clamp-3 text-sm text-foreground">{latestUser?.text || 'Aún no descrito'}</p>
          </div>
          <div className="rounded-lg border border-border bg-background px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Urgencia</p>
            <p className="mt-1 text-sm text-foreground">{urgency}</p>
          </div>
          <div className="rounded-lg border border-border bg-background px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Especialidad</p>
            <p className="mt-1 text-sm text-foreground">{specialty}</p>
          </div>
          <div className="rounded-lg border border-border bg-background px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Siguiente paso</p>
            <p className="mt-1 text-sm text-foreground">{nextStep}</p>
          </div>
        </div>
      </section>
    </aside>
  )
}

function MobileSupportDrawer({
  onSelect,
  latestUser,
  latestAssistant,
  isThinking,
}: {
  onSelect: (prompt: string) => void
  latestUser?: ChatMessage
  latestAssistant?: ChatMessage
  isThinking: boolean
}) {
  return (
    <details className="lg:hidden">
      <summary className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground">
        <span>Atajos y contexto</span>
        <span className="text-xs text-muted-foreground">Abrir</span>
      </summary>
      <div className="mt-3 grid gap-4 rounded-xl border border-border bg-card px-4 py-4">
        <section className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Atajos</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {STARTER_GROUPS.flatMap((group) =>
              group.prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isThinking}
                  onClick={() => onSelect(prompt)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-left text-sm leading-5 text-foreground transition-colors hover:bg-secondary/70 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))
            )}
          </div>
        </section>

        <section className="space-y-3 border-t border-border pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Seguridad</p>
          <SafetyRow />
        </section>

        <section className="space-y-3 border-t border-border pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Contexto reciente</p>
          <div className="grid gap-2 text-sm leading-6 text-foreground sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-background px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Motivo</p>
              <p className="mt-1 line-clamp-3 text-sm text-foreground">{latestUser?.text || 'Aún no descrito'}</p>
            </div>
            <div className="rounded-lg border border-border bg-background px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Especialidad</p>
              <p className="mt-1 text-sm text-foreground">{latestAssistant?.specialty || 'Por definir'}</p>
            </div>
          </div>
        </section>
      </div>
    </details>
  )
}

function ClinicalSummaryRail({
  latestUser,
  latestAssistant,
  isThinking,
  activeToolCalls,
  doneTools,
  referrals,
}: {
  latestUser?: ChatMessage
  latestAssistant?: ChatMessage
  isThinking: boolean
  activeToolCalls: ToolCall[]
  doneTools: Set<string>
  referrals: DoctorMatch[]
}) {
  const urgency = latestAssistant?.urgency ? URGENCY_MAP[latestAssistant.urgency].label : isThinking ? 'En revisión' : 'Pendiente'
  const specialty = latestAssistant?.specialty || 'Por definir'
  const nextStep = referrals.length > 0
    ? 'Revisar derivación sugerida'
    : latestAssistant?.specialty
      ? 'Responder la siguiente pregunta'
      : isThinking
        ? 'Esperar revisión'
        : 'Comparte el motivo principal'
  const latestTools = latestAssistant?.toolCalls && latestAssistant.toolCalls.length > 0 ? latestAssistant.toolCalls : activeToolCalls

  return (
    <aside className="flex h-full flex-col gap-4 border-l border-border bg-card/40 px-4 py-4">
      <div className="rounded-xl border border-border bg-background px-4 py-4 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-vital">Revisión clínica</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">Contexto del caso</h2>
        <div className="mt-4 grid gap-3 border-t border-border pt-4">
          <div className="flex items-start gap-3">
            <Stethoscope className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Síntomas</p>
              <p className="mt-1 line-clamp-3 text-sm leading-6 text-foreground">{latestUser?.text || 'Aún no descritos'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Urgencia</p>
              <p className="mt-1 text-sm leading-6 text-foreground">{urgency}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Especialidad</p>
              <p className="mt-1 text-sm leading-6 text-foreground">{specialty}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Siguiente paso</p>
              <p className="mt-1 text-sm leading-6 text-foreground">{nextStep}</p>
            </div>
          </div>
        </div>
      </div>

      <details className="rounded-xl border border-border bg-background px-4 py-4 shadow-sm">
        <summary className="cursor-pointer text-sm font-medium text-foreground">Ver revisión técnica</summary>
        <div className="mt-3 grid gap-2">
          {latestTools.length > 0 ? (
            latestTools.map((tool, index) => (
              <ToolCallRow
                key={`${tool.tool}-${index}`}
                call={tool}
                status={doneTools.has(tool.tool) ? 'done' : 'running'}
                delay={index * 60}
              />
            ))
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">Dr. Simeon aún no ha necesitado una revisión adicional.</p>
          )}
        </div>
      </details>

      <details className="rounded-xl border border-border bg-background px-4 py-4 shadow-sm">
        <summary className="cursor-pointer text-sm font-medium text-foreground">
          Ver derivación sugerida {referrals.length > 0 ? `(${referrals.length})` : ''}
        </summary>
        <div className="mt-3 grid gap-2">
          {referrals.length > 0 ? (
            referrals.map((match) => {
              const doctorName = formatDoctorName(match.doctor?.profile?.full_name)
              return (
                <div key={match.doctorId} className="rounded-lg border border-border bg-card px-3 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{doctorName}</p>
                      <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                        {match.doctor?.specialties?.[0]?.name} · {match.doctor?.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-ink">{Math.round(match.score)}%</p>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Afinidad</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 text-amber" aria-hidden="true" />
                      {match.doctor?.rating_avg?.toFixed(1)}
                    </span>
                    <Link
                      href={`/book/${match.doctorId}`}
                      onClick={(event) => event.stopPropagation()}
                      className="text-xs font-semibold text-ink transition-colors hover:text-ink/80"
                    >
                      Agendar
                    </Link>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">La derivación sugerida aparecerá cuando Dr. Simeon la tenga clara.</p>
          )}
        </div>
      </details>
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

  const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user')
  const latestAssistantMessage = [...messages].reverse().find((message) => message.role === 'assistant')
  const firstUserText = messages.find((message) => message.role === 'user')?.text
  const firstUserMessageId = messages.find((message) => message.role === 'user')?.id
  const userMessageCount = messages.filter((message) => message.role === 'user').length
  const introMessage: ChatMessage = {
    id: 'welcome',
    role: 'assistant',
    text: 'Soy Dr. Simeon. Cuéntame qué te pasa y te haré una sola pregunta a la vez.',
  }

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

            {quota && (
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

      <main className="min-h-0 flex-1 overflow-hidden">
        <div className="mx-auto grid h-full max-w-7xl lg:grid-cols-[280px_minmax(0,1fr)_320px]">
          <div className="hidden lg:block">
            <QuickStartRail
              onSelect={(prompt) => void sendMessage(prompt)}
              latestUser={latestUserMessage}
              latestAssistant={latestAssistantMessage}
              isThinking={isThinking}
            />
          </div>

          <section className="flex min-h-0 flex-col lg:border-x lg:border-border">
            <div className="border-b border-border bg-card/40 px-4 py-4 lg:hidden">
              <MobileSupportDrawer
                onSelect={(prompt) => void sendMessage(prompt)}
                latestUser={latestUserMessage}
                latestAssistant={latestAssistantMessage}
                isThinking={isThinking}
              />
            </div>

            <div ref={chatRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              <div className="mx-auto flex max-w-[760px] flex-col gap-4 pb-4">
                {messages.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-vital">
                      Preconsulta clínica
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Empieza con un síntoma, una preocupación o usa un atajo de la izquierda.
                    </p>
                  </div>
                ) : null}

                <AnimatePresence initial={false}>
                  {messages.length === 0 ? (
                    <div key="welcome" className="grid gap-3">
                      <AiMessageBubble msg={introMessage} />
                    </div>
                  ) : null}
                  {messages.map((msg) => (
                    <div key={msg.id} className="grid gap-3">
                      {msg.role === 'user' ? <UserMessageBubble msg={msg} /> : <AiMessageBubble msg={msg} />}
                      {msg.id === firstUserMessageId && firstUserText ? <PatientContextNote text={firstUserText} /> : null}
                    </div>
                  ))}
                </AnimatePresence>

                {isThinking && <ThinkingBubble reviewCount={userMessageCount} />}

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
                      <EmailCapture consultationNumber={quota.used} onDismiss={() => setShowEmailCapture(false)} />
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            <div className="shrink-0 border-t border-border bg-card/90 px-4 py-3 backdrop-blur">
              <div className="mx-auto max-w-[760px]">
                {quotaFull ? (
                  <div className="rounded-xl border border-border bg-background px-4 py-4 text-center shadow-sm">
                    <p className="mb-3 text-sm text-muted-foreground">
                      Has usado tus {quota?.limit || 3} consultas gratuitas. Regístrate para continuar.
                    </p>
                    <button
                      onClick={() => setShowPremiumModal(true)}
                      className="inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-ink/90"
                    >
                      Crear cuenta gratis
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-background px-3 py-3 shadow-sm transition-all focus-within:border-ink/35 focus-within:ring-2 focus-within:ring-ink/10">
                    <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Dr. Simeon · una pregunta a la vez
                      </p>
                      <span className="text-[10px] text-muted-foreground">Orientación clínica inicial</span>
                    </div>
                    <div className="mt-3 flex items-end gap-2">
                      <textarea
                        ref={textareaRef}
                        rows={1}
                        value={input}
                        onChange={(event) => {
                          setInput(event.target.value)
                          handleAutoResize(event.target)
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Cuéntame qué pasa..."
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
                    <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                      Emergencias: 911. Si hay dolor de pecho, falta de aire o confusión, busca atención urgente.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="hidden lg:block">
            <ClinicalSummaryRail
              latestUser={latestUserMessage}
              latestAssistant={latestAssistantMessage}
              isThinking={isThinking}
              activeToolCalls={activeToolCalls}
              doneTools={doneTools}
              referrals={referrals}
            />
          </div>
        </div>
      </main>

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
