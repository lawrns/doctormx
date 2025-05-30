/**
 * RedFlagDetectionService - Emergency and urgent condition detection for DoctorMX
 * Implements rule-based and AI-assisted detection of medical red flags
 */

import type { RedFlag, SymptomData } from '@pkg/types';

interface RedFlagRule {
  id: string;
  name: string;
  severity: 'emergency' | 'urgent' | 'warning';
  keywords: string[];
  patterns: RegExp[];
  combinations?: string[][]; // Symptom combinations that trigger
  ageSpecific?: {
    pediatric?: boolean; // Under 18
    geriatric?: boolean; // Over 65
  };
  timeFrame?: string; // When this is most relevant
  action: string;
  mexicanContext?: string; // Specific notes for Mexican healthcare context
}

export class RedFlagDetectionService {
  private static instance: RedFlagDetectionService;
  private redFlagRules: RedFlagRule[] = [];

  static getInstance(): RedFlagDetectionService {
    if (!RedFlagDetectionService.instance) {
      RedFlagDetectionService.instance = new RedFlagDetectionService();
      RedFlagDetectionService.instance.initializeRules();
    }
    return RedFlagDetectionService.instance;
  }

  private initializeRules(): void {
    this.redFlagRules = [
      // EMERGENCY RED FLAGS
      {
        id: 'chest_pain_emergency',
        name: 'Dolor torácico de emergencia',
        severity: 'emergency',
        keywords: ['dolor de pecho', 'dolor torácico', 'presión en el pecho', 'opresión torácica'],
        patterns: [
          /dolor.*pecho.*irrad/i,
          /presión.*pecho.*brazo/i,
          /dolor.*mandíbula.*pecho/i
        ],
        combinations: [
          ['dolor de pecho', 'falta de aire'],
          ['presión en el pecho', 'sudoración'],
          ['dolor torácico', 'náuseas']
        ],
        action: 'Llamar inmediatamente al 911 o acudir a urgencias. Posible infarto al miocardio.',
        mexicanContext: 'En México: 911 emergencias, Cruz Roja 065'
      },
      {
        id: 'severe_headache',
        name: 'Cefalea severa súbita',
        severity: 'emergency',
        keywords: ['dolor de cabeza severo', 'cefalea intensa', 'dolor de cabeza súbito'],
        patterns: [
          /dolor.*cabeza.*(peor|intenso|severo)/i,
          /cefalea.*(súbita|repentina)/i,
          /dolor.*cabeza.*rayos?/i
        ],
        combinations: [
          ['dolor de cabeza', 'vómito'],
          ['cefalea', 'visión borrosa'],
          ['dolor de cabeza', 'fiebre alta', 'rigidez de cuello']
        ],
        action: 'Atención médica inmediata. Posible hemorragia intracraneal o meningitis.',
        mexicanContext: 'Acudir inmediatamente al hospital más cercano'
      },
      {
        id: 'difficulty_breathing',
        name: 'Dificultad respiratoria severa',
        severity: 'emergency',
        keywords: ['no puedo respirar', 'falta de aire', 'dificultad para respirar', 'ahogo'],
        patterns: [
          /no.*puedo.*respirar/i,
          /falta.*aire.*(severa|intensa)/i,
          /me.*ahogo/i
        ],
        combinations: [
          ['falta de aire', 'dolor de pecho'],
          ['dificultad para respirar', 'hinchazón de piernas'],
          ['ahogo', 'tos con sangre']
        ],
        action: 'Emergencia médica. Llamar al 911 inmediatamente.',
        mexicanContext: 'Si está en altitud (CDMX): considerar edema pulmonar'
      },
      {
        id: 'severe_bleeding',
        name: 'Sangrado severo',
        severity: 'emergency',
        keywords: ['sangrado abundante', 'hemorragia', 'sangre', 'no para de sangrar'],
        patterns: [
          /sangr.*abund/i,
          /hemorragia/i,
          /sangr.*no.*para/i,
          /mucha.*sangre/i
        ],
        action: 'Control inmediato del sangrado y atención médica urgente.',
        mexicanContext: 'Aplicar presión directa mientras llega ayuda médica'
      },

      // URGENT RED FLAGS
      {
        id: 'high_fever_with_symptoms',
        name: 'Fiebre alta con síntomas graves',
        severity: 'urgent',
        keywords: ['fiebre alta', 'temperatura alta', 'calentura'],
        patterns: [
          /fiebre.*(alta|elevada)/i,
          /temperatura.*40/i,
          /calentura.*alta/i
        ],
        combinations: [
          ['fiebre', 'vómito', 'dolor abdominal'],
          ['fiebre alta', 'erupción'],
          ['fiebre', 'dolor de cabeza intenso']
        ],
        action: 'Atención médica en 24 horas. Monitorear temperatura y síntomas.',
        mexicanContext: 'En temporada de lluvias: considerar dengue, chikungunya'
      },
      {
        id: 'severe_abdominal_pain',
        name: 'Dolor abdominal severo',
        severity: 'urgent',
        keywords: ['dolor de estómago intenso', 'dolor abdominal severo', 'dolor de panza fuerte'],
        patterns: [
          /dolor.*abdom.*(intenso|severo|fuerte)/i,
          /dolor.*estómago.*(intenso|severo)/i,
          /dolor.*panza.*(fuerte|intenso)/i
        ],
        combinations: [
          ['dolor abdominal', 'vómito', 'fiebre'],
          ['dolor de estómago', 'no puede defecar'],
          ['dolor abdominal', 'hinchazón']
        ],
        action: 'Evaluación médica urgente. Posible apendicitis, obstrucción intestinal.',
        mexicanContext: 'No tomar antiinflamatorios antes de evaluación médica'
      },
      {
        id: 'neurological_symptoms',
        name: 'Síntomas neurológicos',
        severity: 'urgent',
        keywords: ['confusión', 'mareos severos', 'entumecimiento', 'debilidad en brazo'],
        patterns: [
          /confus(ión|o)/i,
          /mare.*sever/i,
          /entumec/i,
          /debilidad.*brazo/i,
          /no.*puedo.*mover/i
        ],
        combinations: [
          ['debilidad', 'entumecimiento'],
          ['confusión', 'dolor de cabeza'],
          ['mareos', 'visión borrosa']
        ],
        action: 'Evaluación neurológica urgente. Posible evento cerebrovascular.',
        mexicanContext: 'Aplicar escala FAST: Face, Arms, Speech, Time'
      },

      // WARNING FLAGS
      {
        id: 'persistent_cough',
        name: 'Tos persistente con síntomas',
        severity: 'warning',
        keywords: ['tos con sangre', 'tos persistente', 'tos seca continua'],
        patterns: [
          /tos.*sangre/i,
          /tos.*(persistente|continua)/i,
          /tos.*semanas/i
        ],
        combinations: [
          ['tos', 'pérdida de peso'],
          ['tos persistente', 'fiebre nocturna'],
          ['tos', 'fatiga extrema']
        ],
        action: 'Evaluación médica en 1-2 semanas. Descartar tuberculosis u otras causas.',
        mexicanContext: 'TB prevalente en algunas regiones de México'
      },
      {
        id: 'skin_changes',
        name: 'Cambios en la piel preocupantes',
        severity: 'warning',
        keywords: ['lunar cambió', 'mancha nueva', 'lunar que crece', 'lunar que sangra'],
        patterns: [
          /lunar.*(cambió|crece|sangra)/i,
          /mancha.*nueva/i,
          /piel.*nueva.*mancha/i
        ],
        action: 'Evaluación dermatológica en 2-4 semanas. Monitorear cambios.',
        mexicanContext: 'Protección solar importante en clima mexicano'
      },
      {
        id: 'unexplained_weight_loss',
        name: 'Pérdida de peso inexplicable',
        severity: 'warning',
        keywords: ['pérdida de peso', 'bajo de peso', 'perdiendo peso sin razón'],
        patterns: [
          /pérdida.*peso.*(sin.*razón|inexplicable)/i,
          /bajo.*peso.*(rápido|mucho)/i,
          /perdiendo.*peso.*sin.*hacer.*dieta/i
        ],
        combinations: [
          ['pérdida de peso', 'fatiga'],
          ['bajo de peso', 'falta de apetito'],
          ['pérdida de peso', 'sudoración nocturna']
        ],
        action: 'Evaluación médica para descartar causas subyacentes.',
        mexicanContext: 'Considerar diabetes, problemas tiroideos prevalentes'
      }
    ];
  }

