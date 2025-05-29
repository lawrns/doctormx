import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Gift, Shield, Heart, Clock, Users, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { anonymousConsultationTracker } from '../services/AnonymousConsultationTracker';

interface ConversionPromptProps {
  onClose: () => void;
  onRegister: () => void;
}

const benefits = [
  {
    icon: Heart,
    title: 'Historial médico completo',
    description: 'Guarda todas tus consultas y seguimiento'
  },
  {
    icon: Gift,
    title: '5 consultas adicionales gratis',
    description: 'Al crear tu cuenta'
  },
  {
    icon: Users,
    title: 'Perfiles familiares',
    description: 'Gestiona la salud de toda tu familia'
  },
  {
    icon: Clock,
    title: 'Recordatorios de medicamentos',
    description: 'Nunca olvides tomar tu medicina'
  },
  {
    icon: Shield,
    title: 'Datos seguros y privados',
    description: 'Cifrado de grado médico'
  },
  {
    icon: TrendingUp,
    title: 'Seguimiento de progreso',
    description: 'Visualiza tu mejora en el tiempo'
  }
];

export default function ConversionPrompt({ onClose, onRegister }: ConversionPromptProps) {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState<ReturnType<typeof anonymousConsultationTracker.getConversionPrompt>>(null);
  const usage = anonymousConsultationTracker.getUsageData();

  useEffect(() => {
    const currentPrompt = anonymousConsultationTracker.getConversionPrompt();
    setPrompt(currentPrompt);
  }, []);

  if (!prompt?.show) return null;

  const handleRegister = () => {
    onRegister();
    navigate('/register', { state: { from: '/doctor' } });
  };

  const isHardPrompt = prompt.type === 'hard';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={isHardPrompt ? undefined : onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`relative p-6 pb-4 ${
            isHardPrompt ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-[#006D77] to-[#007B8A]'
          }`}>
            {!isHardPrompt && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            )}
            
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold mb-2">
                {isHardPrompt ? '¡Has alcanzado el límite!' : '¡Mejora tu experiencia!'}
              </h2>
              <p className="text-white/90">
                {prompt.message}
              </p>
            </div>

            {/* Usage indicator */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-white/80 mb-2">
                <span>Consultas usadas</span>
                <span>{usage.used} de {usage.total}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${(usage.used / usage.total) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Beneficios de crear tu cuenta gratuita:
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-[#D0F0EF] rounded-lg flex items-center justify-center">
                      <Icon size={20} className="text-[#006D77]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{benefit.title}</h4>
                      <p className="text-xs text-gray-600 mt-0.5">{benefit.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleRegister}
                className="w-full bg-[#006D77] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#005B66] transition-all duration-200 transform hover:scale-[1.02]"
              >
                {prompt.cta}
              </button>
              
              {!isHardPrompt && (
                <button
                  onClick={onClose}
                  className="w-full text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Continuar sin cuenta
                </button>
              )}
            </div>

            {/* Trust indicators */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <span>🔒 100% Seguro</span>
                <span>•</span>
                <span>📱 Sin tarjeta de crédito</span>
                <span>•</span>
                <span>⚡ Registro en 30 segundos</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}