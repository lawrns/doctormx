'use client';

import {
  QuestionCard,
  QuestionTitle,
  QuestionDescription,
  QuestionCardNavigation,
  EnhancedSeveritySlider,
} from '@/components/soap';
import type { SeverityStepProps } from '../types';

export function SeverityStep({
  value,
  onChange,
  onNext,
  onPrev,
}: SeverityStepProps) {
  return (
    <QuestionCard step={5} totalSteps={9}>
      <QuestionTitle>¿Qué tan intenso es tu malestar?</QuestionTitle>
      <QuestionDescription>
        Del 1 (muy leve) al 10 (insoportable)
      </QuestionDescription>

      <EnhancedSeveritySlider
        value={value}
        onChange={onChange}
        min={1}
        max={10}
      />

      <QuestionCardNavigation
        onPrev={onPrev}
        onNext={onNext}
        canNext={true}
      />
    </QuestionCard>
  );
}
