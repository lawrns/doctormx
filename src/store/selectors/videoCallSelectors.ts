import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../index'

// Base selectors
export const selectVideoCallState = (state: RootState) => state.videoCall
export const selectConversationState = (state: RootState) => state.conversation
export const selectAuthState = (state: RootState) => state.auth

// Video call selectors
export const selectIsCallActive = createSelector(
  [selectVideoCallState],
  (videoCall) => videoCall.isJoined && videoCall.connectionState === 'CONNECTED'
)

export const selectRemoteUsersCount = createSelector(
  [selectVideoCallState],
  (videoCall) => videoCall.remoteUsers.length
)

export const selectHasRemoteUsers = createSelector(
  [selectRemoteUsersCount],
  (count) => count > 0
)

export const selectCallDuration = createSelector(
  [selectVideoCallState],
  (videoCall) => {
    if (!videoCall.lastConnectionTime) return 0
    return Date.now() - videoCall.lastConnectionTime
  }
)

export const selectMediaState = createSelector(
  [selectVideoCallState],
  (videoCall) => ({
    video: videoCall.isVideoEnabled,
    audio: videoCall.isAudioEnabled,
    canToggleVideo: videoCall.isJoined,
    canToggleAudio: videoCall.isJoined,
  })
)

export const selectConnectionInfo = createSelector(
  [selectVideoCallState],
  (videoCall) => ({
    state: videoCall.connectionState,
    quality: videoCall.connectionQuality,
    channelName: videoCall.channelName,
    userId: videoCall.userId,
    participantCount: videoCall.participantCount,
  })
)

// Conversation selectors
export const selectLastMessage = createSelector(
  [selectConversationState],
  (conversation) => conversation.messages[conversation.messages.length - 1]
)

export const selectMessageCount = createSelector(
  [selectConversationState],
  (conversation) => conversation.messages.length
)

export const selectIsAIThinking = createSelector(
  [selectConversationState],
  (conversation) => conversation.isThinking || conversation.isTyping
)

export const selectCurrentThinkingStage = createSelector(
  [selectConversationState],
  (conversation) => {
    if (!conversation.isThinking || conversation.thinkingStages.length === 0) {
      return null
    }
    return conversation.thinkingStages[conversation.currentThinkingStage]
  }
)

// Auth selectors
export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated
)

export const selectUserInfo = createSelector(
  [selectAuthState],
  (auth) => auth.user ? {
    id: auth.user.id,
    email: auth.user.email,
    name: auth.user.name,
    role: auth.user.role,
    verified: auth.user.verified,
  } : null
)

export const selectUserPreferences = createSelector(
  [selectAuthState],
  (auth) => auth.preferences
)

// Combined selectors
export const selectCallStatus = createSelector(
  [selectVideoCallState, selectAuthState],
  (videoCall, auth) => ({
    isActive: videoCall.isJoined && videoCall.connectionState === 'CONNECTED',
    participantCount: videoCall.participantCount,
    userRole: auth.user?.role || 'patient',
    channelName: videoCall.channelName,
    hasError: !!videoCall.error,
  })
)

export const selectDashboardData = createSelector(
  [selectVideoCallState, selectConversationState, selectAuthState],
  (videoCall, conversation, auth) => ({
    // Video call stats
    videoCall: {
      isActive: videoCall.isJoined,
      participantCount: videoCall.participantCount,
      connectionQuality: videoCall.connectionQuality,
      hasError: !!videoCall.error,
    },
    
    // Conversation stats
    conversation: {
      messageCount: conversation.messages.length,
      isActive: conversation.isStarted,
      isAIThinking: conversation.isThinking,
      urgencyLevel: conversation.urgencyLevel,
    },
    
    // User info
    user: {
      isAuthenticated: auth.isAuthenticated,
      role: auth.user?.role || 'patient',
      language: auth.preferences.language,
      theme: auth.preferences.theme,
    },
  })
)

// Performance selectors
export const selectPerformanceMetrics = createSelector(
  [selectConversationState],
  (conversation) => ({
    averageResponseTime: conversation.averageResponseTime,
    lastResponseTime: conversation.lastResponseTime,
    responseCount: conversation.responseCount,
  })
)

// Error selectors
export const selectAllErrors = createSelector(
  [selectVideoCallState, selectConversationState, selectAuthState],
  (videoCall, conversation, auth) => {
    const errors = []
    
    if (videoCall.error) {
      errors.push({ type: 'video', message: videoCall.error })
    }
    
    if (conversation.error) {
      errors.push({ type: 'conversation', message: conversation.error })
    }
    
    if (auth.error) {
      errors.push({ type: 'auth', message: auth.error })
    }
    
    return errors
  }
)

export const selectHasAnyError = createSelector(
  [selectAllErrors],
  (errors) => errors.length > 0
)
