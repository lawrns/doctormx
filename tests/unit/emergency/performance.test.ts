/**
 * Performance Test Suite for Emergency Detection
 *
 * Validates that emergency detection meets strict performance requirements:
 * - p99 latency < 100ms
 * - p95 latency < 50ms
 * - p50 latency < 10ms
 * - Memory efficiency
 * - No performance degradation with patient context
 *
 * Performance is critical for emergency detection as any delay
 * could impact patient outcomes.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { evaluateRedFlags } from '@/lib/triage';
import { detectRedFlagsEnhanced } from '@/lib/ai/red-flags-enhanced';

interface PerformanceMetrics {
  min: number;
  max: number;
  mean: number;
  p50: number;
  p95: number;
  p99: number;
  p999: number;
}

/**
 * Calculate percentile from sorted array
 */
function percentile(arr: number[], p: number): number {
  const index = Math.ceil((p / 100) * arr.length) - 1;
  return arr[index];
}

/**
 * Calculate performance metrics from timing array
 */
function calculateMetrics(timings: number[]): PerformanceMetrics {
  const sorted = [...timings].sort((a, b) => a - b);
  const sum = timings.reduce((a, b) => a + b, 0);

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: sum / timings.length,
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
    p999: percentile(sorted, 99.9),
  };
}

describe('Performance Tests - Emergency Detection', () => {

  const WARMUP_ITERATIONS = 10;
  const TEST_ITERATIONS = 100;
  const STRESS_ITERATIONS = 1000;

  // ============================================================================
  // BASIC PERFORMANCE - evaluateRedFlags
  // ============================================================================
  describe('evaluateRedFlags Performance', () => {
    const testCases = [
      'Tengo dolor de pecho',
      'No puedo respirar',
      'Quiero morir',
      'Dolor de cabeza leve',
      '¿Cuáles son sus horarios?',
    ];

    it('should complete simple detection in < 10ms (p50)', () => {
      const timings: number[] = [];

      // Warmup
      for (let i = 0; i < WARMUP_ITERATIONS; i++) {
        testCases.forEach(c => evaluateRedFlags({ message: c }));
      }

      // Actual measurement
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        const testCase = testCases[i % testCases.length];
        const start = performance.now();
        evaluateRedFlags({ message: testCase });
        const end = performance.now();
        timings.push(end - start);
      }

      const metrics = calculateMetrics(timings);

      expect(metrics.p50).toBeLessThan(10);
      expect(metrics.p95).toBeLessThan(25);
      expect(metrics.p99).toBeLessThan(50);
    });

    it('should handle complex messages in < 50ms (p95)', () => {
      const complexMessage = 'Tengo dolor de pecho opresivo que se irradia al brazo izquierdo, ' +
        'dificultad para respirar, sudor frío y náuseas, siento que me voy a morir';

      const timings: number[] = [];

      // Warmup
      for (let i = 0; i < WARMUP_ITERATIONS; i++) {
        evaluateRedFlags({ message: complexMessage });
      }

      // Actual measurement
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        const start = performance.now();
        evaluateRedFlags({ message: complexMessage });
        const end = performance.now();
        timings.push(end - start);
      }

      const metrics = calculateMetrics(timings);

      expect(metrics.p50).toBeLessThan(15);
      expect(metrics.p95).toBeLessThan(35);
      expect(metrics.p99).toBeLessThan(75);
    });

    it('should handle messages with intake data efficiently', () => {
      const timings: number[] = [];

      // Warmup
      for (let i = 0; i < WARMUP_ITERATIONS; i++) {
        evaluateRedFlags({
          message: 'Dolor de pecho',
          intake: {
            isPregnant: true,
            vitals: { spo2: 92, heartRate: 110, bloodPressure: { systolic: 140, diastolic: 90 } },
            symptoms: ['dolor de pecho', 'nauseas'],
            age: 35,
          }
        });
      }

      // Actual measurement
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        const start = performance.now();
        evaluateRedFlags({
          message: 'Dolor de pecho',
          intake: {
            isPregnant: true,
            vitals: { spo2: 92, heartRate: 110, bloodPressure: { systolic: 140, diastolic: 90 } },
            symptoms: ['dolor de pecho', 'nauseas'],
            age: 35,
          }
        });
        const end = performance.now();
        timings.push(end - start);
      }

      const metrics = calculateMetrics(timings);

      expect(metrics.p50).toBeLessThan(20);
      expect(metrics.p95).toBeLessThan(45);
      expect(metrics.p99).toBeLessThan(100);
    });
  });

  // ============================================================================
  // ENHANCED DETECTION PERFORMANCE - detectRedFlagsEnhanced
  // ============================================================================
  describe('detectRedFlagsEnhanced Performance', () => {
    const patientContext = {
      age: 55,
      pregnancyStatus: 'not_pregnant' as const,
      conditions: ['diabetes', 'hypertension', 'heart_failure'],
      medications: [
        { name: 'Warfarina', dosage: '5mg' },
        { name: 'Metformina', dosage: '1000mg' },
        { name: 'Enalapril', dosage: '20mg' },
      ],
      vitalSigns: {
        bloodPressure: '145/95',
        heartRate: 88,
        temperature: 37.2,
        oxygenSaturation: 96,
      },
    };

    it('should complete enhanced detection in < 50ms (p95)', () => {
      const testMessage = 'Tengo dolor de pecho y dificultad para respirar';
      const timings: number[] = [];

      // Warmup
      for (let i = 0; i < WARMUP_ITERATIONS; i++) {
        detectRedFlagsEnhanced(testMessage, patientContext);
      }

      // Actual measurement
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        const start = performance.now();
        detectRedFlagsEnhanced(testMessage, patientContext);
        const end = performance.now();
        timings.push(end - start);
      }

      const metrics = calculateMetrics(timings);

      expect(metrics.p50).toBeLessThan(20);
      expect(metrics.p95).toBeLessThan(50);
      expect(metrics.p99).toBeLessThan(100);
    });

    it('should handle minimal context efficiently', () => {
      const timings: number[] = [];

      // Warmup
      for (let i = 0; i < WARMUP_ITERATIONS; i++) {
        detectRedFlagsEnhanced('No puedo respirar');
      }

      // Actual measurement
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        const start = performance.now();
        detectRedFlagsEnhanced('No puedo respirar');
        const end = performance.now();
        timings.push(end - start);
      }

      const metrics = calculateMetrics(timings);

      expect(metrics.p50).toBeLessThan(15);
      expect(metrics.p95).toBeLessThan(40);
      expect(metrics.p99).toBeLessThan(90);
    });

    it('should scale linearly with conditions count', () => {
      const conditions5 = ['diabetes', 'hypertension', 'heart_failure', 'copd', 'ckd'];
      const conditions10 = [...conditions5, 'asthma', 'depression', 'obesity', 'anemia', 'osteoporosis', 'arthritis'];

      const timings5: number[] = [];
      const timings10: number[] = [];

      // Warmup
      for (let i = 0; i < WARMUP_ITERATIONS; i++) {
        detectRedFlagsEnhanced('Dolor de pecho', { conditions: conditions5 });
        detectRedFlagsEnhanced('Dolor de pecho', { conditions: conditions10 });
      }

      // Test with 5 conditions
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        const start = performance.now();
        detectRedFlagsEnhanced('Dolor de pecho', { conditions: conditions5 });
        timings5.push(performance.now() - start);
      }

      // Test with 10 conditions
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        const start = performance.now();
        detectRedFlagsEnhanced('Dolor de pecho', { conditions: conditions10 });
        timings10.push(performance.now() - start);
      }

      const metrics5 = calculateMetrics(timings5);
      const metrics10 = calculateMetrics(timings10);

      // Should not double in time with double conditions (allow 2.5x for test variability)
      expect(metrics10.p95).toBeLessThan(metrics5.p95 * 2.5);
    });

    it('should scale linearly with medications count', () => {
      const medications3 = [
        { name: 'Warfarina' },
        { name: 'Insulina' },
        { name: 'Enalapril' },
      ];

      const medications6 = [
        ...medications3,
        { name: 'Metformina' },
        { name: 'Aspirina' },
        { name: 'Omeprazol' },
      ];

      const timings3: number[] = [];
      const timings6: number[] = [];

      // Warmup
      for (let i = 0; i < WARMUP_ITERATIONS; i++) {
        detectRedFlagsEnhanced('Sangrado nasal', { medications: medications3 });
        detectRedFlagsEnhanced('Sangrado nasal', { medications: medications6 });
      }

      // Test with 3 medications
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        const start = performance.now();
        detectRedFlagsEnhanced('Sangrado nasal', { medications: medications3 });
        timings3.push(performance.now() - start);
      }

      // Test with 6 medications
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        const start = performance.now();
        detectRedFlagsEnhanced('Sangrado nasal', { medications: medications6 });
        timings6.push(performance.now() - start);
      }

      const metrics3 = calculateMetrics(timings3);
      const metrics6 = calculateMetrics(timings6);

      // Should not double in time with double medications (allow 2.5x for test variability)
      expect(metrics6.p95).toBeLessThan(metrics3.p95 * 2.5);
    });
  });

  // ============================================================================
  // STRESS TESTS - High Volume
  // ============================================================================
  describe('Stress Tests - High Volume Detection', () => {
    it('should handle 1000 consecutive detections without degradation', () => {
      const messages = [
        'Dolor de pecho',
        'No puedo respirar',
        'Dolor de cabeza',
        'Náuseas',
        'Fiebre',
        'Dolor abdominal',
        'Cansancio',
        'Mareo',
      ];

      const timings: number[] = [];

      for (let i = 0; i < STRESS_ITERATIONS; i++) {
        const message = messages[i % messages.length];
        const start = performance.now();
        evaluateRedFlags({ message });
        timings.push(performance.now() - start);
      }

      const metrics = calculateMetrics(timings);

      // Check for performance degradation by comparing first half to second half
      const firstHalf = timings.slice(0, STRESS_ITERATIONS / 2);
      const secondHalf = timings.slice(STRESS_ITERATIONS / 2);

      const firstHalfMean = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondHalfMean = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

      // Second half should not be significantly slower (>50% slower - allowing for system variability)
      expect(secondHalfMean).toBeLessThan(firstHalfMean * 1.5);

      // Overall performance should still meet requirements
      expect(metrics.p95).toBeLessThan(50);
      expect(metrics.p99).toBeLessThan(100);
    });

    it('should handle 1000 enhanced detections without degradation', () => {
      const contexts = [
        { age: 25, conditions: ['asthma'] },
        { age: 50, conditions: ['diabetes', 'hypertension'] },
        { age: 75, conditions: ['copd', 'heart_failure'] },
        { age: 30, medications: [{ name: 'Warfarina' }] },
      ];

      const timings: number[] = [];

      for (let i = 0; i < STRESS_ITERATIONS; i++) {
        const context = contexts[i % contexts.length];
        const start = performance.now();
        detectRedFlagsEnhanced('Dolor de pecho', context);
        timings.push(performance.now() - start);
      }

      const metrics = calculateMetrics(timings);

      // Check for performance degradation
      const firstHalf = timings.slice(0, STRESS_ITERATIONS / 2);
      const secondHalf = timings.slice(STRESS_ITERATIONS / 2);

      const firstHalfMean = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondHalfMean = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

      expect(secondHalfMean).toBeLessThan(firstHalfMean * 1.2);
      expect(metrics.p95).toBeLessThan(100);
      expect(metrics.p99).toBeLessThan(150);
    });
  });

  // ============================================================================
  // EDGE CASE PERFORMANCE
  // ============================================================================
  describe('Edge Case Performance', () => {
    it('should handle very long messages efficiently', () => {
      const longMessage = 'Tengo dolor de pecho '.repeat(100) + 'dificultad para respirar';

      const timings: number[] = [];

      // Warmup
      for (let i = 0; i < 5; i++) {
        evaluateRedFlags({ message: longMessage });
      }

      // Actual measurement
      for (let i = 0; i < 50; i++) {
        const start = performance.now();
        evaluateRedFlags({ message: longMessage });
        timings.push(performance.now() - start);
      }

      const metrics = calculateMetrics(timings);

      // Even with long messages, should be fast
      expect(metrics.p95).toBeLessThan(100);
    });

    it('should handle empty messages gracefully', () => {
      const timings: number[] = [];

      for (let i = 0; i < TEST_ITERATIONS; i++) {
        const start = performance.now();
        evaluateRedFlags({ message: '' });
        timings.push(performance.now() - start);
      }

      const metrics = calculateMetrics(timings);

      expect(metrics.p95).toBeLessThan(20);
    });

    it('should handle special characters efficiently', () => {
      const specialMessage = 'Dolor!!! de??? pecho ### no puedo ### respirar!!!';

      const timings: number[] = [];

      for (let i = 0; i < TEST_ITERATIONS; i++) {
        const start = performance.now();
        evaluateRedFlags({ message: specialMessage });
        timings.push(performance.now() - start);
      }

      const metrics = calculateMetrics(timings);

      expect(metrics.p95).toBeLessThan(50);
    });
  });

  // ============================================================================
  // COMPARATIVE PERFORMANCE
  // ============================================================================
  describe('Comparative Performance', () => {
    it('should compare basic vs enhanced detection', () => {
      const message = 'Dolor de pecho y dificultad para respirar';

      const basicTimings: number[] = [];
      const enhancedTimings: number[] = [];

      // Warmup
      for (let i = 0; i < WARMUP_ITERATIONS; i++) {
        evaluateRedFlags({ message });
        detectRedFlagsEnhanced(message);
      }

      // Basic detection
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        const start = performance.now();
        evaluateRedFlags({ message });
        basicTimings.push(performance.now() - start);
      }

      // Enhanced detection
      for (let i = 0; i < TEST_ITERATIONS; i++) {
        const start = performance.now();
        detectRedFlagsEnhanced(message);
        enhancedTimings.push(performance.now() - start);
      }

      const basicMetrics = calculateMetrics(basicTimings);
      const enhancedMetrics = calculateMetrics(enhancedTimings);

      // Enhanced should be at most 3x slower (acceptable tradeoff for features)
      expect(enhancedMetrics.p95).toBeLessThan(basicMetrics.p95 * 3);
    });
  });

  // ============================================================================
  // MEMORY EFFICIENCY
  // ============================================================================
  describe('Memory Efficiency', () => {
    it('should not leak memory during repeated calls', () => {
      // This is a basic check - in production you'd use more sophisticated tools
      const messages = Array(100).fill(0).map((_, i) =>
        `Mensaje ${i}: dolor de pecho, dificultad respirar`
      );

      const beforeHeap = (performance as any).memory?.usedJSHeapSize;

      for (const message of messages) {
        evaluateRedFlags({ message });
        detectRedFlagsEnhanced(message);
      }

      const afterHeap = (performance as any).memory?.usedJSHeapSize;

      // If we can measure memory, check for reasonable increase
      if (beforeHeap && afterHeap) {
        const increaseMB = (afterHeap - beforeHeap) / (1024 * 1024);
        // Should not increase by more than 10MB for 200 operations
        expect(increaseMB).toBeLessThan(10);
      }
    });
  });

  // ============================================================================
  // REGRESSION PREVENTION
  // ============================================================================
  describe('Regression Prevention', () => {
    it('should maintain performance baseline across test runs', () => {
      const baselineP95 = 50; // ms - this should be our established baseline
      const baselineP99 = 100; // ms

      const message = 'Dolor de pecho opresivo con irradiación al brazo izquierdo';
      const timings: number[] = [];

      for (let i = 0; i < TEST_ITERATIONS; i++) {
        const start = performance.now();
        detectRedFlagsEnhanced(message);
        timings.push(performance.now() - start);
      }

      const metrics = calculateMetrics(timings);

      // Should not regress beyond 10% of baseline
      expect(metrics.p95).toBeLessThan(baselineP95 * 1.1);
      expect(metrics.p99).toBeLessThan(baselineP99 * 1.1);
    });
  });
});
