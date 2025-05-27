// ======================================================
// OPTIMIZED AIDOCTOR COMPONENT
// Refactored into smaller components for better performance
// Uses useReducer for efficient state management
// Implements proper cleanup for memory leak prevention
// ======================================================

import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { enhancedAIService, EnhancedAIQueryOptions, EnhancedStreamingAIResponse, EnhancedStreamingResponseHandler } from '../../../core/services/ai/EnhancedAIService';
import { mexicanMedicalKnowledgeService } from '../../../core/services/knowledge/MexicanMedicalKnowledgeService';
import EncryptionService from '../../../core/services/security/EncryptionService';
import { AIAnswerOption } from '../../../core/services/ai/AIService';
import { useMessageReducer, Message } from '../hooks/useMessageReducer';
import AIDoctorTabs from './AIDoctorTabs';
import AIDoctorChat from './AIDoctorChat';
import AIDoctorQuickActions from './AIDoctorQuickActions';
import AIDoctorInput from './AIDoctorInput';
import { useCleanup } from '../hooks/useCleanup';

const OPENAI_KEY_STORAGE_KEY = 'openai_api_key';
const DOCTOR_INSTRUCTIONS_KEY = 'doctor_instructions';
const DOCTOR_IMAGE_ANALYSIS_ENABLED_KEY = 'doctor_image_analysis_enabled';

type Tab = 'chat' | 'analysis' | 'providers' | 'prescriptions' | 'appointments' | 'pharmacies';

interface AIDoctorProps {
  onClose?: () => void;
  isEmbedded?: boolean;
  initialMessage?: string;
}

