import { createClient } from '@supabase/supabase-js';

let supabase: any = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Key must be provided in .env');
    }
    
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

export interface BookingRequest {
  referralId?: string;
  doctorId: string;
  patientId: string;
  appointmentTime: string;
  appointmentDate: string;
  duration: number; // in minutes
  type: 'consultation' | 'follow_up' | 'emergency';
  notes?: string;
  patientInfo?: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface BookingResult {
  id: string;
  doctorId: string;
  patientId: string;
  appointmentTime: string;
  appointmentDate: string;
  duration: number;
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
  reminders: {
    email: boolean;
    whatsapp: boolean;
    sms: boolean;
  };
}

export interface AvailabilitySlot {
  id: string;
  doctorId: string;
  date: string;
  timeSlot: string;
  duration: number;
  isAvailable: boolean;
  bookingId?: string;
}

/**
 * Create a new appointment booking
 */
export async function createBooking(bookingRequest: BookingRequest): Promise<BookingResult> {
  try {
    const supabaseClient = getSupabaseClient();
    
    // Check if slot is available
    // Normalize time format (add seconds if not present)
    const normalizedTime = bookingRequest.appointmentTime.includes(':') && bookingRequest.appointmentTime.split(':').length === 2 
      ? `${bookingRequest.appointmentTime}:00` 
      : bookingRequest.appointmentTime;
    
    const { data: availabilityData, error: availabilityError } = await supabaseClient
      .from('doctor_availability')
      .select('*')
      .eq('doctor_id', bookingRequest.doctorId)
      .eq('date', bookingRequest.appointmentDate)
      .eq('start_time', normalizedTime)
      .eq('is_available', true)
      .single();

    if (availabilityError || !availabilityData) {
      throw new Error('El horario seleccionado no está disponible');
    }

    // Create booking
    const { data: bookingData, error: bookingError } = await supabaseClient
      .from('appointment_bookings')
      .insert({
        doctor_id: bookingRequest.doctorId,
        patient_id: bookingRequest.patientId,
        availability_id: availabilityData.id,
        referral_id: bookingRequest.referralId,
        status: 'confirmed',
        notes: bookingRequest.notes,
        consultation_fee: 500.00,
        payment_status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      throw new Error('Error al crear la cita');
    }

    // Mark slot as unavailable
    const { error: updateError } = await supabaseClient
      .from('doctor_availability')
      .update({
        is_available: false,
        current_bookings: (availabilityData.current_bookings || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', availabilityData.id);

    if (updateError) {
      console.error('Error updating availability:', updateError);
      // Don't throw here, booking was created successfully
    }

    // Schedule reminders
    await scheduleReminders(bookingData);

    return {
      id: bookingData.id,
      doctorId: bookingData.doctor_id,
      patientId: bookingData.patient_id,
      appointmentTime: availabilityData.start_time,
      appointmentDate: availabilityData.date,
      duration: availabilityData.duration || 30,
      type: bookingRequest.type,
      status: bookingData.status,
      notes: bookingData.notes,
      createdAt: bookingData.created_at,
      reminders: {
        email: true,
        whatsapp: true,
        sms: false
      }
    };
  } catch (error) {
    console.error('Error in createBooking:', error);
    throw error;
  }
}

/**
 * Get available time slots for a doctor on a specific date
 */
export async function getAvailableSlots(doctorId: string, date: string): Promise<AvailabilitySlot[]> {
  try {
    const supabaseClient = getSupabaseClient();
    
    const { data, error } = await supabaseClient
      .from('doctor_availability')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('date', date)
      .eq('is_available', true)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error getting available slots:', error);
      throw new Error('Error al obtener horarios disponibles');
    }

    return (data || []).map(slot => ({
      id: slot.id,
      doctorId: slot.doctor_id,
      date: slot.date,
      timeSlot: slot.start_time,
      duration: slot.duration || 30,
      isAvailable: slot.is_available,
      bookingId: slot.booking_id
    }));
  } catch (error) {
    console.error('Error in getAvailableSlots:', error);
    throw error;
  }
}

/**
 * Get doctor's bookings for a date range
 */
export async function getDoctorBookings(doctorId: string, startDate: string, endDate: string): Promise<BookingResult[]> {
  try {
    const supabaseClient = getSupabaseClient();
    
    const { data, error } = await supabaseClient
      .from('appointment_bookings')
      .select(`
        *,
        doctor_availability (
          date,
          start_time,
          duration
        )
      `)
      .eq('doctor_id', doctorId)
      .gte('doctor_availability.date', startDate)
      .lte('doctor_availability.date', endDate)
      .order('doctor_availability.date', { ascending: true })
      .order('doctor_availability.start_time', { ascending: true });

    if (error) {
      console.error('Error getting doctor bookings:', error);
      throw new Error('Error al obtener las citas');
    }

    return (data || []).map(booking => ({
      id: booking.id,
      doctorId: booking.doctor_id,
      patientId: booking.patient_id,
      appointmentTime: booking.doctor_availability?.start_time || '09:00',
      appointmentDate: booking.doctor_availability?.date || startDate,
      duration: booking.doctor_availability?.duration || 30,
      type: 'consultation',
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.created_at,
      reminders: {
        email: true,
        whatsapp: true,
        sms: false
      }
    }));
  } catch (error) {
    console.error('Error in getDoctorBookings:', error);
    throw error;
  }
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: string, reason?: string): Promise<void> {
  try {
    const supabaseClient = getSupabaseClient();
    
    // Get booking details
    const { data: bookingData, error: bookingError } = await supabaseClient
      .from('appointment_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !bookingData) {
      throw new Error('Cita no encontrada');
    }

    // Update booking status
    const { error: updateError } = await supabaseClient
      .from('appointment_bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Error cancelling booking:', updateError);
      throw new Error('Error al cancelar la cita');
    }

    // Mark slot as available again
    const { error: availabilityError } = await supabaseClient
      .from('doctor_availability')
      .update({
        is_available: true,
        current_bookings: supabaseClient.raw('current_bookings - 1'),
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingData.availability_id);

    if (availabilityError) {
      console.error('Error updating availability after cancellation:', availabilityError);
      // Don't throw here, booking was cancelled successfully
    }

    // Send cancellation notification
    await sendCancellationNotification(bookingData, reason);
  } catch (error) {
    console.error('Error in cancelBooking:', error);
    throw error;
  }
}

/**
 * Schedule reminders for a booking
 */
async function scheduleReminders(booking: any): Promise<void> {
  try {
    // For now, we'll use a simple in-process scheduler
    // In production, this would use a proper job queue
    
    const appointmentDate = new Date(`${booking.appointment_date}T${booking.appointment_time}`);
    const now = new Date();
    
    // Schedule reminder 24 hours before
    const reminder24h = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
    if (reminder24h > now) {
      setTimeout(() => {
        sendReminder(booking, '24h');
      }, reminder24h.getTime() - now.getTime());
    }
    
    // Schedule reminder 2 hours before
    const reminder2h = new Date(appointmentDate.getTime() - 2 * 60 * 60 * 1000);
    if (reminder2h > now) {
      setTimeout(() => {
        sendReminder(booking, '2h');
      }, reminder2h.getTime() - now.getTime());
    }
    
    console.log(`Reminders scheduled for booking ${booking.id}`);
  } catch (error) {
    console.error('Error scheduling reminders:', error);
  }
}

/**
 * Send a reminder for a booking
 */
async function sendReminder(booking: any, type: '24h' | '2h'): Promise<void> {
  try {
    console.log(`Sending ${type} reminder for booking ${booking.id}`);
    
    // TODO: Implement actual email/WhatsApp/SMS sending
    // For now, just log the reminder
    
    const appointmentDate = new Date(`${booking.appointment_date}T${booking.appointment_time}`);
    const timeUntil = type === '24h' ? '24 horas' : '2 horas';
    
    console.log(`REMINDER: Cita programada para ${appointmentDate.toLocaleString('es-MX')} (${timeUntil})`);
    console.log(`Paciente: ${booking.patient_info?.name || 'N/A'}`);
    console.log(`Doctor ID: ${booking.doctor_id}`);
    
    // In production, this would:
    // 1. Send email to patient
    // 2. Send WhatsApp message if phone number available
    // 3. Send SMS if phone number available
    // 4. Log the reminder in the database
    
  } catch (error) {
    console.error('Error sending reminder:', error);
  }
}

/**
 * Send cancellation notification
 */
async function sendCancellationNotification(booking: any, reason?: string): Promise<void> {
  try {
    console.log(`Sending cancellation notification for booking ${booking.id}`);
    console.log(`Reason: ${reason || 'No reason provided'}`);
    
    // TODO: Implement actual notification sending
    // For now, just log the cancellation
    
    console.log(`CANCELLATION: Cita cancelada para ${booking.appointment_date} ${booking.appointment_time}`);
    console.log(`Paciente: ${booking.patient_info?.name || 'N/A'}`);
    console.log(`Doctor ID: ${booking.doctor_id}`);
    
  } catch (error) {
    console.error('Error sending cancellation notification:', error);
  }
}

/**
 * Get upcoming appointments for a patient
 */
export async function getPatientBookings(patientId: string, upcoming: boolean = true): Promise<BookingResult[]> {
  try {
    const supabaseClient = getSupabaseClient();
    
    let query = supabaseClient
      .from('appointment_bookings')
      .select(`
        *,
        doctor_availability (
          date,
          start_time,
          duration
        )
      `)
      .eq('patient_id', patientId)
      .order('doctor_availability.date', { ascending: true })
      .order('doctor_availability.start_time', { ascending: true });

    if (upcoming) {
      query = query.gte('doctor_availability.date', new Date().toISOString().split('T')[0]);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error getting patient bookings:', error);
      throw new Error('Error al obtener las citas del paciente');
    }

    return (data || []).map(booking => ({
      id: booking.id,
      doctorId: booking.doctor_id,
      patientId: booking.patient_id,
      appointmentTime: booking.doctor_availability?.start_time || '09:00',
      appointmentDate: booking.doctor_availability?.date || new Date().toISOString().split('T')[0],
      duration: booking.doctor_availability?.duration || 30,
      type: 'consultation',
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.created_at,
      reminders: {
        email: true,
        whatsapp: true,
        sms: false
      }
    }));
  } catch (error) {
    console.error('Error in getPatientBookings:', error);
    throw error;
  }
}
