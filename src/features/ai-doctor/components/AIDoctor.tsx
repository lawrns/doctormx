// ======================================================
// IMPORTANT: THIS IS THE CANONICAL VERSION
// This is the current active implementation of AIDoctor.
// There's a deprecated version at:
// /src/components/ai/AIDoctor.tsx
// which just re-exports this component.
// Please make all changes to this file.
// ======================================================

import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image, Mic, MapPin, Calendar, FileText, Menu, X, MessageSquare, Activity, Users, Pill, ShoppingBag, User, Heart, Phone } from 'lucide-react';
import { enhancedAIService, EnhancedAIQueryOptions, EnhancedStreamingAIResponse, EnhancedStreamingResponseHandler } from '../../../core/services/ai/EnhancedAIService';
import { mexicanMedicalKnowledgeService } from '../../../core/services/knowledge/MexicanMedicalKnowledgeService';
import EncryptionService from '../../../core/services/security/EncryptionService';
import { AIAnswerOption } from '../../../core/services/ai/AIService';
import { ConversationFlowService } from '../services/ConversationFlowService';
import { getSpeechRecognitionService, SpeechRecognitionService } from '../services/SpeechRecognitionService';
import { ContextOptimizationService } from '../services/ContextOptimizationService';
import AIThinking from './AIThinking';
import EnhancedAIThinking from './EnhancedAIThinking';
import EnhancedChatBubble from './EnhancedChatBubble';
import ProductRecommendation from './ProductRecommendation';
import ImageAnalysisVisual from '../../ai-image-analysis/components/ImageAnalysisVisual';
import ConfidenceVisualizer from './ConfidenceVisualizer';
import AIDoctorMobile from './AIDoctorMobile';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { unifiedConversationService } from '../services/UnifiedConversationService';

const OPENAI_KEY_STORAGE_KEY = 'openai_api_key';
const DOCTOR_INSTRUCTIONS_KEY = 'doctor_instructions';
const DOCTOR_IMAGE_ANALYSIS_ENABLED_KEY = 'doctor_image_analysis_enabled';

type Message = {
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
  answerOptions?: AIAnswerOption[];
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
  // Enhanced AI fields
  emotionalState?: any;
  personalityApplied?: boolean;
  thinkingStages?: string[];
  culturalFactors?: string[];
};

type Tab = 'chat' | 'analysis' | 'providers' | 'prescriptions' | 'appointments' | 'pharmacies';

interface AIDoctorProps {
  onClose?: () => void;
  isEmbedded?: boolean;
  initialMessage?: string;
}

