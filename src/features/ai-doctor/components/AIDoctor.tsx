// ======================================================
// IMPORTANT: THIS IS THE CANONICAL VERSION
// This is the current active implementation of AIDoctor.
// There's a deprecated version at:
// /src/components/ai/AIDoctor.tsx
// which just re-exports this component.
// Please make all changes to this file.
// ======================================================

import React, { useState, useRef, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image, Mic, MapPin, Calendar, FileText, Menu, X } from 'lucide-react';
import AIService, { AIQueryOptions, AICharacterProfile, StreamingAIResponse, StreamingResponseHandler } from '../../../core/services/ai/AIService';
import EncryptionService from '../../../core/services/security/EncryptionService';
import AIThinking from './AIThinking';
import EnhancedChatBubble from './EnhancedChatBubble';
import ProductRecommendation from './ProductRecommendation';
import ImageAnalysisVisual from '../../ai-image-analysis/components/ImageAnalysisVisual';
import ConfidenceVisualizer from './ConfidenceVisualizer';

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
};

type AIDoctorProps = {
  onClose?: () => void;
  isEmbedded?: boolean;
};

type Tab = 'chat' | 'analysis' | 'providers' | 'prescriptions' | 'appointments' | 'pharmacies';

function AIDoctor({ onClose, isEmbedded = false }: AIDoctorProps) {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [severityLevel, setSeverityLevel] = useState(10);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobileView);
  const [imageAnalysisStage, setImageAnalysisStage] = useState<'initial' | 'scanning' | 'identifying' | 'comparing' | 'concluding' | null>(null);
  const [currentAnalysisImage, setCurrentAnalysisImage] = useState<string | null>(null);
  const [confidenceStatus, setConfidenceStatus] = useState<'considering' | 'confident' | 'uncertain'>('considering');
  const [confidenceLevel, setConfidenceLevel] = useState(0);
  const medicalReferences = [
    'Base de datos médica', 'Estudios clínicos', 'Literatura médica', 
    'Atlas de dermatología', 'Investigaciones recientes'
  ];
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: '¡Hola! Soy el Doctor IA de Doctor.mx. ¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date(),
      interactiveOptions: {
        type: 'symptom_category',
        options: ['Dolor', 'Fiebre', 'Digestivo', 'Respiratorio', 'Piel', 'Otro'],
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
  const [questionHistory, setQuestionHistory] = useState<string[]>(['initial']);
  
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
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
          console.log('Error getting location:', error);
        }
      );
    }
  }, []);
  
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      if (!isSidebarOpen && !mobile) setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);
  
  const handleSendMessage = async () => {
    if (!input.trim() && !isUploading) return;
    
    if (input.trim().toLowerCase().includes('medicamento') || 
        input.trim().toLowerCase().includes('farmacia') ||
        input.trim().toLowerCase().includes('medicina')) {
      const lastMessageWithMedications = [...messages].reverse().find(m => 
        m.suggestedMedications && m.suggestedMedications.length > 0
      );
      
      if (lastMessageWithMedications?.suggestedMedications) {
        const userMessageId = Date.now().toString();
        const newUserMessage: Message = { 
          id: userMessageId,
          text: input,
          sender: 'user',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Buscando farmacias con medicamentos recomendados para ti...',
          sender: 'bot',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, responseMessage]);
        findPharmacies(lastMessageWithMedications.suggestedMedications);
        return;
      }
    }
    
    const userMessageId = Date.now().toString();
    const newUserMessage: Message = { 
      id: userMessageId,
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsProcessing(true);
    
    if (questionHistory.length > 0) {
      setQuestionHistory(prev => [...prev, 'custom_input']);
      setCurrentQuestionId('custom_input');
    }
    
    try {
      const doctorInstructions = localStorage.getItem(DOCTOR_INSTRUCTIONS_KEY);
      const imageAnalysisEnabled = localStorage.getItem(DOCTOR_IMAGE_ANALYSIS_ENABLED_KEY) !== 'false';
      
      console.log(`Current question ID: ${currentQuestionId}`);
      console.log(`Question history: ${questionHistory.join(' -> ')}`);
      
      // Create a streaming response handler
      const botMessageId = (Date.now() + 1).toString();
      
      // Initialize empty streaming message
      const initialStreamingMessage: Message = {
        id: botMessageId,
        text: '',
        sender: 'bot',
        timestamp: new Date(),
        isStreaming: true,
        isComplete: false
      };
      
      // Add initial message to messages state
      setMessages(prev => [...prev, initialStreamingMessage]);
      
      // Create streaming handler
      const streamingHandler: StreamingResponseHandler = (streamResponse: StreamingAIResponse) => {
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
              isStreaming: streamResponse.isStreaming,
              isComplete: streamResponse.isComplete
            };
          }
          
          return updatedMessages;
        });
        
        // Update severity if provided
        if (streamResponse.severity) {
          setSeverityLevel(streamResponse.severity);
        }
        
        // When streaming is complete, set processing to false
        if (streamResponse.isComplete) {
          setIsProcessing(false);
          
          // Add interactive options based on input content
          setMessages(prev => {
            const updatedMessages = [...prev];
            const messageIndex = updatedMessages.findIndex(m => m.id === botMessageId);
            
            if (messageIndex !== -1) {
              const lowerInput = input.toLowerCase();
              const currentMessage = updatedMessages[messageIndex];
              
              // Add interactive options based on user input
              if (lowerInput.includes('dolor') && !currentMessage.interactiveOptions) {
                currentMessage.interactiveOptions = {
                  type: 'symptom_severity',
                  options: ['Leve', 'Moderada', 'Severa'],
                  questionId: 'severity_pain_text'
                };
                setCurrentQuestionId('severity_pain_text');
              } else if ((lowerInput.includes('fiebre') || lowerInput.includes('temperatura')) && !currentMessage.interactiveOptions) {
                currentMessage.interactiveOptions = {
                  type: 'symptom_duration',
                  options: ['Menos de 24 horas', '1-3 días', '1-2 semanas', 'Más tiempo'],
                  questionId: 'duration_fever_text'
                };
                setCurrentQuestionId('duration_fever_text');
              }
              
              // Add pharmacy recommendation option if conditions are suggested
              if (currentMessage.suggestedConditions && currentMessage.suggestedConditions.length > 0) {
                if (!currentMessage.interactiveOptions) {
                  currentMessage.interactiveOptions = {
                    type: 'yes_no',
                    options: ['Ver medicamentos recomendados', 'No, gracias'],
                    questionId: 'pharmacy_recommendation'
                  };
                  setCurrentQuestionId('pharmacy_recommendation');
                } else {
                  if (!currentMessage.followUpQuestions) {
                    currentMessage.followUpQuestions = [];
                  }
                  currentMessage.followUpQuestions.push('Ver medicamentos recomendados');
                }
              }
              // Add doctor referral option if high severity or emergency
              if ((currentMessage.severity || 0) >= 70 || currentMessage.isEmergency) {
                if (!currentMessage.interactiveOptions) {
                  currentMessage.interactiveOptions = {
                    type: 'yes_no',
                    options: ['Consultar con médico local', 'No, gracias'],
                    questionId: 'doctor_referral'
                  };
                  setCurrentQuestionId('doctor_referral');
                } else {
                  if (!currentMessage.followUpQuestions) {
                    currentMessage.followUpQuestions = [];
                  }
                  currentMessage.followUpQuestions.push('Consultar con médico local');
                }
              }
            }
            
            return updatedMessages;
          });
        }
      };
      
      // Configure AI query with streaming enabled
      const queryOptions: AIQueryOptions = {
        userMessage: input,
        userHistory: messages.map(m => m.text),
        severity: severityLevel,
        location: location || undefined,
        usePremiumModel: imageAnalysisEnabled || input.length > 100 || input.includes('imagen') || input.includes('photo'),
        customInstructions: doctorInstructions || undefined,
        stream: true,
        onStreamingResponse: streamingHandler,
        characterProfile: AIService.getCharacterProfile() // Use the character profile from AIService
      };
      
      // Process query with streaming
      await AIService.processQuery(queryOptions);
      
    } catch (error) {
      console.error('Error processing message:', error);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.',
        sender: 'bot',
        timestamp: new Date()
      }]);
      
      setIsProcessing(false);
    }
  };
  
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
      
      const response = await AIService.analyzeImage(imageUrl);
      
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
  
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  
  const handleMicClick = async () => {
    if (isRecording) {
      if (mediaRecorder) {
        mediaRecorder.stop();
        setIsRecording(false);
      }
      return;
    }
    
    try {
      setIsProcessing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsProcessing(false);
      
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      setAudioChunks([]);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((chunks) => [...chunks, event.data]);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const userMessageId = Date.now().toString();
        const newUserMessage: Message = { 
          id: userMessageId,
          text: 'He grabado un mensaje de voz sobre mis síntomas.',
          sender: 'user',
          timestamp: new Date(),
          audioUrl: audioUrl
        };
        
        setMessages(prev => [...prev, newUserMessage]);
        
        setIsProcessing(true);
        
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const symptomOptions = [
            'dolor de cabeza', 'fiebre', 'tos', 'dolor de garganta', 
            'congestión nasal', 'dolor abdominal', 'náuseas'
          ];
          const randomSymptom = symptomOptions[Math.floor(Math.random() * symptomOptions.length)];
          
          const botResponse: Message = {
            id: Date.now().toString(),
            text: `He analizado tu mensaje de voz. Parece que mencionas ${randomSymptom}. ¿Puedes confirmar si esto es correcto y proporcionarme más detalles sobre cuándo comenzaron estos síntomas?`,
            sender: 'bot',
            timestamp: new Date(),
            interactiveOptions: {
              type: 'yes_no',
              options: ['Sí, es correcto', 'No, es otro síntoma'],
              questionId: 'audio_confirmation'
            },
            followUpQuestions: [
              '¿Cuándo comenzaron los síntomas?',
              '¿Has tomado algún medicamento?',
              '¿Tienes alguna condición médica preexistente?'
            ]
          };
          
          setMessages(prev => [...prev, botResponse]);
        } catch (error) {
          console.error('Error processing audio:', error);
          
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: 'Lo siento, hubo un problema al procesar tu mensaje de voz. ¿Podrías intentar escribir tus síntomas?',
            sender: 'bot',
            timestamp: new Date()
          }]);
        } finally {
          setIsProcessing(false);
        }
        
        stream.getTracks().forEach(track => track.stop());
        
        setTimeout(() => URL.revokeObjectURL(audioUrl), 60000);
      };
      
      recorder.start();
      setIsRecording(true);
      
      setTimeout(() => {
        if (recorder && recorder.state === 'recording') {
          recorder.stop();
          setIsRecording(false);
        }
      }, 15000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('No se pudo acceder al micrófono. Por favor, verifica los permisos del navegador.');
      setIsRecording(false);
      setIsProcessing(false);
    }
  };
  
  const findProviders = async (specialty: string) => {
    if (!location) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          }
        );
      }
      
      alert('Necesitamos tu ubicación para buscar proveedores cercanos.');
      return;
    }
    
    try {
      const providers = await AIService.findNearbyProviders(specialty, location);
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
      
      const appointment = await AIService.scheduleAppointment(
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
      const pharmacyList = await AIService.getPharmacyRecommendations(medications, location);
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
    
    setQuestionHistory(prev => [...prev, questionId]);
    
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
      setCurrentQuestionId(newHistory[newHistory.length - 1]);
      
      setMessages(prev => prev.slice(0, -2));
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
          setTimeout(() => handleSendMessage(), 100);
        }}
        onGoBack={handleGoBack}
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
                  <div className="flex flex-col h-full">
                    {/* Chat messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-messages-container" style={{ overscrollBehavior: 'none', contain: 'size layout' }}>
                      <div className="chat-messages-wrapper" style={{ transform: 'translateZ(0)', willChange: 'transform', minHeight: '100%', contain: 'content', isolation: 'isolate' }}>
                        {messages.map((message) => (
                          <MessageComponent key={message.id} message={message} />
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
                    
                    {/* Image Analysis Visualization */}
                    {imageAnalysisStage && currentAnalysisImage && (
                      <motion.div 
                        className="px-4 pb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <div className="bg-white rounded-lg shadow-md p-4 border border-brand-jade-100">
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
                    
                    {/* Input area */}
                    <div className="p-4 border-t border-gray-200 input-container" style={{ position: 'relative', zIndex: 2, transform: 'translateZ(0)', willChange: 'transform', contain: 'layout', minHeight: '80px' }}>
                      <div className="flex space-x-2">
                        <button 
                          onClick={handleMicClick}
                          className={`p-2 rounded-full ${isRecording ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:text-brand-jade-600'}`}
                          aria-label="Usar micrófono"
                        >
                          <Mic size={20} />
                        </button>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className={`p-2 rounded-full ${isUploading ? 'text-brand-jade-600' : 'text-gray-500 hover:text-brand-jade-600'}`}
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
                        <div className="flex-1 relative" style={{ transform: 'translateZ(0)', willChange: 'transform', contain: 'layout style', minHeight: '44px' }}>
                          <input
                            type="text"
                            value={input}
                            onChange={(e) => {
                              // Use a stable function reference to prevent re-renders
                              const newValue = e.target.value;
                              setInput(newValue);
                            }}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Describe tus síntomas o haz una pregunta..."
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-jade-500 chat-input"
                            disabled={isProcessing}
                            style={{ height: '44px', minHeight: '44px' }}
                          />
                          {input.length > 0 && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-brand-jade-500 opacity-70" style={{ pointerEvents: 'none' }}>
                              {input.length} caracteres
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={handleSendMessage}
                          disabled={(!input.trim() && !isUploading) || isProcessing}
                          className={`p-2 rounded-full ${
                            (!input.trim() && !isUploading) || isProcessing
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-brand-jade-600 hover:bg-brand-jade-50'
                          }`}
                          aria-label="Enviar mensaje"
                        >
                          <Send size={20} />
                        </button>
                      </div>
                      
                      {/* Stable containers for status indicators */}
                      <div className="status-indicators-container" style={{ height: isRecording || isProcessing ? 'auto' : '0', overflow: 'hidden', transition: 'height 0.3s ease' }}>
                        {isRecording && (
                          <div className="mt-2 text-center text-sm text-red-600" style={{ transform: 'translateZ(0)' }}>
                            <span className="inline-block">●</span> Escuchando... Habla ahora
                          </div>
                        )}
                        {isProcessing && (
                          <div className="mt-4 flex justify-center" style={{ transform: 'translateZ(0)', contain: 'content' }}>
                            <AIThinking message="Analizando su consulta..." />
                          </div>
                        )}
                      </div>
                      {!localStorage.getItem(OPENAI_KEY_STORAGE_KEY) && (
                        <div className="mt-2 text-center">
                          <Link to="/settings/api" className="text-xs text-brand-jade-600 hover:underline">
                            Configurar API key para mejorar las respuestas
                          </Link>
                        </div>
                      )}
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
        <div className="bg-brand-jade-600 p-4 text-white">
          <h3 className="font-semibold text-lg">Doctor IA</h3>
        </div>
        {renderTabContent()}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col mt-16"> {/* Added mt-16 to account for fixed navbar */}
      {/* Alert banner */}
      <div className="bg-yellow-50 border-b border-yellow-100 px-4 py-2">
        <div className="flex items-center text-yellow-800">
          <p className="text-sm font-medium">
            Recuerda: Esta herramienta no sustituye la atención médica profesional.
          </p>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar toggle for mobile */}
        {isMobileView && (
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="fixed top-20 left-2 z-50 bg-brand-jade-600 text-white p-2 rounded-full shadow-lg"
            aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
        
        {/* Sidebar with responsive classes */}
        <aside 
          className={`${isMobileView ? 'fixed inset-y-0 left-0 z-40' : 'w-64'} 
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            bg-gray-50 border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out`}>
          <div className="p-4 border-b border-gray-200 bg-gradient-to-b from-brand-jade-50 to-white">
            <h2 className="font-bold text-lg text-gray-800">Doctor IA</h2>
            <p className="text-sm text-gray-600">Asistente médico inteligente</p>
            
            {/* Severity meter */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Nivel de atención</span>
                <span className="font-medium">{getSeverityText()}</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getSeverityColor()}`} 
                  style={{ width: `${severityLevel}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              <li>
                <button 
                  className={`w-full text-left px-4 py-3 rounded-lg ${
                    activeTab === 'chat' 
                      ? 'bg-brand-jade-50 text-brand-jade-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('chat')}
                >
                  Consulta Médica
                </button>
              </li>
              <li>
                <button 
                  className={`w-full text-left px-4 py-3 rounded-lg ${
                    activeTab === 'analysis' 
                      ? 'bg-brand-jade-50 text-brand-jade-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('analysis')}
                >
                  Análisis de Síntomas
                </button>
              </li>
              <li>
                <button 
                  className={`w-full text-left px-4 py-3 rounded-lg ${
                    activeTab === 'providers' 
                      ? 'bg-brand-jade-50 text-brand-jade-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('providers')}
                >
                  Proveedores Cercanos
                </button>
              </li>
              <li>
                <button 
                  className={`w-full text-left px-4 py-3 rounded-lg ${
                    activeTab === 'appointments' 
                      ? 'bg-brand-jade-50 text-brand-jade-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('appointments')}
                >
                  Mis Citas
                </button>
              </li>
              <li>
                <button 
                  className={`w-full text-left px-4 py-3 rounded-lg ${
                    activeTab === 'prescriptions' 
                      ? 'bg-brand-jade-50 text-brand-jade-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('prescriptions')}
                >
                  Mis Recetas
                </button>
              </li>
              <li>
                <button 
                  className={`w-full text-left px-4 py-3 rounded-lg ${
                    activeTab === 'pharmacies' 
                      ? 'bg-brand-jade-50 text-brand-jade-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('pharmacies')}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Farmacias Cercanas
                  </div>
                </button>
              </li>
            </ul>
          </nav>
          
          <div className="p-4 border-t border-gray-200">
            <div className="bg-brand-jade-50 rounded-lg p-3">
              <h3 className="text-sm font-medium text-brand-jade-800 mb-2">Plan Premium</h3>
              <p className="text-xs text-brand-jade-600 mb-3">Accede a diagnósticos avanzados y consultas ilimitadas</p>
              <button className="w-full bg-brand-jade-500 hover:bg-brand-jade-600 text-white text-sm py-2 px-3 rounded-lg transition-colors">
                Actualizar ahora
              </button>
            </div>
          </div>
        </aside>
        
        {/* Main content area */}
        <main className={`flex-1 flex flex-col bg-white ${isMobileView && isSidebarOpen ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}>
          <div className="px-6 py-4 border-b border-gray-200 bg-white z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {activeTab === 'chat' && 'Consulta Médica'}
                {activeTab === 'analysis' && 'Análisis de Síntomas'}
                {activeTab === 'providers' && 'Proveedores Cercanos'}
                {activeTab === 'appointments' && 'Mis Citas'}
                {activeTab === 'prescriptions' && 'Mis Recetas'}
                {activeTab === 'pharmacies' && 'Farmacias Cercanas'}
              </h2>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {renderTabContent()}
          </div>
        </main>
        {/* Overlay to close sidebar on mobile */}
        {isMobileView && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close menu"
          ></div>
        )}
      </div>
      
      {/* Trust badges footer */}
      <footer className="bg-gray-50 border-t border-gray-200 p-4">
        <div className="flex justify-center space-x-8 mb-3">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600">Certificado por</div>
            <div className="font-bold text-gray-800">COFEPRIS</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600">Encriptación</div>
            <div className="font-bold text-gray-800">End-to-End</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600">Protegido con</div>
            <div className="font-bold text-gray-800">SSL 256-bit</div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-500">
          © 2023 Doctor.mx - Todos los derechos reservados
        </p>
      </footer>
    </div>
  );
}

export default AIDoctor;
