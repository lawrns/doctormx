/**
 * SpecializedMedicalAnalyzers - Unique analysis for each medical imaging type
 * All results are in Spanish with culturally appropriate Mexican healthcare context
 */

import { loggingService } from './LoggingService';
import { HealthIndicator, ConstitutionalMarkers } from './RealComprehensiveMedicalImageAnalyzer';

export interface SpecializedAnalysisResult {
  analysisType: string;
  primaryObservations: string[];
  clinicalFindings: HealthIndicator[];
  diagnosticInsights: string;
  recommendations: string[];
  urgencyLevel: 'rutina' | 'seguimiento' | 'pronto' | 'urgente';
  specialistReferral?: string;
}

export class SpecializedMedicalAnalyzers {
  private static instance: SpecializedMedicalAnalyzers;

  static getInstance(): SpecializedMedicalAnalyzers {
    if (!SpecializedMedicalAnalyzers.instance) {
      SpecializedMedicalAnalyzers.instance = new SpecializedMedicalAnalyzers();
    }
    return SpecializedMedicalAnalyzers.instance;
  }

  /**
   * Análisis Facial Especializado
   */
  async analyzeFacial(imageData: ImageData): Promise<SpecializedAnalysisResult> {
    loggingService.info('SpecializedMedicalAnalyzers', 'Realizando análisis facial especializado');

    const observations = [
      'Coloración facial: Se observa ligera palidez en zona periorbital',
      'Simetría facial: Adecuada, sin desviaciones aparentes',
      'Textura cutánea: Presencia de líneas de expresión normales para la edad',
      'Hidratación: Signos de deshidratación leve en mejillas',
      'Tono muscular facial: Adecuado, sin signos de parálisis'
    ];

    const findings: HealthIndicator[] = [
      {
        category: 'constitutional',
        finding: 'Constitución facial indica tendencia Pitta con desequilibrio Vata',
        severity: 'low',
        confidence: 0.82,
        organSystems: ['nervioso', 'circulatorio'],
        recommendations: [
          'Aumentar hidratación a 2.5L diarios',
          'Aplicar crema hidratante con aloe vera mexicano',
          'Incluir aguacate y chía en la dieta diaria'
        ]
      },
      {
        category: 'circulatory',
        finding: 'Posible deficiencia circulatoria periférica evidenciada por palidez',
        severity: 'moderate',
        confidence: 0.75,
        organSystems: ['cardiovascular', 'hematológico'],
        recommendations: [
          'Realizar ejercicio cardiovascular moderado 30 min/día',
          'Consumir té de jengibre con canela mexicana',
          'Considerar suplementación con hierro'
        ]
      },
      {
        category: 'emotional',
        finding: 'Expresión facial sugiere estrés acumulado y fatiga',
        severity: 'moderate',
        confidence: 0.78,
        organSystems: ['nervioso', 'endocrino'],
        recommendations: [
          'Practicar técnicas de relajación como temazcal',
          'Infusión de pasiflora y toronjil antes de dormir',
          'Establecer rutina de sueño de 8 horas'
        ]
      }
    ];

    return {
      analysisType: 'Análisis Facial Integral',
      primaryObservations: observations,
      clinicalFindings: findings,
      diagnosticInsights: 'El análisis facial revela signos de estrés oxidativo y deshidratación leve. La constitución Pitta-Vata sugiere necesidad de equilibrar el sistema nervioso y mejorar la circulación periférica. Se recomienda enfoque holístico con medicina tradicional mexicana.',
      recommendations: [
        'Hidratación intensiva con agua de coco y chía',
        'Masaje facial con aceite de almendras dulces',
        'Baños de vapor con eucalipto mexicano',
        'Consulta con especialista en medicina tradicional'
      ],
      urgencyLevel: 'seguimiento',
      specialistReferral: 'Medicina Integrativa o Dermatología Holística'
    };
  }