  /**
   * Analyze text input for red flags
   */
  analyzeText(text: string, patientAge?: number): RedFlag[] {
    const detectedFlags: RedFlag[] = [];
    const lowercaseText = text.toLowerCase();

    for (const rule of this.redFlagRules) {
      let triggered = false;
      let triggerReason = '';

      // Check age specificity
      if (rule.ageSpecific) {
        if (rule.ageSpecific.pediatric && patientAge && patientAge >= 18) continue;
        if (rule.ageSpecific.geriatric && patientAge && patientAge < 65) continue;
      }

      // Check keywords
      for (const keyword of rule.keywords) {
        if (lowercaseText.includes(keyword.toLowerCase())) {
          triggered = true;
          triggerReason = `Keyword: ${keyword}`;
          break;
        }
      }

      // Check patterns
      if (!triggered) {
        for (const pattern of rule.patterns) {
          if (pattern.test(lowercaseText)) {
            triggered = true;
            triggerReason = `Pattern match`;
            break;
          }
        }
      }

      // Check combinations
      if (!triggered && rule.combinations) {
        for (const combination of rule.combinations) {
          const allPresent = combination.every(symptom => 
            lowercaseText.includes(symptom.toLowerCase())
          );
          if (allPresent) {
            triggered = true;
            triggerReason = `Combination: ${combination.join(' + ')}`;
            break;
          }
        }
      }

      if (triggered) {
        detectedFlags.push({
          type: rule.severity,
          description: `${rule.name}: ${triggerReason}`,
          action: rule.action,
          severity: this.mapSeverityToNumber(rule.severity)
        });
      }
    }

    // Sort by severity (emergency first)
    return detectedFlags.sort((a, b) => b.severity - a.severity);
  }

