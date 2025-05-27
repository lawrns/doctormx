/**
 * Medical response templates for high-quality, specific medical advice
 * Focused on Mexican healthcare context
 */

export interface MedicalTemplate {
  symptom: string;
  severity: 'leve' | 'moderado' | 'severo';
  immediateActions: string[];
  medications: MedicationInfo[];
  warningSignsUrgengia: string[];
  homeRemedies?: string[];
  followUpTimeframe: string;
  costConsiderations?: CostInfo;
}

export interface MedicationInfo {
  name: string;
  genericName?: string;
  dose: string;
  frequency: string;
  duration: string;
  contraindications?: string[];
  mexicanBrands?: string[];
  approximateCost?: string;
}

export interface CostInfo {
  imss: string;
  private: string;
  pharmacy: string;
}

export class MedicalResponseTemplates {
  private static templates: Map<string, MedicalTemplate[]> = new Map([
    ['dolor de cabeza', [
      {
        symptom: 'dolor de cabeza',
        severity: 'leve',
        immediateActions: [
          'Descansa en habitación oscura y silenciosa',
          'Aplica compresa fría en frente por 15 minutos',
          'Mantén hidratación constante (vaso de agua cada hora)'
        ],
        medications: [
          {
            name: 'Paracetamol',
            genericName: 'Acetaminofén',
            dose: '500mg',
            frequency: 'cada 6-8 horas',
            duration: 'máximo 3 días',
            mexicanBrands: ['Tempra', 'Tylenol', 'Panadol'],
            approximateCost: '$25-45 MXN'
          }
        ],
        warningSignsUrgengia: [
          'Dolor súbito "el peor de tu vida"',
          'Rigidez de cuello con fiebre',
          'Confusión o dificultad para hablar',
          'Visión doble o pérdida visual'
        ],
        homeRemedies: [
          'Té de manzanilla con miel',
          'Masaje suave en sienes con aceite de menta',
          'Inhalación de vapor con eucalipto'
        ],
        followUpTimeframe: 'Si no mejora en 48 horas',
        costConsiderations: {
          imss: 'Gratuito con receta médica',
          private: '$500-800 consulta',
          pharmacy: '$25-100 medicamentos'
        }
      },
      {
        symptom: 'dolor de cabeza',
        severity: 'severo',
        immediateActions: [
          'ACUDE A URGENCIAS si es súbito e intenso',
          'No conduzcas ni operes maquinaria',
          'Pide ayuda a un familiar'
        ],
        medications: [
          {
            name: 'Ketorolaco',
            dose: '10mg sublingual',
            frequency: 'dosis única',
            duration: 'solo emergencia',
            contraindications: ['Úlcera gástrica', 'Problemas renales'],
            mexicanBrands: ['Dolac', 'Toradol'],
            approximateCost: '$80-150 MXN'
          }
        ],
        warningSignsUrgengia: [
          'Pérdida de consciencia',
          'Convulsiones',
          'Debilidad en un lado del cuerpo',
          'Dolor tras golpe en cabeza'
        ],
        followUpTimeframe: 'URGENTE - Acude inmediatamente'
      }
    ]],
    
    ['fiebre', [
      {
        symptom: 'fiebre',
        severity: 'moderado',
        immediateActions: [
          'Mide temperatura cada 4 horas y registra',
          'Baño con agua tibia (no fría) si T>39°C',
          'Ropa ligera y ventilación adecuada',
          'Hidratación: 250ml agua cada hora despierto'
        ],
        medications: [
          {
            name: 'Paracetamol',
            dose: '500-1000mg',
            frequency: 'cada 6 horas',
            duration: 'mientras haya fiebre',
            mexicanBrands: ['Tempra', 'Tylenol'],
            approximateCost: '$25-45 MXN'
          },
          {
            name: 'Ibuprofeno',
            dose: '400mg',
            frequency: 'cada 8 horas',
            duration: 'máximo 5 días',
            contraindications: ['Dengue sospechoso', 'Problemas gástricos'],
            mexicanBrands: ['Advil', 'Motrin'],
            approximateCost: '$35-60 MXN'
          }
        ],
        warningSignsUrgengia: [
          'Temperatura >40°C persistente',
          'Convulsiones febriles',
          'Manchas rojas en piel (petequias)',
          'Dificultad respiratoria',
          'Alteración del estado mental'
        ],
        homeRemedies: [
          'Compresas tibias en frente y axilas',
          'Té de tila o manzanilla',
          'Caldo de pollo con verduras'
        ],
        followUpTimeframe: 'Si persiste >3 días o empeora'
      }
    ]],
    
    ['dolor abdominal', [
      {
        symptom: 'dolor abdominal',
        severity: 'leve',
        immediateActions: [
          'Dieta blanda: arroz, manzana cocida, pan tostado',
          'Evita lácteos, grasas y picante por 48h',
          'Pequeñas comidas frecuentes (6 al día)',
          'Reposo relativo después de comer'
        ],
        medications: [
          {
            name: 'Butilhioscina',
            genericName: 'Buscapina',
            dose: '10mg',
            frequency: 'cada 8 horas',
            duration: 'máximo 3 días',
            mexicanBrands: ['Buscapina', 'Buscapina Compositum'],
            approximateCost: '$90-140 MXN'
          },
          {
            name: 'Omeprazol',
            dose: '20mg',
            frequency: '1 vez al día antes del desayuno',
            duration: '14 días',
            mexicanBrands: ['Losec', 'Omeprazol genérico'],
            approximateCost: '$50-200 MXN'
          }
        ],
        warningSignsUrgengia: [
          'Dolor súbito e intenso',
          'Abdomen duro como tabla',
          'Vómito con sangre o café molido',
          'Heces negras o con sangre',
          'Fiebre alta con dolor'
        ],
        homeRemedies: [
          'Té de manzanilla después de comidas',
          'Compresa tibia en abdomen',
          'Infusión de hierbabuena'
        ],
        followUpTimeframe: 'Si no mejora en 24-48 horas'
      }
    ]],
    
    ['tos', [
      {
        symptom: 'tos',
        severity: 'leve',
        immediateActions: [
          'Hidratación tibia constante',
          'Evita cambios bruscos de temperatura',
          'No fumes ni expongas a humo',
          'Eleva cabecera al dormir 30°'
        ],
        medications: [
          {
            name: 'Dextrometorfano',
            dose: '15-30mg',
            frequency: 'cada 6-8 horas',
            duration: 'máximo 7 días',
            mexicanBrands: ['Robitussin DM', 'Bisolvon'],
            approximateCost: '$80-120 MXN',
            contraindications: ['Tos con flemas abundantes']
          },
          {
            name: 'Ambroxol',
            dose: '30mg',
            frequency: '3 veces al día',
            duration: '5-7 días',
            mexicanBrands: ['Mucosolvan', 'Axol'],
            approximateCost: '$60-100 MXN'
          }
        ],
        warningSignsUrgengia: [
          'Tos con sangre',
          'Dificultad respiratoria',
          'Dolor de pecho al toser',
          'Fiebre >3 días',
          'Silbidos al respirar'
        ],
        homeRemedies: [
          'Miel con limón (1 cucharada c/4h)',
          'Vaporizaciones con eucalipto',
          'Té de gordolobo o bugambilia'
        ],
        followUpTimeframe: 'Si persiste >2 semanas'
      }
    ]],
    
    ['presión alta', [
      {
        symptom: 'presión alta',
        severity: 'moderado',
        immediateActions: [
          'Siéntate y respira profundo 5 minutos',
          'Mide presión en 30 minutos nuevamente',
          'Evita sal el resto del día',
          'No hagas esfuerzos físicos'
        ],
        medications: [
          {
            name: 'Captopril',
            dose: '25mg sublingual',
            frequency: 'solo si PA >180/110',
            duration: 'dosis única emergencia',
            mexicanBrands: ['Capotena'],
            approximateCost: '$30-60 MXN',
            contraindications: ['Embarazo', 'Alergia a IECA']
          }
        ],
        warningSignsUrgengia: [
          'PA >180/120 persistente',
          'Dolor de pecho',
          'Dificultad para hablar',
          'Visión borrosa súbita',
          'Dolor de cabeza intenso'
        ],
        homeRemedies: [
          'Agua de jamaica sin azúcar',
          'Té de pasiflora',
          'Ajo crudo (1 diente diario)'
        ],
        followUpTimeframe: 'Control médico en 24-48h'
      }
    ]]
  ]);

