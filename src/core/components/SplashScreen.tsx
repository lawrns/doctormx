import React from 'react';
import { Brain } from 'lucide-react';

function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center">
      <div className="text-center text-white">
        <Brain size={80} className="mx-auto animate-pulse mb-4 text-white" />
        <h1 className="text-3xl font-bold">DoctorMX</h1>
        <p className="mt-2 text-teal-100">Preparando tu consulta médica...</p>
      </div>
    </div>
  );
}

export default SplashScreen;
