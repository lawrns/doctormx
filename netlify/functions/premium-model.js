// Import OpenAI package with destructuring to get the OpenAI class
console.log('Loading OpenAI SDK in premium-model function...');
// First log what's in the require cache for 'openai'
console.log('require.cache for openai:', Object.keys(require.cache).filter(key => key.includes('openai')));

// Try different import methods to see which works
let OpenAIDefault, OpenAIClass;
try {
  // Method 1: Import with destructuring
  const { OpenAI } = require('openai');
  OpenAIClass = OpenAI;
  console.log('Loaded OpenAI SDK with destructuring. typeof OpenAI:', typeof OpenAIClass);
} catch (err1) {
  console.error('Error loading with destructuring:', err1.message);
  
  try {
    // Method 2: Import default export
    OpenAIDefault = require('openai');
    console.log('Loaded OpenAI SDK as default. typeof:', typeof OpenAIDefault);
    console.log('OpenAIDefault keys:', Object.keys(OpenAIDefault));
    
    if (typeof OpenAIDefault === 'object' && OpenAIDefault.OpenAI) {
      OpenAIClass = OpenAIDefault.OpenAI;
      console.log('Using OpenAIDefault.OpenAI, typeof:', typeof OpenAIClass);
    } else if (typeof OpenAIDefault === 'function') {
      OpenAIClass = OpenAIDefault;
      console.log('Using OpenAIDefault directly as constructor');
    }
  } catch (err2) {
    console.error('Error loading as default:', err2.message);
  }
}

// Check what we ended up with
console.log('Final OpenAI class type:', typeof OpenAIClass);
console.log('Is OpenAI a constructor?', typeof OpenAIClass === 'function');

// Use the correct import approach based on what worked
const { OpenAI } = typeof OpenAIClass !== 'undefined' ? { OpenAI: OpenAIClass } : require('openai');
const { createClient } = require('@supabase/supabase-js');

// Log startup information for debugging
console.log('Premium model function loading...');

// Environment variables for Supabase and OpenAI
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oxlbametpfubwnrmrbsv.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bGJhbWV0cGZ1Ynducm1yYnN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MjAxNjQsImV4cCI6MjA1NjE5NjE2NH0.H2_4ueekh5HVvdXBw7OX_EKWEO26kehXBRfd5HJvjgA';

// Environment variable for OpenAI API key - REQUIRED
const openaiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

// Validate required environment variables
if (!openaiKey) {
  console.error('OPENAI_API_KEY environment variable is required but not provided');
  throw new Error('OPENAI_API_KEY environment variable is required');
}

if (!openaiKey.startsWith('sk-')) {
  console.error('Invalid OpenAI API key format');
  throw new Error('Invalid OpenAI API key format');
}

console.log('Environment validation passed - Premium API key configured correctly');

// Log all environment for debugging
console.log('Function environment:', {
  supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 10)}...` : 'undefined',
  supabaseAnonKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'undefined',
  openaiKey: openaiKey ? `${openaiKey.substring(0, 10)}...` : 'undefined'
});

const defaultInstructions = process.env.VITE_DOCTOR_INSTRUCTIONS ||
  'Eres un médico virtual compasivo y profesional. Tu objetivo es ayudar a los pacientes a entender sus síntomas y brindarles orientación médica preliminar.';

// Initialize Supabase client with hardcoded fallbacks
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Continue without Supabase - the function doesn't actually use it
}

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
    let response;
    
    try {
      // Create the OpenAI client - note the "new" keyword is crucial
      console.log('Creating OpenAI instance with key');
      
      // Check what we ended up with before trying to use it
      console.log('Is OpenAI a class that can be instantiated?', typeof OpenAI);
      
      // Add explicit error handling around client creation
      let openai;
      try {
        // With destructured import, OpenAI should always be a constructor function
        console.log('API KEY FORMAT CHECK BEFORE INSTANTIATION (premium model):');
        console.log('Key prefix:', openaiKey.substring(0, 7));
        console.log('Key length:', openaiKey.length);
        console.log('Key format valid:', openaiKey.startsWith('sk-') ? 'YES' : 'NO');
        console.log('Key appears to be SK Proj:', openaiKey.startsWith('sk-proj-') ? 'YES' : 'NO');
        
        openai = new OpenAI({ apiKey: openaiKey });
        console.log('Successfully instantiated OpenAI client');
      } catch (clientError) {
        console.error('ERROR CREATING OPENAI CLIENT (premium model):', clientError);
        console.error('Error name:', clientError.name);
        console.error('Error code:', clientError.code);
        console.error('Error type:', clientError.type);
        console.error('Error status:', clientError.status);
        console.error('Full error message:', clientError.message);
        console.error('Error stack trace:', clientError.stack);
        
        throw new Error('Failed to initialize OpenAI client: ' + clientError.message);
      }
      console.log('Using OpenAI client SDK');
      
      // Parse character profile and custom instructions if available
      let systemContent = defaultInstructions;
      let contextMessages = [];
      
      try {
        if (params.customInstructions) {
          systemContent = params.customInstructions;
          console.log('Using custom instructions from request');
        }
        
        if (params.history && Array.isArray(params.history)) {
          const history = params.history;
          console.log(`Adding ${history.length} messages from conversation history`);
          
          // Convert history array to OpenAI message format
          for (let i = 0; i < history.length; i++) {
            const role = i % 2 === 0 ? 'assistant' : 'user';
            contextMessages.push({ role, content: history[i] });
          }
        }
      } catch (parseError) {
        console.warn('Error parsing request context:', parseError);
        // Continue with default instructions
      }
      
      // Build messages array with system content first, then history if available
      const messages = [
        { role: 'system', content: systemContent },
        ...contextMessages
      ];
      
      // Always add the current user message last
      if (contextMessages.length === 0 || contextMessages[contextMessages.length - 1].role !== 'user') {
        messages.push({ role: 'user', content: userMessage });
      }
      
      console.log('Sending request to OpenAI with model: gpt-4');
      console.log('Messages count:', messages.length);
      
      // Use the standard method from the latest OpenAI SDK
      console.log('Using chat.completions.create method');
      response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: messages,
        temperature: 0.7
      });
    } catch (newApiError) {
      // If the new SDK approach fails, try legacy approach
      console.error('Error with new OpenAI SDK:', newApiError);
      throw new Error('OpenAI API error: ' + newApiError.message);
    }
    
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