/**
 * Psychological support templates for mental health assistance
 * Culturally sensitive for Mexican population
 */

export interface PsychologicalTemplate {
  condition: string;
  severity: 'leve' | 'moderado' | 'severo';
  initialValidation: string;
  copingStrategies: string[];
  professionalReferral: ProfessionalReferralInfo;
  crisisProtocol?: CrisisInfo;
  culturalConsiderations: string[];
  followUpQuestions: string[];
}

export interface ProfessionalReferralInfo {
  when: string;
  options: string[];
  urgency: 'routine' | 'soon' | 'urgent';
}

export interface CrisisInfo {
  warningSignsSuicidio: string[];
  crisisHotlines: string[];
  immediateActions: string[];
}

export class PsychologicalResponseTemplates {
  private static templates: Map<string, PsychologicalTemplate[]> = new Map([
    ['ansiedad', [
      {
        condition: 'ansiedad',
        severity: 'leve',
        initialValidation: 'Entiendo que la ansiedad puede ser muy difícil. Es valiente de tu parte buscar ayuda.',
        copingStrategies: [
          'Respiración 4-7-8: Inhala 4 seg, mantén 7 seg, exhala 8 seg. Repite 4 veces.',
          'Técnica 5-4-3-2-1: Nombra 5 cosas que ves, 4 que tocas, 3 que oyes, 2 que hueles, 1 que saboreas.',
          'Camina 10-15 minutos al aire libre, preferiblemente en la mañana.',
          'Escribe 3 preocupaciones y 1 acción pequeña para cada una.',
          'Limita cafeína: máximo 2 tazas de café antes de mediodía.'
        ],
        professionalReferral: {
          when: 'Si los síntomas persisten más de 2 semanas o interfieren con tu vida diaria',
          options: [
            'Psicólogo en tu clínica IMSS (gratuito con cita)',
            'Terapia en línea: Terapify, Selia (desde $400 MXN/sesión)',
            'Grupos de apoyo: AMANC, grupos en parroquias locales'
          ],
          urgency: 'routine'
        },
        culturalConsiderations: [
          'Es normal sentir que "los nervios" afectan el estómago.',
          'Hablar de ansiedad no es debilidad, es cuidar tu salud.',
          'Muchos mexicanos encuentran alivio en actividades comunitarias.'
        ],
        followUpQuestions: [
          '¿Hace cuánto tiempo te sientes así?',
          '¿Hay algo específico que detone tu ansiedad?',
          '¿Cómo está tu sueño?',
          '¿Has notado cambios en tu apetito?'
        ]
      },
      {
        condition: 'ansiedad',
        severity: 'severo',
        initialValidation: 'Veo que estás pasando por algo muy difícil. Estoy aquí para ayudarte a encontrar apoyo.',
        copingStrategies: [
          'TÉCNICA DE EMERGENCIA: Siéntate, pon los pies en el piso, respira lentamente.',
          'Llama a alguien de confianza AHORA, no estés solo/a.',
          'Si sientes que no puedes respirar: es ansiedad, no te va a pasar nada físico.',
          'Coloca hielo en las muñecas o cara para "resetear" el sistema nervioso.'
        ],
        professionalReferral: {
          when: 'Necesitas apoyo profesional lo antes posible',
          options: [
            'Urgencias psiquiátricas IMSS/ISSSTE (24 horas)',
            'Hospital Psiquiátrico Fray Bernardino: 55 5573 1500',
            'Línea de la Vida: 800 911 2000 (gratuita, 24/7)'
          ],
          urgency: 'urgent'
        },
        crisisProtocol: {
          warningSignsSuicidio: [
            'Pensamientos de hacerte daño',
            'Sentir que otros estarían mejor sin ti',
            'Planear cómo terminar con tu vida',
            'Regalar pertenencias importantes'
          ],
          crisisHotlines: [
            'Línea de la Vida: 800 911 2000',
            'SAPTEL: 55 5259 8121',
            'WhatsApp SAPTEL: 55 4170 3225',
            '911 para emergencias'
          ],
          immediateActions: [
            'NO te quedes solo/a',
            'Aléjate de medios para hacerte daño',
            'Llama a las líneas de crisis AHORA',
            'Ve a urgencias del hospital más cercano'
          ]
        },
        culturalConsiderations: [
          'Tu vida tiene valor, aunque ahora no lo sientas.',
          'Buscar ayuda es un acto de valentía, no de debilidad.',
          'Muchas personas han salido de esto, tú también puedes.'
        ],
        followUpQuestions: [
          '¿Estás teniendo pensamientos de hacerte daño?',
          '¿Tienes a alguien contigo en este momento?',
          '¿Has tomado algún medicamento o sustancia?'
        ]
      }
    ]],
    
    ['depresion', [
      {
        condition: 'depresion',
        severity: 'moderado',
        initialValidation: 'La tristeza profunda es real y no es tu culpa. Me alegra que busques apoyo.',
        copingStrategies: [
          'Rutina básica: Levántate a la misma hora, aunque no tengas ganas.',
          'Una tarea al día: Solo una, por pequeña que sea (bañarte cuenta).',
          'Luz solar: 15 minutos diarios, aunque sea por la ventana.',
          'Contacto humano: Un mensaje o llamada al día a alguien.',
          'Registro de ánimo: Anota del 1-10 cómo te sientes cada noche.'
        ],
        professionalReferral: {
          when: 'La depresión responde muy bien al tratamiento profesional',
          options: [
            'Psiquiatra IMSS: Puede recetar antidepresivos si son necesarios',
            'Psicoterapia: Cognitivo-conductual muy efectiva para depresión',
            'Grupos de apoyo: Neuróticos Anónimos (gratuito)',
            'Apps: Yana (chat bot gratuito en español)'
          ],
          urgency: 'soon'
        },
        culturalConsiderations: [
          'La depresión no es "flojera" ni "falta de voluntad".',
          'Los antidepresivos no son "drogas" ni causan adicción.',
          'Está bien no estar bien, muchos mexicanos viven con depresión.',
          'Tu familia puede no entender al principio, pero hay profesionales que sí.'
        ],
        followUpQuestions: [
          '¿Desde cuándo te sientes así?',
          '¿Has perdido interés en cosas que antes disfrutabas?',
          '¿Cómo están tu sueño y apetito?',
          '¿Has pensado en hacerte daño?'
        ]
      }
    ]],
    
    ['estres', [
      {
        condition: 'estres',
        severity: 'leve',
        initialValidation: 'El estrés es la respuesta natural a las demandas de la vida. Veamos cómo manejarlo mejor.',
        copingStrategies: [
          'Técnica Pomodoro: Trabaja 25 min, descansa 5. Cada 4 ciclos, descansa 15.',
          'Lista de 3: Cada día, solo 3 tareas principales. El resto puede esperar.',
          'Tiempo "no negociable" para ti: 30 min diarios sin celular ni obligaciones.',
          'Ejercicio: Aunque sean 10 minutos de estiramiento en casa.',
          'Hidratación: El estrés deshidrata. 8 vasos de agua al día.'
        ],
        professionalReferral: {
          when: 'Si el estrés afecta tu salud física o relaciones',
          options: [
            'Talleres de manejo de estrés en centros comunitarios',
            'Yoga o meditación: Muchas clases gratuitas en YouTube',
            'Consulta con psicólogo organizacional si es estrés laboral'
          ],
          urgency: 'routine'
        },
        culturalConsiderations: [
          'En México valoramos el trabajo duro, pero el descanso también es productivo.',
          'Decir "no" a compromisos extras no es ser mal educado, es autocuidado.',
          'El "no tengo tiempo" muchas veces significa "no es mi prioridad", y está bien.'
        ],
        followUpQuestions: [
          '¿Qué situaciones específicas te estresan más?',
          '¿Has notado síntomas físicos (dolor de cabeza, estómago)?',
          '¿Cómo está tu calidad de sueño?',
          '¿Tienes apoyo en casa o trabajo?'
        ]
      }
    ]],
    
    ['trauma', [
      {
        condition: 'trauma',
        severity: 'moderado',
        initialValidation: 'Has pasado por algo muy difícil. Tu dolor es válido y mereces sanar.',
        copingStrategies: [
          'Técnica de anclaje: Toca 3 objetos y describe su textura para volver al presente.',
          'Lugar seguro mental: Imagina en detalle un lugar donde te sientas seguro/a.',
          'Rutinas predecibles: El trauma altera la seguridad, las rutinas la restauran.',
          'Arte o escritura: Expresa sin palabras lo que sientes.',
          'Movimiento suave: Yoga, tai chi, caminar conscientemente.'
        ],
        professionalReferral: {
          when: 'El trauma requiere apoyo especializado para sanar',
          options: [
            'Terapia EMDR: Muy efectiva para trauma (busca terapeutas certificados)',
            'ADIVAC: Apoyo especializado en violencia (55 5682 7969)',
            'CAVI: Centros de Atención a Víctimas (gratuito)',
            'Terapia somática: Trabaja el trauma almacenado en el cuerpo'
          ],
          urgency: 'soon'
        },
        culturalConsiderations: [
          'En nuestra cultura a veces minimizamos el trauma. Tu experiencia es válida.',
          'Sanar no significa olvidar ni perdonar, significa recuperar tu paz.',
          'Muchos mexicanos cargan traumas generacionales. Romper el ciclo es valiente.'
        ],
        followUpQuestions: [
          '¿Tienes recuerdos intrusivos o pesadillas?',
          '¿Evitas lugares o situaciones que te recuerdan lo sucedido?',
          '¿Te sientes seguro/a en este momento?',
          '¿Tienes una red de apoyo?'
        ]
      }
    ]]
  ]);

