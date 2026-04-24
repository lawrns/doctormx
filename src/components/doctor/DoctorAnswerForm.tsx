'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'

export function DoctorAnswerForm({ questionId }: { questionId: string }) {
  const [answer, setAnswer] = useState('')
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  function submitAnswer() {
    setMessage('')
    startTransition(async () => {
      const response = await fetch(`/api/expert-questions/${questionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setMessage(data.error || 'No se pudo publicar la respuesta.')
        return
      }

      setAnswer('')
      setMessage('Respuesta publicada. Ya aparece como enriquecimiento medico publico.')
    })
  }

  return (
    <div className="space-y-3">
      <textarea
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        minLength={50}
        maxLength={5000}
        rows={4}
        placeholder="Escribe una respuesta clara, prudente y orientativa. No diagnostiques sin consulta."
        className="w-full rounded-[var(--public-radius-control)] border border-[hsl(var(--public-border)/0.82)] bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[hsl(var(--public-muted))]">
          {answer.length}/5000 caracteres. Minimo 50.
        </p>
        <Button type="button" size="sm" onClick={submitAnswer} disabled={isPending || answer.length < 50}>
          {isPending ? 'Publicando...' : 'Responder'}
        </Button>
      </div>
      {message ? <p className="text-sm font-medium text-[hsl(var(--brand-ocean))]">{message}</p> : null}
    </div>
  )
}
