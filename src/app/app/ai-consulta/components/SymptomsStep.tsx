'use client';

import {
  QuestionCard,
  QuestionTitle,
  QuestionDescription,
  QuestionCardNavigation,
} from '@/components/soap';
import type { SymptomsStepProps } from '../types';

export function SymptomsStep({
  value,
  onChange,
  onNext,
  onPrev,
}: SymptomsStepProps) {
  return (
    <QuestionCard step={2} totalSteps={9}>
      <QuestionTitle>Cuéntame más sobre tus síntomas</QuestionTitle>
      <QuestionDescription>
        Describe con detalle lo que sientes
      </QuestionDescription>

      <div className="space-y-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe tus síntomas en detalle: ubicación, intensidad, tipo de dolor o molestia, qué sientes exactamente..."
          rows={6}
          className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
        />
        <p className="text-sm text-gray-500">
          {value.length} caracteres (mínimo 10)
        </p>
      </div>

      <QuestionCardNavigation
        onPrev={onPrev}
        onNext={onNext}
        canNext={value.trim().length >= 10}
      />
    </QuestionCard>
  );
}
