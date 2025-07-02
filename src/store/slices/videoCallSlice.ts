import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { agoraService, VideoCallConfig } from '../../services/video/AgoraService'

// Types
export interface VideoCallState {
  // Connection state
  isJoined: boolean
  isConnecting: boolean
  connectionState: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTING'
  
  // Channel info
  channelName: string | null
  userId: string | null
  
  // Remote users
  remoteUsers: string[]
  participantCount: number
  
  // Local media state
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  
  // Media tracks (non-serializable, handled separately)
  localVideoTrack: any | null
  localAudioTrack: any | null
  remoteVideoTracks: Record<string, any>
  remoteAudioTracks: Record<string, any>
  
  // Error handling
  error: string | null
  lastError: string | null
  
  // UI state
  isDebugMode: boolean
  showControls: boolean
  
  // Performance metrics
  connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown'
  lastConnectionTime: number | null
}

const initialState: VideoCallState = {
  isJoined: false,
  isConnecting: false,
  connectionState: 'DISCONNECTED',
  channelName: null,
  userId: null,
  remoteUsers: [],
  participantCount: 0,
  isVideoEnabled: true,
  isAudioEnabled: true,
  localVideoTrack: null,
  localAudioTrack: null,
  remoteVideoTracks: {},
  remoteAudioTracks: {},
  error: null,
  lastError: null,
  isDebugMode: false,
  showControls: true,
  connectionQuality: 'unknown',
  lastConnectionTime: null,
}

// Async thunks
export const joinVideoCall = createAsyncThunk(
  'videoCall/join',
  async (config: VideoCallConfig, { rejectWithValue }) => {
    try {
      await agoraService.initialize(config.appId)
      await agoraService.joinChannel(config)
      return {
        channelName: config.channel,
        userId: config.uid.toString(),
        timestamp: Date.now()
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to join video call')
    }
  }
)

export const leaveVideoCall = createAsyncThunk(
  'videoCall/leave',
  async (_, { rejectWithValue }) => {
    try {
      await agoraService.leaveChannel()
      return { timestamp: Date.now() }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to leave video call')
    }
  }
)

export const toggleLocalVideo = createAsyncThunk(
  'videoCall/toggleVideo',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { videoCall: VideoCallState }
      const newState = !state.videoCall.isVideoEnabled
      
      if (newState) {
        await agoraService.enableVideo()
      } else {
        await agoraService.disableVideo()
      }
      
      return newState
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to toggle video')
    }
  }
)

export const toggleLocalAudio = createAsyncThunk(
  'videoCall/toggleAudio',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { videoCall: VideoCallState }
      const newState = !state.videoCall.isAudioEnabled
      
      if (newState) {
        await agoraService.enableAudio()
      } else {
        await agoraService.disableAudio()
      }
      
      return newState
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to toggle audio')
    }
  }
)

