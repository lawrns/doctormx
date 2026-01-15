import { z } from 'zod'

// Doctor onboarding validation schema
export const doctorOnboardingSchema = z.object({
  yearsExperience: z.number().int().min(0).max(75),
  bio: z.string().max(2000).trim(),
  licenseNumber: z.string().regex(/^[A-Z0-9]{6,20}$/, 'License number must be 6-20 alphanumeric characters'),
  priceCents: z.number().int().min(10000).max(500000),
  availability: z.array(z.object({
    day: z.number().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format')
  })).optional()
})

// Appointment creation validation schema
export const appointmentSchema = z.object({
  doctorId: z.string().uuid('Invalid doctor ID'),
  slotId: z.string().uuid('Invalid slot ID').optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM').optional(),
  notes: z.string().max(1000).optional(),
  reason: z.string().max(500).optional()
})

// Prescription validation schema
export const prescriptionSchema = z.object({
  appointmentId: z.string().uuid('Invalid appointment ID'),
  medications: z.array(z.object({
    name: z.string().min(1, 'Medication name required'),
    dosage: z.string().min(1, 'Dosage required'),
    frequency: z.string().min(1, 'Frequency required'),
    duration: z.string().min(1, 'Duration required'),
    instructions: z.string().optional()
  })).min(1, 'At least one medication required'),
  diagnosis: z.string().optional(),
  notes: z.string().max(2000).optional()
})

// Doctor verification validation schema
export const doctorVerificationSchema = z.object({
  doctorId: z.string().uuid('Invalid doctor ID'),
  status: z.enum(['verified', 'rejected', 'pending']),
  notes: z.string().max(1000).optional()
})

// Payment intent validation schema
export const paymentIntentSchema = z.object({
  appointmentId: z.string().uuid('Invalid appointment ID'),
  amount: z.number().int().min(100).max(10000000),
  currency: z.string().length(3).default('mxn')
})

// User profile update schema
export const profileUpdateSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number').optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  address: z.string().max(500).optional()
})

// Second opinion request schema
export const secondOpinionSchema = z.object({
  specialtyId: z.string().uuid().optional(),
  description: z.string().min(50).max(5000),
  medicalHistory: z.string().max(10000).optional(),
  attachments: z.array(z.string().url()).max(10).optional()
})

// AI chat message schema
export const chatMessageSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().uuid().optional()
})

// Helper function to validate request body
export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: z.ZodError }> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error }
    }
    throw error
  }
}

// Type exports
export type DoctorOnboardingInput = z.infer<typeof doctorOnboardingSchema>
export type AppointmentInput = z.infer<typeof appointmentSchema>
export type PrescriptionInput = z.infer<typeof prescriptionSchema>
export type DoctorVerificationInput = z.infer<typeof doctorVerificationSchema>
export type PaymentIntentInput = z.infer<typeof paymentIntentSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type SecondOpinionInput = z.infer<typeof secondOpinionSchema>
export type ChatMessageInput = z.infer<typeof chatMessageSchema>
