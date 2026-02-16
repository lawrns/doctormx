'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useQuestionnaire, useQuestionNavigation } from './hooks'
import {
  ChatInput,
  MessageList,
  QuestionnaireHeader,
  QuestionOptions,
  RedFlagsAlert,
  SummaryView
} from './components'
import type { AdaptiveQuestionnaireProps } from './types'

export function AdaptiveQuestionnaire({
  patientId,
  onComplete,
  onEmergency,
  className
}: AdaptiveQuestionnaireProps) {
  const {
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
    handleSubmit,
    handleQuickReply,
    handleScaleSubmit
  } = useQuestionnaire({ patientId, onComplete, onEmergency })

  const {
    getUrgencyColor,
    getUrgencyLabel,
    getPhaseLabel
  } = useQuestionNavigation({ state })

  useEffect(() => {
    startConversation()
  }, [startConversation])

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-xl shadow-2xl overflow-hidden',
        className
      )}
    >
      <QuestionnaireHeader
        state={state}
        getUrgencyColor={getUrgencyColor}
        getUrgencyLabel={getUrgencyLabel}
        getPhaseLabel={getPhaseLabel}
      />

      <RedFlagsAlert redFlags={redFlags} />

      <MessageList
        messages={messages}
        isTyping={isTyping}
        symptoms={state?.symptoms || []}
      />

      <QuestionOptions
        currentQuestion={currentQuestion}
        isTyping={isTyping}
        scaleValue={scaleValue}
        onQuickReply={handleQuickReply}
        onScaleChange={setScaleValue}
        onScaleSubmit={handleScaleSubmit}
      />

      <SummaryView summary={summary} />

      <ChatInput
        inputValue={inputValue}
        isTyping={isTyping}
        isLoading={isLoading}
        isComplete={isComplete}
        onInputChange={setInputValue}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default AdaptiveQuestionnaire
