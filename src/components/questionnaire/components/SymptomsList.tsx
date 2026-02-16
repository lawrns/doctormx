'use client'

import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import type { Symptom } from '../types'

interface SymptomsListProps {
  symptoms: Symptom[]
}

export function SymptomsList({ symptoms }: SymptomsListProps) {
  if (symptoms.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-wrap gap-2 py-2"
    >
      {symptoms.map((symptom, idx) => (
        <motion.span
          key={idx}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full flex items-center gap-1"
        >
          <CheckCircle2 className="w-3 h-3" />
          {symptom.name}
          {symptom.severity && ` (${symptom.severity}/10)`}
        </motion.span>
      ))}
    </motion.div>
  )
}
