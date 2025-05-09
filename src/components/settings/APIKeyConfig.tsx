import React, { useState, useEffect } from 'react';
import { Save, Key, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const OPENAI_KEY_STORAGE_KEY = 'openai_api_key';

const APIKeyConfig: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem(OPENAI_KEY_STORAGE_KEY);
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveKey = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(OPENAI_KEY_STORAGE_KEY, apiKey);
      setIsSaving(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6 max-w-xl mx-auto"
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Key size={18} className="mr-2 text-blue-600" />
        Configuración de API
      </h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          OpenAI API Key
        </label>
        <div className="relative">
          <input
            type={isKeyVisible ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => setIsKeyVisible(!isKeyVisible)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label={isKeyVisible ? "Ocultar API key" : "Mostrar API key"}
          >
            {isKeyVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Tu API key será guardada localmente en tu navegador.
        </p>
      </div>
      
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSaveKey}
          disabled={isSaving || !apiKey}
          className={`flex items-center px-4 py-2 rounded-md ${
            isSuccess 
              ? 'bg-green-600 text-white' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } ${(!apiKey || isSaving) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Guardando...
            </>
          ) : isSuccess ? (
            'Guardado correctamente'
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Guardar
            </>
          )}
        </motion.button>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">¿Cómo obtener una API key de OpenAI?</h3>
        <ol className="text-xs text-blue-700 list-decimal pl-4 space-y-1">
          <li>Visita <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com/account/api-keys</a></li>
          <li>Inicia sesión o crea una cuenta en OpenAI</li>
          <li>Haz clic en "Create new secret key"</li>
          <li>Copia la key generada y pégala aquí</li>
        </ol>
      </div>
    </motion.div>
  );
};

export default APIKeyConfig;
