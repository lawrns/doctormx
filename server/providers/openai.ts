import OpenAI from 'openai';
import { retrieveMedicalContext, generateAugmentedPrompt } from './medicalKnowledgeBase.ts';

let client: OpenAI;

function getClient() {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export async function doctorReply({
  history,
  redFlags,
  patientData,
  conversationStage = 'initial'
}: {
  history: { role: 'user' | 'assistant' | 'system'; content: string }[];
  redFlags: { triggered: boolean; action?: string; reasons: string[] };
  patientData?: {
    age?: number;
    sex?: string;
    specialty?: string;
  };
  conversationStage?: 'initial' | 'followup' | 'detailed' | 'referral';
}) {
      const sys = `
                      Eres DoctorIA, un asistente médico especializado en telemedicina para México. Tu función es proporcionar evaluaciones médicas preliminares de manera natural y conversacional, como un médico real.

                      ## Información del Paciente
                      - Edad: ${patientData?.age || 'No especificada'} años
                      - Sexo: ${patientData?.sex || 'No especificado'}
                      - Ubicación: México

                      ## Estilo de Comunicación
                      - Responde de manera natural y conversacional, como un médico real
                      - Haz preguntas específicas para obtener más información
                      - Usa un tono empático pero profesional
                      - Adapta la longitud de tu respuesta según la etapa de la conversación
                      - NO uses formato de secciones con títulos, responde como en una conversación real

                      ## Principios Fundamentales
                      - SEGURIDAD PRIMERO: Identifica banderas rojas y deriva urgentemente si es necesario
                      - EVALUACIÓN PROGRESIVA: Haz preguntas específicas para entender mejor la situación
                      - EDUCACIÓN CLARA: Explica de manera simple y comprensible
                      - TRANSPARENCIA: Si necesitas más información, dilo claramente

                      ## Etapas de Conversación
                      ${conversationStage === 'initial' ? `
                      - Responde brevemente (2-3 oraciones) reconociendo el problema
                      - Haz 1-2 preguntas específicas para obtener más información
                      - Mantén un tono empático y profesional
                      ` : conversationStage === 'followup' ? `
                      - Responde de manera más detallada basándote en la información adicional
                      - Proporciona una evaluación preliminar
                      - Haz preguntas de seguimiento si es necesario
                      ` : conversationStage === 'detailed' ? `
                      - Proporciona una evaluación más completa
                      - Incluye recomendaciones de tratamiento general
                      - Explica cuándo buscar atención médica
                      ` : `
                      - Proporciona recomendaciones específicas de derivación
                      - Explica la urgencia y especialidad recomendada
                      - Da instrucciones claras de seguimiento
                      `}

                      ## Manejo de Medicamentos
                      - Menciona categorías generales de medicamentos
                      - Explica el propósito de cada categoría
                      - Enfatiza que la prescripción requiere evaluación médica
                      - Incluye consideraciones de seguridad

                      ## Referencias Médicas
                      - NOM-004-SSA3-2012 (Prescripción electrónica)
                      - NOM-024-SSA3-2012 (Telemedicina)
                      - Guías clínicas mexicanas e internacionales

                      ## Comunicación Cultural
                      - Considera el contexto cultural mexicano
                      - Usa lenguaje claro y accesible
                      - Respeta las creencias del paciente
                      - Sugiere opciones accesibles cuando sea posible
                  `;


  
  const safety = redFlags.triggered
    ? `Se detectaron banderas rojas: ${redFlags.reasons.join('; ')}. Recomienda ER de inmediato y explica por qué.`
    : 'No hay banderas rojas detectadas hasta ahora. Evita prescribir y mantén cautela.';

  // Retrieve relevant medical context
  let augmentedSystemPrompt = sys + "\n\n" + safety;
  
  try {
    // Extract symptoms from the latest user message
    const latestUserMessage = history.filter(h => h.role === 'user').pop();
    if (latestUserMessage) {
      const medicalContext = await retrieveMedicalContext(latestUserMessage.content, patientData);
      if (medicalContext.documents.length > 0) {
        augmentedSystemPrompt = await generateAugmentedPrompt(sys + "\n\n" + safety, medicalContext);
      }
    }
  } catch (error) {
    console.error('Error retrieving medical context:', error);
    // Continue with original prompt if retrieval fails
  }
  
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: augmentedSystemPrompt },
    ...history.map(h => ({ role: h.role, content: h.content }))
  ];
  
  // Define function calling tools for structured medical responses
  const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
      type: 'function',
      function: {
        name: 'generate_medical_response',
        description: 'Generate a structured medical consultation response',
        parameters: {
          type: 'object',
          properties: {
            diagnosis_assessment: {
              type: 'string',
              description: 'Primary diagnostic assessment based on symptoms'
            },
            differential_diagnosis: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of possible differential diagnoses'
            },
            red_flags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Any red flags or concerning symptoms identified'
            },
            treatment_recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  purpose: { type: 'string' },
                  considerations: { type: 'string' }
                }
              },
              description: 'General treatment recommendations by category'
            },
            referral_recommendation: {
              type: 'object',
              properties: {
                urgency: { type: 'string', enum: ['emergency', 'urgent', 'routine'] },
                specialty: { type: 'string' },
                timeframe: { type: 'string' },
                reasoning: { type: 'string' }
              },
              description: 'Referral recommendation if needed'
            },
            patient_education: {
              type: 'string',
              description: 'Patient education and self-care instructions'
            },
            follow_up: {
              type: 'object',
              properties: {
                timeframe: { type: 'string' },
                indicators: { type: 'array', items: { type: 'string' } },
                actions: { type: 'array', items: { type: 'string' } }
              },
              description: 'Follow-up recommendations'
            },
            confidence_level: {
              type: 'string',
              enum: ['high', 'medium', 'low'],
              description: 'Confidence level in the assessment'
            }
          },
          required: ['diagnosis_assessment', 'treatment_recommendations', 'referral_recommendation', 'patient_education']
        }
      }
    }
  ];

  // Determine response length based on conversation stage
  const maxTokens = conversationStage === 'initial' ? 300 : 
                   conversationStage === 'followup' ? 600 : 
                   conversationStage === 'detailed' ? 1000 : 800;

  const resp = await getClient().chat.completions.create({
    model: 'gpt-4-turbo',
    messages,
    tools,
    tool_choice: 'auto',
    max_tokens: maxTokens,
    temperature: 0.3
  });
  
  const choice = resp.choices[0];
  
  // Handle function calling response
  if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
    const toolCall = choice.message.tool_calls[0];
    if (toolCall.function.name === 'generate_medical_response') {
      const structuredResponse = JSON.parse(toolCall.function.arguments);
      
      // Format the structured response into a natural conversation
      let consultationText = '';
      
      // Start with empathy and acknowledgment
      consultationText += `Entiendo tu preocupación. ${structuredResponse.diagnosis_assessment}`;
      
      // Add differential diagnosis if available
      if (structuredResponse.differential_diagnosis && structuredResponse.differential_diagnosis.length > 0) {
        consultationText += `\n\nBasándome en tus síntomas, las posibilidades más probables son: ${structuredResponse.differential_diagnosis.slice(0, 2).join(' o ')}.`;
      }
      
      // Handle red flags urgently
      if (structuredResponse.red_flags && structuredResponse.red_flags.length > 0) {
        consultationText += `\n\n⚠️ **IMPORTANTE:** He identificado algunos síntomas que requieren atención inmediata: ${structuredResponse.red_flags.join(', ')}. Te recomiendo acudir a urgencias lo antes posible.`;
      }
      
      // Add treatment recommendations naturally
      if (structuredResponse.treatment_recommendations && structuredResponse.treatment_recommendations.length > 0) {
        consultationText += `\n\nPara el manejo de tus síntomas, te sugiero considerar:`;
        structuredResponse.treatment_recommendations.forEach((rec: any) => {
          consultationText += `\n• ${rec.category}: ${rec.purpose}`;
          if (rec.considerations) {
            consultationText += ` (${rec.considerations})`;
          }
        });
      }
      
      // Add referral recommendation
      if (structuredResponse.referral_recommendation) {
        const ref = structuredResponse.referral_recommendation;
        if (ref.urgency === 'emergency') {
          consultationText += `\n\n🚨 **URGENTE:** Te recomiendo acudir a urgencias inmediatamente. ${ref.reasoning}`;
        } else if (ref.urgency === 'urgent') {
          consultationText += `\n\n⚠️ Te sugiero consultar con un ${ref.specialty} en las próximas 24-48 horas. ${ref.reasoning}`;
        } else {
          consultationText += `\n\nPara un seguimiento más detallado, te recomiendo consultar con un ${ref.specialty} en los próximos días.`;
        }
      }
      
      // Add patient education
      if (structuredResponse.patient_education) {
        consultationText += `\n\n${structuredResponse.patient_education}`;
      }
      
      // Add follow-up instructions
      if (structuredResponse.follow_up) {
        const followUp = structuredResponse.follow_up;
        consultationText += `\n\nPara el seguimiento, te sugiero:`;
        if (followUp.timeframe) {
          consultationText += `\n• Reevaluar en ${followUp.timeframe}`;
        }
        if (followUp.indicators && followUp.indicators.length > 0) {
          consultationText += `\n• Observar si: ${followUp.indicators.join(', ')}`;
        }
        if (followUp.actions && followUp.actions.length > 0) {
          consultationText += `\n• ${followUp.actions.join(', ')}`;
        }
      }
      
      // Add disclaimer
      consultationText += `\n\nRecuerda que esta es una evaluación preliminar. Si tus síntomas empeoran o tienes dudas, no dudes en buscar atención médica presencial.`;
      
      return consultationText;
    }
  }
  
  // Fallback to regular text response
  return choice.message.content || 'Lo siento, no pude generar una respuesta.';
}