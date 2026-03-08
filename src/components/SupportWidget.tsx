'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { MessageSquareMore, X } from 'lucide-react'
import { SupportPresenceOrb } from '@/components/support/SupportPresenceOrb'
import { SupportPanel } from '@/components/support/SupportPanel'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function SupportWidget() {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
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

  if (isMobile) {
    return (
      <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-50">
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetTrigger asChild>
            <Button
              type="button"
              size="icon-lg"
              aria-label="Abrir asistente Doctor Simeon"
              className="h-16 w-16 rounded-[1.6rem] bg-[linear-gradient(135deg,rgba(2,132,199,0.94),rgba(14,165,233,0.98))] text-white shadow-[0_24px_50px_rgba(14,165,233,0.38)]"
            >
              <SupportPresenceOrb size="sm" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            showCloseButton={false}
            className="h-[85dvh] rounded-t-[2rem] border-0 bg-transparent p-3 shadow-none [overscroll-behavior:contain]"
          >
            <SheetTitle className="sr-only">Doctor Simeon Support Chat</SheetTitle>
            <SheetDescription className="sr-only">Chat de soporte para navegación en Doctor.mx</SheetDescription>
            <SupportPanel layout="mobile" onDismiss={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    )
  }

  return (
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-50 w-[min(320px,calc(100vw-32px))] max-w-[320px]">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <motion.div
            animate={reducedMotion ? undefined : { y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="flex justify-end"
          >
            <Button
              type="button"
              aria-label="Abrir asistente Doctor Simeon"
              aria-expanded={open}
              className="group relative h-auto w-full rounded-[1.75rem] border border-white/30 bg-[linear-gradient(145deg,rgba(2,132,199,0.94),rgba(14,165,233,0.98))] px-4 py-3 text-white shadow-[0_24px_50px_rgba(14,165,233,0.32)] backdrop-blur-xl transition-all hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <SupportPresenceOrb size="md" />
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-sm font-semibold tracking-[-0.02em]">Doctor Simeon</div>
                  <div className="truncate text-xs text-sky-100/90">Te guía dentro de Doctor.mx</div>
                </div>
                <div className="rounded-full bg-white/14 p-2 text-white/95" aria-hidden="true">
                  {open ? <X className="h-4 w-4" /> : <MessageSquareMore className="h-4 w-4" />}
                </div>
              </div>
            </Button>
          </motion.div>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          sideOffset={12}
          className="w-[min(420px,calc(100vw-32px))] max-w-[420px] border-0 bg-transparent p-0 shadow-none"
        >
          <SupportPanel layout="desktop" onDismiss={() => setOpen(false)} />
        </PopoverContent>
      </Popover>
    </div>
  )
}
