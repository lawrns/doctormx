import { createHmac } from 'crypto'
import { readFileSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'
import { evaluateHardSafety } from '@/lib/ai/safety'
import { validatePaymentIntentBinding } from '@/lib/payment-integrity'
import { verifyWhatsAppSignature } from '@/app/api/webhooks/whatsapp/route'

function createBindingClient() {
  const tables: Record<string, Record<string, unknown>> = {
    appointments: {
      id: 'appt-1',
      doctor_id: 'doctor-1',
      patient_id: 'patient-1',
      status: 'pending_payment',
    },
    payments: {
      id: 'pay-1',
      appointment_id: 'appt-1',
      provider_ref: 'pi_1',
      stripe_payment_intent_id: 'pi_1',
      amount_cents: 50000,
      currency: 'MXN',
      status: 'pending',
    },
  }

  return {
    from(table: string) {
      return {
        select() {
          return this
        },
        eq() {
          return this
        },
        async single() {
          return { data: tables[table] || null, error: tables[table] ? null : { message: 'missing' } }
        },
      }
    },
  }
}

describe('launch integrity guardrails', () => {
  it('blocks payment confirmation when Stripe metadata points at a different appointment', async () => {
    await expect(validatePaymentIntentBinding({
      supabase: createBindingClient(),
      appointmentId: 'appt-1',
      patientId: 'patient-1',
      paymentIntent: {
        id: 'pi_1',
        amount: 50000,
        amount_received: 50000,
        currency: 'mxn',
        status: 'succeeded',
        metadata: {
          appointmentId: 'other-appt',
          doctorId: 'doctor-1',
          patientId: 'patient-1',
          amountCents: '50000',
          currency: 'MXN',
        },
      },
    })).rejects.toThrow('appointment metadata')
  })

  it('accepts payment confirmation only when appointment, patient, doctor, amount, and currency match', async () => {
    await expect(validatePaymentIntentBinding({
      supabase: createBindingClient(),
      appointmentId: 'appt-1',
      patientId: 'patient-1',
      paymentIntent: {
        id: 'pi_1',
        amount: 50000,
        amount_received: 50000,
        currency: 'mxn',
        status: 'succeeded',
        metadata: {
          appointmentId: 'appt-1',
          doctorId: 'doctor-1',
          patientId: 'patient-1',
          amountCents: '50000',
          currency: 'MXN',
        },
      },
    })).resolves.toBeDefined()
  })

  it('routes emergency language through the hard safety gate before model output', () => {
    const result = evaluateHardSafety('Tengo dolor fuerte en el pecho y me falta el aire')

    expect(result.triggered).toBe(true)
    expect(result.urgency).toBe('emergency')
    expect(result.response).toContain('911')
  })

  it('verifies Meta WhatsApp webhook signatures and rejects tampered bodies', () => {
    const secret = 'test-secret'
    const payload = '{"entry":[]}'
    const signature = `sha256=${createHmac('sha256', secret).update(payload).digest('hex')}`

    expect(verifyWhatsAppSignature(payload, signature, secret)).toBe(true)
    expect(verifyWhatsAppSignature(`${payload} `, signature, secret)).toBe(false)
  })

  it('configures v8 coverage with current repository baseline thresholds', () => {
    const config = readFileSync(
      join(process.cwd(), 'vitest.config.ts'),
      'utf8'
    )

    expect(config).toContain("provider: 'v8'")
    expect(config).toContain('Current repository-wide coverage baseline')

    const thresholdPattern = /(lines|functions|branches|statements):\s*(\d+)/g
    const thresholds: Record<string, number> = {}
    let match: RegExpExecArray | null
    while ((match = thresholdPattern.exec(config)) !== null) {
      thresholds[match[1]] = parseInt(match[2], 10)
    }

    expect(thresholds.lines).toBeGreaterThanOrEqual(40)
    expect(thresholds.functions).toBeGreaterThanOrEqual(45)
    expect(thresholds.branches).toBeGreaterThanOrEqual(33)
    expect(thresholds.statements).toBeGreaterThanOrEqual(40)
  })

  it('keeps first-screen patient AI disclosure explicit and avoids unsupported price claims', () => {
    const heroSource = readFileSync(
      join(process.cwd(), 'src/components/landing/HeroSection.tsx'),
      'utf8'
    )

    expect(heroSource).toContain('orientación con IA, no un diagnóstico médico')
    expect(heroSource).toContain('médico humano')
    expect(heroSource).not.toContain('Primera consulta desde $500 MXN')
  })

  it('lets pending doctors complete productive setup instead of waiting in limbo', () => {
    const layoutSource = readFileSync(
      join(process.cwd(), 'src/components/DoctorLayout.tsx'),
      'utf8'
    )

    expect(layoutSource).toContain("{ name: 'Disponibilidad', href: '/doctor/availability', icon: Calendar, enabled: true }")
    expect(layoutSource).toContain("{ name: 'Formularios', href: '/doctor/intake-forms', icon: FileText, enabled: true }")
    expect(layoutSource).toContain('Mientras tanto puedes completar perfil, disponibilidad y formularios')
    expect(layoutSource).toContain('aria-disabled={disabled}')
  })

  it('ships DB-level booking and webhook idempotency constraints', () => {
    const migration = readFileSync(
      join(process.cwd(), 'supabase/migrations/20260422090000_launch_integrity_core.sql'),
      'utf8'
    )

    expect(migration).toContain('idx_appointments_doctor_start_active')
    expect(migration).toContain("WHERE status IN ('pending_payment', 'confirmed')")
    expect(migration).toContain('idx_appointment_holds_doctor_start_active')
    expect(migration).toContain('UNIQUE (provider, event_id)')
    expect(migration).toContain('idx_whatsapp_messages_message_id_unique')
  })
})