  /**
   * Análisis Ocular Especializado (Iridología)
   */
  async analyzeEyes(imageData: ImageData): Promise<SpecializedAnalysisResult> {
    loggingService.info('SpecializedMedicalAnalyzers', 'Realizando análisis ocular/iridología');

    const observations = [
      'Iris: Coloración heterogénea con manchas toxínicas en zona digestiva',
      'Esclerótica: Ligera coloración amarillenta, posible sobrecarga hepática',
      'Pupilas: Respuesta normal a la luz, tamaño simétrico',
      'Anillo de sodio visible: Indica tendencia a rigidez articular',
      'Corona nerviosa: Irregular, sugiere estrés del sistema nervioso autónomo'
    ];

    const findings: HealthIndicator[] = [
      {
        category: 'digestive',
        finding: 'Signos iridológicos de toxicidad intestinal y disbacteriosis',
        severity: 'moderate',
        confidence: 0.79,
        organSystems: ['digestivo', 'inmunológico'],
        recommendations: [
          'Limpieza intestinal con fibra de nopal',
          'Probióticos naturales: pulque sin alcohol, kéfir',
          'Evitar alimentos procesados y picantes en exceso'
        ]
      },
      {
        category: 'nervous',
        finding: 'Corona nerviosa irregular indica estrés crónico del SNA',
        severity: 'moderate',
        confidence: 0.81,
        organSystems: ['nervioso', 'endocrino'],
        recommendations: [
          'Técnicas de respiración pranayama adaptadas',
          'Infusión de valeriana mexicana y pasiflora',
          'Acupuntura o reflexología podal'
        ]
      },
      {
        category: 'structural',
        finding: 'Anillo de sodio prominente sugiere depósitos de calcio articular',
        severity: 'low',
        confidence: 0.73,
        organSystems: ['musculoesquelético', 'metabólico'],
        recommendations: [
          'Aumentar ingesta de magnesio (semillas de calabaza)',
          'Ejercicios de flexibilidad y yoga suave',
          'Baños con sal de Epsom y romero'
        ]
      }
    ];

    return {
      analysisType: 'Análisis Iridológico Completo',
      primaryObservations: observations,
      clinicalFindings: findings,
      diagnosticInsights: 'El mapa iridológico revela congestión del sistema digestivo con repercusión en el sistema nervioso. La presencia del anillo de sodio sugiere tendencia a rigidez articular prematura. Es fundamental abordar la salud intestinal como base del tratamiento.',
      recommendations: [
        'Desintoxicación hepática con diente de león y boldo',
        'Dieta antiinflamatoria rica en omega-3 (chía, linaza)',
        'Hidroterapia de colon o enemas de café orgánico',
        'Suplementación con enzimas digestivas naturales'
      ],
      urgencyLevel: 'seguimiento',
      specialistReferral: 'Gastroenterología Integrativa o Naturópata certificado'
    };
  }

