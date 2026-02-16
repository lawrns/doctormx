'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, Mic, Camera, Loader2 } from 'lucide-react'

interface ChatInputProps {
  inputValue: string
  isTyping: boolean
  isLoading: boolean
  isComplete: boolean
  onInputChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export function ChatInput({
  inputValue,
  isTyping,
  isLoading,
  isComplete,
  onInputChange,
  onSubmit
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  if (isComplete) return null

  const isDisabled = !inputValue.trim() || isTyping || isLoading

  return (
    <form
      onSubmit={onSubmit}
      className="flex-shrink-0 p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
          title="Subir imagen"
        >
          <Camera className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
          title="Entrada de voz"
        >
          <Mic className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Escribe tu respuesta..."
            disabled={isTyping || isLoading}
            className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isDisabled}
          className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isTyping || isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </motion.button>
      </div>

      <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-2">
        Esta conversación es solo informativa. Un médico revisará tu caso.
      </p>
    </form>
  )
}
