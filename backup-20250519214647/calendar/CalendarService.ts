import { supabase } from '../../lib/supabase';

/**
 * Service for managing calendars and appointments
 */
export class CalendarService {
  /**
   * Creates a calendar for a doctor
   * @param doctorId The ID of the doctor
   * @param calendarName The name of the calendar
   * @returns The created calendar
   */
  async createCalendar(doctorId: string, calendarName: string): Promise<any> {
    const { data, error } = await supabase
      .from('doctor_calendars')
      .insert({
        doctor_id: doctorId,
        name: calendarName,
        is_primary: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create calendar: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Gets all calendars for a doctor
   * @param doctorId The ID of the doctor
   * @returns Array of calendars
   */
  async getDoctorCalendars(doctorId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('doctor_calendars')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Failed to fetch doctor calendars: ${error.message}`);
    }
    
    return data || [];
  }
  
  /**
   * Creates an appointment
   * @param calendarId The ID of the calendar
   * @param appointment The appointment details
   * @returns The created appointment
   */
  async createAppointment(calendarId: string, appointment: any): Promise<any> {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        calendar_id: calendarId,
        patient_id: appointment.patientId,
        title: appointment.title,
        description: appointment.description,
        start_time: appointment.startTime,
        end_time: appointment.endTime,
        status: appointment.status || 'scheduled',
        appointment_type: appointment.appointmentType,
        location_type: appointment.locationType || 'in_person',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create appointment: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Gets appointments for a calendar within a date range
   * @param calendarId The ID of the calendar
   * @param startDate Start of date range (ISO string)
   * @param endDate End of date range (ISO string)
   * @returns Array of appointments
   */
  async getAppointments(calendarId: string, startDate: string, endDate: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, patients(*)')
      .eq('calendar_id', calendarId)
      .gte('start_time', startDate)
      .lte('end_time', endDate)
      .order('start_time', { ascending: true });
    
    if (error) {
      throw new Error(`Failed to fetch appointments: ${error.message}`);
    }
    
    return data || [];
  }
  
  /**
   * Updates an appointment
   * @param appointmentId The ID of the appointment
   * @param updates The updates to apply
   * @returns The updated appointment
   */
  async updateAppointment(appointmentId: string, updates: any): Promise<any> {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update appointment: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Cancels an appointment
   * @param appointmentId The ID of the appointment
   * @param cancellationReason The reason for cancellation
   * @returns The cancelled appointment
   */
  async cancelAppointment(appointmentId: string, cancellationReason: string): Promise<any> {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancellation_reason: cancellationReason,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to cancel appointment: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Sets up availability for a doctor
   * @param doctorId The ID of the doctor
   * @param availabilityRules Array of availability rules
   * @returns Success status
   */
  async setAvailability(doctorId: string, availabilityRules: any[]): Promise<boolean> {
    // First, remove existing availability for this doctor
    const { error: deleteError } = await supabase
      .from('doctor_availability')
      .delete()
      .eq('doctor_id', doctorId);
    
    if (deleteError) {
      throw new Error(`Failed to clear existing availability: ${deleteError.message}`);
    }
    
    // Insert new availability rules
    const { error: insertError } = await supabase
      .from('doctor_availability')
      .insert(
        availabilityRules.map(rule => ({
          doctor_id: doctorId,
          day_of_week: rule.dayOfWeek,
          start_time: rule.startTime,
          end_time: rule.endTime,
          is_available: rule.isAvailable !== false, // Default to true
          created_at: new Date().toISOString()
        }))
      );
    
    if (insertError) {
      throw new Error(`Failed to set availability: ${insertError.message}`);
    }
    
    return true;
  }
  
  /**
   * Gets availability for a doctor
   * @param doctorId The ID of the doctor
   * @returns Array of availability rules
   */
  async getAvailability(doctorId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('doctor_availability')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });
    
    if (error) {
      throw new Error(`Failed to fetch availability: ${error.message}`);
    }
    
    return data || [];
  }
}

export default new CalendarService();