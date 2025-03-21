import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UpgradeStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const roleNeeded = searchParams.get('role') || 'doctor';
  const { user } = useAuth();

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8 animate-fade-in">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle size={32} className="text-yellow-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
            Acceso no disponible
          </h1>
          
          <div className="mb-8 text-center">
            <p className="text-gray-600 mb-4">
              Para acceder a esta sección, necesitas tener una cuenta de {roleNeeded === 'doctor' ? 'médico' : 'paciente'}.
            </p>
            <p className="text-gray-600">
              Tu cuenta actual está registrada como {roleNeeded === 'doctor' ? 'paciente' : 'médico'}.
            </p>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-blue-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  {roleNeeded === 'doctor' 
                    ? 'Para registrarte como médico, necesitas completar nuestro proceso de registro para profesionales de la salud.'
                    : 'Para registrarte como paciente, necesitas crear una cuenta de paciente.'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            {roleNeeded === 'doctor' && (
              <Link 
                to="/medicos/registro"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Registrarme como médico
              </Link>
            )}
            
            <Link 
              to="/"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeStatusPage;