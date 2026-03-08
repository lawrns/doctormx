'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { MessageSquareMore, X } from 'lucide-react'
import { SupportPresenceOrb } from '@/components/support/SupportPresenceOrb'
import { SupportPanel } from '@/components/support/SupportPanel'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet'

export function SupportWidget() {
  const [open, setOpen] = useState(false)
  const reducedMotion = useReducedMotion()

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 hidden w-[min(320px,calc(100vw-32px))] max-w-[320px] md:block">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <motion.div
              animate={reducedMotion ? undefined : { y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="flex justify-end"
            >
              <Button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="group relative h-auto w-full rounded-[1.75rem] border border-white/30 bg-[linear-gradient(145deg,rgba(2,132,199,0.94),rgba(14,165,233,0.98))] px-4 py-3 text-white shadow-[0_24px_50px_rgba(14,165,233,0.32)] backdrop-blur-xl transition-all hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <SupportPresenceOrb size="md" />
                  <div className="min-w-0 flex-1 text-left">
                    <div className="text-sm font-semibold tracking-[-0.02em]">Doctor Simeon</div>
                    <div className="truncate text-xs text-sky-100/90">Te guía dentro de Doctor.mx</div>
                  </div>
                  <div className="rounded-full bg-white/14 p-2 text-white/95">
                    {open ? <X className="h-4 w-4" /> : <MessageSquareMore className="h-4 w-4" />}
                  </div>
                </div>
              </Button>
            </motion.div>
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(420px,calc(100vw-32px))] max-w-[420px] border-0 bg-transparent p-4 shadow-none sm:w-[420px]">
            <SheetTitle className="sr-only">Doctor Simeon Support Chat</SheetTitle>
            <SheetDescription className="sr-only">Support chat widget for Doctor.mx navigation and guidance</SheetDescription>
            <div className="h-[min(80vh,760px)]">
              <SupportPanel onMinimize={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              size="icon-lg"
              className="h-16 w-16 rounded-[1.6rem] bg-[linear-gradient(135deg,rgba(2,132,199,0.94),rgba(14,165,233,0.98))] text-white shadow-[0_24px_50px_rgba(14,165,233,0.38)]"
            >
              <SupportPresenceOrb size="sm" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-[2rem] border-0 bg-transparent p-3 shadow-none">
            <SheetTitle className="sr-only">Doctor Simeon Support Chat</SheetTitle>
            <SheetDescription className="sr-only">Support chat widget for Doctor.mx navigation and guidance</SheetDescription>
            <SupportPanel onMinimize={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
