'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface ProgressStep {
  id: string;
  label: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
}

interface ProgressStepperProps {
  steps: ProgressStep[];
  currentStepId?: string;
  className?: string;
  showLabels?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ProgressStepper({
  steps,
  currentStepId,
  className,
  showLabels = true,
  orientation = 'horizontal',
}: ProgressStepperProps) {
  const shouldReduceMotion = useReducedMotion();

  const currentIndex = steps.findIndex((s) => s.id === currentStepId);

  return (
    <nav
      className={cn(
        'w-full',
        orientation === 'horizontal' ? 'flex items-center justify-between' : 'space-y-4',
        className
      )}
      role="navigation"
      aria-label="Progress indicator"
    >
      {steps.map((step, index) => {
        const isCompleted = step.status === 'completed';
        const isCurrent = step.id === currentStepId;
        const isPending = step.status === 'pending';

        const ariaAttributes = {
          'aria-current': isCurrent ? ('step' as const) : undefined,
          'aria-label': step.label,
          'aria-describedby': isCompleted ? `step-${step.id}-complete` : undefined,
        };

        return (
          <React.Fragment key={step.id}>
            {/* Step */}
            <div
              className={cn(
                'relative flex',
                orientation === 'horizontal' ? 'flex-col items-center' : 'items-start gap-3'
              )}
              {...ariaAttributes}
            >
              {/* Connector Line (not for last step) */}
              {orientation === 'horizontal' && index < steps.length - 1 && (
                <div
                  className="absolute left-[calc(50%+24px)] right-[calc(-50%+12px)] top-6 h-0.5 bg-muted"
                  aria-hidden="true"
                >
                  <motion.div
                    className={cn(
                      'h-full w-full origin-left rounded-full',
                      isCompleted ? 'bg-primary-500' : 'bg-transparent'
                    )}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isCompleted ? 1 : 0 }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.4,
                      delay: shouldReduceMotion ? 0 : 0.1,
                      ease: 'easeInOut',
                    }}
                  />
                </div>
              )}

              {/* Vertical connector */}
              {orientation === 'vertical' && index < steps.length - 1 && (
                <div className="absolute left-6 top-12 bottom-[-16px] w-0.5 -translate-x-1/2 bg-muted">
                  <motion.div
                    className={cn(
                      'h-full w-full origin-top rounded-full',
                      isCompleted ? 'bg-primary-500' : 'bg-transparent'
                    )}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: isCompleted ? 1 : 0 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
                  />
                </div>
              )}

              {/* Step Circle */}
              <motion.div
                initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.3,
                  delay: shouldReduceMotion ? 0 : index * 0.05,
                }}
                className="relative"
              >
                {/* Pulse animation for current step */}
                {isCurrent && !shouldReduceMotion && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary-200"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    aria-hidden="true"
                  />
                )}

                {/* Main circle */}
                <div
                  className={cn(
                    'relative z-10 flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-all duration-300',
                    isCompleted && 'border-primary-500 bg-primary-500 shadow-lg shadow-primary-500/30',
                    isCurrent && 'border-primary-500 bg-primary-50 shadow-md',
                    isPending && 'border-border bg-secondary/50'
                  )}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 15,
                      }}
                    >
                      <Check className="h-6 w-6 text-white" aria-hidden="true" />
                    </motion.div>
                  ) : (
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        isCurrent && 'text-primary-700',
                        isPending && 'text-muted-foreground'
                      )}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Screen reader status announcement */}
                {isCompleted && (
                  <span id={`step-${step.id}-complete`} className="sr-only">
                    {step.label} completed
                  </span>
                )}
              </motion.div>

              {/* Labels */}
              {showLabels && orientation === 'horizontal' && (
                <div className="mt-3 text-center">
                  <p
                    className={cn(
                      'text-sm font-semibold transition-colors',
                      isCompleted && 'text-primary-700',
                      isCurrent && 'text-primary-600',
                      isPending && 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground max-w-[100px]">
                      {step.description}
                    </p>
                  )}
                </div>
              )}

              {showLabels && orientation === 'vertical' && (
                <div className="flex-1 pt-1">
                  <p
                    className={cn(
                      'text-sm font-semibold transition-colors',
                      isCompleted && 'text-primary-700',
                      isCurrent && 'text-primary-600',
                      isPending && 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
                  )}
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to derive progress steps from consultation data
 */
export function useProgressSteps(currentStep: string): ProgressStep[] {
  const steps: ProgressStep[] = [
    { id: 'welcome', label: 'Bienvenida', status: 'pending' },
    { id: 'symptoms', label: 'Síntomas', status: 'pending' },
    { id: 'details', label: 'Detalles', status: 'pending' },
    { id: 'history', label: 'Historial', status: 'pending' },
    { id: 'consultation', label: 'Consulta', status: 'pending' },
  ];

  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  // Update statuses based on current step
  steps.forEach((step, index) => {
    if (index < currentIndex) {
      step.status = 'completed';
    } else if (index === currentIndex) {
      step.status = 'in-progress';
    }
  });

  return steps;
}
