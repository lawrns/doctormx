'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface DoctorCardProps {
  id: string
  name: string
  specialty: string
  avatar?: string
  rating?: number
  reviewCount?: number
  location?: string
  availability?: string
  verified?: boolean
  price?: number
  videoConsultation?: boolean
  className?: string
}

export function DoctorCard({
  id,
  name,
  specialty,
  avatar,
  rating = 0,
  reviewCount = 0,
  location,
  availability,
  verified = false,
  price,
  videoConsultation = false,
  className,
}: DoctorCardProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-200',
        'hover:shadow-lg hover:border-gray-300',
        'bg-white border border-gray-200',
        className
      )}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex gap-4 mb-4">
          <Avatar className="w-16 h-16 border-2 border-white shadow-sm">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-primary-100 text-primary-600 font-semibold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-base">
              Dr. {name}
            </h3>
            <p className="text-sm text-gray-500 truncate">{specialty}</p>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {verified && (
                <Badge
                  variant="secondary"
                  className="bg-teal-50 text-teal-700 border-teal-200 text-xs px-2 py-0.5"
                >
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verificado
                </Badge>
              )}
              {videoConsultation && (
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-0.5"
                >
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Video
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2 mb-4">
          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={cn(
                      'w-4 h-4',
                      i < Math.floor(rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-200 fill-gray-200'
                    )}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="font-medium text-gray-900">{rating.toFixed(1)}</span>
              <span className="text-gray-400">({reviewCount} opiniones)</span>
            </div>
          )}

          {/* Location */}
          {location && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="truncate">{location}</span>
            </div>
          )}

          {/* Availability */}
          {availability && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{availability}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {price && (
            <div>
              <span className="text-lg font-semibold text-gray-900">
                ${price}
              </span>
              <span className="text-sm text-gray-500 ml-1">MXN</span>
            </div>
          )}
          <Link href={`/doctors/${id}`} className="ml-auto">
            <Button size="sm" className="bg-primary-500 hover:bg-primary-600">
              Ver perfil
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}

export default DoctorCard
