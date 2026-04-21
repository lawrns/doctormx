/**
 * SOAP Intake Components - Usage Examples
 *
 * This file demonstrates how to use all the Phase 1 UI components
 * together in a real consultation flow.
 */

'use client';

import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ProgressStepper,
  useProgressSteps,
  QuestionCard,
  QuestionTitle,
  QuestionDescription,
  QuestionCardNavigation,
  EnhancedSeveritySlider,
  SymptomAutocomplete,
  ConversationalWelcome,
} from '@/components/soap/intake';
import { Activity, Heart, Clock, AlertCircle } from 'lucide-react';

// ============================================================================
// EXAMPLE 1: Complete Intake Flow
// ============================================================================

export function CompleteIntakeExample() {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [formData, setFormData] = useState({
    symptom: '',
    severity: 5,
    duration: '',
  });

  const progressSteps = useProgressSteps(currentStep);

  // Common symptoms for autocomplete
  const commonSymptoms = [
    'Dolor de cabeza',
    'Dolor abdominal',
    'Dolor en el pecho',
    'Fiebre',
    'Náuseas',
    'Dolor de espalda',
    'Tos',
    'Fatiga',
  ];

  const nextStep = () => {
    const steps = ['welcome', 'symptom', 'severity', 'duration', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps = ['welcome', 'symptom', 'severity', 'duration', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Progress Stepper */}
        {currentStep !== 'welcome' && currentStep !== 'complete' && (
          <div className="mb-8">
            <ProgressStepper steps={progressSteps} currentStepId={currentStep} />
          </div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 'welcome' && (
            <ConversationalWelcome
              key="welcome"
              onStart={nextStep}
              userName="María"
            />
          )}

          {currentStep === 'symptom' && (
            <QuestionCard
              key="symptom"
              step={1}
              totalSteps={4}
              icon={
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
              }
            >
              <QuestionTitle>¿Qué síntoma tienes?</QuestionTitle>
              <QuestionDescription>
                Describe el principal motivo de tu consulta
              </QuestionDescription>

              <SymptomAutocomplete
                value={formData.symptom}
                onChange={(value) => setFormData({ ...formData, symptom: value })}
                suggestions={commonSymptoms}
                placeholder="Escribe tu síntoma..."
              />

              <QuestionCardNavigation
                onPrev={prevStep}
                onNext={nextStep}
                canNext={formData.symptom.length > 0}
              />
            </QuestionCard>
          )}

          {currentStep === 'severity' && (
            <QuestionCard
              key="severity"
              step={2}
              totalSteps={4}
              icon={
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              }
            >
              <QuestionTitle>¿Qué tan intenso es?</QuestionTitle>
              <QuestionDescription>
                Usa el slider para indicar la severidad
              </QuestionDescription>

              <EnhancedSeveritySlider
                value={formData.severity}
                onChange={(value) => setFormData({ ...formData, severity: value })}
              />

              <QuestionCardNavigation
                onPrev={prevStep}
                onNext={nextStep}
                canNext={true}
              />
            </QuestionCard>
          )}

          {currentStep === 'duration' && (
            <QuestionCard
              key="duration"
              step={3}
              totalSteps={4}
              icon={
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              }
            >
              <QuestionTitle>¿Cuánto tiempo lleva?</QuestionTitle>
              <QuestionDescription>
                Selecciona cuánto tiempo has tenido este síntoma
              </QuestionDescription>

              <div className="grid grid-cols-2 gap-3">
                {['Menos de 1 hora', 'Hoy', '1-2 días', '3-7 días', '1-2 semanas', 'Más de 2 semanas'].map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() => setFormData({ ...formData, duration: option })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.duration === option
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-border'
                      }`}
                    >
                      {option}
                    </button>
                  )
                )}
              </div>

              <QuestionCardNavigation
                onPrev={prevStep}
                onNext={nextStep}
                canNext={formData.duration.length > 0}
              />
            </QuestionCard>
          )}

          {currentStep === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 p-8 bg-card rounded-2xl shadow-lg"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Activity className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  ¡Información completada!
                </h2>
                <p className="text-muted-foreground">
                  Tu consulta está lista para ser analizada por los especialistas
                </p>
              </div>

              <div className="bg-primary/10 rounded-xl p-6 text-left">
                <h3 className="font-semibold text-foreground mb-4">Resumen:</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Síntoma:</strong> {formData.symptom}</p>
                  <p><strong>Severidad:</strong> {formData.severity}/10</p>
                  <p><strong>Duración:</strong> {formData.duration}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setCurrentStep('welcome');
                  setFormData({ symptom: '', severity: 5, duration: '' });
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
              >
                Iniciar nueva consulta
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Individual Component Demos
// ============================================================================

/**
 * ProgressStepper Example
 */
export function ProgressStepperExample() {
  const [currentStep, setCurrentStep] = useState('symptoms');

  const steps = [
    { id: 'welcome', label: 'Bienvenida', status: 'completed' as const },
    { id: 'symptoms', label: 'Síntomas', status: 'in-progress' as const },
    { id: 'details', label: 'Detalles', status: 'pending' as const },
    { id: 'history', label: 'Historial', status: 'pending' as const },
  ];

  return (
    <div className="p-8">
      <ProgressStepper steps={steps} currentStepId={currentStep} />
    </div>
  );
}

/**
 * EnhancedSeveritySlider Example
 */
export function SeveritySliderExample() {
  const [severity, setSeverity] = useState(5);

  return (
    <div className="p-8 max-w-md">
      <EnhancedSeveritySlider
        value={severity}
        onChange={setSeverity}
      />
    </div>
  );
}

/**
 * SymptomAutocomplete Example
 */
export function SymptomAutocompleteExample() {
  const [symptom, setSymptom] = useState('');

  const commonSymptoms = [
    'Dolor de cabeza',
    'Dolor abdominal',
    'Fiebre',
    'Náuseas',
  ];

  return (
    <div className="p-8 max-w-md">
      <SymptomAutocomplete
        value={symptom}
        onChange={setSymptom}
        suggestions={commonSymptoms}
        placeholder="Busca tu síntoma..."
      />
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Accessibility Features
// ============================================================================

export function AccessibilityExample() {
  return (
    <div className="p-8 space-y-8">
      {/* All components include:
          - ARIA labels for screen readers
          - Keyboard navigation support
          - Focus indicators
          - Reduced motion support
          - High contrast mode support
          - Screen reader announcements
      */}

      <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
        <h3 className="font-bold text-primary mb-2">Accessibility Features</h3>
        <ul className="text-sm text-primary space-y-1">
          <li>✓ Full keyboard navigation (Tab, Enter, Arrow keys)</li>
          <li>✓ ARIA labels and live regions</li>
          <li>✓ Focus-visible indicators</li>
          <li>✓ Respects prefers-reduced-motion</li>
          <li>✓ High contrast mode support</li>
          <li>✓ Screen reader optimized</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// DESIGN SPECIFICATIONS
// ============================================================================

/**
 * Design System Constants used across all components:
 *
 * Colors:
 * - Primary: blue-500 to blue-600 (#3b82f6 → #2563eb)
 * - Success: green-500 (#22c55e)
 * - Warning: yellow-500 (#eab308)
 * - Error: red-500 (#ef4444)
 *
 * Border Radius:
 * - Cards: 12px (rounded-xl)
 * - Buttons: 12px (rounded-xl)
 * - Inputs: 12px (rounded-xl)
 *
 * Spacing: 4px grid system (multiples of 4)
 *
 * Shadows:
 * - Cards: shadow-sm
 * - Hover: shadow-md
 * - Focus: shadow-lg shadow-primary-500/10
 *
 * Animation Duration:
 * - Fast: 150ms (hover states)
 * - Normal: 200-300ms (transitions)
 * - Slow: 400ms (page transitions)
 *
 * Typography:
 * - Font: Plus Jakarta Sans
 * - H1: text-3xl font-bold
 * - H2: text-2xl font-bold
 * - H3: text-xl font-semibold
 * - Body: text-base
 * - Small: text-sm
 */
