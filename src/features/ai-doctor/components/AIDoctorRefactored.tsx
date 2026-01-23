import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { UnifiedConversationService } from '../services/UnifiedConversationService';
import { ConversationState, Message } from '../types/AITypes';
import AIDoctorCore from './AIDoctorCore';
import AIDoctorChatUI from './AIDoctorChatUI';
import AIDoctorInputOptimized from './AIDoctorInputOptimized';
import { useMemoryCleanup } from '../../../hooks/useMemoryCleanup';
import { Card } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useToast } from '../../../contexts/ToastContext';

// Lazy load heavy components
const AIDoctorTabs = lazy(() => import('./AIDoctorTabs'));
const ProductRecommendation = lazy(() => import('./ProductRecommendation'));
const DoctorReferralModal = lazy(() => import('./DoctorReferralModal'));
const PharmacyReferralModal = lazy(() => import('./PharmacyReferralModal'));

interface AIDoctorRefactoredProps {
  className?: string;
  embedded?: boolean;
  onExportChat?: (data: any) => void;
}

/**
 * Refactored AIDoctor Component
 * - Split into smaller, focused components
 * - Lazy loading for heavy features
 * - Optimized rendering and memory management
 * - Mobile-first responsive design
 */
export const AIDoctorRefactored: React.FC<AIDoctorRefactoredProps> = ({
  className,
  embedded = false,
  onExportChat
}) => {
  const [conversationState, setConversationState] = useState<ConversationState>({
    messages: [],
    currentContext: {},
    quickReplies: [],
    isTyping: false,
    isEmergency: false,
    consultationPhase: 'greeting'
  });
  
  const [activeTab, setActiveTab] = useState('chat');
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showPharmacyModal, setShowPharmacyModal] = useState(false);
  
  const { showToast } = useToast();

  // Initialize conversation service
  const conversationService = useMemo(
    () => new UnifiedConversationService(),
    []
  );

  // Memory cleanup
  useMemoryCleanup(() => {
    // Additional cleanup if needed
    console.log('[AIDoctor] Performing memory cleanup');
  }, {
    interval: 60000,
    threshold: 100,
    debug: false
  });

  // Handle state changes from core
  const handleStateChange = (newState: ConversationState) => {
    setConversationState(newState);
    
    // Check for referral triggers
    if (newState.currentContext.needsDoctor) {
      setShowDoctorModal(true);
    }
    if (newState.currentContext.needsPharmacy) {
      setShowPharmacyModal(true);
    }
  };

  // Handle errors
  const handleError = (error: Error) => {
    console.error('[AIDoctor] Error:', error);
    showToast({
      title: 'Error',
      description: 'Ocurrió un error. Por favor intenta de nuevo.',
      variant: 'error'
    });
  };

  // Initialize core logic
  const coreHandlers = AIDoctorCore({
    conversationService,
    onStateChange: handleStateChange,
    onError: handleError
  });

  // Export chat handler
  useEffect(() => {
    if (onExportChat && coreHandlers.exportConversation) {
      onExportChat(coreHandlers.exportConversation);
    }
  }, [onExportChat, coreHandlers.exportConversation]);

  if (embedded) {
    // Simplified embedded view
    return (
      <div className={className}>
        <AIDoctorChatUI
          messages={conversationState.messages}
          quickReplies={conversationState.quickReplies}
          isTyping={conversationState.isTyping}
          isEmergency={conversationState.isEmergency}
          onQuickReply={coreHandlers.handleQuickReply}
          className="h-[400px]"
        />
        <AIDoctorInputOptimized
          onSendMessage={coreHandlers.sendMessage}
          disabled={!coreHandlers.isInitialized || conversationState.isTyping}
        />
      </div>
    );
  }

  return (
    <Card className={className}>
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Dr. IA - Consulta Virtual</h2>
            <p className="text-sm text-gray-500">Asistente médico disponible 24/7</p>
          </div>
          <button
            onClick={coreHandlers.endConsultation}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Finalizar consulta
          </button>
        </div>
      </div>

      {/* Tabs (lazy loaded) */}
      <Suspense fallback={<Skeleton className="h-12" />}>
        <AIDoctorTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hasProducts={conversationState.currentContext.products?.length > 0}
          hasHistory={conversationState.messages.length > 5}
        />
      </Suspense>

      {/* Content */}
      <div className="flex-1 min-h-[500px]">
        {activeTab === 'chat' && (
          <>
            <AIDoctorChatUI
              messages={conversationState.messages}
              quickReplies={conversationState.quickReplies}
              isTyping={conversationState.isTyping}
              isEmergency={conversationState.isEmergency}
              onQuickReply={coreHandlers.handleQuickReply}
              className="h-[400px]"
            />
            <AIDoctorInputOptimized
              onSendMessage={coreHandlers.sendMessage}
              disabled={!coreHandlers.isInitialized || conversationState.isTyping}
            />
          </>
        )}

        {activeTab === 'products' && conversationState.currentContext.products && (
          <Suspense fallback={<Skeleton className="h-full" />}>
            <ProductRecommendation
              products={conversationState.currentContext.products}
              onProductSelect={(product) => {
                coreHandlers.sendMessage(`Cuéntame más sobre ${product.name}`);
              }}
            />
          </Suspense>
        )}

        {activeTab === 'history' && (
          <div className="p-4">
            <h3 className="font-semibold mb-4">Historial de consulta</h3>
            <div className="space-y-2 text-sm">
              {conversationState.messages
                .filter(m => m.role === 'user')
                .map((message, index) => (
                  <div key={message.id} className="p-2 bg-gray-50 rounded">
                    <span className="text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                    <p>{message.content}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals (lazy loaded) */}
      <Suspense fallback={null}>
        {showDoctorModal && (
          <DoctorReferralModal
            isOpen={showDoctorModal}
            onClose={() => setShowDoctorModal(false)}
            specialty={conversationState.currentContext.suggestedSpecialty}
            urgency={conversationState.currentContext.urgency}
          />
        )}

        {showPharmacyModal && (
          <PharmacyReferralModal
            isOpen={showPharmacyModal}
            onClose={() => setShowPharmacyModal(false)}
            medications={conversationState.currentContext.suggestedMedications}
          />
        )}
      </Suspense>
    </Card>
  );
};

export default React.memo(AIDoctorRefactored);