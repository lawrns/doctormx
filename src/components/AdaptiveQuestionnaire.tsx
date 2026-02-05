'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, Camera, Loader2, AlertTriangle, CheckCircle2, ChevronDown, Bot, User, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

type Question = {
  id: string
  text: string
  type: 'open' | 'choice' | 'scale' | 'yes_no' | 'location' | 'image'
  options?: string[]
  min_value?: number
  max_value?: number
  category: string
  priority: number
  reasoning: string
}

type Symptom = {
  name: string
  severity?: number
  duration?: string
  location?: string
}

type RedFlag = {
  symptom: string
  severity: 'high' | 'critical'
  message: string
  action: string
}

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  question?: Question
}

type ConversationState = {
  phase: 'history_taking' | 'focused_inquiry' | 'synthesis'
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency'
  questionCount: number
  symptoms: Symptom[]
  progress: number
}

interface AdaptiveQuestionnaireProps {
  patientId?: string
  onComplete?: (summary: any) => void
  onEmergency?: (redFlags: RedFlag[]) => void
  className?: string
}

export function AdaptiveQuestionnaire({
  patientId,
  onComplete,
  onEmergency,
  className
}: AdaptiveQuestionnaireProps) {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [state, setState] = useState<ConversationState | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [redFlags, setRedFlags] = useState<RedFlag[]>([])
  const [scaleValue, setScaleValue] = useState(5)
  const [isComplete, setIsComplete] = useState(false)
  const [summary, setSummary] = useState<any>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Start conversation on mount
  useEffect(() => {
    startConversation()
  }, [])

  const startConversation = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/questionnaire/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId })
      })

      const data = await response.json()
      
      if (data.success) {
        setConversationId(data.conversationId)
        setCurrentQuestion(data.firstQuestion)
        
        // Add first message
        setMessages([{
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: data.firstQuestion.text,
          timestamp: new Date(),
          question: data.firstQuestion
        }])
        
        setState({
          phase: 'history_taking',
          urgencyLevel: 'low',
          questionCount: 1,
          symptoms: [],
          progress: 5
        })
      }
    } catch (error) {
      console.error('Failed to start conversation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (message: string) => {
    if (!conversationId || !message.trim()) return

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/questionnaire/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message
        })
      })

      const data = await response.json()

      if (data.success) {
        // Simulate typing delay for more natural feel
        await new Promise(resolve => setTimeout(resolve, 800))

        // Add assistant message
        const assistantMessage: Message = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: data.nextQuestion.text,
          timestamp: new Date(),
          question: data.nextQuestion
        }
        setMessages(prev => [...prev, assistantMessage])
        setCurrentQuestion(data.nextQuestion)
        
        // Update state
        setState(data.state)

        // Handle red flags
        if (data.redFlags && data.redFlags.length > 0) {
          setRedFlags(prev => [...prev, ...data.redFlags])
          
          const hasCritical = data.redFlags.some((rf: RedFlag) => rf.severity === 'critical')
          if (hasCritical && onEmergency) {
            onEmergency(data.redFlags)
          }
        }

        // Check if complete
        if (data.completed) {
          await fetchSummary()
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const fetchSummary = async () => {
    if (!conversationId) return

    try {
      const response = await fetch(`/api/questionnaire/${conversationId}/summary`)
      const data = await response.json()

      if (data.success) {
        setSummary(data.summary)
        setIsComplete(true)
        onComplete?.(data.summary)
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handleQuickReply = (option: string) => {
    sendMessage(option)
  }

  const handleScaleSubmit = () => {
    sendMessage(scaleValue.toString())
  }

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'emergency': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'history_taking': return 'Recopilando información'
      case 'focused_inquiry': return 'Evaluación detallada'
      case 'synthesis': return 'Organizando información'
      default: return 'Procesando'
    }
  }

  return (
    <div className={cn('flex flex-col h-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-xl shadow-2xl overflow-hidden', className)}>
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
              />
            </div>
            <div>
              <h2 className="font-semibold">Asistente de Orientación</h2>
              <p className="text-xs text-white/70">DoctorMx</p>
            </div>
          </div>
          
          {state && (
            <div className="flex items-center gap-3">
              <div className={cn('px-3 py-1 rounded-full text-xs font-medium', getUrgencyColor(state.urgencyLevel))}>
                {state.urgencyLevel === 'emergency' ? 'Emergencia' :
                 state.urgencyLevel === 'high' ? 'Urgente' :
                 state.urgencyLevel === 'medium' ? 'Moderado' : 'Estable'}
              </div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {state && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-white/70 mb-1">
              <span>{getPhaseLabel(state.phase)}</span>
              <span>{state.progress}%</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${state.progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Red Flags Alert */}
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
                  <li key={idx} className="text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {flag.message}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message, idx) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3 shadow-md',
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                    : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-md border border-slate-200 dark:border-slate-600'
                )}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className="text-[10px] mt-1 opacity-50">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-lg">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white dark:bg-slate-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-md border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-1">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                    className="w-2 h-2 rounded-full bg-blue-400"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    className="w-2 h-2 rounded-full bg-blue-400"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                    className="w-2 h-2 rounded-full bg-blue-400"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Symptoms collected */}
        {state && state.symptoms.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap gap-2 py-2"
          >
            {state.symptoms.map((symptom, idx) => (
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
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies for choice questions */}
      {currentQuestion?.type === 'choice' && currentQuestion.options && !isTyping && (
        <div className="flex-shrink-0 p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Selecciona una opción:</p>
          <div className="flex flex-wrap gap-2">
            {currentQuestion.options.map((option, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickReply(option)}
                className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-sm text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 transition-colors"
              >
                {option}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Yes/No quick replies */}
      {currentQuestion?.type === 'yes_no' && !isTyping && (
        <div className="flex-shrink-0 p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <div className="flex gap-2 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickReply('Sí')}
              className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
            >
              Sí
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickReply('No')}
              className="px-8 py-3 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-white rounded-xl font-medium transition-colors"
            >
              No
            </motion.button>
          </div>
        </div>
      )}

      {/* Scale input */}
      {currentQuestion?.type === 'scale' && !isTyping && (
        <div className="flex-shrink-0 p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 text-center">
            {currentQuestion.min_value || 1} = Leve, {currentQuestion.max_value || 10} = Muy intenso
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{currentQuestion.min_value || 1}</span>
            <input
              type="range"
              min={currentQuestion.min_value || 1}
              max={currentQuestion.max_value || 10}
              value={scaleValue}
              onChange={(e) => setScaleValue(parseInt(e.target.value))}
              className="flex-1 h-2 bg-slate-200 dark:bg-slate-600 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-sm text-slate-500">{currentQuestion.max_value || 10}</span>
          </div>
          <div className="flex items-center justify-center mt-3">
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{scaleValue}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleScaleSubmit}
            className="mt-3 w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
          >
            Confirmar
          </motion.button>
        </div>
      )}

      {/* Summary display */}
      {isComplete && summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-t border-green-200 dark:border-green-800"
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-700 dark:text-green-300">Evaluación completa</span>
          </div>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Motivo:</span> {summary.chiefComplaint}</p>
            <p><span className="font-medium">Urgencia:</span> {summary.urgencyLevel}</p>
            <p><span className="font-medium">Especialidad sugerida:</span> {summary.recommendedSpecialty}</p>
            <p><span className="font-medium">Recomendación:</span> {summary.recommendedAction}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium transition-colors"
          >
            Agendar Consulta →
          </motion.button>
        </motion.div>
      )}

      {/* Input area */}
      {!isComplete && (
        <form onSubmit={handleSubmit} className="flex-shrink-0 p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
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
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe tu respuesta..."
                disabled={isTyping || isLoading}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!inputValue.trim() || isTyping || isLoading}
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
      )}
    </div>
  )
}

export default AdaptiveQuestionnaire
