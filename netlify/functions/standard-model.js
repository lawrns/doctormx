// Import OpenAI package with destructuring to get the OpenAI class
console.log('Loading OpenAI SDK...');
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
console.log('Standard model function loading...');

// Environment variables for Supabase and OpenAI
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oxlbametpfubwnrmrbsv.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bGJhbWV0cGZ1Ynducm1yYnN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MjAxNjQsImV4cCI6MjA1NjE5NjE2NH0.H2_4ueekh5HVvdXBw7OX_EKWEO26kehXBRfd5HJvjgA';

// Hardcoded OpenAI API key as fallback - ENSURE THIS IS THE CORRECT KEY FORMAT
const HARDCODED_KEY = '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';
const openaiKey = process.env.OPENAI_API_KEY || HARDCODED_KEY;

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

  console.log('Received request to standard-model endpoint');
  
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
        openai = new OpenAI({ apiKey: openaiKey });
        console.log('Successfully instantiated OpenAI client');
      } catch (clientError) {
        console.error('Error creating OpenAI client:', clientError);
        // Create a simple stub instead
        openai = {
          chat: {
            completions: {
              create: async () => ({
                choices: [
                  {
                    message: {
                      content: `Error creating OpenAI client: ${clientError.message}. This is a fallback response.`
                    }
                  }
                ]
              })
            }
          }
        };
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
      
      console.log('Sending request to OpenAI with model: gpt-3.5-turbo');
      console.log('Messages count:', messages.length);
      
      // Use the standard method from the latest OpenAI SDK
      console.log('Using chat.completions.create method');
      console.log('Using API key starting with:', openaiKey.substring(0, 10));
      console.log('OpenAI client type:', typeof openai);
      console.log('OpenAI client properties:', Object.keys(openai || {}));
      console.log('OpenAI client has chat prop:', openai && 'chat' in openai);
      
      if (openai.chat) {
        console.log('OpenAI client chat type:', typeof openai.chat);
        console.log('OpenAI client chat properties:', Object.keys(openai.chat || {}));
        console.log('OpenAI client has completions:', openai.chat && 'completions' in openai.chat);
        
        if (openai.chat.completions) {
          console.log('OpenAI client completions type:', typeof openai.chat.completions);
          console.log('OpenAI client completions properties:', Object.keys(openai.chat.completions || {}));
          console.log('OpenAI client has create method:', openai.chat.completions && 'create' in openai.chat.completions);
        }
      }
      
      // Debug the environment variables
      console.log('Environment variables:');
      console.log('NODE_ENV:', process.env.NODE_ENV);
      console.log('OPENAI_API_KEY (masked):', process.env.OPENAI_API_KEY ? 
        `${process.env.OPENAI_API_KEY.substring(0, 10)}...${process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 5)}` : 'Not set');
      console.log('VITE_OPENAI_API_KEY set:', process.env.VITE_OPENAI_API_KEY ? 'Yes' : 'No');
      
      // Print all environment variables (except sensitive ones)
      console.log('All environment variables (names only):');
      console.log(Object.keys(process.env).filter(key => !key.toLowerCase().includes('key') && !key.toLowerCase().includes('secret')));
      
      // Check if we'd need to use a different approach
      if (openai && typeof openai.chat?.completions?.create !== 'function') {
        console.log('ERROR: openai.chat.completions.create is not a function!');
        console.log('Falling back to direct mock response');
        
        response = {
          choices: [{
            message: {
              content: `This is an emergency fallback response. Your OpenAI client appears broken.
              
              Debug info:
              OpenAI client type: ${typeof openai}
              Has chat: ${openai && 'chat' in openai}
              Has chat.completions: ${openai && openai.chat && 'completions' in openai.chat}
              Has create method: ${openai && openai.chat && openai.chat.completions && 'create' in openai.chat.completions}
              API key set: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}
              `
            }
          }]
        };
      } else {
        // Normal flow - use the proper API client
        response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: messages,
          temperature: 0.7
        });
      }
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
        model: 'gpt-3.5-turbo',
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