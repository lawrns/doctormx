import React, { useState } from 'react';
import VideoCallComponent from '../components/video/VideoCallComponent';
import { VideoCallConfig } from '../services/video/AgoraService';

const VideoCallTest: React.FC = () => {
  const [isInCall, setIsInCall] = useState(false);
  const [channelName, setChannelName] = useState('test-channel-' + Date.now());
  const [userName, setUserName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<any>(null);

  const appId = import.meta.env.VITE_AGORA_APP_ID;

  const startCall = async () => {
    if (!userName.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }

    if (!appId) {
      setError('Agora App ID no configurado. Verifica tu archivo .env.local');
      return;
    }

    try {
      setError(null);

      // Generate token for the video call
      console.log('Generating token for channel:', channelName, 'user:', userName);

      const response = await fetch('/.netlify/functions/generate-agora-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelName: channelName,
          uid: userName,
          role: 'publisher'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate token');
      }

      const tokenResponse = await response.json();
      console.log('Token generated successfully:', tokenResponse);

      // Store token data and start call
      setTokenData(tokenResponse);
      setIsInCall(true);

    } catch (error) {
      console.error('Error starting call:', error);
      setError(error instanceof Error ? error.message : 'Failed to start video call');
    }
  };

  const endCall = () => {
    setIsInCall(false);
    setError(null);
    setTokenData(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setIsInCall(false);
  };

  const config: VideoCallConfig = {
    appId: appId || '',
    channel: channelName,
    token: tokenData?.token || null,
    uid: userName || 'test-user'
  };

  if (isInCall) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Prueba de Video Consulta - DoctorMX
            </h1>
            <p className="text-gray-600">
              Canal: {channelName} | Usuario: {userName}
            </p>
          </div>
          
          <VideoCallComponent
            config={config}
            onCallEnd={endCall}
            onError={handleError}
          />
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Prueba de Video Consulta
        </h1>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
              Tu Nombre
            </label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingresa tu nombre"
            />
          </div>
          
          <div>
            <label htmlFor="channelName" className="block text-sm font-medium text-gray-700 mb-2">
              Canal de Prueba
            </label>
            <input
              type="text"
              id="channelName"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre del canal"
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
          
          <button
            onClick={startCall}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Iniciar Video Llamada de Prueba
          </button>
          
          <div className="text-xs text-gray-500 text-center">
            <p>Esta es una prueba del sistema de video consultas.</p>
            <p>App ID: {appId ? '✅ Configurado' : '❌ No configurado'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallTest;
