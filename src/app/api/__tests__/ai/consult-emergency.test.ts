/**
 * Emergency AI Triage Tests
 *
 * Critical safety tests for emergency symptom detection in Doctor.mx
 *
 * Requirements:
 * - Patient safety depends on correct emergency detection
 * - Missing an emergency symptom = potential patient death
 * - False negatives are unacceptable
 * - Response time must be < 2 minutes for emergency routing
 */

import { describe, it, expect, vi } from 'vitest';
import { evaluateRedFlags } from '@/lib/triage';

describe('Emergency AI Triage - Core Detection', () => {
  const emergencySymptomsEnglish = [
    'chest pain',
    'difficulty breathing',
    'severe bleeding',
    'loss of consciousness',
    'slurred speech',
    'sudden severe headache',
  ];

  const emergencySymptomsSpanish = [
    'dolor de pecho',
    'dificultad para respirar',
    'sangrado abundante',
    'perdida de conciencia',
    'hablar torcido',
    'dolor de cabeza severo',
  ];

  // Test core emergency detection using the triage library directly
  describe('Emergency Symptom Detection (via triage library)', () => {
    it('should detect "dolor de pecho" as emergency', () => {
      const result = evaluateRedFlags({ message: 'dolor de pecho' });
      expect(result.triggered).toBe(true);
      expect(result.action).toBe('ER');
    });

    it('should detect "no puedo respirar" as emergency', () => {
      const result = evaluateRedFlags({ message: 'no puedo respirar' });
      expect(result.triggered).toBe(true);
      expect(result.action).toBe('ER');
    });

    it('should detect "hemorragia" as emergency', () => {
      const result = evaluateRedFlags({ message: 'hemorragia' });
      expect(result.triggered).toBe(true);
      expect(result.action).toBe('ER');
    });

    it('should detect "inconsciente" as emergency', () => {
      const result = evaluateRedFlags({ message: 'inconsciente' });
      expect(result.triggered).toBe(true);
      expect(result.action).toBe('ER');
    });

    it('should detect "no puedo hablar" as emergency', () => {
      const result = evaluateRedFlags({ message: 'no puedo hablar' });
      expect(result.triggered).toBe(true);
      expect(result.action).toBe('ER');
    });

    it('should detect "derrame" as emergency', () => {
      const result = evaluateRedFlags({ message: 'derrame' });
      expect(result.triggered).toBe(true);
      expect(result.action).toBe('ER');
    });
  });

  describe('Non-Emergency Cases', () => {
    const nonEmergencySymptoms = [
      'headache',
      'stomach ache',
      'fever',
      'cough',
      'runny nose',
    ];

    nonEmergencySymptoms.forEach((symptom) => {
      it(`should not flag "${symptom}" as emergency`, () => {
        const result = evaluateRedFlags({ message: symptom });
        expect(result.triggered).toBe(false);
        expect(result.action).not.toBe('ER');
      });
    });
  });

  describe('Case Sensitivity', () => {
    it('should be case-insensitive for emergency detection', () => {
      const result = evaluateRedFlags({ message: 'DOLOR DE PECHO' });
      expect(result.triggered).toBe(true);
      expect(result.action).toBe('ER');
    });
  });

  describe('Edge Cases', () => {
    it('should detect emergency in context of other symptoms', () => {
      const result = evaluateRedFlags({ message: 'I have a headache but also chest pain' });
      expect(result.triggered).toBe(true);
      expect(result.action).toBe('ER');
    });

    it('should detect emergency with multiple Spanish symptoms', () => {
      const result = evaluateRedFlags({ message: 'dolor de pecho y dificultad para respirar' });
      expect(result.triggered).toBe(true);
      expect(result.action).toBe('ER');
    });
  });

  describe('Response Time Performance', () => {
    it('should detect emergencies quickly (< 10ms average)', () => {
      const startTime = Date.now();

      // Run detection multiple times
      for (let i = 0; i < 100; i++) {
        evaluateRedFlags({ message: 'dolor de pecho' });
      }

      const totalTime = Date.now() - startTime;
      const avgTime = totalTime / 100;

      console.log(`Average detection time: ${avgTime}ms`);
      expect(avgTime).toBeLessThan(10);
    });
  });

  describe('Emergency Routing Logic', () => {
    it('should return ER action for severe chest pain', () => {
      const result = evaluateRedFlags({ message: 'dolor de pecho severo' });
      expect(result.action).toBe('ER');
    });

    it('should return URGENT action for high fever', () => {
      const result = evaluateRedFlags({ message: 'fiebre alta' });
      expect(result.action).toBe('URGENT');
    });
  });
});
