// Import OpenAI package with destructuring to get the OpenAI class
const { OpenAI } = require('openai');
console.log('Loaded OpenAI SDK');
console.log('typeof OpenAI:', typeof OpenAI); // Should log "function" if imported correctly

// Log startup information for debugging
console.log('Image analysis function loading...');

// Environment variable for OpenAI API key - use the same key from .env
const openaiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

// Vision model to use - default to gpt-4o-mini if not specified
const visionModel = process.env.VISION_MODEL || process.env.VITE_VISION_MODEL || 'gpt-4o-mini';

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
      
      // All vision-enabled models now use the same format for image inputs
      console.log(`Using Vision API with model: ${visionModel}`);
      
      try {
        const systemPrompt = process.env.VITE_DOCTOR_INSTRUCTIONS || 
          'You are analyzing facial features for wellness assessment. Describe observable characteristics like skin tone, facial symmetry, visible fatigue indicators, and general appearance. Focus on wellness observations rather than medical diagnosis.';
        
        const messages = [
          { 
            role: 'system', 
            content: systemPrompt
          },
          { 
            role: 'user', 
            content: [
              { 
                type: 'text', 
                text: symptoms ? 
                  `Please describe the observable wellness indicators in this facial image. The person reports: ${symptoms}. Focus on visible characteristics like skin appearance, facial balance, signs of rest or fatigue, and general wellness indicators.` : 
                  'Please describe the observable wellness indicators in this facial image. Focus on visible characteristics like skin appearance, facial balance, signs of rest or fatigue, and general wellness indicators.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ];
        
        console.log(`Sending request to OpenAI vision model: ${visionModel}`);
        completion = await openai.chat.completions.create({
          model: visionModel,
          messages: messages,
          max_tokens: 1000,
          temperature: 0.2 // Lower temperature for medical reliability
        });
      } catch (modelError) {
        // Graceful fallback for future deprecations
        if (modelError.code === 'model_not_found') {
          console.log(`Model ${visionModel} not found, falling back to gpt-4o`);
          // Retry with gpt-4o as fallback
          const fallbackModel = 'gpt-4o';
          
          const messages = [
            { 
              role: 'system', 
              content: process.env.VITE_DOCTOR_INSTRUCTIONS || 'You are analyzing facial features for wellness assessment. Describe observable characteristics like skin tone, facial symmetry, visible fatigue indicators, and general appearance. Focus on wellness observations rather than medical diagnosis.'
            },
            { 
              role: 'user', 
              content: [
                { 
                  type: 'text', 
                  text: symptoms ? 
                    `Please describe the observable wellness indicators in this facial image. The person reports: ${symptoms}. Focus on visible characteristics like skin appearance, facial balance, signs of rest or fatigue, and general wellness indicators.` : 
                    'Please describe the observable wellness indicators in this facial image. Focus on visible characteristics like skin appearance, facial balance, signs of rest or fatigue, and general wellness indicators.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl
                  }
                }
              ]
            }
          ];
          
          console.log(`Retrying with fallback model: ${fallbackModel}`);
          completion = await openai.chat.completions.create({
            model: fallbackModel,
            messages: messages,
            max_tokens: 1000,
            temperature: 0.2
          });
        } else {
          throw modelError; // Re-throw if it's not a model_not_found error
        }
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
          model: visionModel,
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