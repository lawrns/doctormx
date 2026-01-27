/**
 * Symptom-to-Specialty Mapping System
 * Intelligent routing from symptoms to appropriate medical specialists
 * Based on Mexican healthcare taxonomy and common conditions
 */

export interface SpecialtyMatch {
  specialty: string;
  confidence: number; // 0-100
  reasoning: string;
}

export interface SymptomMappingResult {
  primarySpecialty: SpecialtyMatch;
  alternativeSpecialties: SpecialtyMatch[];
  allMatches: SpecialtyMatch[];
}

/**
 * Comprehensive symptom patterns mapped to specialties
 * Confidence scores are based on medical literature and clinical guidelines
 */
const SYMPTOM_SPECIALTY_PATTERNS: Array<{
  patterns: RegExp[];
  specialty: string;
  confidence: number;
  reasoning: string;
}> = [
  // ============================================================================
  // CARDIOLOGÍA (Cardiology)
  // ============================================================================
  {
    patterns: [
      /dolor.*pecho/i,
      /dolor.*toracico/i,
      /opresion.*pecho/i,
      /angina/i,
      /palpitaciones/i,
    ],
    specialty: 'Cardiología',
    confidence: 90,
    reasoning: 'Síntomas cardíacos requieren evaluación especializada',
  },
  {
    patterns: [
      /presion.*alta/i,
      /hipertension/i,
      /presion.*arterial.*elevada/i,
    ],
    specialty: 'Cardiología',
    confidence: 85,
    reasoning: 'Manejo especializado de hipertensión',
  },
  {
    patterns: [/arritmia/i, /latidos.*irregulares/i, /taquicardia/i],
    specialty: 'Cardiología',
    confidence: 95,
    reasoning: 'Alteraciones del ritmo cardíaco requieren cardiólogo',
  },

  // ============================================================================
  // DERMATOLOGÍA (Dermatology)
  // ============================================================================
  {
    patterns: [
      /erupcion.*piel/i,
      /sarpullido/i,
      /rash/i,
      /manchas.*piel/i,
      /lesiones.*piel/i,
    ],
    specialty: 'Dermatología',
    confidence: 95,
    reasoning: 'Lesiones cutáneas requieren evaluación dermatológica',
  },
  {
    patterns: [/acne/i, /espinillas/i, /granos.*cara/i],
    specialty: 'Dermatología',
    confidence: 90,
    reasoning: 'Condiciones acneicas se benefician de tratamiento especializado',
  },
  {
    patterns: [/psoriasis/i, /eczema/i, /dermatitis/i],
    specialty: 'Dermatología',
    confidence: 100,
    reasoning: 'Condiciones dermatológicas crónicas requieren especialista',
  },
  {
    patterns: [/lunar.*cambio/i, /melanoma/i, /cancer.*piel/i],
    specialty: 'Dermatología',
    confidence: 100,
    reasoning: 'Evaluación urgente de lesiones sospechosas',
  },

  // ============================================================================
  // GASTROENTEROLOGÍA (Gastroenterology)
  // ============================================================================
  {
    patterns: [
      /dolor.*estomago/i,
      /dolor.*abdominal/i,
      /gastritis/i,
      /acidez/i,
      /reflujo/i,
    ],
    specialty: 'Gastroenterología',
    confidence: 85,
    reasoning: 'Síntomas gastrointestinales superiores',
  },
  {
    patterns: [/diarrea.*cronica/i, /estreñimiento.*severo/i, /colitis/i],
    specialty: 'Gastroenterología',
    confidence: 90,
    reasoning: 'Trastornos intestinales requieren evaluación especializada',
  },
  {
    patterns: [/sangre.*heces/i, /melena/i, /hematoquecia/i],
    specialty: 'Gastroenterología',
    confidence: 100,
    reasoning: 'Sangrado gastrointestinal requiere evaluación urgente',
  },
  {
    patterns: [/hepatitis/i, /cirrosis/i, /higado/i],
    specialty: 'Gastroenterología',
    confidence: 95,
    reasoning: 'Enfermedades hepáticas requieren gastroenterólogo',
  },

  // ============================================================================
  // GINECOLOGÍA (Gynecology)
  // ============================================================================
  {
    patterns: [
      /menstruacion.*irregular/i,
      /periodo.*irregular/i,
      /amenorrea/i,
      /sangrado.*vaginal/i,
    ],
    specialty: 'Ginecología',
    confidence: 95,
    reasoning: 'Irregularidades menstruales requieren evaluación ginecológica',
  },
  {
    patterns: [/embarazo/i, /prenatal/i, /gestacion/i],
    specialty: 'Ginecología',
    confidence: 100,
    reasoning: 'Atención prenatal debe ser con ginecólogo',
  },
  {
    patterns: [/quiste.*ovario/i, /endometriosis/i, /fibromas/i],
    specialty: 'Ginecología',
    confidence: 100,
    reasoning: 'Condiciones ginecológicas requieren especialista',
  },

  // ============================================================================
  // NEUROLOGÍA (Neurology)
  // ============================================================================
  {
    patterns: [
      /dolor.*cabeza.*severo/i,
      /migrana/i,
      /cefalea.*cronica/i,
      /dolor.*cabeza.*frecuente/i,
    ],
    specialty: 'Neurología',
    confidence: 85,
    reasoning: 'Cefaleas crónicas o severas requieren neurólogo',
  },
  {
    patterns: [
      /mareo/i,
      /vertigo/i,
      /desequilibrio/i,
      /perdida.*balance/i,
    ],
    specialty: 'Neurología',
    confidence: 80,
    reasoning: 'Trastornos del equilibrio pueden ser neurológicos',
  },
  {
    patterns: [
      /convulsiones/i,
      /epilepsia/i,
      /crisis.*epileptica/i,
      /ataques/i,
    ],
    specialty: 'Neurología',
    confidence: 100,
    reasoning: 'Trastornos convulsivos requieren neurólogo',
  },
  {
    patterns: [
      /neuropatia/i,
      /hormigueo.*manos/i,
      /adormecimiento/i,
      /parestesias/i,
    ],
    specialty: 'Neurología',
    confidence: 90,
    reasoning: 'Síntomas neuropáticos requieren evaluación neurológica',
  },
  {
    patterns: [/parkinson/i, /alzheimer/i, /demencia/i, /temblor/i],
    specialty: 'Neurología',
    confidence: 100,
    reasoning: 'Enfermedades neurodegenerativas requieren neurólogo',
  },

  // ============================================================================
  // NUTRICIÓN (Nutrition)
  // ============================================================================
  {
    patterns: [
      /obesidad/i,
      /sobrepeso/i,
      /bajar.*peso/i,
      /adelgazar/i,
      /dieta/i,
    ],
    specialty: 'Nutrición',
    confidence: 85,
    reasoning: 'Manejo de peso se beneficia de nutriólogo',
  },
  {
    patterns: [/diabetes/i, /glucosa.*alta/i, /control.*diabetico/i],
    specialty: 'Nutrición',
    confidence: 80,
    reasoning: 'Control nutricional es clave en diabetes',
  },
  {
    patterns: [/colesterol.*alto/i, /trigliceridos.*altos/i],
    specialty: 'Nutrición',
    confidence: 75,
    reasoning: 'Dislipidemia se maneja con dieta especializada',
  },

  // ============================================================================
  // OFTALMOLOGÍA (Ophthalmology)
  // ============================================================================
  {
    patterns: [
      /vision.*borrosa/i,
      /perdida.*vision/i,
      /no.*veo.*bien/i,
      /vista.*mal/i,
    ],
    specialty: 'Oftalmología',
    confidence: 90,
    reasoning: 'Alteraciones visuales requieren oftalmólogo',
  },
  {
    patterns: [/ojo.*rojo/i, /conjuntivitis/i, /dolor.*ojo/i],
    specialty: 'Oftalmología',
    confidence: 85,
    reasoning: 'Problemas oculares requieren evaluación especializada',
  },
  {
    patterns: [/glaucoma/i, /catarata/i, /retina/i],
    specialty: 'Oftalmología',
    confidence: 100,
    reasoning: 'Enfermedades oftalmológicas requieren especialista',
  },

  // ============================================================================
  // PEDIATRÍA (Pediatrics)
  // ============================================================================
  {
    patterns: [/niño/i, /bebe/i, /infant/i, /pediatrico/i, /hijo.*años/i],
    specialty: 'Pediatría',
    confidence: 95,
    reasoning: 'Síntomas en niños requieren pediatra',
  },
  {
    patterns: [/vacuna/i, /inmunizacion/i, /control.*niño.*sano/i],
    specialty: 'Pediatría',
    confidence: 100,
    reasoning: 'Atención preventiva infantil con pediatra',
  },

  // ============================================================================
  // PSIQUIATRÍA (Psychiatry)
  // ============================================================================
  {
    patterns: [
      /depresion/i,
      /tristeza.*profunda/i,
      /ganas.*vivir/i,
      /animo.*bajo/i,
    ],
    specialty: 'Psiquiatría',
    confidence: 90,
    reasoning: 'Síntomas depresivos requieren evaluación psiquiátrica',
  },
  {
    patterns: [
      /ansiedad/i,
      /ataques.*panico/i,
      /nervios/i,
      /preocupacion.*excesiva/i,
    ],
    specialty: 'Psiquiatría',
    confidence: 90,
    reasoning: 'Trastornos de ansiedad se benefician de psiquiatra',
  },
  {
    patterns: [
      /insomnio/i,
      /no.*puedo.*dormir/i,
      /trastorno.*sueño/i,
      /pesadillas/i,
    ],
    specialty: 'Psiquiatría',
    confidence: 75,
    reasoning: 'Trastornos del sueño pueden requerir psiquiatra',
  },
  {
    patterns: [
      /bipolar/i,
      /esquizofrenia/i,
      /trastorno.*mental/i,
      /psicosis/i,
    ],
    specialty: 'Psiquiatría',
    confidence: 100,
    reasoning: 'Trastornos psiquiátricos mayores requieren especialista',
  },

  // ============================================================================
  // TRAUMATOLOGÍA (Orthopedics/Traumatology)
  // ============================================================================
  {
    patterns: [
      /dolor.*espalda/i,
      /dolor.*lumbar/i,
      /dolor.*cuello/i,
      /dolor.*cervical/i,
    ],
    specialty: 'Traumatología',
    confidence: 80,
    reasoning: 'Dolor musculoesquelético puede requerir traumatólogo',
  },
  {
    patterns: [
      /dolor.*rodilla/i,
      /dolor.*hombro/i,
      /dolor.*codo/i,
      /dolor.*tobillo/i,
    ],
    specialty: 'Traumatología',
    confidence: 85,
    reasoning: 'Dolor articular requiere evaluación traumatológica',
  },
  {
    patterns: [/fractura/i, /quebradura/i, /hueso.*roto/i, /lesion.*deportiva/i],
    specialty: 'Traumatología',
    confidence: 100,
    reasoning: 'Lesiones óseas requieren traumatólogo',
  },
  {
    patterns: [/artritis/i, /artrosis/i, /osteoporosis/i],
    specialty: 'Traumatología',
    confidence: 90,
    reasoning: 'Enfermedades articulares requieren traumatólogo',
  },

  // ============================================================================
  // MEDICINA GENERAL (General Medicine) - Fallback
  // ============================================================================
  {
    patterns: [
      /fiebre/i,
      /gripe/i,
      /resfriado/i,
      /tos/i,
      /dolor.*garganta/i,
    ],
    specialty: 'Medicina General',
    confidence: 70,
    reasoning: 'Síntomas generales pueden ser manejados por médico general',
  },
];

