'use client';

import {
  QuestionCard,
  QuestionTitle,
  QuestionDescription,
  QuestionCardNavigation,
} from '@/components/soap';
import type { HistoryStepProps } from '../types';

export function HistoryStep({
  value,
  onChange,
  onNext,
  onPrev,
  isSubmitting,
}: HistoryStepProps) {
  return (
    <QuestionCard step={9} totalSteps={9}>
      <QuestionTitle>Antecedentes médicos (opcional)</QuestionTitle>
      <QuestionDescription>
        Información que pueda ayudar al diagnóstico
      </QuestionDescription>

      <div className="space-y-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ej: Tengo hipertensión, tomo medicación para la tiroides, tuve apendicitis hace 5 años..."
          rows={5}
          className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
        />
      </div>

      <QuestionCardNavigation
        onPrev={onPrev}
        onNext={onNext}
        canNext={true}
        nextLabel="Iniciar Consulta"
        isSubmitting={isSubmitting}
      />

      <p className="text-center text-xs text-gray-500 mt-2">
        Los especialistas analizarán tu información en aproximadamente 60 segundos
      </p>
    </QuestionCard>
  );
}
