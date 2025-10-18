import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from '../lib/toast';

export default function AIPersonalitySelector({ onPersonalitySelect, selectedPersonality }) {
  const [loading, setLoading] = useState(false);

  const personalities = [
    {
      id: 'dr_maria',
      name: 'Dra. María',
      specialty: 'Medicina General y Salud Mental',
      personality: 'Empática, cálida, comprensiva',
      icon: '👩‍⚕️',
      color: 'from-pink-500 to-rose-500',
      description: 'Perfecta para consultas generales, salud mental y bienestar emocional. Te hará sentir cómodo y escuchado.',
      features: ['Consultas generales', 'Salud mental', 'Bienestar emocional', 'Tips de salud']
    },
    {
      id: 'dr_carlos',
      name: 'Dr. Carlos',
      specialty: 'Medicina Interna y Emergencias',
      personality: 'Profesional, directo, basado en evidencia',
      icon: '👨‍⚕️',
      color: 'from-blue-500 to-cyan-500',
      description: 'Ideal para consultas médicas serias, emergencias y casos que requieren análisis detallado.',
      features: ['Medicina interna', 'Emergencias', 'Análisis detallado', 'Casos médicos']
    }
  ];

  const handlePersonalitySelect = async (personality) => {
    setLoading(true);
    try {
      // Simulate API call to get personality greeting
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (onPersonalitySelect) {
        onPersonalitySelect(personality);
      }
      
      toast.success(`Conectado con ${personality.name}`);
    } catch (error) {
      toast.error('Error al conectar con el doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Elige tu Doctor IA
        </h2>
        <p className="text-gray-600 text-lg">
          Cada doctor tiene su propia personalidad y especialidad. ¿Con cuál te sientes más cómodo?
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {personalities.map((personality) => (
          <motion.div
            key={personality.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 cursor-pointer ${
              selectedPersonality?.id === personality.id
                ? 'border-medical-500 shadow-medical-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handlePersonalitySelect(personality)}
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${personality.color} rounded-t-2xl p-6 text-white`}>
              <div className="flex items-center gap-4">
                <div className="text-4xl">{personality.icon}</div>
                <div>
                  <h3 className="text-2xl font-bold">{personality.name}</h3>
                  <p className="text-white/90">{personality.specialty}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Personalidad:</h4>
                <p className="text-gray-600 text-sm">{personality.personality}</p>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Descripción:</h4>
                <p className="text-gray-600 text-sm">{personality.description}</p>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Especialidades:</h4>
                <div className="flex flex-wrap gap-2">
                  {personality.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Select Button */}
              <button
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  selectedPersonality?.id === personality.id
                    ? 'bg-medical-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Conectando...
                  </div>
                ) : selectedPersonality?.id === personality.id ? (
                  'Seleccionado'
                ) : (
                  'Seleccionar'
                )}
              </button>
            </div>

            {/* Selection Indicator */}
            {selectedPersonality?.id === personality.id && (
              <div className="absolute top-4 right-4">
                <div className="w-8 h-8 bg-medical-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-8 bg-gradient-to-r from-medical-50 to-blue-50 rounded-2xl p-6 border border-medical-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          ¿Cómo funcionan las personalidades?
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-medical-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-medical-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Conversación Natural</h4>
            <p className="text-sm text-gray-600">Cada doctor tiene su propio estilo de comunicación y personalidad única.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Especialización</h4>
            <p className="text-sm text-gray-600">Cada doctor se especializa en diferentes áreas médicas y tipos de consultas.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Entretenimiento</h4>
            <p className="text-sm text-gray-600">Recibe tips de salud, trivia médica y contenido educativo entretenido.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
