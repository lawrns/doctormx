import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, Calendar } from 'lucide-react';

interface DoctorActionButtonsSimpleProps {
  doctorId: string;
  supportsTelehealth?: boolean;
  className?: string;
}

const DoctorActionButtonsSimple: React.FC<DoctorActionButtonsSimpleProps> = ({
  doctorId,
  supportsTelehealth = true,
  className = ''
}) => {
  // Simple implementation without modals or complex state
  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      {supportsTelehealth && (
        <Link
          to={`/telemedicina/consulta/quick-${doctorId}?doctorId=${doctorId}`}
          className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Video size={18} className="mr-2" />
          Iniciar consulta ahora
        </Link>
      )}
      
      <Link
        to={`/reservar/${doctorId}?followUp=true`}
        className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Calendar size={18} className="mr-2" />
        Agendar seguimiento
      </Link>
    </div>
  );
};

export default DoctorActionButtonsSimple;