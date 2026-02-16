'use client'

import { useState, useCallback, useRef } from 'react'
import { logger } from '@/lib/observability/logger'
import type {
  Message,
  Question,
  ConversationState,
  RedFlag,
  QuestionnaireSummary,
  UseQuestionnaireReturn
} from '../types'

interface UseQuestionnaireProps {
  patientId?: string
  onComplete?: (summary: QuestionnaireSummary) => void
  onEmergency?: (redFlags: RedFlag[]) => void
}

export function useQuestionnaire({
  patientId,
  onComplete,
  onEmergency
}: UseQuestionnaireProps): UseQuestionnaireReturn {
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
  const [summary, setSummary] = useState<QuestionnaireSummary | null>(null)

  const startConversation = useCallback(async () => {
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
      logger.error('Failed to start conversation', {
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setIsLoading(false)
    }
  }, [patientId])

  const fetchSummary = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/questionnaire/${id}/summary`)
      const data = await response.json()

      if (data.success) {
        setSummary(data.summary)
        setIsComplete(true)
        onComplete?.(data.summary)
      }
    } catch (error) {
      logger.error('Failed to fetch summary', {
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }, [onComplete])

  const sendMessage = useCallback(async (message: string) => {
    if (!conversationId || !message.trim()) return

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
        body: JSON.stringify({ conversationId, message })
      })

      const data = await response.json()

      if (data.success) {
        await new Promise(resolve => setTimeout(resolve, 800))

        const assistantMessage: Message = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: data.nextQuestion.text,
          timestamp: new Date(),
          question: data.nextQuestion
        }

        setMessages(prev => [...prev, assistantMessage])
        setCurrentQuestion(data.nextQuestion)
        setState(data.state)

        if (data.redFlags?.length > 0) {
          setRedFlags(prev => [...prev, ...data.redFlags])

          const hasCritical = data.redFlags.some((rf: RedFlag) => rf.severity === 'critical')
          if (hasCritical && onEmergency) {
            onEmergency(data.redFlags)
          }
        }

        if (data.completed) {
          await fetchSummary(conversationId)
        }
      }
    } catch (error) {
      logger.error('Failed to send message', {
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setIsTyping(false)
    }
  }, [conversationId, fetchSummary, onEmergency])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }, [inputValue, sendMessage])

  const handleQuickReply = useCallback((option: string) => {
    sendMessage(option)
  }, [sendMessage])

  const handleScaleSubmit = useCallback(() => {
    sendMessage(scaleValue.toString())
  }, [scaleValue, sendMessage])

  return {
    conversationId,
    messages,
    inputValue,
    isLoading,
    isTyping,
    state,
    currentQuestion,
    redFlags,
    scaleValue,
    isComplete,
    summary,
    setInputValue,
    setScaleValue,
    startConversation,
    sendMessage,
    handleSubmit,
    handleQuickReply,
    handleScaleSubmit
  }
}
