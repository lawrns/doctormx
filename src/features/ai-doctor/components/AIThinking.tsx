import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

interface AIThinkingProps {
  message?: string;
}

const AIThinking: React.FC<AIThinkingProps> = ({ message = 'Analizando sus síntomas...' }) => {
  return (
    <motion.div 
      className="ai-thinking-container flex flex-col items-center p-4 bg-brand-jade-50 rounded-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="brain-pulse relative"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7] 
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 2.5,
          ease: "easeInOut" 
        }}
      >
        <div className="relative w-16 h-16 flex items-center justify-center">
          <motion.div 
            className="absolute inset-0 bg-brand-jade-200 rounded-full"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.1, 0.3] 
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 3,
              ease: "easeInOut" 
            }}
          />
          <Brain size={32} className="text-brand-jade-600 z-10" />
        </div>
      </motion.div>
      
      <div className="neural-connections mt-4 relative w-full h-12">
        {[...Array(12)].map((_, i) => (
          <motion.div 
            key={i}
            className="neural-path absolute h-0.5 bg-brand-jade-400"
            style={{
              top: `${Math.floor(i / 4) * 10 + 5}px`,
              left: '25%',
              width: '50%',
              transformOrigin: i % 2 === 0 ? 'left' : 'right'
            }}
            animate={{ 
              opacity: [0, 0.8, 0],
              scaleX: [0, 1, 0],
            }}
            transition={{ 
              duration: 3, 
              delay: i * 0.2,
              repeat: Infinity,
              repeatDelay: Math.random() * 2
            }}
          />
        ))}
      </div>
      
      <motion.div 
        className="thinking-label mt-4 text-brand-jade-700 font-medium"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {message}
      </motion.div>
      
      {/* Symptom cards that highlight as they're being processed */}
      <div className="symptom-cards mt-4 flex flex-wrap justify-center gap-2">
        {['Fiebre', 'Dolor', 'Tos', 'Erupción', 'Mareo'].map((symptom, i) => (
          <motion.div
            key={symptom}
            className="bg-white rounded-md px-3 py-1 text-sm shadow-sm border border-brand-jade-100"
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: [0, 1, 0],
              y: [10, 0, -10],
              scale: [0.95, 1, 0.95]
            }}
            transition={{
              delay: i * 0.8,
              duration: 4,
              repeat: Infinity,
              repeatDelay: Math.random() * 5 + 5
            }}
          >
            {symptom}
          </motion.div>
        ))}
      </div>
      
      {/* Medical terms that briefly appear and fade as the AI "considers" different possibilities */}
      <div className="medical-terms absolute top-0 left-0 w-full h-full pointer-events-none">
        {['Diagnóstico', 'Patología', 'Sintomatología', 'Etiología', 'Tratamiento'].map((term, i) => (
          <motion.div
            key={term}
            className="absolute text-brand-jade-400/30 text-xs font-mono"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0] }}
            transition={{
              delay: i * 1.2 + 2,
              duration: 3,
              repeat: Infinity,
              repeatDelay: Math.random() * 10 + 5
            }}
          >
            {term}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AIThinking;
