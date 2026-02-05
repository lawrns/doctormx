'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Users, Heart, Sparkles, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ConversationalWelcomeProps {
  onStart: () => void;
  userName?: string;
  className?: string;
}

const welcomeMessages = [
  {
    icon: Heart,
    title: 'Atención Personalizada',
    description: '4 especialistas analizarán tu caso con tecnología de inteligencia artificial',
  },
  {
    icon: Shield,
    title: 'Seguridad y Confianza',
    description: 'Tus datos están protegidos con encriptación de nivel médico',
  },
  {
    icon: Clock,
    title: 'Resultados Rápidos',
    description: 'Obtén una orientación médica preliminar en menos de 2 minutos',
  },
];

export function ConversationalWelcome({
  onStart,
  userName,
  className,
}: ConversationalWelcomeProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
      className={cn('space-y-8 max-w-2xl mx-auto', className)}
    >
      {/* Hero Section with Icon */}
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: shouldReduceMotion ? 1 : 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: shouldReduceMotion ? 0 : 0.2,
            type: 'spring',
            stiffness: 200,
            damping: 15,
          }}
          className="relative inline-block"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-teal-400 blur-3xl opacity-20 rounded-full" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl mx-auto">
            <Users className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: shouldReduceMotion ? 0 : 0.3 }}
          className="space-y-3"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {userName ? `¡Hola, ${userName}!` : '¡Hola!'}
          </h1>
          <p className="text-xl text-gray-600">
            Soy tu asistente de orientación de salud. Estoy aquí para ayudarte.
          </p>
        </motion.div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {welcomeMessages.map((message, index) => (
          <motion.div
            key={message.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: shouldReduceMotion ? 0 : 0.4 + index * 0.1,
              duration: 0.4,
            }}
          >
            <Card className="p-5 bg-gradient-to-br from-white to-blue-50/50 border-blue-100 hover:shadow-md transition-all">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <message.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{message.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{message.description}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Warm Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: shouldReduceMotion ? 0 : 0.7 }}
      >
        <Card className="p-5 bg-gradient-to-r from-teal-50 to-blue-50 border-teal-100">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Sparkles className="w-5 h-5 text-teal-600 mt-0.5" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong className="text-gray-900">¿Cómo te sientes hoy?</strong> Cuéntame qué te molesta y te haré algunas preguntas para entender mejor tu situación.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Important Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: shouldReduceMotion ? 0 : 0.8 }}
      >
        <Card className="p-4 bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-800 text-center">
            <strong>Importante:</strong> Esta herramienta es orientativa. En caso de emergencia, llama al 911.
          </p>
        </Card>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: shouldReduceMotion ? 0 : 0.9 }}
        className="pt-4"
      >
        <Button
          onClick={onStart}
          size="lg"
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-lg shadow-lg hover:shadow-xl transition-all"
        >
          Comenzar Consulta
          <motion.span
            animate={{ x: shouldReduceMotion ? 0 : [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="ml-2 inline-block"
          >
            →
          </motion.span>
        </Button>
      </motion.div>
    </motion.div>
  );
}
