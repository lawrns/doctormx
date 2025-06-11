import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, Camera, FileText, Activity, Brain, Stethoscope,
  AlertTriangle, Phone, Video, MapPin, Clock, Shield,
  Heart, Zap, Volume2, MicOff, Send, Image, Upload,
  Thermometer, Clipboard, Pills, Calendar, Users
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import SEO from '../../../core/components/SEO';
import ClientOnly from '../../../components/ClientOnly';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import UnifiedMedicalAI, { MultiModalInput, MedicalAnalysisResult } from '../../../services/ai/UnifiedMedicalAI';

// Lazy load heavy components
const VoiceInputProcessor = React.lazy(() => import('../components/VoiceInputProcessor'));
const MedicalImageAnalyzer = React.lazy(() => import('../components/MedicalImageAnalyzer'));
const VitalSignsInput = React.lazy(() => import('../components/VitalSignsInput'));
const EmergencyProtocol = React.lazy(() => import('../components/EmergencyProtocol'));
const CulturalContextProcessor = React.lazy(() => import('../components/CulturalContextProcessor'));
const MultiAIResponseEngine = React.lazy(() => import('../components/MultiAIResponseEngine'));
const ActionableRecommendations = React.lazy(() => import('../components/ActionableRecommendations'));

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  confidence?: number;
  type?: 'text' | 'voice' | 'image' | 'vitals' | 'emergency';
  analysis?: MedicalAnalysisResult;
  multiModalData?: MultiModalInput;
}

interface ActiveInputModes {
  voice: boolean;
  camera: boolean;
  vitals: boolean;
  emergency: boolean;
}

const INPUT_MODES = [
  { 
    key: 'text', 
    icon: FileText, 
    label: 'Texto', 
    description: 'Describe tus síntomas',
    color: 'text-blue-600',
    available: true 
  },
  { 
    key: 'voice', 
    icon: Mic, 
    label: 'Voz', 
    description: 'Habla en español mexicano',
    color: 'text-green-600',
    available: true 
  },
  { 
    key: 'camera', 
    icon: Camera, 
    label: 'Imagen', 
    description: 'Foto de síntomas o medicamentos',
    color: 'text-purple-600',
    available: true 
  },
  { 
    key: 'vitals', 
    icon: Activity, 
    label: 'Signos Vitales', 
    description: 'Datos de dispositivos conectados',
    color: 'text-red-600',
    available: true 
  },
  { 
    key: 'emergency', 
    icon: AlertTriangle, 
    label: 'Emergencia', 
    description: 'Consulta urgente inmediata',
    color: 'text-orange-600',
    available: true 
  }
];

const AI_MODELS = [
  { name: 'GPT-4 Medical', status: 'active', confidence: 98, specialty: 'Diagnóstico General' },
  { name: 'Claude Medical', status: 'active', confidence: 96, specialty: 'Análisis Conversacional' },
  { name: 'Gemini Cultural', status: 'active', confidence: 94, specialty: 'Contexto Mexicano' },
  { name: 'Specialized Emergency', status: 'standby', confidence: 99, specialty: 'Detección de Emergencias' }
];

