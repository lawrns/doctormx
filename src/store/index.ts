import { combineReducers, configureStore } from '@reduxjs/toolkit'

// Import slices
import authReducer from './slices/authSlice'
import conversationReducer from './slices/conversationSlice'
import videoCallReducer from './slices/videoCallSlice'

// Root reducer (simplified without persistence for now)
const rootReducer = combineReducers({
  videoCall: videoCallReducer,
  conversation: conversationReducer,
  auth: authReducer,
})

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'videoCall/setLocalVideoTrack',
          'videoCall/setRemoteVideoTrack',
        ],
        ignoredPaths: [
          'videoCall.localVideoTrack',
          'videoCall.remoteVideoTracks',
          'videoCall.localAudioTrack',
          'videoCall.remoteAudioTracks',
        ]
      }
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

// Note: Persistence removed for debugging

// Types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Typed hooks
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
