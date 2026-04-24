'use client'

import { StarRating } from './StarRating'
import { Avatar } from './Avatar'
import type { Review } from '@/lib/reviews'

interface DoctorReviewsProps {
  reviews: Review[]
  totalReviews: number
  averageRating: number
  onLoadMore?: () => void
  hasMore?: boolean
  isLoadingMore?: boolean
}

export function DoctorReviews({
  reviews,
  totalReviews,
  averageRating,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}: DoctorReviewsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-card rounded-[10px] shadow-card border border-border p-8">
        <h2 className="text-xl font-bold text-ink-primary mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Reseñas
        </h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-secondary-100 rounded-[10px] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <p className="text-ink-secondary text-lg mb-2">Sin reseñas aún</p>
          <p className="text-sm text-ink-muted">Sé el primero en compartir tu experiencia</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-[10px] shadow-card border border-border p-8">
      <h2 className="text-xl font-bold text-ink-primary mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        Reseñas ({totalReviews})
      </h2>

      <div className="flex items-center gap-4 mb-6 p-4 bg-secondary-50 rounded-lg">
        <div className="text-center">
          <div className="text-4xl font-bold text-ink-primary">
            {averageRating.toFixed(1)}
          </div>
          <StarRating rating={averageRating} size="sm" />
          <p className="text-sm text-ink-muted mt-1">
            {totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border-b border-border pb-6 last:border-0 last:pb-0"
          >
            <div className="flex items-start gap-4">
              <Avatar
                name={review.patient?.full_name}
                src={review.patient?.photo_url}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-medium text-ink-primary">
                    {review.patient?.full_name || 'Paciente anónimo'}
                  </h3>
                  <span className="text-sm text-ink-muted whitespace-nowrap">
                    {formatDate(review.created_at)}
                  </span>
                </div>
                <StarRating rating={review.rating} size="sm" />
                {review.comment && (
                  <p className="mt-3 text-ink-secondary leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50"
          >
            {isLoadingMore ? 'Cargando...' : 'Ver más reseñas'}
          </button>
        </div>
      )}
    </div>
  )
}
