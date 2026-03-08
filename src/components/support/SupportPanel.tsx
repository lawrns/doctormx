'use client'

import { useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, Minimize2, SendHorizonal, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/Toast'
import { SupportQuickActions } from './SupportQuickActions'
import { SupportActionCards } from './SupportActionCards'
import { SupportMessageList } from './SupportMessageList'
import { SupportPresenceOrb } from './SupportPresenceOrb'
import { SupportThinkingState } from './SupportThinkingState'
import type { SupportChatResponse, SupportLink, SupportMessage } from '@/lib/support/types'

const DEFAULT_STARTERS = [
  '¿Qué es Doctor.mx?',
  'Ayúdame a orientarme en esta página',
  '¿Cuál es el siguiente paso recomendado?',
]

interface SupportPanelProps {
  onMinimize?: () => void
}

export function SupportPanel({ onMinimize }: SupportPanelProps) {
  const pathname = usePathname() || '/'
  const { addToast } = useToast()
  const [messages, setMessages] = useState<SupportMessage[]>([
    {
      role: 'assistant',
      content: 'Hola, soy Doctor Simeon. Puedo orientarte dentro de Doctor.mx, explicarte esta página y ayudarte a dar el siguiente paso útil sin perder el contexto.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_STARTERS)
  const [links, setLinks] = useState<SupportChatResponse['links']>([])

  const canSend = input.trim().length > 0 && !loading

  const requestHistory = useMemo(() => messages.slice(-6), [messages])

  const handleNavigate = (link: SupportLink) => {
    if (link.minimizeOnClick !== false) {
      onMinimize?.()
    }
  }

  const submitMessage = async (value: string) => {
    const content = value.trim()
    if (!content || loading) {
      return
    }

    const nextMessages = [...messages, { role: 'user' as const, content }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          pathname,
          history: requestHistory,
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || 'No fue posible responder.')
      }

      setMessages((current) => [...current, { role: 'assistant', content: payload.message }])
      setSuggestions(Array.isArray(payload.suggestions) ? payload.suggestions : DEFAULT_STARTERS)
      setLinks(Array.isArray(payload.links) ? payload.links : [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No fue posible responder.'
      addToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(248,250,252,0.97))] shadow-[0_28px_90px_rgba(15,23,42,0.20)] backdrop-blur-2xl">
      <div className="relative overflow-hidden border-b border-slate-200/70 px-5 py-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.20),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_45%)]" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <SupportPresenceOrb size="lg" />
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/60 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
              <ShieldCheck className="h-3.5 w-3.5" />
                Doctor Simeon
              </div>
              <h2 className="text-lg font-semibold tracking-[-0.03em] text-slate-950">Guía clínica y navegación en Doctor.mx</h2>
              <p className="max-w-md text-sm leading-6 text-slate-600">
                Te ayudo a entender dónde estás, qué hacer aquí y cómo avanzar sin que el widget te tape la página cuando ya toca actuar.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm sm:block">
              Ruta actual: <span className="text-slate-900">{pathname}</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onMinimize}
              className="rounded-2xl text-slate-500 hover:bg-white/80 hover:text-slate-800"
              aria-label="Minimizar widget"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.16),transparent)] px-4 py-4 sm:px-5">
        <div className="space-y-4">
          <SupportQuickActions actions={suggestions} onSelect={submitMessage} />
          <SupportMessageList messages={messages} />
          <AnimatePresence>{loading ? <SupportThinkingState /> : null}</AnimatePresence>
          <SupportActionCards links={links || []} onNavigate={handleNavigate} />
        </div>
      </div>

      <div className="border-t border-slate-200/70 bg-white/80 px-4 py-4 backdrop-blur-xl sm:px-5">
        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-500">
          <Compass className="h-4 w-4 text-sky-600" />
          Simeon te orienta y luego se hace a un lado para que puedas usar la página.
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                void submitMessage(input)
              }
            }}
            placeholder="Pregúntale a Doctor Simeon qué hace esta página o cuál es el mejor siguiente paso"
            className="h-12 rounded-2xl border-slate-200 bg-white px-4 shadow-[0_10px_26px_rgba(15,23,42,0.05)]"
          />
          <Button
            type="button"
            onClick={() => void submitMessage(input)}
            disabled={!canSend}
            size="icon-lg"
            className="rounded-2xl bg-[linear-gradient(135deg,hsl(var(--brand-ocean)),hsl(var(--brand-sky)))] shadow-[0_16px_34px_rgba(14,165,233,0.34)] hover:-translate-y-0.5"
          >
            <SendHorizonal className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
