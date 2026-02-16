'use client'

import { motion } from 'framer-motion'
import type { Question } from '../types'

interface QuestionOptionsProps {
  currentQuestion: Question | null
  isTyping: boolean
  scaleValue: number
  onQuickReply: (option: string) => void
  onScaleChange: (value: number) => void
  onScaleSubmit: () => void
}

export function QuestionOptions({
  currentQuestion,
  isTyping,
  scaleValue,
  onQuickReply,
  onScaleChange,
  onScaleSubmit
}: QuestionOptionsProps) {
  if (!currentQuestion || isTyping) return null

  // Choice options
  if (currentQuestion.type === 'choice' && currentQuestion.options) {
    return (
      <div className="flex-shrink-0 p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          Selecciona una opción:
        </p>
        <div className="flex flex-wrap gap-2">
          {currentQuestion.options.map((option, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onQuickReply(option)}
              className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-sm text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 transition-colors"
            >
              {option}
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  // Yes/No options
  if (currentQuestion.type === 'yes_no') {
    return (
      <div className="flex-shrink-0 p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
        <div className="flex gap-2 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onQuickReply('Sí')}
            className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
          >
            Sí
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onQuickReply('No')}
            className="px-8 py-3 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-white rounded-xl font-medium transition-colors"
          >
            No
          </motion.button>
        </div>
      </div>
    )
  }

  // Scale input
  if (currentQuestion.type === 'scale') {
    const min = currentQuestion.min_value || 1
    const max = currentQuestion.max_value || 10

    return (
      <div className="flex-shrink-0 p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 text-center">
          {min} = Leve, {max} = Muy intenso
        </p>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{min}</span>
          <input
            type="range"
            min={min}
            max={max}
            value={scaleValue}
            onChange={(e) => onScaleChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-slate-200 dark:bg-slate-600 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-sm text-slate-500">{max}</span>
        </div>
        <div className="flex items-center justify-center mt-3">
          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {scaleValue}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onScaleSubmit}
          className="mt-3 w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
        >
          Confirmar
        </motion.button>
      </div>
    )
  }

  return null
}
