import React from 'react';

const APIKeyConfigPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Configuración de API Keys</h1>
      <p className="text-gray-700 mb-4">
        Gestiona tus claves de API para servicios externos.
      </p>
      <div className="bg-gray-100 p-4 rounded">
        <p>Esta función es solo para administradores.</p>
      </div>
    </div>
  );
};

export default APIKeyConfigPage;