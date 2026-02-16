'use client';

import {
  QuestionCard,
  QuestionTitle,
  QuestionDescription,
  QuestionCardNavigation,
} from '@/components/soap';
import type { ChiefComplaintStepProps } from '../types';
import { CHIEF_COMPLAINT_SUGGESTIONS } from '../types';

export function ChiefComplaintStep({
  value,
  onChange,
  onNext,
  onPrev,
}: ChiefComplaintStepProps) {
  return (
    <QuestionCard step={1} totalSteps={9}>
      <QuestionTitle>¿Cuál es tu motivo principal?</QuestionTitle>
      <QuestionDescription>
        Describe brevemente qué te molesta
      </QuestionDescription>

      <div className="space-y-4">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ej: Dolor de cabeza fuerte..."
          className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && value.trim() && onNext()}
        />

        <div>
          <p className="text-sm text-gray-500 mb-3 font-medium">Sugerencias:</p>
          <div className="flex flex-wrap gap-2">
            {CHIEF_COMPLAINT_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onChange(suggestion)}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors hover:shadow-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      <QuestionCardNavigation
        onPrev={onPrev}
        onNext={onNext}
        canNext={value.trim().length > 0}
      />
    </QuestionCard>
  );
}
