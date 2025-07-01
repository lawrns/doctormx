import { useState, useEffect, useCallback } from 'react';
import { agoraService, VideoCallConfig, VideoCallState } from '../services/video/AgoraService';

interface UseVideoCallOptions {
  onCallEnd?: () => void;
  onError?: (error: string) => void;
  onUserJoined?: (uid: string) => void;
  onUserLeft?: (uid: string) => void;
}

interface UseVideoCallReturn {
  callState: VideoCallState;
  isConnecting: boolean;
  error: string | null;
  joinCall: (config: VideoCallConfig) => Promise<void>;
  leaveCall: () => Promise<void>;
  toggleVideo: () => Promise<void>;
  toggleAudio: () => Promise<void>;
  getLocalVideoTrack: () => any;
  getRemoteVideoTrack: (uid: string) => any;
}

export const useVideoCall = (options: UseVideoCallOptions = {}): UseVideoCallReturn => {
  const [callState, setCallState] = useState<VideoCallState>({
    isJoined: false,
    isVideoEnabled: true,
    isAudioEnabled: true,
    remoteUsers: [],
    connectionState: 'DISCONNECTED'
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setupEventListeners();
    return () => {
      cleanup();
    };
  }, []);

  const setupEventListeners = useCallback(() => {
    agoraService.on('remoteUserJoined', ({ uid }) => {
      setCallState(prev => ({
        ...prev,
        remoteUsers: [...prev.remoteUsers.filter(u => u !== uid), uid]
      }));
      options.onUserJoined?.(uid.toString());
    });

    agoraService.on('remoteUserLeft', ({ uid }) => {
      setCallState(prev => ({
        ...prev,
        remoteUsers: prev.remoteUsers.filter(u => u !== uid)
      }));
      options.onUserLeft?.(uid.toString());
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

    agoraService.on('joined', () => {
      setCallState(prev => ({
        ...prev,
        isJoined: true,
        connectionState: 'CONNECTED'
      }));
    });

    agoraService.on('left', () => {
      setCallState(prev => ({
        ...prev,
        isJoined: false,
        connectionState: 'DISCONNECTED',
        remoteUsers: []
      }));
      options.onCallEnd?.();
    });
  }, [options]);

  const joinCall = useCallback(async (config: VideoCallConfig) => {
    try {
      setIsConnecting(true);
      setError(null);

      // Initialize Agora service if not already initialized
      await agoraService.initialize(config.appId);
      
      // Join the channel
      await agoraService.joinChannel(config);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join video call';
      setError(errorMessage);
      options.onError?.(errorMessage);
      console.error('[useVideoCall] Failed to join call:', err);
    } finally {
      setIsConnecting(false);
    }
  }, [options]);

  const leaveCall = useCallback(async () => {
    try {
      await agoraService.leaveChannel();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave video call';
      setError(errorMessage);
      console.error('[useVideoCall] Failed to leave call:', err);
    }
  }, []);

  const toggleVideo = useCallback(async () => {
    try {
      await agoraService.toggleVideo();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle video';
      setError(errorMessage);
      console.error('[useVideoCall] Failed to toggle video:', err);
    }
  }, []);

  const toggleAudio = useCallback(async () => {
    try {
      await agoraService.toggleAudio();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle audio';
      setError(errorMessage);
      console.error('[useVideoCall] Failed to toggle audio:', err);
    }
  }, []);

  const getLocalVideoTrack = useCallback(() => {
    return agoraService.getLocalVideoTrack();
  }, []);

  const getRemoteVideoTrack = useCallback((uid: string) => {
    return agoraService.getRemoteVideoTrack(uid);
  }, []);

  const cleanup = useCallback(async () => {
    await agoraService.cleanup();
  }, []);

  return {
    callState,
    isConnecting,
    error,
    joinCall,
    leaveCall,
    toggleVideo,
    toggleAudio,
    getLocalVideoTrack,
    getRemoteVideoTrack
  };
};
