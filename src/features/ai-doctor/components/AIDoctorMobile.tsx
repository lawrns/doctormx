import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Image, Mic, ArrowLeft, MoreVertical, Phone, Video,
  Paperclip, Camera, MapPin, X, Check, CheckCheck
} from 'lucide-react';
import { enhancedAIService, EnhancedAIQueryOptions, EnhancedStreamingAIResponse, EnhancedStreamingResponseHandler } from '../../../core/services/ai/EnhancedAIService';
import EncryptionService from '../../../core/services/security/EncryptionService';
import { AIAnswerOption } from '../../../core/services/ai/AIService';
import { ConversationFlowService } from '../services/ConversationFlowService';
import { getSpeechRecognitionService, SpeechRecognitionService } from '../services/SpeechRecognitionService';
import { WhatsAppQuickReplies, generateQuickReplies, generatePsychologicalReplies } from './WhatsAppQuickReplies';
import { SimpleTypingBubble, useTypingIndicator, calculateTypingDelay } from './SimpleTypingBubble';
import { PsychologicalResponseTemplates } from '../services/PsychologicalResponseTemplates';
import { ConversationIntelligence } from '../services/ConversationIntelligence';
import { DiagnosticService } from '../services/DiagnosticService';
import './styles/whatsapp-components.css';

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
  isStreaming?: boolean;
  isComplete?: boolean;
  emotionalState?: any;
  personalityApplied?: boolean;
  thinkingStages?: string[];
  culturalFactors?: string[];
  status?: 'sent' | 'delivered' | 'read';
};

interface AIDoctorMobileProps {
  initialMessage?: string;
  onBack?: () => void;
}

const MEXICAN_QUICK_SYMPTOMS = [
  { text: 'Tengo diabetes', icon: '🩺' },
  { text: 'Dolor de cabeza', icon: '🤕' },
  { text: 'Fiebre alta', icon: '🌡️' },
  { text: 'Presión alta', icon: '❤️' },
  { text: 'Dolor de estómago', icon: '😷' },
  { text: 'Tos y gripe', icon: '🤧' }
];

