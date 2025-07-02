import { useCallback, useEffect } from 'react'
import { agoraService, VideoCallConfig } from '../services/video/AgoraService'
import { useAppDispatch, useAppSelector } from '../store'
import {
    addRemoteUser,
    clearError,
    joinVideoCall,
    leaveVideoCall,
    removeRemoteUser,
    setConnectionQuality,
    setConnectionState,
    setError,
    setLocalAudioTrack,
    setLocalVideoTrack,
    setRemoteAudioTrack,
    setRemoteVideoTrack,
    toggleLocalAudio,
    toggleLocalVideo,
} from '../store/slices/videoCallSlice'

interface UseVideoCallReduxOptions {
  onCallEnd?: () => void
  onError?: (error: string) => void
  onUserJoined?: (uid: string) => void
  onUserLeft?: (uid: string) => void
}

export const useVideoCallRedux = (options: UseVideoCallReduxOptions = {}) => {
  const dispatch = useAppDispatch()
  const videoState = useAppSelector(state => state.videoCall)
  
  // Setup event listeners for Agora service
  useEffect(() => {
    // Test event listener for debugging - define outside setupEventListeners for proper scope
    const handleTestRemoteUser = (event: CustomEvent) => {
      const testUid = event.detail
      console.log('🧪 [TEST] Simulating remote user join in Redux:', testUid)
      console.log('🧪 [TEST] Current remoteUsers before dispatch:', videoState.remoteUsers)
      console.log('🧪 [TEST] Current hasRemoteUsers before dispatch:', videoState.remoteUsers.length > 0)

      dispatch(addRemoteUser(testUid))
      console.log('🧪 [TEST] Dispatched addRemoteUser action')

      // Also simulate a video track with proper play method
      const mockTrack = {
        uid: testUid,
        mock: true,
        play: (element: HTMLElement) => {
          console.log('🎭 [MOCK] Playing mock video track to element:', element)
          // Create a mock video element for testing
          if (element) {
            element.style.backgroundColor = '#4CAF50'
            element.innerHTML = `<div style="color: white; text-align: center; padding: 20px;">Mock Video: ${testUid}</div>`
          }
        }
      }
      dispatch(setRemoteVideoTrack({ userId: testUid, track: mockTrack as any }))
      console.log('🧪 [TEST] Dispatched setRemoteVideoTrack action')

      // Log state after a brief delay to see if it updated
      setTimeout(() => {
        console.log('🧪 [TEST] State after dispatch - remoteUsers:', videoState.remoteUsers)
        console.log('🧪 [TEST] State after dispatch - hasRemoteUsers:', videoState.remoteUsers.length > 0)
      }, 100)
    }

    const setupEventListeners = () => {
      // Connection state changes
      agoraService.on('connection-state-changed', (state: string) => {
        dispatch(setConnectionState(state as any))
      })

      // Remote user events
      agoraService.on('user-joined', (uid: string) => {
        console.log('[Redux] Remote user joined:', uid)
        dispatch(addRemoteUser(uid))
        options.onUserJoined?.(uid)
      })

      agoraService.on('user-left', (uid: string) => {
        console.log('[Redux] Remote user left:', uid)
        dispatch(removeRemoteUser(uid))
        options.onUserLeft?.(uid)
      })

      // Add test event listener
      window.addEventListener('test-remote-user', handleTestRemoteUser as any)
      
      // Media track events
      agoraService.on('local-video-track-created', (track: any) => {
        dispatch(setLocalVideoTrack(track))
      })
      
      agoraService.on('local-audio-track-created', (track: any) => {
        dispatch(setLocalAudioTrack(track))
      })
      
      agoraService.on('remote-video-track-added', ({ uid, track }: { uid: string; track: any }) => {
        dispatch(setRemoteVideoTrack({ userId: uid, track }))
      })
      
      agoraService.on('remote-audio-track-added', ({ uid, track }: { uid: string; track: any }) => {
        dispatch(setRemoteAudioTrack({ userId: uid, track }))
      })
      
      // Error events
      agoraService.on('error', (error: string) => {
        console.error('[Redux] Video call error:', error)
        dispatch(setError(error))
        options.onError?.(error)
      })
      
      // Connection quality
      agoraService.on('network-quality', (quality: string) => {
        dispatch(setConnectionQuality(quality as any))
      })
    }
    
    setupEventListeners()

    // Cleanup
    return () => {
      // Note: Individual cleanup will be handled by component unmount
      // For now, we'll skip cleanup to avoid errors
      window.removeEventListener('test-remote-user', handleTestRemoteUser as any)
    }
  }, [dispatch, options])
  
  // Join video call
  const joinCall = useCallback(async (config: VideoCallConfig) => {
    try {
      dispatch(clearError())
      await dispatch(joinVideoCall(config)).unwrap()
    } catch (error) {
      console.error('[Redux] Failed to join call:', error)
      options.onError?.(error as string)
    }
  }, [dispatch, options])
  
  // Leave video call
  const leaveCall = useCallback(async () => {
    try {
      await dispatch(leaveVideoCall()).unwrap()
      options.onCallEnd?.()
    } catch (error) {
      console.error('[Redux] Failed to leave call:', error)
      options.onError?.(error as string)
    }
  }, [dispatch, options])
  
  // Toggle video
  const toggleVideo = useCallback(async () => {
    try {
      await dispatch(toggleLocalVideo()).unwrap()
    } catch (error) {
      console.error('[Redux] Failed to toggle video:', error)
      options.onError?.(error as string)
    }
  }, [dispatch, options])
  
  // Toggle audio
  const toggleAudio = useCallback(async () => {
    try {
      await dispatch(toggleLocalAudio()).unwrap()
    } catch (error) {
      console.error('[Redux] Failed to toggle audio:', error)
      options.onError?.(error as string)
    }
  }, [dispatch, options])
  
  // Get local video track
  const getLocalVideoTrack = useCallback(() => {
    return videoState.localVideoTrack
  }, [videoState.localVideoTrack])
  
  // Get remote video track
  const getRemoteVideoTrack = useCallback((uid: string) => {
    return videoState.remoteVideoTracks[uid]
  }, [videoState.remoteVideoTracks])
  
  // Get remote audio track
  const getRemoteAudioTrack = useCallback((uid: string) => {
    return videoState.remoteAudioTracks[uid]
  }, [videoState.remoteAudioTracks])
  
  // Clear error
  const clearVideoError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])
  
  return {
    // State
    ...videoState,
    
    // Actions
    joinCall,
    leaveCall,
    toggleVideo,
    toggleAudio,
    clearError: clearVideoError,
    
    // Getters
    getLocalVideoTrack,
    getRemoteVideoTrack,
    getRemoteAudioTrack,
    
    // Computed values
    isCallActive: videoState.isJoined && videoState.connectionState === 'CONNECTED',
    hasRemoteUsers: videoState.remoteUsers.length > 0,
    canToggleVideo: videoState.isJoined,
    canToggleAudio: videoState.isJoined,
  }
}
