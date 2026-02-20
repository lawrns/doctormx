/**
 * Pact Matchers for Contract Testing
 * Provides flexible matching for API contracts
 */

import { Matchers } from '@pact-foundation/pact'

const { like, regex, datetime, boolean, integer, decimal, string, uuid, eachLike, email } = Matchers

/**
 * Auth API Matchers
 */
export const authMatchers = {
  // Login request body
  loginRequest: {
    email: email('test@example.com'),
    password: string('ValidPass123!'),
  },
  
  // Login response
  loginResponse: {
    user: {
      id: uuid('550e8400-e29b-41d4-a716-446655440000'),
      email: email('test@example.com'),
      full_name: string('Test User'),
      role: regex('patient|doctor|admin', 'patient'),
    },
    session: {
      access_token: string('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'),
      refresh_token: string('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'),
      expires_at: integer(Date.now() + 3600000),
      expires_in: integer(3600),
      token_type: string('bearer'),
    },
  },
  
  // Register request body
  registerRequest: {
    email: email('newuser@example.com'),
    password: string('ValidPass123!'),
    full_name: string('New User'),
    role: regex('patient|doctor', 'patient'),
  },
  
  // Register response
  registerResponse: {
    user: {
      id: uuid('550e8400-e29b-41d4-a716-446655440001'),
      email: email('newuser@example.com'),
      full_name: string('New User'),
      role: string('patient'),
    },
    message: string('Registration successful. Please check your email to verify your account.'),
  },
  
  // Error response
  errorResponse: {
    error: string('Error message'),
    status: integer(400),
  },
}

/**
 * Doctors API Matchers
 */
