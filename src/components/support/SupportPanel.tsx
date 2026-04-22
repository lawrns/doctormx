'use client'

import { useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { Compass, SendHorizonal, ShieldCheck, X } from 'lucide-react'
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
  layout?: 'mobile' | 'desktop'
  onDismiss?: () => void
}

export function SupportPanel({ layout = 'desktop', onDismiss }: SupportPanelProps) {
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
      onDismiss?.()
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

  const panelHeight = layout === 'mobile' ? 'h-full' : 'h-[min(580px,calc(100dvh-120px))]'

  return (
    <div className={`flex ${panelHeight} flex-col overflow-hidden overflow-x-hidden rounded-[1.75rem] border border-border bg-card shadow-[0_20px_60px_hsl(var(--shadow-color)/0.16)]`}>
      {/* Header */}
      <div className="relative shrink-0 border-b border-border px-4 pb-3 pt-4">
        <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-[1.75rem] bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
        {/* Row 1: identity + dismiss */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <SupportPresenceOrb size="sm" />
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              Doctor Simeon
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="h-8 w-8 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Cerrar asistente"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        {/* Row 2: title + route chip */}
        <div className="mt-2.5 flex min-w-0 items-center gap-2">
          <h2 className="shrink-0 text-sm font-semibold tracking-tight text-foreground">
            Guía de navegación
          </h2>
          <span className="flex min-w-0 items-center gap-1 truncate rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
            <Compass className="h-3 w-3 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">{pathname}</span>
          </span>
        </div>
      </div>

      {/* Message body — independently scrolling */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4">
        <div className="space-y-4">
          <SupportQuickActions actions={suggestions} onSelect={submitMessage} />
          <SupportMessageList messages={messages} />
          <AnimatePresence>{loading ? <SupportThinkingState /> : null}</AnimatePresence>
          <SupportActionCards links={links || []} onNavigate={handleNavigate} />
        </div>
      </div>

      {/* Composer — sticky bottom */}
      <div className="shrink-0 border-t border-border bg-card/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
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
            placeholder="Pregúntale a Simeon…"
            aria-label="Mensaje para Doctor Simeon"
            className="h-10 rounded-2xl border-border bg-background px-4 text-sm shadow-none focus-visible:ring-ring"
          />
          <Button
            type="button"
            onClick={() => void submitMessage(input)}
            disabled={!canSend}
            size="icon"
            aria-label="Enviar mensaje"
            className="h-10 w-10 shrink-0 rounded-2xl bg-ink text-primary-foreground shadow-[0_8px_20px_hsl(var(--shadow-color)/0.16)] hover:-translate-y-0.5 hover:bg-ink/90 disabled:opacity-40"
          >
            <SendHorizonal className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  )
}
