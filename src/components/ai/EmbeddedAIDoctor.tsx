import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import AIDoctor from './AIDoctor';

interface EmbeddedAIDoctorProps {
  className?: string;
}

/**
 * EmbeddedAIDoctor is a compact version of the AIDoctor component
 * designed to be embedded in the HomePage or other pages.
 * It provides a preview of the AI doctor functionality with an option
 * to expand to the full experience.
 */
const EmbeddedAIDoctor: React.FC<EmbeddedAIDoctorProps> = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullAIDoctor, setShowFullAIDoctor] = useState(false);
  
  if (showFullAIDoctor) {
    return <AIDoctor onClose={() => setShowFullAIDoctor(false)} />;
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 text-white"
        whileHover={{ backgroundPosition: '100% 0%' }}
        transition={{ duration: 1.5 }}
        style={{ backgroundSize: '200% 100%' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Stethoscope className="mr-2" size={24} />
            <h3 className="text-xl font-bold">Doctor IA</h3>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              to="/ai-doctor"
              className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              Abrir
            </Link>
          </motion.div>
        </div>
        <p className="mt-2 text-blue-100">
          Consulta médica inteligente con análisis de síntomas y recomendaciones personalizadas
        </p>
      </motion.div>
      
      {/* Content */}
      <div className="p-5">
        {isExpanded ? (
          <div className="h-96">
            <AIDoctor isEmbedded={true} />
          </div>
        ) : (
          <div>
            <div className="space-y-4">
              {[
                { 
                  icon: <Stethoscope className="text-blue-600" size={20} />, 
                  title: "Análisis de Síntomas", 
                  description: "Describe tus síntomas y recibe un análisis médico instantáneo con posibles condiciones y recomendaciones." 
                },
                { 
                  icon: <svg className="text-blue-600 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>, 
                  title: "Análisis de Imágenes", 
                  description: "Sube imágenes de condiciones visibles como erupciones cutáneas para un análisis visual avanzado." 
                },
                { 
                  icon: <svg className="text-blue-600 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>, 
                  title: "Proveedores Cercanos", 
                  description: "Encuentra especialistas y centros médicos cercanos basados en tu ubicación y necesidades médicas." 
                },
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, x: 5 }}
                  className="flex items-start"
                >
                  <motion.div 
                    className="bg-blue-100 rounded-full p-2 mr-3"
                    whileHover={{ backgroundColor: "#dbeafe" }}
                  >
                    {feature.icon}
                  </motion.div>
                  <div>
                    <h4 className="font-medium text-gray-900">{feature.title}</h4>
                    <p className="text-gray-600 text-sm mt-1">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setIsExpanded(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                Probar ahora
                <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <motion.div 
        className="bg-gray-50 p-4 border-t border-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            Recuerda: Esta herramienta no sustituye la atención médica profesional.
          </p>
          {isExpanded && (
            <motion.button
              onClick={() => setShowFullAIDoctor(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Ver experiencia completa
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EmbeddedAIDoctor;
