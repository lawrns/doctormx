import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SimpleTypingBubbleProps {
  isTyping: boolean;
  userName?: string;
}

/**
 * WhatsApp-style typing indicator
 * Simple three dots animation
 */
export const SimpleTypingBubble: React.FC<SimpleTypingBubbleProps> = ({ 
  isTyping, 
  userName = 'Dr. Simeon' 
}) => {
  return (
    <AnimatePresence>
      {isTyping && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex justify-start mb-3"
        >
          <div className="flex flex-col">
            {/* Typing label */}
            <span className="text-xs text-gray-500 ml-2 mb-1">
              {userName} está escribiendo...
            </span>
            
            {/* Bubble with dots */}
            <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm max-w-[80px]">
              <div className="flex space-x-1.5">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.4,
                    ease: "easeInOut"
                  }}
                  className="w-2 h-2 bg-gray-400 rounded-full"
                />
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.4,
                    delay: 0.2,
                    ease: "easeInOut"
                  }}
                  className="w-2 h-2 bg-gray-400 rounded-full"
                />
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.4,
                    delay: 0.4,
                    ease: "easeInOut"
                  }}
                  className="w-2 h-2 bg-gray-400 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Alternative minimal typing indicator (just dots, no bubble)
 */
export const MinimalTypingIndicator: React.FC<{ isTyping: boolean }> = ({ isTyping }) => {
  return (
    <AnimatePresence>
      {isTyping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center space-x-1 px-4 py-2"
        >
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-gray-500 text-2xl"
          >
            •
          </motion.span>
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
            className="text-gray-500 text-2xl"
          >
            •
          </motion.span>
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
            className="text-gray-500 text-2xl"
          >
            •
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Hook to manage typing indicator timing
 */
export const useTypingIndicator = (duration: number = 2000) => {
  const [isTyping, setIsTyping] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const startTyping = React.useCallback(() => {
    setIsTyping(true);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Auto-stop after duration
    timeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, duration);
  }, [duration]);

  const stopTyping = React.useCallback(() => {
    setIsTyping(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { isTyping, startTyping, stopTyping };
};

/**
 * Natural typing delay calculator
 */
export const calculateTypingDelay = (text: string): number => {
  // Base delay + time based on message length
  const baseDelay = 500; // 0.5 seconds minimum
  const wordsPerMinute = 200; // Average typing speed
  const words = text.split(' ').length;
  const typingTime = (words / wordsPerMinute) * 60 * 1000; // Convert to milliseconds
  
  // Add some randomness for natural feel
  const variance = Math.random() * 500 - 250; // +/- 250ms
  
  return Math.max(baseDelay, Math.min(typingTime + variance, 3000)); // Cap at 3 seconds
};