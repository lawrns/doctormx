import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Heart, Search, Zap, Users, BookOpen } from 'lucide-react';

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
        return <Heart className="w-5 h-5 text-brand-jade-500" />;
      case 'medium':
        return <Search className="w-5 h-5 text-yellow-500" />;
      case 'complex':
        return <Brain className="w-5 h-5 text-blue-500" />;
    }
  };

  const getComplexityColor = () => {
    switch (complexity) {
      case 'simple':
        return 'border-brand-jade-200 bg-brand-jade-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'complex':
        return 'border-blue-200 bg-blue-50';
    }
  };

  // Typing effect for the current stage
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
    }, 50); // Typing speed

    return () => clearInterval(typingInterval);
  }, [currentStage, stages, isActive]);

  const mexicanThinkingElements = [
    { icon: <Users className="w-4 h-4" />, text: "Considerando contexto familiar" },
    { icon: <Heart className="w-4 h-4" />, text: "Evaluando estado emocional" },
    { icon: <BookOpen className="w-4 h-4" />, text: "Consultando medicina tradicional" },
    { icon: <Zap className="w-4 h-4" />, text: "Accesibilidad económica" }
  ];

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`border rounded-lg p-4 mb-4 ${getComplexityColor()}`}
    >
      {/* Header with doctor image and complexity indicator */}
      <div className="flex items-center mb-3">
        <img 
          src="/images/simeon.png" 
          alt="Dr. Simeon" 
          className="w-8 h-8 rounded-full border-2 border-brand-jade-200 mr-3"
        />
        <div className="flex items-center space-x-2">
          {getComplexityIcon()}
          <span className="text-sm font-medium text-gray-700">
            Dr. Simeon está analizando...
          </span>
        </div>
      </div>

      {/* Main thinking display */}
      <div className="mb-3">
        <div className="flex items-center space-x-2 mb-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4"
          >
            <Brain className="w-4 h-4 text-brand-jade-600" />
          </motion.div>
          <span className="text-sm font-medium text-gray-800">
            {displayedText}
            {isTyping && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-brand-jade-500"
              >
                |
              </motion.span>
            )}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-brand-jade-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ 
              width: `${((currentStage + 1) / stages.length) * 100}%` 
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Mexican medical context indicators */}
      {mexicanContext && complexity !== 'simple' && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {mexicanThinkingElements.map((element, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: currentStage >= index ? 1 : 0.3,
                scale: currentStage >= index ? 1 : 0.8
              }}
              transition={{ delay: index * 0.2 }}
              className="flex items-center space-x-2 text-xs text-gray-600"
            >
              <div className={`p-1 rounded ${currentStage >= index ? 'bg-brand-jade-100 text-brand-jade-600' : 'bg-gray-100 text-gray-400'}`}>
                {element.icon}
              </div>
              <span>{element.text}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stage indicators */}
      <div className="flex justify-center mt-3 space-x-1">
        {stages.map((_, index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index <= currentStage ? 'bg-brand-jade-500' : 'bg-gray-300'
            }`}
            animate={{
              scale: index === currentStage ? [1, 1.2, 1] : 1
            }}
            transition={{
              duration: 1,
              repeat: index === currentStage ? Infinity : 0
            }}
          />
        ))}
      </div>

      {/* Additional context for complex cases */}
      {complexity === 'complex' && (
        <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
          <div className="flex items-center space-x-1">
            <BookOpen className="w-3 h-3" />
            <span>Consultando especialistas virtuales y literatura médica reciente</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default EnhancedAIThinking; 