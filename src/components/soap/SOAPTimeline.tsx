'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { SOAPPhaseStatus } from '@/types/soap';
import {
  MessageSquare,
  Activity,
  ClipboardCheck,
  Calendar,
  Check,
  Loader2,
} from 'lucide-react';

interface SOAPTimelineProps {
  phases: SOAPPhaseStatus[];
  currentPhase?: SOAPPhaseStatus['phase'];
  className?: string;
}

const phaseConfig = {
  subjective: {
    label: 'Subjetivo',
    description: 'Síntomas y antecedentes',
    icon: MessageSquare,
  },
  objective: {
    label: 'Objetivo',
    description: 'Datos clínicos y signos vitales',
    icon: Activity,
  },
  assessment: {
    label: 'Evaluación',
    description: 'Análisis multi-especialista',
    icon: ClipboardCheck,
  },
  plan: {
    label: 'Plan',
    description: 'Recomendaciones y seguimiento',
    icon: Calendar,
  },
} as const;

// Static Tailwind class mapping to avoid PurgeCSS issues with dynamic interpolation
const PHASE_COLORS: Record<SOAPPhaseStatus['phase'], {
  bg: string;
  bgLight: string;
  text: string;
  border: string;
  borderLight: string;
}> = {
  subjective: {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-200',
    text: 'text-blue-500',
    border: 'border-blue-500',
    borderLight: 'border-blue-300',
  },
  objective: {
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-200',
    text: 'text-purple-500',
    border: 'border-purple-500',
    borderLight: 'border-purple-300',
  },
  assessment: {
    bg: 'bg-orange-500',
    bgLight: 'bg-orange-200',
    text: 'text-orange-500',
    border: 'border-orange-500',
    borderLight: 'border-orange-300',
  },
  plan: {
    bg: 'bg-green-500',
    bgLight: 'bg-green-200',
    text: 'text-green-500',
    border: 'border-green-500',
    borderLight: 'border-green-300',
  },
};

export function SOAPTimeline({
  phases,
  currentPhase,
  className,
}: SOAPTimelineProps) {
  const shouldReduceMotion = useReducedMotion();

  // Get the index of the current phase
  const currentPhaseIndex = currentPhase
    ? phases.findIndex((p) => p.phase === currentPhase)
    : -1;

  return (
    <nav
      className={cn('w-full', className)}
      role="navigation"
      aria-label="Progreso de consulta SOAP"
    >
      <ol className="relative space-y-8 md:space-y-0 md:flex md:justify-between md:gap-4">
        {phases.map((phaseStatus, index) => {
          const config = phaseConfig[phaseStatus.phase];
          const Icon = config.icon;
          const isActive = phaseStatus.phase === currentPhase;
          const isCompleted = phaseStatus.status === 'completed';
          const isInProgress = phaseStatus.status === 'in-progress';

          return (
            <li
              key={phaseStatus.phase}
              className="relative flex-1"
              aria-current={isActive ? 'step' : undefined}
            >
              {/* Connector line (hidden on mobile, shown on desktop between items) */}
              {index < phases.length - 1 && (
                <div
                  className="absolute left-6 top-10 h-full w-0.5 bg-border md:left-auto md:top-6 md:h-0.5 md:w-full"
                  aria-hidden="true"
                >
                  <motion.div
                    className={cn(
                      'h-full w-full origin-top md:origin-left',
                      isCompleted
                        ? PHASE_COLORS[phaseStatus.phase].bg
                        : 'bg-transparent'
                    )}
                    initial={{ scaleY: 0, scaleX: 0 }}
                    animate={{
                      scaleY: isCompleted ? 1 : 0,
                      scaleX: isCompleted ? 1 : 0,
                    }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.5,
                      delay: shouldReduceMotion ? 0 : index * 0.1,
                    }}
                  />
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: shouldReduceMotion ? 0 : index * 0.1,
                }}
                className="relative flex items-start gap-4 md:flex-col md:items-center md:text-center"
              >
                {/* Phase Icon */}
                <div className="relative">
                  <motion.div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors',
                      isCompleted &&
                        `${PHASE_COLORS[phaseStatus.phase].border} ${PHASE_COLORS[phaseStatus.phase].bg}`,
                      isInProgress &&
                        `${PHASE_COLORS[phaseStatus.phase].borderLight} bg-background`,
                      !isCompleted &&
                        !isInProgress &&
                        'border-muted bg-muted/50'
                    )}
                    animate={{
                      scale: isActive && !shouldReduceMotion ? [1, 1.05, 1] : 1,
                    }}
                    transition={{
                      duration: 2,
                      repeat: isActive ? Infinity : 0,
                      ease: 'easeInOut',
                    }}
                  >
                    {isCompleted && (
                      <Check
                        className="h-6 w-6 text-white"
                        aria-label="Completado"
                      />
                    )}
                    {isInProgress && (
                      <motion.div
                        animate={{
                          rotate: shouldReduceMotion ? 0 : 360,
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      >
                        <Loader2
                          className={cn(
                            'h-6 w-6',
                            PHASE_COLORS[phaseStatus.phase].text
                          )}
                          aria-label="En progreso"
                        />
                      </motion.div>
                    )}
                    {!isCompleted && !isInProgress && (
                      <Icon
                        className="h-6 w-6 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                  </motion.div>

                  {/* Pulse animation for active phase */}
                  {isActive && !shouldReduceMotion && (
                    <motion.div
                      className={cn(
                        'absolute inset-0 rounded-full',
                        PHASE_COLORS[phaseStatus.phase].bgLight
                      )}
                      animate={{
                        scale: [1, 1.4],
                        opacity: [0.4, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Phase Content */}
                <div className="flex-1 pb-8 md:pb-0">
                  <h3
                    className={cn(
                      'text-sm font-semibold leading-tight transition-colors',
                      (isCompleted || isInProgress) && 'text-foreground',
                      !isCompleted && !isInProgress && 'text-muted-foreground'
                    )}
                  >
                    {config.label}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {config.description}
                  </p>

                  {/* Timestamp for completed phases */}
                  {phaseStatus.timestamp && (
                    <time
                      className="mt-2 block text-xs text-muted-foreground"
                      dateTime={phaseStatus.timestamp.toISOString()}
                    >
                      {new Intl.DateTimeFormat('es-MX', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(phaseStatus.timestamp)}
                    </time>
                  )}
                </div>
              </motion.div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