  /**
   * Get appropriate template based on condition and severity
   */
  static getTemplate(condition: string, severity: 'leve' | 'moderado' | 'severo'): PsychologicalTemplate | null {
    const conditionLower = condition.toLowerCase();
    
    // Check for keywords that might indicate psychological issues
    const conditionMap: Record<string, string> = {
      'nervios': 'ansiedad',
      'nervioso': 'ansiedad',
      'preocupado': 'ansiedad',
      'angustia': 'ansiedad',
      'pánico': 'ansiedad',
      'triste': 'depresion',
      'deprimido': 'depresion',
      'sin ganas': 'depresion',
      'sin ánimo': 'depresion',
      'cansado': 'estres',
      'agotado': 'estres',
      'presionado': 'estres',
      'trauma': 'trauma',
      'abuso': 'trauma',
      'violencia': 'trauma'
    };
    
    // Find matching condition
    let mappedCondition = conditionLower;
    for (const [keyword, condition] of Object.entries(conditionMap)) {
      if (conditionLower.includes(keyword)) {
        mappedCondition = condition;
        break;
      }
    }
    
    const templates = this.templates.get(mappedCondition);
    if (!templates) return null;
    
    return templates.find(t => t.severity === severity) || templates[0];
  }

  /**
   * Generate compassionate response from template
   */
  static generateResponse(template: PsychologicalTemplate): string {
    const parts: string[] = [];
    
    // Initial validation
    parts.push(template.initialValidation);
    parts.push('\n');
    
    // Coping strategies
    parts.push('**Estrategias que puedes intentar ahora:**');
    template.copingStrategies.forEach((strategy, index) => {
      parts.push(`${index + 1}. ${strategy}`);
    });
    
    // Professional referral
    parts.push('\n**Apoyo profesional:**');
    parts.push(template.professionalReferral.when);
    parts.push('Opciones disponibles:');
    template.professionalReferral.options.forEach(option => {
      parts.push(`• ${option}`);
    });
    
    // Crisis protocol if applicable
    if (template.crisisProtocol) {
      parts.push('\n**🚨 IMPORTANTE - Señales de crisis:**');
      template.crisisProtocol.warningSignsSuicidio.forEach(sign => {
        parts.push(`• ${sign}`);
      });
      parts.push('\n**📞 Líneas de ayuda 24/7:**');
      template.crisisProtocol.crisisHotlines.forEach(hotline => {
        parts.push(`• ${hotline}`);
      });
    }
    
    // Cultural considerations
    parts.push('\n**Recuerda:**');
    template.culturalConsiderations.forEach(consideration => {
      parts.push(`• ${consideration}`);
    });
    
    return parts.join('\n');
  }

