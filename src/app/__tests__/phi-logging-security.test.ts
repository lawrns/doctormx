import { describe, expect, it, vi, beforeEach } from 'vitest'

import { redact, phiLogger } from '@/lib/observability/phi-safe-logger'
import { logger } from '@/lib/observability/logger'

describe('PHI-safe logger', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('redact() utility', () => {
    it('redacts known PHI fields from flat objects', () => {
      const input = { name: 'John Doe', email: 'john@example.com', role: 'doctor' }
      const result = redact(input)
      expect(result.name).toBe('[REDACTED]')
      expect(result.email).toBe('[REDACTED]')
      expect(result.role).toBe('doctor')
    })

    it('redacts nested PHI fields', () => {
      const input = {
        user: { name: 'Jane', email: 'jane@test.com', ssn: '123-45-6789' },
        meta: { source: 'web', requestId: 'req-1' },
      }
      const result = redact(input)
      expect(result.user.name).toBe('[REDACTED]')
      expect(result.user.email).toBe('[REDACTED]')
      expect(result.user.ssn).toBe('[REDACTED]')
      expect(result.meta.source).toBe('web')
      expect(result.meta.requestId).toBe('req-1')
    })

    it('redacts PHI fields in arrays', () => {
      const input = {
        patients: [
          { name: 'Alice', diagnosis: 'Flu' },
          { name: 'Bob', diagnosis: 'Cold' },
        ],
        ids: [1, 2, 3],
      }
      const result = redact(input)
      expect(result.patients[0].name).toBe('[REDACTED]')
      expect(result.patients[0].diagnosis).toBe('[REDACTED]')
      expect(result.patients[1].name).toBe('[REDACTED]')
      expect(result.patients[1].diagnosis).toBe('[REDACTED]')
      expect(result.ids).toEqual([1, 2, 3])
    })

    it('passes non-PHI fields through unchanged', () => {
      const input = { userId: 'abc', requestId: 'req-1', feature: 'test', duration_ms: 150 }
      expect(redact(input)).toEqual(input)
    })

    it('redacts all known PHI field variations', () => {
      const input = {
        name: 'a', email: 'b', phone: 'c', address: 'd', ssn: 'e',
        diagnosis: 'f', notes: 'g', transcript: 'h', consultationNotes: 'i',
        patientName: 'j', doctorName: 'k', full_name: 'l',
        password: 'm', token: 'n', secret: 'o', authorization: 'p', cookie: 'q',
        safeField: 'keep',
      }
      const result = redact(input)
      expect(result.safeField).toBe('keep')
      expect(result.name).toBe('[REDACTED]')
      expect(result.email).toBe('[REDACTED]')
      expect(result.phone).toBe('[REDACTED]')
      expect(result.address).toBe('[REDACTED]')
      expect(result.ssn).toBe('[REDACTED]')
      expect(result.diagnosis).toBe('[REDACTED]')
      expect(result.notes).toBe('[REDACTED]')
      expect(result.transcript).toBe('[REDACTED]')
      expect(result.consultationNotes).toBe('[REDACTED]')
      expect(result.patientName).toBe('[REDACTED]')
      expect(result.doctorName).toBe('[REDACTED]')
      expect(result.full_name).toBe('[REDACTED]')
      expect(result.password).toBe('[REDACTED]')
      expect(result.token).toBe('[REDACTED]')
      expect(result.secret).toBe('[REDACTED]')
      expect(result.authorization).toBe('[REDACTED]')
      expect(result.cookie).toBe('[REDACTED]')
    })

    it('handles null and primitive values', () => {
      expect(redact(null)).toBeNull()
      expect(redact(undefined)).toBeUndefined()
      expect(redact('string')).toBe('string')
      expect(redact(42)).toBe(42)
      expect(redact(true)).toBe(true)
    })

    it('handles empty objects', () => {
      expect(redact({})).toEqual({})
      expect(redact([])).toEqual([])
    })
  })

  describe('phiLogger redacts PHI from context', () => {
    it('redacts PHI fields when using phiInfo', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
      phiLogger.phiInfo('test message', { name: 'John', email: 'john@test.com', role: 'doctor' })

      expect(spy).toHaveBeenCalled()
      const callArg = JSON.parse(spy.mock.calls[0][0])
      expect(callArg.level).toBe('info')
      expect(callArg.message).toBe('test message')
      expect(callArg.context.name).toBe('[REDACTED]')
      expect(callArg.context.email).toBe('[REDACTED]')
      expect(callArg.context.role).toBe('doctor')
    })

    it('redacts PHI fields when using phiWarn', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      phiLogger.phiWarn('warning', { ssn: '123-45-6789', diagnosis: 'Diabetes' })

      expect(spy).toHaveBeenCalled()
      const callArg = JSON.parse(spy.mock.calls[0][0])
      expect(callArg.context.ssn).toBe('[REDACTED]')
      expect(callArg.context.diagnosis).toBe('[REDACTED]')
    })

    it('redacts PHI fields when using phiError', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const testError = new Error('test error')
      phiLogger.phiError('error occurred', { patientName: 'Jane', error: 'timeout' }, testError)

      expect(spy).toHaveBeenCalled()
      const callArg = JSON.parse(spy.mock.calls[0][0])
      expect(callArg.context.patientName).toBe('[REDACTED]')
      expect(callArg.context.error).toBe('timeout')
      expect(callArg.error.name).toBe('Error')
      expect(callArg.error.message).toBe('test error')
    })

    it('redacts PHI in nested context objects', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
      phiLogger.phiInfo('nested', {
        requestId: 'req-123',
        patient: { name: 'Alice', phone: '555-0100', address: '123 Main St' },
        metadata: { source: 'web' },
      })

      expect(spy).toHaveBeenCalled()
      const callArg = JSON.parse(spy.mock.calls[0][0])
      expect(callArg.context.requestId).toBe('req-123')
      expect(callArg.context.patient.name).toBe('[REDACTED]')
      expect(callArg.context.patient.phone).toBe('[REDACTED]')
      expect(callArg.context.patient.address).toBe('[REDACTED]')
      expect(callArg.context.metadata.source).toBe('web')
    })
  })

  describe('phiLogger child() scoped logger', () => {
    it('redacts default context from child logger', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const child = phiLogger.child({ patientName: 'Jane', requestId: 'req-1' })
      child.phiInfo('test', { role: 'doctor' })

      expect(spy).toHaveBeenCalled()
      const callArg = JSON.parse(spy.mock.calls[0][0])
      expect(callArg.context.patientName).toBe('[REDACTED]')
      expect(callArg.context.requestId).toBe('req-1')
      expect(callArg.context.role).toBe('doctor')
    })
  })

  describe('regular logger preserves existing behavior', () => {
    it('logs all fields without redaction', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
      logger.info('test message', { name: 'John', email: 'john@test.com', role: 'doctor' })

      expect(spy).toHaveBeenCalled()
      const callArg = JSON.parse(spy.mock.calls[0][0])
      expect(callArg.level).toBe('info')
      expect(callArg.message).toBe('test message')
      expect(callArg.context.name).toBe('John')
      expect(callArg.context.email).toBe('john@test.com')
      expect(callArg.context.role).toBe('doctor')
    })

    it('logs PHI without transformation via warn level', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      logger.warn('phi warning', { ssn: '123-45-6789', diagnosis: 'Hypertension' })

      expect(spy).toHaveBeenCalled()
      const callArg = JSON.parse(spy.mock.calls[0][0])
      expect(callArg.context.ssn).toBe('123-45-6789')
      expect(callArg.context.diagnosis).toBe('Hypertension')
    })
  })
})
