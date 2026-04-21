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

export function SOAPTimeline({
  phases,
  currentPhase,
  className,
}: SOAPTimelineProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <nav
      className={cn('w-full', className)}
      role="navigation"
      aria-label="Progreso de consulta SOAP"
    >
      {/* Desktop: Horizontal timeline with connected lines */}
      <ol className="hidden md:flex md:items-start md:justify-between">
        {phases.map((phaseStatus, index) => {
          const config = phaseConfig[phaseStatus.phase];
          const Icon = config.icon;
          const isActive = phaseStatus.phase === currentPhase;
          const isCompleted = phaseStatus.status === 'completed';
          const isInProgress = phaseStatus.status === 'in-progress';
          const isLast = index === phases.length - 1;

          return (
            <li
              key={phaseStatus.phase}
              className="relative flex flex-1 flex-col items-center"
              aria-current={isActive ? 'step' : undefined}
            >
              {/* Connector line to next step */}
              {!isLast && (
                <div
                  className="absolute left-[calc(50%+24px)] right-[calc(-50%+24px)] top-6 h-0.5 bg-muted"
                  aria-hidden="true"
                >
                  <motion.div
                    className={cn(
                      'h-full w-full origin-left',
                      isCompleted ? 'bg-primary-500' : 'bg-transparent'
                    )}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isCompleted ? 1 : 0 }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.4,
                      delay: shouldReduceMotion ? 0 : 0.2,
                    }}
                  />
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: shouldReduceMotion ? 0 : index * 0.1,
                }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                {/* Phase Icon Circle */}
                <div className="relative">
                  <motion.div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300',
                      isCompleted && 'border-primary-500 bg-primary-500',
                      isInProgress && 'border-accent-500 bg-accent-50',
                      !isCompleted && !isInProgress && 'border-border bg-secondary/50'
                    )}
                    animate={{
                      scale: isInProgress && !shouldReduceMotion ? [1, 1.05, 1] : 1,
                    }}
                    transition={{
                      duration: 2,
                      repeat: isInProgress ? Infinity : 0,
                      ease: 'easeInOut',
                    }}
                  >
                    {isCompleted && (
                      <Check className="h-6 w-6 text-white" aria-label="Completado" />
                    )}
                    {isInProgress && (
                      <motion.div
                        animate={{ rotate: shouldReduceMotion ? 0 : 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      >
                        <Loader2 className="h-6 w-6 text-accent-600" aria-label="En progreso" />
                      </motion.div>
                    )}
                    {!isCompleted && !isInProgress && (
                      <Icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                    )}
                  </motion.div>

                  {/* Pulse animation for in-progress phase */}
                  {isInProgress && !shouldReduceMotion && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-accent-200"
                      animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Phase Label & Description */}
                <div className="mt-3">
                  <h3
                    className={cn(
                      'text-sm font-semibold transition-colors',
                      isCompleted && 'text-primary-700',
                      isInProgress && 'text-accent-700',
                      !isCompleted && !isInProgress && 'text-muted-foreground'
                    )}
                  >
                    {config.label}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground max-w-[120px]">
                    {config.description}
                  </p>

                  {/* Timestamp */}
                  {phaseStatus.timestamp && (
                    <time
                      className="mt-1 block text-xs text-muted-foreground"
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

      {/* Mobile: Vertical timeline */}
      <ol className="md:hidden space-y-6">
        {phases.map((phaseStatus, index) => {
          const config = phaseConfig[phaseStatus.phase];
          const Icon = config.icon;
          const isActive = phaseStatus.phase === currentPhase;
          const isCompleted = phaseStatus.status === 'completed';
          const isInProgress = phaseStatus.status === 'in-progress';
          const isLast = index === phases.length - 1;

          return (
            <li
              key={phaseStatus.phase}
              className="relative flex gap-4"
              aria-current={isActive ? 'step' : undefined}
            >
              {/* Vertical connector line */}
              {!isLast && (
                <div
                  className="absolute left-6 top-12 bottom-0 w-0.5 -translate-x-1/2 bg-muted"
                  aria-hidden="true"
                >
                  <motion.div
                    className={cn(
                      'h-full w-full origin-top',
                      isCompleted ? 'bg-primary-500' : 'bg-transparent'
                    )}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: isCompleted ? 1 : 0 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
                  />
                </div>
              )}

              {/* Phase Icon */}
              <div className="relative z-10 flex-shrink-0">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all',
                    isCompleted && 'border-primary-500 bg-primary-500',
                    isInProgress && 'border-accent-500 bg-accent-50',
                    !isCompleted && !isInProgress && 'border-border bg-secondary/50'
                  )}
                >
                  {isCompleted && <Check className="h-6 w-6 text-white" />}
                  {isInProgress && <Loader2 className="h-6 w-6 text-accent-600 animate-spin" />}
                  {!isCompleted && !isInProgress && (
                    <Icon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Phase Content */}
              <div className="flex-1 pt-1">
                <h3
                  className={cn(
                    'text-sm font-semibold',
                    isCompleted && 'text-primary-700',
                    isInProgress && 'text-accent-700',
                    !isCompleted && !isInProgress && 'text-muted-foreground'
                  )}
                >
                  {config.label}
                </h3>
                <p className="text-xs text-muted-foreground">{config.description}</p>
                {phaseStatus.timestamp && (
                  <time className="mt-1 block text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat('es-MX', {
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(phaseStatus.timestamp)}
                  </time>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