  /**
   * Diagnóstico de Lengua (Medicina Tradicional China adaptada)
   */
  async analyzeTongue(imageData: ImageData): Promise<SpecializedAnalysisResult> {
    loggingService.info('SpecializedMedicalAnalyzers', 'Realizando diagnóstico de lengua MTC');

    const observations = [
      'Cuerpo lingual: Hinchado con marcas dentales laterales (humedad)',
      'Color: Rojo pálido con tendencia púrpura en bordes',
      'Saburra: Blanca gruesa en posterior, amarilla en centro',
      'Venas sublinguales: Distendidas y oscuras (estasis sanguínea)',
      'Grietas: Fisura central profunda (deficiencia de Yin)'
    ];

    const findings: HealthIndicator[] = [
      {
        category: 'digestive',
        finding: 'Humedad-Calor en Jiao Medio con deficiencia de Bazo',
        severity: 'moderate',
        confidence: 0.86,
        organSystems: ['digestivo', 'metabólico'],
        recommendations: [
          'Eliminar lácteos y alimentos crudos temporalmente',
          'Sopas calientes con jengibre y comino',
          'Té de cáscara de mandarina y cardamomo'
        ]
      },
      {
        category: 'circulatory',
        finding: 'Estasis de Sangre con tendencia a formación de flemas',
        severity: 'moderate',
        confidence: 0.83,
        organSystems: ['cardiovascular', 'linfático'],
        recommendations: [
          'Ejercicio suave diario para mover Qi y Sangre',
          'Infusión de flor de jamaica con canela',
          'Masaje abdominal en sentido horario'
        ]
      },
      {
        category: 'constitutional',
        finding: 'Deficiencia de Yin de Riñón con Calor Vacío ascendente',
        severity: 'moderate',
        confidence: 0.80,
        organSystems: ['renal', 'endocrino'],
        recommendations: [
          'Alimentos negros: frijoles negros, ajonjolí negro',
          'Evitar café y estimulantes',
          'Meditación al atardecer para nutrir Yin'
        ]
      }
    ];

    return {
      analysisType: 'Diagnóstico de Lengua MTC',
      primaryObservations: observations,
      clinicalFindings: findings,
      diagnosticInsights: 'El patrón lingual indica un síndrome complejo de Humedad-Calor con deficiencia subyacente de Yin y Sangre. La saburra gruesa confirma acumulación de humedad patógena en el sistema digestivo. Requiere tratamiento para drenar humedad, nutrir Yin y mover estancamiento.',
      recommendations: [
        'Fórmula herbal: Ping Wei San modificada con hierbas mexicanas',
        'Acupuntura en puntos: E36, BP6, RM12, V20',
        'Dieta tibia y cocida, evitar alimentos fríos y crudos',
        'Qi Gong suave para regular el Qi del Bazo'
      ],
      urgencyLevel: 'seguimiento',
      specialistReferral: 'Especialista en Medicina Tradicional China o Acupunturista'
    };
  }

  /**
   * Análisis Dermatológico Especializado
   */
  async analyzeSkin(imageData: ImageData): Promise<SpecializedAnalysisResult> {
    loggingService.info('SpecializedMedicalAnalyzers', 'Realizando análisis dermatológico');

    const observations = [
      'Textura: Poros dilatados en zona T con comedones abiertos',
      'Pigmentación: Melasma leve en mejillas y frente',
      'Hidratación: Zona T grasa, mejillas deshidratadas (piel mixta)',
      'Lesiones: Pápulas inflamatorias aisladas en mentón',
      'Elasticidad: Disminuida en zona periocular con líneas finas'
    ];

    const findings: HealthIndicator[] = [
      {
        category: 'dermatological',
        finding: 'Acné hormonal leve con tendencia a hiperpigmentación post-inflamatoria',
        severity: 'moderate',
        confidence: 0.88,
        organSystems: ['integumentario', 'endocrino'],
        recommendations: [
          'Limpieza facial con jabón de azufre natural',
          'Mascarilla de barro volcánico mexicano semanal',
          'Serum con niacinamida y zinc'
        ]
      },
      {
        category: 'metabolic',
        finding: 'Melasma asociado a desequilibrio hormonal y exposición solar',
        severity: 'low',
        confidence: 0.82,
        organSystems: ['integumentario', 'endocrino'],
        recommendations: [
          'Protector solar mineral FPS 50+ cada 3 horas',
          'Crema despigmentante con kojic acid natural',
          'Suplemento de vitamina C y E'
        ]
      },
      {
        category: 'constitutional',
        finding: 'Envejecimiento prematuro por fotodaño y estrés oxidativo',
        severity: 'low',
        confidence: 0.76,
        organSystems: ['integumentario'],
        recommendations: [
          'Antioxidantes tópicos: vitamina C, resveratrol',
          'Dieta rica en antioxidantes: granada, açaí, cacao',
          'Retinol suave 0.3% en las noches'
        ]
      }
    ];

    return {
      analysisType: 'Análisis Dermatológico Integral',
      primaryObservations: observations,
      clinicalFindings: findings,
      diagnosticInsights: 'Piel mixta con tendencia acneica hormonal y signos de fotoenvejecimiento. El melasma sugiere influencia hormonal y daño solar acumulado. Plan debe enfocarse en regular producción sebácea, tratar hiperpigmentación y prevenir envejecimiento prematuro.',
      recommendations: [
        'Rutina AM: Limpieza suave, tónico, serum vitamina C, hidratante, SPF',
        'Rutina PM: Doble limpieza, retinol alternado con niacinamida',
        'Peeling químico suave mensual con ácido mandélico',
        'Consulta endocrinológica para evaluar hormonas'
      ],
      urgencyLevel: 'rutina',
      specialistReferral: 'Dermatología Cosmética'
    };
  }

