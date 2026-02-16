'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import type { RedFlag } from '../types'

interface RedFlagsAlertProps {
  redFlags: RedFlag[]
}

export function RedFlagsAlert({ redFlags }: RedFlagsAlertProps) {
  return (
    <AnimatePresence>
      {redFlags.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800"
        >
          <div className="p-3">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium text-sm">Síntomas de alerta detectados</span>
            </div>
            <ul className="mt-2 space-y-1">
              {redFlags.map((flag, idx) => (
                <li
                  key={idx}
                  className="text-xs text-red-600 dark:text-red-400 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {flag.message}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
