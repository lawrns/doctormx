import React, { useState, useEffect } from 'react';
import { Save, Key, Eye, EyeOff, MessageSquare, Image } from 'lucide-react';
import { motion } from 'framer-motion';

const OPENAI_KEY_STORAGE_KEY = 'openai_api_key';
const DOCTOR_INSTRUCTIONS_KEY = 'doctor_instructions';
const DOCTOR_IMAGE_ANALYSIS_ENABLED_KEY = 'doctor_image_analysis_enabled';

const DEFAULT_DOCTOR_INSTRUCTIONS = `AI Medical Assistant: Conversation Design & User Experience

Eres un asistente médico AI para doctor.mx, diseñado para proporcionar una experiencia de salud natural y conversacional. Tu propósito es recopilar información de salud, evaluar síntomas, proporcionar educación relevante, sugerir medicamentos de venta libre cuando corresponda, y referir a los usuarios a proveedores de salud locales cuando sea necesario. Equilibras profesionalismo con calidez, adaptando tu estilo de comunicación para crear una experiencia cómoda y eficiente.

Patrones de Diálogo Natural:
- Saludo Inicial: Comienza con un saludo cálido como "Hola" solo una vez por conversación.
- Memoria Contextual: Haz referencia a declaraciones previas del usuario en lugar de pedir información repetida.
- Divulgación Progresiva: Haz una pregunta a la vez en una secuencia diagnóstica lógica.
- Respuestas Adaptativas: Varía tu estilo de respuesta según la sensibilidad y complejidad del tema.
- Declaraciones de Transición: Usa transiciones naturales entre temas.

Gestión de Longitud de Respuesta:
- Respuestas Iniciales Breves: Mantén saludos y preguntas simples concisas (1-2 oraciones).
- Seguimientos Enfocados: Para aclaración de síntomas, usa preguntas breves y específicas.
- Explicaciones Ampliadas: Proporciona información más detallada solo al explicar conceptos de salud.
- Resúmenes de Conclusión: Ofrece resúmenes concisos de los puntos clave discutidos y próximos pasos.

Integración de UI Dinámica:
- Presenta botones de opción clicables para respuestas comunes cuando preguntes sobre categorías de síntomas, duración, severidad, etc.
- Diseña secuencias de preguntas basadas en selecciones del usuario, creando rutas diagnósticas lógicas.

Integración de Farmacia:
- Presenta sugerencias de medicamentos naturalmente dentro de la conversación.
- Incluye contexto importante sobre dosificación y consulta con farmacéutico.
- Aclara cuándo se prefiere consulta profesional sobre automedicación.

Sistema de Referencia Geolocalizado:
- Implementa un flujo natural para solicitar compartir ubicación.
- Proporciona explicación clara de por qué se necesita la ubicación y cómo se utilizará.
- Ofrece entrada manual de ubicación como alternativa.

Recuerda que el objetivo es crear una experiencia informativa y de apoyo mientras mantienes límites apropiados para un asistente de salud AI.`;

const APIKeyConfig: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [doctorInstructions, setDoctorInstructions] = useState(DEFAULT_DOCTOR_INSTRUCTIONS);
  const [imageAnalysisEnabled, setImageAnalysisEnabled] = useState(true);

  useEffect(() => {
    const savedKey = localStorage.getItem(OPENAI_KEY_STORAGE_KEY);
    if (savedKey) {
      setApiKey(savedKey);
    }
    
    const savedInstructions = localStorage.getItem(DOCTOR_INSTRUCTIONS_KEY);
    if (savedInstructions) {
      setDoctorInstructions(savedInstructions);
    }
    
    const imageAnalysisEnabled = localStorage.getItem(DOCTOR_IMAGE_ANALYSIS_ENABLED_KEY);
    if (imageAnalysisEnabled !== null) {
      setImageAnalysisEnabled(imageAnalysisEnabled === 'true');
    }
  }, []);

  const handleSaveKey = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(OPENAI_KEY_STORAGE_KEY, apiKey);
      localStorage.setItem(DOCTOR_INSTRUCTIONS_KEY, doctorInstructions);
      localStorage.setItem(DOCTOR_IMAGE_ANALYSIS_ENABLED_KEY, imageAnalysisEnabled.toString());
      
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
      
      {/* API Key Input */}
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
      
      {/* Doctor Instructions */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center mb-2">
          <MessageSquare size={18} className="mr-2 text-blue-600" />
          <label className="block text-sm font-medium text-gray-700">
            Instrucciones para el Doctor IA
          </label>
        </div>
        
        <textarea
          value={doctorInstructions}
          onChange={(e) => setDoctorInstructions(e.target.value)}
          placeholder="Define el carácter y comportamiento del Doctor IA..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-48 resize-none font-mono text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          Personaliza cómo el Doctor IA se comunica contigo. Define su carácter, tono, y qué puede o no puede decir.
        </p>
      </motion.div>
      
      {/* Image Analysis Toggle */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center mb-2">
          <Image size={18} className="mr-2 text-blue-600" />
          <label className="block text-sm font-medium text-gray-700">
            Análisis de Imágenes
          </label>
        </div>
        
        <div className="flex items-center">
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={imageAnalysisEnabled}
              onChange={(e) => setImageAnalysisEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ms-3 text-sm font-medium text-gray-700">
              {imageAnalysisEnabled ? 'Habilitado' : 'Deshabilitado'}
            </span>
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Cuando está habilitado, el Doctor IA utilizará GPT-4 para analizar imágenes médicas que subas.
        </p>
      </motion.div>
      
      {/* Save Button */}
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
      
      {/* Help Section */}
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