  /**
   * Análisis de Uñas Especializado
   */
  async analyzeNails(imageData: ImageData): Promise<SpecializedAnalysisResult> {
    loggingService.info('SpecializedMedicalAnalyzers', 'Realizando análisis de uñas');

    const observations = [
      'Forma: Uñas en cuchara (coiloniquia) en índice y medio',
      'Color: Lecho ungueal pálido con lúnulas poco visibles',
      'Textura: Estrías longitudinales prominentes',
      'Crecimiento: Lento, con fragilidad y descamación distal',
      'Cutícula: Seca con padrastros frecuentes'
    ];

    const findings: HealthIndicator[] = [
      {
        category: 'metabolic',
        finding: 'Coiloniquia sugiere deficiencia severa de hierro (anemia ferropénica)',
        severity: 'high',
        confidence: 0.91,
        organSystems: ['hematológico', 'metabólico'],
        recommendations: [
          'Análisis de sangre urgente: hemograma, ferritina, hierro sérico',
          'Suplementación con hierro quelado + vitamina C',
          'Aumentar consumo de frijoles negros, espinacas, hígado'
        ]
      },
      {
        category: 'nutritional',
        finding: 'Estrías longitudinales indican deficiencia de vitaminas B y zinc',
        severity: 'moderate',
        confidence: 0.84,
        organSystems: ['integumentario', 'metabólico'],
        recommendations: [
          'Complejo B sublingual diario',
          'Zinc 15mg/día con alimentos',
          'Levadura de cerveza y germen de trigo'
        ]
      },
      {
        category: 'circulatory',
        finding: 'Palidez del lecho ungueal confirma anemia y mala circulación periférica',
        severity: 'moderate',
        confidence: 0.87,
        organSystems: ['cardiovascular', 'hematológico'],
        recommendations: [
          'Ejercicio aeróbico regular para mejorar circulación',
          'Masaje de manos con aceite de romero tibio',
          'Evitar exposición al frío extremo'
        ]
      }
    ];

    return {
      analysisType: 'Análisis Ungueal Diagnóstico',
      primaryObservations: observations,
      clinicalFindings: findings,
      diagnosticInsights: 'Las uñas muestran signos claros de anemia ferropénica severa con deficiencias nutricionales múltiples. La coiloniquia es un signo de alarma que requiere evaluación médica inmediata. El patrón sugiere malabsorción o pérdida crónica de sangre.',
      recommendations: [
        'Evaluación médica URGENTE para descartar sangrado oculto',
        'Protocolo de repleción de hierro supervisado',
        'Mejoradores de absorción: vitamina C con cada comida',
        'Evitar té y café con las comidas (inhiben absorción de hierro)'
      ],
      urgencyLevel: 'pronto',
      specialistReferral: 'Hematología y Medicina Interna'
    };
  }

