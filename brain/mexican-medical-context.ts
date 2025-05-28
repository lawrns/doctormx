/**
 * MEXICAN MEDICAL CONTEXT
 * 
 * This file contains culturally-specific medical terminology, family consultation logic,
 * localized medical practices, and Mexican healthcare system context for the AI doctor.
 * 
 * MEDICAL INTELLIGENCE:
 * - Mexican Spanish medical terminology and colloquialisms
 * - Family-centered healthcare decision making patterns
 * - Traditional Mexican remedies and their integration with modern medicine
 * - Mexican healthcare system navigation (IMSS, ISSSTE, private)
 * - Cultural health beliefs and practices specific to Mexican patients
 * 
 * INTEGRATION:
 * - Provides cultural context for all clinical conversations
 * - Adapts medical terminology to Mexican Spanish variants
 * - Supports family consultation workflows
 * - Integrates traditional and modern medical approaches
 * - Localizes emergency services and healthcare referrals
 * 
 * KEY ALGORITHMS:
 * - Family member role identification and consultation adaptation
 * - Cultural sensitivity in medical questioning and recommendations
 * - Traditional remedy recognition and safety assessment
 * - Mexican healthcare system navigation and referral logic
 */

export interface MexicanFamilyMember {
  value: string;
  label: string;
  relationship: string;
  ageGroup: 'child' | 'adult' | 'elderly';
  culturalConsiderations: string[];
}

export interface TraditionalRemedy {
  name: string;
  spanishName: string;
  uses: string[];
  safetyLevel: 'safe' | 'caution' | 'avoid';
  interactions: string[];
  modernEquivalent?: string;
}

export interface MexicanHealthcareProvider {
  type: 'public' | 'private' | 'traditional';
  name: string;
  services: string[];
  accessibility: 'high' | 'medium' | 'low';
  cost: 'free' | 'low' | 'medium' | 'high';
}

/**
 * MEXICAN FAMILY STRUCTURE
 * Defines family roles and consultation patterns
 */
export class MexicanFamilyContext {
  
  static readonly FAMILY_MEMBERS: MexicanFamilyMember[] = [
    {
      value: 'myself',
      label: 'Para mí',
      relationship: 'self',
      ageGroup: 'adult',
      culturalConsiderations: ['direct consultation', 'personal responsibility']
    },
    {
      value: 'spouse',
      label: 'Para mi esposo/a',
      relationship: 'spouse',
      ageGroup: 'adult',
      culturalConsiderations: ['shared decision making', 'family involvement']
    },
    {
      value: 'child',
      label: 'Para mi hijo/a',
      relationship: 'child',
      ageGroup: 'child',
      culturalConsiderations: ['parental authority', 'protective approach', 'pediatric considerations']
    },
    {
      value: 'parent',
      label: 'Para mi papá/mamá',
      relationship: 'parent',
      ageGroup: 'elderly',
      culturalConsiderations: ['respect for elders', 'family consultation', 'chronic conditions']
    },
    {
      value: 'grandparent',
      label: 'Para mi abuelito/a',
      relationship: 'grandparent',
      ageGroup: 'elderly',
      culturalConsiderations: ['traditional remedies', 'multiple medications', 'family reverence']
    },
    {
      value: 'sibling',
      label: 'Para mi hermano/a',
      relationship: 'sibling',
      ageGroup: 'adult',
      culturalConsiderations: ['peer support', 'shared family history']
    }
  ];

  static getFamilyMember(value: string): MexicanFamilyMember | null {
    return this.FAMILY_MEMBERS.find(member => member.value === value) || null;
  }

  static adaptQuestionForFamily(question: string, familyMember: MexicanFamilyMember): string {
    const adaptations = {
      'child': question.replace(/tiene/g, 'tiene el niño/la niña').replace(/su/g, 'del niño/de la niña'),
      'elderly': question.replace(/tiene/g, 'tiene la persona mayor'),
      'adult': question.replace(/tiene/g, 'tiene la persona')
    };

    return adaptations[familyMember.ageGroup] || question;
  }

