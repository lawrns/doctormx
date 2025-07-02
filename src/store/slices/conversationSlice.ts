import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

// Types
export interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  isStreaming?: boolean
  confidence?: number
  metadata?: {
    thinking?: string[]
    culturalFactors?: string[]
    medicalTerms?: string[]
  }
}

export interface ConversationState {
  // Messages
  messages: Message[]
  currentMessage: string
  isTyping: boolean
  
  // Conversation state
  isStarted: boolean
  sessionId: string | null
  
  // AI state
  isThinking: boolean
  thinkingStages: string[]
  currentThinkingStage: number
  
  // User context
  familyMember: string
  location: { latitude: number; longitude: number } | null
  
  // Medical context
  symptoms: string[]
  currentSymptom: string | null
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
  
  // UI state
  activeTab: 'chat' | 'analysis' | 'providers' | 'prescriptions' | 'appointments' | 'pharmacies'
  showFamilySetup: boolean
  
  // Error handling
  error: string | null
  
  // Performance
  lastResponseTime: number | null
  averageResponseTime: number
  responseCount: number
}

const initialState: ConversationState = {
  messages: [
    {
      id: '1',
      text: '¡Hola! Soy el Doctor IA de DoctorMX. ¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date(),
    }
  ],
  currentMessage: '',
  isTyping: false,
  isStarted: false,
  sessionId: null,
  isThinking: false,
  thinkingStages: [],
  currentThinkingStage: 0,
  familyMember: 'myself',
  location: null,
  symptoms: [],
  currentSymptom: null,
  urgencyLevel: 'low',
  activeTab: 'chat',
  showFamilySetup: false,
  error: null,
  lastResponseTime: null,
  averageResponseTime: 0,
  responseCount: 0,
}

// Async thunks
export const sendMessage = createAsyncThunk(
  'conversation/sendMessage',
  async (message: string, { getState, rejectWithValue }) => {
    try {
      const startTime = Date.now()
      const state = getState() as { conversation: ConversationState }
      
      // Simulate AI response (replace with actual AI service call)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const responseTime = Date.now() - startTime
      
      return {
        userMessage: {
          id: `user_${Date.now()}`,
          text: message,
          sender: 'user' as const,
          timestamp: new Date(),
        },
        botMessage: {
          id: `bot_${Date.now()}`,
          text: `Entiendo tu consulta: "${message}". Permíteme analizar esto...`,
          sender: 'bot' as const,
          timestamp: new Date(),
          confidence: 0.85,
        },
        responseTime,
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to send message')
    }
  }
)

export const startConversation = createAsyncThunk(
  'conversation/start',
  async (initialMessage?: string) => {
    const sessionId = `session_${Date.now()}`
    return {
      sessionId,
      initialMessage,
      timestamp: Date.now(),
    }
  }
)

// Slice
const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    // Message management
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload)
    },
    
    updateMessage: (state, action: PayloadAction<{ id: string; updates: Partial<Message> }>) => {
      const { id, updates } = action.payload
      const messageIndex = state.messages.findIndex(msg => msg.id === id)
      if (messageIndex !== -1) {
        state.messages[messageIndex] = { ...state.messages[messageIndex], ...updates }
      }
    },
    
    setCurrentMessage: (state, action: PayloadAction<string>) => {
      state.currentMessage = action.payload
    },
    
    setIsTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload
    },
    
    // AI thinking state
    setIsThinking: (state, action: PayloadAction<boolean>) => {
      state.isThinking = action.payload
      if (!action.payload) {
        state.thinkingStages = []
        state.currentThinkingStage = 0
      }
    },
    
    setThinkingStages: (state, action: PayloadAction<string[]>) => {
      state.thinkingStages = action.payload
      state.currentThinkingStage = 0
    },
    
    nextThinkingStage: (state) => {
      if (state.currentThinkingStage < state.thinkingStages.length - 1) {
        state.currentThinkingStage += 1
      }
    },
    
    // User context
    setFamilyMember: (state, action: PayloadAction<string>) => {
      state.familyMember = action.payload
    },
    
    setLocation: (state, action: PayloadAction<{ latitude: number; longitude: number } | null>) => {
      state.location = action.payload
    },
    
    // Medical context
    addSymptom: (state, action: PayloadAction<string>) => {
      if (!state.symptoms.includes(action.payload)) {
        state.symptoms.push(action.payload)
      }
    },
    
    removeSymptom: (state, action: PayloadAction<string>) => {
      state.symptoms = state.symptoms.filter(symptom => symptom !== action.payload)
    },
    
    setCurrentSymptom: (state, action: PayloadAction<string | null>) => {
      state.currentSymptom = action.payload
    },
    
    setUrgencyLevel: (state, action: PayloadAction<ConversationState['urgencyLevel']>) => {
      state.urgencyLevel = action.payload
    },
    
    // UI state
    setActiveTab: (state, action: PayloadAction<ConversationState['activeTab']>) => {
      state.activeTab = action.payload
    },
    
    setShowFamilySetup: (state, action: PayloadAction<boolean>) => {
      state.showFamilySetup = action.payload
    },
    
    // Error handling
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    
    clearError: (state) => {
      state.error = null
    },
    
    // Reset conversation
    resetConversation: () => initialState,
  },
  
  extraReducers: (builder) => {
    // Send message
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isTyping = true
        state.error = null
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isTyping = false
        
        // Add user message
        state.messages.push(action.payload.userMessage)
        
        // Add bot message
        state.messages.push(action.payload.botMessage)
        
        // Update performance metrics
        state.lastResponseTime = action.payload.responseTime
        state.responseCount += 1
        state.averageResponseTime = 
          (state.averageResponseTime * (state.responseCount - 1) + action.payload.responseTime) / state.responseCount
        
        // Clear current message
        state.currentMessage = ''
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isTyping = false
        state.error = action.payload as string
      })
    
    // Start conversation
    builder
      .addCase(startConversation.fulfilled, (state, action) => {
        state.isStarted = true
        state.sessionId = action.payload.sessionId
        
        if (action.payload.initialMessage) {
          state.messages.push({
            id: `user_${action.payload.timestamp}`,
            text: action.payload.initialMessage,
            sender: 'user',
            timestamp: new Date(),
          })
        }
      })
  },
})

// Export actions
export const {
  addMessage,
  updateMessage,
  setCurrentMessage,
  setIsTyping,
  setIsThinking,
  setThinkingStages,
  nextThinkingStage,
  setFamilyMember,
  setLocation,
  addSymptom,
  removeSymptom,
  setCurrentSymptom,
  setUrgencyLevel,
  setActiveTab,
  setShowFamilySetup,
  setError,
  clearError,
  resetConversation,
} = conversationSlice.actions

// Export reducer
export default conversationSlice.reducer