function AIDoctorMobile({ initialMessage, onBack }: AIDoctorMobileProps) {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [conversationStage, setConversationStage] = useState<'greeting' | 'symptom' | 'severity' | 'treatment' | 'followup'>('greeting');
  
  // Use the new typing indicator hook
  const { isTyping, startTyping, stopTyping } = useTypingIndicator();
  
  // Add isThinking state for AI processing
  const [isThinking, setIsThinking] = useState(false);
  
  // Session management
  const [sessionId] = useState(`session_${Date.now()}`);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Initialize with WhatsApp-style greeting
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: '¡Hola! Soy Dr. Simeon 👨‍⚕️\n\nTu médico mexicano inteligente disponible 24/7. ¿Cómo puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
      personalityApplied: true,
      status: 'read',
      followUpQuestions: ['Tengo síntomas', 'Necesito un médico', 'Consulta general', 'Emergencia']
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialMessageSentRef = useRef(false);
  
  // Generate contextual quick replies based on conversation
  const generateContextualQuickReplies = () => {
    const lastMessage = messages[messages.length - 1];
    
    // Check for psychological needs
    const psychNeed = PsychologicalResponseTemplates.detectPsychologicalNeed(
      lastMessage?.text || ''
    );
    
    if (psychNeed.detected && psychNeed.confidence > 0.5) {
      return generatePsychologicalReplies({
        condition: psychNeed.condition || 'ansiedad',
        severity: psychNeed.severity
      });
    }
    
    // Generate based on conversation stage
    return generateQuickReplies({
      stage: conversationStage,
      lastMessage: lastMessage?.text,
      hasImage: lastMessage?.containsImage
    });
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
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
    
    const userMessageId = Date.now().toString();
    const newUserMessage: Message = { 
      id: userMessageId,
      text: input,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    const userInput = input;
    setInput('');
    setShowQuickReplies(false);
    setIsProcessing(true);
    
    // Start typing indicator with natural delay
    startTyping();
    
    // Auto-resize textarea back to original
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
    }

    // Update message status to delivered
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessageId 
            ? { ...msg, status: 'delivered' } 
            : msg
        )
      );
    }, 500);

    // Update message status to read
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessageId 
            ? { ...msg, status: 'read' } 
            : msg
        )
      );
    }, 1000);

    // Create a bot message placeholder
    const botMessageId = (Date.now() + 1).toString();
    
    try {
      // Check if this is a simple greeting or conversation
      const conversationAnalysis = ConversationFlowService.analyzeMessage(userInput);
      const shouldSkipAI = ConversationFlowService.shouldSkipAIProcessing(userInput);
      const needsThinking = ConversationFlowService.needsThinkingAnimation(userInput);
      
      // Handle simple responses immediately without AI processing
      if (shouldSkipAI) {
        const simpleResponse = ConversationFlowService.generateSimpleResponse(conversationAnalysis.type, userInput);
        if (simpleResponse) {
          stopTyping();
          setMessages(prev => [...prev, {
            id: botMessageId,
            text: simpleResponse,
            sender: 'bot',
            timestamp: new Date(),
            isStreaming: false,
            isComplete: true,
            status: 'delivered'
          }]);
          setIsProcessing(false);
          return;
        }
      }
      
      // Update conversation stage based on analysis
      if (conversationAnalysis.type === 'greeting') {
        setConversationStage('greeting');
      } else if (userInput.toLowerCase().includes('dolor') || userInput.toLowerCase().includes('síntoma')) {
        setConversationStage('symptom');
      }

      // Enhanced streaming response handler
      const streamingHandler: EnhancedStreamingResponseHandler = (streamResponse: EnhancedStreamingAIResponse) => {
        stopTyping();
        
        // Simple response handling - no complex animations
        
        // Update or create message with streaming content
        setMessages(prev => {
          const existingIndex = prev.findIndex(m => m.id === botMessageId);
          
          const updatedMessage: Message = {
            id: botMessageId,
            text: streamResponse.text,
            sender: 'bot',
            timestamp: new Date(),
            severity: streamResponse.severity,
            isEmergency: streamResponse.isEmergency,
            suggestedSpecialty: streamResponse.suggestedSpecialty,
            suggestedConditions: streamResponse.suggestedConditions,
            suggestedMedications: streamResponse.suggestedMedications,
            followUpQuestions: streamResponse.followUpQuestions,
            answerOptions: streamResponse.answerOptions,
            isStreaming: streamResponse.isStreaming,
            isComplete: streamResponse.isComplete,
            emotionalState: streamResponse.emotionalState,
            personalityApplied: streamResponse.personalityApplied,
            thinkingStages: streamResponse.thinkingStages,
            culturalFactors: streamResponse.culturalFactors,
            status: 'delivered'
          };
          
          if (existingIndex !== -1) {
            const updatedMessages = [...prev];
            updatedMessages[existingIndex] = updatedMessage;
            return updatedMessages;
          } else {
            return [...prev, updatedMessage];
          }
        });
        
        // If streaming is completed
        if (streamResponse.isComplete) {
          setIsProcessing(false);
          setIsThinking(false);
          
          // Show quick replies if there are follow-up questions
          if (streamResponse.followUpQuestions && streamResponse.followUpQuestions.length > 0) {
            setShowQuickReplies(true);
          }
        }
      };

      // Get conversation context hints
      const contextHints = ConversationFlowService.getContextHints(messages);
      
      const queryOptions: EnhancedAIQueryOptions = {
        userMessage: userInput,
        userHistory: messages.map(m => m.text),
        severity: 5,
        location: location || undefined,
        sessionId: sessionId,
        enablePersonality: true,
        showThinking: needsThinking,
        thinkingComplexity: 3, // Default complexity level
        culturalContext: {
          familyDynamics: 'family-oriented',
          religiousConsiderations: false,
          economicContext: 'medium'
        },
        customInstructions: `${contextHints} Be concise and natural. For greetings, respond briefly and warmly. Avoid repetitive phrases about family care unless specifically relevant.`
      };
      
      await enhancedAIService.processEnhancedStreamingQuery(queryOptions, streamingHandler);
      
    } catch (error) {
      console.error('Error processing message:', error);
      stopTyping();
      
      setMessages(prev => [...prev, {
        id: botMessageId,
        text: 'Lo siento, hubo un error. Por favor intenta de nuevo.',
        sender: 'bot',
        timestamp: new Date(),
        isStreaming: false,
        isComplete: true,
        status: 'delivered'
      }]);
      setIsProcessing(false);
      setIsThinking(false);
    }
  }, [input, isUploading, messages, location, sessionId]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setShowAttachMenu(false);
    
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
        text: 'Imagen',
        sender: 'user',
        timestamp: new Date(),
        containsImage: true,
        imageUrl,
        status: 'sent'
      }]);
      
      // Simulate image analysis
      startTyping();
      
      setTimeout(async () => {
        const response = await enhancedAIService.analyzeImage(imageUrl);
        
        stopTyping();
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: response.text,
          sender: 'bot',
          timestamp: new Date(),
          severity: response.severity,
          imageAnalysis: response.imageAnalysis,
          suggestedSpecialty: response.suggestedSpecialty,
          followUpQuestions: response.followUpQuestions || [
            '¿Desde cuándo tienes estos síntomas?',
            '¿Has usado algún medicamento?'
          ],
          status: 'delivered'
        }]);
        
        setShowQuickReplies(true);
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      stopTyping();
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleQuickReply = (text: string) => {
    setInput(text);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleVoiceNote = async () => {
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

  const handleVideoCall = () => {
    navigate('/doctor-connect');
  };

  const handlePhoneCall = () => {
    window.open('tel:911', '_self');
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = '40px';
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = Math.min(scrollHeight, 120) + 'px';
  };

  // Handle initial message
  useEffect(() => {
    if (initialMessage && !initialMessageSentRef.current) {
      initialMessageSentRef.current = true;
      setTimeout(() => {
        setInput(initialMessage);
        setTimeout(() => handleSendMessage(), 500);
      }, 1000);
    }
  }, [initialMessage]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-MX', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const MessageStatus = ({ status }: { status?: string }) => {
    if (!status || status === 'sending') return null;
    
    return (
      <span className="ml-1">
        {status === 'sent' && <Check className="w-3 h-3 text-gray-400 inline" />}
        {status === 'delivered' && <CheckCheck className="w-3 h-3 text-gray-400 inline" />}
        {status === 'read' && <CheckCheck className="w-3 h-3 text-blue-500 inline" />}
      </span>
    );
  };

  return (
    <div className="ai-doctor-mobile-container">
      {/* WhatsApp-style Header */}
      <div className="bg-[#075E54] text-white p-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <button onClick={onBack || (() => navigate(-1))} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
            <img 
              src="/images/simeon.png" 
              alt="Dr. Simeon"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `
                  <div class="w-full h-full bg-teal-600 flex items-center justify-center text-white font-bold">
                    DS
                  </div>
                `;
              }}
            />
          </div>
          <div className="flex-1">
            <h1 className="font-semibold text-base">Dr. Simeon</h1>
            <p className="text-xs opacity-90">
              {isTyping ? 'escribiendo...' : 'en línea'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={handleVideoCall} className="p-2">
            <Video className="w-5 h-5" />
          </button>
          <button onClick={handlePhoneCall} className="p-2">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="mobile-chat-messages px-3 py-2">
        <div className="max-w-lg mx-auto">
          {messages.map((message, index) => (
            <div key={message.id}>
              {/* Date separator */}
              {index === 0 || new Date(messages[index - 1].timestamp).toDateString() !== new Date(message.timestamp).toDateString() && (
                <div className="text-center my-2">
                  <span className="bg-[#DCF8C6] text-gray-700 text-xs px-3 py-1 rounded-full">
                    {new Date(message.timestamp).toLocaleDateString('es-MX', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </span>
                </div>
              )}
              
              {/* Message bubble */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex mb-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${
                  message.sender === 'user' 
                    ? 'bg-[#DCF8C6]' 
                    : 'bg-white'
                } rounded-lg shadow-sm relative`}>
                  {/* Message triangle */}
                  <div className={`absolute top-0 ${
                    message.sender === 'user' 
                      ? 'right-0 -mr-2 border-l-[#DCF8C6]' 
                      : 'left-0 -ml-2 border-r-white'
                  } w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ${
                    message.sender === 'user' 
                      ? 'border-l-[10px]' 
                      : 'border-r-[10px]'
                  }`}></div>
                  
                  <div className="p-3">
                    {message.containsImage && message.imageUrl ? (
                      <img 
                        src={message.imageUrl} 
                        alt="Uploaded" 
                        className="rounded-lg max-w-full mb-2"
                      />
                    ) : (
                      <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                        {message.text}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-end mt-1 space-x-1">
                      <span className="text-xs text-gray-500">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.sender === 'user' && (
                        <MessageStatus status={message.status} />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
          
          {/* Simple Typing Indicator - No complex animations */}
          <SimpleTypingBubble isTyping={isTyping} userName="Dr. Simeon" />
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced Quick Replies */}
      <WhatsAppQuickReplies
        replies={generateContextualQuickReplies()}
        onReplyClick={(reply) => handleQuickReply(reply.text)}
        visible={showQuickReplies && messages.length > 0}
      />

      {/* Input Area */}
      <div className="mobile-chat-input-area">
        <div className="flex items-end space-x-2 max-w-lg mx-auto">
          {/* Attachment Menu */}
          <AnimatePresence>
            {showAttachMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute bottom-16 left-2 bg-white rounded-lg shadow-lg p-2 z-50"
              >
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg w-full"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <Image className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm">Galería</span>
                </button>
                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.setAttribute('capture', 'environment');
                      fileInputRef.current.click();
                    }
                  }}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg w-full"
                >
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm">Cámara</span>
                </button>
                <button
                  onClick={() => navigate('/doctor-connect')}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg w-full"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm">Video consulta</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="p-2"
          >
            {showAttachMenu ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Paperclip className="w-6 h-6 text-gray-600" />
            )}
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          
          <div className="flex-1 bg-gray-100 rounded-full flex items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Escribe un mensaje"
              className="flex-1 bg-transparent px-4 py-2 text-sm resize-none focus:outline-none"
              style={{ minHeight: '40px', maxHeight: '120px' }}
              rows={1}
            />
          </div>
          
          {input.trim() ? (
            <button
              onClick={handleSendMessage}
              disabled={isProcessing}
              className="p-2 bg-[#075E54] rounded-full"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          ) : (
            <button
              onClick={handleVoiceNote}
              className={`p-2 ${isRecording ? 'text-red-600 animate-pulse' : ''}`}
            >
              <Mic className={`w-6 h-6 ${isRecording ? 'text-red-600' : 'text-gray-600'}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(AIDoctorMobile);