export default function ComprehensiveMedicalAI() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeModes, setActiveModes] = useState<ActiveInputModes>({
    voice: false,
    camera: false,
    vitals: false,
    emergency: false
  });
  const [currentAnalysis, setCurrentAnalysis] = useState<MedicalAnalysisResult | null>(null);
  const [aiModelsStatus, setAiModelsStatus] = useState(AI_MODELS);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [connectedDevices, setConnectedDevices] = useState<any[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const medicalAI = useRef(new UnifiedMedicalAI());
  const initialMessage = location.state?.initialMessage;

  useEffect(() => {
    if (initialMessage) {
      handleSendMessage(initialMessage);
    }
    
    // Initialize user location and devices
    initializeUserContext();
    
    // Add welcome message
    addWelcomeMessage();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeUserContext = async () => {
    try {
      // Get user's location for localized healthcare recommendations
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              coordinates: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              },
              address: 'Ciudad de México, México', // Would be geocoded
              healthcareAvailability: ['IMSS', 'ISSSTE', 'Hospitales Privados']
            });
          },
          (error) => console.log('Location access denied:', error)
        );
      }

      // Check for connected health devices
      if ('bluetooth' in navigator) {
        // Would implement Web Bluetooth API for device connectivity
        setConnectedDevices([
          { type: 'heart_rate', name: 'Apple Watch', connected: true },
          { type: 'glucose', name: 'Glucómetro FreeStyle', connected: false }
        ]);
      }
    } catch (error) {
      console.error('Error initializing user context:', error);
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: `msg-${Date.now()}`,
      text: `¡Hola${user ? ` ${user.user_metadata?.fullName || ''}` : ''}! Soy Dr. Simeon, tu asistente médico con IA avanzada. Puedo ayudarte de múltiples formas:

📝 Describe tus síntomas por texto
🎤 Háblame en español mexicano  
📸 Muéstrame fotos de síntomas o medicamentos
📊 Analiza tus signos vitales
🚨 Manejo consultas de emergencia

¿En qué puedo ayudarte hoy?`,
      sender: 'ai',
      timestamp: new Date(),
      confidence: 98,
      type: 'text'
    };

    setMessages([welcomeMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text: string, multiModalData?: Partial<MultiModalInput>) => {
    if (!text.trim() && !multiModalData) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      text: text || 'Entrada multimedia',
      sender: 'user',
      timestamp: new Date(),
      type: multiModalData ? 'voice' : 'text',
      multiModalData: multiModalData as MultiModalInput
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    try {
      // Prepare multi-modal input
      const input: MultiModalInput = {
        text,
        location: userLocation,
        ...multiModalData
      };

      // Get user's cultural context
      const culturalContext = {
        traditionalMedicineIntegration: user?.user_metadata?.usesTraditionalMedicine || false,
        familyHealthDecisionMaking: user?.user_metadata?.familyDecisionMaking || true,
        languagePreferences: ['es-MX'],
        healthBeliefs: user?.user_metadata?.healthBeliefs || [],
        religiousConsiderations: user?.user_metadata?.religiousConsiderations || []
      };

      // Analyze with unified AI
      const analysis = await medicalAI.current.analyzeMedicalQuery(
        input,
        user?.user_metadata || {},
        culturalContext
      );

      setCurrentAnalysis(analysis);

      // Create AI response message
      const aiResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        text: formatAIResponse(analysis),
        sender: 'ai',
        timestamp: new Date(),
        confidence: analysis.confidence,
        type: 'text',
        analysis
      };

      setMessages(prev => [...prev, aiResponse]);

      // Handle emergency situations
      if (analysis.urgencyLevel === 'emergency') {
        setActiveModes(prev => ({ ...prev, emergency: true }));
        showToast('⚠️ Situación de emergencia detectada. Busca atención médica inmediata.', 'error');
      }

    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        text: 'Lo siento, hubo un error procesando tu consulta. Por favor, intenta nuevamente o si es urgente, busca atención médica inmediata.',
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, errorMessage]);
      showToast('Error en el análisis médico', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAIResponse = (analysis: MedicalAnalysisResult): string => {
    let response = `**Análisis Médico Integral**\n\n`;
    
    if (analysis.primaryDiagnosis) {
      response += `🔍 **Análisis Principal**: ${analysis.primaryDiagnosis}\n`;
      response += `📊 **Nivel de Confianza**: ${analysis.confidence}%\n\n`;
    }

    if (analysis.urgencyLevel !== 'low') {
      response += `⚠️ **Nivel de Urgencia**: ${analysis.urgencyLevel.toUpperCase()}\n\n`;
    }

    if (analysis.recommendedActions.length > 0) {
      response += `📋 **Recomendaciones**:\n`;
      analysis.recommendedActions.forEach((action, index) => {
        response += `${index + 1}. ${action}\n`;
      });
      response += '\n';
    }

    if (analysis.culturalConsiderations.length > 0) {
      response += `🏛️ **Consideraciones Culturales**:\n`;
      analysis.culturalConsiderations.forEach((consideration, index) => {
        response += `• ${consideration}\n`;
      });
      response += '\n';
    }

    if (analysis.mexicanHealthcareContext?.imssRecommendations?.length) {
      response += `🏥 **Opciones en Sistema de Salud Mexicano**:\n`;
      response += `**IMSS**: ${analysis.mexicanHealthcareContext.imssRecommendations.join(', ')}\n`;
      
      if (analysis.mexicanHealthcareContext.privateOptions?.length) {
        response += `**Privado**: ${analysis.mexicanHealthcareContext.privateOptions.join(', ')}\n`;
      }
      response += '\n';
    }

    if (analysis.followUpRequired) {
      response += `📅 **Seguimiento**: Se recomienda seguimiento médico profesional.\n\n`;
    }

    response += `⚕️ *Este análisis es generado por IA y no sustituye la consulta médica profesional.*`;

    return response;
  };

  const handleVoiceInput = useCallback(async (audioData: ArrayBuffer, transcript: string) => {
    const voiceInput = {
      voice: {
        audioData,
        language: 'es-MX',
        dialect: 'mexican'
      }
    };

    await handleSendMessage(transcript, voiceInput);
  }, []);

  const handleImageInput = useCallback(async (imageData: string, imageType: string, analysis: any) => {
    const imageInput = {
      image: {
        imageData,
        type: imageType as 'symptom' | 'medication' | 'test_result' | 'general'
      }
    };

    const description = `Imagen médica analizizada: ${analysis?.description || 'Análisis de imagen'}`; 
    await handleSendMessage(description, imageInput);
  }, []);

  const handleVitalsInput = useCallback(async (vitalsData: any) => {
    const vitalsInput = {
      vitals: vitalsData
    };

    const description = `Signos vitales: ${Object.entries(vitalsData).map(([key, value]) => `${key}: ${value}`).join(', ')}`;
    await handleSendMessage(description, vitalsInput);
  }, []);

  const toggleInputMode = (mode: keyof ActiveInputModes) => {
    setActiveModes(prev => ({
      ...prev,
      [mode]: !prev[mode]
    }));
  };

  const handleEmergencyAction = (action: string) => {
    switch (action) {
      case 'call_911':
        window.open('tel:911');
        break;
      case 'find_hospital':
        navigate('/emergency-centers');
        break;
      case 'contact_family':
        navigate('/emergency-contacts');
        break;
    }
  };

  return (
    <>
      <SEO
        title="Doctor IA Avanzado | Asistente médico integral con múltiples modalidades"
        description="Consulta médica avanzada con IA multi-modal: texto, voz, imágenes y signos vitales. Análisis cultural mexicano y detección de emergencias."
        canonical="/medical-ai"
        keywords="doctor ia avanzado, consulta médica multimodal, análisis voz imágenes, emergencias médicas, salud méxico"
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* AI Models Status Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  IA Médica Colaborativa
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {aiModelsStatus.slice(0, 3).map((model, index) => (
                  <div key={model.name} className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${
                      model.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      {model.name.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <Shield className="w-4 h-4" />
              <span>Cifrado E2E</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Main Chat Interface */}
            <div className="lg:col-span-3">
              <Card className="h-[calc(100vh-200px)] flex flex-col bg-white dark:bg-gray-900">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                        <Stethoscope className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Dr. Simeon IA Avanzado
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Asistente Médico Multi-Modal
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/appointments')}
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        Cita Real
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/family-health')}
                      >
                        <Users className="w-4 h-4 mr-1" />
                        Familia
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-3xl p-4 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                        }`}>
                          <div className="whitespace-pre-wrap">{message.text}</div>
                          
                          {message.confidence && (
                            <div className="mt-2 flex items-center space-x-2 text-sm opacity-75">
                              <Brain className="w-3 h-3" />
                              <span>Confianza: {message.confidence}%</span>
                              <Clock className="w-3 h-3 ml-2" />
                              <span>{message.timestamp.toLocaleTimeString()}</span>
                            </div>
                          )}

                          {message.analysis && (
                            <Suspense fallback={<div className="mt-2 h-8 bg-gray-200 rounded animate-pulse"></div>}>
                              <ActionableRecommendations 
                                analysis={message.analysis}
                                onAction={(action) => {
                                  if (action.type === 'schedule_appointment') {
                                    navigate('/appointments');
                                  } else if (action.type === 'find_pharmacy') {
                                    navigate('/pharmacies');
                                  } else if (action.type === 'emergency') {
                                    handleEmergencyAction(action.subtype);
                                  }
                                }}
                              />
                            </Suspense>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isProcessing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            Analizando con múltiples IAs...
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  {/* Input Mode Selector */}
                  <div className="flex items-center space-x-2 mb-3 overflow-x-auto">
                    {INPUT_MODES.map((mode) => (
                      <Button
                        key={mode.key}
                        variant={activeModes[mode.key as keyof ActiveInputModes] ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleInputMode(mode.key as keyof ActiveInputModes)}
                        className={`flex items-center space-x-1 whitespace-nowrap ${mode.color}`}
                        disabled={!mode.available}
                      >
                        <mode.icon className="w-4 h-4" />
                        <span>{mode.label}</span>
                      </Button>
                    ))}
                  </div>

                  {/* Text Input */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                      placeholder="Describe tus síntomas, haz una pregunta médica, o usa los modos avanzados..."
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      disabled={isProcessing}
                    />
                    
                    <Button
                      onClick={() => handleSendMessage(inputText)}
                      disabled={!inputText.trim() || isProcessing}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Side Panel with Advanced Features */}
            <div className="space-y-6">
              {/* Emergency Protocol */}
              {activeModes.emergency && (
                <Suspense fallback={<div className="h-32 bg-gray-200 rounded animate-pulse"></div>}>
                  <EmergencyProtocol 
                    onEmergencyAction={handleEmergencyAction}
                    userLocation={userLocation}
                  />
                </Suspense>
              )}

              {/* Voice Input */}
              {activeModes.voice && (
                <Suspense fallback={<div className="h-32 bg-gray-200 rounded animate-pulse"></div>}>
                  <VoiceInputProcessor 
                    onVoiceInput={handleVoiceInput}
                    language="es-MX"
                    dialect="mexican"
                  />
                </Suspense>
              )}

              {/* Medical Image Analyzer */}
              {activeModes.camera && (
                <Suspense fallback={<div className="h-32 bg-gray-200 rounded animate-pulse"></div>}>
                  <MedicalImageAnalyzer 
                    onImageAnalysis={handleImageInput}
                    supportedTypes={['symptom', 'medication', 'test_result']}
                  />
                </Suspense>
              )}

              {/* Vital Signs Input */}
              {activeModes.vitals && (
                <Suspense fallback={<div className="h-32 bg-gray-200 rounded animate-pulse"></div>}>
                  <VitalSignsInput 
                    onVitalsInput={handleVitalsInput}
                    connectedDevices={connectedDevices}
                  />
                </Suspense>
              )}

              {/* Cultural Context Processor */}
              <Suspense fallback={<div className="h-32 bg-gray-200 rounded animate-pulse"></div>}>
                <CulturalContextProcessor 
                  userProfile={user?.user_metadata}
                  onContextUpdate={(context) => console.log('Cultural context updated:', context)}
                />
              </Suspense>

              {/* Multi-AI Response Engine Status */}
              <Suspense fallback={<div className="h-32 bg-gray-200 rounded animate-pulse"></div>}>
                <MultiAIResponseEngine 
                  models={aiModelsStatus}
                  currentAnalysis={currentAnalysis}
                  onModelToggle={(modelName, enabled) => {
                    setAiModelsStatus(prev => 
                      prev.map(model => 
                        model.name === modelName 
                          ? { ...model, status: enabled ? 'active' : 'standby' }
                          : model
                      )
                    );
                  }}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}