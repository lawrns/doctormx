/**
 * Optimized UX Flow Components for DoctorMX
 * Onboarding, error handling, navigation, and user journey optimization
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, ArrowRight, ArrowLeft, X, HelpCircle, RefreshCw } from './icons';

// Enhanced Error Boundary with Medical Context
interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  context?: 'consultation' | 'appointment' | 'prescription' | 'general';
}

export const MedicalErrorFallback = ({ error, resetError, context = 'general' }: ErrorFallbackProps) => {
  const contextMessages = {
    consultation: {
      title: 'Error en la Consulta',
      message: 'Hubo un problema durante su consulta médica. Sus datos están seguros.',
      action: 'Reintentar Consulta'
    },
    appointment: {
      title: 'Error en la Cita',
      message: 'No pudimos procesar su cita médica en este momento.',
      action: 'Programar Nuevamente'
    },
    prescription: {
      title: 'Error en la Receta',
      message: 'Hubo un problema al generar su receta médica.',
      action: 'Generar Receta'
    },
    general: {
      title: 'Error Técnico',
      message: 'Algo salió mal. Nuestro equipo técnico ha sido notificado.',
      action: 'Intentar de Nuevo'
    }
  };

  const config = contextMessages[context];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-secondary">
      <div className="max-w-md w-full bg-white rounded-xl shadow-card p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <h2 className="text-xl font-semibold text-text-medical mb-2">{config.title}</h2>
        <p className="text-text-secondary mb-6">{config.message}</p>
        
        <div className="space-y-3">
          <button
            onClick={resetError}
            className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-600 transition-colors"
          >
            {config.action}
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full border border-border-medium text-text-secondary py-3 px-4 rounded-lg hover:bg-background-secondary transition-colors"
          >
            Ir al Inicio
          </button>
        </div>
        
        <details className="mt-6 text-left">
          <summary className="text-sm text-text-tertiary cursor-pointer hover:text-text-secondary">
            Detalles técnicos
          </summary>
          <pre className="mt-2 p-3 bg-background-tertiary rounded text-xs text-text-tertiary overflow-auto">
            {error.message}
          </pre>
        </details>
      </div>
    </div>
  );
};

// Medical Onboarding Flow
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  validation?: () => boolean;
}

interface MedicalOnboardingProps {
  steps: OnboardingStep[];
  onComplete: (data: any) => void;
  className?: string;
}

export const MedicalOnboarding = ({ steps, onComplete, className = '' }: MedicalOnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isValid, setIsValid] = useState(false);

  const currentStepData = steps[currentStep];

  useEffect(() => {
    if (currentStepData?.validation) {
      setIsValid(currentStepData.validation());
    } else {
      setIsValid(true);
    }
  }, [currentStep, formData, currentStepData]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-text-secondary mb-2">
          <span>Paso {currentStep + 1} de {steps.length}</span>
          <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div 
            className="bg-primary-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-card p-6 mb-6">
        <h2 className="text-2xl font-semibold text-text-medical mb-2">
          {currentStepData.title}
        </h2>
        <p className="text-text-secondary mb-6">
          {currentStepData.description}
        </p>
        
        <div className="min-h-[200px]">
          {currentStepData.component}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-6 py-3 border border-border-medium rounded-lg hover:bg-background-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </button>
        
        <button
          onClick={handleNext}
          disabled={!isValid}
          className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentStep === steps.length - 1 ? 'Completar' : 'Siguiente'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Success/Confirmation Flow
interface SuccessFlowProps {
  type: 'appointment' | 'consultation' | 'prescription' | 'registration';
  title?: string;
  message?: string;
  details?: React.ReactNode;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  className?: string;
}

export const SuccessFlow = ({ 
  type, 
  title, 
  message, 
  details, 
  actions = [],
  className = '' 
}: SuccessFlowProps) => {
  const defaultConfig = {
    appointment: {
      title: '¡Cita Programada!',
      message: 'Su cita médica ha sido confirmada exitosamente.',
      icon: <CheckCircle className="w-16 h-16 text-green-500" />
    },
    consultation: {
      title: '¡Consulta Completada!',
      message: 'Su consulta médica ha sido registrada.',
      icon: <CheckCircle className="w-16 h-16 text-primary-500" />
    },
    prescription: {
      title: '¡Receta Generada!',
      message: 'Su receta médica está lista para descargar.',
      icon: <CheckCircle className="w-16 h-16 text-blue-500" />
    },
    registration: {
      title: '¡Registro Exitoso!',
      message: 'Bienvenido a DoctorMX. Su cuenta ha sido creada.',
      icon: <CheckCircle className="w-16 h-16 text-green-500" />
    }
  };

  const config = defaultConfig[type];

  return (
    <div className={`max-w-md mx-auto text-center p-6 ${className}`}>
      <div className="mb-6">
        {config.icon}
      </div>
      
      <h2 className="text-2xl font-semibold text-text-medical mb-3">
        {title || config.title}
      </h2>
      
      <p className="text-text-secondary mb-6">
        {message || config.message}
      </p>
      
      {details && (
        <div className="bg-background-secondary p-4 rounded-lg mb-6 text-left">
          {details}
        </div>
      )}
      
      <div className="space-y-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              action.variant === 'secondary'
                ? 'border border-border-medium text-text-secondary hover:bg-background-secondary'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Enhanced Navigation Breadcrumbs
interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface EnhancedBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const EnhancedBreadcrumbs = ({ items, className = '' }: EnhancedBreadcrumbsProps) => {
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ArrowRight className="w-4 h-4 text-text-tertiary" />
          )}
          
          {item.href && !item.isActive ? (
            <a
              href={item.href}
              className="text-primary-600 hover:text-primary-700 transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className={`${
              item.isActive ? 'text-text-primary font-medium' : 'text-text-tertiary'
            }`}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// Help & Support Component
interface HelpSupportProps {
  context?: 'consultation' | 'appointment' | 'general';
  className?: string;
}

export const HelpSupport = ({ context = 'general', className = '' }: HelpSupportProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const helpContent = {
    consultation: {
      title: 'Ayuda con Consultas',
      items: [
        '¿Cómo iniciar una consulta?',
        '¿Qué información necesito?',
        '¿Es segura mi información médica?',
        '¿Puedo obtener una receta?'
      ]
    },
    appointment: {
      title: 'Ayuda con Citas',
      items: [
        '¿Cómo programar una cita?',
        '¿Puedo cancelar o reprogramar?',
        '¿Qué documentos necesito?',
        '¿Cuánto cuesta la cita?'
      ]
    },
    general: {
      title: 'Ayuda General',
      items: [
        '¿Cómo funciona DoctorMX?',
        '¿Es seguro usar la plataforma?',
        '¿Qué servicios ofrecemos?',
        '¿Cómo contactar soporte?'
      ]
    }
  };

  const content = helpContent[context];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:text-primary-700 transition-colors"
        aria-label="Ayuda y soporte"
      >
        <HelpCircle className="w-5 h-5" />
        <span className="text-sm font-medium">Ayuda</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-border-light z-50">
            <div className="p-4 border-b border-border-light">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-text-medical">{content.title}</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-text-tertiary hover:text-text-secondary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-2">
              {content.items.map((item, index) => (
                <button
                  key={index}
                  className="w-full text-left text-sm text-text-secondary hover:text-text-primary hover:bg-background-secondary p-2 rounded transition-colors"
                >
                  {item}
                </button>
              ))}
              
              <div className="pt-2 border-t border-border-light">
                <button className="w-full text-left text-sm text-primary-600 hover:text-primary-700 p-2 rounded transition-colors font-medium">
                  Contactar Soporte →
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Toast Notification System
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
  duration?: number;
  onClose: () => void;
}

export const Toast = ({ type, message, description, duration = 5000, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeConfig = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      icon: <CheckCircle className="w-5 h-5 text-green-500" />
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      icon: <AlertCircle className="w-5 h-5 text-red-500" />
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      icon: <AlertCircle className="w-5 h-5 text-yellow-500" />
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      icon: <HelpCircle className="w-5 h-5 text-blue-500" />
    }
  };

  const config = typeConfig[type];

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${config.bgColor} ${config.borderColor} ${config.textColor} shadow-sm animate-slide-up`}>
      {config.icon}
      <div className="flex-1">
        <p className="font-medium">{message}</p>
        {description && (
          <p className="text-sm opacity-90 mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-current opacity-60 hover:opacity-80 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default {
  MedicalErrorFallback,
  MedicalOnboarding,
  SuccessFlow,
  EnhancedBreadcrumbs,
  HelpSupport,
  Toast
};