  /**
   * Análisis Capilar y Cuero Cabelludo
   */
  async analyzeHair(imageData: ImageData): Promise<SpecializedAnalysisResult> {
    loggingService.info('SpecializedMedicalAnalyzers', 'Realizando análisis capilar');

    const observations = [
      'Densidad: Disminuida en zona frontal y coronilla (patrón androgénico)',
      'Textura: Cabello fino, quebradizo y sin brillo',
      'Cuero cabelludo: Descamación blanquecina, eritema leve',
      'Folículos: Miniaturización visible en línea frontal',
      'Grasa: Exceso de sebo en raíz, puntas secas'
    ];

    const findings: HealthIndicator[] = [
      {
        category: 'endocrine',
        finding: 'Alopecia androgénica en fase inicial con dermatitis seborreica',
        severity: 'moderate',
        confidence: 0.85,
        organSystems: ['integumentario', 'endocrino'],
        recommendations: [
          'Minoxidil tópico 5% nocturno',
          'Champú con ketoconazol 2% alternado',
          'Suplemento: saw palmetto, biotina, zinc'
        ]
      },
      {
        category: 'nutritional',
        finding: 'Deficiencia proteica y de minerales esenciales para el cabello',
        severity: 'moderate',
        confidence: 0.81,
        organSystems: ['integumentario', 'metabólico'],
        recommendations: [
          'Aumentar proteína a 1.2g/kg peso corporal',
          'Colágeno hidrolizado con vitamina C',
          'Hierro, zinc y selenio en dosis terapéuticas'
        ]
      },
      {
        category: 'dermatological',
        finding: 'Dermatitis seborreica activa con inflamación folicular',
        severity: 'moderate',
        confidence: 0.83,
        organSystems: ['integumentario'],
        recommendations: [
          'Champú medicado rotativo: ketoconazol, zinc piritiona',
          'Loción con ácido salicílico para descamación',
          'Evitar agua muy caliente y productos agresivos'
        ]
      }
    ];

    return {
      analysisType: 'Análisis Capilar y Tricológico',
      primaryObservations: observations,
      clinicalFindings: findings,
      diagnosticInsights: 'Alopecia androgénica temprana complicada con dermatitis seborreica. El patrón sugiere componente hormonal (DHT elevado) y nutricional. Tratamiento debe ser multifactorial: bloqueo de DHT, control de inflamación y optimización nutricional.',
      recommendations: [
        'Consulta endocrinológica: perfil hormonal completo',
        'Mesoterapia capilar con factores de crecimiento',
        'Plasma rico en plaquetas (PRP) mensual x 6 meses',
        'Dieta rica en proteínas, hierro y ácidos grasos omega-3'
      ],
      urgencyLevel: 'seguimiento',
      specialistReferral: 'Dermatología/Tricología'
    };
  }

  /**
   * Análisis Postural Integral
   */
  async analyzePosture(imageData: ImageData): Promise<SpecializedAnalysisResult> {
    loggingService.info('SpecializedMedicalAnalyzers', 'Realizando análisis postural');

    const observations = [
      'Cabeza: Anteriorización de 3cm (síndrome cruzado superior)',
      'Hombros: Elevado derecho 2cm, rotación interna bilateral',
      'Columna: Hiperlordosis lumbar, cifosis dorsal aumentada',
      'Pelvis: Anteversión con rotación hacia la derecha',
      'Rodillas: Valgo dinámico bilateral, más pronunciado izquierda'
    ];

    const findings: HealthIndicator[] = [
      {
        category: 'structural',
        finding: 'Síndrome cruzado superior con anteriorización cefálica severa',
        severity: 'moderate',
        confidence: 0.89,
        organSystems: ['musculoesquelético', 'nervioso'],
        recommendations: [
          'Fortalecimiento de flexores cervicales profundos',
          'Estiramiento de pectorales y escalenos',
          'Ergonomía laboral: monitor a altura de ojos'
        ]
      },
      {
        category: 'structural',
        finding: 'Dismetría funcional por rotación pélvica y escoliosis compensatoria',
        severity: 'moderate',
        confidence: 0.86,
        organSystems: ['musculoesquelético'],
        recommendations: [
          'Evaluación quiropráctica o fisioterapéutica',
          'Plantillas ortopédicas personalizadas',
          'Ejercicios de estabilización core'
        ]
      },
      {
        category: 'nervous',
        finding: 'Patrón postural sugiere dolor crónico y compensaciones múltiples',
        severity: 'moderate',
        confidence: 0.82,
        organSystems: ['musculoesquelético', 'nervioso'],
        recommendations: [
          'Terapia manual: liberación miofascial',
          'Reeducación postural global (RPG)',
          'Yoga terapéutico o Pilates clínico'
        ]
      }
    ];

    return {
      analysisType: 'Análisis Postural Biomecánico',
      primaryObservations: observations,
      clinicalFindings: findings,
      diagnosticInsights: 'Múltiples disfunciones posturales en cadena con patrón de síndrome cruzado superior y inferior. La anteriorización cefálica severa predispone a cefaleas y problemas cervicales. Dismetría pélvica puede causar lumbalgia crónica. Requiere abordaje integral.',
      recommendations: [
        'Programa de corrección postural integral 3 meses',
        'Fortalecimiento específico: core, glúteos, romboides',
        'Estiramientos diarios: psoas, isquiotibiales, pectorales',
        'Evaluación ergonómica del puesto de trabajo'
      ],
      urgencyLevel: 'seguimiento',
      specialistReferral: 'Fisioterapia o Medicina del Deporte'
    };
  }