  /**
   * Get appropriate template based on symptom and severity
   */
  static getTemplate(symptom: string, severity: 'leve' | 'moderado' | 'severo'): MedicalTemplate | null {
    const symptomLower = symptom.toLowerCase();
    
    // Find matching templates
    for (const [key, templates] of this.templates) {
      if (symptomLower.includes(key) || key.includes(symptomLower)) {
        return templates.find(t => t.severity === severity) || templates[0];
      }
    }
    
    return null;
  }

  /**
   * Generate structured response from template
   */
  static generateResponse(template: MedicalTemplate): string {
    const parts: string[] = [];
    
    // Immediate actions
    parts.push('**Qué hacer ahora:**');
    template.immediateActions.forEach((action, index) => {
      parts.push(`${index + 1}. ${action}`);
    });
    
    // Medications
    if (template.medications.length > 0) {
      parts.push('\n**Medicamentos recomendados:**');
      template.medications.forEach(med => {
        parts.push(`• ${med.name} ${med.dose} ${med.frequency} por ${med.duration}`);
        if (med.mexicanBrands) {
          parts.push(`  Marcas: ${med.mexicanBrands.join(', ')} (${med.approximateCost})`);
        }
        if (med.contraindications) {
          parts.push(`  ⚠️ NO usar si: ${med.contraindications.join(', ')}`);
        }
      });
    }
    
    // Warning signs
    parts.push('\n**🚨 Acude a URGENCIAS si presentas:**');
    template.warningSignsUrgengia.forEach(sign => {
      parts.push(`• ${sign}`);
    });
    
    // Home remedies
    if (template.homeRemedies && template.homeRemedies.length > 0) {
      parts.push('\n**Remedios caseros complementarios:**');
      template.homeRemedies.forEach(remedy => {
        parts.push(`• ${remedy}`);
      });
    }
    
    // Follow up
    parts.push(`\n**Seguimiento:** ${template.followUpTimeframe}`);
    
    // Cost info
    if (template.costConsiderations) {
      parts.push('\n**Costos aproximados:**');
      parts.push(`• IMSS: ${template.costConsiderations.imss}`);
      parts.push(`• Consulta privada: ${template.costConsiderations.private}`);
      parts.push(`• Farmacia: ${template.costConsiderations.pharmacy}`);
    }
    
    return parts.join('\n');
  }

