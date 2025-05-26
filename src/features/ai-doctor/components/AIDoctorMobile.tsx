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
import EnhancedAIThinking from './EnhancedAIThinking';
import EnhancedChatBubble from './EnhancedChatBubble';

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
  const [isTyping, setIsTyping] = useState(false);
  
  // Enhanced AI thinking states
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStages, setThinkingStages] = useState<string[]>([]);
  const [currentThinkingStage, setCurrentThinkingStage] = useState(0);
  const [thinkingComplexity, setThinkingComplexity] = useState<'simple' | 'medium' | 'complex'>('simple');
  
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
    setIsTyping(true);
    
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
      // Determine conversation complexity
      const complexity = userInput.length > 100 ? 'complex' : 
                        userInput.includes('dolor') || userInput.includes('síntoma') ? 'medium' : 'simple';
      setThinkingComplexity(complexity);

      // Enhanced streaming response handler
      const streamingHandler: EnhancedStreamingResponseHandler = (streamResponse: EnhancedStreamingAIResponse) => {
        setIsTyping(false);
        
        // Handle thinking stages
        if (streamResponse.thinkingStages && streamResponse.thinkingStages.length > 0) {
          setThinkingStages(streamResponse.thinkingStages);
          setCurrentThinkingStage(0);
          setIsThinking(true);
          
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

      const queryOptions: EnhancedAIQueryOptions = {
        userMessage: userInput,
        userHistory: messages.map(m => m.text),
        severity: 5,
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
      setIsTyping(false);
      
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
      setIsTyping(true);
      
      setTimeout(async () => {
        const response = await enhancedAIService.analyzeImage(imageUrl);
        
        setIsTyping(false);
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
      setIsTyping(false);
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

  const handleVoiceNote = () => {
    // Implement voice recording
    alert('Grabación de voz próximamente');
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
    <div className="fixed inset-0 bg-[#E5DDD5] flex flex-col">
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
      <div className="flex-1 overflow-y-auto px-3 py-2" style={{ backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAASElEQVQYlWNgYGD4TyRm+E8kJkj9Z2BgYGAiVtHowtGFoyEYkliJNRhZI7IGbHJEKcQmh28hLnXYwn60HUMVI2vEZgDBQAcAAP//cRgZLwAAAABJRU5ErkJggg==")' }}>
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
          
          {/* AI Thinking Indicator */}
          {isThinking && thinkingStages.length > 0 && (
            <div className="mb-2">
              <EnhancedAIThinking
                stages={thinkingStages}
                currentStage={currentThinkingStage}
                isActive={isThinking}
                complexity={thinkingComplexity}
                mexicanContext={true}
              />
            </div>
          )}
          
          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start mb-2"
            >
              <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
                <div className="flex space-x-1">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.4 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Replies */}
      {showQuickReplies && messages.length > 0 && (
        <div className="px-3 pb-2">
          <div className="flex overflow-x-auto space-x-2 scrollbar-hide">
            {(messages[messages.length - 1].followUpQuestions || MEXICAN_QUICK_SYMPTOMS.map(s => s.text))
              .slice(0, 4)
              .map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(question)}
                  className="bg-white border border-[#075E54] text-[#075E54] px-4 py-2 rounded-full text-sm whitespace-nowrap flex-shrink-0"
                >
                  {question}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-2">
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
              className="p-2"
            >
              <Mic className="w-6 h-6 text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(AIDoctorMobile);