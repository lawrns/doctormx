import OpenAI from 'openai';

let client: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return client;
}

export interface MedicalImageAnalysis {
  imageType: string;
  findings: string[];
  confidence: number;
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  disclaimer: string;
}

export interface VisionAnalysisRequest {
  imageBase64: string;
  imageType: 'xray' | 'ct' | 'mri' | 'ultrasound' | 'lab_result' | 'skin' | 'general';
  patientAge?: number;
  patientGender?: string;
  symptoms?: string;
  medicalHistory?: string;
}

/**
 * Analyze medical images using GPT-4 Vision
 */
export async function analyzeMedicalImage(request: VisionAnalysisRequest): Promise<MedicalImageAnalysis> {
  try {
    const systemPrompt = getSystemPrompt(request.imageType);
    
    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this ${request.imageType} image. Patient age: ${request.patientAge || 'Not specified'}, Gender: ${request.patientGender || 'Not specified'}. Symptoms: ${request.symptoms || 'Not specified'}. Medical history: ${request.medicalHistory || 'Not specified'}.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${request.imageBase64}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.1
    });

    const analysis = parseVisionResponse(response.choices[0].message.content || '');
    return analysis;
  } catch (error) {
    console.error('Error analyzing medical image:', error);
    throw new Error('Error analyzing medical image');
  }
}

function getSystemPrompt(imageType: string): string {
  const basePrompt = `Eres un asistente médico especializado en análisis de imágenes médicas. Tu función es proporcionar una segunda opinión basada en evidencia visual.

IMPORTANTE: 
- NO proporcionas diagnósticos definitivos
- SIEMPRE recomiendas consulta con especialista
- Identificas hallazgos visibles y posibles anomalías
- Evalúas la urgencia de atención médica
- Incluyes disclaimers médicos apropiados

Formato de respuesta requerido:
FINDINGS: [lista de hallazgos observados]
CONFIDENCE: [porcentaje de confianza 0-100]
RECOMMENDATIONS: [recomendaciones específicas]
URGENCY: [low/medium/high/critical]
DISCLAIMER: [advertencia médica]`;

  switch (imageType) {
    case 'xray':
      return basePrompt + `

Especialización en radiografías:
- Identifica fracturas, dislocaciones
- Detecta opacidades pulmonares
- Evalúa densidad ósea
- Busca signos de infección
- Observa posición de dispositivos médicos`;

    case 'ct':
      return basePrompt + `

Especialización en tomografías:
- Analiza estructuras internas
- Detecta masas o lesiones
- Evalúa vasos sanguíneos
- Identifica inflamación
- Observa órganos específicos`;

    case 'mri':
      return basePrompt + `

Especialización en resonancia magnética:
- Analiza tejidos blandos
- Detecta lesiones cerebrales
- Evalúa articulaciones
- Identifica tumores
- Observa médula espinal`;

    case 'ultrasound':
      return basePrompt + `

Especialización en ultrasonidos:
- Evalúa órganos abdominales
- Detecta quistes o masas
- Observa flujo sanguíneo
- Identifica cálculos
- Evalúa embarazo`;

    case 'lab_result':
      return basePrompt + `

Especialización en resultados de laboratorio:
- Interpreta valores numéricos
- Identifica valores fuera de rango
- Evalúa tendencias
- Detecta patrones anormales
- Correlaciona con síntomas`;

    case 'skin':
      return basePrompt + `

Especialización en dermatología:
- Analiza lesiones cutáneas
- Detecta cambios en lunares
- Evalúa textura y color
- Identifica signos de inflamación
- Observa patrones de distribución`;

    default:
      return basePrompt;
  }
}

function parseVisionResponse(response: string): MedicalImageAnalysis {
  const lines = response.split('\n');
  let findings: string[] = [];
  let confidence = 0;
  let recommendations: string[] = [];
  let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let disclaimer = '';

  for (const line of lines) {
    if (line.startsWith('FINDINGS:')) {
      findings = line.replace('FINDINGS:', '').split(',').map(f => f.trim()).filter(f => f);
    } else if (line.startsWith('CONFIDENCE:')) {
      confidence = parseInt(line.replace('CONFIDENCE:', '').replace('%', '').trim()) || 0;
    } else if (line.startsWith('RECOMMENDATIONS:')) {
      recommendations = line.replace('RECOMMENDATIONS:', '').split(',').map(r => r.trim()).filter(r => r);
    } else if (line.startsWith('URGENCY:')) {
      const urgencyText = line.replace('URGENCY:', '').trim().toLowerCase();
      if (['low', 'medium', 'high', 'critical'].includes(urgencyText)) {
        urgency = urgencyText as 'low' | 'medium' | 'high' | 'critical';
      }
    } else if (line.startsWith('DISCLAIMER:')) {
      disclaimer = line.replace('DISCLAIMER:', '').trim();
    }
  }

  return {
    imageType: 'general',
    findings,
    confidence,
    recommendations,
    urgency,
    disclaimer: disclaimer || 'Esta es una segunda opinión basada en análisis de imagen. Siempre consulte con un médico especialista para diagnóstico definitivo.'
  };
}

