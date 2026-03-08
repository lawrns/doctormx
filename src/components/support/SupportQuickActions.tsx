'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface SupportQuickActionsProps {
  actions: string[]
  onSelect: (value: string) => void
}

export function SupportQuickActions({ actions, onSelect }: SupportQuickActionsProps) {
  if (actions.length === 0) {
    return null
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {actions.map((action, index) => (
        <motion.div
          key={action}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04, duration: 0.25 }}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full border-sky-200/60 bg-white/80 text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.05)] backdrop-blur-sm hover:border-sky-300 hover:bg-sky-50"
            onClick={() => onSelect(action)}
          >
            {action}
          </Button>
        </motion.div>
      ))}
    </div>
  )
}
