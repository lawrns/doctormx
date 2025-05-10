import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

interface AIThinkingProps {
  message?: string;
}

const AIThinking: React.FC<AIThinkingProps> = ({ message = 'Analizando sus síntomas...' }) => {
  return (
    <motion.div 
      className="ai-thinking-container flex flex-col items-center p-4 bg-blue-50 rounded-lg"
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
            className="absolute inset-0 bg-blue-200 rounded-full"
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
          <Brain size={32} className="text-blue-600 z-10" />
        </div>
      </motion.div>
      
      <div className="neural-connections mt-4 relative w-full h-12">
        {[...Array(12)].map((_, i) => (
          <motion.div 
            key={i}
            className="neural-path absolute h-0.5 bg-blue-400"
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
        className="thinking-label mt-4 text-blue-700 font-medium"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {message}
      </motion.div>
    </motion.div>
  );
};

export default AIThinking;
