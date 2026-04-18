import { describe, expect, it } from 'vitest'
import { getSupportPageContext } from '@/lib/support/page-context'

describe('getSupportPageContext', () => {
  it('maps landing page correctly for visitors', () => {
    const context = getSupportPageContext('/', 'visitor')

    expect(context.routeType).toBe('landing')
    expect(context.pageTitle).toContain('Doctor.mx')
    expect(context.suggestedLinks.some((link) => link.href === '/doctors')).toBe(true)
  })

  it('maps doctor chat route correctly', () => {
    const context = getSupportPageContext('/doctor/chat', 'doctor')

    expect(context.routeType).toBe('doctor-chat')
    expect(context.knownActions).toContain('Responder pacientes')
  })

  it('falls back safely for unknown routes', () => {
    const context = getSupportPageContext('/unknown/route', 'patient')

    expect(context.routeType).toBe('unknown')
    expect(context.suggestedLinks.length).toBeGreaterThan(0)
  })
})
