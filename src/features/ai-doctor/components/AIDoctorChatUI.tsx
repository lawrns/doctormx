import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, QuickReply } from '../types/AITypes';
import { OptimizedChatBubble } from './OptimizedChatBubble';
import { EnhancedAIThinking } from './EnhancedAIThinking';
import { WhatsAppQuickReplies } from './WhatsAppQuickReplies';
import { EmergencyProtocol } from './EmergencyProtocol';
import { useMemoryCleanup } from '../../../hooks/useMemoryCleanup';
import { cn } from '../../../lib/utils';

interface AIDoctorChatUIProps {
  messages: Message[];
  quickReplies: QuickReply[];
  isTyping: boolean;
  isEmergency: boolean;
  onQuickReply: (reply: QuickReply) => void;
  className?: string;
}

/**
 * Optimized Chat UI Component
 * - Virtualized scrolling for large message lists
 * - Memoized message rendering
 * - Smooth animations with reduced re-renders
 */
export const AIDoctorChatUI: React.FC<AIDoctorChatUIProps> = ({
  messages,
  quickReplies,
  isTyping,
  isEmergency,
  onQuickReply,
  className
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Memory cleanup
  const { registerTimer } = useMemoryCleanup();

  // Smooth scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    if (!messagesEndRef.current) return;
    
    messagesEndRef.current.scrollIntoView({ 
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end' 
    });
  }, []);

  // Scroll on new messages
  useEffect(() => {
    const timer = registerTimer(
      setTimeout(() => scrollToBottom(), 100)
    );
    return () => clearTimeout(timer);
  }, [messages.length, scrollToBottom, registerTimer]);

  // Virtualized message rendering
  const visibleMessages = useMemo(() => {
    // For performance, only render last 50 messages initially
    const maxVisible = 50;
    if (messages.length <= maxVisible) return messages;
    
    return messages.slice(-maxVisible);
  }, [messages]);

  // Message animation variants
  const messageVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Emergency Banner */}
      <AnimatePresence>
        {isEmergency && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EmergencyProtocol />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: '#e5e7eb #f9fafb'
        }}
      >
        <AnimatePresence initial={false}>
          {visibleMessages.map((message, index) => (
            <motion.div
              key={message.id}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
              layoutId={message.id}
            >
              <OptimizedChatBubble
                message={message}
                isConsecutive={
                  index > 0 && 
                  visibleMessages[index - 1].role === message.role
                }
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <EnhancedAIThinking />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll anchor */}
        <div ref={messagesEndRef} className="h-0" />
      </div>

      {/* Quick Replies */}
      <AnimatePresence>
        {quickReplies.length > 0 && !isTyping && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t bg-white"
          >
            <WhatsAppQuickReplies
              replies={quickReplies}
              onReplyClick={onQuickReply}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Memoized for performance
export default React.memo(AIDoctorChatUI);