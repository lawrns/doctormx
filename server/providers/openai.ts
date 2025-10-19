import OpenAI from 'openai';
import { retrieveMedicalContext, generateAugmentedPrompt } from './medicalKnowledgeBase';

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
  patientData
}: {
  history: { role: 'user' | 'assistant' | 'system'; content: string }[];
  redFlags: { triggered: boolean; action?: string; reasons: string[] };
  patientData?: {
    age?: number;
    sex?: string;
    specialty?: string;
  };
}) {
      const sys = `
                      Eres DoctorIA, un asistente médico especializado en telemedicina para México con capacidades avanzadas de diagnóstico diferencial y evaluación clínica. Tu función es proporcionar evaluaciones médicas preliminares, educación del paciente y recomendaciones de derivación cuando sea apropiado.

                      ## Información del Paciente
                      - Edad: ${patientData.age} años
                      - Sexo: ${patientData.sex}
                      - Ubicación: México

                      ## Formato y estilo
                      - Estructura tu respuesta en secciones claras con títulos descriptivos.
                      - Usa párrafos cortos y viñetas para facilitar la lectura.
                      - Español de México, tono profesional pero empático y accesible.
                      - Adapta el lenguaje al nivel de comprensión del paciente.

                      ## Principios fundamentales
                      - SEGURIDAD PRIMERO: Identifica inmediatamente cualquier bandera roja y prioriza la derivación urgente.
                      - EVALUACIÓN CLÍNICA: Proporciona evaluaciones médicas preliminares basadas en evidencia.
                      - EDUCACIÓN DEL PACIENTE: Explica condiciones, tratamientos y cuándo buscar atención médica.
                      - BASADO EN EVIDENCIA: Referencia guías clínicas mexicanas (NOM), internacionales (WHO, CDC) y literatura médica actualizada.
                      - TRANSPARENCIA: Si no tienes información suficiente, dilo claramente y recomienda evaluación médica.

                      ## Protocolo de Evaluación Avanzado
                      1) ANAMNESIS COMPLETA: 
                         - Síntomas principales con características detalladas
                         - Cronología y progresión temporal
                         - Factores precipitantes, agravantes y aliviantes
                         - Severidad usando escalas cuando sea apropiado
                      2) SINTOMAS ASOCIADOS: 
                         - Síntomas sistémicos relacionados
                         - Patrones de presentación
                         - Síntomas de alarma específicos
                      3) ANTECEDENTES RELEVANTES: 
                         - Historial médico, quirúrgico y familiar
                         - Medicamentos actuales y alergias
                         - Factores de riesgo específicos
                      4) EVALUACIÓN DE BANDERAS ROJAS: 
                         - Síntomas de emergencia médica
                         - Indicadores de gravedad
                         - Criterios de derivación urgente
                      5) DIAGNÓSTICO DIFERENCIAL ESTRUCTURADO: 
                         - Diagnóstico más probable con probabilidad estimada
                         - Diagnósticos alternativos ordenados por probabilidad
                         - Consideraciones especiales por edad y sexo
                      6) EVALUACIÓN DE RIESGO: 
                         - Análisis de riesgo-beneficio
                         - Consideraciones de seguridad
                         - Factores modificables
                      7) RECOMENDACIONES DE TRATAMIENTO EVIDENCE-BASED:
                         - Medicamentos por categoría con mecanismo de acción
                         - Dosis generales y consideraciones especiales
                         - Medidas no farmacológicas
                         - Cuidados domiciliarios específicos
                         - Monitoreo de efectos adversos
                      8) EDUCACIÓN DEL PACIENTE COMPREHENSIVA:
                         - Explicación patofisiológica simplificada
                         - Expectativas de evolución
                         - Signos de alarma específicos
                         - Cuándo y cómo buscar atención médica
                         - Referencias a guías clínicas mexicanas
                      9) DERIVACIÓN ESPECIALIZADA ESTRATIFICADA:
                         - Emergencias: Criterios específicos de derivación inmediata
                         - Urgente: Indicaciones de evaluación pronta
                         - Ambulatorio: Especialidad más apropiada con justificación
                         - Tiempo recomendado para derivación
                      10) SEGUIMIENTO ESTRUCTURADO:
                          - Cronograma de seguimiento
                          - Parámetros de monitoreo
                          - Criterios de reevaluación
                          - Indicadores de mejoría o empeoramiento

                      ## Referencias médicas mexicanas
                      - NOM-004-SSA3-2012 (Prescripción electrónica)
                      - NOM-024-SSA3-2012 (Telemedicina)
                      - Guías de práctica clínica del IMSS
                      - Protocolos de atención del ISSSTE
                      - Recomendaciones de la Secretaría de Salud

                      ## Manejo de medicamentos
                      - Menciona categorías de medicamentos, no nombres específicos
                      - Explica el propósito general de cada categoría
                      - Enfatiza que la prescripción requiere evaluación médica
                      - Incluye consideraciones de seguridad y contraindicaciones
                      - Menciona alternativas cuando sea apropiado

                      ## Comunicación culturalmente sensible
                      - Considera creencias y prácticas médicas tradicionales
                      - Respeta la autonomía del paciente
                      - Proporciona información en lenguaje claro
                      - Reconoce las limitaciones del sistema de salud mexicano
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

  const resp = await getClient().chat.completions.create({
    model: 'gpt-4-turbo',
    messages,
    tools,
    tool_choice: 'auto',
    max_tokens: 2000,
    temperature: 0.3
  });
  
  const choice = resp.choices[0];
  
  // Handle function calling response
  if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
    const toolCall = choice.message.tool_calls[0];
    if (toolCall.function.name === 'generate_medical_response') {
      const structuredResponse = JSON.parse(toolCall.function.arguments);
      
      // Format the structured response into a readable consultation
      let consultationText = `## Evaluación Médica\n\n`;
      
      consultationText += `**Evaluación Principal:** ${structuredResponse.diagnosis_assessment}\n\n`;
      
      if (structuredResponse.differential_diagnosis && structuredResponse.differential_diagnosis.length > 0) {
        consultationText += `**Diagnósticos Diferenciales:**\n`;
        structuredResponse.differential_diagnosis.forEach((dx: string, index: number) => {
          consultationText += `${index + 1}. ${dx}\n`;
        });
        consultationText += `\n`;
      }
      
      if (structuredResponse.red_flags && structuredResponse.red_flags.length > 0) {
        consultationText += `**⚠️ Banderas Rojas Identificadas:**\n`;
        structuredResponse.red_flags.forEach((flag: string) => {
          consultationText += `• ${flag}\n`;
        });
        consultationText += `\n`;
      }
      
      if (structuredResponse.treatment_recommendations && structuredResponse.treatment_recommendations.length > 0) {
        consultationText += `**Recomendaciones de Tratamiento:**\n`;
        structuredResponse.treatment_recommendations.forEach((rec: any) => {
          consultationText += `• **${rec.category}:** ${rec.purpose}\n`;
          if (rec.considerations) {
            consultationText += `  - Consideraciones: ${rec.considerations}\n`;
          }
        });
        consultationText += `\n`;
      }
      
      if (structuredResponse.referral_recommendation) {
        const ref = structuredResponse.referral_recommendation;
        consultationText += `**Recomendación de Derivación:**\n`;
        consultationText += `• **Urgencia:** ${ref.urgency === 'emergency' ? '🚨 Emergencia' : ref.urgency === 'urgent' ? '⚠️ Urgente' : '📅 Rutina'}\n`;
        consultationText += `• **Especialidad:** ${ref.specialty}\n`;
        consultationText += `• **Tiempo:** ${ref.timeframe}\n`;
        consultationText += `• **Razón:** ${ref.reasoning}\n\n`;
      }
      
      consultationText += `**Educación del Paciente:**\n${structuredResponse.patient_education}\n\n`;
      
      if (structuredResponse.follow_up) {
        const followUp = structuredResponse.follow_up;
        consultationText += `**Seguimiento:**\n`;
        consultationText += `• **Tiempo:** ${followUp.timeframe}\n`;
        if (followUp.indicators && followUp.indicators.length > 0) {
          consultationText += `• **Indicadores a observar:**\n`;
          followUp.indicators.forEach((indicator: string) => {
            consultationText += `  - ${indicator}\n`;
          });
        }
        if (followUp.actions && followUp.actions.length > 0) {
          consultationText += `• **Acciones recomendadas:**\n`;
          followUp.actions.forEach((action: string) => {
            consultationText += `  - ${action}\n`;
          });
        }
        consultationText += `\n`;
      }
      
      consultationText += `**Nivel de Confianza:** ${structuredResponse.confidence_level === 'high' ? 'Alto' : structuredResponse.confidence_level === 'medium' ? 'Medio' : 'Bajo'}\n\n`;
      
      consultationText += `---\n\n**⚠️ Importante:** Esta evaluación no sustituye una consulta médica presencial. Si experimentas síntomas graves o empeoramiento, busca atención médica inmediata.`;
      
      return consultationText;
    }
  }
  
  // Fallback to regular text response
  return choice.message.content || 'Lo siento, no pude generar una respuesta.';
}