import React from 'react';
import { motion } from 'framer-motion';

export interface ConsultationStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  status: 'pending' | 'active' | 'completed';
}

export interface ConsultationProgressStepsProps {
  currentStep: number;
  className?: string;
}

const ConsultationProgressSteps: React.FC<ConsultationProgressStepsProps> = ({
  currentStep,
  className = ''
}) => {
  const steps: ConsultationStep[] = [
    {
      id: 1,
      title: 'Describe tu problema',
      description: 'Cuéntanos qué síntomas tienes',
      icon: '📝',
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'active' : 'pending'
    },
    {
      id: 2,
      title: 'Conectando con médico',
      description: 'Te conectamos con un profesional',
      icon: '🔄',
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : 'pending'
    },
    {
      id: 3,
      title: 'Consulta en progreso',
      description: 'Conversación con tu médico',
      icon: '👨‍⚕️',
      status: currentStep >= 3 ? 'active' : 'pending'
    }
  ];

  const getStepStyles = (step: ConsultationStep) => {
    switch (step.status) {
      case 'completed':
        return {
          container: 'bg-primary-500 text-white shadow-md',
          connector: 'bg-primary-500',
          text: 'text-primary-700'
        };
      case 'active':
        return {
          container: 'bg-accent-500 text-white shadow-lg ring-4 ring-accent-200',
          connector: 'bg-gradient-to-r from-primary-500 to-accent-500',
          text: 'text-accent-700 font-semibold'
        };
      default:
        return {
          container: 'bg-neutral-100 text-neutral-400 border-2 border-neutral-200',
          connector: 'bg-neutral-200',
          text: 'text-neutral-500'
        };
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      {/* Mobile Progress Bar */}
      <div className="block md:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-neutral-600">
            Paso {currentStep} de {steps.length}
          </span>
          <span className="text-sm text-neutral-500">
            {Math.round((currentStep / steps.length) * 100)}% completado
          </span>
        </div>
        
        <div className="w-full bg-neutral-200 rounded-full h-2 mb-6">
          <motion.div
            className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Current Step Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg border-2 border-accent-200 p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center text-2xl">
              {steps[currentStep - 1]?.icon}
            </div>
            <div>
              <h3 className="font-semibold text-accent-700">
                {steps[currentStep - 1]?.title}
              </h3>
              <p className="text-sm text-neutral-600">
                {steps[currentStep - 1]?.description}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Desktop Horizontal Steps */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          {steps.map((step, index) => {
            const styles = getStepStyles(step);
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  {/* Step Circle */}
                  <motion.div
                    className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${styles.container}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: step.status === 'active' ? 1.1 : 1, 
                      opacity: 1 
                    }}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.1 
                    }}
                  >
                    {step.status === 'completed' ? (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                      >
                        ✅
                      </motion.span>
                    ) : step.status === 'active' ? (
                      <motion.span
                        animate={{ 
                          rotate: step.id === 2 ? 360 : 0,
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                          scale: { duration: 1, repeat: Infinity }
                        }}
                      >
                        {step.icon}
                      </motion.span>
                    ) : (
                      step.icon
                    )}
                    
                    {step.status === 'active' && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-accent-300"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>

                  {/* Step Text */}
                  <div className="mt-4 text-center">
                    <h3 className={`font-semibold text-sm ${styles.text}`}>
                      {step.title}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 max-w-24">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div className="absolute top-8 left-1/2 w-full h-1 -translate-y-1/2 translate-x-8 z-0">
                    <div className="w-full h-full bg-neutral-200 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${styles.connector}`}
                        initial={{ width: '0%' }}
                        animate={{ 
                          width: step.status === 'completed' ? '100%' : '0%'
                        }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Active Step Details */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-8 text-center"
        >
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-6 border border-primary-200">
            <h4 className="font-semibold text-primary-700 mb-2">
              {steps[currentStep - 1]?.title}
            </h4>
            <p className="text-neutral-600">
              {steps[currentStep - 1]?.description}
            </p>
            
            {currentStep === 2 && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-accent-600">
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  🔍
                </motion.span>
                <span>Buscando el médico perfecto para tu caso...</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Estimated Time */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-50 rounded-full text-sm text-neutral-600">
          <span>⏱️</span>
          <span>
            Tiempo estimado: {currentStep === 1 ? '1-2 min' : currentStep === 2 ? '30 seg' : '15-30 min'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConsultationProgressSteps;