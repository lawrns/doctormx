import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Brain, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

function AISymptomFormPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'Soy un asistente médico virtual. Por favor, cuéntame sobre tus síntomas para poder ayudarte mejor.'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  
  const handleBack = () => {
    navigate('/sintomas');
  };
  
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: inputText
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      const responseIndex = messages.filter(m => m.role === 'assistant').length;
      let responseMessage: Message;
      
      if (responseIndex === 0) {
        // First response asks about duration
        responseMessage = {
          role: 'assistant',
          content: 'Gracias por compartir tus síntomas. ¿Desde hace cuánto tiempo estás experimentando estos síntomas?'
        };
      } else if (responseIndex === 1) {
        // Second response asks about severity
        responseMessage = {
          role: 'assistant',
          content: 'Entiendo. En una escala del 1 al 10, ¿qué tan intensos son estos síntomas?'
        };
      } else if (responseIndex === 2) {
        // Third response asks about other factors
        responseMessage = {
          role: 'assistant',
          content: '¿Has notado algún factor que empeore o mejore estos síntomas?'
        };
      } else {
        // Final response indicates completion
        responseMessage = {
          role: 'assistant',
          content: 'Gracias por proporcionar esta información. Basado en tus respuestas, he analizado tus síntomas. ¿Te gustaría ver los resultados?'
        };
        setAnalysisComplete(true);
      }
      
      setMessages(prev => [...prev, responseMessage]);
      setIsLoading(false);
    }, 1500);
  };
  
  const handleViewResults = () => {
    navigate('/sintomas/resultados');
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={handleBack}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <ChevronLeft size={20} className="mr-1" />
          Volver
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900">Asistente de Síntomas con IA</h1>
        
        <div style={{ width: '24px' }}></div> {/* Empty div for flex spacing */}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center">
          <Brain size={24} className="text-blue-600 mr-2" />
          <p className="text-blue-800 font-medium">
            Cuéntame sobre tus síntomas y te ayudaré a evaluarlos
          </p>
        </div>
        
        <div className="p-6 h-96 overflow-y-auto flex flex-col space-y-4">
          {messages
            .filter(message => message.role !== 'system')
            .map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`max-w-[80%] px-4 py-2 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-100 text-blue-900 ml-auto rounded-br-none' 
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                {message.content}
              </motion.div>
            ))}
            
          {isLoading && (
            <div className="flex space-x-2 p-4">
              <div className="w-3 h-3 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200">
          {analysisComplete ? (
            <div className="text-center">
              <button
                onClick={handleViewResults}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ver resultados de análisis
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe tus síntomas..."
                className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isLoading}
              />
              <button
                className={`p-3 rounded-r-lg ${
                  inputText.trim() && !isLoading
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
              >
                <Send size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Importante</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Esta herramienta utiliza IA para analizar tus síntomas, pero no sustituye la consulta con un profesional médico. Si experimentas síntomas graves, busca atención médica inmediata.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AISymptomFormPage;