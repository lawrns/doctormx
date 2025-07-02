import { Camera, CameraOff, Mic, MicOff, PhoneOff, Users, Wifi, WifiOff } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useVideoCallRedux } from '../../hooks/useVideoCallRedux'
import { VideoCallConfig } from '../../services/video/AgoraService'
import '../../styles/video-consultation.css'

interface VideoCallComponentReduxProps {
  config: VideoCallConfig
  onCallEnd?: () => void
  className?: string
}

export const VideoCallComponentRedux: React.FC<VideoCallComponentReduxProps> = ({
  config,
  onCallEnd,
  className = ''
}) => {
  const localVideoRef = useRef<HTMLDivElement>(null)
  const [remoteVideoRefs] = useState<Map<string, HTMLDivElement>>(new Map())
  
  // Redux video call hook
  const videoCallState = useVideoCallRedux({
    onCallEnd,
    onError: (error) => {
      console.error('[VideoCallRedux] Error:', error)
    },
    onUserJoined: (uid) => {
      console.log('[VideoCallRedux] User joined:', uid)
    },
    onUserLeft: (uid) => {
      console.log('[VideoCallRedux] User left:', uid)
    }
  })

  // Destructure state to avoid hoisting issues
  const isJoined = videoCallState.isJoined
  const isConnecting = videoCallState.isConnecting
  const connectionState = videoCallState.connectionState
  const remoteUsers = videoCallState.remoteUsers
  const participantCount = videoCallState.participantCount
  const isVideoEnabled = videoCallState.isVideoEnabled
  const isAudioEnabled = videoCallState.isAudioEnabled
  const error = videoCallState.error
  const connectionQuality = videoCallState.connectionQuality
  const joinCall = videoCallState.joinCall
  const leaveCall = videoCallState.leaveCall
  const toggleVideo = videoCallState.toggleVideo
  const toggleAudio = videoCallState.toggleAudio
  const clearError = videoCallState.clearError
  const getLocalVideoTrack = videoCallState.getLocalVideoTrack
  const getRemoteVideoTrack = videoCallState.getRemoteVideoTrack
  const isCallActive = videoCallState.isCallActive
  const hasRemoteUsers = videoCallState.hasRemoteUsers
  const canToggleVideo = videoCallState.canToggleVideo
  const canToggleAudio = videoCallState.canToggleAudio

  // Get local video track
  const localVideoTrack = getLocalVideoTrack()

  // Debug logging for state changes
  useEffect(() => {
    console.log('🎬 [VideoCallRedux] State update - remoteUsers:', remoteUsers)
    console.log('🎬 [VideoCallRedux] State update - hasRemoteUsers:', hasRemoteUsers)
    console.log('🎬 [VideoCallRedux] State update - participantCount:', participantCount)
    console.log('🎬 [VideoCallRedux] State update - isVideoEnabled:', isVideoEnabled)
    console.log('🎬 [VideoCallRedux] State update - localVideoTrack:', localVideoTrack)
  }, [remoteUsers, hasRemoteUsers, participantCount, isVideoEnabled, localVideoTrack])

  // Auto-join call when component mounts
  useEffect(() => {
    if (!isJoined && !isConnecting) {
      console.log('[VideoCallRedux] Auto-joining call with config:', config)
      joinCall(config)
    }
  }, [config, isJoined, isConnecting, joinCall])
  
  // Handle local video track
  useEffect(() => {
    console.log('[VideoCallRedux] Local video track changed:', localVideoTrack)
    if (localVideoTrack && localVideoRef.current) {
      console.log('[VideoCallRedux] Playing local video track to element:', localVideoRef.current)
      try {
        // Clear any existing content
        localVideoRef.current.innerHTML = ''

        // Play the video track
        localVideoTrack.play(localVideoRef.current)
        console.log('[VideoCallRedux] Successfully started playing local video')

        // Check if video element was created and apply styling
        setTimeout(() => {
          const container = localVideoRef.current
          if (container) {
            console.log('[VideoCallRedux] Container HTML:', container.innerHTML)
            const videoElement = container.querySelector('video')
            if (videoElement) {
              console.log('[VideoCallRedux] Video element found, applying styles:', videoElement)
              // Apply comprehensive styling to ensure visibility
              videoElement.style.cssText = `
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
                border-radius: 8px !important;
                background-color: #1f2937 !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                z-index: 1 !important;
              `
              console.log('[VideoCallRedux] Applied comprehensive styling to video element')
            } else {
              console.warn('[VideoCallRedux] No video element found after playing track')
              console.log('[VideoCallRedux] Container contents:', container.innerHTML)
              console.log('[VideoCallRedux] Container children:', container.children)

              // Try to find any child elements
              const allElements = container.querySelectorAll('*')
              console.log('[VideoCallRedux] All child elements:', allElements)
              allElements.forEach((el, index) => {
                console.log(`[VideoCallRedux] Child ${index}:`, el.tagName, el.className, el.style.cssText)
              })
            }
          }
        }, 100)
      } catch (error) {
        console.error('[VideoCallRedux] Error playing local video:', error)
      }
    }
  }, [localVideoTrack])

  // Handle remote video tracks
  useEffect(() => {
    remoteUsers.forEach(uid => {
      const remoteTrack = getRemoteVideoTrack(uid)
      const remoteVideoElement = remoteVideoRefs.get(uid)

      if (remoteTrack && remoteVideoElement) {
        remoteTrack.play(remoteVideoElement)
      }
    })
  }, [remoteUsers, getRemoteVideoTrack, remoteVideoRefs])
  
  // Connection status indicator
  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case 'CONNECTED': return 'text-green-500'
      case 'CONNECTING': return 'text-yellow-500'
      case 'RECONNECTING': return 'text-orange-500'
      case 'DISCONNECTED': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }
  
  // Connection quality indicator
  const getQualityIcon = () => {
    switch (connectionQuality) {
      case 'excellent': return <Wifi className="w-4 h-4 connection-excellent" />
      case 'good': return <Wifi className="w-4 h-4 connection-good" />
      case 'poor': return <WifiOff className="w-4 h-4 connection-poor" />
      default: return <Wifi className="w-4 h-4 text-gray-500" />
    }
  }
  
  return (
    <div className={`video-call-redux ${className}`}>
      {/* Header with status */}
      <div className="bg-gray-900 text-white p-4 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connectionState === 'CONNECTED' ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm ${getConnectionStatusColor()}`}>
              {connectionState === 'CONNECTED' ? 'Conectado' : 
               connectionState === 'CONNECTING' ? 'Conectando...' :
               connectionState === 'RECONNECTING' ? 'Reconectando...' : 'Desconectado'}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {getQualityIcon()}
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">Participantes conectados: {participantCount}</span>
            </div>
          </div>
        </div>
        
        {/* Error display */}
        {error && (
          <div className="mt-2 p-2 bg-red-600 rounded text-sm flex justify-between items-center">
            <span>Error: {error}</span>
            <button 
              onClick={clearError}
              className="text-white hover:text-gray-300"
            >
              ×
            </button>
          </div>
        )}
      </div>
      
      {/* Video container */}
      <div className="relative bg-black rounded-b-lg overflow-hidden video-container">
        {/* Local video - Picture-in-Picture */}
        <div className="absolute top-4 right-4 w-40 h-32 bg-gray-800 rounded-lg overflow-hidden z-20 shadow-lg border-2 border-white border-opacity-20">
          <div
            ref={localVideoRef}
            className="w-full h-full relative"
            style={{
              backgroundColor: '#1f2937',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700 z-10">
              <CameraOff className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div className="absolute bottom-1 left-1 text-xs text-white bg-black bg-opacity-70 px-2 py-1 rounded z-10">
            Tú
          </div>
          {/* Debug indicator when video track is available */}
          {localVideoTrack && (
            <div className="absolute top-1 left-1 text-xs text-green-400 bg-black bg-opacity-70 px-1 rounded z-10">
              📹 LIVE
            </div>
          )}
        </div>
        
        {/* Remote videos */}
        <div className="w-full h-full">
          {hasRemoteUsers ? (
            remoteUsers.length === 1 ? (
              // Single remote user - full container
              <div className="w-full h-full relative remote-video-container">
                {remoteUsers.map((uid) => (
                  <div key={uid} className="absolute inset-0 w-full h-full">
                    <div
                      ref={(el) => {
                        if (el) remoteVideoRefs.set(uid, el)
                      }}
                      className="w-full h-full remote-video-fullscreen"
                    />
                    <div className="absolute bottom-4 left-4 text-sm text-white user-label">
                      Remote User: {uid}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Multiple remote users - optimized grid layout
              <div className={`multi-user-grid ${
                remoteUsers.length === 2 ? 'two-users' :
                remoteUsers.length === 3 ? 'three-users' :
                remoteUsers.length >= 4 ? 'four-users' : ''
              }`}>
                {remoteUsers.map((uid) => (
                  <div key={uid} className="relative bg-gray-800 rounded-lg overflow-hidden remote-video-container">
                    <div
                      ref={(el) => {
                        if (el) remoteVideoRefs.set(uid, el)
                      }}
                      className="w-full h-full"
                    />
                    <div className="absolute bottom-2 left-2 text-sm text-white user-label">
                      Remote User: {uid}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="flex items-center justify-center w-full h-full text-white waiting-state">
              <div className="text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">Esperando al doctor...</p>
                <p className="text-sm text-gray-400 mt-2">
                  Canal: {config.channel} | Usuario: {config.uid}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Controls */}
      <div className="bg-gray-100 p-4 rounded-b-lg">
        <div className="flex justify-center space-x-4">
          {/* Video toggle */}
          <button
            onClick={toggleVideo}
            disabled={!canToggleVideo}
            className={`p-3 rounded-full control-button ${
              isVideoEnabled
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            } ${!canToggleVideo ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isVideoEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
          </button>

          {/* Audio toggle */}
          <button
            onClick={toggleAudio}
            disabled={!canToggleAudio}
            className={`p-3 rounded-full control-button ${
              isAudioEnabled
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            } ${!canToggleAudio ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* End call */}
          <button
            onClick={leaveCall}
            className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white control-button"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
        
        {/* Debug info */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          <div>Estado: {connectionState} | Calidad: {connectionQuality}</div>
          <div>Video: {isVideoEnabled ? 'ON' : 'OFF'} | Audio: {isAudioEnabled ? 'ON' : 'OFF'}</div>
          <div>Usuarios remotos: {remoteUsers.join(', ') || 'Ninguno'}</div>
        </div>
      </div>
    </div>
  )
}
