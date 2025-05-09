import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Image, Mic, X, MapPin, Calendar, Stethoscope, FileText, AlertCircle } from 'lucide-react';
import AIService, { AIResponse, AIQueryOptions } from '../../../core/services/ai/AIService';
import EncryptionService from '../../../core/services/security/EncryptionService';
import { useChat } from '../../../core/hooks/useChat';

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
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  
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
    
    try {
      const queryOptions: AIQueryOptions = {
        userMessage: input,
        userHistory: messages.map(m => m.text),
        severity: severityLevel,
        location: location || undefined
      };
      
      const response = await AIService.processQuery(queryOptions);
      
      if (response.severity) {
        setSeverityLevel(response.severity);
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
        severity: response.severity,
        isEmergency: response.isEmergency,
        suggestedSpecialty: response.suggestedSpecialty,
        suggestedConditions: response.suggestedConditions,
        followUpQuestions: response.followUpQuestions
      };
      
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
  
  const findPharmacies = async (medications: string[]) => {
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
      
      alert('Necesitamos tu ubicación para buscar farmacias cercanas.');
      return;
    }
    
    try {
      const pharmacyList = await AIService.getPharmacyRecommendations(medications, location);
      setPharmacies(pharmacyList);
      setActiveTab('pharmacies');
    } catch (error) {
      console.error('Error finding pharmacies:', error);
      alert('No se pudieron encontrar farmacias cercanas. Por favor, intenta nuevamente.');
    }
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

  const MessageComponent = ({ message }: { message: Message }) => {
    return (
      <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`rounded-lg px-4 py-2 max-w-md ${
          message.sender === 'user' 
            ? 'bg-blue-600 text-white' 
            : message.isEmergency
              ? 'bg-red-100 text-red-800 border border-red-200'
              : 'bg-gray-100 text-gray-800'
        }`}>
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
              
              {message.suggestedSpecialty && (
                <div className="mt-2">
                  <button
                    onClick={() => findProviders(message.suggestedSpecialty!)}
                    className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors flex items-center"
                  >
                    <MapPin size={14} className="mr-1" />
                    Buscar especialistas en {message.suggestedSpecialty}
                  </button>
                </div>
              )}
              
              {message.suggestedConditions && message.suggestedConditions.length > 0 && (
                <div className="mt-2">
                  <button
                    onClick={() => findPharmacies(['paracetamol', 'ibuprofeno'])} 
                    className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors flex items-center"
                  >
                    <svg className="mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Buscar en farmacias
                  </button>
                </div>
              )}
              
              {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.followUpQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInput(question);
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
        </div>
      </div>
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
                              {pharmacy.available_medications.slice(0, 3).map((med, idx) => (
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
      <header className="bg-blue-600 p-4 text-white shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">Doctor.mx</h1>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-medium"
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
          <div className="p-4 border-b border-gray-200 bg-gradient-to-b from-blue-50 to-white">
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
                      ? 'bg-blue-100 text-blue-700 font-medium' 
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
                      ? 'bg-blue-100 text-blue-700 font-medium' 
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
                      ? 'bg-blue-100 text-blue-700 font-medium' 
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
                      ? 'bg-blue-100 text-blue-700 font-medium' 
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
                      ? 'bg-blue-100 text-blue-700 font-medium' 
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
            <div className="bg-blue-50 rounded-lg p-3">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Plan Premium</h3>
              <p className="text-xs text-blue-600 mb-3">Accede a diagnósticos avanzados y consultas ilimitadas</p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg">
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
                {activeTab === 'pharmacies' && 'Farmacias Cercanas'}
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
