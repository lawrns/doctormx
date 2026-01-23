import React, { useState, useCallback, useEffect } from 'react';
import { UnifiedConversationService } from '../services/UnifiedConversationService';
import { Message, AIResponse, QuickReply, ConversationState } from '../types/AITypes';
import { useMemoryCleanup } from '../../../hooks/useMemoryCleanup';
import { MEDICAL_DISCLAIMERS } from '../../../constants/medical-disclaimers';

interface AIDoctorCoreProps {
  conversationService: UnifiedConversationService;
  onStateChange: (state: ConversationState) => void;
  onError: (error: Error) => void;
}

/**
 * Core AI Doctor logic - handles conversation management
 * Separated from UI for better performance and testing
 */
export const AIDoctorCore: React.FC<AIDoctorCoreProps> = ({
  conversationService,
  onStateChange,
  onError
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Memory cleanup hook
  const { registerTimer, cleanup } = useMemoryCleanup(() => {
    // Clean up conversation history if too large
    const state = conversationService.getState();
    if (state.messages.length > 100) {
      const recentMessages = state.messages.slice(-50);
      conversationService.setState({
        ...state,
        messages: recentMessages
      });
    }
  }, {
    interval: 30000, // Check every 30 seconds
    threshold: 50,   // 50MB threshold
    debug: false
  });

  // Initialize service
  useEffect(() => {
    const initializeService = async () => {
      try {
        await conversationService.initialize();
        setIsInitialized(true);
        
        // Subscribe to state changes
        const unsubscribe = conversationService.subscribe((state) => {
          onStateChange(state);
        });

        return () => {
          unsubscribe();
          cleanup();
        };
      } catch (error) {
        onError(error as Error);
      }
    };

    initializeService();
  }, [conversationService, onStateChange, onError, cleanup]);

  // Send message handler
  const sendMessage = useCallback(async (content: string, imageUrl?: string) => {
    if (!isInitialized) return;

    try {
      // Add medical disclaimer to first message
      const state = conversationService.getState();
      if (state.messages.length === 0) {
        await conversationService.addSystemMessage(MEDICAL_DISCLAIMERS.GENERAL.es);
      }

      await conversationService.sendMessage(content, imageUrl);
    } catch (error) {
      onError(error as Error);
    }
  }, [isInitialized, conversationService, onError]);

  // Handle quick reply
  const handleQuickReply = useCallback(async (reply: QuickReply) => {
    await sendMessage(reply.text);
  }, [sendMessage]);

  // End consultation
  const endConsultation = useCallback(async () => {
    try {
      await conversationService.endConsultation();
      cleanup();
    } catch (error) {
      onError(error as Error);
    }
  }, [conversationService, cleanup, onError]);

  // Export conversation
  const exportConversation = useCallback(async () => {
    try {
      return await conversationService.exportConversation();
    } catch (error) {
      onError(error as Error);
      return null;
    }
  }, [conversationService, onError]);

  return {
    isInitialized,
    sendMessage,
    handleQuickReply,
    endConsultation,
    exportConversation
  };
};

// Memoized version for performance
export default React.memo(AIDoctorCore);