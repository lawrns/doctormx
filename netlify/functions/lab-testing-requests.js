// netlify/functions/lab-testing-requests.js
// Handles creation and retrieval of lab test requests and appointments

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async function(event) {
  try {
    const method = event.httpMethod;
    
    // Get request by ID
    if (method === 'GET') {
      const params = event.queryStringParameters || {};
      const { id, patient_id } = params;
      
      if (!id && !patient_id) {
        return { 
          statusCode: 400, 
          body: JSON.stringify({ error: 'Missing id or patient_id parameter' }) 
        };
      }
      
      let query = supabase
        .from('lab_test_requests')
        .select(`
          id,
          status,
          instructions,
          special_requirements,
          created_at,
          payment_status,
          total_amount,
          lab_test_request_items(
            id,
            test_id,
            price_at_order,
            lab_tests(
              code,
              name,
              description
            )
          ),
          lab_appointments(
            id,
            appointment_date,
            appointment_time,
            address,
            status,
            notes
          )
        `);
      
      if (id) {
        query = query.eq('id', id).single();
      } else if (patient_id) {
        query = query.eq('patient_id', patient_id).order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching lab test request:', error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to fetch lab test request' })
        };
      }
      
      if (!data) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Lab test request not found' })
        };
      }
      
      return {
        statusCode: 200,
        body: JSON.stringify(data)
      };
    } 
    // Create a new lab test request
    else if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { tests, instructions, special_requirements, patient_id } = body;
      
      if (!tests || !Array.isArray(tests) || tests.length === 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Tests are required and must be an array' })
        };
      }
      
      if (!patient_id) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Patient ID is required' })
        };
      }
      
      // Start a transaction to create the request and test items
      const { data: request, error: requestError } = await supabase
        .from('lab_test_requests')
        .insert({
          patient_id,
          status: 'pending',
          instructions,
          special_requirements,
          payment_status: 'pending'
        })
        .select()
        .single();
      
      if (requestError) {
        console.error('Error creating lab test request:', requestError);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to create lab test request' })
        };
      }
      
      // Get the selected tests with prices
      const { data: testData, error: testsError } = await supabase
        .from('lab_tests')
        .select('id, price')
        .in('id', tests);
      
      if (testsError || !testData) {
        console.error('Error fetching test prices:', testsError);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to fetch test prices' })
        };
      }
      
      // Calculate total amount
      const totalAmount = testData.reduce((sum, test) => sum + parseFloat(test.price), 0);
      
      // Update the request with the total amount
      const { error: updateError } = await supabase
        .from('lab_test_requests')
        .update({ total_amount: totalAmount })
        .eq('id', request.id);
        
      if (updateError) {
        console.error('Error updating total amount:', updateError);
      }
      
      // Create test items
      const testItems = testData.map(test => ({
        request_id: request.id,
        test_id: test.id,
        price_at_order: test.price
      }));
      
      const { error: itemsError } = await supabase
        .from('lab_test_request_items')
        .insert(testItems);
      
      if (itemsError) {
        console.error('Error creating test items:', itemsError);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to create test items' })
        };
      }
      
      // Return the created request
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          id: request.id,
          status: request.status,
          total_amount: totalAmount
        })
      };
    } 
    // Create a new appointment for a request
    else if (method === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      const { request_id, date, time, address, lat, lng } = body;
      
      if (!request_id || !date || !time || !address) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Request ID, date, time, and address are required' })
        };
      }
      
      // Check if request exists
      const { data: request, error: requestError } = await supabase
        .from('lab_test_requests')
        .select('id, status')
        .eq('id', request_id)
        .single();
      
      if (requestError || !request) {
        console.error('Error fetching lab test request:', requestError);
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Lab test request not found' })
        };
      }
      
      // Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('lab_appointments')
        .insert({
          request_id,
          appointment_date: date,
          appointment_time: time,
          address,
          lat,
          lng,
          status: 'scheduled'
        })
        .select()
        .single();
      
      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to create appointment' })
        };
      }
      
      // Update request status
      const { error: updateError } = await supabase
        .from('lab_test_requests')
        .update({ status: 'scheduled' })
        .eq('id', request_id);
      
      if (updateError) {
        console.error('Error updating request status:', updateError);
      }
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          id: appointment.id,
          request_id: appointment.request_id,
          date: appointment.appointment_date,
          time: appointment.appointment_time,
          status: appointment.status
        })
      };
    } else {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
  } catch (error) {
    console.error('Error in lab-testing-requests:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};