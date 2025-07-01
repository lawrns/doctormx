import React, { useState } from 'react';
import VideoCallComponent from '../components/video/VideoCallComponent';
import { VideoCallConfig } from '../services/video/AgoraService';
import { generateToken } from '../utils/agoraTokenGenerator';

const VideoCallTestSimple: React.FC = () => {
  const [isInCall, setIsInCall] = useState(false);
  const [channelName, setChannelName] = useState('test-channel-' + Date.now());
  const [userName, setUserName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  const appId = import.meta.env.VITE_AGORA_APP_ID;
  const appCertificate = import.meta.env.VITE_AGORA_APP_CERTIFICATE;

  const startCall = async () => {
    if (!userName.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }

    if (!appId) {
      setError('Agora App ID no configurado. Verifica tu archivo .env.local');
      return;
    }

    if (!appCertificate) {
      setError('Agora App Certificate no configurado. Asegúrate de que VITE_AGORA_APP_CERTIFICATE esté en tu archivo .env.local');
      console.error('[VideoTest] Missing environment variables:', {
        appId: appId ? 'Present' : 'Missing',
        appCertificate: appCertificate ? 'Present' : 'Missing',
        allEnvVars: import.meta.env
      });
      return;
    }

    try {
      setIsGeneratingToken(true);
      setError(null);

      console.log('[VideoTest] Starting token generation...');
      console.log('[VideoTest] App ID:', appId);
      console.log('[VideoTest] Channel:', channelName);
      console.log('[VideoTest] User:', userName);

      // Generate token with proper configuration
      const token = await generateToken({
        appId,
        appCertificate,
        channelName,
        uid: userName,
        role: 'publisher',
        expirationTimeInSeconds: 3600
      });

      console.log('[VideoTest] Token generated successfully');
      setGeneratedToken(token);
      setIsInCall(true);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate token';
      console.error('[VideoTest] Token generation failed:', err);
      setError(`Token generation failed: ${errorMessage}`);
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const endCall = () => {
    setIsInCall(false);
    setError(null);
    setGeneratedToken(null);
  };

  const handleError = (errorMessage: string) => {
    console.error('Video call error:', errorMessage);
    setError(errorMessage);
    setIsInCall(false);
  };

  // Config with generated token
  const config: VideoCallConfig = {
    appId: appId || '',
    channel: channelName,
    token: generatedToken,
    uid: userName || 'test-user'
  };

  if (isInCall) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Video Consulta con Token - DoctorMX
            </h1>
            <p className="text-gray-600">
              Canal: {channelName} | Usuario: {userName}
            </p>
            <p className="text-sm text-green-600">
              ✅ Usando autenticación con token certificado
            </p>
          </div>
          
          <VideoCallComponent
            config={config}
            onCallEnd={endCall}
            onError={handleError}
            autoStart={true}
          />
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>Error:</strong> {error}
              <details className="mt-2">
                <summary className="cursor-pointer">Detalles técnicos</summary>
                <pre className="mt-2 text-xs bg-red-50 p-2 rounded">
                  App ID: {appId ? 'Configurado' : 'No configurado'}
                  {'\n'}Certificate: {appCertificate ? 'Configurado' : 'No configurado'}
                  {'\n'}Canal: {channelName}
                  {'\n'}Usuario: {userName}
                  {'\n'}Token: {generatedToken ? 'Generado' : 'No generado'}
                </pre>
              </details>
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
          Video Consulta con Token
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
            disabled={isGeneratingToken}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isGeneratingToken ? 'Generando Token...' : 'Iniciar Video Llamada con Token'}
          </button>
          
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>🔐 Prueba con autenticación de token</p>
            <p>App ID: {appId ? '✅ Configurado' : '❌ No configurado'}</p>
            <p>Certificate: {appCertificate ? '✅ Configurado' : '❌ No configurado'}</p>
            <p>✅ Compatible con proyectos que requieren autenticación</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallTestSimple;
