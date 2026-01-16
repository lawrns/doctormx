'use client'

import { useState, useEffect } from 'react'
import { getLevelColor } from '@/lib/trust-badges'

interface Badge {
  id: string
  badge_type: string
  badge_level: 'bronze' | 'silver' | 'gold' | 'platinum'
  badge_title: string
  badge_description: string
  badge_icon: string
  badge_color: string
  earned_at: string
}

interface BadgeSummary {
  total: number
  byLevel: Record<string, number>
  topBadge: Badge | null
}

interface DoctorBadgesProps {
  doctorId: string
  compact?: boolean
  showAll?: boolean
}

const BADGE_ICONS: Record<string, React.ReactNode> = {
  'shield-check': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  'clock': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  'star': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  'users': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  'zap': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  'user-check': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  'award': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
}

const LEVEL_LABELS: Record<string, string> = {
  bronze: 'Bronce',
  silver: 'Plata',
  gold: 'Oro',
  platinum: 'Platino',
}

export default function DoctorBadges({ doctorId, compact = false, showAll = false }: DoctorBadgesProps) {
  const [badges, setBadges] = useState<Badge[]>([])
  const [summary, setSummary] = useState<BadgeSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    async function fetchBadges() {
      try {
        const res = await fetch(`/api/doctor/badges?doctorId=${doctorId}&public=true`)
        if (res.ok) {
          const data = await res.json()
          setBadges(data.badges || [])
          setSummary(data.summary || null)
        }
      } catch (error) {
        console.error('Error fetching badges:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBadges()
  }, [doctorId])

  if (loading) {
    return (
      <div className="flex gap-1 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-8 h-8 bg-gray-200 rounded-full" />
        ))}
      </div>
    )
  }

  if (badges.length === 0) {
    return null
  }

  // Compact mode - show only top badges inline
  if (compact) {
    const displayBadges = badges.slice(0, 3)
    return (
      <div className="flex items-center gap-1">
        {displayBadges.map((badge) => (
          <div
            key={badge.id}
            title={`${badge.badge_title} (${LEVEL_LABELS[badge.badge_level]})`}
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ 
              backgroundColor: `${badge.badge_color}20`,
              color: badge.badge_color 
            }}
          >
            <div className="w-4 h-4">
              {BADGE_ICONS[badge.badge_icon] || BADGE_ICONS['award']}
            </div>
          </div>
        ))}
        {badges.length > 3 && (
          <span className="text-xs text-gray-500 ml-1">+{badges.length - 3}</span>
        )}
      </div>
    )
  }

  // Full display mode
  const displayBadges = showAll || expanded ? badges : badges.slice(0, 4)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Insignias verificadas</h3>
        {summary && (
          <span className="text-xs text-gray-500">
            {summary.total} {summary.total === 1 ? 'insignia' : 'insignias'}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {displayBadges.map((badge) => (
          <div
            key={badge.id}
            className="group relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:shadow-md"
            style={{ 
              borderColor: `${badge.badge_color}40`,
              backgroundColor: `${badge.badge_color}10` 
            }}
          >
            {/* Badge icon */}
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: getLevelColor(badge.badge_level),
                color: 'white' 
              }}
            >
              {BADGE_ICONS[badge.badge_icon] || BADGE_ICONS['award']}
            </div>

            {/* Badge info */}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {badge.badge_title}
              </span>
              <span className="text-xs text-gray-500">
                {badge.badge_description}
              </span>
            </div>

            {/* Level indicator */}
            <div 
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
              style={{ backgroundColor: getLevelColor(badge.badge_level) }}
              title={LEVEL_LABELS[badge.badge_level]}
            />

            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              Nivel {LEVEL_LABELS[badge.badge_level]}
            </div>
          </div>
        ))}
      </div>

      {!showAll && badges.length > 4 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {expanded ? 'Ver menos' : `Ver todas (${badges.length})`}
        </button>
      )}

      {/* Summary by level */}
      {summary && expanded && (
        <div className="flex gap-4 pt-2 border-t">
          {Object.entries(summary.byLevel).map(([level, count]) => (
            count > 0 && (
              <div key={level} className="flex items-center gap-1.5">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getLevelColor(level) }}
                />
                <span className="text-xs text-gray-600">
                  {count} {LEVEL_LABELS[level]}
                </span>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  )
}

// Compact inline badge display for listings
export function DoctorBadgeInline({ doctorId }: { doctorId: string }) {
  return <DoctorBadges doctorId={doctorId} compact />
}
