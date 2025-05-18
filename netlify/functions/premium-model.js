const OpenAIpkg = require('openai');
const OpenAI = OpenAIpkg.default || OpenAIpkg;
const { createClient } = require('@supabase/supabase-js');

// Log startup information for debugging
console.log('Premium model function loading...');

// Environment variables for Supabase and OpenAI
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Hardcoded OpenAI API key as fallback - ENSURE THIS IS THE CORRECT KEY FORMAT
const HARDCODED_KEY = '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';
const openaiKey = process.env.OPENAI_API_KEY || HARDCODED_KEY;

// Log key information for debugging (mask most of it)
console.log(`Using OpenAI key: ${openaiKey.substring(0, 10)}...${openaiKey.substring(openaiKey.length - 5)}`);

const defaultInstructions = process.env.VITE_DOCTOR_INSTRUCTIONS ||
  'Eres un médico virtual compasivo y profesional. Tu objetivo es ayudar a los pacientes a entender sus síntomas y brindarles orientación médica preliminar.';

// Initialize Supabase client (if needed for future enhancements)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

exports.handler = async function(event) {
  // Add CORS headers for development/testing
  const headers = {
    'Access-Control-Allow-Origin': '*', // Allow any origin - restrict this in production
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request (preflight CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  console.log('Received request to premium-model endpoint');
  
  let params;
  try {
    params = JSON.parse(event.body);
    console.log('Request params:', JSON.stringify(params).substring(0, 200) + '...');
  } catch (e) {
    console.error('JSON parse error:', e);
    return { 
      statusCode: 400, 
      headers,
      body: JSON.stringify({ error: 'Invalid JSON', details: e.message }) 
    };
  }

  const { message } = params;
  
  // Use fallback message if none provided
  const userMessage = message || 'Hola doctor, ¿cómo estás?';

  try {
    console.log('Creating OpenAI instance with key starting with:', openaiKey.substring(0, 7));
    const openai = new OpenAI({ apiKey: openaiKey });
    
    console.log('Sending request to OpenAI with model: gpt-4');
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: defaultInstructions },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7
    });
    
    const text = response.choices?.[0]?.message?.content || '';
    console.log('OpenAI response received. Length:', text.length);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        text,
        model: 'gpt-4',
        success: true
      })
    };
  } catch (error) {
    console.error('OpenAI error:', error);
    
    // Return a more detailed error for debugging
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Internal Error',
        errorType: error.type || error.code || 'unknown',
        errorStack: process.env.NODE_ENV === 'development' ? error.stack : null,
        success: false,
        fallbackText: "Estoy teniendo problemas con mi conexión a la base de conocimiento médico. Por favor intenta nuevamente en unos momentos."
      })
    };
  }
};