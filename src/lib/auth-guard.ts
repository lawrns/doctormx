import { createClient } from '@/lib/supabase/server'

/**
 * Verifies the authenticated user matches the expected doctor ID.
 * Throws if not authorized. Use at the start of every doctor mutation function.
 */
export async function requireDoctorAuth(doctorId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('No autenticado')

  // Verify this user is associated with the claimed doctor ID
  const { data: doctor } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', user.id)
    .eq('id', doctorId)
    .single()

  if (!doctor) throw new Error('No autorizado: no puedes actuar como este doctor')
}

/**
 * Verifies the authenticated user matches the expected patient ID.
 */
export async function requirePatientAuth(patientId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .eq('id', patientId)
    .single()

  if (!profile) throw new Error('No autorizado: no puedes actuar como este paciente')
}

/**
 * Verifies the user is a participant in a conversation.
 * Checks that the authenticated user's profile is either the patient or doctor
 * of the conversation.
 */
export async function requireConversationParticipant(conversationId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) throw new Error('No autorizado: perfil no encontrado')

  const { data: conversation } = await supabase
    .from('chat_conversations')
    .select('patient_id, doctor_id')
    .eq('id', conversationId)
    .single()

  if (!conversation) throw new Error('No autorizado: conversación no encontrada')

  if (conversation.patient_id !== profile.id && conversation.doctor_id !== profile.id) {
    throw new Error('No autorizado: no eres parte de esta conversación')
  }
}

/**
 * Verifies the user is a doctor (of any ID)
 */
export async function requireDoctorRole(): Promise<{ doctorId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('No autenticado')

  const { data: doctor } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!doctor) throw new Error('No autorizado: se requiere rol de doctor')

  return { doctorId: doctor.id }
}

/**
 * Verifies the caller is the assigned doctor for a second opinion request.
 */
export async function requireAssignedDoctor(requestId: string): Promise<{ doctorId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('No autenticado')

  const { data: doctor } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!doctor) throw new Error('No autorizado: se requiere rol de doctor')

  const { data: request } = await supabase
    .from('second_opinion_requests')
    .select('assigned_doctor_id')
    .eq('id', requestId)
    .single()

  if (!request || request.assigned_doctor_id !== doctor.id) {
    throw new Error('No autorizado: no eres el doctor asignado a esta solicitud')
  }

  return { doctorId: doctor.id }
}
