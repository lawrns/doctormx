'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageSquareMore, X } from 'lucide-react'
import { SupportPresenceOrb } from '@/components/support/SupportPresenceOrb'
import { SupportPanel } from '@/components/support/SupportPanel'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet'

export function SupportWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const updateViewport = (event?: MediaQueryListEvent) => {
      setIsMobile(event ? event.matches : mediaQuery.matches)
    }

    updateViewport()
    mediaQuery.addEventListener('change', updateViewport)

    return () => {
      mediaQuery.removeEventListener('change', updateViewport)
    }
  }, [])

  const handleOpenChange = (value: boolean) => {
    if (!value && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    setOpen(value)
  }

  if (!mounted) {
    return null
  }

  const isTransactional =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/doctor') ||
    pathname?.startsWith('/app') ||
    pathname?.startsWith('/auth') ||
    pathname?.startsWith('/book') ||
    pathname?.startsWith('/checkout') ||
    pathname?.startsWith('/consultation') ||
    pathname?.startsWith('/payment-success')

  if (pathname?.startsWith('/widget') || pathname?.includes('/ai-consulta') || isTransactional) {
    return null
  }

  if (isMobile) {
    return (
      <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-50">
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetTrigger asChild>
            <Button
              type="button"
              size="icon-lg"
              aria-label="Abrir asistente Dr. Simeon"
              className="h-14 w-14 rounded-[12px] border border-border/20 bg-ink text-primary-foreground shadow-[0_14px_32px_-18px_hsl(var(--shadow-color)/0.38)] hover:bg-ink/95"
            >
              <SupportPresenceOrb size="sm" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            showCloseButton={false}
            className="h-[85dvh] rounded-t-[2rem] border-0 bg-transparent p-3 shadow-none [overscroll-behavior:contain]"
          >
            <SheetTitle className="sr-only">Dr. Simeon Support Chat</SheetTitle>
            <SheetDescription className="sr-only">Chat de soporte para navegación en Doctor.mx</SheetDescription>
            <SupportPanel layout="mobile" onDismiss={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    )
  }

  return (
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-50 w-[min(320px,calc(100vw-32px))] max-w-[320px]">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="pointer-events-auto absolute bottom-[calc(100%+10px)] right-0 w-[min(420px,calc(100vw-32px))] max-w-[420px] origin-bottom-right"
          >
            <SupportPanel layout="desktop" onDismiss={() => setOpen(false)} />
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div className="flex justify-end">
        <Button
          type="button"
          aria-label="Abrir asistente Dr. Simeon"
          aria-expanded={open}
          onClick={() => handleOpenChange(!open)}
          className="group relative h-auto w-full rounded-[12px] border border-border/20 bg-ink px-4 py-3 text-primary-foreground shadow-[0_14px_32px_-18px_hsl(var(--shadow-color)/0.38)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-ink/95"
        >
          <div className="flex items-center gap-3">
            <SupportPresenceOrb size="md" isLoading={open} />
            <div className="min-w-0 flex-1 text-left">
              <div className="text-sm font-semibold tracking-[-0.02em]">Dr. Simeon</div>
              <div className="truncate text-xs text-primary-foreground/80">Te guía dentro de Doctor.mx</div>
            </div>
            <div className="rounded-full bg-primary-foreground/14 p-2 text-primary-foreground/95" aria-hidden="true">
              {open ? <X className="h-4 w-4" /> : <MessageSquareMore className="h-4 w-4" />}
            </div>
          </div>
        </Button>
      </div>
    </div>
  )
}
