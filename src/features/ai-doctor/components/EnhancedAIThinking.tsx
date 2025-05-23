import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Heart, Search, Zap, Users, BookOpen, Stethoscope, Shield } from 'lucide-react';

interface EnhancedAIThinkingProps {
  stages: string[];
  currentStage: number;
  isActive: boolean;
  complexity: 'simple' | 'medium' | 'complex';
  mexicanContext?: boolean;
}

const EnhancedAIThinking: React.FC<EnhancedAIThinkingProps> = ({
  stages,
  currentStage,
  isActive,
  complexity,
  mexicanContext = true
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const getComplexityIcon = () => {
    switch (complexity) {
      case 'simple':
        return <Heart className="w-4 h-4 text-teal-500" />;
      case 'medium':
        return <Search className="w-4 h-4 text-yellow-500" />;
      case 'complex':
        return <Brain className="w-4 h-4 text-blue-500" />;
    }
  };

  const getComplexityColor = () => {
    switch (complexity) {
      case 'simple':
        return 'border-teal-200 bg-gradient-to-br from-teal-50 to-blue-50';
      case 'medium':
        return 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50';
      case 'complex':
        return 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50';
    }
  };

  // Enhanced typing effect with more realistic speed
  useEffect(() => {
    if (!isActive || currentStage >= stages.length) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    const currentText = stages[currentStage];
    setIsTyping(true);
    setDisplayedText('');

    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < currentText.length) {
        setDisplayedText(currentText.substring(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 30); // Faster, more realistic typing speed

    return () => clearInterval(typingInterval);
  }, [currentStage, stages, isActive]);

  const mexicanThinkingElements = [
    { icon: <Users className="w-4 h-4" />, text: "Contexto familiar mexicano", color: "text-teal-600 bg-teal-100" },
    { icon: <Heart className="w-4 h-4" />, text: "Bienestar emocional", color: "text-pink-600 bg-pink-100" },
    { icon: <BookOpen className="w-4 h-4" />, text: "Medicina tradicional", color: "text-green-600 bg-green-100" },
    { icon: <Shield className="w-4 h-4" />, text: "Acceso IMSS/ISSSTE", color: "text-blue-600 bg-blue-100" }
  ];

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`border-2 rounded-xl p-6 mb-4 shadow-lg ${getComplexityColor()}`}
    >
      {/* Enhanced Header with optimized sizing */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center shadow-sm">
            <Stethoscope className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              {getComplexityIcon()}
              <span className="text-sm font-semibold text-gray-800">
                Dr. Simeon está analizando
              </span>
            </div>
            <div className="text-xs text-gray-600 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              IA Médica Activa
            </div>
          </div>
        </div>

        {/* Optimized Brain Animation - 24x24px as specified */}
        <div className="relative w-6 h-6">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full"></div>
          <div className="absolute inset-1 bg-white rounded-full shadow-inner"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{ 
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Brain className="w-3 h-3 text-teal-600" />
            </motion.div>
          </div>
          
          {/* Subtle thinking indicators */}
          <div className="absolute -inset-1">
            <motion.div
              className="w-full h-full border border-teal-200 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>

      {/* Enhanced thinking display with better typography */}
      <div className="mb-4">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 mb-3">
          <div className="flex items-start space-x-3">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="mt-1"
            >
              <Brain className="w-4 h-4 text-teal-600" />
            </motion.div>
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-800 leading-relaxed">
                {displayedText}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-teal-500 font-bold"
                  >
                    |
                  </motion.span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced progress bar with percentage */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-600">
            <span>Progreso del análisis</span>
            <span className="font-medium">{Math.round(((currentStage + 1) / stages.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full relative"
              initial={{ width: 0 }}
              animate={{ 
                width: `${((currentStage + 1) / stages.length) * 100}%` 
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 bg-white/30"
                animate={{ x: ["0%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: "20%" }}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enhanced Mexican medical context indicators */}
      {mexicanContext && complexity !== 'simple' && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          {mexicanThinkingElements.map((element, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ 
                opacity: currentStage >= index ? 1 : 0.4,
                scale: currentStage >= index ? 1 : 0.9,
                y: 0
              }}
              transition={{ delay: index * 0.3, duration: 0.5 }}
              className={`flex items-center space-x-2 text-xs p-2 rounded-lg transition-all ${
                currentStage >= index 
                  ? 'bg-white/80 shadow-sm' 
                  : 'bg-white/40'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${
                currentStage >= index ? element.color : 'bg-gray-100 text-gray-400'
              }`}>
                {element.icon}
              </div>
              <span className={`font-medium ${
                currentStage >= index ? 'text-gray-700' : 'text-gray-500'
              }`}>
                {element.text}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Enhanced stage indicators with better visual feedback */}
      <div className="flex justify-center mt-4 space-x-2">
        {stages.map((_, index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index <= currentStage 
                ? 'bg-gradient-to-r from-teal-500 to-blue-500 shadow-sm' 
                : 'bg-gray-300'
            }`}
            animate={{
              scale: index === currentStage ? [1, 1.3, 1] : 1,
              y: index === currentStage ? [0, -2, 0] : 0
            }}
            transition={{
              duration: 1.5,
              repeat: index === currentStage ? Infinity : 0,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Enhanced context for complex cases */}
      {complexity === 'complex' && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ delay: 1 }}
          className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
        >
          <div className="flex items-center space-x-2 text-xs text-blue-700">
            <BookOpen className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">
              Consultando especialistas virtuales y guías médicas mexicanas actualizadas
            </span>
          </div>
          <div className="mt-2 flex items-center space-x-4 text-xs text-blue-600">
            <span>• Norma Oficial Mexicana</span>
            <span>• Guías IMSS</span>
            <span>• Literatura médica reciente</span>
          </div>
        </motion.div>
      )}

      {/* Confidence indicator for transparency */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="mt-3 text-center"
      >
        <div className="text-xs text-gray-500">
          Nivel de confianza del análisis: 
          <span className="font-semibold text-teal-600 ml-1">
            {complexity === 'simple' ? '95%' : complexity === 'medium' ? '90%' : '85%'}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedAIThinking; 