/**
 * Get specialized analysis for specific image types
 */
export async function getSpecializedAnalysis(
  imageBase64: string, 
  imageType: string, 
  specialty: string
): Promise<MedicalImageAnalysis> {
  const specialtyPrompts = {
    'cardiologia': 'Analiza específicamente el corazón, vasos sanguíneos, y signos de enfermedad cardiovascular.',
    'neumologia': 'Enfócate en pulmones, vías respiratorias, y signos de enfermedad pulmonar.',
    'ortopedia': 'Analiza huesos, articulaciones, y signos de trauma o enfermedad ósea.',
    'neurologia': 'Evalúa cerebro, médula espinal, y signos de enfermedad neurológica.',
    'dermatologia': 'Analiza piel, lunares, y signos de enfermedad dermatológica.',
    'ginecologia': 'Evalúa órganos reproductivos femeninos y signos de enfermedad ginecológica.',
    'urologia': 'Analiza riñones, vejiga, y signos de enfermedad urológica.',
    'gastroenterologia': 'Evalúa tracto digestivo y signos de enfermedad gastrointestinal.'
  };

  const specialtyPrompt = specialtyPrompts[specialty.toLowerCase()] || '';

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Eres un especialista en ${specialty}. ${specialtyPrompt} Proporciona análisis detallado y específico para tu especialidad.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analiza esta imagen desde la perspectiva de ${specialty}.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.1
    });

    return parseVisionResponse(response.choices[0].message.content || '');
  } catch (error) {
    console.error('Error in specialized analysis:', error);
    throw new Error('Error in specialized analysis');
  }
}

/**
 * Compare multiple images for progression analysis
 */
export async function compareImages(
  images: { base64: string; date: string; description?: string }[],
  imageType: string
): Promise<{
  progression: string;
  changes: string[];
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
}> {
  try {
    const imageMessages = images.map((img, index) => ({
      type: "text" as const,
      text: `Imagen ${index + 1} (${img.date}): ${img.description || 'Sin descripción'}`
    }));

    const imageUrls = images.map(img => ({
      type: "image_url" as const,
      image_url: {
        url: `data:image/jpeg;base64,${img.base64}`,
        detail: "high" as const
      }
    }));

    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Eres un especialista en análisis de progresión de imágenes médicas. Compara las imágenes proporcionadas y identifica cambios, mejoras, o empeoramiento.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Compara estas ${images.length} imágenes de ${imageType} tomadas en diferentes fechas. Identifica cambios significativos.`
            },
            ...imageMessages,
            ...imageUrls
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.1
    });

    return parseComparisonResponse(response.choices[0].message.content || '');
  } catch (error) {
    console.error('Error comparing images:', error);
    throw new Error('Error comparing images');
  }
}

function parseComparisonResponse(response: string): {
  progression: string;
  changes: string[];
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
} {
  const lines = response.split('\n');
  let progression = '';
  let changes: string[] = [];
  let recommendations: string[] = [];
  let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';

  for (const line of lines) {
    if (line.startsWith('PROGRESSION:')) {
      progression = line.replace('PROGRESSION:', '').trim();
    } else if (line.startsWith('CHANGES:')) {
      changes = line.replace('CHANGES:', '').split(',').map(c => c.trim()).filter(c => c);
    } else if (line.startsWith('RECOMMENDATIONS:')) {
      recommendations = line.replace('RECOMMENDATIONS:', '').split(',').map(r => r.trim()).filter(r => r);
    } else if (line.startsWith('URGENCY:')) {
      const urgencyText = line.replace('URGENCY:', '').trim().toLowerCase();
      if (['low', 'medium', 'high', 'critical'].includes(urgencyText)) {
        urgency = urgencyText as 'low' | 'medium' | 'high' | 'critical';
      }
    }
  }

  return {
    progression: progression || 'No se detectaron cambios significativos',
    changes,
    recommendations,
    urgency
  };
}
