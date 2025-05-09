import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Settings } from 'lucide-react';
import APIKeyConfig from '../../components/settings/APIKeyConfig';
import { motion } from 'framer-motion';

const APIKeyConfigPage: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Link 
          to="/"
          className="flex items-center text-blue-600 mb-6 hover:text-blue-800 transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Volver al inicio</span>
        </Link>
      </motion.div>
      
      <motion.div 
        className="flex items-center mb-6"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Settings size={24} className="text-blue-600 mr-3" />
        <h1 className="text-2xl font-bold">Configuración</h1>
      </motion.div>
      
      <motion.div 
        className="mb-8"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold mb-2">API Keys</h2>
        <p className="text-gray-600">
          Configura tus claves de API para habilitar todas las funcionalidades de Doctor.mx
        </p>
      </motion.div>
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <APIKeyConfig />
      </motion.div>
      
      <motion.div 
        className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg font-medium text-blue-800 mb-2">¿Por qué necesitamos tu API key?</h3>
        <p className="text-blue-700 mb-3">
          Doctor.mx utiliza la API de OpenAI para proporcionar análisis médicos avanzados. 
          Tu clave de API se almacena localmente en tu navegador y nunca se comparte con nuestros servidores.
        </p>
        <p className="text-blue-700">
          Al usar tu propia clave de API, tienes control total sobre el uso y los costos asociados con las consultas de IA.
          Esto nos permite ofrecerte un servicio más personalizado y preciso para tus necesidades médicas.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default APIKeyConfigPage;
