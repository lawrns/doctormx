import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function handler(event, context) {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: '',
    };
  }

  try {
    if (event.httpMethod === 'POST') {
      const { doctorId, patientId, appointmentTime, appointmentDate, duration, type, notes, patientInfo } = JSON.parse(event.body);
      
      console.log('📅 Creating appointment booking:', { doctorId, appointmentTime, appointmentDate });
      
      // Check if slot is available
      const normalizedTime = appointmentTime.includes(':') && appointmentTime.split(':').length === 2 
        ? `${appointmentTime}:00` 
        : appointmentTime;
      
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('doctor_availability')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('date', appointmentDate)
        .eq('start_time', normalizedTime)
        .eq('is_available', true)
        .single();

      if (availabilityError || !availabilityData) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ error: 'El horario seleccionado no está disponible' }),
        };
      }

      // Create booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('appointment_bookings')
        .insert({
          doctor_id: doctorId,
          patient_id: patientId,
          availability_id: availabilityData.id,
          status: 'confirmed',
          notes: notes,
          consultation_fee: 500.00,
          payment_status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (bookingError) {
        console.error('Error creating booking:', bookingError);
        return {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ error: 'Error al crear la cita' }),
        };
      }

      // Mark slot as unavailable
      const { error: updateError } = await supabase
        .from('doctor_availability')
        .update({
          is_available: false,
          current_bookings: (availabilityData.current_bookings || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', availabilityData.id);

      if (updateError) {
        console.error('Error updating availability:', updateError);
        // Don't fail the request, booking was created successfully
      }

      console.log('✅ Appointment booking created:', bookingData.id);
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bookingData.id,
          doctorId: bookingData.doctor_id,
          patientId: bookingData.patient_id,
          appointmentTime: availabilityData.start_time,
          appointmentDate: availabilityData.date,
          duration: availabilityData.duration || 30,
          type: type || 'consultation',
          status: bookingData.status,
          notes: bookingData.notes,
          createdAt: bookingData.created_at,
          reminders: {
            email: true,
            whatsapp: true,
            sms: false
          }
        }),
      };
    }

    if (event.httpMethod === 'GET') {
      const { doctorId, date } = event.queryStringParameters || {};
      
      if (!doctorId || !date) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ error: 'doctorId and date are required' }),
        };
      }

      console.log('📅 Getting available slots:', { doctorId, date });
      
      const { data, error } = await supabase
        .from('doctor_availability')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('date', date)
        .eq('is_available', true)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error getting available slots:', error);
        return {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ error: 'Error al obtener horarios disponibles' }),
        };
      }

      const slots = (data || []).map(slot => ({
        id: slot.id,
        doctorId: slot.doctor_id,
        date: slot.date,
        timeSlot: slot.start_time,
        duration: slot.duration || 30,
        isAvailable: slot.is_available,
        bookingId: slot.booking_id
      }));

      console.log('✅ Available slots retrieved:', slots.length);
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slots),
      };
    }

    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };

  } catch (error) {
    console.error('❌ Error in booking function:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
    };
  }
}
