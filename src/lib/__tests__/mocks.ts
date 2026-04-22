import { vi } from 'vitest'
import type { Appointment, Doctor, Profile, Payment } from '@/types'
import type { Review } from '@/lib/reviews'

export const mockProfile: Profile = {
  id: 'test-profile-id',
  role: 'patient',
  full_name: 'Test Patient',
  email: 'patient@test.com',
  phone: '+5215551234567',
  photo_url: null,
  created_at: new Date().toISOString(),
}

export const mockDoctorProfile: Profile = {
  id: 'test-doctor-profile-id',
  role: 'doctor',
  full_name: 'Dr. Test Doctor',
  email: 'doctor@test.com',
  phone: '+5215557654321',
  photo_url: null,
  created_at: new Date().toISOString(),
}

export const mockDoctor: Doctor = {
  id: 'test-doctor-id',
  status: 'approved',
  specialty: 'Medicina General',
  bio: 'Test bio',
  languages: ['es', 'en'],
  license_number: '12345678',
  years_experience: 10,
  city: 'Mexico City',
  state: 'CDMX',
  country: 'MX',
  price_cents: 50000,
  currency: 'MXN',
  rating: 4.5,
  total_reviews: 100,
  profile: mockDoctorProfile,
}

export const createMockAppointment = (overrides: Partial<Appointment> = {}): Appointment => ({
  id: 'appointment-1',
  patient_id: 'test-patient-id',
  doctor_id: 'test-doctor-id',
  service_id: null,
  start_ts: new Date(Date.now() + 86400000).toISOString(),
  end_ts: new Date(Date.now() + 86400000 + 1800000).toISOString(),
  status: 'pending_payment',
  cancellation_reason: null,
  cancelled_by: null,
  created_at: new Date().toISOString(),
  ...overrides,
})

export const createMockPayment = (overrides: Partial<Payment> = {}): Payment => ({
  id: 'test-payment-id',
  appointment_id: 'appointment-1',
  provider: 'stripe',
  provider_ref: 'pi_test123',
  amount_cents: 50000,
  currency: 'MXN',
  status: 'pending',
  fee_cents: 2500,
  net_cents: 47500,
  ...overrides,
})

export const createMockReview = (overrides: Partial<Review> = {}): Review => ({
  id: 'test-review-id',
  appointment_id: 'test-appointment-id',
  patient_id: 'test-patient-id',
  doctor_id: 'test-doctor-id',
  rating: 5,
  comment: 'Great consultation!',
  created_at: new Date().toISOString(),
  patient: {
    full_name: 'Test Patient',
    photo_url: null,
  },
  ...overrides,
})

export function createSupabaseTableMock(table: string) {
  const dataByTable: Record<string, unknown> = {
    appointment_holds: { id: 'test-hold-id' },
    appointments: createMockAppointment({ id: 'appointment-1' }),
    payments: createMockPayment({ appointment_id: 'appointment-1', provider_ref: 'pi_test123' }),
  }
  const result = { data: dataByTable[table] ?? null, error: null }

  const chain = {
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
    range: vi.fn().mockResolvedValue({ data: [], error: null }),
    single: vi.fn().mockResolvedValue(result),
    maybeSingle: vi.fn().mockResolvedValue(result),
    then: vi.fn().mockImplementation((onFulfilled) => Promise.resolve({ error: null }).then(onFulfilled)),
  }

  return chain
}

export const mockSupabaseClient = {
  from: vi.fn(createSupabaseTableMock),
  storage: {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: null }),
      download: vi.fn().mockResolvedValue({ data: new ArrayBuffer(1), error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ publicUrl: 'https://test.com/file.pdf' }),
    }),
  },
}

export const mockStripePaymentIntent = {
  id: 'pi_test123',
  client_secret: 'pi_test123_secret_abc',
  amount: 50000,
  amount_received: 50000,
  currency: 'mxn',
  status: 'requires_payment_method',
  metadata: {
    appointmentId: 'appointment-1',
    doctorId: 'test-doctor-id',
    patientId: 'test-patient-id',
    amountCents: '50000',
    currency: 'MXN',
  },
}

export const mockStripePaymentIntentSucceeded = {
  ...mockStripePaymentIntent,
  status: 'succeeded',
}

export const mockStripeRefund = {
  id: 're_test123',
  amount: 50000,
  status: 'succeeded',
}

export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const generateDateRange = (startDaysFromNow: number, endDaysFromNow: number): string[] => {
  const dates: string[] = []
  const now = new Date()
  
  for (let i = startDaysFromNow; i <= endDaysFromNow; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() + i)
    dates.push(date.toISOString().split('T')[0])
  }
  
  return dates
}

export const generateTimeSlots = (): string[] => {
  const slots: string[] = []
  for (let hour = 9; hour <= 17; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
    slots.push(`${hour.toString().padStart(2, '0')}:30`)
  }
  return slots
}
