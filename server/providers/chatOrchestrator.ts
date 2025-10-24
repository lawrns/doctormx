import { ChatResponseV2, ConversationStage, ConversationMemory } from '../types/chat';
import { doctorReply } from './openai';

/**
 * Determine next conversation stage based on current stage and response content
 */
function determineNextStage(
  currentStage: ConversationStage,
  historyLength: number,
  content: string
): ConversationStage {
  // Stage progression logic
  if (currentStage === 'intake' && historyLength >= 1) {
    return 'clarify';
  }
  
  if (currentStage === 'clarify' && historyLength >= 3) {
    return 'assess_severity';
  }
  
  if (currentStage === 'assess_severity' && historyLength >= 4) {
    return 'recommendations';
  }
  
  if (currentStage === 'recommendations' && historyLength >= 5) {
    return 'actions';
  }
  
  if (currentStage === 'actions' && historyLength >= 6) {
    return 'wrap_up';
  }
  
  return currentStage;
}

/**
 * Generate chips based on conversation stage
 */
function generateChipsForStage(stage: ConversationStage, hasSpecialty: boolean): any[] {
  const chips = [];
  
  // Always available
  chips.push({
    id: 'ask_follow_up',
    label: 'Otra pregunta',
    action: 'ask_follow_up',
    icon: 'ask_follow_up',
    variant: 'secondary'
  });
  
  // Stage-specific chips
  if (stage === 'clarify' || stage === 'assess_severity') {
    chips.push({
      id: 'severity_check',
      label: 'Evaluar urgencia',
      action: 'severity_check',
      icon: 'severity_check',
      variant: 'primary'
    });
  }
  
  if (stage === 'recommendations' || stage === 'actions') {
    if (hasSpecialty) {
      chips.push({
        id: 'find_specialist',
        label: 'Buscar doctor',
        action: 'find_specialist',
        icon: 'find_specialist',
        variant: 'primary'
      });
    }
    
    chips.push({
      id: 'book_appointment',
      label: 'Agendar cita',
      action: 'book_appointment',
      icon: 'book_appointment',
      variant: 'secondary'
    });
  }
  
  if (stage === 'wrap_up') {
    chips.push({
      id: 'save_conversation',
      label: 'Guardar chat',
      action: 'save_conversation',
      icon: 'save_conversation',
      variant: 'secondary'
    });
    
    chips.push({
      id: 'share_with_doctor',
      label: 'Compartir',
      action: 'share_with_doctor',
      icon: 'share_with_doctor',
      variant: 'secondary'
    });
  }
  
  return chips;
}

/**
 * Generate forms based on missing required fields
 */
function generateFormsForStage(stage: ConversationStage, memory: ConversationMemory): any[] {
  const forms = [];
  
  if (stage === 'assess_severity' && !memory.collected_fields.severity) {
    forms.push({
      id: 'severity_form',
      type: 'severity',
      label: 'Nivel de urgencia',
      required: true
    });
  }
  
  if (stage === 'clarify' && !memory.collected_fields.duration) {
    forms.push({
      id: 'duration_form',
      type: 'duration',
      label: 'Duración de síntomas',
      required: true
    });
  }
  
  if (stage === 'actions' && !memory.collected_fields.specialty && memory.recommended_specialty) {
    forms.push({
      id: 'specialty_form',
      type: 'specialty',
      label: 'Especialidad',
      required: false
    });
  }
  
  return forms;
}

/**
 * Main orchestrator function - generates Schema v2 response
 */
export async function orchestrateChatResponse({
  message,
  history,
  memory,
  patientData,
  userId
}: {
  message: string;
  history: Array<{ role: string; content: string }>;
  memory: ConversationMemory;
  patientData?: any;
  userId?: string;
}): Promise<ChatResponseV2> {
  
  // Determine conversation stage
  const currentStage = memory.stage || 'intake';
  const nextStage = determineNextStage(currentStage, history.length, message);
  
  // Generate AI response
  const aiReply = await doctorReply({
    history,
    redFlags: { triggered: false, reasons: [] },
    patientData,
    conversationStage: currentStage as any
  });
  
  // Extract severity from response
  const severityMatch = aiReply.match(/leve|moderado|serio|urgente|emergencia/gi);
  let severity: 'green' | 'yellow' | 'orange' | 'red' = 'green';
  if (severityMatch) {
    const match = severityMatch[0].toLowerCase();
    if (match.includes('urgente') || match.includes('emergencia')) severity = 'red';
    else if (match.includes('serio')) severity = 'orange';
    else if (match.includes('moderado')) severity = 'yellow';
  }
  
  // Extract specialty
  const specialtyMatch = aiReply.match(/especialista en ([A-Za-záéíóúÁÉÍÓÚñÑ\s]+)|referir a ([A-Za-záéíóúÁÉÍÓÚñÑ\s]+)/i);
  const recommendedSpecialty = specialtyMatch ? (specialtyMatch[1] || specialtyMatch[2]).trim() : null;
  
  // Check for prescription recommendations
  const hasPrescription = /receta|medicamento|fármaco|prescripción/i.test(aiReply);
  const recommendations = hasPrescription ? {
    prescription: {
      available: true,
      items: ['Medicamentos según diagnóstico'],
      note: 'Seguir indicaciones del médico'
    }
  } : undefined;
  
  // Generate chips and forms
  const chips = generateChipsForStage(nextStage, !!recommendedSpecialty);
  const forms = generateFormsForStage(nextStage, memory);
  
  // Build Schema v2 response
  const response: ChatResponseV2 = {
    reply: aiReply,
    next_state: nextStage,
    severity,
    recommended_specialty: recommendedSpecialty,
    recommendations,
    chips,
    forms,
    followups: [
      '¿Hay algo más que necesites saber?',
      '¿Te gustaría más información sobre este tema?'
    ]
  };
  
  return response;
}

