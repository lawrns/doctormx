'use client'

import { useState } from 'react'
import { RatingInput } from './StarRating'
import { LoadingButton } from './LoadingButton'
import { Modal, ModalFooter } from './Modal'
import { Textarea } from './Input'
import type { Review } from '@/lib/reviews'

interface WriteReviewProps {
  appointmentId: string
  doctorId: string
  doctorName: string
  appointmentDate: string
  onSuccess?: (review: Review) => void
}

export function WriteReview({
  appointmentId,
  doctorId,
  doctorName,
  appointmentDate,
  onSuccess,
}: WriteReviewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (rating === 0) {
      setError('Por favor selecciona una calificación')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          doctorId,
          rating,
          comment: comment.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar la reseña')
      }

      setIsOpen(false)
      setRating(0)
      setComment('')

      if (onSuccess) {
        onSuccess(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar la reseña')
    } finally {
      setIsLoading(false)
    }
  }

  const formattedDate = new Date(appointmentDate).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium text-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        Dejar reseña
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Tu opinión importa"
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-sm font-medium text-foreground">
                Dr. {doctorName}
              </p>
              <p className="text-xs text-muted-foreground">
                Consulta del {formattedDate}
              </p>
            </div>

            <RatingInput
              value={rating}
              onChange={setRating}
              label="¿Cómo fue tu experiencia?"
              required={true}
            />

            <Textarea
              label="Comentario (opcional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos más sobre tu experiencia con el doctor..."
              rows={4}
              maxLength={1000}
            />

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}
          </div>

          <ModalFooter>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground bg-secondary rounded-lg hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <LoadingButton
              type="submit"
              isLoading={isLoading}
              loadingText="Enviando..."
              disabled={rating === 0}
            >
              Enviar reseña
            </LoadingButton>
          </ModalFooter>
        </form>
      </Modal>
    </>
  )
}