  /**
   * Analyze structured symptom data
   */
  analyzeSymptoms(symptoms: SymptomData[], patientAge?: number): RedFlag[] {
    const detectedFlags: RedFlag[] = [];

    // Convert symptoms to text for analysis
    const symptomText = symptoms.map(s => 
      `${s.name} ${s.description} severidad ${s.severity} duración ${s.duration} ${s.location || ''}`
    ).join(' ');

    const textFlags = this.analyzeText(symptomText, patientAge);
    detectedFlags.push(...textFlags);

    // Additional rule-based checks on structured data
    detectedFlags.push(...this.checkStructuredSymptoms(symptoms, patientAge));

    return this.deduplicateFlags(detectedFlags);
  }

  /**
   * Check structured symptoms for patterns
   */
  private checkStructuredSymptoms(symptoms: SymptomData[], patientAge?: number): RedFlag[] {
    const flags: RedFlag[] = [];

    // High severity symptoms
    const highSeveritySymptoms = symptoms.filter(s => s.severity >= 8);
    if (highSeveritySymptoms.length > 0) {
      const symptomNames = highSeveritySymptoms.map(s => s.name).join(', ');
      flags.push({
        type: 'urgent',
        description: `Síntomas de alta severidad detectados: ${symptomNames}`,
        action: 'Evaluación médica urgente debido a la intensidad de los síntomas',
        severity: 8
      });
    }

    // Acute onset with high severity
    const acuteHighSeverity = symptoms.filter(s => 
      s.severity >= 7 && (
        s.duration.includes('horas') || 
        s.duration.includes('repentino') ||
        s.duration.includes('súbito')
      )
    );

    if (acuteHighSeverity.length > 0) {
      flags.push({
        type: 'emergency',
        description: 'Síntomas severos de inicio agudo',
        action: 'Atención médica inmediata - posible emergencia médica',
        severity: 9
      });
    }

    // Multiple systems affected
    const locations = new Set(symptoms.map(s => s.location).filter(Boolean));
    if (locations.size >= 3) {
      flags.push({
        type: 'warning',
        description: 'Múltiples sistemas corporales afectados',
        action: 'Evaluación médica comprehensiva recomendada',
        severity: 6
      });
    }

    // Pediatric specific checks
    if (patientAge && patientAge < 18) {
      const feverSymptoms = symptoms.filter(s => 
        s.name.toLowerCase().includes('fiebre') && s.severity >= 6
      );
      if (feverSymptoms.length > 0) {
        flags.push({
          type: 'urgent',
          description: 'Fiebre alta en paciente pediátrico',
          action: 'Evaluación pediátrica urgente',
          severity: 8
        });
      }
    }

    return flags;
  }

  /**
   * Get emergency contact information for Mexico
   */
  getEmergencyContacts(): {
    general: string;
    redCross: string;
    poisonControl: string;
    mentalHealth: string;
  } {
    return {
      general: '911',
      redCross: '065',
      poisonControl: '5555 924 0420',
      mentalHealth: '5559 155 085'
    };
  }

  /**
   * Get hospital recommendations based on location (placeholder for future implementation)
   */
  getNearestHospitals(latitude?: number, longitude?: number): {
    name: string;
    address: string;
    phone: string;
    type: 'public' | 'private';
    emergency: boolean;
  }[] {
    // Placeholder - in production this would use a real hospital database
    return [
      {
        name: 'Hospital General de México',
        address: 'Dr. Balmis 148, Doctores, CDMX',
        phone: '5527 891 200',
        type: 'public',
        emergency: true
      },
      {
        name: 'Cruz Roja Mexicana',
        address: 'Polanco, CDMX',
        phone: '065',
        type: 'private',
        emergency: true
      }
    ];
  }

  /**
   * Map severity string to number
   */
  private mapSeverityToNumber(severity: 'emergency' | 'urgent' | 'warning'): number {
    switch (severity) {
      case 'emergency': return 10;
      case 'urgent': return 7;
      case 'warning': return 4;
      default: return 1;
    }
  }

  /**
   * Remove duplicate flags
   */
  private deduplicateFlags(flags: RedFlag[]): RedFlag[] {
    const seen = new Set<string>();
    return flags.filter(flag => {
      const key = `${flag.type}-${flag.description}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Add custom red flag rule (for admin/expert use)
   */
  addCustomRule(rule: RedFlagRule): void {
    this.redFlagRules.push(rule);
  }

  /**
   * Get all rules (for admin interface)
   */
  getAllRules(): RedFlagRule[] {
    return [...this.redFlagRules];
  }

  /**
   * Update rule (for admin interface)
   */
  updateRule(ruleId: string, updates: Partial<RedFlagRule>): boolean {
    const index = this.redFlagRules.findIndex(rule => rule.id === ruleId);
    if (index === -1) return false;

    this.redFlagRules[index] = { ...this.redFlagRules[index], ...updates };
    return true;
  }
}

export const redFlagDetectionService = RedFlagDetectionService.getInstance();