'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { MessageSquareMore, X } from 'lucide-react'
import { SupportPresenceOrb } from '@/components/support/SupportPresenceOrb'
import { SupportPanel } from '@/components/support/SupportPanel'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export function SupportWidget() {
  const [open, setOpen] = useState(false)
  const reducedMotion = useReducedMotion()

  return (
    <>
      <div className="fixed bottom-24 right-4 z-40 hidden md:block">
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              initial={reducedMotion ? undefined : { opacity: 0, y: 18, scale: 0.96 }}
              animate={reducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="mb-4 h-[min(72vh,760px)] w-[420px]"
            >
              <SupportPanel />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.div
          animate={reducedMotion ? undefined : { y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="flex justify-end"
        >
          <Button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="group relative h-auto rounded-[1.75rem] border border-white/30 bg-[linear-gradient(135deg,rgba(2,132,199,0.92),rgba(14,165,233,0.96))] px-4 py-3 text-white shadow-[0_24px_50px_rgba(14,165,233,0.32)] backdrop-blur-xl hover:-translate-y-1"
          >
            <div className="flex items-center gap-3">
              <SupportPresenceOrb />
              <div className="text-left">
                <div className="text-sm font-semibold tracking-[-0.02em]">Asistente Doctor.mx</div>
                <div className="text-xs text-sky-100/90">Te explica la página y te guía</div>
              </div>
              <div className="rounded-full bg-white/14 p-2 text-white/95">
                {open ? <X className="h-4 w-4" /> : <MessageSquareMore className="h-4 w-4" />}
              </div>
            </div>
          </Button>
        </motion.div>
      </div>

      <div className="fixed bottom-4 right-4 z-40 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              size="icon-lg"
              className="h-16 w-16 rounded-[1.6rem] bg-[linear-gradient(135deg,rgba(2,132,199,0.94),rgba(14,165,233,0.98))] text-white shadow-[0_24px_50px_rgba(14,165,233,0.38)]"
            >
              <MessageSquareMore className="h-7 w-7" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-[2rem] border-0 bg-transparent p-3 shadow-none">
            <SupportPanel />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
