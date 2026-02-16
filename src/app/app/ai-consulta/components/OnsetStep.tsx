'use client';

import { Clock, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  QuestionCard,
  QuestionTitle,
  QuestionDescription,
  QuestionCardNavigation,
} from '@/components/soap';
import type { OnsetStepProps } from '../types';

export function OnsetStep({
  value,
  onChange,
  onNext,
  onPrev,
}: OnsetStepProps) {
  return (
    <QuestionCard step={6} totalSteps={9}>
      <QuestionTitle>¿Cómo empezaron tus síntomas?</QuestionTitle>
      <QuestionDescription>
        Esto ayuda a entender el posible origen
      </QuestionDescription>

      <div className="grid grid-cols-2 gap-4">
        <Card
          className={`p-6 cursor-pointer transition-all ${
            value === 'sudden'
              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 shadow-lg'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
          }`}
          onClick={() => onChange('sudden')}
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">De golpe</h4>
            <p className="text-sm text-gray-600">Empezó repentinamente</p>
          </div>
        </Card>

        <Card
          className={`p-6 cursor-pointer transition-all ${
            value === 'gradual'
              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 shadow-lg'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
          }`}
          onClick={() => onChange('gradual')}
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Poco a poco</h4>
            <p className="text-sm text-gray-600">Empezó gradualmente</p>
          </div>
        </Card>
      </div>

      <QuestionCardNavigation
        onPrev={onPrev}
        onNext={onNext}
        canNext={value !== null}
      />
    </QuestionCard>
  );
}
