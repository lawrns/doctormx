import React from 'react';
import { HealthProvider, HealthDashboard } from '../features/health';

const HealthPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mi Salud</h1>
        <p className="text-gray-600">Visualiza y administra tus datos de salud de Apple Watch y iPhone</p>
      </div>
      
      <HealthProvider>
        <HealthDashboard />
      </HealthProvider>
    </div>
  );
};

export default HealthPage;
