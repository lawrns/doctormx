import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuickConsultationStart, { ConsultationData } from './QuickConsultationStart';
import ConsultationProgressSteps from './ConsultationProgressSteps';
import GuestConsultationService, { GuestConsultationData } from './GuestConsultationService';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

export interface ConsultationFlowManagerProps {
  whatsappPhone?: string;
  onConsultationComplete?: (consultation: GuestConsultationData) => void;
  onAccountCreationOffer?: (history: GuestConsultationData[]) => void;
  className?: string;
}

type FlowStep = 'start' | 'connecting' | 'consultation' | 'completed';

const ConsultationFlowManager: React.FC<ConsultationFlowManagerProps> = ({
  whatsappPhone,
  onConsultationComplete,
  onAccountCreationOffer,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('start');
  const [stepNumber, setStepNumber] = useState(1);
  const [consultation, setConsultation] = useState<GuestConsultationData | null>(null);
  const [showHelpPrompt, setShowHelpPrompt] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  
  const consultationService = GuestConsultationService.getInstance();

  // Check for existing consultation on mount
  useEffect(() => {
    const existingConsultation = consultationService.getCurrentConsultation();
    if (existingConsultation && existingConsultation.status !== 'completed') {
      setConsultation(existingConsultation);
      
      // Determine current step based on consultation status
      switch (existingConsultation.status) {
        case 'started':
          setCurrentStep('connecting');
          setStepNumber(2);
          break;
        case 'in_progress':
          setCurrentStep('consultation');
          setStepNumber(3);
          break;
        default:
          setCurrentStep('start');
          setStepNumber(1);
      }
    }
  }, []);

  // Listen for abandonment recovery events
  useEffect(() => {
    const handleHelpPrompt = (event: CustomEvent) => {
      if (consultation && event.detail.consultationId === consultation.id) {
        setShowHelpPrompt(true);
      }
    };

    const handleWhatsAppReminder = (event: CustomEvent) => {
      if (consultation && event.detail.consultationId === consultation.id) {
        // Handle WhatsApp reminder logic here
        console.log('WhatsApp reminder triggered for:', event.detail.phone);
      }
    };

    window.addEventListener('consultation:help-prompt', handleHelpPrompt as EventListener);
    window.addEventListener('consultation:whatsapp-reminder', handleWhatsAppReminder as EventListener);

    return () => {
      window.removeEventListener('consultation:help-prompt', handleHelpPrompt as EventListener);
      window.removeEventListener('consultation:whatsapp-reminder', handleWhatsAppReminder as EventListener);
    };
  }, [consultation]);

  const handleConsultationStart = async (data: ConsultationData) => {
    try {
      // Create guest consultation
      const newConsultation = consultationService.createConsultation(data);
      setConsultation(newConsultation);
      
      // Move to connecting step
      setCurrentStep('connecting');
      setStepNumber(2);
      setIsConnecting(true);
      
      // Simulate doctor matching process
      await simulateDoctorMatching(newConsultation.id);
      
    } catch (error) {
      console.error('Error starting consultation:', error);
    }
  };

  const simulateDoctorMatching = async (consultationId: string) => {
    const statusUpdates = [
      'Analizando tus síntomas...',
      'Buscando médicos disponibles...',
      'Encontrando el especialista perfecto...',
      'Conectando con Dr. García...',
      '¡Médico encontrado!'
    ];

    for (let i = 0; i < statusUpdates.length; i++) {
      setConnectionStatus(statusUpdates[i]);
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
    }

    // Assign doctor and start consultation
    consultationService.assignDoctor(consultationId, 'dr_garcia_123');
    consultationService.updateConsultationStatus(consultationId, 'in_progress');
    
    // Add welcome message from doctor
    consultationService.addMessage(consultationId, {
      content: `¡Hola ${consultation?.name}! Soy Dr. García. He revisado tu consulta sobre "${consultation?.mainSymptom}". ¿Puedes contarme un poco más sobre cuándo empezaste a sentir estos síntomas?`,
      sender: 'doctor',
      timestamp: Date.now(),
      type: 'text'
    });

    setIsConnecting(false);
    setCurrentStep('consultation');
    setStepNumber(3);
  };

  const handleConsultationComplete = () => {
    if (!consultation) return;

    consultationService.updateConsultationStatus(consultation.id, 'completed');
    setCurrentStep('completed');
    
    // Trigger completion callback
    onConsultationComplete?.(consultation);
    
    // Check if user has consultation history for account creation offer
    const history = consultationService.getConsultationHistory();
    if (history.length >= 1) {
      setTimeout(() => {
        onAccountCreationOffer?.(history);
      }, 2000);
    }
  };

  const handleAbandonmentRecovery = () => {
    setShowHelpPrompt(true);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'start':
        return (
          <QuickConsultationStart
            onStart={handleConsultationStart}
            onAbandonmentRecovery={handleAbandonmentRecovery}
            whatsappPhone={whatsappPhone}
          />
        );

      case 'connecting':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <Card className="text-center p-8">
              <CardContent className="space-y-6">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 mx-auto bg-accent-100 rounded-full flex items-center justify-center text-3xl"
                  >
                    🔄
                  </motion.div>
                  
                  {/* Pulsing rings */}
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-accent-300"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="absolute inset-0 rounded-full border-2 border-accent-200"
                  />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-primary-700 mb-2">
                    Conectando con tu médico
                  </h3>
                  <motion.p
                    key={connectionStatus}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-neutral-600"
                  >
                    {connectionStatus}
                  </motion.p>
                </div>

                <div className="bg-accent-50 rounded-lg p-4">
                  <p className="text-sm text-accent-700">
                    ⚡ Conexión segura y encriptada<br/>
                    👨‍⚕️ Médicos certificados disponibles 24/7
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'consultation':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="min-h-[600px]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      👨‍⚕️
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-700">Dr. García</h3>
                      <p className="text-sm text-neutral-500">Medicina General</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 font-medium">En línea</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold text-primary-700 mb-2">
                    🎉 ¡Consulta iniciada con éxito!
                  </h4>
                  <p className="text-neutral-600 mb-4">
                    Tu médico ha revisado tu consulta inicial y está listo para ayudarte.
                  </p>
                  
                  <div className="bg-white rounded-lg p-4 border-l-4 border-primary-500">
                    <p className="text-sm text-neutral-700">
                      <strong>Dr. García:</strong> "¡Hola {consultation?.name}! He revisado tu consulta sobre 
                      '{consultation?.mainSymptom}'. ¿Puedes contarme un poco más sobre cuándo empezaste a sentir estos síntomas?"
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleConsultationComplete}
                    className="mb-4"
                  >
                    🗨️ Continuar conversación con el médico
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-sm text-neutral-500">
                      Esta es una demostración del flujo de consulta.<br/>
                      En la versión real, aquí estaría el chat en tiempo real.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 'completed':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <Card className="p-8">
              <CardContent className="space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                  className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center text-4xl"
                >
                  ✅
                </motion.div>

                <div>
                  <h3 className="text-2xl font-bold text-green-700 mb-2">
                    ¡Consulta completada!
                  </h3>
                  <p className="text-neutral-600">
                    Gracias por confiar en DoctorMX, {consultation?.name}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-700">
                    📋 Resumen de tu consulta guardado<br/>
                    💊 Recomendaciones del médico enviadas<br/>
                    📱 Seguimiento disponible por WhatsApp
                  </p>
                </div>

                <div className="space-y-3">
                  <Button variant="primary" fullWidth>
                    📱 Ir a WhatsApp para seguimiento
                  </Button>
                  <Button variant="outline" fullWidth>
                    📄 Descargar resumen de consulta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`consultation-flow ${className}`}>
      {/* Progress Steps - Always visible */}
      <div className="mb-8">
        <ConsultationProgressSteps currentStep={stepNumber} />
      </div>

      {/* Current Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {renderCurrentStep()}
        </motion.div>
      </AnimatePresence>

      {/* Help Prompt Modal */}
      <AnimatePresence>
        {showHelpPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowHelpPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 max-w-sm w-full"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-accent-100 rounded-full flex items-center justify-center text-3xl">
                  🤔
                </div>
                
                <h3 className="text-xl font-semibold text-neutral-800">
                  ¿Necesitas ayuda?
                </h3>
                
                <p className="text-neutral-600">
                  Notamos que pausaste tu consulta. ¿Te gustaría que te ayudemos?
                </p>
                
                <div className="space-y-3">
                  <Button 
                    variant="primary" 
                    fullWidth
                    onClick={() => setShowHelpPrompt(false)}
                  >
                    Continuar consulta
                  </Button>
                  <Button 
                    variant="outline" 
                    fullWidth
                  >
                    📱 Contactar por WhatsApp
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConsultationFlowManager;