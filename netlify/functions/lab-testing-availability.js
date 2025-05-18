// netlify/functions/lab-testing-availability.js
// Returns availability slots for lab technicians

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async function(event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  try {
    const params = event.queryStringParameters || {};
    const { zipCode, latitude, longitude } = params;
    
    // In a real implementation, we would:
    // 1. Query for lab technicians in the area
    // 2. Check their schedules for availability
    // 3. Return available time slots
    
    // For now, we'll generate mock availability for the next 7 days
    const today = new Date();
    const availability = [];
    
    // Generate time slots between 8am and 6pm, every hour
    const timeSlots = [];
    for (let hour = 8; hour <= 18; hour++) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    
    // Generate availability for the next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const isoDate = date.toISOString().split('T')[0];
      
      // Weekend days have fewer slots
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const daySlots = isWeekend ? 
        timeSlots.filter(slot => {
          const hour = parseInt(slot.split(':')[0]);
          return hour >= 9 && hour <= 14; // 9am to 2pm on weekends
        }) : 
        timeSlots;
      
      availability.push({
        date: isoDate,
        slots: daySlots,
        isWeekend
      });
    }
    
    // In a real implementation, we would fetch technicians and their schedule from Supabase
    // Here's how that would look:
    /*
    const { data: technicians, error } = await supabase
      .from('lab_technicians')
      .select('*')
      .eq('is_active', true)
      .filter('service_areas', 'cs', `{"${zipCode}"}`)
      .limit(10);
      
    if (error) {
      throw error;
    }
    
    // Then query appointments to find available slots
    // ... (implementation details)
    */
    
    return {
      statusCode: 200,
      body: JSON.stringify(availability)
    };
  } catch (error) {
    console.error('Error fetching availability:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};