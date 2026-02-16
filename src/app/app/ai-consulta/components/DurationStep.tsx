'use client';

import {
  QuestionCard,
  QuestionTitle,
  QuestionDescription,
  QuestionCardNavigation,
} from '@/components/soap';
import type { DurationStepProps } from '../types';
import { DURATION_OPTIONS } from '../types';

export function DurationStep({
  value,
  onChange,
  onNext,
  onPrev,
}: DurationStepProps) {
  return (
    <QuestionCard step={3} totalSteps={9}>
      <QuestionTitle>¿Cuánto tiempo tienes con estos síntomas?</QuestionTitle>
      <QuestionDescription>
        Selecciona la opción que mejor describa tu situación
      </QuestionDescription>

      <div className="grid grid-cols-2 gap-3">
        {DURATION_OPTIONS.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              value === option
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <QuestionCardNavigation
        onPrev={onPrev}
        onNext={onNext}
        canNext={value.length > 0}
      />
    </QuestionCard>
  );
}
