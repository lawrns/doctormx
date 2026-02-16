'use client'

import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import type { QuestionnaireSummary } from '../types'

interface SummaryViewProps {
  summary: QuestionnaireSummary | null
}

export function SummaryView({ summary }: SummaryViewProps) {
  if (!summary) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-shrink-0 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-t border-green-200 dark:border-green-800"
    >
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="w-5 h-5 text-green-600" />
        <span className="font-semibold text-green-700 dark:text-green-300">
          Evaluación completa
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <p>
          <span className="font-medium">Motivo:</span> {summary.chiefComplaint}
        </p>
        <p>
          <span className="font-medium">Urgencia:</span> {summary.urgencyLevel}
        </p>
        <p>
          <span className="font-medium">Especialidad sugerida:</span>{' '}
          {summary.recommendedSpecialty}
        </p>
        <p>
          <span className="font-medium">Recomendación:</span>{' '}
          {summary.recommendedAction}
        </p>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-4 w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium transition-colors"
      >
        Agendar Consulta →
      </motion.button>
    </motion.div>
  )
}
