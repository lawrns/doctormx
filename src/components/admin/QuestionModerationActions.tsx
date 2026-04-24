'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'

export function QuestionModerationActions({ questionId }: { questionId: string }) {
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  function updateStatus(status: 'approved' | 'rejected') {
    setMessage('')
    startTransition(async () => {
      const response = await fetch(`/api/admin/expert-questions/${questionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        setMessage('No se pudo actualizar.')
        return
      }

      setMessage(status === 'approved' ? 'Pregunta aprobada.' : 'Pregunta rechazada.')
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" onClick={() => updateStatus('approved')} disabled={isPending}>
        Aprobar
      </Button>
      <Button size="sm" variant="outline" onClick={() => updateStatus('rejected')} disabled={isPending}>
        Rechazar
      </Button>
      {message ? <span className="text-xs font-medium text-[hsl(var(--public-muted))]">{message}</span> : null}
    </div>
  )
}
