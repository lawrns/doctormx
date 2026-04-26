'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Search, Stethoscope } from 'lucide-react'

export function MobileCtaBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  const primaryAction = { href: '/ai-consulta', label: 'Dr. Simeón', icon: Stethoscope }
  const secondaryAction = { href: '/doctors', label: 'Ver médicos', icon: Search }

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_32px_rgba(15,37,95,0.10)] backdrop-blur-md transition-transform duration-300 md:hidden ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      aria-hidden={!visible}
    >
      <div className="grid grid-cols-2 gap-2">
        <Link
          href={primaryAction.href}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--interactive))] px-3 text-sm font-semibold text-primary-foreground active:scale-[0.98]"
        >
          {<primaryAction.icon className="h-4 w-4" aria-hidden="true" />}
          {primaryAction.label}
        </Link>
        <Link
          href={secondaryAction.href}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-[hsl(var(--surface-card))] px-3 text-sm font-semibold text-[hsl(var(--ink))] active:scale-[0.98]"
        >
          {<secondaryAction.icon className="h-4 w-4" aria-hidden="true" />}
          {secondaryAction.label}
        </Link>
      </div>
    </div>
  )
}
