import React from 'react';
import { Link } from 'react-router-dom';

const LabTestingLandingPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pruebas de Laboratorio</h1>
      <p className="text-gray-700 mb-4">
        Bienvenido al servicio de pruebas de laboratorio de DoctorMX.
      </p>
      <Link to="/lab-testing/app" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Continuar
      </Link>
    </div>
  );
};

export default LabTestingLandingPage;