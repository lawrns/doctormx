'use client'

import { useState } from 'react'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
  showValue?: boolean
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const handleClick = (star: number) => {
    if (interactive && onChange) {
      onChange(star)
    }
  }

  const handleMouseEnter = (star: number) => {
    if (interactive) {
      setHoverRating(star)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0)
    }
  }

  const displayRating = hoverRating || rating
  const filledStars = Math.min(Math.max(displayRating, 0), maxRating)

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: maxRating }, (_, i) => {
          const star = i + 1
          const isFilled = star <= filledStars

          return (
            <button
              key={star}
              type="button"
              onClick={() => handleClick(star)}
              onMouseEnter={() => handleMouseEnter(star)}
              onMouseLeave={handleMouseLeave}
              disabled={!interactive}
              className={`
                ${interactive ? 'cursor-pointer' : 'cursor-default'}
                ${interactive && onChange ? 'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-yellow-500 rounded' : ''}
                transition-transform hover:scale-110
              `}
              aria-label={`${star} de ${maxRating} estrellas`}
            >
              <svg
                className={`${sizeClasses[size]} ${isFilled ? 'text-yellow-400' : 'text-muted-foreground'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          )
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-muted-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

interface RatingInputProps {
  value: number
  onChange: (rating: number) => void
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  label?: string
  required?: boolean
}

export function RatingInput({
  value,
  onChange,
  maxRating = 5,
  size = 'md',
  label = 'Tu calificación',
  required = true,
}: RatingInputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input type="hidden" name="rating" value={value} />
      <StarRating
        rating={value}
        maxRating={maxRating}
        size={size}
        interactive={true}
        onChange={onChange}
      />
      {value > 0 && (
        <p className="mt-1 text-sm text-muted-foreground">
          {value === 1 && 'Muy malo'}
          {value === 2 && 'Malo'}
          {value === 3 && 'Regular'}
          {value === 4 && 'Bueno'}
          {value === 5 && 'Excelente'}
        </p>
      )}
    </div>
  )
}
