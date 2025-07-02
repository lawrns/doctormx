import { ArrowLeft, Play, Settings } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { VideoCallComponentRedux } from '../components/video/VideoCallComponentRedux'
import { VideoCallConfig } from '../services/video/AgoraService'

const VideoTestRedux: React.FC = () => {
  const navigate = useNavigate()
  // Force deployment - UI cleanup completed

  // Get channel from URL parameters or use default shared channel
  const getInitialChannel = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlChannel = urlParams.get('channel')
    if (urlChannel) return urlChannel
    return 'doctormx-consultation' // Default shared channel for all users
  }

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
                  📹 Video Consultation
                </h1>
                <p className="text-sm text-gray-600">
                  Professional video consultation platform
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
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


            

          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoTestRedux
