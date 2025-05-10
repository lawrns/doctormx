import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, AlertCircle } from 'lucide-react';

interface ImageAnalysisVisualProps {
  imageSrc: string;
  analysisStage: 'initial' | 'scanning' | 'identifying' | 'comparing' | 'concluding';
  onAnalysisComplete?: () => void;
}

const ImageAnalysisVisual: React.FC<ImageAnalysisVisualProps> = ({ 
  imageSrc, 
  analysisStage, 
  onAnalysisComplete 
}) => {
  const [markers, setMarkers] = useState<Array<{x: string, y: string, size: number}>>([]);
  
  useEffect(() => {
    if (analysisStage === 'identifying') {
      const newMarkers = [];
      for (let i = 0; i < 5; i++) {
        newMarkers.push({
          x: `${20 + Math.random() * 60}%`,
          y: `${20 + Math.random() * 60}%`,
          size: 8 + Math.random() * 16
        });
      }
      setMarkers(newMarkers);
    }
  }, [analysisStage]);
  
  useEffect(() => {
    if (analysisStage === 'concluding' && onAnalysisComplete) {
      const timer = setTimeout(() => {
        onAnalysisComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [analysisStage, onAnalysisComplete]);

  return (
    <div className="analysis-container relative rounded-lg overflow-hidden">
      {/* Scanning overlay */}
      <AnimatePresence>
        {analysisStage === 'scanning' && (
          <motion.div 
            className="scanning-overlay absolute inset-0 bg-blue-500 opacity-20 z-10"
            initial={{ left: '-100%' }}
            animate={{
              left: ['0%', '100%'],
            }}
            transition={{ 
              repeat: Infinity,
              duration: 2,
              ease: "linear"
            }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
      
      {/* Target image with filter effects */}
      <motion.div
        className="relative"
        animate={{
          filter: analysisStage === 'scanning' 
            ? ['blur(0px)', 'blur(2px)', 'blur(0px)'] 
            : analysisStage === 'comparing'
            ? ['brightness(1)', 'brightness(1.2)', 'brightness(1)']
            : 'none'
        }}
        transition={{ 
          duration: 3,
          repeat: analysisStage === 'scanning' || analysisStage === 'comparing' ? Infinity : 0
        }}
      >
        <img 
          src={imageSrc}
          alt="Imagen para análisis"
          className="w-full rounded-lg"
        />
      </motion.div>
      
      {/* Analysis grid overlay */}
      <AnimatePresence>
        {(analysisStage === 'scanning' || analysisStage === 'identifying') && (
          <motion.div 
            className="analysis-grid absolute inset-0 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
          >
            <div className="grid grid-cols-6 grid-rows-6 h-full w-full">
              {[...Array(36)].map((_, i) => (
                <motion.div 
                  key={i}
                  className="border border-blue-400"
                  initial={{ opacity: 0.1 }}
                  animate={{ 
                    opacity: analysisStage === 'identifying' && i % 7 === 0 ? [0.1, 0.6, 0.1] : 0.1,
                    backgroundColor: analysisStage === 'identifying' && i % 7 === 0 ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: Math.random()
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Diagnostic markers */}
      <AnimatePresence>
        {analysisStage === 'identifying' && (
          <>
            {markers.map((marker, index) => (
              <motion.div 
                key={index}
                className="diagnostic-marker absolute z-30"
                style={{ left: marker.x, top: marker.y }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1,
                  opacity: 1
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: index * 0.3 }}
              >
                <motion.div 
                  className="relative"
                  animate={{ 
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: Math.random()
                  }}
                >
                  <div 
                    className="rounded-full border-2 border-blue-500 bg-blue-100 flex items-center justify-center"
                    style={{ width: marker.size, height: marker.size }}
                  >
                    <Search size={marker.size / 2} className="text-blue-600" />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
      
      {/* Comparing split view effect */}
      <AnimatePresence>
        {analysisStage === 'comparing' && (
          <motion.div 
            className="comparing-overlay absolute inset-0 z-20 flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="w-1/2 h-full border-r-2 border-blue-500 bg-gradient-to-r from-transparent to-blue-100 opacity-30"
              animate={{ x: ['-100%', '0%'] }}
              transition={{ duration: 1 }}
            />
            <motion.div 
              className="w-1/2 h-full bg-gradient-to-l from-transparent to-blue-100 opacity-30"
              animate={{ x: ['100%', '0%'] }}
              transition={{ duration: 1 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Conclusion overlay */}
      <AnimatePresence>
        {analysisStage === 'concluding' && (
          <motion.div 
            className="conclusion-overlay absolute inset-0 z-30 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white bg-opacity-80 rounded-full p-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              <Check size={40} className="text-blue-600" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Status indicator */}
      <div className="status-indicator absolute bottom-2 right-2 z-40">
        <div className="bg-white rounded-full px-3 py-1 text-xs font-medium shadow-md flex items-center">
          {analysisStage === 'initial' && (
            <span className="text-gray-600">Preparando análisis...</span>
          )}
          {analysisStage === 'scanning' && (
            <span className="text-blue-600 flex items-center">
              <motion.div 
                className="w-2 h-2 bg-blue-600 rounded-full mr-2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
              Escaneando imagen
            </span>
          )}
          {analysisStage === 'identifying' && (
            <span className="text-blue-600 flex items-center">
              <motion.div 
                className="w-2 h-2 bg-blue-600 rounded-full mr-2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
              Identificando patrones
            </span>
          )}
          {analysisStage === 'comparing' && (
            <span className="text-blue-600 flex items-center">
              <motion.div 
                className="w-2 h-2 bg-blue-600 rounded-full mr-2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
              Comparando con base de datos
            </span>
          )}
          {analysisStage === 'concluding' && (
            <span className="text-green-600 flex items-center">
              <Check size={12} className="mr-1" />
              Análisis completado
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageAnalysisVisual;