  /**
   * Get follow-up questions for psychological assessment
   */
  static getFollowUpQuestions(condition: string): string[] {
    const template = this.getTemplate(condition, 'leve');
    return template?.followUpQuestions || [
      '¿Cómo te has sentido últimamente?',
      '¿Desde cuándo experimentas estos síntomas?',
      '¿Has buscado ayuda profesional antes?',
      '¿Qué has intentado para sentirte mejor?'
    ];
  }

  /**
   * Detect if message indicates psychological distress
   */
  static detectPsychologicalNeed(message: string): {
    detected: boolean;
    condition: string | null;
    severity: 'leve' | 'moderado' | 'severo';
    confidence: number;
  } {
    const lowerMessage = message.toLowerCase();
    
    // Keywords indicating psychological issues
    const severeKeywords = [
      'suicidio', 'morir', 'quitarme la vida', 'no vale la pena',
      'acabar con todo', 'ya no puedo más', 'mejor muerto'
    ];
    
    const moderateKeywords = [
      'depresión', 'ansiedad', 'pánico', 'no puedo dormir',
      'llorar', 'sin esperanza', 'muy triste', 'muy nervioso'
    ];
    
    const mildKeywords = [
      'estresado', 'preocupado', 'nervioso', 'cansado',
      'agobiado', 'triste', 'ansioso', 'mal emocionalmente'
    ];
    
    // Check severity
    for (const keyword of severeKeywords) {
      if (lowerMessage.includes(keyword)) {
        return {
          detected: true,
          condition: 'crisis',
          severity: 'severo',
          confidence: 0.9
        };
      }
    }
    
    for (const keyword of moderateKeywords) {
      if (lowerMessage.includes(keyword)) {
        return {
          detected: true,
          condition: this.inferCondition(lowerMessage),
          severity: 'moderado',
          confidence: 0.7
        };
      }
    }
    
    for (const keyword of mildKeywords) {
      if (lowerMessage.includes(keyword)) {
        return {
          detected: true,
          condition: this.inferCondition(lowerMessage),
          severity: 'leve',
          confidence: 0.5
        };
      }
    }
    
    return {
      detected: false,
      condition: null,
      severity: 'leve',
      confidence: 0
    };
  }

  /**
   * Infer specific condition from message
   */
  private static inferCondition(message: string): string {
    if (message.includes('nervios') || message.includes('pánico')) return 'ansiedad';
    if (message.includes('triste') || message.includes('depre')) return 'depresion';
    if (message.includes('estres') || message.includes('agobio')) return 'estres';
    if (message.includes('trauma') || message.includes('pasado')) return 'trauma';
    return 'ansiedad'; // Default to anxiety as most common
  }
}