function AIDoctor({ onClose, isEmbedded = false, initialMessage }: AIDoctorProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [input, setInput] = useState('');
  const [inputHeight, setInputHeight] = useState('auto');
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
  
  // Session management
  const [sessionId] = useState(`session_${Date.now()}`);
  
  const medicalReferences = [
    'Base de datos médica', 'Estudios clínicos', 'Literatura médica', 
    'Atlas de dermatología', 'Investigaciones recientes'
  ];
  
  // Mexican family context and quick symptoms
  const [familyMember, setFamilyMember] = useState<string>('myself');
  const [showFamilySetup, setShowFamilySetup] = useState(false);
  
  const MEXICAN_FAMILY_OPTIONS = [
    { value: 'myself', label: 'Para mí' },
    { value: 'spouse', label: 'Para mi esposo/a' },
    { value: 'child', label: 'Para mi hijo/a' },
    { value: 'parent', label: 'Para mis padres' },
    { value: 'family', label: 'Para otro familiar' }
  ];
  
  const MEXICAN_QUICK_SYMPTOMS = [
    { text: 'Tengo diabetes y necesito orientación', icon: '🩺' },
    { text: 'Dolor de cabeza fuerte', icon: '🤕' },
    { text: 'Fiebre y malestar general', icon: '🌡️' },
    { text: 'Presión arterial alta', icon: '❤️' },
    { text: 'Dolor de estómago', icon: '😷' },
    { text: 'Problemas respiratorios', icon: '🤧' }
  ];
  
  // Initialize with enhanced Mexican greeting
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: '¡Hola! Soy Dr. Simeon, tu médico mexicano inteligente. ¿Para quién es la consulta de hoy? Estoy aquí para ayudarte con cualquier problema de salud de tu familia.',
      sender: 'bot',
      timestamp: new Date(),
      personalityApplied: true,
      interactiveOptions: {
        type: 'symptom_category',
        options: ['Para mí', 'Para mi familia', 'Emergencia', 'Consulta general'],
        questionId: 'initial'
      }
    }
  ]);
  
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [pharmacyData, setPharmacyData] = useState<Record<string, any>>({});
  const [currentQuestionId, setCurrentQuestionId] = useState<string>('initial');
  const [questionHistory, setQuestionHistory] = useState<Array<{
    questionId: string;
    question: string;
    answer: string;
  }>>([]);
  
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialMessageSentRef = useRef(false);
  const shouldScrollRef = useRef(false);
  
  // Mobile version will be conditionally rendered in the JSX

  useEffect(() => {
    if (shouldScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      shouldScrollRef.current = false;
    }
  }, [messages]);

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

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() && !isUploading) return;
    
    shouldScrollRef.current = true; // Enable scrolling for user interactions
    
    const userMessageId = Date.now().toString();
    const newUserMessage: Message = { 
      id: userMessageId,
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    const userInput = input;
    setInput('');
    setIsProcessing(true);
    setIsThinking(true);

    // Create a bot message placeholder with enhanced streaming indicators
    const botMessageId = (Date.now() + 1).toString();
    const initialBotMessage: Message = {
      id: botMessageId,
      text: '',
      sender: 'bot',
      timestamp: new Date(),
      isStreaming: true,
      isComplete: false
    };
    
    setMessages(prev => [...prev, initialBotMessage]);

    try {
      // Use unified conversation service for better context tracking
      const unifiedResponse = await unifiedConversationService.processMessage(
        sessionId,
        userInput
      );
      
      // Check if this needs thinking animation
      const conversationAnalysis = ConversationFlowService.analyzeMessage(userInput);
      const needsThinking = ConversationFlowService.needsThinkingAnimation(userInput);
      
      // Update message with unified response
      setIsThinking(false);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMessageId 
            ? {
                ...msg,
                text: unifiedResponse.text,
                answerOptions: unifiedResponse.answerOptions,
                severity: unifiedResponse.severity,
                isEmergency: unifiedResponse.isEmergency,
                suggestedSpecialty: unifiedResponse.suggestedSpecialty,
                suggestedConditions: unifiedResponse.suggestedConditions,
                suggestedMedications: unifiedResponse.suggestedMedications,
                isStreaming: false,
                isComplete: true
              } 
            : msg
        )
      );
      
      // Update severity if provided
      if (unifiedResponse.severity) {
        setSeverityLevel(unifiedResponse.severity);
      }
      
      // Handle any follow-up actions
      if (unifiedResponse.suggestedSpecialty && location) {
        setTimeout(() => {
          findProviders(unifiedResponse.suggestedSpecialty!);
        }, 1000);
      }
      
      if (unifiedResponse.suggestedMedications && unifiedResponse.suggestedMedications.length > 0) {
        setTimeout(() => {
          showGenericPharmacies(unifiedResponse.suggestedMedications!);
        }, 2000);
      }
      
      setIsProcessing(false);
      return;
      
      // Only show thinking animation for medical concerns
      if (!needsThinking) {
        setIsThinking(false);
      }
      
      // Determine conversation complexity for thinking indicators
      const complexity = conversationAnalysis.complexity === 'detailed' ? 'complex' : 
                        conversationAnalysis.complexity === 'moderate' ? 'medium' : 'simple';
      setThinkingComplexity(complexity);

      // Enhanced streaming response handler with thinking indicators
      const streamingHandler: EnhancedStreamingResponseHandler = (streamResponse: EnhancedStreamingAIResponse) => {
        // If we get thinking stages, show them
        if (streamResponse.thinkingStages && streamResponse.thinkingStages.length > 0) {
          setThinkingStages(streamResponse.thinkingStages);
          setCurrentThinkingStage(0);
          
          // Progress through thinking stages
          streamResponse.thinkingStages.forEach((stage, index) => {
            setTimeout(() => {
              setCurrentThinkingStage(index);
            }, index * 1000);
          });
          
          // Stop thinking when stages complete
          setTimeout(() => {
            setIsThinking(false);
          }, streamResponse.thinkingStages.length * 1000);
        }
        
        // Update message with streaming content
        setMessages(prev => {
          const updatedMessages = [...prev];
          const messageIndex = updatedMessages.findIndex(m => m.id === botMessageId);
          
          if (messageIndex !== -1) {
            updatedMessages[messageIndex] = {
              ...updatedMessages[messageIndex],
              text: streamResponse.text,
              severity: streamResponse.severity,
              isEmergency: streamResponse.isEmergency,
              suggestedSpecialty: streamResponse.suggestedSpecialty,
              suggestedConditions: streamResponse.suggestedConditions,
              suggestedMedications: streamResponse.suggestedMedications,
              followUpQuestions: streamResponse.followUpQuestions,
              answerOptions: streamResponse.answerOptions,
              isStreaming: streamResponse.isStreaming,
              isComplete: streamResponse.isComplete,
              // Enhanced fields
              emotionalState: streamResponse.emotionalState,
              personalityApplied: streamResponse.personalityApplied,
              thinkingStages: streamResponse.thinkingStages,
              culturalFactors: streamResponse.culturalFactors
            };
          }
          
          return updatedMessages;
        });
        
        // Update severity if provided
        if (streamResponse.severity) {
          setSeverityLevel(streamResponse.severity);
        }
        
        // If streaming is completed, handle additional features
        if (streamResponse.isComplete) {
          setIsProcessing(false);
          setIsThinking(false);
          
          // Auto-find providers if specialty is suggested
          if (streamResponse.suggestedSpecialty && location) {
            setTimeout(() => {
              findProviders(streamResponse.suggestedSpecialty!);
            }, 1000);
          }
          
          // Show pharmacy recommendations if medications are suggested
          if (streamResponse.suggestedMedications && streamResponse.suggestedMedications.length > 0) {
            setTimeout(() => {
              showGenericPharmacies(streamResponse.suggestedMedications!);
            }, 2000);
          }
        }
      };

      // Optimize context window
      const contextWindow = ContextOptimizationService.optimizeContextWindow(messages);
      const stage = contextWindow.metadata.stage;
      
      // Determine if we should show animations based on stage
      const shouldShowAnim = ContextOptimizationService.shouldShowAnimations(
        messages.length,
        conversationAnalysis.type
      );
      
      // Get optimized instructions
      const systemInstructions = ContextOptimizationService.getSystemInstructions(stage);
      const contextHints = ConversationFlowService.getContextHints(messages);
      
      const queryOptions: EnhancedAIQueryOptions = {
        userMessage: userInput,
        userHistory: contextWindow.messages, // Use optimized context window
        severity: severityLevel,
        location: location || undefined,
        sessionId: sessionId,
        enablePersonality: stage !== 'discovery', // Minimal personality in discovery
        showThinking: shouldShowAnim && needsThinking,
        thinkingComplexity: complexity,
        culturalContext: {
          familyDynamics: 'family-oriented',
          religiousConsiderations: false,
          economicContext: 'medium'
        },
        customInstructions: systemInstructions
      };
      
      // Use enhanced AI service with Mexican personality streaming
      await enhancedAIService.processEnhancedStreamingQuery(queryOptions, streamingHandler);
      
    } catch (error) {
      console.error('Error processing message:', error);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMessageId 
            ? {
                id: botMessageId,
                text: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.',
                sender: 'bot',
                timestamp: new Date(),
                isStreaming: false,
                isComplete: true
              } 
            : msg
        )
      );
      setIsProcessing(false);
      setIsThinking(false);
    }
  }, [input, isUploading, messages, severityLevel, location, sessionId]);

  // Handle initial message from homepage
  useEffect(() => {
    if (initialMessage && initialMessage.trim() && !initialMessageSentRef.current) {
      initialMessageSentRef.current = true;
      
      // Send the initial message after a small delay
      const timer = setTimeout(() => {
        setInput(initialMessage);
        // Trigger the send after setting input
        setTimeout(() => {
          shouldScrollRef.current = true; // Enable scrolling for this interaction
          handleSendMessage();
        }, 100);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [initialMessage]);

  // Initialize Mexican medical knowledge base on component mount - temporarily disabled
  // useEffect(() => {
  //   const initializeKnowledge = async () => {
  //     try {
  //       await mexicanMedicalKnowledgeService.initializeMexicanMedicalKnowledge();
  //       console.log('🇲🇽 Mexican medical knowledge base initialized');
  //     } catch (error) {
  //       console.error('Error initializing Mexican medical knowledge:', error);
  //     }
  //   };
    
  //   initializeKnowledge();
  // }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    if (!file.type.startsWith('image/')) {
      alert('Por favor, sube únicamente archivos de imagen.');
      return;
    }
    
    setIsUploading(true);
    
    try {
      const scrubbedFile = await EncryptionService.scrubImageMetadata(file);
      
      const imageUrl = URL.createObjectURL(scrubbedFile);
      setCurrentAnalysisImage(imageUrl);
      
      const imageMessageId = Date.now().toString();
      setMessages(prev => [...prev, {
        id: imageMessageId,
        text: 'He subido una imagen para análisis médico.',
        sender: 'user',
        timestamp: new Date(),
        containsImage: true,
        imageUrl
      }]);
      
      setImageAnalysisStage('initial');
      
      setTimeout(() => {
        setConfidenceStatus('considering');
        setConfidenceLevel(10);
      }, 100);
      
      setTimeout(() => setImageAnalysisStage('scanning'), 500);
      
      setTimeout(() => {
        setConfidenceLevel(35);
      }, 2000);
      
      setTimeout(() => setImageAnalysisStage('identifying'), 3000);
      
      setTimeout(() => {
        setConfidenceLevel(60);
      }, 4000);
      
      setTimeout(() => setImageAnalysisStage('comparing'), 5500);
      
      const response = await enhancedAIService.analyzeImage(imageUrl);
      
      setImageAnalysisStage('concluding');
      
      setTimeout(() => {
        setConfidenceStatus('confident');
        setConfidenceLevel(95);
      }, 6000);
      
      setTimeout(() => {
        setImageAnalysisStage(null);
        setCurrentAnalysisImage(null);
        
        if (response.severity) {
          setSeverityLevel(response.severity);
        }
        
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: response.text,
          sender: 'bot',
          timestamp: new Date(),
          severity: response.severity,
          imageAnalysis: response.imageAnalysis,
          suggestedSpecialty: response.suggestedSpecialty,
          suggestedConditions: response.suggestedConditions || ['Dermatitis', 'Alergia cutánea', 'Infección leve'],
          followUpQuestions: response.followUpQuestions || [
            '¿Desde cuándo tiene estos síntomas?',
            '¿Ha notado algún cambio en los últimos días?',
            '¿Ha usado algún medicamento para esto?'
          ]
        }]);
      }, 7500);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      
      setImageAnalysisStage(null);
      setCurrentAnalysisImage(null);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hubo un error al procesar tu imagen. Por favor, intenta nuevamente.',
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleMicClick = async () => {
    // Check if speech recognition is supported
    if (!SpeechRecognitionService.isSupported()) {
      alert('Tu navegador no soporta reconocimiento de voz. Por favor, usa Chrome, Edge o Safari.');
      return;
    }
    
    const speechService = getSpeechRecognitionService();
    
    if (isRecording) {
      speechService.stop();
      setIsRecording(false);
      return;
    }
    
    try {
      // Set up callbacks
      speechService.onResult((transcript, isFinal) => {
        if (isFinal) {
          // Set the transcribed text in the input field
          setInput(transcript);
          // Automatically send the message
          setTimeout(() => {
            handleSendMessage();
          }, 500);
        } else {
          // Show interim results in the input field
          setInput(transcript);
        }
      });
      
      speechService.onError((error) => {
        console.error('Speech recognition error:', error);
        alert(error);
        setIsRecording(false);
      });
      
      speechService.onStatusChange((listening) => {
        setIsRecording(listening);
      });
      
      // Start listening
      await speechService.start();
      setIsRecording(true);
      
      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (speechService.getIsListening()) {
          speechService.stop();
        }
      }, 30000);
      
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      alert('No se pudo iniciar el reconocimiento de voz. Por favor, verifica los permisos del micrófono.');
      setIsRecording(false);
    }
  };
  
  const findProviders = async (specialty: string) => {
    if (!location) {
      // Default to Mexico City center coordinates if location is not available
      const defaultLocation = {
        latitude: 19.4326,
        longitude: -99.1332
      };
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            setLocation(userLocation);
            fetchProviders(specialty, userLocation);
          },
          (error) => {
            console.log('Error getting location:', error);
            setLocation(defaultLocation);
            fetchProviders(specialty, defaultLocation);
          }
        );
      } else {
        setLocation(defaultLocation);
        fetchProviders(specialty, defaultLocation);
      }
    } else {
      fetchProviders(specialty, location);
    }
  };
  
  const fetchProviders = async (specialty: string, loc: { latitude: number; longitude: number }) => {
    try {
      const providers = await enhancedAIService.findNearbyProviders(specialty, loc);
      setSelectedProviders(providers);
      setActiveTab('providers');
    } catch (error) {
      console.error('Error finding providers:', error);
      alert('No se pudieron encontrar proveedores cercanos. Por favor, intenta nuevamente.');
    }
  };
  
  const scheduleAppointment = async (providerId: string) => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const appointment = await enhancedAIService.scheduleAppointment(
        providerId,
        tomorrow.toISOString().split('T')[0],
        '10:00',
        'Consulta general'
      );
      
      setAppointments(prev => [...prev, appointment]);
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'He programado una cita para ti mañana a las 10:00 AM.',
        sender: 'bot',
        timestamp: new Date()
      }]);
      
      setActiveTab('appointments');
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      alert('No se pudo programar la cita. Por favor, intenta nuevamente.');
    }
  };
  
  const findPharmacies = async (medications: string[] = []) => {
    if (!location) {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'bot',
        text: '¿Me permites acceder a tu ubicación para encontrar farmacias cercanas? Esto nos ayudará a mostrarte opciones más relevantes en tu área.',
        timestamp: new Date(),
        interactiveOptions: {
          type: 'yes_no',
          options: ['Permitir', 'No permitir'],
          questionId: 'location_permission'
        }
      };
      setMessages(prev => [...prev, newMessage]);
      
      const handleLocationPermission = (option: string) => {
        if (option === 'Permitir') {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              });
              
              const confirmMessage: Message = {
                id: Date.now().toString(),
                sender: 'bot',
                text: 'Gracias por compartir tu ubicación. Buscando farmacias cercanas...',
                timestamp: new Date()
              };
              setMessages(prev => [...prev, confirmMessage]);
              
              setTimeout(() => findPharmacies(medications), 1000);
            },
            (error) => {
              console.error('Geolocation error:', error);
              
              const errorMessage: Message = {
                id: Date.now().toString(),
                sender: 'bot',
                text: 'No fue posible acceder a tu ubicación. Te mostraré farmacias generales sin personalización por ubicación.',
                timestamp: new Date()
              };
              setMessages(prev => [...prev, errorMessage]);
              
              showGenericPharmacies(medications);
            }
          );
        } else {
          const denyMessage: Message = {
            id: Date.now().toString(),
            sender: 'bot',
            text: 'Entiendo. Te mostraré farmacias generales sin personalización por ubicación.',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, denyMessage]);
          
          showGenericPharmacies(medications);
        }
      };
      
      const handleNextInteraction = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.hasAttribute('data-option')) {
          const option = target.getAttribute('data-option');
          if (option === 'Permitir' || option === 'No permitir') {
            handleLocationPermission(option);
            document.removeEventListener('click', handleNextInteraction);
          }
        }
      };
      
      document.addEventListener('click', handleNextInteraction);
      return;
    }
    
    try {
      const pharmacyList = await enhancedAIService.getPharmacyRecommendations(medications, location);
      setPharmacies(pharmacyList);
      setActiveTab('pharmacies');
    } catch (error) {
      console.error('Error finding pharmacies:', error);
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'No se pudieron encontrar farmacias cercanas. Por favor, intenta nuevamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };
  
  const showGenericPharmacies = (medications: string[] = []) => {
    const sampleProducts = [
      {
        id: '1',
        name: 'Paracetamol 500mg',
        description: 'Analgésico y antipirético para aliviar el dolor y reducir la fiebre.',
        price: '$85.00 MXN',
        image: 'https://www.farmaciasdelahorro.com.mx/wcsstore/FASA/images/productos/large/300810_l.jpg',
        sponsored: true,
        pharmacyId: 'fda',
        availableAt: ['fda', 'similares']
      },
      {
        id: '2',
        name: 'Ibuprofeno 400mg',
        description: 'Antiinflamatorio no esteroideo (AINE) para reducir el dolor y la inflamación.',
        price: '$120.00 MXN',
        image: 'https://www.farmaciasdelahorro.com.mx/wcsstore/FASA/images/productos/large/302016_l.jpg',
        sponsored: false,
        pharmacyId: 'similares',
        availableAt: ['similares', 'fda']
      },
      {
        id: '3',
        name: 'Loratadina 10mg',
        description: 'Antihistamínico para aliviar los síntomas de alergias como congestión nasal y estornudos.',
        price: '$95.00 MXN',
        image: 'https://www.farmaciasdelahorro.com.mx/wcsstore/FASA/images/productos/large/302810_l.jpg',
        sponsored: false,
        pharmacyId: 'fda',
        availableAt: ['fda']
      }
    ];
    
    const pharmacyData = {
      'fda': {
        id: 'fda',
        name: 'Farmacia del Ahorro',
        address: 'Múltiples sucursales en México',
        distance: '1.2 km',
        logo: 'https://www.farmaciasdelahorro.com.mx/static/version1714504312/frontend/FDA/fda/es_MX/images/logo.svg'
      },
      'similares': {
        id: 'similares',
        name: 'Farmacias Similares',
        address: 'Múltiples sucursales en México',
        distance: '0.8 km',
        logo: 'https://www.farmaciasdesimilares.com/static/media/logo-similares.a7e1b5f3.svg'
      }
    };
    
    setProducts(sampleProducts);
    setPharmacyData(pharmacyData);
    
    const recommendationMessage: Message = {
      id: Date.now().toString(),
      sender: 'bot',
      text: 'He encontrado algunos medicamentos que podrían ayudarte. Puedes verlos en la pestaña de Farmacias.',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, recommendationMessage]);
    
    setActiveTab('pharmacies');
  };
  
  const getSeverityColor = () => {
    if (severityLevel < 30) return 'bg-brand-jade-500';
    if (severityLevel < 60) return 'bg-yellow-500';
    if (severityLevel < 80) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  const getSeverityText = () => {
    if (severityLevel < 30) return 'Bajo riesgo';
    if (severityLevel < 60) return 'Atención recomendada';
    if (severityLevel < 80) return 'Urgente';
    return 'Emergencia';
  };

  const handleOptionSelect = (option: string, questionId: string) => {
    const userMessageId = Date.now().toString();
    const newUserMessage: Message = { 
      id: userMessageId,
      text: option,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsProcessing(true);
    
    if (questionId === 'pharmacy_recommendation' && option === 'Ver medicamentos recomendados') {
      const lastMessageWithMedications = [...messages].reverse().find(m => 
        m.suggestedMedications && m.suggestedMedications.length > 0
      );

      if (lastMessageWithMedications?.suggestedMedications) {
        findPharmacies(lastMessageWithMedications.suggestedMedications);
        setIsProcessing(false);
        return;
      }

      findPharmacies([]);
      setIsProcessing(false);
      return;
    }
    if (questionId === 'doctor_referral') {
      if (option === 'Consultar con médico local') {
        const lastMsg = [...messages].reverse().find(m => m.suggestedSpecialty);
        if (lastMsg?.suggestedSpecialty) {
          findProviders(lastMsg.suggestedSpecialty);
        }
      }
      setIsProcessing(false);
      return;
    }
    
    setQuestionHistory(prev => [...prev, { questionId, question: questionId, answer: option }]);
    
    setTimeout(() => {
      let nextQuestion: Message = {
        id: (Date.now() + 1).toString(),
        text: '',
        sender: 'bot',
        timestamp: new Date()
      };
      
      if (questionId === 'initial') {
        if (option === 'Dolor') {
          nextQuestion.text = '¿Cuánto tiempo has tenido este dolor?';
          nextQuestion.interactiveOptions = {
            type: 'symptom_duration',
            options: ['Menos de 24 horas', '1-3 días', '1-2 semanas', 'Más tiempo'],
            questionId: 'duration_pain'
          };
          setCurrentQuestionId('duration_pain');
        } else if (option === 'Fiebre') {
          nextQuestion.text = '¿Cuánto tiempo has tenido fiebre?';
          nextQuestion.interactiveOptions = {
            type: 'symptom_duration',
            options: ['Menos de 24 horas', '1-3 días', '1-2 semanas', 'Más tiempo'],
            questionId: 'duration_fever'
          };
          setCurrentQuestionId('duration_fever');
        } else if (option === 'Digestivo') {
          nextQuestion.text = '¿Qué síntomas digestivos estás experimentando?';
          nextQuestion.interactiveOptions = {
            type: 'symptom_category',
            options: ['Náuseas', 'Vómitos', 'Diarrea', 'Estreñimiento', 'Dolor abdominal', 'Otro'],
            questionId: 'digestive_symptoms'
          };
          setCurrentQuestionId('digestive_symptoms');
        } else {
          nextQuestion.text = `Cuéntame más sobre tus síntomas de ${option.toLowerCase()}. ¿Cuándo comenzaron?`;
          nextQuestion.followUpQuestions = [
            'Comenzaron hace unos días',
            'Comenzaron hoy',
            'Los tengo desde hace semanas'
          ];
        }
      } else if (questionId.startsWith('duration_')) {
        const symptomType = questionId.split('_')[1];
        nextQuestion.text = `¿Cómo calificarías la intensidad de tu ${symptomType === 'pain' ? 'dolor' : 'fiebre'}?`;
        nextQuestion.interactiveOptions = {
          type: 'symptom_severity',
          options: ['Leve', 'Moderada', 'Severa'],
          questionId: `severity_${symptomType}`
        };
        setCurrentQuestionId(`severity_${symptomType}`);
      } else if (questionId.startsWith('severity_')) {
        const symptomType = questionId.split('_')[1];
        if (symptomType === 'pain') {
          nextQuestion.text = '¿En qué parte del cuerpo sientes el dolor?';
          nextQuestion.followUpQuestions = [
            'Cabeza',
            'Pecho',
            'Abdomen',
            'Espalda',
            'Extremidades'
          ];
        } else if (symptomType === 'fever') {
          nextQuestion.text = '¿Has tomado tu temperatura? ¿Qué otros síntomas acompañan la fiebre?';
          nextQuestion.followUpQuestions = [
            'Tengo escalofríos',
            'Tengo dolor de cabeza',
            'Tengo dolor muscular',
            'Tengo tos o congestión'
          ];
        }
        
        if (option === 'Moderada' || option === 'Severa') {
          if (symptomType === 'pain') {
            nextQuestion.suggestedMedications = ['paracetamol', 'ibuprofeno'];
          } else if (symptomType === 'fever') {
            nextQuestion.suggestedMedications = ['paracetamol'];
          }
        }
      }
      
      setMessages(prev => [...prev, nextQuestion]);
      setIsProcessing(false);
    }, 1000);
  };
  
  const handleGoBack = () => {
    if (questionHistory.length > 1) {
      const newHistory = [...questionHistory];
      newHistory.pop();
      setQuestionHistory(newHistory);
      setCurrentQuestionId(newHistory[newHistory.length - 1].questionId);
      
      setMessages(prev => prev.slice(0, -2));
    }
  };

  const handleAnswerOptionClick = async (answerOption: AIAnswerOption) => {
    // Handle special case for free text input
    if (answerOption.value === 'free_text' || answerOption.value === 'OPEN_TEXT_INPUT') {
      // Just focus the input field and let user type freely
      const inputElement = document.querySelector('.chat-input') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
      return;
    }
    
    // Process through unified service with selected option
    shouldScrollRef.current = true;
    setIsProcessing(true);
    
    const userMessageId = Date.now().toString();
    const newUserMessage: Message = { 
      id: userMessageId,
      text: answerOption.text, // Use the display text
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    
    // Create bot message placeholder
    const botMessageId = (Date.now() + 1).toString();
    const initialBotMessage: Message = {
      id: botMessageId,
      text: '',
      sender: 'bot',
      timestamp: new Date(),
      isStreaming: true,
      isComplete: false
    };
    
    setMessages(prev => [...prev, initialBotMessage]);
    
    try {
      // Process with unified service, passing the selected option
      const unifiedResponse = await unifiedConversationService.processMessage(
        sessionId,
        answerOption.text,
        answerOption.value
      );
      
      // Update bot message with response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMessageId 
            ? {
                ...msg,
                text: unifiedResponse.text,
                answerOptions: unifiedResponse.answerOptions,
                severity: unifiedResponse.severity,
                isEmergency: unifiedResponse.isEmergency,
                suggestedSpecialty: unifiedResponse.suggestedSpecialty,
                suggestedConditions: unifiedResponse.suggestedConditions,
                suggestedMedications: unifiedResponse.suggestedMedications,
                isStreaming: false,
                isComplete: true
              } 
            : msg
        )
      );
      
      setIsProcessing(false);
    } catch (error) {
      console.error('Error processing answer option:', error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMessageId 
            ? {
                ...msg,
                text: 'Lo siento, hubo un error al procesar tu respuesta. Por favor, intenta de nuevo.',
                isStreaming: false,
                isComplete: true
              } 
            : msg
        )
      );
      setIsProcessing(false);
    }
  };

  const MessageComponent = memo(({ message }: { message: Message }) => {
    return (
      <EnhancedChatBubble
        message={message}
        onOptionSelect={(option, questionId) => handleOptionSelect(option, questionId)}
        interactiveOptions={message.interactiveOptions}
        onFollowUpClick={(question) => {
          setInput(question);
          shouldScrollRef.current = true; // Enable scrolling for follow-up interactions
          setTimeout(() => handleSendMessage(), 100);
        }}
        onGoBack={handleGoBack}
        onAnswerOptionClick={handleAnswerOptionClick}
        showGoBack={questionHistory.length > 1 && message.sender === 'bot'}
      />
    );
  });

  const renderTabContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {(() => {
            switch (activeTab) {
              case 'chat':
                return (
                  <div className="flex flex-col h-full relative">
                    {/* Chat messages - with proper bottom padding to account for fixed input */}
                    <div className="chat-messages-container flex-1 overflow-y-auto" style={{ paddingBottom: '200px' }}>
                      <div className="p-4 space-y-4">
                        {messages.map((message) => (
                          <MessageComponent key={message.id} message={message} />
                        ))}
                        
                        {/* Enhanced AI Thinking Component */}
                        {isThinking && thinkingStages.length > 0 && (
                          <EnhancedAIThinking
                            stages={thinkingStages}
                            currentStage={currentThinkingStage}
                            isActive={isThinking}
                            complexity={thinkingComplexity}
                            mexicanContext={true}
                          />
                        )}
                        
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
                    
                    {/* Image Analysis Visualization */}
                    {imageAnalysisStage && currentAnalysisImage && (
                      <motion.div 
                        className="px-4 pb-4 fixed bottom-32 left-0 right-0 z-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <div className="bg-white rounded-lg shadow-md p-4 border border-brand-jade-100 mx-4">
                          <h3 className="text-lg font-medium text-gray-800 mb-3">Análisis de Imagen</h3>
                          <ImageAnalysisVisual 
                            imageSrc={currentAnalysisImage} 
                            analysisStage={imageAnalysisStage} 
                          />
                          
                          {/* Confidence Visualizer */}
                          <div className="mt-4">
                            <ConfidenceVisualizer 
                              confidence={confidenceLevel}
                              status={confidenceStatus}
                              references={medicalReferences}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Family Member Selector */}
                    {showFamilySetup && (
                      <div className="bg-[#D0F0EF] border border-[#006D77] rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-[#006D77] mb-3">¿Para quién es la consulta?</h4>
                        <div className="flex flex-wrap gap-2">
                          {MEXICAN_FAMILY_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setFamilyMember(option.value);
                                setShowFamilySetup(false);
                              }}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                familyMember === option.value
                                  ? 'bg-[#006D77] text-white'
                                  : 'bg-white text-[#006D77] hover:bg-[#006D77]/10'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Quick Mexican Symptoms */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-700 text-sm">Consultas rápidas:</h4>
                        <button
                          onClick={() => setShowFamilySetup(!showFamilySetup)}
                          className="text-[#006D77] text-sm font-medium flex items-center hover:underline"
                        >
                          <User className="w-4 h-4 mr-1" />
                          {familyMember === 'myself' ? 'Para mí' : MEXICAN_FAMILY_OPTIONS.find(o => o.value === familyMember)?.label}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {MEXICAN_QUICK_SYMPTOMS.map((symptom, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              const familyContext = familyMember === 'myself' ? '' : ` (${MEXICAN_FAMILY_OPTIONS.find(o => o.value === familyMember)?.label})`;
                              setInput(symptom.text + familyContext);
                              setTimeout(() => handleSendMessage(), 100);
                            }}
                            className="bg-white border border-[#006D77]/30 hover:border-[#006D77] hover:bg-[#D0F0EF]/30 rounded-lg px-3 py-2 text-sm transition-all flex items-center space-x-2"
                          >
                            <span>{symptom.icon}</span>
                            <span className="text-[#006D77]">{symptom.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Input area at bottom of viewport */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-20">
                      <div className="max-w-screen-xl mx-auto">
                        {/* Emergency Contact Bar */}
                        <div className="flex items-center justify-center mb-3 text-sm">
                          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-1 flex items-center">
                            <Phone className="w-4 h-4 text-red-600 mr-2" />
                            <span className="text-red-700 font-medium">Emergencia: 911 • Cruz Roja: 065</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button 
                            onClick={handleMicClick}
                            className={`p-3 rounded-full transition-all ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-500 hover:text-[#006D77] hover:bg-[#D0F0EF]'}`}
                            aria-label={isRecording ? "Detener grabación" : "Usar micrófono"}
                            title={isRecording ? "Grabando... Haz clic para detener" : "Grabar mensaje de voz"}
                          >
                            <Mic size={20} />
                          </button>
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-3 rounded-full ${isUploading ? 'text-[#006D77] bg-[#D0F0EF]' : 'text-gray-500 hover:text-[#006D77] hover:bg-[#D0F0EF]'}`}
                            aria-label="Subir imagen"
                          >
                            <Image size={20} />
                          </button>
                          <a
                            href="https://wa.me/+525512345678?text=Hola%20Dr.%20Simeon%2C%20necesito%20ayuda%20médica%20urgente"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-full text-[#25D366] hover:bg-green-50"
                            aria-label="WhatsApp directo"
                          >
                            <Phone size={20} />
                          </a>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <div className="flex-1 relative">
                            <textarea
                              value={input}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                setInput(newValue);
                                // Auto-resize textarea
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage();
                                }
                              }}
                              placeholder="Cuéntame qué te duele o preocupa... (Presiona Enter para enviar, Shift+Enter para nueva línea)"
                              className="chat-textarea w-full border-2 border-[#006D77]/30 focus:border-[#006D77] rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#006D77]/20"
                              disabled={isProcessing}
                              style={{ minHeight: '56px', maxHeight: '120px' }}
                              rows={1}
                            />
                            {input.length > 0 && (
                              <div className="absolute right-3 bottom-2 text-xs text-[#006D77] opacity-70" style={{ pointerEvents: 'none' }}>
                                {input.length} caracteres
                              </div>
                            )}
                          </div>
                          <button 
                            onClick={handleSendMessage}
                            disabled={(!input.trim() && !isUploading) || isProcessing}
                            className={`p-3 rounded-full transition-all ${
                              (!input.trim() && !isUploading) || isProcessing
                                ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
                                : 'text-white bg-[#006D77] hover:bg-[#005B66] shadow-md hover:shadow-lg'
                            }`}
                            aria-label="Enviar mensaje"
                          >
                            <Send size={20} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Stable containers for status indicators */}
                      <div className="status-indicators-container max-w-screen-xl mx-auto" style={{ height: isRecording || isProcessing ? 'auto' : '0', overflow: 'hidden', transition: 'height 0.3s ease' }}>
                        {isRecording && (
                          <div className="mt-2 text-center text-sm text-red-600" style={{ transform: 'translateZ(0)' }}>
                            <span className="inline-block">●</span> Escuchando... Habla ahora
                          </div>
                        )}
                        {isProcessing && (
                          <div className="mt-2 text-center text-sm text-brand-jade-600" style={{ transform: 'translateZ(0)' }}>
                            <span className="inline-block">⟳</span> Procesando tu consulta...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
                
              case 'analysis':
                return (
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Análisis de Síntomas</h3>
                    
                    {/* Show current analysis visualizations if active */}
                    {currentAnalysisImage && imageAnalysisStage && (
                      <div className="space-y-4 mb-6">
                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-2">Análisis en progreso:</h4>
                          <div className="mb-4">
                            <ImageAnalysisVisual 
                              imageSrc={currentAnalysisImage} 
                              analysisStage={imageAnalysisStage}
                            />
                          </div>
                          
                          <div className="mt-4">
                            <ConfidenceVisualizer 
                              confidence={confidenceLevel}
                              status={confidenceStatus}
                              references={medicalReferences}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {messages.filter(m => m.suggestedConditions && m.suggestedConditions.length > 0).length > 0 ? (
                      <div className="space-y-6">
                        {messages
                          .filter(m => m.suggestedConditions && m.suggestedConditions.length > 0)
                          .map((message, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                              <h4 className="font-medium text-gray-900 mb-2">Posibles condiciones:</h4>
                              <ul className="space-y-2">
                                {message.suggestedConditions!.map((condition, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="bg-brand-jade-100 text-brand-jade-800 text-xs font-medium px-2 py-0.5 rounded-full mr-2 mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <div>
                                      <p className="font-medium">{condition}</p>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                              
                              {message.suggestedSpecialty && (
                                <div className="mt-4">
                                  <p className="text-sm text-gray-600">Especialidad recomendada:</p>
                                  <p className="font-medium text-brand-jade-700">{message.suggestedSpecialty}</p>
                                  <button
                                    onClick={() => findProviders(message.suggestedSpecialty!)}
                                    className="mt-2 text-sm bg-brand-jade-600 text-white px-3 py-1 rounded-md hover:bg-brand-jade-700 transition-colors flex items-center"
                                  >
                                    <MapPin size={14} className="mr-1" />
                                    Buscar especialistas cercanos
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-gray-500">
                          Aún no hay análisis disponibles. Describe tus síntomas en el chat para recibir un análisis.
                        </p>
                      </div>
                    )}
                  </div>
                );
                
              case 'providers':
                return (
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Proveedores de Salud Cercanos</h3>
                    
                    {selectedProviders.length > 0 ? (
                      <div className="space-y-4">
                        {selectedProviders.map((provider, index) => (
                          <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                            <div className="flex items-start">
                              <div className="w-16 h-16 bg-gray-200 rounded-full mr-4 flex-shrink-0"></div>
                              <div>
                                <h4 className="font-medium text-lg">{provider.name || `Dr. Ejemplo ${index + 1}`}</h4>
                                <p className="text-brand-jade-700">{provider.specialty || 'Especialidad'}</p>
                                <p className="text-sm text-gray-600 mt-1">{provider.address || 'Dirección del consultorio'}</p>
                                <div className="mt-3 flex space-x-2">
                                  <button
                                    onClick={() => scheduleAppointment(provider.id || `provider-${index}`)}
                                    className="text-sm bg-brand-jade-600 text-white px-3 py-1 rounded-md hover:bg-brand-jade-700 transition-colors flex items-center"
                                  >
                                    <Calendar size={14} className="mr-1" />
                                    Agendar cita
                                  </button>
                                  <button
                                    className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors"
                                  >
                                    Ver perfil
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-gray-500">
                          No hay proveedores seleccionados. Usa el chat para recibir recomendaciones de especialistas.
                        </p>
                      </div>
                    )}
                  </div>
                );
                
              case 'appointments':
                return (
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Mis Citas</h3>
                    
                    {appointments.length > 0 ? (
                      <div className="space-y-4">
                        {appointments.map((_, index) => (
                          <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-gray-500">Próxima cita</p>
                                <h4 className="font-medium text-lg">Dr. Ejemplo</h4>
                                <p className="text-brand-jade-700">Consulta general</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {new Date().toLocaleDateString()} - 10:00 AM
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <button className="text-sm bg-brand-jade-100 text-brand-jade-700 px-3 py-1 rounded-md hover:bg-brand-jade-200 transition-colors">
                                  Modificar
                                </button>
                                <button className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-md hover:bg-red-200 transition-colors">
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-gray-500">
                          No tienes citas programadas. Usa el chat para recibir recomendaciones y agendar una cita.
                        </p>
                      </div>
                    )}
                  </div>
                );
                
              case 'prescriptions':
                return (
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Mis Recetas</h3>
                    
                    {prescriptions.length > 0 ? (
                      <div className="space-y-4">
                        {prescriptions.map((_, index) => (
                          <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-lg">Receta #{index + 1}</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  Emitida: {new Date().toLocaleDateString()}
                                </p>
                                <div className="mt-2">
                                  <p className="font-medium">Medicamentos:</p>
                                  <ul className="text-sm text-gray-700 mt-1 space-y-1">
                                    <li>• Medicamento de ejemplo 1</li>
                                    <li>• Medicamento de ejemplo 2</li>
                                  </ul>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button className="text-sm bg-brand-jade-100 text-brand-jade-700 px-3 py-1 rounded-md hover:bg-brand-jade-200 transition-colors flex items-center">
                                  <FileText size={14} className="mr-1" />
                                  Descargar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-gray-500">
                          No tienes recetas digitales. Las recetas aparecerán aquí después de tus consultas médicas.
                        </p>
                      </div>
                    )}
                  </div>
                );
                
              case 'pharmacies':
                return (
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Farmacias y Medicamentos</h3>
                    
                    {products.length > 0 ? (
                      <ProductRecommendation 
                        products={products}
                        pharmacies={pharmacyData}
                        onPharmacyClick={(pharmacyId) => {
                          console.log('Pharmacy clicked:', pharmacyId);
                        }}
                        onProductClick={(productId) => {
                          console.log('Product clicked:', productId);
                        }}
                      />
                    ) : pharmacies.length > 0 ? (
                      <div className="space-y-4">
                        {pharmacies.map((pharmacy, index) => (
                          <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                            <div className="flex items-start">
                              <div className="w-16 h-16 bg-brand-jade-100 rounded-full mr-4 flex-shrink-0 flex items-center justify-center">
                                <svg className="w-8 h-8 text-brand-jade-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                              <div>
                                <div className="flex items-center">
                                  <h4 className="font-medium text-lg">{pharmacy.name || `Farmacia ${index + 1}`}</h4>
                                  {pharmacy.isSponsored && (
                                    <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                                      Patrocinado
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{pharmacy.address || 'Dirección de la farmacia'}</p>
                                <p className="text-sm text-gray-600">
                                  {pharmacy.distance ? `${(pharmacy.distance / 1000).toFixed(1)} km de distancia` : 'Distancia no disponible'}
                                </p>
                                
                                {pharmacy.available_medications && pharmacy.available_medications.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-sm font-medium text-gray-700">Medicamentos disponibles:</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {pharmacy.available_medications.slice(0, 3).map((med: string, idx: number) => (
                                        <span key={idx} className="bg-brand-jade-50 text-brand-jade-700 text-xs px-2 py-0.5 rounded-full">
                                          {med}
                                        </span>
                                      ))}
                                      {pharmacy.available_medications.length > 3 && (
                                        <span className="text-xs text-gray-500">+{pharmacy.available_medications.length - 3} más</span>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="mt-3 flex space-x-2">
                                  <a 
                                    href={`https://maps.google.com/?q=${pharmacy.address}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm bg-brand-jade-600 text-white px-3 py-1 rounded-md hover:bg-brand-jade-700 transition-colors flex items-center"
                                  >
                                    <MapPin size={14} className="mr-1" />
                                    Cómo llegar
                                  </a>
                                  <button className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors">
                                    Llamar
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-gray-500">
                          No hay farmacias disponibles. Usa el chat para recibir recomendaciones de medicamentos y encontrar farmacias cercanas.
                        </p>
                      </div>
                    )}
                  </div>
                );
                
              default:
                return null;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  if (isEmbedded) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-teal-gradient p-4 text-white">
          <h3 className="font-semibold text-lg">Doctor IA</h3>
        </div>
        {renderTabContent()}
      </div>
    );
  }

  // Conditionally render mobile or desktop version
  if (isMobile && !isEmbedded) {
    return <AIDoctorMobile initialMessage={initialMessage} onBack={onClose} />;
  }

  // Main layout that works within DoctorLayout (not full-screen)
  return (
    <div className="h-full flex flex-col bg-white relative">      
      {/* Tab navigation for desktop */}
      <div className="border-b border-gray-200 bg-white px-6">
        <nav className="flex space-x-8">
          {[
            { id: 'chat', icon: MessageSquare, label: 'Chat Médico' },
            { id: 'analysis', icon: Activity, label: 'Análisis' },
            { id: 'providers', icon: Users, label: 'Doctores' },
            { id: 'appointments', icon: Calendar, label: 'Citas' },
            { id: 'prescriptions', icon: Pill, label: 'Recetas' },
            { id: 'pharmacies', icon: ShoppingBag, label: 'Farmacias' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as Tab)}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id 
                  ? 'border-brand-jade-500 text-brand-jade-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default AIDoctor;