  static getCulturalConsiderations(familyMember: MexicanFamilyMember): string[] {
    return familyMember.culturalConsiderations;
  }
}

/**
 * MEXICAN MEDICAL TERMINOLOGY
 * Localized medical terms and colloquialisms
 */
export class MexicanMedicalTerminology {
  
  static readonly SYMPTOM_TERMS = {
    // Pain descriptors
    'dolor': ['pain', 'ache', 'hurt'],
    'molestia': ['discomfort', 'bothering'],
    'ardor': ['burning', 'burning sensation'],
    'punzada': ['stabbing pain', 'sharp pain'],
    'latido': ['throbbing', 'pulsating'],
    'presión': ['pressure', 'pressing'],
    'opresión': ['tightness', 'constriction'],
    
    // Intensity descriptors
    'leve': ['mild', 'light'],
    'moderado': ['moderate'],
    'fuerte': ['strong', 'intense'],
    'intenso': ['severe', 'intense'],
    'insoportable': ['unbearable', 'excruciating'],
    
    // Body parts (Mexican variants)
    'pecho': ['chest', 'breast'],
    'estómago': ['stomach'],
    'barriga': ['belly', 'tummy'],
    'pancita': ['little belly'],
    'cabeza': ['head'],
    'sien': ['temple'],
    'nuca': ['nape', 'back of neck'],
    'garganta': ['throat'],
    'pescuezo': ['neck'],
    
    // Common symptoms
    'calentura': ['fever', 'high temperature'],
    'destemplanza': ['feeling unwell', 'malaise'],
    'mareo': ['dizziness', 'lightheadedness'],
    'náuseas': ['nausea'],
    'basca': ['nausea', 'queasiness'],
    'agruras': ['heartburn', 'acid reflux'],
    'acidez': ['acidity', 'heartburn'],
    'tos': ['cough'],
    'carraspera': ['throat clearing', 'scratchy throat']
  };

  static readonly COLLOQUIAL_EXPRESSIONS = {
    // Pain expressions
    'me duele horrible': 'severe pain',
    'me está matando': 'excruciating pain',
    'no aguanto': 'unbearable pain',
    'me late': 'throbbing pain',
    'me arde': 'burning pain',
    'me punza': 'stabbing pain',
    
    // Feeling unwell
    'me siento mal': 'feeling unwell',
    'ando mal': 'not feeling well',
    'no me siento bien': 'not feeling well',
    'ando destemplado': 'feeling under the weather',
    'me siento débil': 'feeling weak',
    
    // Digestive issues
    'tengo el estómago revuelto': 'upset stomach',
    'me duele la panza': 'stomach ache',
    'tengo agruras': 'heartburn',
    'se me revolvió el estómago': 'stomach upset'
  };

  static translateToMedical(mexicanTerm: string): string {
    const lowerTerm = mexicanTerm.toLowerCase();
    
    // Check colloquial expressions first
    for (const [expression, medical] of Object.entries(this.COLLOQUIAL_EXPRESSIONS)) {
      if (lowerTerm.includes(expression)) {
        return medical;
      }
    }
    
    // Check individual terms
    for (const [term, translations] of Object.entries(this.SYMPTOM_TERMS)) {
      if (lowerTerm.includes(term)) {
        return translations[0]; // Return primary translation
      }
    }
    
    return mexicanTerm; // Return original if no translation found
  }

  static getMexicanVariants(medicalTerm: string): string[] {
    for (const [mexicanTerm, translations] of Object.entries(this.SYMPTOM_TERMS)) {
      if (translations.includes(medicalTerm.toLowerCase())) {
        return [mexicanTerm];
      }
    }
    return [medicalTerm];
  }
}

/**
 * TRADITIONAL MEXICAN REMEDIES
 * Integration of traditional medicine with modern healthcare
 */
export class TraditionalMexicanRemedies {
  
