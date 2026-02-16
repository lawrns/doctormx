export type QuestionType = 'open' | 'choice' | 'scale' | 'yes_no' | 'location' | 'image'

export type Question = {
  id: string
  text: string
  type: QuestionType
  options?: string[]
  min_value?: number
  max_value?: number
  category: string
  priority: number
  reasoning: string
}

export type Symptom = {
  name: string
  severity?: number
  duration?: string
  location?: string
}

export type RedFlag = {
  symptom: string
  severity: 'high' | 'critical'
  message: string
  action: string
}

export type MessageRole = 'user' | 'assistant'

export type Message = {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  question?: Question
}

export type ConversationPhase = 'history_taking' | 'focused_inquiry' | 'synthesis'

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency'

export type ConversationState = {
  phase: ConversationPhase
  urgencyLevel: UrgencyLevel
  questionCount: number
  symptoms: Symptom[]
  progress: number
}

export interface QuestionnaireSummary {
  phase: string
  urgencyLevel: string
  symptoms: Symptom[]
  questionCount: number
  redFlags: RedFlag[]
  estimatedSpecialty?: string
  recommendedSpecialty?: string
  chiefComplaint?: string
  recommendedAction?: string
  recommendations?: string[]
}

export interface AdaptiveQuestionnaireProps {
  patientId?: string
  onComplete?: (summary: QuestionnaireSummary) => void
  onEmergency?: (redFlags: RedFlag[]) => void
  className?: string
}

export interface UseQuestionnaireReturn {
  conversationId: string | null
  messages: Message[]
  inputValue: string
  isLoading: boolean
  isTyping: boolean
  state: ConversationState | null
  currentQuestion: Question | null
  redFlags: RedFlag[]
  scaleValue: number
  isComplete: boolean
  summary: QuestionnaireSummary | null
  setInputValue: (value: string) => void
  setScaleValue: (value: number) => void
  startConversation: () => Promise<void>
  sendMessage: (message: string) => Promise<void>
  handleSubmit: (e: React.FormEvent) => void
  handleQuickReply: (option: string) => void
  handleScaleSubmit: () => void
}