  /**
   * Get quick symptom-specific questions
   */
  static getSymptomQuestions(symptom: string): string[] {
    const questions: Record<string, string[]> = {
      'dolor de cabeza': [
        '¿El dolor es pulsátil o constante?',
        '¿En qué parte de la cabeza duele?',
        '¿Cuándo comenzó exactamente?',
        '¿Has tomado algo para el dolor?'
      ],
      'fiebre': [
        '¿Cuánto marca el termómetro?',
        '¿Tienes escalofríos o sudoración?',
        '¿Hay otros síntomas además de fiebre?',
        '¿Alguien más en casa está enfermo?'
      ],
      'dolor abdominal': [
        '¿En qué parte del abdomen duele?',
        '¿El dolor es tipo cólico o constante?',
        '¿Cuándo fue tu última evacuación?',
        '¿Comiste algo inusual recientemente?'
      ],
      'tos': [
        '¿La tos es seca o con flemas?',
        '¿De qué color son las flemas?',
        '¿Empeora por la noche?',
        '¿Tienes fiebre o dolor de garganta?'
      ],
      'presión alta': [
        '¿Cuánto marcó el baumanómetro?',
        '¿Tomas medicamento para la presión?',
        '¿Has tenido dolor de cabeza o mareo?',
        '¿Consumiste sal o café hoy?'
      ]
    };
    
    const symptomLower = symptom.toLowerCase();
    for (const [key, qs] of Object.entries(questions)) {
      if (symptomLower.includes(key) || key.includes(symptomLower)) {
        return qs;
      }
    }
    
    return [
      '¿Desde cuándo tienes este síntoma?',
      '¿Qué lo mejora o empeora?',
      '¿Has tomado algún medicamento?',
      '¿Tienes otros síntomas?'
    ];
  }

  /**
   * Get medication alternatives for budget constraints
   */
  static getBudgetAlternatives(medication: string): string[] {
    const alternatives: Record<string, string[]> = {
      'paracetamol': [
        'Genérico del Ahorro: $15-20 MXN',
        'Similares: $18-25 MXN',
        'IMSS: Gratuito con receta'
      ],
      'ibuprofeno': [
        'Genérico: $20-30 MXN',
        'Similares: $25-35 MXN',
        'ISSSTE: Gratuito con receta'
      ],
      'omeprazol': [
        'Genérico: $30-40 MXN',
        'Similares: $35-45 MXN',
        'Seguro Popular: Cubierto'
      ]
    };
    
    return alternatives[medication.toLowerCase()] || ['Consulta opciones genéricas en tu farmacia'];
  }
}