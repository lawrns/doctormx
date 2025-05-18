// netlify/functions/lab-testing-tests.js
// Returns a list of available lab tests from Supabase

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
    const { category } = params;
    
    let query = supabase
      .from('lab_tests')
      .select(`
        id, 
        code, 
        name, 
        description, 
        price, 
        instructions, 
        preparation_required,
        fast_required,
        fast_hours,
        processing_time_hours,
        lab_test_categories!inner(
          id,
          name
        )
      `)
      .eq('is_active', true);
    
    // Filter by category if provided
    if (category) {
      query = query.eq('lab_test_categories.name', category);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching lab tests:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to fetch lab tests' })
      };
    }
    
    // Format the response
    const formattedTests = data.map(test => ({
      id: test.id,
      code: test.code,
      name: test.name,
      description: test.description,
      price: test.price,
      instructions: test.instructions,
      preparationRequired: test.preparation_required,
      fastRequired: test.fast_required,
      fastHours: test.fast_hours,
      processingTimeHours: test.processing_time_hours,
      category: test.lab_test_categories.name
    }));
    
    return {
      statusCode: 200,
      body: JSON.stringify(formattedTests)
    };
  } catch (error) {
    console.error('Error fetching lab tests:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};