'use client'

import type { SubscriptionTier } from '@/lib/premium-features'

interface PricingBadgeProps {
  tier: SubscriptionTier
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const tierConfig: Record<SubscriptionTier, {
  bg: string
  text: string
  border: string
  gradient: string
}> = {
  starter: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary/30',
    gradient: '',
  },
  pro: {
    bg: '',
    text: 'text-white',
    border: 'border-transparent',
    gradient: 'bg-gradient-to-r from-amber-400 to-orange-500',
  },
  elite: {
    bg: '',
    text: 'text-white',
    border: 'border-transparent',
    gradient: 'bg-gradient-to-r from-purple-500 to-pink-600',
  },
}

const sizeConfig = {
  sm: {
    badge: 'px-2 py-0.5 text-xs',
    icon: 'w-3 h-3',
  },
  md: {
    badge: 'px-3 py-1 text-sm',
    icon: 'w-4 h-4',
  },
  lg: {
    badge: 'px-4 py-1.5 text-base',
    icon: 'w-5 h-5',
  },
}

export function PricingBadge({ tier, size = 'md', showLabel = true }: PricingBadgeProps) {
  const config = tierConfig[tier]
  const sizes = sizeConfig[size]

  const tierLabels: Record<SubscriptionTier, string> = {
    starter: 'Starter',
    pro: 'PRO',
    elite: 'ELITE',
  }

  if (config.gradient) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-bold rounded-full ${config.gradient} ${sizes.badge}`}
      >
        <StarIcon className={sizes.icon} />
        {showLabel && tierLabels[tier]}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border ${config.bg} ${config.text} ${config.border} ${sizes.badge}`}
    >
      {showLabel && tierLabels[tier]}
    </span>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

export function PricingBadgeCompact({ tier }: { tier: SubscriptionTier }) {
  const colors: Record<SubscriptionTier, string> = {
    starter: 'bg-primary/10 text-primary',
    pro: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white',
    elite: 'bg-gradient-to-r from-purple-500 to-pink-600 text-white',
  }

  const labels: Record<SubscriptionTier, string> = {
    starter: 'ST',
    pro: 'PR',
    elite: 'EL',
  }

  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${colors[tier]}`}
      title={tier.charAt(0).toUpperCase() + tier.slice(1)}
    >
      {labels[tier]}
    </span>
  )
}

export function FeatureLimitIndicator({
  used,
  limit,
  label,
}: {
  used: number
  limit: number | null
  label: string
}) {
  if (limit === null || limit === 0) {
    return null
  }

  const percentage = Math.min(100, (used / limit) * 100)
  const isNearLimit = percentage >= 80
  const isExceeded = used >= limit

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={isExceeded ? 'text-red-600 font-medium' : isNearLimit ? 'text-orange-600' : 'text-foreground'}>
          {used} / {limit}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isExceeded
              ? 'bg-red-500'
              : isNearLimit
              ? 'bg-orange-500'
              : 'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isExceeded && (
        <p className="text-xs text-red-600">Límite alcanzado. Haz upgrade para continuar.</p>
      )}
    </div>
  )
}
