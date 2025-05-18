import React from 'react';
import { Stethoscope, AlertCircle, Info, Check } from 'lucide-react';

interface EnhancedChatBubbleProps {
  message: {
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
    isStreaming?: boolean;
    isComplete?: boolean;
  };
  onOptionSelect?: (option: string, questionId: string) => void;
  interactiveOptions?: {
    type: 'symptom_category' | 'symptom_duration' | 'symptom_severity' | 'yes_no' | 'follow_up_preference';
    options: string[];
    questionId: string;
  };
  onFollowUpClick?: (question: string) => void;
  onGoBack?: () => void;
  showGoBack?: boolean;
  onFindProviders?: (specialty: string) => void;
}

const EnhancedChatBubble: React.FC<EnhancedChatBubbleProps> = ({
  message,
  onOptionSelect,
  interactiveOptions,
  onFollowUpClick,
  onGoBack,
  showGoBack,
  onFindProviders
}) => {
  const confidence = message.imageAnalysis?.confidence 
    ? Math.round(message.imageAnalysis.confidence * 100) 
    : 85;

  return (
    <div
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`rounded-2xl px-4 py-3 max-w-[95%] sm:max-w-[90%] md:max-w-[60%] ${
          message.sender === 'user' 
            ? 'bg-brand-jade-600 text-white rounded-br-none' 
            : message.isEmergency
              ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-none'
              : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
        }`}
        style={{ transform: 'translateZ(0)', contain: 'content' }}
      >
        <div className="flex items-center mb-1">
          {message.sender === 'bot' ? (
            <div className="mr-2 flex items-center">
              <img 
                src="/images/simeon.png" 
                alt="Dr. Simeon" 
                className="w-6 h-6 rounded-full border border-brand-jade-200 shadow-sm object-cover"
              />
              <span className="ml-1 text-xs font-medium text-gray-700">Dr. Simeon</span>
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-brand-jade-100 mr-1 flex items-center justify-center">
              <span className="text-brand-jade-600 text-xs font-medium">U</span>
            </div>
          )}
          <span className={`text-xs ${message.sender === 'user' ? 'text-brand-jade-100' : 'text-gray-500'}`}>
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
            {message.isStreaming ? (
              <>
                {message.text === '' ? (
                  <div className="leading-relaxed flex items-center">
                    <span className="inline-block w-2 h-2 bg-brand-jade-600 rounded-full mr-1" />
                    <span className="inline-block w-2 h-2 bg-brand-jade-600 rounded-full mr-1" />
                    <span className="inline-block w-2 h-2 bg-brand-jade-600 rounded-full" />
                    <span className="ml-2 text-sm text-gray-600">Doctor.mx está escribiendo...</span>
                  </div>
                ) : (
                  <div>
                    <p className="leading-relaxed whitespace-pre-wrap" style={{ transform: 'translateZ(0)', minHeight: '1.5em', contain: 'content', width: '100%' }}>{message.text}</p>
                    <div className="mt-2 flex items-center h-1.5" style={{ transform: 'translateZ(0)', contain: 'content' }}>
                      <span className="inline-block w-1.5 h-1.5 bg-brand-jade-600 rounded-full mr-0.5" />
                      <span className="inline-block w-1.5 h-1.5 bg-brand-jade-600 rounded-full mr-0.5" />
                      <span className="inline-block w-1.5 h-1.5 bg-brand-jade-600 rounded-full" />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="leading-relaxed whitespace-pre-wrap" style={{ transform: 'translateZ(0)', minHeight: '1.5em', contain: 'content', width: '100%' }}>{message.text}</p>
            )}
            
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
              <div className="mt-3 p-3 bg-brand-jade-50 rounded-md text-sm">
                <p className="font-medium text-brand-jade-800 mb-1">Análisis de imagen:</p>
                <p className="text-gray-700">{message.imageAnalysis.findings}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Nivel de confianza</span>
                    <span>{confidence}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-jade-600" 
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-xs text-brand-jade-700">
                  <Info size={12} className="mr-1" />
                  <span>Basado en patrones médicos reconocidos</span>
                </div>
              </div>
            )}
            
            {/* Interactive Options Buttons */}
            {interactiveOptions && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-2">
                  {interactiveOptions.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => onOptionSelect && onOptionSelect(option, interactiveOptions.questionId)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm ${
                        interactiveOptions.type === 'symptom_category' 
                          ? 'bg-brand-jade-50 text-brand-jade-600 hover:bg-brand-jade-100 border border-brand-jade-100'
                          : interactiveOptions.type === 'symptom_duration'
                            ? 'bg-brand-jade-50 text-brand-jade-600 hover:bg-brand-jade-100 border border-brand-jade-100'
                            : interactiveOptions.type === 'symptom_severity'
                              ? 'bg-brand-jade-600 text-white hover:bg-brand-jade-700'
                              : interactiveOptions.type === 'yes_no' && option.includes('Ver medicamentos')
                                ? 'bg-brand-jade-600 text-white hover:bg-brand-jade-700'
                                : 'bg-brand-jade-50 text-brand-jade-600 hover:bg-brand-jade-100 border border-brand-jade-100'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                
                {/* Go back button */}
                {showGoBack && (
                  <button
                    onClick={onGoBack}
                    className="mt-2 text-xs text-brand-jade-600 flex items-center hover:text-brand-jade-700"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver a la pregunta anterior
                  </button>
                )}
              </div>
            )}
            
            {message.followUpQuestions && message.followUpQuestions.length > 0 && (
              <div className="mt-3 space-y-2">
                {message.followUpQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => onFollowUpClick && onFollowUpClick(question)}
                    className="block w-full text-left text-sm bg-gray-50 hover:bg-brand-jade-50 p-2 rounded-md"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
            
            {message.suggestedConditions && message.suggestedConditions.length > 0 && (
              <div className="mt-3 p-2 bg-brand-jade-50 rounded-md">
                <p className="text-sm font-medium text-brand-jade-700 mb-1">Posibles condiciones:</p>
                <div className="flex flex-wrap gap-1">
                  {message.suggestedConditions.map((condition, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white text-brand-jade-800 border border-brand-jade-100"
                    >
                      <Check size={10} className="mr-1 text-brand-jade-600" />
                      {condition}
                    </span>
                  ))}
                </div>
                
                {message.suggestedSpecialty && (
                  <div className="mt-2">
                    <button
                      onClick={() => onFindProviders && onFindProviders(message.suggestedSpecialty!)}
                      className="text-sm bg-brand-jade-100 text-brand-jade-700 px-3 py-1 rounded-full hover:bg-brand-jade-200 flex items-center border border-brand-jade-200"
                    >
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Buscar especialistas en {message.suggestedSpecialty}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EnhancedChatBubble;
