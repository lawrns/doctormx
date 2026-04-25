'use client'

import { ShieldCheck, Star, Lock, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrustStripProps {
  className?: string
}

export function TrustStrip({ className }: TrustStripProps) {
  const items = [
    {
      icon: ShieldCheck,
      label: '2,500+ médicos verificados por SEP',
    },
    {
      icon: Star,
      label: '4.9/5 calificación promedio',
    },
    {
      icon: Lock,
      label: 'Datos cifrados · HIPAA-compatible',
    },
    {
      icon: Users,
      label: '+85,000 consultas realizadas',
    },
  ]

  return (
    <div
      className={cn(
        'w-full border-b border-border/60 bg-card/80 backdrop-blur-md',
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-4 overflow-x-auto py-2 sm:gap-8 scrollbar-hide">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground"
            >
              <item.icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
