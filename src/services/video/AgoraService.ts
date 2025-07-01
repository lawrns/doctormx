import AgoraRTC, {
    IAgoraRTCClient,
    ICameraVideoTrack,
    IMicrophoneAudioTrack,
    IRemoteAudioTrack,
    IRemoteVideoTrack,
    UID
} from 'agora-rtc-sdk-ng';

export interface VideoCallConfig {
  appId: string;
  channel: string;
  token: string | null;
  uid: UID;
}

export interface VideoCallState {
  isJoined: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  remoteUsers: UID[];
  connectionState: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTING';
}

export class AgoraService {
  private client: IAgoraRTCClient | null = null;
  private localVideoTrack: ICameraVideoTrack | null = null;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private remoteVideoTracks: Map<UID, IRemoteVideoTrack> = new Map();
  private remoteAudioTracks: Map<UID, IRemoteAudioTrack> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();
  private isInitializing: boolean = false;
  private isJoining: boolean = false;
  private isJoined: boolean = false;

  constructor() {
    // Configure Agora for medical consultation quality
    AgoraRTC.setLogLevel(4); // Only show errors in production
  }

  /**
   * Initialize the Agora client
   */
  async initialize(appId: string): Promise<void> {
    // Prevent multiple simultaneous initializations
    if (this.isInitializing) {
      console.log('[AgoraService] Already initializing, waiting...');
      return;
    }

    // If client already exists and is working, don't reinitialize
    if (this.client && !this.isJoined) {
      console.log('[AgoraService] Client already initialized and ready');
      return;
    }

    try {
      this.isInitializing = true;

      // Check if client already exists and clean up
      if (this.client) {
        console.log('[AgoraService] Cleaning up existing client...');
        await this.leaveChannel();
        this.client = null;
      }

      this.client = AgoraRTC.createClient({
        mode: 'rtc',
        codec: 'vp8' // Better compatibility for medical consultations
      });

      // Set up event listeners
      this.setupEventListeners();

      console.log('[AgoraService] Client initialized successfully');
    } catch (error) {
      console.error('[AgoraService] Failed to initialize client:', error);
      throw new Error('Failed to initialize video service');
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Join a video consultation channel
   */
  async joinChannel(config: VideoCallConfig): Promise<void> {
    // Prevent multiple simultaneous join attempts
    if (this.isJoining) {
      console.log('[AgoraService] Already joining channel, skipping...');
      return;
    }

    // Check if already joined
    if (this.isJoined) {
      console.log('[AgoraService] Already joined to a channel, leaving first...');
      await this.leaveChannel();
    }

    if (!this.client) {
      throw new Error('Agora client not initialized');
    }

    try {
      this.isJoining = true;

      // Convert empty token to null for development mode
      const token = config.token && config.token.trim() !== '' ? config.token : null;

      console.log('[AgoraService] Joining channel with params:', {
        appId: config.appId,
        channel: config.channel,
        token: token ? 'Present' : 'null (development mode)',
        uid: config.uid
      });

      // Join the channel ONLY - don't create tracks yet
      await this.client.join(config.appId, config.channel, token, config.uid);
      this.isJoined = true;
      console.log('[AgoraService] Successfully joined channel:', config.channel);

      // Create and publish local tracks separately with error handling
      try {
        await this.createLocalTracks();
        await this.publishLocalTracks();
        console.log('[AgoraService] Local tracks created and published');
      } catch (mediaError) {
        console.warn('[AgoraService] Failed to create/publish tracks, continuing without media:', mediaError);
        // Continue without local tracks - user can enable them later
      }

      this.emit('joined', { channel: config.channel, uid: config.uid });
    } catch (error) {
      console.error('[AgoraService] Failed to join channel:', error);
      this.isJoined = false;

      // Clean up on error
      try {
        if (this.client) {
          await this.client.leave();
        }
      } catch (cleanupError) {
        console.warn('[AgoraService] Error during cleanup:', cleanupError);
      }

      throw new Error(`Failed to join video consultation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this.isJoining = false;
    }
  }

  /**
   * Enable media tracks after joining (for cases where initial creation failed)
   */
  async enableMedia(): Promise<void> {
    if (!this.client) {
      throw new Error('Not connected to channel');
    }

    try {
      console.log('[AgoraService] Attempting to enable media tracks...');

      // Only create tracks if they don't exist
      if (!this.localVideoTrack || !this.localAudioTrack) {
        await this.createLocalTracks();
      }

      // Publish the tracks
      await this.publishLocalTracks();

      console.log('[AgoraService] Media tracks enabled successfully');
    } catch (error) {
      console.error('[AgoraService] Failed to enable media:', error);
      throw new Error('Failed to enable camera/microphone');
    }
  }

  /**
   * Leave the video consultation channel
   */
  async leaveChannel(): Promise<void> {
    if (!this.client) return;

    try {
      // Unpublish and close local tracks
      await this.unpublishLocalTracks();
      await this.closeLocalTracks();

      // Leave the channel
      await this.client.leave();
      this.isJoined = false;

      // Clear remote tracks
      this.remoteVideoTracks.clear();
      this.remoteAudioTracks.clear();

      this.emit('left');
      console.log('[AgoraService] Successfully left channel');
    } catch (error) {
      console.error('[AgoraService] Error leaving channel:', error);
    }
  }

  /**
   * Toggle video on/off
   */
  async toggleVideo(): Promise<boolean> {
    if (!this.localVideoTrack) return false;

    try {
      const isEnabled = this.localVideoTrack.enabled;
      await this.localVideoTrack.setEnabled(!isEnabled);
      
      this.emit('videoToggled', { enabled: !isEnabled });
      return !isEnabled;
    } catch (error) {
      console.error('[AgoraService] Error toggling video:', error);
      return false;
    }
  }

  /**
   * Toggle audio on/off
   */
  async toggleAudio(): Promise<boolean> {
    if (!this.localAudioTrack) return false;

    try {
      const isEnabled = this.localAudioTrack.enabled;
      await this.localAudioTrack.setEnabled(!isEnabled);
      
      this.emit('audioToggled', { enabled: !isEnabled });
      return !isEnabled;
    } catch (error) {
      console.error('[AgoraService] Error toggling audio:', error);
      return false;
    }
  }

  /**
   * Get local video track for rendering
   */
  getLocalVideoTrack(): ICameraVideoTrack | null {
    return this.localVideoTrack;
  }

  /**
   * Get remote video track for a specific user
   */
  getRemoteVideoTrack(uid: UID): IRemoteVideoTrack | null {
    return this.remoteVideoTracks.get(uid) || null;
  }

  /**
   * Get all remote users
   */
  getRemoteUsers(): UID[] {
    return Array.from(this.remoteVideoTracks.keys());
  }

  /**
   * Event listener management
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  /**
   * Check media permissions before creating tracks
   */
  private async checkMediaPermissions(): Promise<{ video: boolean; audio: boolean }> {
    try {
      const permissions = { video: false, audio: false };

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('[AgoraService] getUserMedia not supported');
        return permissions;
      }

      // Try to get minimal media access to check permissions
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
          audio: true
        });

        permissions.video = stream.getVideoTracks().length > 0;
        permissions.audio = stream.getAudioTracks().length > 0;

        // Stop the test stream
        stream.getTracks().forEach(track => track.stop());

        console.log('[AgoraService] Media permissions:', permissions);
        return permissions;
      } catch (permError) {
        console.warn('[AgoraService] Media permission check failed:', permError);
        return permissions;
      }
    } catch (error) {
      console.error('[AgoraService] Error checking media permissions:', error);
      return { video: false, audio: false };
    }
  }

  /**
   * Create local video and audio tracks with fallback settings
   */
  private async createLocalTracks(): Promise<void> {
    try {
      console.log('[AgoraService] Creating local tracks...');

      // Check permissions first
      const permissions = await this.checkMediaPermissions();

      if (permissions.video) {
        // Create video track with conservative settings for better compatibility
        this.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: {
            width: 640,
            height: 480,
            frameRate: 15,
            bitrateMin: 500,
            bitrateMax: 1500,
          }
        });
        console.log('[AgoraService] Video track created');
      } else {
        console.warn('[AgoraService] Video permission denied, skipping video track');
      }

      if (permissions.audio) {
        // Create audio track with basic settings for better compatibility
        this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: {
            sampleRate: 44100,
            stereo: false,
            bitrate: 64,
          },
          AEC: true, // Acoustic Echo Cancellation
          AGC: true, // Automatic Gain Control
          ANS: true, // Automatic Noise Suppression
        });
        console.log('[AgoraService] Audio track created');
      } else {
        console.warn('[AgoraService] Audio permission denied, skipping audio track');
      }

      console.log('[AgoraService] Local tracks creation completed');
    } catch (error) {
      console.error('[AgoraService] Failed to create local tracks:', error);
      throw new Error('Failed to access camera/microphone');
    }
  }

  /**
   * Publish local tracks to the channel
   */
  private async publishLocalTracks(): Promise<void> {
    if (!this.client) return;

    try {
      const tracksToPublish = [];

      if (this.localVideoTrack) {
        tracksToPublish.push(this.localVideoTrack);
      }

      if (this.localAudioTrack) {
        tracksToPublish.push(this.localAudioTrack);
      }

      if (tracksToPublish.length > 0) {
        await this.client.publish(tracksToPublish);
        console.log(`[AgoraService] Published ${tracksToPublish.length} local tracks successfully`);
      } else {
        console.log('[AgoraService] No local tracks to publish');
      }
    } catch (error) {
      console.error('[AgoraService] Failed to publish local tracks:', error);
      throw error;
    }
  }

  /**
   * Unpublish local tracks
   */
  private async unpublishLocalTracks(): Promise<void> {
    if (!this.client) return;

    try {
      const tracksToUnpublish = [];

      if (this.localVideoTrack) {
        tracksToUnpublish.push(this.localVideoTrack);
      }

      if (this.localAudioTrack) {
        tracksToUnpublish.push(this.localAudioTrack);
      }

      if (tracksToUnpublish.length > 0) {
        await this.client.unpublish(tracksToUnpublish);
        console.log(`[AgoraService] Unpublished ${tracksToUnpublish.length} local tracks successfully`);
      }
    } catch (error) {
      console.error('[AgoraService] Error unpublishing local tracks:', error);
    }
  }

  /**
   * Close local tracks
   */
  private async closeLocalTracks(): Promise<void> {
    if (this.localVideoTrack) {
      this.localVideoTrack.close();
      this.localVideoTrack = null;
    }
    if (this.localAudioTrack) {
      this.localAudioTrack.close();
      this.localAudioTrack = null;
    }
  }

  /**
   * Set up Agora client event listeners
   */
  private setupEventListeners(): void {
    if (!this.client) return;

    // Handle remote user joining
    this.client.on('user-published', async (user, mediaType) => {
      await this.client!.subscribe(user, mediaType);
      
      if (mediaType === 'video') {
        this.remoteVideoTracks.set(user.uid, user.videoTrack!);
        this.emit('remoteUserJoined', { uid: user.uid, mediaType });
      }
      
      if (mediaType === 'audio') {
        this.remoteAudioTracks.set(user.uid, user.audioTrack!);
        user.audioTrack!.play();
      }
    });

    // Handle remote user leaving
    this.client.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'video') {
        this.remoteVideoTracks.delete(user.uid);
      }
      if (mediaType === 'audio') {
        this.remoteAudioTracks.delete(user.uid);
      }
      this.emit('remoteUserLeft', { uid: user.uid, mediaType });
    });

    // Handle connection state changes
    this.client.on('connection-state-change', (curState, revState) => {
      console.log('[AgoraService] Connection state changed:', curState);
      this.emit('connectionStateChanged', { current: curState, previous: revState });
    });

    // Handle network quality
    this.client.on('network-quality', (stats) => {
      this.emit('networkQuality', stats);
    });
  }

  /**
   * Reset initialization state (for error recovery)
   */
  resetState(): void {
    this.isInitializing = false;
    this.isJoining = false;
    this.isJoined = false;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.leaveChannel();
    this.eventListeners.clear();
    this.client = null;
    this.resetState();
  }
}

// Export singleton instance
export const agoraService = new AgoraService();
