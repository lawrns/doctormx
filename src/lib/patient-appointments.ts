import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import type { AppointmentStatus } from '@/types'

export interface PatientAppointment {
  id: string
  patient_id: string
  doctor_id: string
  start_ts: string
  end_ts: string
  status: AppointmentStatus
  cancellation_reason: string | null
  cancelled_by: string | null
  created_at: string
  doctor?: {
    id: string
    specialty: string | null
    price_cents: number
    currency: string
    rating: number | null
    profile?: {
      full_name: string | null
      photo_url: string | null
    }
  }
  payment?: {
    amount_cents: number
    currency: string
    status: string
  }
}

export async function getPatientAppointments(
  patientId: string,
  statusFilter?: AppointmentStatus | 'upcoming' | 'past' | 'all'
): Promise<PatientAppointment[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctors (
        *,
        profile:profiles (full_name, photo_url, email)
      ),
      payment:payments (
        amount_cents,
        currency,
        status
      )
    `)
    .eq('patient_id', patientId)
  
  if (statusFilter && statusFilter !== 'all') {
    if (statusFilter === 'upcoming') {
      query = query
        .in('status', ['pending_payment', 'confirmed'])
        .gte('start_ts', new Date().toISOString())
    } else if (statusFilter === 'past') {
      query = query
        .in('status', ['completed', 'refunded', 'cancelled', 'no_show'])
        .lt('start_ts', new Date().toISOString())
    } else {
      query = query.eq('status', statusFilter)
    }
  }
  
  query = query.order('start_ts', { ascending: false })
  
  const { data, error } = await query
  
  if (error) {
    logger.error('Error getting patient appointments', { error: (error as Error).message }, error as Error)
    throw error
  }
  
  return data || []
}

export async function cancelAppointment(
  appointmentId: string,
  patientId: string,
  reason?: string
): Promise<PatientAppointment> {
  const supabase = await createClient()
  
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .eq('patient_id', patientId)
    .single()
  
  if (fetchError || !appointment) {
    throw new Error('Appointment not found or access denied')
  }
  
  if (appointment.status === 'cancelled') {
    throw new Error('Appointment is already cancelled')
  }
  
  if (appointment.status === 'completed') {
    throw new Error('Cannot cancel a completed appointment')
  }
  
  const { data, error: updateError } = await supabase
    .from('appointments')
    .update({
      status: 'cancelled',
      cancellation_reason: reason || 'Cancelled by patient',
      cancelled_by: patientId,
      cancelled_at: new Date().toISOString()
    })
    .eq('id', appointmentId)
    .select()
    .single()
  
  if (updateError) {
    logger.error('Error cancelling appointment', { error: (error as Error).message }, error as Error)
    throw updateError
  }
  
  return data
}

export async function getAppointmentDetails(
  appointmentId: string,
  patientId: string
): Promise<PatientAppointment | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctors (
        *,
        profile:profiles (full_name, photo_url, email)
      ),
      payment:payments (
        id,
        amount_cents,
        currency,
        status,
        provider,
        provider_ref
      )
    `)
    .eq('id', appointmentId)
    .eq('patient_id', patientId)
    .single()
  
  if (error) {
    logger.error('Error getting upcoming appointments', { error: (error as Error).message }, error as Error)
    return null
  }
  
  return data
}

export function formatAppointmentDate(dateStr: string): {
  date: string
  time: string
  weekday: string
  full: string
} {
  const date = new Date(dateStr)
  
  return {
    date: date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
    }),
    time: date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    weekday: date.toLocaleDateString('es-MX', {
      weekday: 'short',
    }),
    full: date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }
}

export function getAppointmentStatusInfo(status: string): {
  label: string
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  colorClass: string
} {
  const statusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; colorClass: string }> = {
    pending_payment: {
      label: 'Pago pendiente',
      variant: 'warning',
      colorClass: 'bg-yellow-100 text-yellow-800',
    },
    confirmed: {
      label: 'Confirmada',
      variant: 'success',
      colorClass: 'bg-green-100 text-green-800',
    },
    completed: {
      label: 'Completada',
      variant: 'info',
      colorClass: 'bg-blue-100 text-blue-800',
    },
    cancelled: {
      label: 'Cancelada',
      variant: 'error',
      colorClass: 'bg-red-100 text-red-800',
    },
    no_show: {
      label: 'No asistió',
      variant: 'error',
      colorClass: 'bg-red-100 text-red-800',
    },
    refunded: {
      label: 'Reembolsada',
      variant: 'neutral',
      colorClass: 'bg-gray-100 text-gray-800',
    },
  }
  
  return statusMap[status] || {
    label: status,
    variant: 'neutral',
    colorClass: 'bg-gray-100 text-gray-800',
  }
}

