import { supabase } from '../../lib/supabase';
import CalendarService from './CalendarService';

/**
 * Service for simulating integration with Doctoralia's calendar system
 */
export class DoctoraliaIntegrationService {
  private readonly CALENDAR_TYPE = 'doctoralia';
  
  /**
   * Connects a doctor's account with Doctoralia
   * @param doctorId The ID of the doctor
   * @param doctoraliaCredentials Object with Doctoralia credentials
   * @returns The integration record
   */
  async connectDoctoralia(doctorId: string, doctoraliaCredentials: any): Promise<any> {
    try {
      // Simulate authentication with Doctoralia
      console.log(`Simulating Doctoralia authentication for doctor ${doctorId}`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate a successful connection
      const { data: existingIntegration, error: checkError } = await supabase
        .from('calendar_integrations')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('provider', this.CALENDAR_TYPE)
        .maybeSingle();
      
      if (checkError) {
        throw new Error(`Failed to check existing integration: ${checkError.message}`);
      }
      
      // If integration already exists, update it
      if (existingIntegration) {
        const { data, error } = await supabase
          .from('calendar_integrations')
          .update({
            provider_data: {
              username: doctoraliaCredentials.username,
              // In a real app, we would not store passwords, but use OAuth tokens
              // This is just for simulation
              connected: true,
              last_synced: null
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', existingIntegration.id)
          .select()
          .single();
        
        if (error) {
          throw new Error(`Failed to update integration: ${error.message}`);
        }
        
        // Create a calendar for this integration if it doesn't exist
        await this.ensureCalendarExists(doctorId);
        
        return data;
      }
      
      // Create new integration
      const { data, error } = await supabase
        .from('calendar_integrations')
        .insert({
          doctor_id: doctorId,
          provider: this.CALENDAR_TYPE,
          provider_data: {
            username: doctoraliaCredentials.username,
            // In a real app, we would not store passwords, but use OAuth tokens
            connected: true,
            last_synced: null
          },
          status: 'active',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to create integration: ${error.message}`);
      }
      
      // Create a calendar for this integration
      await this.ensureCalendarExists(doctorId);
      
      return data;
    } catch (error) {
      console.error('Error connecting to Doctoralia:', error);
      throw error;
    }
  }
  
  /**
   * Ensures that a Doctoralia calendar exists for the doctor
   * @param doctorId The ID of the doctor
   * @returns The calendar ID
   */
  private async ensureCalendarExists(doctorId: string): Promise<string> {
    // Check if calendar already exists
    const { data: calendars, error } = await supabase
      .from('doctor_calendars')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('source', this.CALENDAR_TYPE);
    
    if (error) {
      throw new Error(`Failed to check existing calendars: ${error.message}`);
    }
    
    // If calendar exists, return its ID
    if (calendars && calendars.length > 0) {
      return calendars[0].id;
    }
    
    // Create a new calendar
    const { data: newCalendar, error: createError } = await supabase
      .from('doctor_calendars')
      .insert({
        doctor_id: doctorId,
        name: 'Doctoralia',
        source: this.CALENDAR_TYPE,
        is_primary: false,
        is_synchronized: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (createError) {
      throw new Error(`Failed to create Doctoralia calendar: ${createError.message}`);
    }
    
    return newCalendar.id;
  }
  
  /**
   * Synchronizes appointments from Doctoralia
   * @param doctorId The ID of the doctor
   * @returns Synchronization result
   */
  async syncAppointments(doctorId: string): Promise<any> {
    try {
      // Get integration record
      const { data: integration, error: integrationError } = await supabase
        .from('calendar_integrations')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('provider', this.CALENDAR_TYPE)
        .maybeSingle();
      
      if (integrationError) {
        throw new Error(`Failed to get integration: ${integrationError.message}`);
      }
      
      if (!integration) {
        throw new Error('No Doctoralia integration found');
      }
      
      // Get Doctoralia calendar
      const { data: calendar, error: calendarError } = await supabase
        .from('doctor_calendars')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('source', this.CALENDAR_TYPE)
        .maybeSingle();
      
      if (calendarError) {
        throw new Error(`Failed to get calendar: ${calendarError.message}`);
      }
      
      if (!calendar) {
        throw new Error('No Doctoralia calendar found');
      }
      
      // Simulate fetching appointments from Doctoralia
      console.log(`Simulating fetch of Doctoralia appointments for doctor ${doctorId}`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate simulated appointments for the next 7 days
      const doctoraliaAppointments = this.generateSimulatedAppointments(doctorId, 7);
      
      // Get existing appointments for comparison
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      
      const existingAppointments = await CalendarService.getAppointments(
        calendar.id,
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      // Compare and sync
      const result = {
        added: 0,
        updated: 0,
        deleted: 0,
        unchanged: 0,
        errors: 0
      };
      
      // Process new and updated appointments
      for (const appt of doctoraliaAppointments) {
        // Check if the appointment already exists by external ID
        const existingAppt = existingAppointments.find(
          a => a.external_id === appt.external_id
        );
        
        try {
          if (!existingAppt) {
            // Create new appointment
            await CalendarService.createAppointment(calendar.id, {
              patientId: appt.patientId,
              title: appt.title,
              description: appt.description,
              startTime: appt.startTime,
              endTime: appt.endTime,
              status: appt.status,
              appointmentType: appt.appointmentType,
              locationType: appt.locationType,
              externalId: appt.external_id,
              externalSource: this.CALENDAR_TYPE
            });
            result.added++;
          } else if (this.appointmentNeedsUpdate(existingAppt, appt)) {
            // Update existing appointment
            await CalendarService.updateAppointment(existingAppt.id, {
              title: appt.title,
              description: appt.description,
              start_time: appt.startTime,
              end_time: appt.endTime,
              status: appt.status,
              appointment_type: appt.appointmentType,
              location_type: appt.locationType
            });
            result.updated++;
          } else {
            result.unchanged++;
          }
        } catch (error) {
          console.error('Error processing appointment:', error);
          result.errors++;
        }
      }
      
      // Process deleted appointments
      const doctoraliaIds = doctoraliaAppointments.map(a => a.external_id);
      for (const existingAppt of existingAppointments) {
        if (
          existingAppt.external_source === this.CALENDAR_TYPE &&
          existingAppt.external_id &&
          !doctoraliaIds.includes(existingAppt.external_id)
        ) {
          try {
            // Mark as cancelled instead of deleting
            await CalendarService.cancelAppointment(
              existingAppt.id,
              'Removed from Doctoralia'
            );
            result.deleted++;
          } catch (error) {
            console.error('Error processing deleted appointment:', error);
            result.errors++;
          }
        }
      }
      
      // Update last sync time
      await supabase
        .from('calendar_integrations')
        .update({
          provider_data: {
            ...integration.provider_data,
            last_synced: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', integration.id);
      
      return {
        success: true,
        ...result,
        lastSynced: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error syncing Doctoralia appointments:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Compares appointments to see if an update is needed
   * @param existingAppt The existing appointment
   * @param newAppt The new appointment data
   * @returns True if an update is needed
   */
  private appointmentNeedsUpdate(existingAppt: any, newAppt: any): boolean {
    return (
      existingAppt.title !== newAppt.title ||
      existingAppt.description !== newAppt.description ||
      existingAppt.start_time !== newAppt.startTime ||
      existingAppt.end_time !== newAppt.endTime ||
      existingAppt.status !== newAppt.status ||
      existingAppt.appointment_type !== newAppt.appointmentType ||
      existingAppt.location_type !== newAppt.locationType
    );
  }
  
  /**
   * Generates simulated appointments for testing
   * @param doctorId The ID of the doctor
   * @param daysAhead Number of days ahead to generate appointments for
   * @returns Array of simulated appointments
   */
  private generateSimulatedAppointments(doctorId: string, daysAhead: number): any[] {
    const appointments = [];
    const appointmentTypes = ['check_up', 'consultation', 'follow_up', 'procedure'];
    const patientFirstNames = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Sofia', 'Miguel', 'Laura'];
    const patientLastNames = ['García', 'Rodríguez', 'López', 'Martínez', 'Hernández', 'González'];
    
    // Generate random appointments
    const numAppointments = 5 + Math.floor(Math.random() * 15); // 5-20 appointments
    
    for (let i = 0; i < numAppointments; i++) {
      // Random date within the next `daysAhead` days
      const date = new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead));
      
      // Random hour between 9am and 5pm
      date.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);
      
      // 30-minute or 1-hour appointment
      const duration = Math.random() > 0.5 ? 30 : 60;
      
      const startTime = new Date(date);
      const endTime = new Date(date);
      endTime.setMinutes(endTime.getMinutes() + duration);
      
      // Random patient name
      const firstName = patientFirstNames[Math.floor(Math.random() * patientFirstNames.length)];
      const lastName = patientLastNames[Math.floor(Math.random() * patientLastNames.length)];
      const patientName = `${firstName} ${lastName}`;
      
      // Random appointment type
      const appointmentType = appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)];
      
      appointments.push({
        external_id: `doctoralia-${Date.now()}-${i}`,
        patientId: null, // Would be linked to a real patient in production
        patientName,
        title: `Cita con ${patientName}`,
        description: `Cita de ${duration} minutos - ${appointmentType}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        status: 'scheduled',
        appointmentType,
        locationType: Math.random() > 0.3 ? 'in_person' : 'telemedicine'
      });
    }
    
    return appointments;
  }
  
  /**
   * Disconnects Doctoralia integration
   * @param doctorId The ID of the doctor
   * @returns Success status
   */
  async disconnectDoctoralia(doctorId: string): Promise<boolean> {
    try {
      // Update integration status
      const { error: updateError } = await supabase
        .from('calendar_integrations')
        .update({
          status: 'inactive',
          provider_data: {
            connected: false,
            disconnected_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('doctor_id', doctorId)
        .eq('provider', this.CALENDAR_TYPE);
      
      if (updateError) {
        throw new Error(`Failed to update integration: ${updateError.message}`);
      }
      
      // Update calendar status
      const { error: calendarError } = await supabase
        .from('doctor_calendars')
        .update({
          is_synchronized: false,
          updated_at: new Date().toISOString()
        })
        .eq('doctor_id', doctorId)
        .eq('source', this.CALENDAR_TYPE);
      
      if (calendarError) {
        throw new Error(`Failed to update calendar: ${calendarError.message}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error disconnecting from Doctoralia:', error);
      return false;
    }
  }
  
  /**
   * Gets the integration status for a doctor
   * @param doctorId The ID of the doctor
   * @returns Integration status
   */
  async getIntegrationStatus(doctorId: string): Promise<any> {
    const { data, error } = await supabase
      .from('calendar_integrations')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('provider', this.CALENDAR_TYPE)
      .maybeSingle();
    
    if (error) {
      throw new Error(`Failed to get integration status: ${error.message}`);
    }
    
    if (!data) {
      return {
        connected: false,
        status: 'not_configured'
      };
    }
    
    return {
      connected: data.status === 'active' && data.provider_data?.connected,
      status: data.status,
      lastSynced: data.provider_data?.last_synced,
      username: data.provider_data?.username
    };
  }
}

export default new DoctoraliaIntegrationService();