  static readonly REMEDIES: TraditionalRemedy[] = [
    {
      name: 'Chamomile Tea',
      spanishName: 'Té de Manzanilla',
      uses: ['stomach upset', 'anxiety', 'insomnia', 'digestive issues'],
      safetyLevel: 'safe',
      interactions: ['blood thinners'],
      modernEquivalent: 'Mild anxiolytic and digestive aid'
    },
    {
      name: 'Ginger Tea',
      spanishName: 'Té de Jengibre',
      uses: ['nausea', 'motion sickness', 'digestive issues', 'cold symptoms'],
      safetyLevel: 'safe',
      interactions: ['blood thinners', 'diabetes medications'],
      modernEquivalent: 'Anti-nausea and anti-inflammatory'
    },
    {
      name: 'Aloe Vera',
      spanishName: 'Sábila',
      uses: ['burns', 'skin irritation', 'digestive issues'],
      safetyLevel: 'caution',
      interactions: ['diabetes medications', 'blood thinners'],
      modernEquivalent: 'Topical anti-inflammatory'
    },
    {
      name: 'Eucalyptus',
      spanishName: 'Eucalipto',
      uses: ['respiratory congestion', 'cough', 'cold symptoms'],
      safetyLevel: 'safe',
      interactions: [],
      modernEquivalent: 'Decongestant and expectorant'
    },
    {
      name: 'Hierba Buena',
      spanishName: 'Hierba Buena',
      uses: ['digestive issues', 'headache', 'nausea'],
      safetyLevel: 'safe',
      interactions: [],
      modernEquivalent: 'Digestive aid and mild analgesic'
    }
  ];

  static findRemedy(spanishName: string): TraditionalRemedy | null {
    return this.REMEDIES.find(remedy => 
      remedy.spanishName.toLowerCase().includes(spanishName.toLowerCase())
    ) || null;
  }

  static assessSafety(remedy: TraditionalRemedy, medications: string[]): string {
    if (remedy.safetyLevel === 'avoid') {
      return 'No recomendado - puede ser peligroso';
    }
    
    if (remedy.safetyLevel === 'caution') {
      const hasInteractions = medications.some(med => 
        remedy.interactions.some(interaction => 
          med.toLowerCase().includes(interaction.toLowerCase())
        )
      );
      
      if (hasInteractions) {
        return 'Precaución - puede interactuar con sus medicamentos. Consulte con su médico.';
      }
      return 'Generalmente seguro, pero use con precaución';
    }
    
    return 'Generalmente seguro para uso tradicional';
  }

  static getModernGuidance(remedy: TraditionalRemedy): string {
    return `**Remedio tradicional**: ${remedy.spanishName}
**Equivalente moderno**: ${remedy.modernEquivalent}
**Nivel de seguridad**: ${remedy.safetyLevel}
**Usos tradicionales**: ${remedy.uses.join(', ')}

**Recomendación**: Los remedios tradicionales pueden ser útiles como complemento, pero no reemplazan el tratamiento médico profesional.`;
  }
}

/**
 * MEXICAN HEALTHCARE SYSTEM
 * Navigation and referral within Mexican healthcare
 */
export class MexicanHealthcareSystem {
  
  static readonly PROVIDERS: MexicanHealthcareProvider[] = [
    {
      type: 'public',
      name: 'IMSS (Instituto Mexicano del Seguro Social)',
      services: ['primary care', 'emergency', 'specialists', 'surgery', 'medications'],
      accessibility: 'high',
      cost: 'free'
    },
    {
      type: 'public',
      name: 'ISSSTE (Instituto de Seguridad y Servicios Sociales)',
      services: ['primary care', 'emergency', 'specialists', 'surgery'],
      accessibility: 'medium',
      cost: 'free'
    },
    {
      type: 'public',
      name: 'Seguro Popular / INSABI',
      services: ['basic care', 'emergency', 'some specialists'],
      accessibility: 'high',
      cost: 'free'
    },
    {
      type: 'public',
      name: 'Hospital General',
      services: ['emergency', 'basic care', 'surgery'],
      accessibility: 'high',
      cost: 'low'
    },
    {
      type: 'private',
      name: 'Consultorios Adyacentes a Farmacias',
      services: ['basic consultation', 'minor ailments'],
      accessibility: 'high',
      cost: 'low'
    },
    {
      type: 'private',
      name: 'Clínicas Privadas',
      services: ['comprehensive care', 'specialists', 'diagnostics'],
      accessibility: 'medium',
      cost: 'medium'
    }
  ];