/**
 * Map symptoms to appropriate specialists
 */
export function mapSymptomsToSpecialties(
  symptoms: string | string[]
): SymptomMappingResult {
  const symptomText = Array.isArray(symptoms) ? symptoms.join(' ') : symptoms;
  const lowerSymptoms = symptomText.toLowerCase();

  const matches: Map<string, SpecialtyMatch> = new Map();

  // Check all patterns
  for (const pattern of SYMPTOM_SPECIALTY_PATTERNS) {
    for (const regex of pattern.patterns) {
      if (regex.test(lowerSymptoms)) {
        // If specialty already matched, take highest confidence
        const existing = matches.get(pattern.specialty);
        if (!existing || pattern.confidence > existing.confidence) {
          matches.set(pattern.specialty, {
            specialty: pattern.specialty,
            confidence: pattern.confidence,
            reasoning: pattern.reasoning,
          });
        }
        break; // Move to next pattern once matched
      }
    }
  }

  const allMatches = Array.from(matches.values()).sort(
    (a, b) => b.confidence - a.confidence
  );

  // If no matches, default to General Medicine
  if (allMatches.length === 0) {
    allMatches.push({
      specialty: 'Medicina General',
      confidence: 60,
      reasoning: 'Síntomas generales requieren evaluación inicial',
    });
  }

  return {
    primarySpecialty: allMatches[0],
    alternativeSpecialties: allMatches.slice(1, 3),
    allMatches,
  };
}

/**
 * Get specialty recommendations with explanation
 */
export function getSpecialtyRecommendations(symptoms: string | string[]): {
  recommendations: string;
  specialties: string[];
} {
  const result = mapSymptomsToSpecialties(symptoms);

  const recommendations = `Basado en tus síntomas, recomendamos consultar con:\n\n` +
    `1. ${result.primarySpecialty.specialty} (${result.primarySpecialty.confidence}% recomendado)\n   ${result.primarySpecialty.reasoning}\n\n` +
    (result.alternativeSpecialties.length > 0
      ? `Alternativas:\n` +
        result.alternativeSpecialties
          .map(
            (spec, idx) =>
              `${idx + 2}. ${spec.specialty} (${spec.confidence}%)\n   ${spec.reasoning}`
          )
          .join('\n\n')
      : '');

  const specialties = [
    result.primarySpecialty.specialty,
    ...result.alternativeSpecialties.map((s) => s.specialty),
  ];

  return {
    recommendations,
    specialties,
  };
}
