import React, { useState, useEffect } from 'react';
import { useHealth } from './HealthContext';
import { HealthConnectionStatus, HealthMetricType } from './types';
import QRCode from 'qrcode.react'; // You would need to install this package

interface AppleHealthConnectProps {
  onComplete?: () => void;
}

const AppleHealthConnect: React.FC<AppleHealthConnectProps> = ({ onComplete }) => {
  const { 
    connectionStatus, 
    isLoading, 
    errorMessage,
    connectToAppleHealth 
  } = useHealth();
  
  const [connectionStep, setConnectionStep] = useState<'intro' | 'qrcode' | 'waiting' | 'complete'>('intro');
  const [connectionToken, setConnectionToken] = useState<string | null>(null);
  const [deepLinkUrl, setDeepLinkUrl] = useState<string | null>(null);
  
  // Watch for connection status changes
  useEffect(() => {
    if (connectionStatus === HealthConnectionStatus.CONNECTED && connectionStep === 'waiting') {
      setConnectionStep('complete');
      if (onComplete) {
        setTimeout(onComplete, 1500);
      }
    }
  }, [connectionStatus, connectionStep, onComplete]);
  
  // Start the connection process
  const startConnection = async () => {
    setConnectionStep('qrcode');
    
    try {
      // In a real implementation, this would make an API call to generate a connection token
      // For this example, we'll simulate it
      const result = await connectToAppleHealth();
      
      if (result && result.token) {
        setConnectionToken(result.token);
        setDeepLinkUrl(`doctormx://connect/applehealth?token=${result.token}`);
      }
      
      // Move to waiting step after a delay (simulating QR code scan)
      setTimeout(() => {
        setConnectionStep('waiting');
      }, 5000);
    } catch (error) {
      console.error('Failed to start connection:', error);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm max-w-md mx-auto p-6">
      {connectionStep === 'intro' && (
        <div className="text-center">
          <img 
            src="/images/apple-health-logo.svg" 
            alt="Apple Health" 
            className="w-20 h-20 mx-auto mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Conecta con Apple Health
          </h2>
          <p className="text-gray-600 mb-6">
            Sincroniza tus datos de salud de Apple Watch y iPhone para un mejor seguimiento y recomendaciones personalizadas.
          </p>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-blue-800 mb-2">Datos que sincronizaremos:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Ritmo cardíaco
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Pasos y actividad
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Sueño
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Oxígeno en sangre
              </li>
            </ul>
          </div>
          
          <p className="text-sm text-gray-500 mb-6">
            Necesitarás tener instalada la app de Doctor.mx en tu iPhone para completar este proceso.
          </p>
          
          <button
            onClick={startConnection}
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            Comenzar
          </button>
        </div>
      )}
      
      {connectionStep === 'qrcode' && (
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Escanea este código QR
          </h2>
          <p className="text-gray-600 mb-6">
            Abre la cámara en tu iPhone y escanea este código QR para conectar con Apple Health.
          </p>
          
          <div className="bg-white p-4 rounded-lg shadow-sm mx-auto mb-6" style={{ width: 'fit-content' }}>
            {/* In a real implementation, you would use the QRCode component with the connectionToken */}
            <div className="w-64 h-64 bg-gray-200 flex items-center justify-center mx-auto">
              {connectionToken ? (
                <div className="text-center">
                  {/* 
                    This is a placeholder - in a real implementation you would use:
                    <QRCode value={deepLinkUrl} size={256} />
                  */}
                  <p className="text-sm text-gray-500">QR Code placeholder</p>
                  <p className="text-xs mt-2 text-gray-400 break-all">{deepLinkUrl}</p>
                </div>
              ) : (
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setConnectionStep('waiting')}
              className="text-blue-600 text-sm font-medium"
            >
              Ya escaneé el código
            </button>
            
            <button
              onClick={() => setConnectionStep('intro')}
              className="text-gray-500 text-sm"
            >
              Volver
            </button>
          </div>
        </div>
      )}
      
      {connectionStep === 'waiting' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Conectando con Apple Health
          </h2>
          <p className="text-gray-600 mb-1">
            Por favor sigue las instrucciones en tu iPhone para autorizar el acceso a los datos de salud.
          </p>
          <p className="text-sm text-gray-500">
            Este proceso puede tardar unos momentos...
          </p>
          
          {errorMessage && (
            <div className="mt-4 text-red-600 text-sm">
              {errorMessage}
            </div>
          )}
        </div>
      )}
      
      {connectionStep === 'complete' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            ¡Conexión exitosa!
          </h2>
          <p className="text-gray-600">
            Tu cuenta ha sido conectada con Apple Health. Ahora podrás ver tus datos de salud en el panel.
          </p>
        </div>
      )}
    </div>
  );
};

export default AppleHealthConnect;
