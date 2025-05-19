import React, { useState } from 'react';
import { Outlet, useLocation, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AINavbar from './AINavbar';
import AIFooter from './AIFooter';
import ChatAssistant from '../../components/ChatAssistant';
import { SocialIcons } from '../../components/icons/IconProvider';
import { X as XIcon } from 'lucide-react';
import ClientOnly from '../../components/ClientOnly';
// Wizard context for onboarding
import { WizardProvider } from '../../contexts/WizardContext';
import { useChat } from '../hooks/useChat';
// Page components and wizard layout
import AIHomePage from '../../pages/AIHomePage';
import WizardLayout from '../../pages/wizard/WizardLayout';
import Step1Page from '../../pages/wizard/Step1Page';
import Step2Page from '../../pages/wizard/Step2Page';
import Step3Page from '../../pages/wizard/Step3Page';
import { AnimatePresence, motion } from 'framer-motion';

function AILayout() {
  const [showChatAssistant, setShowChatAssistant] = useState(false);
  const location = useLocation();
  const isWizard = location.pathname.startsWith('/wizard');
  const navigate = useNavigate();

  const { isExpanded, setIsExpanded } = useChat();
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AINavbar />
      <main className="flex-grow">
        {/* Wizard context for onboarding steps */}
        <WizardProvider>
          {/* Show home page as background when in wizard */}
          {isWizard ? <AIHomePage /> : <Outlet />}
        </WizardProvider>
      </main>
      <AIFooter />

      {/* Chat Assistant Button */}
      <button
        onClick={() => setShowChatAssistant(!showChatAssistant)}
        className="fixed bottom-6 right-6 bg-brand-jade-600 text-white p-4 rounded-full shadow-lg hover:bg-brand-jade-700 transition-colors z-50 flex items-center justify-center"
        aria-label="Abrir asistente de chat"
      >
        <SocialIcons.MessageCircle size={24} />
      </button>
      
      {/* Chat Assistant Modal - open when toggled or via context expansion */}
      <ClientOnly>
        {(showChatAssistant || isExpanded) && (
          <ChatAssistant
            onClose={() => {
              setShowChatAssistant(false);
              setIsExpanded(false);
            }}
          />
        )}
      </ClientOnly>
      {/* Onboarding Wizard Modal */}
      <Routes>
        <Route
          path="wizard"
          element={
            <ClientOnly>
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key="overlay"
                  className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    key="modal"
                    className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto overflow-auto relative"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Close button */}
                    <button
                      onClick={() => navigate('/')}
                      className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
                      aria-label="Cerrar onboarding"
                    >
                      <XIcon size={24} />
                    </button>
                    <WizardLayout />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </ClientOnly>
          }
        >
          <Route index element={<Navigate to="step-1" replace />} />
          <Route path="step-1" element={<Step1Page />} />
          <Route path="step-2" element={<Step2Page />} />
          <Route path="step-3" element={<Step3Page />} />
        </Route>
      </Routes>
    </div>
  );
}

export default AILayout;
