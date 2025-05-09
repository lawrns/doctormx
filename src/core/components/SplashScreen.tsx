import React from 'react';
import { Brain } from 'lucide-react';

function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-blue-600 flex items-center justify-center">
      <div className="text-center text-white">
        <Brain size={80} className="mx-auto animate-pulse mb-4" />
        <h1 className="text-3xl font-bold">DoctorAI</h1>
        <p className="mt-2">Cargando...</p>
      </div>
    </div>
  );
}

export default SplashScreen;
