import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { FieldValidators, PlaceholderText, HelpText } from '../../utils/spanish-validation';

export interface ConsultationData {
  name: string;
  mainSymptom: string;
  phone?: string;
  whatsappDetected?: boolean;
}

export interface QuickConsultationStartProps {
  onStart: (data: ConsultationData) => void;
  onAbandonmentRecovery?: () => void;
  whatsappPhone?: string;
  className?: string;
}

const QuickConsultationStart: React.FC<QuickConsultationStartProps> = ({
  onStart,
  onAbandonmentRecovery,
  whatsappPhone,
  className = ''
}) => {
  const [formData, setFormData] = useState<ConsultationData>({
    name: '',
    mainSymptom: '',
    phone: whatsappPhone || '',
    whatsappDetected: !!whatsappPhone
  });
  
  const [errors, setErrors] = useState<Partial<ConsultationData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHelpPrompt, setShowHelpPrompt] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Auto-detect WhatsApp integration
  useEffect(() => {
    if (whatsappPhone) {
      setFormData(prev => ({
        ...prev,
        phone: whatsappPhone,
        whatsappDetected: true
      }));
    }
  }, [whatsappPhone]);

  // Track user activity for abandonment recovery
  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now());
      setShowHelpPrompt(false);
    };

    const checkInactivity = setInterval(() => {
      const inactiveTime = Date.now() - lastActivity;
      
      // Show help prompt after 3 minutes of inactivity
      if (inactiveTime > 180000 && (formData.name || formData.mainSymptom)) {
        setShowHelpPrompt(true);
      }
      
      // Trigger abandonment recovery after 5 minutes
      if (inactiveTime > 300000 && (formData.name || formData.mainSymptom)) {
        onAbandonmentRecovery?.();
      }
    }, 30000); // Check every 30 seconds

    document.addEventListener('input', handleActivity);
    document.addEventListener('focus', handleActivity);
    document.addEventListener('click', handleActivity);

    return () => {
      clearInterval(checkInactivity);
      document.removeEventListener('input', handleActivity);
      document.removeEventListener('focus', handleActivity);
      document.removeEventListener('click', handleActivity);
    };
  }, [formData, lastActivity, onAbandonmentRecovery]);

  // Save form data to localStorage for recovery
  useEffect(() => {
    if (formData.name || formData.mainSymptom) {
      localStorage.setItem('consultation_draft', JSON.stringify({
        ...formData,
        timestamp: Date.now()
      }));
    }
  }, [formData]);

  // Load saved form data on mount
  useEffect(() => {
    const saved = localStorage.getItem('consultation_draft');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        // Only restore if saved within last 24 hours
        if (Date.now() - parsedData.timestamp < 86400000) {
          setFormData({
            name: parsedData.name || '',
            mainSymptom: parsedData.mainSymptom || '',
            phone: whatsappPhone || parsedData.phone || '',
            whatsappDetected: !!whatsappPhone
          });
        }
      } catch (error) {
        console.error('Error loading saved consultation data:', error);
      }
    }
  }, [whatsappPhone]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ConsultationData> = {};
    
    // Validate name using Spanish validator
    const nameValidation = FieldValidators.name(formData.name);
    if (!nameValidation.isValid && nameValidation.message) {
      newErrors.name = nameValidation.message;
    }
    
    // Validate symptom using Spanish validator
    const symptomValidation = FieldValidators.symptom(formData.mainSymptom);
    if (!symptomValidation.isValid && symptomValidation.message) {
      newErrors.mainSymptom = symptomValidation.message;
    }
    
    // Validate phone if provided (optional field)
    if (formData.phone && formData.phone.trim()) {
      const phoneValidation = FieldValidators.phone(formData.phone);
      if (!phoneValidation.isValid && phoneValidation.message) {
        newErrors.phone = phoneValidation.message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Clear saved form data on successful submission
      localStorage.removeItem('consultation_draft');
      
      // Add small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onStart(formData);
    } catch (error) {
      console.error('Error starting consultation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ConsultationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-primary-700 mb-2">
              🩺 Consulta Médica Rápida
            </CardTitle>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Cuéntanos lo que te está molestando y te conectaremos con un médico profesional
            </p>
            
            {formData.whatsappDetected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 mt-3 px-3 py-2 bg-accent-50 rounded-lg border border-accent-200"
              >
                <span className="text-lg">📱</span>
                <span className="text-sm text-accent-700 font-medium">
                  WhatsApp detectado - Consulta más rápida
                </span>
              </motion.div>
            )}
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                  ¿Cuál es tu nombre? <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder={PlaceholderText.name}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={errors.name}
                  className="text-base h-12"
                  autoComplete="given-name"
                  maxLength={50}
                />
                <p className="mt-1 text-xs text-neutral-500">
                  {HelpText.name}
                </p>
              </div>

              {/* Main Symptom Input */}
              <div>
                <label htmlFor="mainSymptom" className="block text-sm font-medium text-neutral-700 mb-2">
                  ¿Qué síntoma o molestia tienes? <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    id="mainSymptom"
                    placeholder={PlaceholderText.symptom}
                    value={formData.mainSymptom}
                    onChange={(e) => handleInputChange('mainSymptom', e.target.value)}
                    className={`w-full rounded-lg border-2 transition-colors duration-200 min-h-[100px] p-3 text-base resize-none
                      ${errors.mainSymptom 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500'
                      }`}
                    maxLength={500}
                    rows={4}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-neutral-400">
                    {formData.mainSymptom.length}/500
                  </div>
                </div>
                {errors.mainSymptom && (
                  <p className="mt-1 text-sm text-red-600">{errors.mainSymptom}</p>
                )}
                {!errors.mainSymptom && (
                  <p className="mt-1 text-xs text-neutral-500">
                    {HelpText.symptom}
                  </p>
                )}
              </div>

              {/* Phone Input - Only if not detected from WhatsApp */}
              {!formData.whatsappDetected && (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                    Teléfono (opcional)
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={PlaceholderText.phone}
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    error={errors.phone}
                    className="text-base h-12"
                    autoComplete="tel"
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    {HelpText.phone}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                className="mt-6 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Conectando con médico...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>🚀</span>
                    Iniciar Consulta Ahora
                  </span>
                )}
              </Button>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-neutral-100">
                <div className="flex items-center justify-center gap-4 text-xs text-neutral-500">
                  <div className="flex items-center gap-1">
                    <span>🔒</span>
                    <span>100% Confidencial</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>⚡</span>
                    <span>Respuesta Inmediata</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>👨‍⚕️</span>
                    <span>Médicos Certificados</span>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Help Prompt */}
      <AnimatePresence>
        {showHelpPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-4 right-4 max-w-sm"
          >
            <Card className="bg-accent-50 border-accent-200 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🤔</span>
                  <div>
                    <h4 className="font-semibold text-accent-800 mb-1">
                      ¿Necesitas ayuda?
                    </h4>
                    <p className="text-sm text-accent-700 mb-3">
                      Si tienes dudas, puedes contactarnos directamente
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowHelpPrompt(false)}
                      className="w-full"
                    >
                      Continuar llenando
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuickConsultationStart;