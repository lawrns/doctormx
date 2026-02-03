import React from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
}

export function Avatar({ src, alt, name, size = 'md', className = '' }: AvatarProps) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : ''

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={cn(
          'rounded-full object-cover',
          sizeClasses[size],
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold',
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  )
}

interface AvatarGroupProps {
  children: React.ReactNode
  max?: number
  className?: string
}

export function AvatarGroup({ children, max, className = '' }: AvatarGroupProps) {
  const childrenArray = React.Children.toArray(children)
  const displayChildren = max ? childrenArray.slice(0, max) : childrenArray
  const remainingCount = max ? childrenArray.length - max : 0

  return (
    <div className={cn('flex -space-x-2', className)}>
      {displayChildren}
      {remainingCount > 0 && (
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm font-medium border-2 border-white">
          +{remainingCount}
        </div>
      )}
    </div>
  )
}