export const doctorsMatchers = {
  // Doctor profile
  doctor: {
    id: uuid('550e8400-e29b-41d4-a716-446655440002'),
    bio: like('Experienced doctor with 10+ years of practice'),
    price_cents: integer(50000),
    rating_avg: decimal(4.5),
    rating_count: integer(25),
    city: string('Mexico City'),
    state: string('CDMX'),
    years_experience: integer(10),
    languages: eachLike(string('es')),
    video_enabled: boolean(true),
    created_at: datetime('2024-01-01T00:00:00Z', 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    profile: {
      id: uuid('550e8400-e29b-41d4-a716-446655440002'),
      full_name: string('Dr. Juan Perez'),
      photo_url: like('https://example.com/photo.jpg'),
    },
    specialties: eachLike({
      id: uuid('550e8400-e29b-41d4-a716-446655440003'),
      name: string('Cardiology'),
      slug: string('cardiology'),
    }),
  },
  
  // Paginated doctors list response
  doctorsListResponse: {
    data: eachLike({
      id: uuid('550e8400-e29b-41d4-a716-446655440002'),
      bio: like('Experienced doctor'),
      price_cents: integer(50000),
      rating_avg: decimal(4.5),
      rating_count: integer(25),
      city: string('Mexico City'),
      state: string('CDMX'),
      years_experience: integer(10),
      languages: eachLike(string('es')),
      video_enabled: boolean(true),
      created_at: datetime('2024-01-01T00:00:00Z', 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
      profile: {
        id: uuid('550e8400-e29b-41d4-a716-446655440002'),
        full_name: string('Dr. Juan Perez'),
        photo_url: like('https://example.com/photo.jpg'),
      },
      specialties: eachLike({
        id: uuid('550e8400-e29b-41d4-a716-446655440003'),
        name: string('Cardiology'),
        slug: string('cardiology'),
      }),
    }),
    pagination: {
      has_more: boolean(true),
      next_cursor: like('eyJpZCI6IjEyMyIsImNyZWF0ZWRfYXQiOiIyMDI0LTAxLTAxIn0='),
      prev_cursor: like(null),
      total_count: integer(100),
    },
  },
  
  // Single doctor response
  doctorResponse: {
    id: uuid('550e8400-e29b-41d4-a716-446655440002'),
    bio: like('Experienced doctor'),
    price_cents: integer(50000),
    rating_avg: decimal(4.5),
    rating_count: integer(25),
    city: string('Mexico City'),
    state: string('CDMX'),
    years_experience: integer(10),
    languages: eachLike(string('es')),
    video_enabled: boolean(true),
    created_at: datetime('2024-01-01T00:00:00Z', 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    profile: {
      id: uuid('550e8400-e29b-41d4-a716-446655440002'),
      full_name: string('Dr. Juan Perez'),
      photo_url: like('https://example.com/photo.jpg'),
    },
    specialties: eachLike({
      id: uuid('550e8400-e29b-41d4-a716-446655440003'),
      name: string('Cardiology'),
      slug: string('cardiology'),
    }),
  },
  
  // Available slots response
  availableSlotsResponse: {
    slots: eachLike({
      date: regex(/^\d{4}-\d{2}-\d{2}$/, '2024-06-15'),
      time: regex(/^\d{2}:\d{2}$/, '09:00'),
      available: boolean(true),
    }),
  },
}

/**
 * Appointments API Matchers
 */
export const appointmentsMatchers = {
  // Create appointment request
  createAppointmentRequest: {
    doctorId: uuid('550e8400-e29b-41d4-a716-446655440002'),
    date: regex(/^\d{4}-\d{2}-\d{2}$/, '2024-06-15'),
    time: regex(/^\d{2}:\d{2}$/, '09:00'),
  },
  
  // Create appointment response
  createAppointmentResponse: {
    success: boolean(true),
    appointmentId: uuid('550e8400-e29b-41d4-a716-446655440004'),
  },
  
  // Appointment object
  appointment: {
    id: uuid('550e8400-e29b-41d4-a716-446655440004'),
    patient_id: uuid('550e8400-e29b-41d4-a716-446655440000'),
    doctor_id: uuid('550e8400-e29b-41d4-a716-446655440002'),
    start_ts: datetime('2024-06-15T09:00:00Z', 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    end_ts: datetime('2024-06-15T09:30:00Z', 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    status: regex('pending_payment|confirmed|completed|cancelled|refunded', 'confirmed'),
    type: regex('video|in_person', 'video'),
    price_cents: integer(50000),
    created_at: datetime('2024-01-01T00:00:00Z', 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    doctor: {
      id: uuid('550e8400-e29b-41d4-a716-446655440002'),
      specialty: string('Cardiology'),
      price_cents: integer(50000),
      currency: string('MXN'),
      rating: decimal(4.5),
      profile: {
        id: uuid('550e8400-e29b-41d4-a716-446655440002'),
        full_name: string('Dr. Juan Perez'),
        photo_url: like('https://example.com/photo.jpg'),
      },
    },
  },
  
  // Paginated appointments list
  appointmentsListResponse: {
    data: eachLike({
      id: uuid('550e8400-e29b-41d4-a716-446655440004'),
      patient_id: uuid('550e8400-e29b-41d4-a716-446655440000'),
      doctor_id: uuid('550e8400-e29b-41d4-a716-446655440002'),
      start_ts: datetime('2024-06-15T09:00:00Z', 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
      end_ts: datetime('2024-06-15T09:30:00Z', 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
      status: string('confirmed'),
      type: string('video'),
      price_cents: integer(50000),
      created_at: datetime('2024-01-01T00:00:00Z', 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
      doctor: {
        id: uuid('550e8400-e29b-41d4-a716-446655440002'),
        specialty: string('Cardiology'),
        price_cents: integer(50000),
        currency: string('MXN'),
        rating: decimal(4.5),
        profile: {
          id: uuid('550e8400-e29b-41d4-a716-446655440002'),
          full_name: string('Dr. Juan Perez'),
          photo_url: like('https://example.com/photo.jpg'),
        },
      },
    }),
    pagination: {
      has_more: boolean(false),
      next_cursor: like(null),
      prev_cursor: like(null),
      total_count: integer(5),
    },
  },
  
  // Cancel appointment response
  cancelAppointmentResponse: {
    success: boolean(true),
    message: string('Appointment cancelled successfully'),
    refund_status: regex('pending|processed|not_applicable', 'pending'),
  },
}

/**
 * Payments API Matchers
 */
export const paymentsMatchers = {
  // Create payment intent request
  createPaymentIntentRequest: {
    appointmentId: uuid('550e8400-e29b-41d4-a716-446655440004'),
  },
  
  // Create payment intent response
  createPaymentIntentResponse: {
    clientSecret: string('pi_1234567890_secret_abcdef'),
    paymentIntentId: string('pi_1234567890'),
    amount: integer(50000),
    currency: string('mxn'),
    status: string('requires_confirmation'),
  },
  
  // Confirm payment response
  confirmPaymentResponse: {
    success: boolean(true),
    paymentId: uuid('550e8400-e29b-41d4-a716-446655440005'),
    status: string('succeeded'),
    amount: integer(50000),
    currency: string('mxn'),
    appointment_id: uuid('550e8400-e29b-41d4-a716-446655440004'),
  },
  
  // Payment receipt
  paymentReceipt: {
    id: uuid('550e8400-e29b-41d4-a716-446655440005'),
    appointment_id: uuid('550e8400-e29b-41d4-a716-446655440004'),
    amount: integer(50000),
    currency: string('MXN'),
    status: string('succeeded'),
    payment_method: string('card'),
    paid_at: datetime('2024-06-15T09:00:00Z', 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
    receipt_url: like('https://pay.stripe.com/receipts/...'),
  },
  
  // OXXO payment response
  oxxoPaymentResponse: {
    clientSecret: string('pi_1234567890_secret_abcdef'),
    paymentIntentId: string('pi_1234567890'),
    amount: integer(50000),
    currency: string('mxn'),
    status: string('requires_action'),
    next_action: {
      type: string('oxxo_display_details'),
      oxxo_display_details: {
        voucher_url: like('https://payments.stripe.com/oxxo/voucher/...'),
        expires_at: integer(1234567890),
      },
    },
  },
}

export default {
  auth: authMatchers,
  doctors: doctorsMatchers,
  appointments: appointmentsMatchers,
  payments: paymentsMatchers,
}