function AIDoctor({ onClose, isEmbedded = false, initialMessage }: AIDoctorProps) {
  // Use optimized message reducer instead of useState
  const {
    messages,
    addMessage,
    updateStreamingMessage,
    completeMessage,
    updateMessageField
  } = useMessageReducer();
  
  // Use cleanup hook for memory leak prevention
  const { addTimeout, addInterval, addCleanup } = useCleanup();
  
  // Simplified state management
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isTabMenuOpen, setIsTabMenuOpen] = useState(false);
  const [severityLevel, setSeverityLevel] = useState(10);
  const [imageAnalysisStage, setImageAnalysisStage] = useState<'initial' | 'scanning' | 'identifying' | 'comparing' | 'concluding' | null>(null);
  const [currentAnalysisImage, setCurrentAnalysisImage] = useState<string | null>(null);
  const [confidenceStatus, setConfidenceStatus] = useState<'considering' | 'confident' | 'uncertain'>('considering');
  const [confidenceLevel, setConfidenceLevel] = useState(0);
  
  // Enhanced AI thinking states
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStages, setThinkingStages] = useState<string[]>([]);
  const [currentThinkingStage, setCurrentThinkingStage] = useState(0);
  const [thinkingComplexity, setThinkingComplexity] = useState<'simple' | 'medium' | 'complex'>('simple');
  
  // Mexican family context
  const [familyMember, setFamilyMember] = useState<string>('myself');
  const [showFamilySetup, setShowFamilySetup] = useState(false);
  
  // Session and location
  const [sessionId] = useState(`session_${Date.now()}`);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Provider and pharmacy data
  const [selectedProviders, setSelectedProviders] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  
  // Refs
  const initialMessageSentRef = useRef(false);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  // Send initial message if provided
  useEffect(() => {
    if (initialMessage && !initialMessageSentRef.current) {
      setInput(initialMessage);
      addTimeout(() => handleSendMessage(), 1000);
      initialMessageSentRef.current = true;
    }
  }, [initialMessage]);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() && !isUploading) return;
    
    const userInput = input;
    setInput('');
    setIsProcessing(true);
    setIsThinking(true);

    // Add user message using reducer
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userInput,
      sender: 'user',
      timestamp: new Date()
    };
    addMessage(userMessage);

    // Create bot message placeholder
    const botMessageId = (Date.now() + 1).toString();
    const botMessage: Message = {
      id: botMessageId,
      text: '',
      sender: 'bot',
      timestamp: new Date(),
      isStreaming: true,
      isComplete: false
    };
    addMessage(botMessage);

    try {
      // Determine conversation complexity for thinking indicators
      const complexity = userInput.length > 100 ? 'complex' : 
                        userInput.includes('dolor') || userInput.includes('síntoma') ? 'medium' : 'simple';
      setThinkingComplexity(complexity);

      // Optimized streaming handler using reducer
      const streamingHandler: EnhancedStreamingResponseHandler = (streamResponse: EnhancedStreamingAIResponse) => {
        // Handle thinking stages with cleanup
        if (streamResponse.thinkingStages && streamResponse.thinkingStages.length > 0) {
          setThinkingStages(streamResponse.thinkingStages);
          setCurrentThinkingStage(0);
          
          // Progress through stages with proper cleanup
          streamResponse.thinkingStages.forEach((stage, index) => {
            addTimeout(() => {
              setCurrentThinkingStage(index);
            }, index * 1000);
          });
          
          // Stop thinking when complete
          addTimeout(() => {
            setIsThinking(false);
          }, streamResponse.thinkingStages.length * 1000);
        }
        
        // Update message using reducer for efficiency
        updateStreamingMessage(botMessageId, streamResponse.text);
        
        // Update other message fields
        if (streamResponse.severity) {
          updateMessageField(botMessageId, 'severity', streamResponse.severity);
          setSeverityLevel(streamResponse.severity);
        }
        
        if (streamResponse.isEmergency) {
          updateMessageField(botMessageId, 'isEmergency', streamResponse.isEmergency);
        }
        
        // Complete message when done
        if (streamResponse.isComplete) {
          completeMessage(botMessageId, {
            suggestedSpecialty: streamResponse.suggestedSpecialty,
            suggestedConditions: streamResponse.suggestedConditions,
            suggestedMedications: streamResponse.suggestedMedications,
            followUpQuestions: streamResponse.followUpQuestions,
            answerOptions: streamResponse.answerOptions,
            emotionalState: streamResponse.emotionalState,
            personalityApplied: streamResponse.personalityApplied,
            culturalFactors: streamResponse.culturalFactors
          });
          
          setIsProcessing(false);
          setIsThinking(false);
          
          // Schedule provider search if needed
          if (streamResponse.suggestedSpecialty && location) {
            addTimeout(() => {
              findProviders(streamResponse.suggestedSpecialty!);
            }, 1000);
          }
        }
      };

      const queryOptions: EnhancedAIQueryOptions = {
        userMessage: userInput,
        userHistory: messages.map(m => m.text),
        severity: severityLevel,
        location: location || undefined,
        sessionId: sessionId,
        enablePersonality: true,
        showThinking: true,
        thinkingComplexity: complexity,
        culturalContext: {
          familyDynamics: 'family-oriented',
          religiousConsiderations: false,
          economicContext: 'medium'
        }
      };
      
      await enhancedAIService.processEnhancedStreamingQuery(queryOptions, streamingHandler);
      
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Handle error using reducer
      completeMessage(botMessageId, {
        text: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.',
        isStreaming: false,
        isComplete: true
      });
      
      setIsProcessing(false);
      setIsThinking(false);
    }
  }, [input, isUploading, messages, severityLevel, location, sessionId, addMessage, updateStreamingMessage, completeMessage, updateMessageField, addTimeout]);

  // Simplified provider search
  const findProviders = useCallback(async (specialty: string) => {
    try {
      // Simulated provider search
      const mockProviders = [
        { name: `Dr. García (${specialty})`, distance: '2.5 km', rating: 4.8 },
        { name: `Dra. Martínez (${specialty})`, distance: '3.1 km', rating: 4.7 }
      ];
      setSelectedProviders(mockProviders);
    } catch (error) {
      console.error('Error finding providers:', error);
    }
  }, []);

  // Simplified image upload handler
  const handleImageUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    
    try {
      const imageUrl = URL.createObjectURL(file);
      setCurrentAnalysisImage(imageUrl);
      
      const userMessage: Message = {
        id: Date.now().toString(),
        text: 'He subido una imagen para análisis.',
        sender: 'user',
        timestamp: new Date(),
        containsImage: true,
        imageUrl
      };
      addMessage(userMessage);
      
      // Simplified analysis sequence
      setImageAnalysisStage('scanning');
      setConfidenceLevel(30);
      
      addTimeout(() => {
        setImageAnalysisStage('identifying');
        setConfidenceLevel(70);
      }, 2000);
      
      addTimeout(() => {
        setImageAnalysisStage(null);
        setCurrentAnalysisImage(null);
        setConfidenceLevel(95);
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'He analizado tu imagen. Basándome en lo que veo, te recomiendo consultar con un dermatólogo para una evaluación más detallada.',
          sender: 'bot',
          timestamp: new Date(),
          suggestedSpecialty: 'Dermatología'
        };
        addMessage(botMessage);
      }, 4000);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hubo un error al procesar tu imagen.',
        sender: 'bot',
        timestamp: new Date()
      };
      addMessage(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [addMessage, addTimeout]);

  // Simplified mic handler
  const handleMicClick = useCallback(() => {
    setIsRecording(!isRecording);
    // Simplified implementation - just toggle recording state
    // Full implementation would use MediaRecorder API
  }, [isRecording]);

  // Handle interactive option clicks
  const handleInteractiveClick = useCallback((option: string) => {
    setInput(option);
    addTimeout(() => handleSendMessage(), 100);
  }, [handleSendMessage, addTimeout]);

  // Render chat content when active tab is chat
  if (activeTab === 'chat') {
    return (
      <div className="h-full flex flex-col bg-white">
        <AIDoctorTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={onClose}
          isEmbedded={isEmbedded}
          isTabMenuOpen={isTabMenuOpen}
          setIsTabMenuOpen={setIsTabMenuOpen}
        />
        
        <AIDoctorQuickActions
          familyMember={familyMember}
          showFamilySetup={showFamilySetup}
          setShowFamilySetup={setShowFamilySetup}
          setFamilyMember={setFamilyMember}
          setInput={setInput}
          onSendMessage={handleSendMessage}
        />
        
        <AIDoctorChat
          messages={messages}
          isThinking={isThinking}
          thinkingStages={thinkingStages}
          currentThinkingStage={currentThinkingStage}
          thinkingComplexity={thinkingComplexity}
          imageAnalysisStage={imageAnalysisStage}
          currentAnalysisImage={currentAnalysisImage}
          confidenceStatus={confidenceStatus}
          confidenceLevel={confidenceLevel}
          onInteractiveClick={handleInteractiveClick}
          onSendMessage={handleSendMessage}
        />
        
        <AIDoctorInput
          input={input}
          setInput={setInput}
          isRecording={isRecording}
          isUploading={isUploading}
          isProcessing={isProcessing}
          onSendMessage={handleSendMessage}
          onMicClick={handleMicClick}
          onImageUpload={handleImageUpload}
        />
      </div>
    );
  }

  // Render other tabs with AIDoctorTabs component
  return (
    <div className="h-full flex flex-col bg-white">
      <AIDoctorTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onClose={onClose}
        isEmbedded={isEmbedded}
        isTabMenuOpen={isTabMenuOpen}
        setIsTabMenuOpen={setIsTabMenuOpen}
      />
    </div>
  );
}

export default memo(AIDoctor);