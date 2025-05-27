import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface QuickReply {
  id: string;
  text: string;
  icon?: string;
  action?: () => void;
}

interface WhatsAppQuickRepliesProps {
  replies: QuickReply[];
  onReplyClick: (reply: QuickReply) => void;
  visible: boolean;
}

/**
 * WhatsApp-style quick reply buttons
 * Appears above the input area with smooth animations
 */
export const WhatsAppQuickReplies: React.FC<WhatsAppQuickRepliesProps> = ({
  replies,
  onReplyClick,
  visible
}) => {
  if (!replies || replies.length === 0) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="px-3 pb-2"
        >
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {replies.map((reply, index) => (
              <motion.button
                key={reply.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  onReplyClick(reply);
                  if (reply.action) reply.action();
                }}
                className="quick-reply-button"
              >
                {reply.icon && <span className="mr-1">{reply.icon}</span>}
                {reply.text}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Generate contextual quick replies based on conversation stage
 */
export const generateQuickReplies = (
  context: {
    stage: 'greeting' | 'symptom' | 'severity' | 'treatment' | 'followup';
    lastMessage?: string;
    condition?: string;
    hasImage?: boolean;
  }
): QuickReply[] => {
  switch (context.stage) {
    case 'greeting':
      return [
        { id: '1', text: 'Tengo un síntoma', icon: '🤒' },
        { id: '2', text: 'Necesito un doctor', icon: '👨‍⚕️' },
        { id: '3', text: 'Emergencia', icon: '🚨' },
        { id: '4', text: 'Consulta general', icon: '💬' }
      ];
    
    case 'symptom':
      return [
        { id: '1', text: 'Dolor de cabeza', icon: '🤕' },
        { id: '2', text: 'Fiebre', icon: '🌡️' },
        { id: '3', text: 'Dolor de estómago', icon: '🤢' },
        { id: '4', text: 'Tos', icon: '😷' },
        { id: '5', text: 'Otro síntoma', icon: '➕' }
      ];
    
    case 'severity':
      return [
        { id: '1', text: 'Leve (1-3)', icon: '🟢' },
        { id: '2', text: 'Moderado (4-6)', icon: '🟡' },
        { id: '3', text: 'Severo (7-9)', icon: '🟠' },
        { id: '4', text: 'Muy severo (10)', icon: '🔴' }
      ];
    
    case 'treatment':
      return [
        { id: '1', text: 'Ver medicamentos', icon: '💊' },
        { id: '2', text: 'Buscar doctor', icon: '🏥' },
        { id: '3', text: 'Farmacias cercanas', icon: '🏪' },
        { id: '4', text: 'Más información', icon: 'ℹ️' }
      ];
    
    case 'followup':
      return [
        { id: '1', text: 'Sí, me ayudó', icon: '✅' },
        { id: '2', text: 'Tengo dudas', icon: '❓' },
        { id: '3', text: 'Otro síntoma', icon: '➕' },
        { id: '4', text: 'Terminar consulta', icon: '👋' }
      ];
    
    default:
      return [];
  }
};

/**
 * Generate psychological support quick replies
 */
export const generatePsychologicalReplies = (
  detected: { condition: string; severity: string }
): QuickReply[] => {
  if (detected.severity === 'severo') {
    return [
      { id: '1', text: 'Necesito hablar ahora', icon: '🆘' },
      { id: '2', text: 'Ver líneas de ayuda', icon: '📞' },
      { id: '3', text: 'Buscar psicólogo', icon: '🧠' },
      { id: '4', text: 'Técnicas de calma', icon: '🧘' }
    ];
  }
  
  return [
    { id: '1', text: 'Ejercicios de respiración', icon: '🫁' },
    { id: '2', text: 'Técnicas de relajación', icon: '🧘' },
    { id: '3', text: 'Apoyo profesional', icon: '👨‍⚕️' },
    { id: '4', text: 'Más recursos', icon: '📚' }
  ];
};

/**
 * Styles for quick reply buttons (add to CSS)
 */
export const quickReplyStyles = `
.quick-reply-button {
  @apply bg-white border-2 border-[#075E54] text-[#075E54] 
         px-4 py-2 rounded-full text-sm font-medium
         whitespace-nowrap flex-shrink-0
         hover:bg-[#075E54] hover:text-white
         transition-all duration-200
         active:scale-95;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

@media (max-width: 640px) {
  .quick-reply-button {
    @apply text-xs px-3 py-1.5;
  }
}
`;