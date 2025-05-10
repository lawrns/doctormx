import React from 'react';
import { Heart, Award, Check } from 'lucide-react';

const DoctorConnectPromo: React.FC = () => {
  return (
    <div className="bg-white border border-blue-200 rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center">
            <Heart className="mr-2 text-red-200" size={20} />
            Doctor Connect Program
          </h3>
          <p className="text-blue-100 mt-1">Conectando médicos con pacientes que necesitan ayuda</p>
        </div>
        <img 
          src="/images/mascot.png" 
          alt="Doctor MX Mascot" 
          className="h-20 w-auto"
        />
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <p className="text-blue-800 mb-2">
            Únase a nuestro programa exclusivo para profesionales médicos y sea recomendado por nuestra IA 
            cuando los pacientes necesiten atención médica en persona.
          </p>
          <p className="text-blue-600 font-medium">
            Aumente su visibilidad y ayude a más pacientes a encontrar la atención que necesitan.
          </p>
        </div>
        
        <div className="bg-blue-50 p-3 rounded-md mb-4">
          <h4 className="text-lg font-semibold text-blue-800 flex items-center mb-2">
            <Award className="mr-2 text-blue-500" size={18} />
            Beneficios del programa
          </h4>
          <ul className="space-y-2">
            {[
              'Recomendación prioritaria por nuestra IA',
              'Insignia de "Doctor Connect" en su perfil',
              'Estadísticas detalladas de referencias',
              'Soporte prioritario 24/7',
              'Acceso a eventos exclusivos'
            ].map((benefit, index) => (
              <li key={index} className="flex items-start">
                <Check className="mr-2 text-green-500 flex-shrink-0 mt-1" size={16} />
                <span className="text-blue-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex flex-col items-center border-t border-blue-100 pt-4">
          <div className="text-center mb-3">
            <span className="text-2xl font-bold text-blue-700">500 MXN</span>
            <span className="text-blue-600 ml-1">/mes</span>
          </div>
          <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors shadow-sm">
            Unirse al programa
          </button>
          <p className="text-xs text-blue-500 mt-2 text-center">
            Cancele en cualquier momento. Aplican términos y condiciones.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorConnectPromo;
// Updated on Sat May 10 11:04:34 CST 2025
