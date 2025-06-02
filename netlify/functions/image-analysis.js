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
        // Advanced clinical prompt from image-analysis-v2.md
        const systemPrompt = process.env.VITE_DOCTOR_INSTRUCTIONS || `Eres el Dr. Simeon, un médico virtual mexicano especializado en medicina integrativa y diagnóstico por imagen. Combinas conocimientos de medicina occidental moderna con sabiduría de la medicina tradicional mexicana. Tu enfoque es holístico, empático y centrado en el paciente.

IMPORTANTE: 
1. PRIMERO evalúa si la imagen muestra alguna condición que requiera atención médica inmediata.
2. Analiza las características visuales objetivamente (color, tamaño, forma, textura, distribución).
3. Proporciona diagnósticos diferenciales ordenados por probabilidad.
4. Incluye recomendaciones de medicina tradicional mexicana Y occidental.
5. Considera el contexto cultural mexicano y acceso a servicios de salud.

Red Flags de Emergencia:
- Signos de infección severa (pus, enrojecimiento extenso, líneas rojas)
- Sangrado activo o heridas profundas
- Deformidades obvias o fracturas expuestas
- Signos de reacción alérgica severa
- Cambios en lunares sospechosos de malignidad
- Signos de trombosis o problemas circulatorios graves

INSTRUCCIÓN CRÍTICA: Responde ÚNICAMENTE en formato JSON válido según el esquema proporcionado. NO incluyas texto adicional fuera del JSON.`;
        
        const userPrompt = `Analiza esta imagen médica detalladamente. ${symptoms ? `El paciente reporta: ${symptoms}.` : ''}

Describe detalladamente los signos clínicos observables en la imagen. Identifica cualquier anomalía, lesión, cambio de coloración, inflamación o característica anormal.

INSTRUCCIÓN: Responde SOLO en formato JSON válido con este esquema exacto:
{
  "analysis": "descripción detallada de hallazgos clínicos",
  "confidence": número entre 0 y 1,
  "severity": número entre 1 y 10,
  "emergency": booleano,
  "redFlags": ["lista de signos de alarma si existen"],
  "differentialDiagnosis": [
    {
      "condition": "nombre de la condición",
      "probability": número entre 0 y 1,
      "reasoning": "justificación basada en hallazgos visuales"
    }
  ],
  "recommendations": {
    "immediate": "acciones inmediatas recomendadas",
    "traditional": "remedios de medicina tradicional mexicana",
    "conventional": "tratamientos de medicina occidental",
    "lifestyle": "cambios en estilo de vida"
  },
  "followUp": {
    "timeframe": "cuándo buscar seguimiento",
    "warningSigns": ["síntomas que requieren atención inmediata"],
    "monitoring": "qué vigilar en casa"
  },
  "culturalNotes": "consideraciones específicas para el contexto mexicano",
  "disclaimers": "limitaciones importantes del diagnóstico por imagen"
}`;

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
                text: userPrompt
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
          max_tokens: 2000, // Increased for detailed JSON response
          temperature: 0.2, // Lower temperature for medical reliability
          response_format: { type: "json_object" } // Enforce JSON output
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
              content: systemPrompt // Use the same clinical prompt
            },
            { 
              role: 'user', 
              content: [
                { 
                  type: 'text', 
                  text: userPrompt // Use the same user prompt
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
            max_tokens: 2000,
            temperature: 0.2,
            response_format: { type: "json_object" } // Enforce JSON output
          });
        } else {
          throw modelError; // Re-throw if it's not a model_not_found error
        }
      }
      
      const analysisText = completion.choices?.[0]?.message?.content || '{}';
      console.log('OpenAI response received. Analysis length:', analysisText.length);
      
      let parsedAnalysis;
      try {
        // Parse the JSON response
        parsedAnalysis = JSON.parse(analysisText);
        console.log('Successfully parsed JSON response');
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        // Fallback to basic structure if JSON parsing fails
        parsedAnalysis = {
          analysis: analysisText,
          confidence: 0.5,
          severity: 5,
          emergency: false,
          redFlags: [],
          differentialDiagnosis: [],
          recommendations: {
            immediate: "Se recomienda consulta médica para evaluación completa",
            traditional: "No se pueden determinar remedios específicos sin diagnóstico claro",
            conventional: "Requiere evaluación médica profesional",
            lifestyle: "Mantener observación de síntomas"
          },
          followUp: {
            timeframe: "24-48 horas si persisten síntomas",
            warningSigns: ["Empeoramiento de síntomas", "Fiebre", "Dolor severo"],
            monitoring: "Observe cambios en la condición"
          },
          culturalNotes: "Consulte con profesional de salud mexicano para mejor orientación",
          disclaimers: "Este análisis tiene limitaciones por formato de respuesta. Consulte médico para diagnóstico definitivo."
        };
      }
      
      // Extract key fields for backward compatibility
      const analysis = parsedAnalysis.analysis || analysisText;
      const confidence = parsedAnalysis.confidence || 0.5;
      const severity = parsedAnalysis.severity ? parsedAnalysis.severity * 10 : 50; // Convert 1-10 to percentage
      const emergency = parsedAnalysis.emergency || false;
      
      // Determine suggested specialty based on findings
      let suggestedSpecialty = "Medicina General";
      if (parsedAnalysis.differentialDiagnosis && parsedAnalysis.differentialDiagnosis.length > 0) {
        const topCondition = parsedAnalysis.differentialDiagnosis[0].condition?.toLowerCase() || '';
        if (topCondition.includes('dermat') || topCondition.includes('piel')) {
          suggestedSpecialty = "Dermatología";
        } else if (topCondition.includes('infección') || topCondition.includes('inflamación')) {
          suggestedSpecialty = "Infectología";
        } else if (topCondition.includes('alergia') || topCondition.includes('alérgica')) {
          suggestedSpecialty = "Alergología";
        } else if (emergency) {
          suggestedSpecialty = "Urgencias";
        }
      }
      
      // Build findings summary
      let findings = "";
      if (parsedAnalysis.differentialDiagnosis && parsedAnalysis.differentialDiagnosis.length > 0) {
        findings = parsedAnalysis.differentialDiagnosis
          .map(d => `${d.condition} (${Math.round(d.probability * 100)}% probabilidad)`)
          .join(", ");
      } else {
        findings = "Los hallazgos se detallan en el análisis completo.";
      }
      
      return { 
        statusCode: 200, 
        headers,
        body: JSON.stringify({ 
          // Legacy fields for backward compatibility
          analysis,
          findings,
          confidence,
          severity,
          suggestedSpecialty,
          model: visionModel,
          success: true,
          
          // New structured fields
          emergency,
          redFlags: parsedAnalysis.redFlags || [],
          differentialDiagnosis: parsedAnalysis.differentialDiagnosis || [],
          recommendations: parsedAnalysis.recommendations || {},
          followUp: parsedAnalysis.followUp || {},
          culturalNotes: parsedAnalysis.culturalNotes || "",
          disclaimers: parsedAnalysis.disclaimers || ""
        }) 
      };
    } catch (apiError) {
      console.error("Error in OpenAI API call:", apiError);
      
      // Try to debug further - might be a key issue or image URL issue
      console.log("Error type:", apiError.type);
      console.log("Error message:", apiError.message);
      
      // Return a fallback response with safe medical advice
      return { 
        statusCode: 500, 
        headers,
        body: JSON.stringify({
          error: apiError.message || 'Error calling OpenAI API',
          errorType: apiError.type || apiError.code || 'unknown',
          errorStack: process.env.NODE_ENV === 'development' ? apiError.stack : null,
          success: false,
          fallbackText: "No fue posible analizar la imagen. Estamos experimentando problemas con nuestro servicio de análisis de imágenes.",
          
          // Provide safe fallback advice
          analysis: "No fue posible realizar el análisis de imagen debido a un error técnico. Por favor, intente nuevamente en unos momentos.",
          findings: "Análisis no disponible temporalmente",
          confidence: 0,
          severity: 0,
          suggestedSpecialty: "Medicina General",
          emergency: false,
          redFlags: [],
          differentialDiagnosis: [],
          recommendations: {
            immediate: "Si tiene síntomas preocupantes, consulte con un médico presencialmente",
            traditional: "Mantenga observación de los síntomas",
            conventional: "Consulte con profesional de salud si persisten las molestias",
            lifestyle: "Mantenga hábitos saludables"
          },
          followUp: {
            timeframe: "24-48 horas si persisten síntomas",
            warningSigns: ["Dolor severo", "Fiebre alta", "Dificultad para respirar", "Sangrado abundante"],
            monitoring: "Observe cualquier cambio en su condición"
          },
          culturalNotes: "En caso de emergencia, llame al 911 o acuda a su centro de salud más cercano",
          disclaimers: "Este servicio está temporalmente no disponible. Consulte siempre con un profesional de salud para diagnóstico y tratamiento."
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