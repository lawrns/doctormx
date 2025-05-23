// Import OpenAI package with destructuring to get the OpenAI class
const { OpenAI } = require('openai');
console.log('Loaded OpenAI SDK');
console.log('typeof OpenAI:', typeof OpenAI); // Should log "function" if imported correctly

// Log startup information for debugging
console.log('Image analysis function loading...');

// Environment variable for OpenAI API key - use the same key from .env
const openaiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

if (!openaiKey) {
  console.error('❌ No OpenAI API key found in environment variables');
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('OPENAI')));
} else {
  // Log key information for debugging (mask most of it)
  console.log(`✅ Using OpenAI key: ${openaiKey.substring(0, 10)}...${openaiKey.substring(openaiKey.length - 5)}`);
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
  
  console.log('Received request to image-analysis endpoint');
  
  try {
    const { imageUrl, symptoms } = JSON.parse(event.body);
    
    if (!imageUrl) {
      return { 
        statusCode: 400, 
        headers,
        body: JSON.stringify({ error: 'Missing imageUrl' }) 
      };
    }
    
    // Check if we have a valid API key
    if (!openaiKey) {
      console.error('❌ No OpenAI API key available for image analysis');
      return { 
        statusCode: 500, 
        headers,
        body: JSON.stringify({ 
          error: 'OpenAI API key not configured',
          success: false,
          fallbackText: "No fue posible analizar la imagen. La clave API no está configurada."
        }) 
      };
    }
    
    // For debugging
    console.log("Image Analysis API key:", openaiKey ? "Key exists" : "Key missing");
    console.log("Image URL:", imageUrl?.substring(0, 50) + '...');
    console.log("Symptoms:", symptoms || 'None provided');
    
    let completion;
    // Create the OpenAI client - with destructured import, OpenAI should always be a constructor function
    console.log('Creating OpenAI instance with key');
    const openai = new OpenAI({ apiKey: openaiKey });
    
    try {
      console.log("Creating OpenAI client for vision model");
      
      // Try to use GPT-4o or Vision API based on configuration
      const useVisionAPI = process.env.VITE_USE_VISION_API === 'true';
      console.log(`Using ${useVisionAPI ? 'Vision API' : 'Standard API with markdown'}`);
      
      // For GPT-4 Vision API (multimodal format)
      if (useVisionAPI) {
        const messages = [
          { 
            role: 'system', 
            content: process.env.VITE_DOCTOR_INSTRUCTIONS || 'Eres un médico virtual compasivo y profesional. Proporciona un análisis de imágenes médicas.' 
          },
          { 
            role: 'user', 
            content: [
              { 
                type: 'text', 
                text: `Analiza la siguiente imagen médica y describe los hallazgos:${symptoms ? `\n\nSíntomas reportados: ${symptoms}` : ''}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                }
              }
            ]
          }
        ];
        
        console.log("Sending request to OpenAI vision model: gpt-4-vision-preview");
        completion = await openai.chat.completions.create({
          model: 'gpt-4-vision-preview',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7
        });
      } else {
        // Standard format (non-multimodal - using markdown)
        const messages = [
          { 
            role: 'system', 
            content: process.env.VITE_DOCTOR_INSTRUCTIONS || 'Eres un médico virtual compasivo y profesional. Proporciona un análisis de imágenes médicas.' 
          },
          { 
            role: 'user', 
            content: `Analiza la siguiente imagen y describe los hallazgos:\n\n![imagen](${imageUrl})${symptoms ? `\n\nSíntomas: ${symptoms}` : ''}` 
          }
        ];
        
        const model = process.env.VITE_IMAGE_ANALYSIS_MODEL || 'gpt-4o';
        console.log(`Sending request to OpenAI standard model: ${model}`);
        
        completion = await openai.chat.completions.create({
          model: model,
          messages: messages,
          temperature: 0.7
        });
      }
      
      const analysis = completion.choices?.[0]?.message?.content || '';
      console.log('OpenAI response received. Analysis length:', analysis.length);
      
      return { 
        statusCode: 200, 
        headers,
        body: JSON.stringify({ 
          analysis,
          findings: "Los hallazgos se integran en el análisis completo.",
          confidence: 0.85,
          severity: 40,
          suggestedSpecialty: "Medicina General",
          model: useVisionAPI ? 'gpt-4-vision-preview' : (process.env.VITE_IMAGE_ANALYSIS_MODEL || 'gpt-4o'),
          success: true
        }) 
      };
    } catch (apiError) {
      console.error("Error in OpenAI API call:", apiError);
      
      // Try to debug further - might be a key issue or image URL issue
      console.log("Error type:", apiError.type);
      console.log("Error message:", apiError.message);
      
      // Return a fallback response for testing with detailed error
      return { 
        statusCode: 500, 
        headers,
        body: JSON.stringify({
          error: apiError.message || 'Error calling OpenAI API',
          errorType: apiError.type || apiError.code || 'unknown',
          errorStack: process.env.NODE_ENV === 'development' ? apiError.stack : null,
          success: false,
          fallbackText: "No fue posible analizar la imagen. Estamos experimentando problemas con nuestro servicio de análisis de imágenes."
        }) 
      };
    }
  } catch (error) {
    console.error('Image analysis error:', error);
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Internal Error',
        errorDetails: error.toString(),
        success: false
      }) 
    };
  }
};