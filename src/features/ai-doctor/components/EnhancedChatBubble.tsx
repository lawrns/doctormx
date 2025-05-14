import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, AlertCircle, Info, Check } from 'lucide-react';

interface EnhancedChatBubbleProps {
  message: {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    severity?: number;
    isEmergency?: boolean;
    containsImage?: boolean;
    imageUrl?: string;
    imageAnalysis?: {
      findings: string;
      confidence: number;
    };
    suggestedSpecialty?: string;
    suggestedConditions?: string[];
    suggestedMedications?: string[];
    followUpQuestions?: string[];
    isStreaming?: boolean;
    isComplete?: boolean;
  };
  onOptionSelect?: (option: string, questionId: string) => void;
  interactiveOptions?: {
    type: 'symptom_category' | 'symptom_duration' | 'symptom_severity' | 'yes_no' | 'follow_up_preference';
    options: string[];
    questionId: string;
  };
  onFollowUpClick?: (question: string) => void;
  onGoBack?: () => void;
  showGoBack?: boolean;
}

const EnhancedChatBubble: React.FC<EnhancedChatBubbleProps> = ({
  message,
  onOptionSelect,
  interactiveOptions,
  onFollowUpClick,
  onGoBack,
  showGoBack
}) => {
  // Simplified variants without hover effects or shadows
  const bubbleVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.3
      } 
    }
  };

  const confidence = message.imageAnalysis?.confidence 
    ? Math.round(message.imageAnalysis.confidence * 100) 
    : 85;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={bubbleVariants}
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div 
        className={`rounded-2xl px-4 py-3 max-w-md ${
          message.sender === 'user' 
            ? 'bg-blue-600 text-white rounded-br-none' 
            : message.isEmergency
              ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-none'
              : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
        }`}
      >
        <div className="flex items-center mb-1">
          {message.sender === 'bot' ? (
            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className="mr-1"
            >
              <Stethoscope size={16} className="text-blue-600" />
            </motion.div>
          ) : (
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-4 h-4 rounded-full bg-white mr-1 flex items-center justify-center"
            >
              <span className="text-blue-600 text-xs">U</span>
            </motion.div>
          )}
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-xs ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}
          >
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </motion.span>
        </div>
        
        {message.isEmergency ? (
          <div>
            <motion.div 
              className="flex items-center mb-2"
              initial={{ x: -5 }}
              animate={{ x: 0 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              <AlertCircle size={16} className="text-red-600 mr-1" />
              <span className="font-bold">Emergencia Médica</span>
            </motion.div>
            <p>{message.text}</p>
          </div>
        ) : (
          <>
            {message.isStreaming ? (
              <>
                {message.text === '' ? (
                  <div className="leading-relaxed flex items-center">
                    <motion.span 
                      className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-1"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.2, repeatDelay: 0.2 }}
                    />
                    <motion.span 
                      className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-1"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: 0.2, repeatDelay: 0.2 }}
                    />
                    <motion.span 
                      className="inline-block w-2 h-2 bg-blue-600 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: 0.4, repeatDelay: 0.2 }}
                    />
                    <span className="ml-2 text-sm text-gray-600">Doctor.mx está escribiendo...</span>
                  </div>
                ) : (
                  <div>
                    <p className="leading-relaxed">{message.text}</p>
                    <div className="mt-2 flex items-center">
                      <motion.span 
                        className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mr-0.5"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ repeat: Infinity, duration: 1.2, repeatDelay: 0.2 }}
                      />
                      <motion.span 
                        className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mr-0.5"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ repeat: Infinity, duration: 1.2, delay: 0.2, repeatDelay: 0.2 }}
                      />
                      <motion.span 
                        className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ repeat: Infinity, duration: 1.2, delay: 0.4, repeatDelay: 0.2 }}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="leading-relaxed">{message.text}</p>
            )}
            
            {message.containsImage && message.imageUrl && (
              <motion.div 
                className="mt-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <img 
                  src={message.imageUrl} 
                  alt="Imagen médica" 
                  className="rounded-md max-h-48 max-w-full"
                />
              </motion.div>
            )}
            
            {message.imageAnalysis && (
              <motion.div 
                className="mt-3 p-3 bg-blue-50 rounded-md text-sm"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ delay: 0.3 }}
              >
                <p className="font-medium text-blue-800 mb-1">Análisis de imagen:</p>
                <p className="text-gray-700">{message.imageAnalysis.findings}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Nivel de confianza</span>
                    <span>{confidence}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-600" 
                      initial={{ width: 0 }}
                      animate={{ width: `${confidence}%` }}
                      transition={{ delay: 0.5, duration: 1 }}
                    />
                  </div>
                </div>
                <motion.div 
                  className="mt-2 flex items-center text-xs text-blue-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <Info size={12} className="mr-1" />
                  <span>Basado en patrones médicos reconocidos</span>
                </motion.div>
              </motion.div>
            )}
            
            {/* Interactive Options Buttons */}
            {interactiveOptions && (
              <motion.div 
                className="mt-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex flex-wrap gap-2">
                  {interactiveOptions.options.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onOptionSelect && onOptionSelect(option, interactiveOptions.questionId)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all ${
                        interactiveOptions.type === 'symptom_category' 
                          ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100'
                          : interactiveOptions.type === 'symptom_duration'
                            ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100'
                            : interactiveOptions.type === 'symptom_severity'
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : interactiveOptions.type === 'yes_no' && option.includes('Ver medicamentos')
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100'
                      }`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
                
                {/* Go back button */}
                {showGoBack && (
                  <motion.button
                    whileHover={{ x: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onGoBack}
                    className="mt-2 text-xs text-blue-600 flex items-center hover:text-blue-700 transition-colors"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver a la pregunta anterior
                  </motion.button>
                )}
              </motion.div>
            )}
            
            {message.followUpQuestions && message.followUpQuestions.length > 0 && (
              <motion.div 
                className="mt-3 space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {message.followUpQuestions.map((question, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ 
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      x: 2
                    }}
                    onClick={() => onFollowUpClick && onFollowUpClick(question)}
                    className="block w-full text-left text-sm bg-gray-50 hover:bg-blue-50 p-2 rounded-md transition-colors"
                  >
                    {question}
                  </motion.button>
                ))}
              </motion.div>
            )}
            
            {message.suggestedConditions && message.suggestedConditions.length > 0 && (
              <motion.div 
                className="mt-3 p-2 bg-blue-50 rounded-md"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-sm font-medium text-blue-700 mb-1">Posibles condiciones:</p>
                <div className="flex flex-wrap gap-1">
                  {message.suggestedConditions.map((condition, idx) => (
                    <motion.span 
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * idx }}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white text-blue-800 border border-blue-100"
                    >
                      <Check size={10} className="mr-1 text-blue-600" />
                      {condition}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default EnhancedChatBubble;
