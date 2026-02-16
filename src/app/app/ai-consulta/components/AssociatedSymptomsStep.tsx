'use client';

import {
  QuestionCard,
  QuestionTitle,
  QuestionDescription,
  QuestionCardNavigation,
  SymptomAutocomplete,
} from '@/components/soap';
import type { AssociatedSymptomsStepProps } from '../types';
import { ASSOCIATED_SYMPTOM_SUGGESTIONS } from '../types';

export function AssociatedSymptomsStep({
  value,
  onChange,
  onNext,
  onPrev,
}: AssociatedSymptomsStepProps) {
  return (
    <QuestionCard step={7} totalSteps={9}>
      <QuestionTitle>¿Tienes otros síntomas?</QuestionTitle>
      <QuestionDescription>
        Selecciona los que apliquen (opcional)
      </QuestionDescription>

      <SymptomAutocomplete
        value={value}
        onChange={onChange}
        placeholder="Escribe o selecciona síntomas adicionales..."
        suggestions={ASSOCIATED_SYMPTOM_SUGGESTIONS}
      />

      <QuestionCardNavigation
        onPrev={onPrev}
        onNext={onNext}
        canNext={true}
      />
    </QuestionCard>
  );
}