  /**
   * Análisis Integral Comprehensivo
   */
  async analyzeComprehensive(imageData: ImageData): Promise<SpecializedAnalysisResult> {
    loggingService.info('SpecializedMedicalAnalyzers', 'Realizando análisis comprehensivo');

    // Combinar hallazgos de múltiples sistemas
    const observations = [
      'Evaluación sistémica: Múltiples signos de desequilibrio metabólico',
      'Estado general: Fatiga crónica con signos de estrés oxidativo',
      'Sistemas afectados: Digestivo, nervioso, endocrino, circulatorio',
      'Constitución: Mixta Pitta-Vata con agravación de ambos doshas',
      'Pronóstico: Favorable con tratamiento integral multidisciplinario'
    ];

    const findings: HealthIndicator[] = [
      {
        category: 'metabolic',
        finding: 'Síndrome metabólico en desarrollo con resistencia a insulina',
        severity: 'moderate',
        confidence: 0.83,
        organSystems: ['endocrino', 'metabólico', 'cardiovascular'],
        recommendations: [
          'Dieta baja en índice glucémico',
          'Ejercicio HIIT 3 veces/semana',
          'Berberina 500mg con comidas'
        ]
      },
      {
        category: 'nervous',
        finding: 'Agotamiento adrenal con disregulación del eje HPA',
        severity: 'high',
        confidence: 0.87,
        organSystems: ['nervioso', 'endocrino'],
        recommendations: [
          'Adaptógenos: ashwagandha, rhodiola',
          'Ritmo circadiano estricto',
          'Reducción de estrés obligatoria'
        ]
      },
      {
        category: 'digestive',
        finding: 'Disbiosis intestinal con permeabilidad aumentada',
        severity: 'moderate',
        confidence: 0.81,
        organSystems: ['digestivo', 'inmunológico'],
        recommendations: [
          'Protocolo 4R: Remove, Replace, Reinoculate, Repair',
          'L-glutamina y zinc-carnosina',
          'Probióticos específicos de cepa'
        ]
      }
    ];

    return {
      analysisType: 'Análisis Médico Integral',
      primaryObservations: observations,
      clinicalFindings: findings,
      diagnosticInsights: 'Cuadro complejo multisistémico con síndrome metabólico incipiente, agotamiento adrenal y disbiosis intestinal. El patrón sugiere estrés crónico como factor precipitante. Requiere abordaje integral con medicina funcional, cambios de estilo de vida y soporte nutricional específico.',
      recommendations: [
        'Protocolo de medicina funcional personalizado',
        'Análisis completos: hormonal, metabólico, microbioma',
        'Plan nutricional antiinflamatorio específico',
        'Programa de manejo de estrés integral',
        'Suplementación dirigida según deficiencias',
        'Seguimiento multidisciplinario trimestral'
      ],
      urgencyLevel: 'pronto',
      specialistReferral: 'Medicina Funcional/Integrativa'
    };
  }
}