  static readonly EMERGENCY_NUMBERS = {
    general: '911',
    redCross: '065',
    fire: '911',
    police: '911',
    civilProtection: '911'
  };

  static getRecommendedProvider(
    urgency: 'emergency' | 'urgent' | 'routine',
    hasInsurance: boolean,
    economicLevel: 'low' | 'medium' | 'high'
  ): MexicanHealthcareProvider[] {
    
    if (urgency === 'emergency') {
      return this.PROVIDERS.filter(p => 
        p.services.includes('emergency') && p.accessibility === 'high'
      );
    }
    
    if (urgency === 'urgent') {
      if (hasInsurance) {
        return this.PROVIDERS.filter(p => 
          (p.type === 'public' || p.cost === 'low') && 
          p.services.includes('primary care')
        );
      } else {
        return this.PROVIDERS.filter(p => 
          p.cost === 'free' || p.cost === 'low'
        );
      }
    }
    
    // Routine care
    if (economicLevel === 'high') {
      return this.PROVIDERS.filter(p => p.type === 'private');
    } else {
      return this.PROVIDERS.filter(p => p.cost === 'free' || p.cost === 'low');
    }
  }

  static getEmergencyGuidance(): string {
    return `**NÚMEROS DE EMERGENCIA EN MÉXICO:**
• Emergencias generales: ${this.EMERGENCY_NUMBERS.general}
• Cruz Roja Mexicana: ${this.EMERGENCY_NUMBERS.redCross}
• Bomberos: ${this.EMERGENCY_NUMBERS.fire}
• Policía: ${this.EMERGENCY_NUMBERS.police}

**HOSPITALES DE EMERGENCIA:**
• Hospital General más cercano
• Cruz Roja Mexicana
• IMSS (si tiene seguro)
• ISSSTE (si es derechohabiente)

**IMPORTANTE:** El 911 es gratuito desde cualquier teléfono en México.`;
  }
}

/**
 * CULTURAL HEALTH BELIEFS
 * Mexican cultural perspectives on health and illness
 */
export class MexicanHealthBeliefs {
  
  static readonly CULTURAL_CONCEPTS = {
    'susto': {
      description: 'Fright or shock causing illness',
      symptoms: ['anxiety', 'insomnia', 'loss of appetite'],
      treatment: 'Traditional healing ceremony',
      modernApproach: 'Anxiety management and counseling'
    },
    'empacho': {
      description: 'Digestive blockage from overeating',
      symptoms: ['stomach pain', 'bloating', 'constipation'],
      treatment: 'Abdominal massage and herbal remedies',
      modernApproach: 'Dietary modification and digestive aids'
    },
    'mal de ojo': {
      description: 'Evil eye causing illness in children',
      symptoms: ['fever', 'crying', 'restlessness'],
      treatment: 'Traditional cleansing ritual',
      modernApproach: 'Medical evaluation for underlying causes'
    }
  };

  static readonly FAMILY_DYNAMICS = {
    decisionMaking: 'Often involves extended family consultation',
    elderRespect: 'Elders\' opinions highly valued in health decisions',
    genderRoles: 'Women often primary health decision makers for family',
    religiousFactor: 'Catholic faith may influence treatment acceptance'
  };

  static getCulturalGuidance(concept: string): string | null {
    const belief = this.CULTURAL_CONCEPTS[concept];
    if (!belief) return null;

    return `**Concepto cultural**: ${concept}
**Descripción**: ${belief.description}
**Síntomas asociados**: ${belief.symptoms.join(', ')}
**Enfoque tradicional**: ${belief.treatment}
**Enfoque médico moderno**: ${belief.modernApproach}

**Recomendación**: Respetamos las creencias culturales y recomendamos combinar enfoques tradicionales seguros con atención médica moderna cuando sea necesario.`;
  }
}
