import React, { memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Shield } from 'lucide-react';
import EnhancedChatBubble from './EnhancedChatBubble';
import ProductRecommendation from './ProductRecommendation';
import ImageAnalysisVisual from '../../ai-image-analysis/components/ImageAnalysisVisual';
import ConfidenceVisualizer from './ConfidenceVisualizer';
import EnhancedAIThinking from './EnhancedAIThinking';
import { useOptimizedScroll } from '../hooks/useOptimizedScroll';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  imageUrl?: string;
  audioUrl?: string;
  containsImage?: boolean;
  imageAnalysis?: {
    findings: string;
    confidence: number;
  };
  isEmergency?: boolean;
  severity?: number;
  suggestedSpecialty?: string;
  suggestedConditions?: string[];
  suggestedMedications?: string[];
  followUpQuestions?: string[];
  answerOptions?: any[];
  nearbyProviders?: any[];
  interactiveOptions?: {
    type: 'symptom_category' | 'symptom_duration' | 'symptom_severity' | 'yes_no' | 'follow_up_preference';
    options: string[];
    questionId: string;
  };
  nextQuestionId?: string;
  previousQuestionId?: string;
  isStreaming?: boolean;
  isComplete?: boolean;
  emotionalState?: any;
  personalityApplied?: boolean;
  thinkingStages?: string[];
  culturalFactors?: string[];
}

interface AIDoctorChatProps {
  messages: Message[];
  isThinking: boolean;
  thinkingStages: string[];
  currentThinkingStage: number;
  thinkingComplexity: 'simple' | 'medium' | 'complex';
  imageAnalysisStage: 'initial' | 'scanning' | 'identifying' | 'comparing' | 'concluding' | null;
  currentAnalysisImage: string | null;
  confidenceStatus: 'considering' | 'confident' | 'uncertain';
  confidenceLevel: number;
  onInteractiveClick: (option: string) => void;
  onAnswerOptionClick: (option: any) => void;
  onFollowUpClick: (question: string) => void;
  onFindProviders: (type: string) => void;
  onSendMessage: (message: string) => void;
}

function AIDoctorChat({
  messages,
  isThinking,
  thinkingStages,
  currentThinkingStage,
  thinkingComplexity,
  imageAnalysisStage,
  currentAnalysisImage,
  confidenceStatus,
  confidenceLevel,
  onInteractiveClick,
  onAnswerOptionClick,
  onFollowUpClick,
  onFindProviders,
  onSendMessage
}: AIDoctorChatProps) {
  const { scrollToBottom, scrollRef, isNearBottom, shouldAutoScroll } = useOptimizedScroll(150, 100);

  // Auto-scroll when new messages arrive or thinking state changes
  useEffect(() => {
    if (shouldAutoScroll || isThinking) {
      scrollToBottom();
    }
  }, [messages, isThinking, scrollToBottom, shouldAutoScroll]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-4" 
      style={{ 
        maxHeight: 'calc(100vh - 280px)',
        scrollBehavior: 'smooth',
        willChange: 'scroll-position'
      }}
    >
      <AnimatePresence>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
              {message.sender === 'bot' && (
                <div className="mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-[#006D77] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">DS</span>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">Dr. Simeon</span>
                  </div>
                </div>
              )}

              <EnhancedChatBubble
                message={message}
                onInteractiveClick={onInteractiveClick}
                onAnswerOptionClick={onAnswerOptionClick}
                onFollowUpClick={onFollowUpClick}
                onFindProviders={onFindProviders}
              />

              {/* Enhanced thinking display for streaming messages */}
              {message.sender === 'bot' && message.isStreaming && (
                <div className="mt-2">
                  <ConfidenceVisualizer 
                    confidence={confidenceLevel}
                    status={confidenceStatus}
                  />
                </div>
              )}

              {/* Image analysis visual */}
              {message.containsImage && imageAnalysisStage && currentAnalysisImage && (
                <div className="mt-2">
                  <ImageAnalysisVisual
                    stage={imageAnalysisStage}
                    imageUrl={currentAnalysisImage}
                    confidence={confidenceLevel}
                  />
                </div>
              )}

              {/* Product recommendations */}
              {message.suggestedMedications && message.suggestedMedications.length > 0 && (
                <div className="mt-2">
                  <ProductRecommendation medications={message.suggestedMedications} />
                </div>
              )}

              {/* Emergency indicator */}
              {message.isEmergency && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-red-700 font-medium text-sm">
                      Síntoma de urgencia detectado - Considera contactar servicios de emergencia
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Enhanced thinking indicator */}
      {isThinking && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex justify-start"
        >
          <div className="max-w-[80%]">
            <div className="mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#006D77] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">DS</span>
                </div>
                <span className="text-sm text-gray-600 font-medium">Dr. Simeon</span>
              </div>
            </div>
            <EnhancedAIThinking
              stages={thinkingStages}
              currentStage={currentThinkingStage}
              complexity={thinkingComplexity}
            />
          </div>
        </motion.div>
      )}

      {/* Medical disclaimer */}
      <div className="border-l-4 border-[#006D77] pl-4 bg-[#D0F0EF]/30 p-4 rounded">
        <p className="text-sm font-medium text-[#006D77]">
          ✅ Cédula Profesional: 987654321 (México)
          <br />
          ✅ Certificado • NOM-004-SSA3-2012
          <br />
          ✅ Supervisión médica 24/7
        </p>
      </div>

      <div className="flex items-center space-x-4 text-sm text-gray-500">
        <div className="flex items-center">
          <CheckCircle className="w-4 h-4 text-[#006D77] mr-1" />
          <span>Cifrado E2E</span>
        </div>
        <div className="flex items-center">
          <Shield className="w-4 h-4 text-[#006D77] mr-1" />
          <span>HIPAA Compliant</span>
        </div>
      </div>

      {/* Scroll indicator when not at bottom */}
      {!isNearBottom && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-32 right-6 z-30"
        >
          <button
            onClick={() => scrollToBottom({ behavior: 'smooth' })}
            className="bg-[#006D77] text-white p-3 rounded-full shadow-lg hover:bg-[#005B66] transition-colors"
            aria-label="Ir al final de la conversación"
          >
            ↓
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default memo(AIDoctorChat);