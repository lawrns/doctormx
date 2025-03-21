import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HealthProvider, AppleHealthConnect } from '../features/health';

const ConnectHealthPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleConnectionComplete = () => {
    navigate('/health');
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Conectar Apple Health</h1>
        <p className="text-gray-600">Sincroniza tus datos de salud con Doctor.mx</p>
      </div>
      
      <HealthProvider>
        <AppleHealthConnect onComplete={handleConnectionComplete} />
      </HealthProvider>
    </div>
  );
};

export default ConnectHealthPage;
