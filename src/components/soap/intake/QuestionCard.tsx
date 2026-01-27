'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { useButtonState } from '@/hooks/useButtonState';

interface QuestionCardProps {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  step?: number;
  totalSteps?: number;
}

export function QuestionCard({
  children,
  className,
  icon,
  step,
  totalSteps,
}: QuestionCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.3,
        ease: 'easeInOut',
      }}
      className="w-full"
    >
      <Card className={cn('p-6 md:p-8 bg-white/95 backdrop-blur-sm border-blue-100 shadow-lg', className)}>
        {(step !== undefined || icon) && (
          <div className="flex items-center gap-4 mb-6">
            {icon && (
              <motion.div
                initial={{ scale: shouldReduceMotion ? 1 : 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: shouldReduceMotion ? 0 : 0.1,
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                }}
                className="flex-shrink-0"
              >
                {icon}
              </motion.div>
            )}
            {step !== undefined && totalSteps && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-600">
                  Paso {step} de {totalSteps}
                </span>
                <div className="flex-1 h-1 bg-blue-100 rounded-full overflow-hidden max-w-[100px]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / totalSteps) * 100}%` }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                  />
                </div>
              </div>
            )}
          </div>
        )}
        <div className="space-y-4">
          {children}
        </div>
      </Card>
    </motion.div>
  );
}

interface QuestionTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function QuestionTitle({ children, className }: QuestionTitleProps) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      className={cn('text-2xl md:text-3xl font-bold text-gray-900 mb-2', className)}
    >
      {children}
    </motion.h2>
  );
}

interface QuestionDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function QuestionDescription({ children, className }: QuestionDescriptionProps) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.3 }}
      className={cn('text-gray-600 text-base', className)}
    >
      {children}
    </motion.p>
  );
}

// ============================================================================
// ENHANCED COMPONENTS
// ============================================================================

interface QuestionCardActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function QuestionCardActions({ children, className }: QuestionCardActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      className={cn('flex items-center justify-between gap-4 mt-6', className)}
    >
      {children}
    </motion.div>
  );
}

interface QuestionCardNavigationProps {
  onPrev?: () => void;
  onNext: () => void;
  canNext: boolean;
  nextLabel?: string;
  prevLabel?: string;
  isSubmitting?: boolean;
  className?: string;
}

export function QuestionCardNavigation({
  onPrev,
  onNext,
  canNext,
  nextLabel = 'Continuar',
  prevLabel = 'Atrás',
  isSubmitting = false,
  className,
}: QuestionCardNavigationProps) {
  const nextButton = useButtonState(300); // 300ms debounce
  const prevButton = useButtonState(300);

  const handleNext = async () => {
    await nextButton.execute(async () => {
      onNext();
    });
  };

  const handlePrev = async () => {
    await prevButton.execute(async () => {
      onPrev?.();
    });
  };

  const isButtonLoading = nextButton.isLoading || prevButton.isLoading || isSubmitting;

  return (
    <div className={cn('flex gap-3 w-full', className)}>
      {onPrev && (
        <button
          type="button"
          onClick={handlePrev}
          disabled={prevButton.isLoading || isSubmitting}
          className={cn(
            'flex-1 px-6 py-3 rounded-xl font-semibold text-sm',
            'border-2 border-neutral-300 text-neutral-700',
            'hover:bg-neutral-50 hover:border-neutral-400',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2'
          )}
        >
          {prevButton.isLoading ? 'Cargando...' : prevLabel}
        </button>
      )}

      <button
        type="button"
        onClick={handleNext}
        disabled={!canNext || isButtonLoading}
        className={cn(
          'flex-1 px-6 py-3 rounded-xl font-semibold text-sm',
          'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
          'hover:from-blue-600 hover:to-blue-700',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'shadow-md hover:shadow-lg',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'disabled:hover:shadow-md'
        )}
      >
        {isButtonLoading ? (
          <span className="flex items-center justify-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              aria-hidden="true"
            >
              ⏳
            </motion.span>
            Procesando...
          </span>
        ) : (
          nextLabel
        )}
      </button>
    </div>
  );
}

interface QuestionCardInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export function QuestionCardInput({ error, label, className, ...props }: QuestionCardInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-3 rounded-xl border-2 transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          error && 'border-red-300 focus:ring-red-500',
          !error && 'border-neutral-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? 'input-error' : undefined}
        {...props}
      />
      {error && (
        <p id="input-error" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
