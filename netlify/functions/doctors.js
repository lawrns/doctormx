import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { specialty, search, available, location, sort = 'rating', limit = 1000, offset = 0 } = event.queryStringParameters || {};
    
    let query = supabase
      .from('doctors')
      .select(`
        *,
        users!inner(
          id,
          name,
          email,
          phone
        )
      `)
      .eq('license_status', 'verified');
    
    // Apply sorting
    switch (sort) {
      case 'rating':
        query = query.order('rating_avg', { ascending: false });
        break;
      case 'price':
        query = query.order('consultation_fees->base_fee', { ascending: true });
        break;
      case 'availability':
        query = query.order('response_time_avg', { ascending: true });
        break;
      case 'distance':
        query = query.order('created_at', { ascending: false });
        break;
      default:
        query = query.order('rating_avg', { ascending: false });
    }
    
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    
    if (specialty && specialty !== 'Todas las especialidades') {
      query = query.contains('specialties', [specialty]);
    }
    
    if (search) {
      query = query.or(`users.name.ilike.%${search}%,specialties.cs.{${search}}`);
    }
    
    if (location) {
      query = query.ilike('full_name', `%${location}%`);
    }
    
    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('doctors')
      .select('*', { count: 'exact', head: true })
      .eq('license_status', 'verified');
    
    const { data: doctors, error } = await query.limit(parseInt(limit));
    
    if (error) {
      console.error('Error fetching doctors:', error);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Error fetching doctors' }),
      };
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        doctors: doctors || [], 
        totalCount: totalCount || 0 
      }),
    };
  } catch (error) {
    console.error('Error in doctors endpoint:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
