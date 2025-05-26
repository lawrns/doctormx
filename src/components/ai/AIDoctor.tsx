// ======================================================
// IMPORTANT: THIS FILE IS DEPRECATED
// This version of AIDoctor is no longer in use.
// The canonical version is in:
// /src/features/ai-doctor/components/AIDoctor.tsx
// Please make all changes to that file instead.
// This file only exists for backward compatibility.
// ======================================================

import React from 'react';
import AIDoctor from '../../features/ai-doctor/components/AIDoctor';

// Re-export the canonical version from features
export default AIDoctor;

type AIDoctorProps = {
  onClose?: () => void;
  isEmbedded?: boolean;
};

type Tab = 'chat' | 'analysis' | 'providers' | 'prescriptions' | 'appointments';

function AIDoctor({ onClose, isEmbedded = false }: AIDoctorProps) {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [severityLevel, setSeverityLevel] = useState(10);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: '¡Hola! Soy el Doctor IA de Doctor.mx. ¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chatContext = useChat();
  
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
  
  const handleSendMessage = async () => {
    if (!input.trim() && !isUploading) return;
    
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
    
    // Create a bot message placeholder with streaming indicators
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
      // Define the streaming response handler
      const streamingHandler: StreamingResponseHandler = (streamResponse: StreamingAIResponse) => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMessageId 
              ? { 
                  ...msg, 
                  text: streamResponse.text,
                  severity: streamResponse.severity,
                  isEmergency: streamResponse.isEmergency,
                  suggestedSpecialty: streamResponse.suggestedSpecialty,
                  suggestedConditions: streamResponse.suggestedConditions,
                  followUpQuestions: streamResponse.followUpQuestions,
                  isStreaming: streamResponse.isStreaming,
                  isComplete: streamResponse.isComplete
                } 
              : msg
          )
        );
        
        if (streamResponse.severity) {
          setSeverityLevel(streamResponse.severity);
        }
        
        // If streaming is completed, mark processing as finished
        if (streamResponse.isComplete) {
          setIsProcessing(false);
        }
      };
      
      const queryOptions: AIQueryOptions = {
        userMessage: input,
        userHistory: messages.map(m => m.text),
        severity: severityLevel,
        location: location || undefined,
        stream: true, // Enable streaming
        onStreamingResponse: streamingHandler // Pass the streaming handler
      };
      
      // Use streaming version which will update via the handler
      await AIService.processQuery(queryOptions);
      
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
      
      // Create a bot message placeholder with streaming indicators
      const botMessageId = (Date.now() + 1).toString();
      const initialBotMessage: Message = {
        id: botMessageId,
        text: 'Analizando imagen...',
        sender: 'bot',
        timestamp: new Date(),
        isStreaming: true,
        isComplete: false
      };
      
      setMessages(prev => [...prev, initialBotMessage]);
      
      // Define the streaming response handler for image analysis
      const streamingHandler: StreamingResponseHandler = (streamResponse: StreamingAIResponse) => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMessageId 
              ? { 
                  ...msg, 
                  text: streamResponse.text || msg.text,
                  severity: streamResponse.severity,
                  imageAnalysis: streamResponse.imageAnalysis,
                  suggestedSpecialty: streamResponse.suggestedSpecialty,
                  isStreaming: streamResponse.isStreaming,
                  isComplete: streamResponse.isComplete
                } 
              : msg
          )
        );
        
        if (streamResponse.severity) {
          setSeverityLevel(streamResponse.severity);
        }
        
        // If streaming is completed, mark uploading as finished
        if (streamResponse.isComplete) {
          setIsUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
      
      // For image analysis, let's adapt our AIService.analyzeImage call
      // Since the analyzeImage doesn't directly support streaming,
      // we'll simulate the streaming effect
      
      // Start with initial analysis status
      streamingHandler({
        text: "Analizando imagen... Detectando características visuales...",
        isStreaming: true,
        isComplete: false
      });
      
      // Get the actual response
      const response = await AIService.analyzeImage(imageUrl);
      
      // Use the full response for the final update
      streamingHandler({
        ...response,
        isStreaming: false,
        isComplete: true
      });
      
    } catch (error) {
      console.error('Error uploading image:', error);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hubo un error al procesar tu imagen. Por favor, intenta nuevamente.',
        sender: 'bot',
        timestamp: new Date(),
        isStreaming: false,
        isComplete: true
      }]);
      
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

  // Enhanced message component that uses the EnhancedChatBubble
  const MessageComponent = ({ message }: { message: Message }) => {
    return (
      <EnhancedChatBubble
        message={message}
        onFollowUpClick={(question) => {
          setInput(question);
        }}
        onOptionSelect={(option, questionId) => {
          console.log(`Selected option: ${option} for question ${questionId}`);
          setInput(option);
        }}
        onFindProviders={(specialty) => {
          findProviders(specialty);
        }}
      />
    );
  };

  const renderTabContent = () => {
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
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-jade-500"
                  disabled={isProcessing}
                />
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
              {isRecording && (
                <div className="mt-2 text-center text-sm text-red-600">
                  <span className="inline-block animate-pulse">●</span> Escuchando... Habla ahora
                </div>
              )}
              {isProcessing && (
                <div className="mt-2 text-center text-sm text-brand-jade-600">
                  <span className="inline-block">⟳</span> Procesando tu consulta...
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
                {appointments.map((appointment, index) => (
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
                {prescriptions.map((prescription, index) => (
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
    }
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
      <header className="bg-gradient-to-r from-brand-jade-500 to-brand-jade-600 p-4 text-white shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">Doctor.mx</h1>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="bg-white text-brand-jade-500 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
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
        {/* Sidebar */}
        <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
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
        <main className="flex-1 flex flex-col bg-white">
          <div className="px-6 py-4 border-b border-gray-200 bg-white z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {activeTab === 'chat' && 'Consulta Médica'}
                {activeTab === 'analysis' && 'Análisis de Síntomas'}
                {activeTab === 'providers' && 'Proveedores Cercanos'}
                {activeTab === 'appointments' && 'Mis Citas'}
                {activeTab === 'prescriptions' && 'Mis Recetas'}
              </h2>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {renderTabContent()}
          </div>
        </main>
      </div>
      
      {/* Trust badges footer */}
      <footer className="bg-gray-50 border-t border-gray-200 p-4">
        <div className="flex justify-center space-x-8 mb-3">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600">Certificado por</div>
            <div className="font-bold text-gray-800">Certificado</div>
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
