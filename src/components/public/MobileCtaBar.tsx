'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Search, Stethoscope } from 'lucide-react'

export function MobileCtaBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 360)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_32px_rgba(15,37,95,0.10)] backdrop-blur-md transition-transform duration-300 md:hidden ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      aria-hidden={!visible}
    >
      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/ai-consulta"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink px-3 text-sm font-semibold text-primary-foreground active:scale-[0.98]"
        >
          <Stethoscope className="h-4 w-4" aria-hidden="true" />
          Consulta gratis
        </Link>
        <Link
          href="/doctors"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-ink active:scale-[0.98]"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Buscar doctor
        </Link>
      </div>
    </div>
  )
}
