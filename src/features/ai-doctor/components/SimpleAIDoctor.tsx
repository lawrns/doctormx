import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { anonymousConsultationTracker } from '../../../services/AnonymousConsultationTracker';

export default function SimpleAIDoctor() {
  const { isAuthenticated } = useAuth();
  const consultationLimit = anonymousConsultationTracker.getUsageData();

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Consultation limit indicator */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-[#D0F0EF] to-[#E6F7F5] px-6 py-2 border-b border-[#B8E6E2]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-[#006D77]">
                Consultas gratuitas: {consultationLimit.remaining} de {consultationLimit.total}
              </span>
            </div>
            <Link 
              to="/register" 
              className="text-sm font-medium text-[#006D77] hover:text-[#005B66] transition-colors"
            >
              Crear cuenta para más consultas →
            </Link>
          </div>
        </div>
      )}
      
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Doctor IA - Versión Simple</h1>
        <p className="text-gray-600 mb-4">
          Esta es una versión temporal mientras solucionamos algunos problemas técnicos.
        </p>
        
        <div className="bg-[#D0F0EF] rounded-lg p-4">
          <p className="text-[#006D77]">
            El chat del Doctor IA estará disponible pronto. Por ahora, puedes:
          </p>
          <ul className="mt-2 space-y-2 text-[#006D77]">
            <li>• Ver tu límite de consultas gratuitas arriba</li>
            <li>• Crear una cuenta para obtener 5 consultas adicionales</li>
            <li>• Explorar otras secciones de la aplicación</li>
          </ul>
        </div>
      </div>
    </div>
  );
}