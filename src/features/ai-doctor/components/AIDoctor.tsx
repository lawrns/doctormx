import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image, Mic, MapPin, Calendar, Stethoscope, FileText, AlertCircle, Clock, ThermometerIcon, Activity, Pill, ArrowLeft, Menu, X } from 'lucide-react';
import AIService, { AIQueryOptions } from '../../../services/ai/AIService';
import EncryptionService from '../../../services/security/EncryptionService';

const OPENAI_KEY_STORAGE_KEY = 'openai_api_key';
const DOCTOR_INSTRUCTIONS_KEY = 'doctor_instructions';
const DOCTOR_IMAGE_ANALYSIS_ENABLED_KEY = 'doctor_image_analysis_enabled';

type Message = {
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
  nearbyProviders?: any[];
  interactiveOptions?: {
    type: 'symptom_category' | 'symptom_duration' | 'symptom_severity' | 'yes_no' | 'follow_up_preference';
    options: string[];
    questionId: string;
  };
  nextQuestionId?: string;
  previousQuestionId?: string;
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
      
      const queryOptions: AIQueryOptions = {
        userMessage: input,
        userHistory: messages.map(m => m.text),
        severity: severityLevel,
        location: location || undefined,
        usePremiumModel: imageAnalysisEnabled || input.length > 100 || input.includes('imagen') || input.includes('photo'),
        customInstructions: doctorInstructions || undefined
      };
      
      const response = await AIService.processQuery(queryOptions);
      
      if (response.severity) {
        setSeverityLevel(response.severity);
      }
      
      const lowerInput = input.toLowerCase();
      let botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
        severity: response.severity,
        isEmergency: response.isEmergency,
        suggestedSpecialty: response.suggestedSpecialty,
        suggestedConditions: response.suggestedConditions,
        suggestedMedications: response.suggestedMedications,
        followUpQuestions: response.followUpQuestions
      };
      
      if (lowerInput.includes('dolor') && !botMessage.interactiveOptions) {
        botMessage.interactiveOptions = {
          type: 'symptom_severity',
          options: ['Leve', 'Moderada', 'Severa'],
          questionId: 'severity_pain_text'
        };
        setCurrentQuestionId('severity_pain_text');
      } else if ((lowerInput.includes('fiebre') || lowerInput.includes('temperatura')) && !botMessage.interactiveOptions) {
        botMessage.interactiveOptions = {
          type: 'symptom_duration',
          options: ['Menos de 24 horas', '1-3 días', '1-2 semanas', 'Más tiempo'],
          questionId: 'duration_fever_text'
        };
        setCurrentQuestionId('duration_fever_text');
      }
      
      if (botMessage.suggestedConditions && botMessage.suggestedConditions.length > 0) {
        if (!botMessage.interactiveOptions) {
          botMessage.interactiveOptions = {
            type: 'yes_no',
            options: ['Ver medicamentos recomendados', 'No, gracias'],
            questionId: 'pharmacy_recommendation'
          };
          setCurrentQuestionId('pharmacy_recommendation');
        } else {
          if (!botMessage.followUpQuestions) {
            botMessage.followUpQuestions = [];
          }
          botMessage.followUpQuestions.push('Ver medicamentos recomendados');
        }
      }
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.',
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
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
      
      const imageMessageId = Date.now().toString();
      setMessages(prev => [...prev, {
        id: imageMessageId,
        text: 'He subido una imagen para análisis médico.',
        sender: 'user',
        timestamp: new Date(),
        containsImage: true,
        imageUrl
      }]);
      
      const response = await AIService.analyzeImage(imageUrl);
      
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
        suggestedSpecialty: response.suggestedSpecialty
      }]);
    } catch (error) {
      console.error('Error uploading image:', error);
      
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
  
  const handleMicClick = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      setTimeout(() => {
        setInput('Tengo dolor de cabeza y un poco de fiebre');
        setIsRecording(false);
      }, 2000);
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
    const genericPharmacies = [
      {
        name: 'Farmacia del Ahorro',
        address: 'Múltiples sucursales en México',
        distance: null,
        medications: medications,
        logo: 'https://www.farmaciasdelahorro.com.mx/static/version1714504312/frontend/FDA/fda/es_MX/images/logo.svg'
      },
      {
        name: 'Farmacias Similares',
        address: 'Múltiples sucursales en México',
        distance: null,
        medications: medications,
        logo: 'https://www.farmaciasdesimilares.com/static/media/logo-similares.a7e1b5f3.svg'
      }
    ];
    
    setPharmacies(genericPharmacies);
    setActiveTab('pharmacies');
  };
  
  const getSeverityColor = () => {
    if (severityLevel < 30) return 'bg-green-500';
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

  const MessageComponent = ({ message }: { message: Message }) => {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={messageVariants}
        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className={`rounded-lg px-4 py-2 max-w-md ${
            message.sender === 'user' 
              ? 'bg-blue-600 text-white' 
              : message.isEmergency
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-gray-100 text-gray-800'
          }`}
        >
          <div className="flex items-center mb-1">
            {message.sender === 'bot' ? (
              <Stethoscope size={16} className="mr-1 text-blue-600" />
            ) : (
              <div className="w-4 h-4 rounded-full bg-white mr-1 flex items-center justify-center">
                <span className="text-blue-600 text-xs">U</span>
              </div>
            )}
            <span className={`text-xs ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          {message.isEmergency ? (
            <div>
              <div className="flex items-center mb-2">
                <AlertCircle size={16} className="text-red-600 mr-1" />
                <span className="font-bold">Emergencia Médica</span>
              </div>
              <p>{message.text}</p>
            </div>
          ) : (
            <>
              <p>{message.text}</p>
              
              {message.containsImage && message.imageUrl && (
                <div className="mt-2">
                  <img 
                    src={message.imageUrl} 
                    alt="Imagen médica" 
                    className="rounded-md max-h-48 max-w-full"
                  />
                </div>
              )}
              
              {message.imageAnalysis && (
                <div className="mt-2 p-2 bg-blue-50 rounded-md text-sm">
                  <p className="font-medium text-blue-800">Análisis de imagen:</p>
                  <p>{message.imageAnalysis.findings}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Confianza: {Math.round(message.imageAnalysis.confidence * 100)}%
                  </p>
                </div>
              )}
              
              {/* Interactive Options Buttons */}
              {message.interactiveOptions && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-2">
                    {message.interactiveOptions.options.map((option, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOptionSelect(option, message.interactiveOptions!.questionId)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all ${
                          message.interactiveOptions!.type === 'symptom_category' 
                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 border border-blue-200'
                            : message.interactiveOptions!.type === 'symptom_duration'
                              ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 border border-blue-200'
                              : message.interactiveOptions!.type === 'symptom_severity'
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : message.interactiveOptions!.type === 'yes_no' && option.includes('Ver medicamentos')
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200 border border-blue-200'
                        }`}
                      >
                        {message.interactiveOptions!.type === 'symptom_category' && (
                          <>{option === 'Dolor' ? <Activity size={14} className="inline mr-1" /> :
                             option === 'Fiebre' ? <ThermometerIcon size={14} className="inline mr-1" /> :
                             option === 'Digestivo' ? <svg className="inline mr-1 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                             </svg> :
                             <></>
                          }</>
                        )}
                        {message.interactiveOptions!.type === 'symptom_duration' && (
                          <Clock size={14} className="inline mr-1" />
                        )}
                        {option}
                      </motion.button>
                    ))}
                  </div>
                  
                  {/* Go back button */}
                  {questionHistory.length > 1 && message.sender === 'bot' && (
                    <motion.button
                      whileHover={{ x: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleGoBack}
                      className="mt-2 text-xs text-blue-600 flex items-center hover:text-blue-700 transition-colors"
                    >
                      <ArrowLeft size={12} className="mr-1" />
                      Volver a la pregunta anterior
                    </motion.button>
                  )}
                </div>
              )}
              
              {message.suggestedSpecialty && (
                <div className="mt-2">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => findProviders(message.suggestedSpecialty!)}
                    className="text-sm bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-all flex items-center shadow-sm border border-blue-200"
                  >
                    <MapPin size={14} className="mr-1" />
                    Buscar especialistas en {message.suggestedSpecialty}
                  </motion.button>
                </div>
              )}
              
              {message.suggestedMedications && message.suggestedMedications.length > 0 && (
                <div className="mt-2">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => findPharmacies(message.suggestedMedications!)} 
                    className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center shadow-sm"
                  >
                    <Pill size={14} className="mr-1" />
                    Buscar medicamentos recomendados
                  </motion.button>
                </div>
              )}
              
              {message.suggestedConditions && message.suggestedConditions.length > 0 && !message.suggestedMedications && (
                <div className="mt-2">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => findPharmacies(['paracetamol', 'ibuprofeno'])} 
                    className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center shadow-sm"
                  >
                    <svg className="mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Buscar en farmacias
                  </motion.button>
                </div>
              )}
              
              {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.followUpQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInput(question);
                        setTimeout(() => handleSendMessage(), 100);
                      }}
                      className="block w-full text-left text-sm bg-gray-50 hover:bg-gray-100 p-2 rounded-md transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    );
  };

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
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((message) => (
                        <MessageComponent key={message.id} message={message} />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                    
                    {/* Input area */}
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <button 
                          onClick={handleMicClick}
                          className={`p-2 rounded-full ${isRecording ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:text-blue-600'}`}
                          aria-label="Usar micrófono"
                        >
                          <Mic size={20} />
                        </button>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className={`p-2 rounded-full ${isUploading ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
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
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Describe tus síntomas o haz una pregunta..."
                          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isProcessing}
                        />
                        <button 
                          onClick={handleSendMessage}
                          disabled={(!input.trim() && !isUploading) || isProcessing}
                          className={`p-2 rounded-full ${
                            (!input.trim() && !isUploading) || isProcessing
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-blue-600 hover:bg-blue-50'
                          }`}
                          aria-label="Enviar mensaje"
                        >
                          <Send size={20} />
                        </button>
                      </div>
                      {isRecording && (
                        <div className="mt-2 text-center text-sm text-red-600">
                          <span className="inline-block animate-pulse">●</span> Escuchando... Habla ahora
                        </div>
                      )}
                      {isProcessing && (
                        <div className="mt-2 text-center text-sm text-blue-600">
                          <span className="inline-block">⟳</span> Procesando tu consulta...
                        </div>
                      )}
                      {!localStorage.getItem(OPENAI_KEY_STORAGE_KEY) && (
                        <div className="mt-2 text-center">
                          <Link to="/settings/api" className="text-xs text-blue-600 hover:underline">
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
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full mr-2 mt-0.5">
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
                                  <p className="font-medium text-blue-700">{message.suggestedSpecialty}</p>
                                  <button
                                    onClick={() => findProviders(message.suggestedSpecialty!)}
                                    className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors flex items-center"
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
                                <p className="text-blue-700">{provider.specialty || 'Especialidad'}</p>
                                <p className="text-sm text-gray-600 mt-1">{provider.address || 'Dirección del consultorio'}</p>
                                <div className="mt-3 flex space-x-2">
                                  <button
                                    onClick={() => scheduleAppointment(provider.id || `provider-${index}`)}
                                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors flex items-center"
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
                                <p className="text-blue-700">Consulta general</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {new Date().toLocaleDateString()} - 10:00 AM
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <button className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200 transition-colors">
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
                                <button className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200 transition-colors flex items-center">
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
                    <h3 className="text-xl font-semibold mb-4">Farmacias Cercanas</h3>
                    
                    {pharmacies.length > 0 ? (
                      <div className="space-y-4">
                        {pharmacies.map((pharmacy, index) => (
                          <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                            <div className="flex items-start">
                              <div className="w-16 h-16 bg-green-100 rounded-full mr-4 flex-shrink-0 flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                                        <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
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
                                    className="text-sm bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors flex items-center"
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
        <div className="bg-blue-600 p-4 text-white">
          <h3 className="font-semibold text-lg">Doctor IA</h3>
        </div>
        {renderTabContent()}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">Doctor.mx</h1>
            <div className="flex items-center ml-4">
              <img src="/mexico-flag.png" alt="Mexico" className="h-4 w-auto mr-1" />
              <span className="text-xs font-medium">Hecho en México</span>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-50"
            >
              Cerrar
            </button>
          )}
        </div>
      </header>
      
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
            className="fixed top-20 left-2 z-50 bg-blue-600 text-white p-2 rounded-full shadow-lg"
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
          <div className="p-4 border-b border-gray-200 bg-gradient-to-b from-[#e6f7f3] to-white">
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
                      ? 'bg-blue-100 text-blue-600 font-medium' 
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
                      ? 'bg-blue-100 text-blue-600 font-medium' 
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
                      ? 'bg-blue-100 text-blue-600 font-medium' 
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
                      ? 'bg-blue-100 text-blue-600 font-medium' 
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
                      ? 'bg-blue-100 text-blue-600 font-medium' 
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
                      ? 'bg-green-100 text-green-700 font-medium' 
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
            <div className="bg-blue-100 rounded-lg p-3">
              <h3 className="text-sm font-medium text-blue-600 mb-2">Plan Premium</h3>
              <p className="text-xs text-blue-700 mb-3">Accede a diagnósticos avanzados y consultas ilimitadas</p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg">
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
