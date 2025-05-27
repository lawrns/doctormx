import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Stethoscope, Pill, Info, Heart, Brain, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OptimizedChatBubbleProps {
  message: {
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    isEmergency?: boolean;
    severity?: number;
    suggestedConditions?: string[];
    suggestedMedications?: string[];
    keyPoints?: string[];
    summary?: string;
  };
}

// Helper function to extract key points from text
function extractKeyPoints(text: string): { summary: string; points: string[]; fullText: string } {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Generate summary (first sentence or first 100 chars)
  const summary = sentences[0]?.trim() || text.slice(0, 100) + '...';
  
  // Extract key points (look for patterns like lists, important keywords)
  const points: string[] = [];
  const keywordPatterns = [
    /es importante/i,
    /debe\s+\w+/i,
    /recomiendo/i,
    /necesita/i,
    /síntomas/i,
    /tratamiento/i,
    /medicamento/i,
  ];
  
  sentences.forEach(sentence => {
    if (keywordPatterns.some(pattern => pattern.test(sentence))) {
      points.push(sentence.trim());
    }
  });
  
  return {
    summary: summary.slice(0, 150) + (summary.length > 150 ? '...' : ''),
    points: points.slice(0, 3), // Max 3 key points
    fullText: text
  };
}

// Icon mapping for different response types
const ResponseIcons = {
  diagnosis: Brain,
  treatment: Pill,
  symptoms: Activity,
  emergency: AlertCircle,
  general: Stethoscope,
  lifestyle: Heart,
};

function OptimizedChatBubble({ message }: OptimizedChatBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Determine if message needs collapsing (more than 200 characters)
  const needsCollapse = message.text.length > 200 && message.sender === 'bot';
  
  // Extract structured content
  const structuredContent = useMemo(() => {
    if (message.sender === 'user' || !needsCollapse) return null;
    return extractKeyPoints(message.text);
  }, [message.text, message.sender, needsCollapse]);
  
  // Determine response type for icon
  const responseType = useMemo(() => {
    if (message.isEmergency) return 'emergency';
    if (message.suggestedMedications?.length) return 'treatment';
    if (message.text.toLowerCase().includes('síntoma')) return 'symptoms';
    if (message.text.toLowerCase().includes('diagnóstico')) return 'diagnosis';
    return 'general';
  }, [message]);
  
  const ResponseIcon = ResponseIcons[responseType];
  
  if (message.sender === 'user') {
    // User messages remain simple
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-[#006D77] text-white rounded-2xl rounded-br-none px-4 py-3 max-w-[80%]">
          <p className="text-sm">{message.text}</p>
        </div>
      </div>
    );
  }
  
  // Bot messages with optimized layout
  return (
    <div className="flex justify-start mb-6">
      <div className="max-w-[85%] space-y-2">
        {/* Doctor header */}
        <div className="flex items-center space-x-2 mb-2">
          <img 
            src="/images/simeon.png" 
            alt="Dr. Simeon" 
            className="w-8 h-8 rounded-full border-2 border-[#D0F0EF]"
          />
          <span className="text-sm font-medium text-gray-700">Dr. Simeon</span>
          <ResponseIcon className="w-4 h-4 text-[#006D77]" />
        </div>
        
        {/* Message content */}
        <div className={`bg-white border border-gray-100 rounded-2xl rounded-bl-none shadow-sm p-4 ${
          message.isEmergency ? 'border-red-300 bg-red-50' : ''
        }`}>
          {message.isEmergency && (
            <div className="flex items-center space-x-2 mb-3 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">Atención Urgente</span>
            </div>
          )}
          
          {needsCollapse && structuredContent && !isExpanded ? (
            // Collapsed view
            <div className="space-y-3">
              {/* Summary */}
              <p className="text-gray-800 font-medium">
                {structuredContent.summary}
              </p>
              
              {/* Key points */}
              {structuredContent.points.length > 0 && (
                <div className="space-y-1">
                  {structuredContent.points.map((point, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <span className="text-[#006D77] mt-1">•</span>
                      <span className="text-sm text-gray-600">{point}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Expand button */}
              <button
                onClick={() => setIsExpanded(true)}
                className="flex items-center space-x-1 text-[#006D77] hover:text-[#005B66] font-medium text-sm"
              >
                <span>Ver más detalles</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          ) : (
            // Expanded or short message view
            <div className="space-y-3">
              <div className="text-gray-800 whitespace-pre-wrap">
                {message.text}
              </div>
              
              {needsCollapse && isExpanded && (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="flex items-center space-x-1 text-[#006D77] hover:text-[#005B66] font-medium text-sm"
                >
                  <span>Ver menos</span>
                  <ChevronUp className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          
          {/* Suggested conditions as chips */}
          {message.suggestedConditions && message.suggestedConditions.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-2">Posibles condiciones:</p>
              <div className="flex flex-wrap gap-2">
                {message.suggestedConditions.map((condition, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#D0F0EF] text-[#006D77]"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Suggested medications as cards */}
          {message.suggestedMedications && message.suggestedMedications.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-2">Medicamentos sugeridos:</p>
              <div className="grid gap-2">
                {message.suggestedMedications.map((medication, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
                  >
                    <Pill className="w-4 h-4 text-[#006D77]" />
                    <span className="text-sm text-gray-700">{medication}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <span className="text-xs text-gray-400 ml-2">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

export default OptimizedChatBubble;