// Slice
const videoCallSlice = createSlice({
  name: 'videoCall',
  initialState,
  reducers: {
    // Connection state management
    setConnectionState: (state, action: PayloadAction<VideoCallState['connectionState']>) => {
      state.connectionState = action.payload
    },
    
    // Remote users management
    addRemoteUser: (state, action: PayloadAction<string>) => {
      const userId = action.payload
      console.log('🔄 [Redux] addRemoteUser action received:', userId)
      console.log('🔄 [Redux] Current remoteUsers before add:', state.remoteUsers)
      if (!state.remoteUsers.includes(userId)) {
        state.remoteUsers.push(userId)
        state.participantCount = state.remoteUsers.length + (state.isJoined ? 1 : 0)
        console.log('🔄 [Redux] User added. New remoteUsers:', state.remoteUsers)
        console.log('🔄 [Redux] New participantCount:', state.participantCount)
      } else {
        console.log('🔄 [Redux] User already exists, not adding')
      }
    },
    
    removeRemoteUser: (state, action: PayloadAction<string>) => {
      const userId = action.payload
      state.remoteUsers = state.remoteUsers.filter(user => user !== userId)
      state.participantCount = state.remoteUsers.length + (state.isJoined ? 1 : 0)
      
      // Clean up tracks
      delete state.remoteVideoTracks[userId]
      delete state.remoteAudioTracks[userId]
    },
    
    // Media tracks management (non-serializable)
    setLocalVideoTrack: (state, action: PayloadAction<any>) => {
      state.localVideoTrack = action.payload
    },
    
    setLocalAudioTrack: (state, action: PayloadAction<any>) => {
      state.localAudioTrack = action.payload
    },
    
    setRemoteVideoTrack: (state, action: PayloadAction<{ userId: string; track: any }>) => {
      const { userId, track } = action.payload
      console.log('🎥 [Redux] setRemoteVideoTrack action received:', userId, track)
      state.remoteVideoTracks[userId] = track
      console.log('🎥 [Redux] Remote video tracks updated:', Object.keys(state.remoteVideoTracks))
    },
    
    setRemoteAudioTrack: (state, action: PayloadAction<{ userId: string; track: any }>) => {
      const { userId, track } = action.payload
      state.remoteAudioTracks[userId] = track
    },
    
    // Error management
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.lastError = action.payload
    },
    
    clearError: (state) => {
      state.error = null
    },
    
    // UI state
    toggleDebugMode: (state) => {
      state.isDebugMode = !state.isDebugMode
    },
    
    setShowControls: (state, action: PayloadAction<boolean>) => {
      state.showControls = action.payload
    },
    
    // Performance
    setConnectionQuality: (state, action: PayloadAction<VideoCallState['connectionQuality']>) => {
      state.connectionQuality = action.payload
    },
    
    // Reset state
    resetVideoCall: () => initialState,
  },
  
  extraReducers: (builder) => {
    // Join video call
    builder
      .addCase(joinVideoCall.pending, (state) => {
        state.isConnecting = true
        state.connectionState = 'CONNECTING'
        state.error = null
      })
      .addCase(joinVideoCall.fulfilled, (state, action) => {
        state.isConnecting = false
        state.isJoined = true
        state.connectionState = 'CONNECTED'
        state.channelName = action.payload.channelName
        state.userId = action.payload.userId
        state.lastConnectionTime = action.payload.timestamp
        state.participantCount = state.remoteUsers.length + 1
      })
      .addCase(joinVideoCall.rejected, (state, action) => {
        state.isConnecting = false
        state.connectionState = 'DISCONNECTED'
        state.error = action.payload as string
      })
    
    // Leave video call
    builder
      .addCase(leaveVideoCall.pending, (state) => {
        state.connectionState = 'DISCONNECTING'
      })
      .addCase(leaveVideoCall.fulfilled, (state) => {
        return { ...initialState }
      })
      .addCase(leaveVideoCall.rejected, (state, action) => {
        state.error = action.payload as string
        state.connectionState = 'DISCONNECTED'
      })
    
    // Toggle video
    builder
      .addCase(toggleLocalVideo.fulfilled, (state, action) => {
        state.isVideoEnabled = action.payload
      })
      .addCase(toggleLocalVideo.rejected, (state, action) => {
        state.error = action.payload as string
      })
    
    // Toggle audio
    builder
      .addCase(toggleLocalAudio.fulfilled, (state, action) => {
        state.isAudioEnabled = action.payload
      })
      .addCase(toggleLocalAudio.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

// Export actions
export const {
  setConnectionState,
  addRemoteUser,
  removeRemoteUser,
  setLocalVideoTrack,
  setLocalAudioTrack,
  setRemoteVideoTrack,
  setRemoteAudioTrack,
  setError,
  clearError,
  toggleDebugMode,
  setShowControls,
  setConnectionQuality,
  resetVideoCall,
} = videoCallSlice.actions

// Export reducer
export default videoCallSlice.reducer
