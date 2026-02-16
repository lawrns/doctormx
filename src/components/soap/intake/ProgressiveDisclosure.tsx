'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ProgressiveDisclosureProps {
  children: React.ReactNode[];
  className?: string;
  onComplete?: () => void;
  questionsPerGroup?: number;
  showProgress?: boolean;
  progressLabels?: string[];
}

interface QuestionGroupProps {
  children: React.ReactNode;
  isCurrent: boolean;
  direction: number;
}

export function ProgressiveDisclosure({
  children,
  className,
  onComplete,
  questionsPerGroup = 3,
  showProgress = true,
  progressLabels,
}: ProgressiveDisclosureProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(0);

  // Group children into chunks
  const groups = React.useMemo(() => {
    const result: React.ReactNode[][] = [];
    for (let i = 0; i < children.length; i += questionsPerGroup) {
      result.push(children.slice(i, i + questionsPerGroup));
    }
    return result;
  }, [children, questionsPerGroup]);

  const currentGroup = groups[currentIndex];
  const isLastGroup = currentIndex === groups.length - 1;
  const isFirstGroup = currentIndex === 0;

  const handleNext = () => {
    if (isLastGroup) {
      onComplete?.();
    } else {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstGroup) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress Indicator */}
      {showProgress && groups.length > 1 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Grupo {currentIndex + 1} de {groups.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentIndex + 1) / groups.length) * 100)}% completado
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentIndex + 1) / groups.length) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>

          {/* Step Labels */}
          {progressLabels && (
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              {progressLabels.map((label, index) => (
                <span
                  key={index}
                  className={cn(
                    'flex-1 text-center',
                    index === currentIndex && 'text-blue-600 font-semibold'
                  )}
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Question Groups */}
      <div className="relative overflow-hidden">
        <AnimatePresence
          mode="wait"
          custom={direction}
          onExitComplete={() => setDirection(0)}
        >
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 },
            }}
            className="space-y-6"
          >
            {currentGroup}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      {groups.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3 pt-4"
        >
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={isFirstGroup}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Anterior
          </Button>

          <Button
            onClick={handleNext}
            className={cn(
              'flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
              isLastGroup && 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
            )}
          >
            {isLastGroup ? (
              <>Finalizar</>
            ) : (
              <>
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </motion.div>
      )}

      {/* Group Info */}
      {!isLastGroup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-500 pt-2"
        >
          Pregunta {currentIndex * questionsPerGroup + 1} de{' '}
          {children.length}
        </motion.div>
      )}
    </div>
  );
}

// Individual question wrapper with animations
export function Question({
  children,
  isCurrent,
  direction,
}: QuestionGroupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        delay: isCurrent ? 0 : 0.1,
      }}
      className="space-y-4"
    >
      {children}
    </motion.div>
  );
}

// Hook to auto-group form steps
export function useProgressiveGrouping<T>(
  items: T[],
  itemsPerGroup: number = 3
): { groups: T[][]; totalGroups: number } {
  return React.useMemo(() => {
    const groups: T[][] = [];
    for (let i = 0; i < items.length; i += itemsPerGroup) {
      groups.push(items.slice(i, i + itemsPerGroup));
    }
    return { groups, totalGroups: groups.length };
  }, [items, itemsPerGroup]);
}
