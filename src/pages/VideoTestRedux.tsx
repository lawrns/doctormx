import { ArrowLeft, BarChart3, Play, Settings } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { VideoCallComponentRedux } from '../components/video/VideoCallComponentRedux'
import { VideoCallConfig } from '../services/video/AgoraService'
import { useAppDispatch, useAppSelector } from '../store'
import { toggleDebugMode } from '../store/slices/videoCallSlice'

const VideoTestRedux: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  // Get channel from URL parameters or use default shared channel
  const getInitialChannel = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlChannel = urlParams.get('channel')
    if (urlChannel) return urlChannel
    return 'doctormx-consultation' // Default shared channel for all users
  }

  // Redux state
  const videoState = useAppSelector(state => state.videoCall)
  const authState = useAppSelector(state => state.auth)

  // Local state
  const [showConfig, setShowConfig] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [isGeneratingToken, setIsGeneratingToken] = useState(false)
  const [config, setConfig] = useState<VideoCallConfig>({
    appId: 'fffa925cd399432a895ab9a46688d279',
    channel: getInitialChannel(),
    uid: Math.floor(Math.random() * 10000),
    token: null
  })
  
  const handleConfigChange = (field: keyof VideoCallConfig, value: string | number) => {
    setConfig(prev => ({
      ...prev,
      [field]: field === 'uid' ? Number(value) : value
    }))
  }
  
  const generateNewChannel = () => {
    setConfig(prev => ({
      ...prev,
      channel: `redux-test-${Date.now()}`,
      uid: Math.floor(Math.random() * 10000)
    }))
  }

  // Token generation function
  const generateAgoraToken = async (channelName: string, uid: number): Promise<string> => {
    try {
      setIsGeneratingToken(true)
      console.log('[TokenGen] Generating token for channel:', channelName, 'uid:', uid)

      const response = await fetch('/.netlify/functions/generate-agora-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelName,
          uid: uid.toString(),
          role: 'publisher',
          expirationTimeInSeconds: 3600
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('[TokenGen] Token generated successfully')
      return data.token
    } catch (error) {
      console.error('[TokenGen] Failed to generate token:', error)
      throw new Error(`Failed to generate video call token: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGeneratingToken(false)
    }
  }

  // Sharing functionality
  const generateShareableLink = () => {
    const baseUrl = window.location.origin + window.location.pathname
    return `${baseUrl}?channel=${encodeURIComponent(config.channel)}`
  }

  const copyShareableLink = async () => {
    try {
      const link = generateShareableLink()
      await navigator.clipboard.writeText(link)
      alert('Link copied to clipboard! Share this link with others to join the same video consultation.')
    } catch (error) {
      console.error('Failed to copy link:', error)
      // Fallback for browsers that don't support clipboard API
      const link = generateShareableLink()
      prompt('Copy this link to share:', link)
    }
  }

  const joinSpecificChannel = async (channelName: string) => {
    try {
      const newUid = Math.floor(Math.random() * 10000)
      console.log('[VideoTestRedux] Generating token for channel:', channelName)

      const token = await generateAgoraToken(channelName, newUid)

      setConfig(prev => ({
        ...prev,
        channel: channelName,
        uid: newUid,
        token: token
      }))

      // Update URL to reflect the new channel
      const newUrl = `${window.location.pathname}?channel=${encodeURIComponent(channelName)}`
      window.history.pushState({}, '', newUrl)

      console.log('[VideoTestRedux] Config updated with token for channel:', channelName)
    } catch (error) {
      console.error('[VideoTestRedux] Failed to join channel:', error)
      alert(`Failed to join channel: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const joinDefaultChannel = async () => {
    await joinSpecificChannel('doctormx-consultation')
  }

  const createPrivateRoom = async () => {
    const roomId = `private-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    await joinSpecificChannel(roomId)
  }

  // Generate token for initial channel on component mount
  useEffect(() => {
    const initializeWithToken = async () => {
      if (!config.token) {
        try {
          console.log('[VideoTestRedux] Generating initial token for channel:', config.channel)
          const token = await generateAgoraToken(config.channel, config.uid)
          setConfig(prev => ({
            ...prev,
            token: token
          }))
          console.log('[VideoTestRedux] Initial token generated successfully')
        } catch (error) {
          console.error('[VideoTestRedux] Failed to generate initial token:', error)
        }
      }
    }

    initializeWithToken()
  }, []) // Only run once on mount
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  🚀 Redux Video Call Test
                </h1>
                <p className="text-sm text-gray-600">
                  Testing video consultation with Redux state management
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => dispatch(toggleDebugMode())}
                className={`p-2 rounded-lg transition-colors ${
                  videoState.isDebugMode
                    ? 'bg-blue-100 text-blue-600'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowShareOptions(!showShareOptions)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Share Channel"
              >
                <Play className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowConfig(!showConfig)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Call Component */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <VideoCallComponentRedux
                config={config}
                onCallEnd={() => {
                  console.log('Call ended')
                }}
                className="w-full"
              />
            </div>
          </div>
          
          {/* Redux State Panel */}
          <div className="space-y-6">
            {/* Configuration Panel */}
            {showConfig && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Configuration
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Channel Name
                    </label>
                    <input
                      type="text"
                      value={config.channel}
                      onChange={(e) => handleConfigChange('channel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User ID
                    </label>
                    <input
                      type="number"
                      value={config.uid}
                      onChange={(e) => handleConfigChange('uid', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <button
                    onClick={generateNewChannel}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Generate New Channel
                  </button>
                </div>
              </div>
            )}

            {/* Sharing Options Panel */}
            {showShareOptions && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Play className="w-5 h-5 mr-2" />
                  Share Video Consultation
                </h3>

                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Current Channel</h4>
                    <p className="text-sm text-blue-700 font-mono bg-white px-2 py-1 rounded">
                      {config.channel}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={copyShareableLink}
                      className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Copy Share Link
                    </button>

                    <button
                      onClick={joinDefaultChannel}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                      disabled={isGeneratingToken}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isGeneratingToken ? 'Generating Token...' : 'Join Default Room'}
                    </button>

                    <button
                      onClick={createPrivateRoom}
                      className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                      disabled={isGeneratingToken}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isGeneratingToken ? 'Generating Token...' : 'Create Private Room'}
                    </button>

                    <button
                      onClick={async () => {
                        const channelName = prompt('Enter channel name to join:')
                        if (channelName) await joinSpecificChannel(channelName)
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                      disabled={isGeneratingToken}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isGeneratingToken ? 'Generating Token...' : 'Join Custom Room'}
                    </button>

                    <button
                      onClick={() => {
                        // Simulate remote user joining for testing
                        const testUid = `test-user-${Date.now()}`
                        console.log('[TEST] Simulating remote user join:', testUid)
                        // This will test if the Redux flow is working
                        window.dispatchEvent(new CustomEvent('test-remote-user', { detail: testUid }))
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Test Remote User
                    </button>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-1">How to Connect</h4>
                    <p className="text-sm text-yellow-700">
                      1. Copy the share link and send it to others<br/>
                      2. Or have them enter the channel name: <strong>{config.channel}</strong><br/>
                      3. Both devices will join the same video consultation
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Redux State Display */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📊 Redux State</h3>
              
              {/* Video Call State */}
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Video Call State</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Connected:</span>
                      <span className={videoState.isJoined ? 'text-green-600' : 'text-red-600'}>
                        {videoState.isJoined ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span>{videoState.connectionState}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Participants:</span>
                      <span>{videoState.participantCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remote Users:</span>
                      <span>{videoState.remoteUsers.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Video:</span>
                      <span className={videoState.isVideoEnabled ? 'text-green-600' : 'text-red-600'}>
                        {videoState.isVideoEnabled ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Audio:</span>
                      <span className={videoState.isAudioEnabled ? 'text-green-600' : 'text-red-600'}>
                        {videoState.isAudioEnabled ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Auth State */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Auth State</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Authenticated:</span>
                      <span className={authState.isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                        {authState.isAuthenticated ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Language:</span>
                      <span>{authState.preferences.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Theme:</span>
                      <span>{authState.preferences.theme}</span>
                    </div>
                  </div>
                </div>
                
                {/* Error State */}
                {videoState.error && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-2">Error</h4>
                    <p className="text-sm text-red-700">{videoState.error}</p>
                  </div>
                )}
                
                {/* Debug Info */}
                {videoState.isDebugMode && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Debug Info</h4>
                    <div className="text-xs text-blue-700 space-y-1">
                      <div>Channel: {videoState.channelName}</div>
                      <div>User ID: {videoState.userId}</div>
                      <div>Quality: {videoState.connectionQuality}</div>
                      <div>Last Connection: {videoState.lastConnectionTime ? new Date(videoState.lastConnectionTime).toLocaleTimeString() : 'Never'}</div>
                      <div>Remote Users: [{videoState.remoteUsers.join(', ')}]</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Instructions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📝 Multi-Device Video Consultation</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>🔗 To connect with another device:</strong></p>
                <p>1. Click the share button (▶️) and copy the share link</p>
                <p>2. Send the link to another device or person</p>
                <p>3. Both devices will join the same video consultation</p>
                <p></p>
                <p><strong>🏠 Quick Options:</strong></p>
                <p>• <strong>Default Room:</strong> Join 'doctormx-consultation' (shared by all users)</p>
                <p>• <strong>Private Room:</strong> Create a unique private channel</p>
                <p>• <strong>Custom Room:</strong> Enter a specific channel name</p>
                <p></p>
                <p><strong>📱 Testing:</strong></p>
                <p>• Open multiple browser tabs with the same channel</p>
                <p>• Test on different devices (laptop, phone, tablet)</p>
                <p>• Monitor Redux state updates in real-time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoTestRedux
