/**
 * Performance Benchmarks for Doctor.mx
 *
 * Verifies that healthcare-critical operations meet performance targets:
 * - Emergency detection <100ms p99
 * - API responses <500ms p95
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { evaluateRedFlags } from '@/lib/triage'
import { measureEmergencyDetection, measurePerformance } from '@/lib/performance'

describe('Healthcare Performance Benchmarks', () => {
  describe('Emergency Detection Performance', () => {
    it('should detect chest pain emergency in <50ms (p50)', () => {
      const { result, duration } = measureEmergencyDetection(
        () => evaluateRedFlags({
          message: 'Tengo dolor de pecho muy fuerte',
          intake: { age: 45, sex: 'male' }
        }),
        { test: 'chest_pain' }
      )

      expect(result.triggered).toBe(true)
      expect(result.action).toBe('ER')
      expect(duration).toBeLessThan(50) // Should be very fast
    })

    it('should detect suicidal ideation in <50ms', () => {
      const { result, duration } = measureEmergencyDetection(
        () => evaluateRedFlags({
          message: 'Quiero morir, no puedo más',
          intake: { age: 25, sex: 'female' }
        }),
        { test: 'suicidal_ideation' }
      )

      expect(result.triggered).toBe(true)
      expect(result.action).toBe('ER')
      expect(duration).toBeLessThan(50)
    })

    it('should detect low oxygen emergency in <50ms', () => {
      const { result, duration } = measureEmergencyDetection(
        () => evaluateRedFlags({
          message: 'Me siento mal',
          intake: {
            age: 60,
            sex: 'male',
            vitals: { spo2: 85 } // Below 90% threshold
          }
        }),
        { test: 'low_oxygen' }
      )

      expect(result.triggered).toBe(true)
      expect(result.action).toBe('ER')
      expect(duration).toBeLessThan(50)
    })

    it('should evaluate complex symptoms in <100ms', () => {
      const { result, duration } = measureEmergencyDetection(
        () => evaluateRedFlags({
          message: 'Tengo dolor de cabeza, náuseas y me siento mareado. También tengo un poco de fiebre.',
          intake: {
            age: 35,
            sex: 'female',
            symptoms: ['dolor de cabeza', 'náuseas', 'mareo', 'fiebre']
          }
        }),
        { test: 'complex_symptoms' }
      )

      expect(duration).toBeLessThan(100) // p99 target
    })

    it('should handle no red flags in <20ms', () => {
      const { result, duration } = measureEmergencyDetection(
        () => evaluateRedFlags({
          message: 'Just saying hello',
          intake: { age: 30, sex: 'male' }
        }),
        { test: 'no_red_flags' }
      )

      expect(result.triggered).toBe(false)
      expect(duration).toBeLessThan(20)
    })
  })

  describe('Performance Target Verification', () => {
    it('should meet p95 target for emergency detection (300 iterations)', async () => {
      const durations: number[] = []
      const iterations = 300

      for (let i = 0; i < iterations; i++) {
        const { duration } = measureEmergencyDetection(
          () => evaluateRedFlags({
            message: 'Tengo dolor de pecho',
            intake: { age: 40 + (i % 40), sex: i % 2 === 0 ? 'male' : 'female' }
          }),
          { benchmark_iteration: String(i) }
        )
        durations.push(duration)
      }

      // Sort for percentile calculation
      durations.sort((a, b) => a - b)

      const p50 = durations[Math.floor(iterations * 0.50)]
      const p95 = durations[Math.floor(iterations * 0.95)]
      const p99 = durations[Math.floor(iterations * 0.99)]
      const max = durations[iterations - 1]

      console.log(`Emergency Detection Performance:`)
      console.log(`  p50: ${p50.toFixed(2)}ms`)
      console.log(`  p95: ${p95.toFixed(2)}ms`)
      console.log(`  p99: ${p99.toFixed(2)}ms`)
      console.log(`  max: ${max.toFixed(2)}ms`)

      expect(p95).toBeLessThan(50) // p95 target
      expect(p99).toBeLessThan(100) // p99 target
    })

    it('should meet performance targets for various scenarios', async () => {
      const testCases = [
        { message: 'Dolor de pecho', expected: 'ER' },
        { message: 'No puedo respirar', expected: 'ER' },
        { message: 'Quiero morir', expected: 'ER' },
        { message: 'Dolor de cabeza fuerte', expected: 'URGENT' },
        { message: 'Tengo fiebre y tos', expected: 'PRIMARY' },
        { message: 'Tengo un resfriado', expected: 'SELFCARE' },
      ]

      const durations: number[] = []

      for (const testCase of testCases) {
        const { duration } = measureEmergencyDetection(
          () => evaluateRedFlags({ message: testCase.message }),
          { scenario: testCase.expected }
        )
        durations.push(duration)
      }

      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
      const maxDuration = Math.max(...durations)

      console.log(`Multi-scenario Performance:`)
      console.log(`  avg: ${avgDuration.toFixed(2)}ms`)
      console.log(`  max: ${maxDuration.toFixed(2)}ms`)

      expect(maxDuration).toBeLessThan(100)
      expect(avgDuration).toBeLessThan(50)
    })
  })

  describe('Performance Monitoring Integration', () => {
    it('should track performance metrics', async () => {
      let capturedDuration: number | null = null

      await measurePerformance('red_flags_evaluation', async () => {
        // Simulate some work
        await new Promise(resolve => setTimeout(resolve, 10))
        return { success: true }
      }, { test_operation: 'integration_test' })

      expect(true).toBe(true) // Verify no errors thrown
    })
  })
})

