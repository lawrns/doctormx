'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, Activity } from 'lucide-react';
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
  { level: 1, label: 'Muy leve', color: '#16a34a', icon: Activity },
  { level: 2, label: 'Leve', color: '#22c55e', icon: Activity },
  { level: 3, label: 'Leve a moderado', color: '#84cc16', icon: Activity },
  { level: 4, label: 'Moderado', color: '#eab308', icon: Activity },
  { level: 5, label: 'Moderado', color: '#f59e0b', icon: Activity },
  { level: 6, label: 'Intenso', color: '#f97316', icon: Activity },
  { level: 7, label: 'Intenso', color: '#ea580c', icon: Activity },
  { level: 8, label: 'Muy intenso', color: '#ef4444', icon: AlertTriangle },
  { level: 9, label: 'Severo', color: '#dc2626', icon: AlertTriangle },
  { level: 10, label: 'Insoportable', color: '#b91c1c', icon: AlertTriangle },
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
      <motion.div
        key={value}
        initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
        }}
        className="rounded-xl border border-border bg-card p-4"
      >
        <div className="flex items-center justify-between gap-4">
          <motion.div
            key={`label-${value}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <Icon className="w-5 h-5" style={{ color: currentConfig.color }} />
            <span className="text-base font-semibold text-foreground">{currentConfig.label}</span>
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
          <div
            className="h-3 rounded-full transition-all"
            style={getGradientStyle()}
          >
            <motion.div
              className="h-full rounded-full relative"
              style={{
                width: `${((value - min) / (max - min)) * 100}%`,
                backgroundColor: currentConfig.color,
              }}
            >
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
            className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full shadow-sm border-2 border-card flex items-center justify-center cursor-pointer"
            style={{
              left: `calc(${((value - min) / (max - min)) * 100}% - 16px)`,
              backgroundColor: currentConfig.color,
            }}
          >
            <span className="text-primary-foreground text-xs font-bold">{value}</span>
          </motion.div>
        </div>

        {/* Scale Labels */}
        <div className="flex justify-between text-xs text-muted-foreground px-1">
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
                  ? 'shadow-sm transform scale-[1.02]'
                  : 'bg-secondary hover:bg-muted'
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
        className="text-center text-sm text-muted-foreground bg-secondary rounded-lg p-3"
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
