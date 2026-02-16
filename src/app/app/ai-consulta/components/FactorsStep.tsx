'use client';

import {
  QuestionCard,
  QuestionTitle,
  QuestionDescription,
  QuestionCardNavigation,
} from '@/components/soap';
import type { FactorsStepProps } from '../types';

export function FactorsStep({
  aggravating,
  relieving,
  onAggravatingChange,
  onRelievingChange,
  onNext,
  onPrev,
}: FactorsStepProps) {
  return (
    <QuestionCard step={8} totalSteps={9}>
      <QuestionTitle>¿Qué afecta tus síntomas?</QuestionTitle>
      <QuestionDescription>
        Esto ayuda a los especialistas a entenderte mejor
      </QuestionDescription>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ¿Qué lo empeora? (opcional)
          </label>
          <input
            type="text"
            value={aggravating}
            onChange={(e) => onAggravatingChange(e.target.value)}
            placeholder="Ej: movimiento, comida, estrés..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ¿Qué lo alivia? (opcional)
          </label>
          <input
            type="text"
            value={relieving}
            onChange={(e) => onRelievingChange(e.target.value)}
            placeholder="Ej: descanso, medicamentos, comida..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <QuestionCardNavigation
        onPrev={onPrev}
        onNext={onNext}
        canNext={true}
      />
    </QuestionCard>
  );
}
