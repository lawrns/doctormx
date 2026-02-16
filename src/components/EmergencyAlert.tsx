'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, X } from 'lucide-react';
import { useState } from 'react';
import { logger } from '@/lib/observability/logger';

interface EmergencyAlertProps {
  message: string;
  symptoms: string[];
  severity: 'critical' | 'high';
  onDismiss?: () => void;
  onCall911?: () => void;
}

export function EmergencyAlert({
  message,
  symptoms,
  severity,
  onDismiss,
  onCall911,
}: EmergencyAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const handleCall = () => {
    // Log emergency interaction
    logger.info('[EMERGENCY] User clicked call 911', { message, symptoms, severity });

    // On mobile, initiate phone call
    if (typeof window !== 'undefined' && /iPhone|iPad|Android/i.test(navigator.userAgent)) {
      window.location.href = 'tel:911';
    }

    onCall911?.();
  };

  const isCritical = severity === 'critical';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-4 left-4 right-4 z-50 max-w-2xl mx-auto"
          role="alert"
          aria-live="assertive"
        >
          <div
            className={`
              relative rounded-2xl p-6 shadow-2xl border-2
              ${isCritical
                ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-500'
                : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-500'
              }
            `}
          >
            {/* Dismiss button */}
            {onDismiss && (
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/50 transition-colors"
                aria-label="Cerrar alerta"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            )}

            {/* Alert Icon */}
            <div className="flex items-start gap-4">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
                className={`
                  flex-shrink-0 p-3 rounded-full
                  ${isCritical ? 'bg-red-500' : 'bg-orange-500'}
                `}
              >
                <AlertTriangle className="w-8 h-8 text-white" />
              </motion.div>

              <div className="flex-1 space-y-3">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900">
                  {isCritical ? 'EMERGENCIA MÉDICA' : 'ATENCIÓN URGENTE REQUERIDA'}
                </h3>

                {/* Message */}
                <p className="text-gray-800 font-semibold">
                  {message}
                </p>

                {/* Symptoms detected */}
                {symptoms.length > 0 && (
                  <div className="bg-white/60 rounded-lg p-3 space-y-1">
                    <p className="text-sm font-semibold text-gray-700">
                      Síntomas detectados:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {symptoms.map((symptom, index) => (
                        <li key={index}>{symptom}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleCall}
                    className={`
                      flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                      font-bold text-white shadow-lg
                      ${isCritical
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-orange-600 hover:bg-orange-700'
                      }
                      transform hover:scale-105 active:scale-95
                      transition-all duration-200
                      focus:outline-none focus:ring-4 focus:ring-red-300
                    `}
                  >
                    <Phone className="w-5 h-5" />
                    LLAMAR AL 911 AHORA
                  </button>

                  {!isCritical && (
                    <button
                      onClick={handleDismiss}
                      className="
                        px-6 py-3 rounded-xl font-semibold
                        bg-white border-2 border-gray-300 text-gray-700
                        hover:bg-gray-50 hover:border-gray-400
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-gray-400
                      "
                    >
                      Continuar con consulta
                    </button>
                  )}
                </div>

                {/* Legal disclaimer */}
                <p className="text-xs text-gray-600 pt-2 border-t border-gray-300">
                  Esta alerta se basa en los síntomas reportados. En caso de emergencia real,
                  siempre llame al 911 o acuda al servicio de urgencias más cercano.
                </p>
              </div>
            </div>

            {/* Pulsing border for critical alerts */}
            {isCritical && (
              <motion.div
                className="absolute inset-0 border-4 border-red-500 rounded-2xl pointer-events-none"
                animate={{
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Modal version that blocks further interaction
 */
export function EmergencyModal({
  message,
  symptoms,
  severity,
}: Omit<EmergencyAlertProps, 'onDismiss' | 'onCall911'>) {
  const handleCall = () => {
    if (typeof window !== 'undefined' && /iPhone|iPad|Android/i.test(navigator.userAgent)) {
      window.location.href = 'tel:911';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative max-w-2xl w-full"
      >
        <EmergencyAlert
          message={message}
          symptoms={symptoms}
          severity={severity}
          onCall911={handleCall}
        />
      </motion.div>
    </div>
  );
}
