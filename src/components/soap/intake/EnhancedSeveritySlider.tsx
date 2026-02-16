'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Frown, Meh, Smile, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface EnhancedSeveritySliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  min?: number;
  max?: number;
}

const severityConfig = [
  { level: 1, label: 'Muy leve', color: '#22c55e', emoji: '😌', icon: Smile },
  { level: 2, label: 'Leve', color: '#84cc16', emoji: '🙂', icon: Smile },
  { level: 3, label: 'Leve-Moderado', color: '#a3e635', emoji: '😐', icon: Meh },
  { level: 4, label: 'Moderado', color: '#facc15', emoji: '😕', icon: Meh },
  { level: 5, label: 'Moderado', color: '#fbbf24', emoji: '😟', icon: Meh },
  { level: 6, label: 'Intenso', color: '#fb923c', emoji: '😣', icon: Frown },
  { level: 7, label: 'Intenso', color: '#f97316', emoji: '😖', icon: Frown },
  { level: 8, label: 'Muy intenso', color: '#ef4444', emoji: '😫', icon: Frown },
  { level: 9, label: 'Severo', color: '#dc2626', emoji: '😭', icon: Frown },
  { level: 10, label: 'Insoportable', color: '#b91c1c', emoji: '😱', icon: AlertTriangle },
];

export function EnhancedSeveritySlider({
  value,
  onChange,
  className,
  min = 1,
  max = 10,
}: EnhancedSeveritySliderProps) {
  const shouldReduceMotion = useReducedMotion();
  const currentConfig = severityConfig.find((c) => c.level === value) || severityConfig[4];
  const Icon = currentConfig.icon;

  // Calculate gradient based on value
  const getGradientStyle = () => {
    const percentage = ((value - min) / (max - min)) * 100;

    // Create color stops for gradient
    const stops = severityConfig.map((config) => {
      const position = ((config.level - min) / (max - min)) * 100;
      return `${config.color} ${position}%`;
    }).join(', ');

    return {
      background: `linear-gradient(to right, ${stops})`,
    };
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Large Value Display with Animation */}
      <motion.div
        key={value}
        initial={{ scale: shouldReduceMotion ? 1 : 0.8, opacity: shouldReduceMotion ? 1 : 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
        }}
        className="text-center"
      >
        <div className="relative inline-flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full opacity-20"
            style={{ backgroundColor: currentConfig.color }}
            animate={
              !shouldReduceMotion
                ? {
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.1, 0.2],
                  }
                : {}
            }
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div
            className="relative w-32 h-32 rounded-full flex items-center justify-center border-4 shadow-lg"
            style={{ backgroundColor: `${currentConfig.color}10`, borderColor: currentConfig.color }}
          >
            <div className="text-center">
              <div className="text-5xl font-bold mb-1" style={{ color: currentConfig.color }}>
                {value}
              </div>
              <div className="text-2xl">{currentConfig.emoji}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <motion.div
            key={`label-${value}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2"
          >
            <Icon className="w-5 h-5" style={{ color: currentConfig.color }} />
            <span className="text-xl font-semibold text-gray-900">{currentConfig.label}</span>
          </motion.div>

          <Badge
            variant="outline"
            className="text-sm"
            style={{ borderColor: currentConfig.color, color: currentConfig.color }}
          >
            Nivel {value} de {max}
          </Badge>
        </div>
      </motion.div>

      {/* Enhanced Slider */}
      <div className="space-y-4 px-4">
        <div className="relative">
          {/* Gradient Track */}
          <div
            className="h-3 rounded-full transition-all"
            style={getGradientStyle()}
          >
            {/* Filled portion */}
            <motion.div
              className="h-full rounded-full relative"
              style={{
                width: `${((value - min) / (max - min)) * 100}%`,
                backgroundColor: currentConfig.color,
              }}
            >
              {/* Shine effect on filled portion */}
              {!shouldReduceMotion && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </motion.div>
          </div>

          {/* Custom Thumb */}
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Nivel de severidad"
          />

          {/* Visual Thumb */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full shadow-lg border-3 border-white flex items-center justify-center cursor-pointer"
            style={{
              left: `calc(${((value - min) / (max - min)) * 100}% - 16px)`,
              backgroundColor: currentConfig.color,
            }}
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <span className="text-white text-xs font-bold">{currentConfig.emoji}</span>
          </motion.div>
        </div>

        {/* Scale Labels */}
        <div className="flex justify-between text-xs text-gray-500 px-1">
          <span>Muy leve</span>
          <span>Moderado</span>
          <span>Muy severo</span>
        </div>

        {/* Quick Select Buttons */}
        <div className="grid grid-cols-5 gap-2 pt-2">
          {[1, 3, 5, 7, 10].map((level) => (
            <button
              key={level}
              onClick={() => onChange(level)}
              className={cn(
                'py-2 px-3 rounded-lg text-sm font-medium transition-all hover:shadow-md',
                value === level
                  ? 'shadow-lg transform scale-105'
                  : 'bg-gray-100 hover:bg-gray-200'
              )}
              style={{
                backgroundColor: value === level ? currentConfig.color : undefined,
                color: value === level ? 'white' : undefined,
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Descriptive Context */}
      <motion.div
        key={`description-${value}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-sm text-gray-600 bg-blue-50 rounded-lg p-3"
      >
        {getContextMessage(value)}
      </motion.div>
    </div>
  );
}

function getContextMessage(level: number): string {
  if (level <= 2) {
    return 'Puedes continuar con tus actividades normales sin problemas.';
  } else if (level <= 4) {
    return 'Notable pero manejable. Quizás necesites un descanso ocasional.';
  } else if (level <= 6) {
    return 'Interfiere con tus actividades diarias. Deberías considerar atención médica.';
  } else if (level <= 8) {
    return 'Dificulta realizar tareas básicas. Se recomienda atención médica pronto.';
  } else {
    return 'Incapacitante. Busca atención médica inmediatamente.';
  }
}
