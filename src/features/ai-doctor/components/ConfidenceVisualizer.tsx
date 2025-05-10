import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Database, Beaker } from 'lucide-react';

interface ConfidenceVisualizerProps {
  confidence: number; // 0-100
  status: 'considering' | 'confident' | 'uncertain';
  references?: string[];
}

const ConfidenceVisualizer: React.FC<ConfidenceVisualizerProps> = ({
  confidence = 50,
  status = 'considering',
  references = ['Base de datos médica', 'Estudios clínicos', 'Literatura médica']
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'considering': return '#f59e0b'; // yellow
      case 'confident': return '#2962FF'; // blue
      case 'uncertain': return '#ef4444'; // red
      default: return '#f59e0b';
    }
  };
  
  return (
    <div className="confidence-container p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Nivel de confianza</h3>
        <span className="text-sm font-medium" style={{ color: getStatusColor() }}>
          {confidence}%
        </span>
      </div>
      
      {/* Confidence meter */}
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div 
          className="h-full rounded-full"
          initial={{ width: '0%' }}
          animate={{ 
            width: `${confidence}%`,
            backgroundColor: getStatusColor()
          }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      
      {/* Reference indicators */}
      <div className="mt-4">
        <p className="text-xs text-gray-500 mb-2">Fuentes consultadas:</p>
        <div className="flex flex-wrap gap-2">
          {references.map((ref, index) => (
            <motion.div 
              key={index}
              className="flex items-center bg-white px-2 py-1 rounded-full border text-xs"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              {index % 3 === 0 && <BookOpen size={12} className="mr-1" />}
              {index % 3 === 1 && <Database size={12} className="mr-1" />}
              {index % 3 === 2 && <Beaker size={12} className="mr-1" />}
              {ref}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConfidenceVisualizer;
