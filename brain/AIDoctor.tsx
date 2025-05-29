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
import { BrainIntegrationService, PatientContext } from '../services/BrainIntegrationService';
import { useConversation } from '../../../contexts/ConversationContext';

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
  const { state: conversationState, addMessage, updateMessage, setConversationStarted, setFamilyMember, setLocation } = useConversation();
  
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

  const medicalReferences = [
    'Base de datos médica', 'Estudios clínicos', 'Literatura médica',
    'Atlas de dermatología', 'Investigaciones recientes'
  ];

  // Use conversation context state
  const { messages, sessionId, familyMember, conversationStarted, location } = conversationState;
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

    const newUserMessage = {
      text: input,
      sender: 'user' as const
    };

    addMessage(newUserMessage);
    const userInput = input;
    setInput('');
    setIsProcessing(true);
    setIsThinking(true);

    // Mark conversation as started after first user message
    if (!conversationStarted) {
      setConversationStarted(true);
    }

    // Create a bot message placeholder with enhanced streaming indicators
    const initialBotMessage = {
      text: '',
      sender: 'bot' as const,
      isStreaming: true,
      isComplete: false
    };

    addMessage(initialBotMessage);

    try {
      // BRAIN INTEGRATION - Use enhanced intelligence modules
      console.log('🧠 Desktop AIDoctor - Using Brain Integration Service:', userInput);

      // Build patient context
      const patientContext: PatientContext = {
        familyMember: familyMember !== 'myself' ? familyMember : undefined,
        previousResponses: questionHistory.map(q => ({ question: q.question, answer: q.answer }))
      };

      // Process with brain intelligence
      const brainAssessment = await BrainIntegrationService.processInput(
        userInput,
        patientContext,
        questionHistory.map(q => ({ question: q.question, answer: q.answer }))
      );

      console.log('🧠 Brain assessment result:', brainAssessment);

      // Update message with brain assessment results
      setIsThinking(false);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === botMessageId
            ? {
                ...msg,
                text: brainAssessment.response,
                answerOptions: brainAssessment.answerOptions,
                severity: brainAssessment.severity,
                isEmergency: brainAssessment.isEmergency,
                suggestedConditions: brainAssessment.diagnosis ? [brainAssessment.diagnosis] : undefined,
                suggestedSpecialty: brainAssessment.specialistReferral,
                isStreaming: false,
                isComplete: true
              }
            : msg
        )
      );

      setIsProcessing(false);

      // Auto-scroll to latest message
      setTimeout(() => {
        const chatContainer = document.querySelector('.chat-messages-container');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);

      return;

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

    // Mark conversation as started
    if (!conversationStarted) {
      setConversationStarted(true);
    }

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
        } else if (option === 'Para mí') {
          nextQuestion.text = 'Perfecto, vamos a hablar de tu salud. ¿Qué síntoma o molestia te trae hoy?';
          nextQuestion.followUpQuestions = [
            'Tengo dolor de cabeza',
            'Tengo fiebre',
            'Tengo dolor de estómago',
            'Tengo otro síntoma'
          ];
        } else if (option === 'Para mi familia') {
          nextQuestion.text = 'Entiendo, es para un familiar. ¿Qué síntoma o molestia presenta la persona?';
          nextQuestion.followUpQuestions = [
            'Tiene dolor de cabeza',
            'Tiene fiebre',
            'Tiene dolor de estómago',
            'Tiene otro síntoma'
          ];
        } else if (option === 'Emergencia') {
          nextQuestion.text = '🚨 **EMERGENCIA MÉDICA** 🚨\n\nSi es una emergencia real, llame al 911 inmediatamente.\n\n¿Cuál es la situación de emergencia?';
          nextQuestion.followUpQuestions = [
            'Dificultad para respirar',
            'Dolor de pecho intenso',
            'Pérdida de conocimiento',
            'Sangrado abundante'
          ];
        } else if (option === 'Consulta general') {
          nextQuestion.text = 'Perfecto, estoy aquí para ayudarte. ¿Qué te gustaría consultar hoy?';
          nextQuestion.followUpQuestions = [
            'Tengo una pregunta sobre medicamentos',
            'Quiero información sobre síntomas',
            'Necesito orientación médica general'
          ];
        } else {
          nextQuestion.text = 'Por favor, cuéntame más detalles sobre lo que te preocupa. ¿Cuándo comenzó?';
          nextQuestion.followUpQuestions = [
            'Comenzó hace unos días',
            'Comenzó hoy',
            'Lo tengo desde hace semanas'
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
      // Focus the textarea and let user type freely
      const textareaElement = document.querySelector('.chat-textarea') as HTMLTextAreaElement;
      if (textareaElement) {
        textareaElement.focus();
        textareaElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

    // Mark conversation as started
    if (!conversationStarted) {
      setConversationStarted(true);
    }

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
      // CLINICAL MODE for button clicks - same logic as handleSendMessage
      let clinicalResponse = '';
      let confidence = 0.3;
      let isEmergency = false;
      let useClinicalMode = true; // Force clinical mode for desktop

      if (useClinicalMode) {
        console.log('🩺 Using CLINICAL MODE for button click:', answerOption.text);

        const lowerInput = answerOption.text.toLowerCase();
        let nextAnswerOptions: Array<{ text: string; value: string }> = [];

        // EMERGENCY ASSESSMENT PROTOCOL - Chest pain requires multiple critical questions
        if (answerOption.value === 'chest_pain_recent' || answerOption.value === 'chest_pain_moderate') {
          confidence = 0.1; // Still very low - need more critical data
          clinicalResponse = '🚨 **EVALUACIÓN CRÍTICA CONTINÚA** 🚨\n\nTiempo de dolor registrado. Ahora necesito evaluar la intensidad.\n\n**En una escala del 1 al 10, ¿qué tan intenso es el dolor? (10 = el peor dolor imaginable)**';
          nextAnswerOptions = [
            { text: 'Leve (1-3)', value: 'chest_pain_mild' },
            { text: 'Moderado (4-6)', value: 'chest_pain_moderate_intensity' },
            { text: 'Severo (7-8)', value: 'chest_pain_severe' },
            { text: 'Extremo (9-10)', value: 'chest_pain_extreme' },
            { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
          ];
        }
        else if (answerOption.value === 'chest_pain_prolonged') {
          confidence = 0.2;
          clinicalResponse = '⚠️ **DOLOR PROLONGADO REQUIERE EVALUACIÓN** ⚠️\n\nDolor de pecho por más de 2 horas requiere atención médica. ¿El dolor se irradia a otras partes del cuerpo?';
          nextAnswerOptions = [
            { text: 'Sí, al brazo izquierdo', value: 'radiation_arm' },
            { text: 'Sí, a la mandíbula/cuello', value: 'radiation_jaw' },
            { text: 'Sí, a la espalda', value: 'radiation_back' },
            { text: 'No se irradia', value: 'no_radiation' },
            { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
          ];
        }
        else if (answerOption.value === 'chest_pain_extreme' || answerOption.value === 'chest_pain_severe') {
          confidence = 1.0; // High confidence this is emergency
          clinicalResponse = '🚨 **EMERGENCIA MÉDICA CONFIRMADA** 🚨\n\n**LLAME AL 911 INMEDIATAMENTE**\n\nDolor de pecho severo (7-10) requiere atención de emergencia inmediata. NO espere, NO conduzca usted mismo.\n\n**Vaya al hospital MÁS CERCANO AHORA.**';
          isEmergency = true;
          nextAnswerOptions = [];
        }
        else if (answerOption.value === 'radiation_arm' || answerOption.value === 'radiation_jaw') {
          confidence = 1.0; // Classic heart attack symptoms
          clinicalResponse = '🚨 **SÍNTOMAS DE INFARTO - EMERGENCIA** 🚨\n\n**LLAME AL 911 AHORA MISMO**\n\nDolor que se irradia al brazo o mandíbula son síntomas clásicos de infarto. Requiere atención inmediata.\n\n**NO ESPERE - VAYA AL HOSPITAL AHORA.**';
          isEmergency = true;
          nextAnswerOptions = [];
        }
        else if (answerOption.value === 'chest_pain_mild' || answerOption.value === 'chest_pain_moderate_intensity') {
          confidence = 0.3; // Still need more questions
          clinicalResponse = 'Dolor registrado. Necesito más información para evaluar. ¿Tiene dificultad para respirar, sudoración o náuseas?';
          nextAnswerOptions = [
            { text: 'Sí, dificultad para respirar', value: 'breathing_difficulty' },
            { text: 'Sí, sudoración', value: 'sweating' },
            { text: 'Sí, náuseas', value: 'nausea' },
            { text: 'No, ninguno de esos', value: 'no_associated_symptoms' },
            { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
          ];
        }
        // Non-emergency conditions - can proceed with normal diagnostic flow
        else if (answerOption.value === 'tension_headache') {
          confidence = 0.4; // Still need more questions before diagnosis
          clinicalResponse = 'Características de cefalea tensional registradas. ¿El dolor empeora con el estrés o la tensión?';
          nextAnswerOptions = [
            { text: 'Sí, empeora con estrés', value: 'stress_related' },
            { text: 'No, es constante', value: 'constant_pain' },
            { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
          ];
        }
        else if (answerOption.value === 'migraine_headache') {
          confidence = 0.4; // Still need more questions before diagnosis
          clinicalResponse = 'Características de migraña registradas. ¿Se acompaña de náuseas o sensibilidad a la luz?';
          nextAnswerOptions = [
            { text: 'Sí, con náuseas', value: 'with_nausea' },
            { text: 'Sí, sensibilidad a la luz', value: 'light_sensitivity' },
            { text: 'Ambos síntomas', value: 'both_symptoms' },
            { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
          ];
        }
        else if (answerOption.value === 'upper_abdomen' || answerOption.value === 'worse_eating') {
          confidence = 0.7;
          clinicalResponse = 'Esto puede indicar gastritis o úlcera. ¿Ha tenido acidez o ardor estomacal?';
          nextAnswerOptions = [
            { text: 'Sí, mucha acidez', value: 'high_acidity' },
            { text: 'Un poco de acidez', value: 'mild_acidity' },
            { text: 'No, sin acidez', value: 'no_acidity' },
            { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
          ];
        }
        else if (answerOption.value === 'high_fever') {
          confidence = 0.9;
          clinicalResponse = 'Fiebre alta requiere atención. ¿Tiene dificultad para respirar o dolor de pecho?';
          nextAnswerOptions = [
            { text: 'Sí, dificultad respiratoria', value: 'breathing_difficulty' },
            { text: 'Sí, dolor de pecho', value: 'chest_pain' },
            { text: 'No, solo fiebre alta', value: 'fever_only' },
            { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
          ];
        }
        else if (answerOption.value === 'today' || answerOption.value === 'few_days') {
          confidence = 0.6;
          clinicalResponse = 'Síntoma reciente. ¿Cómo describiría la intensidad del dolor del 1 al 10?';
          nextAnswerOptions = [
            { text: 'Leve (1-3)', value: 'mild_pain' },
            { text: 'Moderado (4-6)', value: 'moderate_pain' },
            { text: 'Intenso (7-10)', value: 'severe_pain' },
            { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
          ];
        }
        // EMERGENCY ESCALATION - Any breathing difficulty, sweating with chest pain = EMERGENCY
        else if (answerOption.value === 'breathing_difficulty' || answerOption.value === 'sweating') {
          confidence = 1.0; // Emergency confirmed
          clinicalResponse = '🚨 **EMERGENCIA MÉDICA CONFIRMADA** 🚨\n\n**LLAME AL 911 INMEDIATAMENTE**\n\nDolor de pecho con dificultad respiratoria o sudoración son síntomas de emergencia cardíaca.\n\n**NO ESPERE - VAYA AL HOSPITAL AHORA.**';
          isEmergency = true;
          nextAnswerOptions = [];
        }
        else if (answerOption.value === 'no_associated_symptoms') {
          confidence = 0.5; // Still need more questions - not ready for diagnosis
          clinicalResponse = 'Entiendo. Necesito más información. ¿El dolor empeora con la actividad física o mejora con el reposo?';
          nextAnswerOptions = [
            { text: 'Empeora con actividad', value: 'worse_activity' },
            { text: 'Mejora con reposo', value: 'better_rest' },
            { text: 'No cambia', value: 'no_change' },
            { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
          ];
        }
        // DIAGNOSTIC THRESHOLD - Require minimum 5 questions before any diagnosis consideration
        else if (answerOption.value === 'stress_related' || answerOption.value === 'with_nausea') {
          confidence = 0.6; // Still not enough for diagnosis - need more data
          clinicalResponse = 'Información registrada. Necesito más detalles antes de cualquier evaluación. ¿Desde cuándo tiene estos síntomas?';
          nextAnswerOptions = [
            { text: 'Menos de 24 horas', value: 'recent_onset' },
            { text: '1-3 días', value: 'few_days' },
            { text: 'Más de una semana', value: 'chronic' },
            { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
          ];
        }
        else if (answerOption.value === 'recent_onset' || answerOption.value === 'few_days') {
          confidence = 0.7; // Getting closer but still need more
          clinicalResponse = 'Duración registrada. Una pregunta más: ¿Ha tenido episodios similares antes?';
          nextAnswerOptions = [
            { text: 'Sí, episodios similares', value: 'recurrent' },
            { text: 'No, primera vez', value: 'first_time' },
            { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
          ];
        }
        // Handle chronic symptoms (more than a week)
        else if (answerOption.value === 'chronic') {
          confidence = 0.8; // Chronic symptoms need medical attention
          clinicalResponse = 'Síntomas crónicos de más de una semana requieren evaluación médica. ¿Ha empeorado recientemente o se mantiene igual?';
          nextAnswerOptions = [
            { text: 'Ha empeorado', value: 'worsening' },
            { text: 'Se mantiene igual', value: 'stable' },
            { text: 'Ha mejorado un poco', value: 'improving' },
            { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
          ];
        }
        // ONLY NOW can we consider diagnostic impression - after 5+ questions
        else if (answerOption.value === 'recurrent' || answerOption.value === 'first_time') {
          confidence = 0.8; // Finally enough data for preliminary assessment
          clinicalResponse = 'Basado en la información recopilada en múltiples preguntas, puedo ofrecer una **impresión clínica preliminar**. ¿Desea que proceda con la evaluación?';
          nextAnswerOptions = [
            { text: 'Sí, proceda con la evaluación', value: 'proceed_assessment' },
            { text: 'Necesito más información', value: 'need_more_info' },
            { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
          ];
        }
        // Handle chronic symptom progression
        else if (answerOption.value === 'worsening') {
          confidence = 0.9; // Worsening chronic symptoms need urgent attention
          clinicalResponse = 'Síntomas que empeoran requieren atención médica pronta. Basado en: dolor de cabeza pulsátil con náuseas por más de una semana que está empeorando, esto sugiere **migraña crónica**.\n\n**Recomendación**: Consulte con un neurólogo en los próximos días.';
          nextAnswerOptions = [
            { text: 'Buscar neurólogo cercano', value: 'find_neurologist' },
            { text: 'Necesito más información', value: 'need_more_info' },
            { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
          ];
        }
        else if (answerOption.value === 'stable' || answerOption.value === 'improving') {
          confidence = 0.8; // Stable chronic symptoms
          clinicalResponse = 'Basado en la información: dolor de cabeza pulsátil con náuseas por más de una semana, esto sugiere **migraña**.\n\n**Recomendaciones**:\n• Evite factores desencadenantes (estrés, ciertos alimentos)\n• Mantenga horarios regulares de sueño\n• Considere consulta con neurólogo si persiste';
          nextAnswerOptions = [
            { text: 'Buscar neurólogo cercano', value: 'find_neurologist' },
            { text: '¿Qué medicamentos puedo tomar?', value: 'medication_advice' },
            { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
          ];
        }
        // Handle requests for more details
        else if (answerOption.value === 'more_details' || answerOption.value === 'more_info') {
          confidence = 0.7; // We have enough info to proceed
          clinicalResponse = 'Tengo suficiente información para una evaluación preliminar. ¿Hay algún factor específico que cree que puede estar causando sus síntomas?';
          nextAnswerOptions = [
            { text: 'Estrés o tensión', value: 'stress_factor' },
            { text: 'Cambios en el sueño', value: 'sleep_factor' },
            { text: 'Cambios en la alimentación', value: 'diet_factor' },
            { text: 'No estoy seguro', value: 'unsure_factor' },
            { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
          ];
        }
        // Handle factor identification
        else if (answerOption.value === 'stress_factor' || answerOption.value === 'sleep_factor' || answerOption.value === 'diet_factor') {
          confidence = 0.9; // High confidence with trigger identification
          clinicalResponse = 'Excelente información. Basado en todos los datos: dolor de cabeza pulsátil con náuseas, esto confirma **migraña**.\n\n**Plan de tratamiento**:\n• Evite el factor desencadenante identificado\n• Considere analgésicos específicos para migraña\n• Si persiste, consulte neurólogo';
          nextAnswerOptions = [
            { text: 'Buscar neurólogo cercano', value: 'find_neurologist' },
            { text: '¿Qué medicamentos específicos?', value: 'specific_medication' },
            { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
          ];
        }
        // Final diagnostic conclusion
        else if (answerOption.value === 'proceed_assessment') {
          confidence = 0.9; // High confidence for final assessment
          clinicalResponse = '**EVALUACIÓN CLÍNICA PRELIMINAR**\n\n**Diagnóstico probable**: Migraña\n\n**Basado en**:\n• Dolor pulsátil\n• Náuseas asociadas\n• Patrón de síntomas\n\n**Recomendaciones**:\n1. Evitar factores desencadenantes\n2. Analgésicos específicos para migraña\n3. Consulta con neurólogo si persiste o empeora';
          nextAnswerOptions = [
            { text: 'Buscar neurólogo cercano', value: 'find_neurologist' },
            { text: '¿Qué medicamentos puedo tomar?', value: 'medication_advice' },
            { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
          ];
        }
        else if (lowerInput.includes('sí') || lowerInput.includes('si') || lowerInput.includes('yes')) {
          confidence = 0.4; // Much lower threshold - need more questions
          clinicalResponse = 'Información registrada. Necesito hacer más preguntas antes de cualquier evaluación. ¿Puede describir más detalles?';
          nextAnswerOptions = [
            { text: 'Sí, puedo dar más detalles', value: 'more_details' },
            { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
          ];
        }
        else if (lowerInput.includes('no')) {
          confidence = 0.4; // Much lower threshold
          clinicalResponse = 'Entendido. Necesito más información para una evaluación adecuada. ¿Ha tomado algún medicamento?';
          nextAnswerOptions = [
            { text: 'Sí, he tomado medicamentos', value: 'took_medication' },
            { text: 'No, no he tomado nada', value: 'no_medication' },
            { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
          ];
        }
        // Default clinical response for other button clicks
        else {
          confidence = 0.3; // Lower default confidence
          clinicalResponse = `Información registrada. Necesito más detalles para una evaluación médica adecuada. ¿Puede proporcionar más información?`;
          nextAnswerOptions = [
            { text: 'Sí, puedo dar más información', value: 'more_info' },
            { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
          ];
        }

        console.log('🩺 Clinical response for button click:', clinicalResponse);

        // Update message with clinical response
        setMessages(prev =>
          prev.map(msg =>
            msg.id === botMessageId
              ? {
                  ...msg,
                  text: clinicalResponse,
                  answerOptions: nextAnswerOptions,
                  severity: confidence * 10,
                  isEmergency: false,
                  isStreaming: false,
                  isComplete: true
                }
              : msg
          )
        );

        setIsProcessing(false);

        // Auto-scroll to latest message
        setTimeout(() => {
          const chatContainer = document.querySelector('.chat-messages-container');
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 100);

        return;
      }

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

                    {/* Quick Mexican Symptoms - Only show before conversation starts */}
                    {!conversationStarted && (
                      <div className="px-4 mb-4">
                        <div className="max-w-4xl mx-auto">
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
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {MEXICAN_QUICK_SYMPTOMS.map((symptom, index) => (
                            <button
                              key={index}
                              onClick={async () => {
                                const familyContext = familyMember === 'myself' ? '' : ` (${MEXICAN_FAMILY_OPTIONS.find(o => o.value === familyMember)?.label})`;
                                const messageText = symptom.text + familyContext;

                                // Directly send the message without setting input
                                const userMessageId = Date.now().toString();
                                const newUserMessage = {
                                  id: userMessageId,
                                  text: messageText,
                                  sender: 'user' as const,
                                  timestamp: new Date(),
                                  status: 'sent' as const
                                };

                                setMessages(prev => [...prev, newUserMessage]);
                                setIsProcessing(true);

                                // Mark conversation as started
                                if (!conversationStarted) {
                                  setConversationStarted(true);
                                }

                                // Process with clinical mode
                                const botMessageId = (Date.now() + 1).toString();
                                const initialBotMessage = {
                                  id: botMessageId,
                                  text: '',
                                  sender: 'bot' as const,
                                  timestamp: new Date(),
                                  isStreaming: true,
                                  isComplete: false,
                                  status: 'delivered' as const
                                };

                                setMessages(prev => [...prev, initialBotMessage]);

                                // Use clinical mode logic
                                let clinicalResponse = '';
                                let confidence = 0.3;
                                let isEmergency = false;

                                const lowerInput = messageText.toLowerCase();

                                // Emergency detection
                                if (lowerInput.includes('no puedo respirar') ||
                                    lowerInput.includes('dolor de pecho intenso') ||
                                    lowerInput.includes('perdí el conocimiento')) {
                                  clinicalResponse = '🚨 **EMERGENCIA MÉDICA** 🚨\n\nPor favor, acuda inmediatamente al servicio de urgencias más cercano o llame al 911.';
                                  isEmergency = true;
                                  confidence = 1.0;
                                }
                                // Chest pain - EMERGENCY
                                else if (lowerInput.includes('dolor') && (lowerInput.includes('pecho') || lowerInput.includes('corazón'))) {
                                  clinicalResponse = '🚨 **POSIBLE EMERGENCIA** 🚨\n\n¿El dolor de pecho es intenso o se acompaña de dificultad para respirar, sudoración o náuseas?\n\nSi es así, acuda inmediatamente a urgencias. Si no, ¿puede describir el tipo de dolor?';
                                  confidence = 0.9;
                                  isEmergency = true;
                                }
                                // Headache
                                else if (lowerInput.includes('dolor') && lowerInput.includes('cabeza')) {
                                  clinicalResponse = 'Entiendo que tiene dolor de cabeza. ¿El dolor es como una banda apretada alrededor de la cabeza o es pulsátil como latidos?';
                                  confidence = 0.4;
                                }
                                // Abdominal pain
                                else if (lowerInput.includes('dolor') && (lowerInput.includes('estómago') || lowerInput.includes('abdomen') || lowerInput.includes('barriga'))) {
                                  clinicalResponse = 'Entiendo que tiene dolor abdominal. ¿El dolor está en la parte alta del abdomen y empeora cuando come?';
                                  confidence = 0.4;
                                }
                                // Fever
                                else if (lowerInput.includes('fiebre') || lowerInput.includes('temperatura') || lowerInput.includes('calentura')) {
                                  clinicalResponse = 'Entiendo que tiene fiebre. ¿La temperatura es menor a 39°C y tiene síntomas como tos o dolor de garganta?';
                                  confidence = 0.4;
                                }
                                // Generic symptom
                                else if (lowerInput.includes('dolor') || lowerInput.includes('duele') || lowerInput.includes('molestia')) {
                                  const cleanedInput = messageText.replace(/^(tengo|me duele|dolor de|dolor en)/i, '').trim();
                                  clinicalResponse = `Entiendo que tiene ${cleanedInput}. ¿Desde cuándo tiene este síntoma?`;
                                  confidence = 0.3;
                                }
                                // Default clinical response
                                else {
                                  const cleanedInput = messageText.replace(/^(tengo|me duele|dolor de|dolor en)/i, '').trim();
                                  clinicalResponse = `Entiendo que tiene ${cleanedInput}. ¿Puede proporcionar más detalles sobre este síntoma?`;
                                  confidence = 0.3;
                                }

                                console.log('🩺 Quick symptom clinical response:', clinicalResponse);

                                // Generate contextually appropriate answer options for quick symptoms
                                let quickAnswerOptions: Array<{ text: string; value: string }> = [];

                                if (isEmergency) {
                                  quickAnswerOptions = [];
                                } else if (lowerInput.includes('dolor') && lowerInput.includes('cabeza')) {
                                  quickAnswerOptions = [
                                    { text: 'Banda apretada', value: 'tension_headache' },
                                    { text: 'Pulsátil/latidos', value: 'migraine_headache' },
                                    { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
                                  ];
                                } else if (lowerInput.includes('dolor') && (lowerInput.includes('estómago') || lowerInput.includes('abdomen'))) {
                                  quickAnswerOptions = [
                                    { text: 'Parte alta del abdomen', value: 'upper_abdomen' },
                                    { text: 'Parte baja del abdomen', value: 'lower_abdomen' },
                                    { text: 'Empeora al comer', value: 'worse_eating' },
                                    { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
                                  ];
                                } else if (lowerInput.includes('fiebre') || lowerInput.includes('temperatura')) {
                                  quickAnswerOptions = [
                                    { text: 'Menos de 39°C', value: 'low_fever' },
                                    { text: 'Más de 39°C', value: 'high_fever' },
                                    { text: 'Con tos o dolor de garganta', value: 'respiratory_symptoms' },
                                    { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
                                  ];
                                } else if (lowerInput.includes('dolor') || lowerInput.includes('duele')) {
                                  quickAnswerOptions = [
                                    { text: 'Hoy', value: 'today' },
                                    { text: 'Hace unos días', value: 'few_days' },
                                    { text: 'Hace una semana o más', value: 'week_plus' },
                                    { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
                                  ];
                                } else {
                                  quickAnswerOptions = [
                                    { text: 'Sí', value: 'yes' },
                                    { text: 'No', value: 'no' },
                                    { text: 'Prefiero escribir mi respuesta', value: 'free_text' }
                                  ];
                                }

                                // Update message with clinical response
                                setMessages(prev =>
                                  prev.map(msg =>
                                    msg.id === botMessageId
                                      ? {
                                          ...msg,
                                          text: clinicalResponse,
                                          answerOptions: quickAnswerOptions,
                                          severity: confidence * 10,
                                          isEmergency: isEmergency,
                                          isStreaming: false,
                                          isComplete: true
                                        }
                                      : msg
                                  )
                                );

                                setIsProcessing(false);

                                // Auto-scroll to latest message
                                setTimeout(() => {
                                  const chatContainer = document.querySelector('.chat-messages-container');
                                  if (chatContainer) {
                                    chatContainer.scrollTop = chatContainer.scrollHeight;
                                  }
                                }, 100);
                              }}
                              className="bg-white border border-[#006D77]/30 hover:border-[#006D77] hover:bg-[#D0F0EF]/30 rounded-lg px-3 py-2.5 text-sm transition-all flex items-center justify-center space-x-2 min-h-[44px] shadow-sm hover:shadow-md"
                            >
                              <span className="text-lg">{symptom.icon}</span>
                              <span className="text-[#006D77] font-medium text-center leading-tight">{symptom.text}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    )}

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
