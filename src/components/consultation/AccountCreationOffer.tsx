import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { GuestConsultationData } from './GuestConsultationService';
import { FieldValidators, validateForm } from '../../utils/spanish-validation';

export interface AccountCreationOfferProps {
  consultationHistory: GuestConsultationData[];
  onCreateAccount: (email: string, password: string) => Promise<boolean>;
  onSkip: () => void;
  onClose: () => void;
  isOpen: boolean;
}

const AccountCreationOffer: React.FC<AccountCreationOfferProps> = ({
  consultationHistory,
  onCreateAccount,
  onSkip,
  onClose,
  isOpen
}) => {
  const [currentView, setCurrentView] = useState<'offer' | 'form' | 'success'>('offer');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);

  const totalConsultations = consultationHistory.length;
  const lastConsultation = consultationHistory[0];

  const validateAndSubmit = async () => {
    // Validate form
    const validation = validateForm(formData, {
      email: FieldValidators.email,
      password: FieldValidators.password
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsCreating(true);
    setErrors({});

    try {
      const success = await onCreateAccount(formData.email, formData.password);
      
      if (success) {
        setCurrentView('success');
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setErrors({ general: 'Hubo un problema al crear tu cuenta. Inténtalo de nuevo.' });
      }
    } catch (error) {
      setErrors({ general: 'Error inesperado. Verifica tu conexión e inténtalo de nuevo.' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderOfferView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <CardHeader className="text-center pb-4">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary-100 to-accent-100 rounded-full flex items-center justify-center text-3xl mb-4">
          🎉
        </div>
        
        <CardTitle className="text-2xl font-bold text-primary-700 mb-2">
          ¡Excelente consulta!
        </CardTitle>
        
        <p className="text-neutral-600 leading-relaxed">
          {lastConsultation?.name}, hemos notado que ya tienes {totalConsultations} consulta{totalConsultations > 1 ? 's' : ''} con nosotros.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Benefits Preview */}
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-6">
          <h4 className="font-semibold text-primary-700 mb-4 text-center">
            🌟 Crea tu cuenta y obtén:
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <h5 className="font-medium text-primary-700">Historial Médico</h5>
                <p className="text-sm text-neutral-600">
                  Acceso a todas tus {totalConsultations} consulta{totalConsultations > 1 ? 's' : ''} anteriores
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h5 className="font-medium text-primary-700">Consultas Rápidas</h5>
                <p className="text-sm text-neutral-600">
                  Sin llenar formularios, acceso directo
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔔</span>
              <div>
                <h5 className="font-medium text-primary-700">Recordatorios</h5>
                <p className="text-sm text-neutral-600">
                  Seguimiento y recordatorios de tratamiento
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-2xl">👨‍⚕️</span>
              <div>
                <h5 className="font-medium text-primary-700">Médico Preferido</h5>
                <p className="text-sm text-neutral-600">
                  Continúa con el mismo doctor que te conoce
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Consultation History Preview */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <h5 className="font-medium text-neutral-700 mb-3 flex items-center gap-2">
            📚 Tu historial médico
          </h5>
          
          <div className="space-y-2">
            {consultationHistory.slice(0, 3).map((consultation, index) => (
              <div key={consultation.id} className="flex items-center gap-3 p-2 bg-neutral-50 rounded">
                <span className="text-sm text-neutral-500">
                  {new Date(consultation.createdAt).toLocaleDateString('es-MX')}
                </span>
                <span className="text-sm text-neutral-700 truncate">
                  {consultation.mainSymptom}
                </span>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  Completada
                </span>
              </div>
            ))}
            
            {consultationHistory.length > 3 && (
              <p className="text-xs text-neutral-500 text-center">
                Y {consultationHistory.length - 3} consulta{consultationHistory.length - 3 > 1 ? 's' : ''} más...
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => setCurrentView('form')}
            className="shadow-lg"
          >
            🚀 Crear mi cuenta gratis
          </Button>
          
          <Button
            variant="ghost"
            fullWidth
            onClick={onSkip}
            className="text-neutral-500"
          >
            Tal vez después
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="pt-4 border-t border-neutral-100">
          <div className="flex items-center justify-center gap-4 text-xs text-neutral-500">
            <div className="flex items-center gap-1">
              <span>🔒</span>
              <span>100% Seguro</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⚡</span>
              <span>Solo 30 segundos</span>
            </div>
            <div className="flex items-center gap-1">
              <span>✨</span>
              <span>Completamente gratis</span>
            </div>
          </div>
        </div>
      </CardContent>
    </motion.div>
  );

  const renderFormView = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold text-primary-700 mb-2">
          Crear tu cuenta médica
        </CardTitle>
        <p className="text-neutral-600 text-sm">
          Solo necesitamos tu correo y una contraseña segura
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); validateAndSubmit(); }} className="space-y-5">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              type="email"
              placeholder="tu.correo@ejemplo.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              className="text-base h-12"
              autoComplete="email"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Te permitirá acceder a tu historial médico
            </p>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={errors.password}
              className="text-base h-12"
              autoComplete="new-password"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Protege tu información médica personal
            </p>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isCreating}
            className="mt-6"
          >
            {isCreating ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Creando tu cuenta...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>✨</span>
                Crear cuenta gratis
              </span>
            )}
          </Button>

          {/* Back Button */}
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={() => setCurrentView('offer')}
            disabled={isCreating}
          >
            ← Regresar
          </Button>
        </form>
      </CardContent>
    </motion.div>
  );

  const renderSuccessView = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="text-center"
    >
      <CardHeader className="pb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.2 }}
          className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center text-4xl mb-4"
        >
          🎉
        </motion.div>
        
        <CardTitle className="text-2xl font-bold text-green-700 mb-2">
          ¡Cuenta creada con éxito!
        </CardTitle>
        
        <p className="text-neutral-600">
          Bienvenid@ a DoctorMX, {lastConsultation?.name}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-green-50 rounded-lg p-6">
          <h4 className="font-semibold text-green-700 mb-3">
            🌟 Ya tienes acceso a:
          </h4>
          
          <div className="space-y-2 text-sm text-green-700">
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span>Tu historial completo de {totalConsultations} consulta{totalConsultations > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span>Consultas rápidas sin formularios</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span>Recordatorios de seguimiento</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span>Conexión directa con tus médicos</span>
            </div>
          </div>
        </div>

        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-sm text-neutral-500"
        >
          Cerrando automáticamente...
        </motion.div>
      </CardContent>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <Card className="border-0 shadow-none">
              {/* Close Button */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={onClose}
                  className="w-8 h-8 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              <AnimatePresence mode="wait">
                {currentView === 'offer' && renderOfferView()}
                {currentView === 'form' && renderFormView()}
                {currentView === 'success' && renderSuccessView()}
              </AnimatePresence>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AccountCreationOffer;