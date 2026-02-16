'use client'

import { useEffect, useState } from 'react'
import { Circle } from 'lucide-react'

interface QuotaCounterProps {
  used: number
  limit: number
  size?: 'sm' | 'md' | 'lg'
}

export function QuotaCounter({ used, limit, size = 'md' }: QuotaCounterProps) {
  const [dots, setDots] = useState<string[]>([])

  useEffect(() => {
    setDots(
      Array.from({ length: limit }, (_, i) =>
        i < used ? 'filled' : 'empty'
      )
    )
  }, [used, limit])

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const gapClasses = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2',
  }

  const remaining = Math.max(0, limit - used)

  return (
    <div className={`flex items-center ${gapClasses[size]}`}>
      {dots.map((status, i) => (
        <div
          key={i}
          className={`${sizeClasses[size]} rounded-full transition-all duration-300 ${
            status === 'filled'
              ? 'bg-primary-500 shadow-sm'
              : 'bg-gray-200 border-2 border-gray-300'
          }`}
          aria-label={
            status === 'filled'
              ? `Consulta ${i + 1} usada`
              : `Consulta ${i + 1} disponible`
          }
        />
      ))}
      {remaining > 0 && (
        <span className="ml-2 text-sm font-medium text-gray-600">
          {remaining} gratis
        </span>
      )}
    </div>
  )
}

interface QuotaBannerProps {
  used: number
  limit: number
  showUpgrade?: boolean
}

export function QuotaBanner({ used, limit, showUpgrade = true }: QuotaBannerProps) {
  const remaining = Math.max(0, limit - used)
  const isLow = remaining <= 2

  return (
    <div
      className={`${
        isLow
          ? 'bg-amber-50 border-amber-200 text-amber-800'
          : 'bg-primary-50 border-primary-200 text-primary-800'
      } border rounded-xl px-4 py-3 flex items-center justify-between`}
    >
      <div className="flex items-center gap-3">
        <QuotaCounter used={used} limit={limit} size="sm" />
        <span className="text-sm font-medium">
          {remaining === limit
            ? `${limit} consultas gratis disponibles`
            : remaining === 0
            ? 'Has usado tus consultas gratis'
            : `${remaining} de ${limit} consultas gratis restantes`}
        </span>
      </div>
      {showUpgrade && remaining === 0 && (
        <button className="text-sm font-semibold text-primary-600 hover:text-primary-700">
          Obtener Premium
        </button>
      )}
    </div>
  )
}
