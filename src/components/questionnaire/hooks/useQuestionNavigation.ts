'use client'

import { useCallback } from 'react'
import type { ConversationState, UrgencyLevel, ConversationPhase } from '../types'

interface UseQuestionNavigationProps {
  state: ConversationState | null
}

interface UseQuestionNavigationReturn {
  getUrgencyColor: (level: UrgencyLevel | string) => string
  getUrgencyLabel: (level: UrgencyLevel | string) => string
  getPhaseLabel: (phase: ConversationPhase | string) => string
  canGoBack: boolean
  canGoForward: boolean
}

export function useQuestionNavigation({
  state
}: UseQuestionNavigationProps): UseQuestionNavigationReturn {
  const getUrgencyColor = useCallback((level: UrgencyLevel | string): string => {
    const colorMap: Record<string, string> = {
      emergency: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    }
    return colorMap[level] ?? 'bg-gray-500'
  }, [])

  const getUrgencyLabel = useCallback((level: UrgencyLevel | string): string => {
    const labelMap: Record<string, string> = {
      emergency: 'Emergencia',
      high: 'Urgente',
      medium: 'Moderado',
      low: 'Estable'
    }
    return labelMap[level] || level
  }, [])

  const getPhaseLabel = useCallback((phase: ConversationPhase | string): string => {
    const phaseMap: Record<string, string> = {
      history_taking: 'Recopilando información',
      focused_inquiry: 'Evaluación detallada',
      synthesis: 'Generando diagnóstico'
    }
    return phaseMap[phase] ?? 'Procesando'
  }, [])

  const canGoBack = state ? state.questionCount > 1 : false
  const canGoForward = state ? state.progress < 100 : false

  return {
    getUrgencyColor,
    getUrgencyLabel,
    getPhaseLabel,
    canGoBack,
    canGoForward
  }
}
