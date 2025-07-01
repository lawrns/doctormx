import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { agoraService, VideoCallConfig, VideoCallState } from '../../services/video/AgoraService';

interface VideoCallComponentProps {
  config: VideoCallConfig;
  onCallEnd?: () => void;
  onError?: (error: string) => void;
  autoStart?: boolean; // Add option to control auto-start
}

export const VideoCallComponent: React.FC<VideoCallComponentProps> = ({
  config,
  onCallEnd,
  onError,
  autoStart = true // Default to true for backward compatibility
}) => {
  const [callState, setCallState] = useState<VideoCallState>({
    isJoined: false,
    isVideoEnabled: true,
    isAudioEnabled: true,
    remoteUsers: [],
    connectionState: 'DISCONNECTED'
  });
  
  const [isConnecting, setIsConnecting] = useState(false);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const initializationStarted = useRef<boolean>(false);

  useEffect(() => {
    if (autoStart && !initializationStarted.current) {
      initializationStarted.current = true;
      initializeCall();
    }
    setupEventListeners();

    // Temporary workaround: Poll for remote users every 3 seconds
    const pollInterval = setInterval(() => {
      if (callState.isJoined) {
        console.log('[VideoCall] Polling for remote users...');
        const remoteUsers = agoraService.getRemoteUsersFromClient();
        if (remoteUsers.length > 0 && callState.remoteUsers.length === 0) {
          console.log('[VideoCall] Found remote users via polling:', remoteUsers);
          setCallState(prev => ({
            ...prev,
            remoteUsers: remoteUsers
          }));
        }
      }
    }, 3000);

    return () => {
      clearInterval(pollInterval);
      cleanup();
    };
  }, [autoStart, callState.isJoined, callState.remoteUsers.length]);

  useEffect(() => {
    // Render local video when track is available
    if (callState.isJoined && localVideoRef.current) {
      const localTrack = agoraService.getLocalVideoTrack();
      if (localTrack) {
        localTrack.play(localVideoRef.current);
      }
    }
  }, [callState.isJoined]);

  useEffect(() => {
    // Render remote videos when users join
    console.log('[VideoCall] Remote users changed:', callState.remoteUsers);
    callState.remoteUsers.forEach(uid => {
      const videoElement = remoteVideoRefs.current.get(uid.toString());
      console.log('[VideoCall] Video element for uid', uid, ':', videoElement);
      if (videoElement) {
        const remoteTrack = agoraService.getRemoteVideoTrack(uid);
        console.log('[VideoCall] Remote track for uid', uid, ':', remoteTrack);
        if (remoteTrack) {
          console.log('[VideoCall] Playing remote track for uid', uid);
          remoteTrack.play(videoElement);
        } else {
          console.warn('[VideoCall] No remote track found for uid', uid);
        }
      } else {
        console.warn('[VideoCall] No video element found for uid', uid);
      }
    });
  }, [callState.remoteUsers]);

  const initializeCall = async () => {
    try {
      setIsConnecting(true);

      // Initialize Agora service
      await agoraService.initialize(config.appId);

      // Join the channel
      await agoraService.joinChannel(config);

      setCallState(prev => ({
        ...prev,
        isJoined: true,
        connectionState: 'CONNECTED'
      }));

    } catch (error) {
      console.error('[VideoCall] Failed to initialize call:', error);

      // Reset initialization flag on error so it can be retried
      initializationStarted.current = false;

      // Reset Agora service state
      agoraService.resetState();

      onError?.(error instanceof Error ? error.message : 'Failed to start video call');
    } finally {
      setIsConnecting(false);
    }
  };

  const setupEventListeners = () => {
    agoraService.on('remoteUserJoined', ({ uid }) => {
      console.log('[VideoCall] Remote user joined:', uid);
      setCallState(prev => ({
        ...prev,
        remoteUsers: [...prev.remoteUsers.filter(u => u !== uid), uid]
      }));
    });

    agoraService.on('remoteUserLeft', ({ uid }) => {
      setCallState(prev => ({
        ...prev,
        remoteUsers: prev.remoteUsers.filter(u => u !== uid)
      }));
      remoteVideoRefs.current.delete(uid.toString());
    });

    agoraService.on('connectionStateChanged', ({ current }) => {
      setCallState(prev => ({
        ...prev,
        connectionState: current
      }));
    });

    agoraService.on('videoToggled', ({ enabled }) => {
      setCallState(prev => ({
        ...prev,
        isVideoEnabled: enabled
      }));
    });

    agoraService.on('audioToggled', ({ enabled }) => {
      setCallState(prev => ({
        ...prev,
        isAudioEnabled: enabled
      }));
    });
  };

  const toggleVideo = async () => {
    try {
      await agoraService.toggleVideo();
    } catch (error) {
      console.error('[VideoCall] Failed to toggle video:', error);
    }
  };

  const toggleAudio = async () => {
    try {
      await agoraService.toggleAudio();
    } catch (error) {
      console.error('[VideoCall] Failed to toggle audio:', error);
    }
  };

  const endCall = async () => {
    try {
      await agoraService.leaveChannel();
      setCallState(prev => ({
        ...prev,
        isJoined: false,
        connectionState: 'DISCONNECTED'
      }));
      onCallEnd?.();
    } catch (error) {
      console.error('[VideoCall] Failed to end call:', error);
    }
  };

  const manualCheckRemoteUsers = async () => {
    try {
      console.log('[VideoCall] Manual check triggered...');
      await agoraService.manualCheckRemoteUsers();
      const remoteUsers = agoraService.getRemoteUsersFromClient();
      console.log('[VideoCall] Remote users from client:', remoteUsers);
    } catch (error) {
      console.error('[VideoCall] Error in manual check:', error);
    }
  };

  const cleanup = async () => {
    try {
      await agoraService.cleanup();
      // Reset initialization flag on cleanup
      initializationStarted.current = false;
    } catch (error) {
      console.error('[VideoCall] Error during cleanup:', error);
      // Reset state even if cleanup fails
      agoraService.resetState();
      initializationStarted.current = false;
    }
  };

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900 rounded-lg">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Conectando a la consulta médica...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Video Container */}
      <div className="relative h-96 md:h-[500px]">
        {/* Remote Video (Main) */}
        {callState.remoteUsers.length > 0 ? (
          <div className="w-full h-full">
            {callState.remoteUsers.map(uid => (
              <div
                key={uid.toString()}
                ref={el => {
                  if (el) {
                    console.log('[VideoCall] Setting video ref for uid:', uid, el);
                    remoteVideoRefs.current.set(uid.toString(), el);
                  }
                }}
                className="w-full h-full bg-gray-800 border-2 border-green-500"
                style={{ minHeight: '200px' }}
              >
                <div className="text-white p-2 text-sm">
                  Remote User: {uid.toString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-center text-white">
              <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Esperando al doctor...</p>
              <p className="text-sm mt-2">Remote users: {callState.remoteUsers.length}</p>
            </div>
          </div>
        )}

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute top-4 right-4 w-32 h-24 md:w-40 md:h-30 bg-gray-700 rounded-lg overflow-hidden border-2 border-white">
          {callState.isVideoEnabled ? (
            <div
              ref={localVideoRef}
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gray-600 flex items-center justify-center">
              <VideoOff className="w-6 h-6 text-white opacity-50" />
            </div>
          )}
        </div>

        {/* Connection Status */}
        <div className="absolute top-4 left-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            callState.connectionState === 'CONNECTED' 
              ? 'bg-green-500 text-white' 
              : 'bg-yellow-500 text-black'
          }`}>
            {callState.connectionState === 'CONNECTED' ? 'Conectado' : 'Conectando...'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4">
        <div className="flex justify-center space-x-4">
          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${
              callState.isVideoEnabled
                ? 'bg-gray-600 hover:bg-gray-500 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            title={callState.isVideoEnabled ? 'Desactivar cámara' : 'Activar cámara'}
          >
            {callState.isVideoEnabled ? (
              <Video className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5" />
            )}
          </button>

          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-colors ${
              callState.isAudioEnabled
                ? 'bg-gray-600 hover:bg-gray-500 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            title={callState.isAudioEnabled ? 'Silenciar micrófono' : 'Activar micrófono'}
          >
            {callState.isAudioEnabled ? (
              <Mic className="w-5 h-5" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
          </button>

          {/* End Call */}
          <button
            onClick={endCall}
            className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
            title="Terminar consulta"
          >
            <PhoneOff className="w-5 h-5" />
          </button>

          {/* Debug button - temporary */}
          <button
            onClick={manualCheckRemoteUsers}
            className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded text-sm ml-2"
            title="Debug: Check Remote Users"
          >
            🔍 Debug
          </button>
        </div>

        {/* Call Info */}
        <div className="mt-4 text-center text-gray-300 text-sm">
          <p>Canal: {config.channel}</p>
          {callState.remoteUsers.length > 0 && (
            <p>Participantes conectados: {callState.remoteUsers.length + 1}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCallComponent;
