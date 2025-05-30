/**
 * ComprehensiveProtocolDatabase - Multiple treatment protocols for different conditions
 * 
 * Replaces the single "digestive protocol" with a comprehensive database of
 * medical treatment protocols covering skin, circulatory, structural, respiratory,
 * emotional, and other health conditions based on real image analysis findings.
 */

import { loggingService } from './LoggingService';

export interface TreatmentProtocol {
  id: string;
  name: string;
  description: string;
  category: ProtocolCategory;
  condition: string[];
  constitution: ConstitutionType[];
  duration: ProtocolDuration;
  phases: TreatmentPhase[];
  evidenceLevel: EvidenceLevel;
  culturalAdaptations: CulturalAdaptation[];
  estimatedCost: CostEstimate;
  contraindications: string[];
  interactions: string[];
  followUpSchedule: FollowUpSchedule;
}

export type ProtocolCategory = 
  | 'dermatological' 
  | 'circulatory' 
  | 'structural' 
  | 'respiratory' 
  | 'digestive' 
  | 'nervous' 
  | 'endocrine' 
  | 'immune' 
  | 'constitutional' 
  | 'emotional'
  | 'metabolic'
  | 'detoxification';

export type ConstitutionType = 
  | 'vata' 
  | 'pitta' 
  | 'kapha' 
  | 'hot' 
  | 'cold' 
  | 'damp' 
  | 'dry' 
  | 'balanced' 
  | 'all';

export type ProtocolDuration = 
  | '1_week' 
  | '2_weeks' 
  | '4_weeks' 
  | '6_weeks' 
  | '8_weeks' 
  | '12_weeks' 
  | 'ongoing';

export type EvidenceLevel = 'A' | 'B' | 'C' | 'Traditional';

export interface TreatmentPhase {
  phase: number;
  name: string;
  duration: string;
  goals: string[];
  herbs: HerbPrescription[];
  lifestyle: LifestyleRecommendation[];
  monitoring: MonitoringParameter[];
  milestones: PhaseMilestone[];
}

export interface HerbPrescription {
  herbName: string;
  mexicanName: string;
  dosage: string;
  preparation: string;
  timing: string;
  duration: string;
  purpose: string;
  interactions: string[];
  contraindications: string[];
  localAvailability: LocalAvailability;
}

export interface LocalAvailability {
  mexicanMarkets: boolean;
  pharmacies: boolean;
  growsWild: boolean;
  seasonality: string;
  alternatives: string[];
}

export interface LifestyleRecommendation {
  category: 'diet' | 'exercise' | 'sleep' | 'stress' | 'environment' | 'social';
  recommendation: string;
  mexicanAdaptation: string;
  priority: 'essential' | 'important' | 'beneficial';
  implementation: string;
}

export interface MonitoringParameter {
  parameter: string;
  method: string;
  frequency: string;
  targetRange: string;
  alertConditions: string[];
}

export interface PhaseMilestone {
  milestone: string;
  expectedTimeframe: string;
  successIndicators: string[];
  failureIndicators: string[];
  nextSteps: string;
}

export interface CulturalAdaptation {
  aspect: string;
  mexicanContext: string;
  adaptationStrategy: string;
  culturalConsiderations: string[];
}

export interface CostEstimate {
  totalCostMXN: number;
  phaseBreakdown: Array<{
    phase: number;
    costMXN: number;
    items: Array<{ item: string; cost: number }>;
  }>;
  alternatives: Array<{
    option: string;
    costMXN: number;
    description: string;
  }>;
}

export interface FollowUpSchedule {
  initialFollowUp: string;
  ongoingSchedule: string;
  emergencyContacts: boolean;
  selfMonitoring: string[];
}

/**
 * Comprehensive Protocol Database
 */
export class ComprehensiveProtocolDatabase {
  private static instance: ComprehensiveProtocolDatabase;
  private protocols: Map<string, TreatmentProtocol>;

  static getInstance(): ComprehensiveProtocolDatabase {
    if (!ComprehensiveProtocolDatabase.instance) {
      ComprehensiveProtocolDatabase.instance = new ComprehensiveProtocolDatabase();
    }
    return ComprehensiveProtocolDatabase.instance;
  }

  constructor() {
    this.protocols = new Map();
    this.initializeProtocols();
  }

  /**
   * Initialize comprehensive protocol database
   */
  private initializeProtocols(): void {
    loggingService.info('ComprehensiveProtocolDatabase', 'Initializing comprehensive treatment protocols');

    // Dermatological Protocols
    this.addDermatologicalProtocols();
    
    // Circulatory Protocols
    this.addCirculatoryProtocols();
    
    // Structural Protocols
    this.addStructuralProtocols();
    
    // Respiratory Protocols
    this.addRespiratoryProtocols();
    
    // Digestive Protocols
    this.addDigestiveProtocols();
    
    // Nervous System Protocols
    this.addNervousSystemProtocols();
    
    // Endocrine Protocols
    this.addEndocrineProtocols();
    
    // Constitutional Protocols
    this.addConstitutionalProtocols();
    
    // Emotional/Stress Protocols
    this.addEmotionalProtocols();

    loggingService.info('ComprehensiveProtocolDatabase', 'Protocol database initialized', {
      totalProtocols: this.protocols.size,
      categories: this.getProtocolCategories()
    });
  }

  /**
   * Add dermatological treatment protocols
   */
  private addDermatologicalProtocols(): void {
    // Skin Hydration Protocol
    this.protocols.set('skin_hydration_001', {
      id: 'skin_hydration_001',
      name: 'Protocolo de Hidratación Cutánea Integral',
      description: 'Protocolo completo para restaurar hidratación y elasticidad de la piel',
      category: 'dermatological',
      condition: ['dry_skin', 'dehydration', 'skin_texture_issues', 'low_hydration'],
      constitution: ['vata', 'dry', 'all'],
      duration: '6_weeks',
      phases: [
        {
          phase: 1,
          name: 'Restauración de Barrera Cutánea',
          duration: '2 weeks',
          goals: ['Restore skin barrier', 'Increase moisture retention', 'Reduce inflammation'],
          herbs: [
            {
              herbName: 'aloe vera',
              mexicanName: 'sábila',
              dosage: 'Apply fresh gel 2-3 times daily',
              preparation: 'Fresh gel from plant or pure commercial gel',
              timing: 'Morning and evening, after cleansing',
              duration: '2 weeks',
              purpose: 'Hydrate and soothe skin, restore barrier function',
              interactions: [],
              contraindications: ['Known aloe allergy'],
              localAvailability: {
                mexicanMarkets: true,
                pharmacies: true,
                growsWild: true,
                seasonality: 'Year-round',
                alternatives: ['cucumber', 'honey']
              }
            },
            {
              herbName: 'chamomile',
              mexicanName: 'manzanilla',
              dosage: '1 cup tea 2x daily + topical compress',
              preparation: 'Tea infusion 5 minutes, cool for compress',
              timing: 'Tea: morning/evening, Compress: as needed',
              duration: '2 weeks',
              purpose: 'Internal hydration and anti-inflammatory support',
              interactions: ['Blood thinners (mild interaction)'],
              contraindications: ['Ragweed allergy', 'Pregnancy (large amounts)'],
              localAvailability: {
                mexicanMarkets: true,
                pharmacies: true,
                growsWild: false,
                seasonality: 'Year-round (dried)',
                alternatives: ['calendula', 'hierba buena']
              }
            }
          ],
          lifestyle: [
            {
              category: 'environment',
              recommendation: 'Use humidifier, avoid hot showers',
              mexicanAdaptation: 'Especially important in dry Mexican climates',
              priority: 'essential',
              implementation: 'Set humidifier to 40-50%, lukewarm water only'
            },
            {
              category: 'diet',
              recommendation: 'Increase water intake to 2.5-3L daily',
              mexicanAdaptation: 'Include agua frescas with natural fruits',
              priority: 'essential',
              implementation: 'Track daily intake, flavor with natural ingredients'
            }
          ],
          monitoring: [
            {
              parameter: 'Skin hydration level',
              method: 'Visual assessment and touch test',
              frequency: 'Daily',
              targetRange: 'Improved suppleness and reduced flaking',
              alertConditions: ['Increased dryness', 'New irritation']
            }
          ],
          milestones: [
            {
              milestone: 'Reduced skin flaking',
              expectedTimeframe: '3-5 days',
              successIndicators: ['Less visible dry patches', 'Improved skin feel'],
              failureIndicators: ['Continued or worsened dryness', 'New irritation'],
              nextSteps: 'Continue protocol, consider adding oatmeal masks'
            }
          ]
        },
        {
          phase: 2,
          name: 'Mantenimiento y Fortalecimiento',
          duration: '4 weeks',
          goals: ['Maintain hydration gains', 'Strengthen skin resilience', 'Prevent recurrence'],
          herbs: [
            {
              herbName: 'rose hip oil',
              mexicanName: 'aceite de rosa mosqueta',
              dosage: '3-5 drops applied to face nightly',
              preparation: 'Pure cold-pressed oil',
              timing: 'Evening, after cleansing',
              duration: '4 weeks',
              purpose: 'Deep moisturizing and skin regeneration',
              interactions: [],
              contraindications: ['Rose allergy'],
              localAvailability: {
                mexicanMarkets: false,
                pharmacies: true,
                growsWild: false,
                seasonality: 'Year-round',
                alternatives: ['jojoba oil', 'sweet almond oil']
              }
            }
          ],
          lifestyle: [
            {
              category: 'diet',
              recommendation: 'Include omega-3 rich foods',
              mexicanAdaptation: 'Add chia seeds, walnuts, and fish to traditional dishes',
              priority: 'important',
              implementation: 'Include in 3-4 meals per week'
            }
          ],
          monitoring: [
            {
              parameter: 'Skin elasticity',
              method: 'Pinch test on back of hand',
              frequency: 'Weekly',
              targetRange: 'Immediate return to normal position',
              alertConditions: ['Delayed skin return', 'New dryness']
            }
          ],
          milestones: [
            {
              milestone: 'Stable skin hydration',
              expectedTimeframe: '2-3 weeks',
              successIndicators: ['Consistent skin texture', 'No flaking'],
              failureIndicators: ['Return of dryness', 'Skin sensitivity'],
              nextSteps: 'Transition to maintenance protocol'
            }
          ]
        }
      ],
      evidenceLevel: 'B',
      culturalAdaptations: [
        {
          aspect: 'Climate adaptation',
          mexicanContext: 'Mexican climate varies from humid coastal to dry highland',
          adaptationStrategy: 'Adjust protocol intensity based on regional humidity',
          culturalConsiderations: ['Seasonal monsoon effects', 'High altitude dryness']
        },
        {
          aspect: 'Ingredient sourcing',
          mexicanContext: 'Traditional Mexican medicinal plants readily available',
          adaptationStrategy: 'Prioritize locally available herbs and remedies',
          culturalConsiderations: ['Market availability', 'Cultural acceptance']
        }
      ],
      estimatedCost: {
        totalCostMXN: 580,
        phaseBreakdown: [
          {
            phase: 1,
            costMXN: 320,
            items: [
              { item: 'Fresh aloe vera plant', cost: 80 },
              { item: 'Organic chamomile tea', cost: 120 },
              { item: 'Humidifier (if needed)', cost: 120 }
            ]
          },
          {
            phase: 2,
            costMXN: 260,
            items: [
              { item: 'Rose hip oil', cost: 180 },
              { item: 'Omega-3 supplements', cost: 80 }
            ]
          }
        ],
        alternatives: [
          {
            option: 'Basic hydration protocol',
            costMXN: 200,
            description: 'Using only aloe vera and increased water intake'
          }
        ]
      },
      contraindications: ['Active skin infection', 'Open wounds', 'Known allergies to ingredients'],
      interactions: ['Topical medications (may affect absorption)'],
      followUpSchedule: {
        initialFollowUp: '1 week',
        ongoingSchedule: 'Every 2 weeks',
        emergencyContacts: false,
        selfMonitoring: ['Daily skin assessment', 'Hydration tracking']
      }
    });

    // Inflammatory Skin Protocol
    this.protocols.set('skin_inflammation_001', {
      id: 'skin_inflammation_001',
      name: 'Protocolo Anti-Inflamatorio Cutáneo',
      description: 'Tratamiento integral para reducir inflamación y enrojecimiento de la piel',
      category: 'dermatological',
      condition: ['inflammation', 'redness', 'irritation', 'high_inflammation_score'],
      constitution: ['pitta', 'hot', 'all'],
      duration: '4_weeks',
      phases: [
        {
          phase: 1,
          name: 'Reducción Aguda de Inflamación',
          duration: '1 week',
          goals: ['Reduce acute inflammation', 'Cool skin temperature', 'Soothe irritation'],
          herbs: [
            {
              herbName: 'calendula',
              mexicanName: 'caléndula',
              dosage: 'Topical cream 3x daily + tea 2x daily',
              preparation: 'Commercial cream or fresh flower infusion',
              timing: 'After cleansing, morning/lunch/evening',
              duration: '1 week',
              purpose: 'Powerful anti-inflammatory and healing agent',
              interactions: [],
              contraindications: ['Calendula family allergy'],
              localAvailability: {
                mexicanMarkets: true,
                pharmacies: true,
                growsWild: true,
                seasonality: 'Year-round',
                alternatives: ['manzanilla', 'hierba buena']
              }
            },
            {
              herbName: 'green tea',
              mexicanName: 'té verde',
              dosage: 'Cold compress 2x daily + drink 3 cups daily',
              preparation: 'Strong tea, cooled for compress',
              timing: 'Compress: morning/evening, Tea: throughout day',
              duration: '1 week',
              purpose: 'Antioxidant and anti-inflammatory cooling',
              interactions: ['Caffeine sensitivity'],
              contraindications: ['Severe caffeine intolerance'],
              localAvailability: {
                mexicanMarkets: true,
                pharmacies: true,
                growsWild: false,
                seasonality: 'Year-round',
                alternatives: ['white tea', 'rooibos']
              }
            }
          ],
          lifestyle: [
            {
              category: 'environment',
              recommendation: 'Avoid sun exposure and heat',
              mexicanAdaptation: 'Essential in intense Mexican sun',
              priority: 'essential',
              implementation: 'Stay indoors during peak hours 11am-4pm'
            },
            {
              category: 'diet',
              recommendation: 'Eliminate spicy foods and alcohol',
              mexicanAdaptation: 'Temporarily avoid traditional spicy Mexican foods',
              priority: 'essential',
              implementation: 'Focus on cooling foods: cucumber, watermelon, coconut'
            }
          ],
          monitoring: [
            {
              parameter: 'Skin redness level',
              method: 'Visual assessment scale 1-10',
              frequency: 'Twice daily',
              targetRange: '50% reduction from baseline',
              alertConditions: ['Increased redness', 'New areas of inflammation']
            }
          ],
          milestones: [
            {
              milestone: 'Visible reduction in redness',
              expectedTimeframe: '2-3 days',
              successIndicators: ['Less red appearance', 'Reduced skin temperature'],
              failureIndicators: ['No improvement', 'Worsening inflammation'],
              nextSteps: 'Continue current protocol or increase cooling measures'
            }
          ]
        }
      ],
      evidenceLevel: 'A',
      culturalAdaptations: [
        {
          aspect: 'Sun protection',
          mexicanContext: 'Intense UV radiation in most of Mexico',
          adaptationStrategy: 'Emphasize sun avoidance and natural shade',
          culturalConsiderations: ['Siesta tradition supports midday rest']
        }
      ],
      estimatedCost: {
        totalCostMXN: 340,
        phaseBreakdown: [
          {
            phase: 1,
            costMXN: 340,
            items: [
              { item: 'Calendula cream', cost: 150 },
              { item: 'Green tea (high quality)', cost: 90 },
              { item: 'Cooling gel mask', cost: 100 }
            ]
          }
        ],
        alternatives: [
          {
            option: 'Home remedy version',
            costMXN: 120,
            description: 'Using fresh herbs and homemade preparations'
          }
        ]
      },
      contraindications: ['Active infection', 'Open wounds'],
      interactions: ['Topical steroids'],
      followUpSchedule: {
        initialFollowUp: '3 days',
        ongoingSchedule: 'Weekly',
        emergencyContacts: true,
        selfMonitoring: ['Inflammation tracking', 'Temperature assessment']
      }
    });
  }

  /**
   * Add circulatory treatment protocols
   */
  private addCirculatoryProtocols(): void {
    this.protocols.set('circulation_enhancement_001', {
      id: 'circulation_enhancement_001',
      name: 'Protocolo de Mejora Circulatoria Facial',
      description: 'Programa integral para mejorar circulación facial y oxigenación tisular',
      category: 'circulatory',
      condition: ['poor_circulation', 'pallor', 'circulation_issues', 'low_circulation_score'],
      constitution: ['vata', 'cold', 'all'],
      duration: '8_weeks',
      phases: [
        {
          phase: 1,
          name: 'Activación Circulatoria',
          duration: '2 weeks',
          goals: ['Stimulate blood flow', 'Improve oxygenation', 'Enhance lymphatic drainage'],
          herbs: [
            {
              herbName: 'ginkgo biloba',
              mexicanName: 'ginkgo',
              dosage: '120mg standardized extract daily',
              preparation: 'Standardized capsules or tea from dried leaves',
              timing: 'With breakfast',
              duration: '2 weeks',
              purpose: 'Improve cerebral and peripheral circulation',
              interactions: ['Blood thinners', 'Antiplatelet medications'],
              contraindications: ['Bleeding disorders', 'Upcoming surgery'],
              localAvailability: {
                mexicanMarkets: false,
                pharmacies: true,
                growsWild: false,
                seasonality: 'Year-round (supplements)',
                alternatives: ['gotu kola', 'cayenne pepper']
              }
            },
            {
              herbName: 'cayenne pepper',
              mexicanName: 'chile cayena',
              dosage: '1/4 teaspoon in warm water 2x daily',
              preparation: 'Powder mixed in warm water or tea',
              timing: 'Morning and afternoon',
              duration: '2 weeks',
              purpose: 'Stimulate circulation and warm the body',
              interactions: ['Blood pressure medications'],
              contraindications: ['Stomach ulcers', 'GERD'],
              localAvailability: {
                mexicanMarkets: true,
                pharmacies: true,
                growsWild: true,
                seasonality: 'Year-round',
                alternatives: ['black pepper', 'ginger']
              }
            }
          ],
          lifestyle: [
            {
              category: 'exercise',
              recommendation: 'Daily facial massage 5-10 minutes',
              mexicanAdaptation: 'Incorporate traditional Mexican massage techniques',
              priority: 'essential',
              implementation: 'Use upward strokes, focus on lymph nodes'
            },
            {
              category: 'exercise',
              recommendation: 'Cardiovascular exercise 30 minutes daily',
              mexicanAdaptation: 'Dancing (traditional Mexican dances), walking',
              priority: 'important',
              implementation: 'Start with 15 minutes, gradually increase'
            }
          ],
          monitoring: [
            {
              parameter: 'Facial color and warmth',
              method: 'Visual and tactile assessment',
              frequency: 'Daily',
              targetRange: 'Improved pink coloration, warmer skin',
              alertConditions: ['Persistent pallor', 'Cold extremities']
            }
          ],
          milestones: [
            {
              milestone: 'Improved facial color',
              expectedTimeframe: '1 week',
              successIndicators: ['Better pink tone', 'Warmer skin temperature'],
              failureIndicators: ['No color improvement', 'Continued coldness'],
              nextSteps: 'Increase circulation stimulation activities'
            }
          ]
        }
      ],
      evidenceLevel: 'B',
      culturalAdaptations: [
        {
          aspect: 'Exercise preferences',
          mexicanContext: 'Traditional Mexican dances and family activities',
          adaptationStrategy: 'Incorporate culturally enjoyable physical activities',
          culturalConsiderations: ['Family participation', 'Cultural dance forms']
        }
      ],
      estimatedCost: {
        totalCostMXN: 620,
        phaseBreakdown: [
          {
            phase: 1,
            costMXN: 620,
            items: [
              { item: 'Ginkgo supplements (1 month)', cost: 280 },
              { item: 'Cayenne pepper', cost: 40 },
              { item: 'Massage oil', cost: 150 },
              { item: 'Exercise equipment (optional)', cost: 150 }
            ]
          }
        ],
        alternatives: [
          {
            option: 'Natural herbs only',
            costMXN: 190,
            description: 'Using only locally available herbs without supplements'
          }
        ]
      },
      contraindications: ['Bleeding disorders', 'Recent surgery'],
      interactions: ['Anticoagulant medications'],
      followUpSchedule: {
        initialFollowUp: '1 week',
        ongoingSchedule: 'Every 2 weeks',
        emergencyContacts: false,
        selfMonitoring: ['Daily circulation check', 'Exercise tracking']
      }
    });
  }

  /**
   * Add structural/symmetry treatment protocols
   */
  private addStructuralProtocols(): void {
    this.protocols.set('facial_symmetry_001', {
      id: 'facial_symmetry_001',
      name: 'Protocolo de Equilibrio Facial y Muscular',
      description: 'Terapia para mejorar simetría facial y balance muscular',
      category: 'structural',
      condition: ['facial_asymmetry', 'muscle_imbalance', 'structural_issues', 'low_symmetry_score'],
      constitution: ['all'],
      duration: '12_weeks',
      phases: [
        {
          phase: 1,
          name: 'Relajación y Liberación',
          duration: '4 weeks',
          goals: ['Release muscle tension', 'Improve flexibility', 'Reduce compensation patterns'],
          herbs: [
            {
              herbName: 'arnica',
              mexicanName: 'árnica',
              dosage: 'Topical gel 2x daily + homeopathic pellets',
              preparation: 'Commercial gel or tincture diluted',
              timing: 'After massage, morning and evening',
              duration: '4 weeks',
              purpose: 'Reduce muscle tension and inflammation',
              interactions: [],
              contraindications: ['Open wounds', 'Arnica allergy'],
              localAvailability: {
                mexicanMarkets: true,
                pharmacies: true,
                growsWild: true,
                seasonality: 'Year-round',
                alternatives: ['comfrey', 'calendula']
              }
            }
          ],
          lifestyle: [
            {
              category: 'exercise',
              recommendation: 'Facial yoga and massage daily',
              mexicanAdaptation: 'Combine with traditional Mexican relaxation practices',
              priority: 'essential',
              implementation: '20 minutes daily, focus on asymmetric areas'
            },
            {
              category: 'stress',
              recommendation: 'Stress reduction and jaw relaxation',
              mexicanAdaptation: 'Family support and community practices',
              priority: 'important',
              implementation: 'Meditation, family time, reduce jaw clenching'
            }
          ],
          monitoring: [
            {
              parameter: 'Facial symmetry measurements',
              method: 'Photo documentation and ruler measurements',
              frequency: 'Weekly',
              targetRange: 'Progressive improvement in symmetry',
              alertConditions: ['Worsening asymmetry', 'New symptoms']
            }
          ],
          milestones: [
            {
              milestone: 'Reduced muscle tension',
              expectedTimeframe: '2 weeks',
              successIndicators: ['Less jaw tightness', 'Improved range of motion'],
              failureIndicators: ['Continued tension', 'Pain increase'],
              nextSteps: 'Progress to strengthening phase'
            }
          ]
        }
      ],
      evidenceLevel: 'C',
      culturalAdaptations: [
        {
          aspect: 'Therapy approach',
          mexicanContext: 'Traditional Mexican massage and family healing',
          adaptationStrategy: 'Incorporate family participation in therapy',
          culturalConsiderations: ['Community support', 'Traditional techniques']
        }
      ],
      estimatedCost: {
        totalCostMXN: 890,
        phaseBreakdown: [
          {
            phase: 1,
            costMXN: 890,
            items: [
              { item: 'Arnica gel and pellets', cost: 180 },
              { item: 'Massage therapy sessions', cost: 600 },
              { item: 'Exercise accessories', cost: 110 }
            ]
          }
        ],
        alternatives: [
          {
            option: 'Self-therapy version',
            costMXN: 290,
            description: 'Home-based exercises and family massage'
          }
        ]
      },
      contraindications: ['TMJ disorders requiring medical care', 'Recent facial surgery'],
      interactions: ['Muscle relaxants'],
      followUpSchedule: {
        initialFollowUp: '2 weeks',
        ongoingSchedule: 'Monthly',
        emergencyContacts: false,
        selfMonitoring: ['Daily symmetry check', 'Tension assessment']
      }
    });
  }

  /**
   * Add respiratory protocols
   */
  private addRespiratoryProtocols(): void {
    this.protocols.set('respiratory_support_001', {
      id: 'respiratory_support_001',
      name: 'Protocolo de Apoyo Respiratorio',
      description: 'Fortalecimiento del sistema respiratorio y mejora de oxigenación',
      category: 'respiratory',
      condition: ['breathing_issues', 'poor_oxygenation', 'respiratory_patterns'],
      constitution: ['kapha', 'damp', 'all'],
      duration: '6_weeks',
      phases: [
        {
          phase: 1,
          name: 'Apertura y Limpieza',
          duration: '2 weeks',
          goals: ['Open airways', 'Clear respiratory passages', 'Improve breathing patterns'],
          herbs: [
            {
              herbName: 'eucalyptus',
              mexicanName: 'eucalipto',
              dosage: 'Steam inhalation 2x daily + tea 3x daily',
              preparation: 'Essential oil for steam, dried leaves for tea',
              timing: 'Morning and evening steam, tea throughout day',
              duration: '2 weeks',
              purpose: 'Expectorant and respiratory antiseptic',
              interactions: [],
              contraindications: ['Asthma (use carefully)', 'Children under 3'],
              localAvailability: {
                mexicanMarkets: true,
                pharmacies: true,
                growsWild: true,
                seasonality: 'Year-round',
                alternatives: ['pine needles', 'mint']
              }
            }
          ],
          lifestyle: [
            {
              category: 'exercise',
              recommendation: 'Breathing exercises and pranayama',
              mexicanAdaptation: 'Practice in fresh morning air',
              priority: 'essential',
              implementation: '15 minutes twice daily'
            }
          ],
          monitoring: [
            {
              parameter: 'Breathing ease and depth',
              method: 'Subjective assessment and breath counting',
              frequency: 'Daily',
              targetRange: 'Easier, deeper breathing',
              alertConditions: ['Difficulty breathing', 'Chest tightness']
            }
          ],
          milestones: [
            {
              milestone: 'Clearer breathing',
              expectedTimeframe: '3-5 days',
              successIndicators: ['Less congestion', 'Deeper breaths'],
              failureIndicators: ['Continued difficulty', 'Worsening symptoms'],
              nextSteps: 'Continue protocol or seek medical evaluation'
            }
          ]
        }
      ],
      evidenceLevel: 'Traditional',
      culturalAdaptations: [
        {
          aspect: 'Air quality',
          mexicanContext: 'Mexico City and industrial areas have air quality challenges',
          adaptationStrategy: 'Emphasize indoor air purification and timing of outdoor activities',
          culturalConsiderations: ['Urban vs rural differences', 'Seasonal air quality']
        }
      ],
      estimatedCost: {
        totalCostMXN: 380,
        phaseBreakdown: [
          {
            phase: 1,
            costMXN: 380,
            items: [
              { item: 'Eucalyptus essential oil', cost: 120 },
              { item: 'Dried eucalyptus leaves', cost: 60 },
              { item: 'Steam inhaler', cost: 200 }
            ]
          }
        ],
        alternatives: [
          {
            option: 'Simple steam method',
            costMXN: 180,
            description: 'Using bowl and towel method'
          }
        ]
      },
      contraindications: ['Severe asthma', 'Respiratory infections'],
      interactions: ['Bronchodilators'],
      followUpSchedule: {
        initialFollowUp: '1 week',
        ongoingSchedule: 'Every 2 weeks',
        emergencyContacts: true,
        selfMonitoring: ['Daily breathing assessment']
      }
    });
  }

  /**
   * Add digestive protocols (enhanced from original)
   */
  private addDigestiveProtocols(): void {
    this.protocols.set('digestive_health_001', {
      id: 'digestive_health_001',
      name: 'Protocolo de Salud Digestiva Integral',
      description: 'Protocolo completo para mejorar función digestiva usando medicina tradicional mexicana',
      category: 'digestive',
      condition: ['digestive_issues', 'stomach_heat', 'poor_digestion', 'bloating'],
      constitution: ['pitta', 'all'],
      duration: '6_weeks',
      phases: [
        {
          phase: 1,
          name: 'Calming digestive fire',
          duration: '2 weeks',
          goals: ['Reduce inflammation', 'Cool excessive heat'],
          herbs: [
            {
              herbName: 'chamomile',
              mexicanName: 'manzanilla',
              dosage: '1 cup tea, 3 times daily',
              preparation: 'Hot tea infusion, 5 minutes',
              timing: '30 minutes before meals',
              duration: '2 weeks',
              purpose: 'Cool digestive fire and reduce inflammation',
              interactions: [],
              contraindications: ['Pregnancy (large amounts)'],
              localAvailability: {
                mexicanMarkets: true,
                pharmacies: true,
                growsWild: false,
                seasonality: 'Year-round (dried)',
                alternatives: ['hierba buena', 'toronjil']
              }
            }
          ],
          lifestyle: [
            {
              category: 'diet',
              recommendation: 'Avoid spicy and fried foods',
              mexicanAdaptation: 'Temporarily reduce traditional spicy Mexican dishes',
              priority: 'essential',
              implementation: 'Focus on bland, cooling foods for 2 weeks'
            }
          ],
          monitoring: [
            {
              parameter: 'Digestive comfort',
              method: 'Symptom tracking scale 1-10',
              frequency: 'After each meal',
              targetRange: 'Reduced bloating and discomfort',
              alertConditions: ['Severe pain', 'Blood in stool']
            }
          ],
          milestones: [
            {
              milestone: 'Reduced bloating after meals',
              expectedTimeframe: '1 week',
              successIndicators: ['Less post-meal discomfort', 'Better digestion'],
              failureIndicators: ['Continued bloating', 'Worsening symptoms'],
              nextSteps: 'Progress to strengthening phase'
            }
          ]
        }
      ],
      evidenceLevel: 'A',
      culturalAdaptations: [
        {
          aspect: 'Dietary modification',
          mexicanContext: 'Traditional Mexican cuisine is often spicy',
          adaptationStrategy: 'Gradually reintroduce spices after healing phase',
          culturalConsiderations: ['Family meal traditions', 'Cultural food significance']
        }
      ],
      estimatedCost: {
        totalCostMXN: 340,
        phaseBreakdown: [
          {
            phase: 1,
            costMXN: 340,
            items: [
              { item: 'Organic chamomile tea', cost: 120 },
              { item: 'Digestive herbs blend', cost: 220 }
            ]
          }
        ],
        alternatives: [
          {
            option: 'Market herbs',
            costMXN: 180,
            description: 'Fresh herbs from local Mexican markets'
          }
        ]
      },
      contraindications: ['Gastrointestinal bleeding', 'Severe gastroparesis'],
      interactions: ['Acid-reducing medications'],
      followUpSchedule: {
        initialFollowUp: '1 week',
        ongoingSchedule: 'Every 2 weeks',
        emergencyContacts: false,
        selfMonitoring: ['Meal reaction tracking', 'Symptom diary']
      }
    });
  }

  /**
   * Add nervous system protocols
   */
  private addNervousSystemProtocols(): void {
    this.protocols.set('nervous_system_001', {
      id: 'nervous_system_001',
      name: 'Protocolo de Equilibrio del Sistema Nervioso',
      description: 'Fortalecimiento y equilibrio del sistema nervioso para reducir estrés y ansiedad',
      category: 'nervous',
      condition: ['stress_indicators', 'nervous_tension', 'anxiety_signs', 'low_emotional_resilience'],
      constitution: ['vata', 'all'],
      duration: '8_weeks',
      phases: [
        {
          phase: 1,
          name: 'Calming and Grounding',
          duration: '4 weeks',
          goals: ['Reduce nervous system hyperactivity', 'Improve stress resilience', 'Enhance relaxation'],
          herbs: [
            {
              herbName: 'valerian',
              mexicanName: 'valeriana',
              dosage: '300-600mg before bedtime',
              preparation: 'Standardized extract or tea from dried root',
              timing: '30 minutes before sleep',
              duration: '4 weeks',
              purpose: 'Calm nervous system and improve sleep quality',
              interactions: ['Sedative medications', 'Alcohol'],
              contraindications: ['Pregnancy', 'Liver disease'],
              localAvailability: {
                mexicanMarkets: true,
                pharmacies: true,
                growsWild: true,
                seasonality: 'Year-round',
                alternatives: ['passiflora', 'toronjil']
              }
            },
            {
              herbName: 'lemon balm',
              mexicanName: 'toronjil',
              dosage: '2-3 cups tea daily',
              preparation: 'Fresh or dried leaf tea',
              timing: 'Throughout the day, especially afternoon',
              duration: '4 weeks',
              purpose: 'Gentle nervous system support and mood balance',
              interactions: [],
              contraindications: ['Thyroid disorders (theoretical)'],
              localAvailability: {
                mexicanMarkets: true,
                pharmacies: true,
                growsWild: true,
                seasonality: 'Year-round',
                alternatives: ['hierba buena', 'manzanilla']
              }
            }
          ],
          lifestyle: [
            {
              category: 'stress',
              recommendation: 'Daily meditation or relaxation practice',
              mexicanAdaptation: 'Include prayer or family quiet time',
              priority: 'essential',
              implementation: '15-20 minutes daily, consistent timing'
            },
            {
              category: 'sleep',
              recommendation: 'Establish regular sleep schedule',
              mexicanAdaptation: 'Align with traditional Mexican meal and rest times',
              priority: 'essential',
              implementation: 'Same bedtime/wake time, no screens 1 hour before bed'
            },
            {
              category: 'social',
              recommendation: 'Strengthen social support systems',
              mexicanAdaptation: 'Emphasize family and community connections',
              priority: 'important',
              implementation: 'Regular family meals, community activities'
            }
          ],
          monitoring: [
            {
              parameter: 'Stress level and sleep quality',
              method: 'Daily 1-10 scale rating',
              frequency: 'Daily evening',
              targetRange: 'Stress <5, Sleep quality >7',
              alertConditions: ['Panic attacks', 'Severe insomnia']
            }
          ],
          milestones: [
            {
              milestone: 'Improved sleep patterns',
              expectedTimeframe: '1-2 weeks',
              successIndicators: ['Falling asleep easier', 'More restful sleep'],
              failureIndicators: ['Continued insomnia', 'Increased anxiety'],
              nextSteps: 'Adjust herbal dosages or add complementary practices'
            }
          ]
        }
      ],
      evidenceLevel: 'A',
      culturalAdaptations: [
        {
          aspect: 'Stress management',
          mexicanContext: 'Traditional Mexican family and community support systems',
          adaptationStrategy: 'Leverage cultural strengths in family support',
          culturalConsiderations: ['Extended family involvement', 'Religious/spiritual practices']
        }
      ],
      estimatedCost: {
        totalCostMXN: 520,
        phaseBreakdown: [
          {
            phase: 1,
            costMXN: 520,
            items: [
              { item: 'Valerian supplements', cost: 240 },
              { item: 'Lemon balm tea', cost: 80 },
              { item: 'Meditation accessories', cost: 200 }
            ]
          }
        ],
        alternatives: [
          {
            option: 'Herbal teas only',
            costMXN: 180,
            description: 'Using only traditional herbal teas'
          }
        ]
      },
      contraindications: ['Severe depression requiring medication', 'Active substance abuse'],
      interactions: ['Antidepressants', 'Sleep medications'],
      followUpSchedule: {
        initialFollowUp: '1 week',
        ongoingSchedule: 'Every 2 weeks',
        emergencyContacts: true,
        selfMonitoring: ['Daily stress tracking', 'Sleep diary']
      }
    });
  }

  /**
   * Add endocrine/hormonal protocols
   */
  private addEndocrineProtocols(): void {
    this.protocols.set('hormonal_balance_001', {
      id: 'hormonal_balance_001',
      name: 'Protocolo de Equilibrio Hormonal',
      description: 'Apoyo natural para equilibrio hormonal y función endocrina',
      category: 'endocrine',
      condition: ['hormonal_imbalance', 'endocrine_dysfunction', 'metabolic_issues'],
      constitution: ['all'],
      duration: '12_weeks',
      phases: [
        {
          phase: 1,
          name: 'Detoxification and Support',
          duration: '4 weeks',
          goals: ['Support liver detoxification', 'Balance stress hormones', 'Improve insulin sensitivity'],
          herbs: [
            {
              herbName: 'milk thistle',
              mexicanName: 'cardo mariano',
              dosage: '200mg standardized extract 2x daily',
              preparation: 'Standardized silymarin extract',
              timing: 'With meals',
              duration: '4 weeks',
              purpose: 'Support liver detoxification of excess hormones',
              interactions: ['Diabetes medications'],
              contraindications: ['Ragweed allergy'],
              localAvailability: {
                mexicanMarkets: false,
                pharmacies: true,
                growsWild: false,
                seasonality: 'Year-round (supplements)',
                alternatives: ['dandelion root', 'burdock']
              }
            }
          ],
          lifestyle: [
            {
              category: 'diet',
              recommendation: 'Reduce processed foods and sugar',
              mexicanAdaptation: 'Focus on traditional whole foods: beans, squash, amaranth',
              priority: 'essential',
              implementation: 'Eliminate packaged foods, cook from scratch'
            }
          ],
          monitoring: [
            {
              parameter: 'Energy levels and mood stability',
              method: 'Daily tracking scale 1-10',
              frequency: 'Daily',
              targetRange: 'Stable energy >6, mood swings reduced',
              alertConditions: ['Severe fatigue', 'Extreme mood changes']
            }
          ],
          milestones: [
            {
              milestone: 'Improved energy stability',
              expectedTimeframe: '2-3 weeks',
              successIndicators: ['More consistent energy', 'Better mood'],
              failureIndicators: ['Continued fatigue', 'Worsening symptoms'],
              nextSteps: 'Progress to hormone-specific support'
            }
          ]
        }
      ],
      evidenceLevel: 'B',
      culturalAdaptations: [
        {
          aspect: 'Traditional foods',
          mexicanContext: 'Traditional Mexican diet includes hormone-supporting foods',
          adaptationStrategy: 'Emphasize traditional whole foods over modern processed items',
          culturalConsiderations: ['Ancestral food wisdom', 'Family cooking traditions']
        }
      ],
      estimatedCost: {
        totalCostMXN: 680,
        phaseBreakdown: [
          {
            phase: 1,
            costMXN: 680,
            items: [
              { item: 'Milk thistle supplements', cost: 320 },
              { item: 'Hormone support herbs', cost: 240 },
              { item: 'Organic whole foods upgrade', cost: 120 }
            ]
          }
        ],
        alternatives: [
          {
            option: 'Food-based approach',
            costMXN: 320,
            description: 'Using traditional foods and simple herbs'
          }
        ]
      },
      contraindications: ['Hormone-sensitive cancers', 'Pregnancy'],
      interactions: ['Hormone replacement therapy', 'Birth control pills'],
      followUpSchedule: {
        initialFollowUp: '2 weeks',
        ongoingSchedule: 'Monthly',
        emergencyContacts: false,
        selfMonitoring: ['Cycle tracking (if applicable)', 'Energy monitoring']
      }
    });
  }

  /**
   * Add constitutional balancing protocols
   */
  private addConstitutionalProtocols(): void {
    this.protocols.set('constitutional_vata_001', {
      id: 'constitutional_vata_001',
      name: 'Protocolo de Equilibrio Vata',
      description: 'Equilibrio específico para constitución Vata con hierbas mexicanas',
      category: 'constitutional',
      condition: ['vata_imbalance', 'vata_constitution', 'anxiety', 'dryness', 'irregularity'],
      constitution: ['vata'],
      duration: '8_weeks',
      phases: [
        {
          phase: 1,
          name: 'Grounding and Nourishing',
          duration: '4 weeks',
          goals: ['Ground excessive movement', 'Nourish tissues', 'Establish routine'],
          herbs: [
            {
              herbName: 'ashwagandha',
              mexicanName: 'ginseng indio',
              dosage: '300-500mg twice daily',
              preparation: 'Standardized root extract',
              timing: 'With meals',
              duration: '4 weeks',
              purpose: 'Adaptogenic support for stress and grounding',
              interactions: ['Immunosuppressants', 'Sedatives'],
              contraindications: ['Autoimmune conditions', 'Pregnancy'],
              localAvailability: {
                mexicanMarkets: false,
                pharmacies: true,
                growsWild: false,
                seasonality: 'Year-round (supplements)',
                alternatives: ['ginseng', 'rhodiola']
              }
            },
            {
              herbName: 'sesame oil',
              mexicanName: 'aceite de ajonjolí',
              dosage: 'Daily body massage + 1 tsp internally',
              preparation: 'Pure, cold-pressed sesame oil',
              timing: 'Morning massage, oil with food',
              duration: '4 weeks',
              purpose: 'Nourish and ground Vata constitution',
              interactions: [],
              contraindications: ['Sesame allergy'],
              localAvailability: {
                mexicanMarkets: true,
                pharmacies: true,
                growsWild: false,
                seasonality: 'Year-round',
                alternatives: ['almond oil', 'coconut oil']
              }
            }
          ],
          lifestyle: [
            {
              category: 'diet',
              recommendation: 'Regular meals, warm foods, adequate fats',
              mexicanAdaptation: 'Traditional Mexican stews and warm tortillas',
              priority: 'essential',
              implementation: 'Same meal times daily, avoid cold/raw foods'
            },
            {
              category: 'sleep',
              recommendation: 'Regular sleep schedule, early bedtime',
              mexicanAdaptation: 'Align with natural light cycles',
              priority: 'essential',
              implementation: 'Bed by 10pm, wake by 6am consistently'
            }
          ],
          monitoring: [
            {
              parameter: 'Anxiety levels and regularity',
              method: 'Daily anxiety scale + regularity tracking',
              frequency: 'Daily',
              targetRange: 'Anxiety <5, improved routine adherence',
              alertConditions: ['Panic attacks', 'Severe irregularity']
            }
          ],
          milestones: [
            {
              milestone: 'Established routine and reduced anxiety',
              expectedTimeframe: '2-3 weeks',
              successIndicators: ['Better sleep pattern', 'Less scattered feeling'],
              failureIndicators: ['Continued chaos', 'Worsening anxiety'],
              nextSteps: 'Strengthen routine and add rejuvenative practices'
            }
          ]
        }
      ],
      evidenceLevel: 'Traditional',
      culturalAdaptations: [
        {
          aspect: 'Routine establishment',
          mexicanContext: 'Traditional Mexican family routines and meal times',
          adaptationStrategy: 'Build on existing cultural routines',
          culturalConsiderations: ['Family meal times', 'Cultural rhythm of life']
        }
      ],
      estimatedCost: {
        totalCostMXN: 750,
        phaseBreakdown: [
          {
            phase: 1,
            costMXN: 750,
            items: [
              { item: 'Ashwagandha supplements', cost: 380 },
              { item: 'Pure sesame oil', cost: 120 },
              { item: 'Warming spices', cost: 150 },
              { item: 'Grounding accessories', cost: 100 }
            ]
          }
        ],
        alternatives: [
          {
            option: 'Basic grounding protocol',
            costMXN: 270,
            description: 'Simple oils and traditional warming foods'
          }
        ]
      },
      contraindications: ['Autoimmune conditions', 'High blood pressure (monitor with ashwagandha)'],
      interactions: ['Thyroid medications', 'Blood pressure medications'],
      followUpSchedule: {
        initialFollowUp: '2 weeks',
        ongoingSchedule: 'Monthly',
        emergencyContacts: false,
        selfMonitoring: ['Routine adherence', 'Anxiety tracking']
      }
    });
  }

  /**
   * Add emotional/stress protocols
   */
  private addEmotionalProtocols(): void {
    this.protocols.set('emotional_resilience_001', {
      id: 'emotional_resilience_001',
      name: 'Protocolo de Resiliencia Emocional',
      description: 'Fortalecimiento emocional y manejo del estrés con apoyo comunitario mexicano',
      category: 'emotional',
      condition: ['chronic_stress', 'emotional_imbalance', 'low_resilience', 'stress_patterns'],
      constitution: ['all'],
      duration: '10_weeks',
      phases: [
        {
          phase: 1,
          name: 'Emotional Stabilization',
          duration: '4 weeks',
          goals: ['Stabilize mood', 'Improve stress response', 'Build coping skills'],
          herbs: [
            {
              herbName: 'passionflower',
              mexicanName: 'pasiflora',
              dosage: '2-3 cups tea daily or 200mg extract',
              preparation: 'Tea from dried herb or standardized extract',
              timing: 'Between meals and before bedtime',
              duration: '4 weeks',
              purpose: 'Calm nervous system and reduce anxiety',
              interactions: ['Sedative medications'],
              contraindications: ['Pregnancy', 'Surgery (discontinue 2 weeks prior)'],
              localAvailability: {
                mexicanMarkets: true,
                pharmacies: true,
                growsWild: true,
                seasonality: 'Year-round',
                alternatives: ['manzanilla', 'toronjil']
              }
            },
            {
              herbName: 'St. John\'s wort',
              mexicanName: 'corazoncillo',
              dosage: '300mg standardized extract 3x daily',
              preparation: 'Standardized extract (0.3% hypericin)',
              timing: 'With meals',
              duration: '4 weeks',
              purpose: 'Natural mood support and emotional balance',
              interactions: ['Many medications - check with healthcare provider'],
              contraindications: ['Pregnancy', 'Bipolar disorder'],
              localAvailability: {
                mexicanMarkets: false,
                pharmacies: true,
                growsWild: false,
                seasonality: 'Year-round (supplements)',
                alternatives: ['rhodiola', 'ginkgo']
              }
            }
          ],
          lifestyle: [
            {
              category: 'social',
              recommendation: 'Strengthen family and community connections',
              mexicanAdaptation: 'Leverage traditional Mexican family support systems',
              priority: 'essential',
              implementation: 'Regular family meals, community activities, godparent relationships'
            },
            {
              category: 'stress',
              recommendation: 'Daily stress management practice',
              mexicanAdaptation: 'Include prayer, meditation, or traditional practices',
              priority: 'essential',
              implementation: '20 minutes daily of chosen stress-relief practice'
            },
            {
              category: 'exercise',
              recommendation: 'Gentle, enjoyable physical activity',
              mexicanAdaptation: 'Traditional dance, walking in nature, family activities',
              priority: 'important',
              implementation: '30 minutes 4-5 times per week'
            }
          ],
          monitoring: [
            {
              parameter: 'Mood stability and stress response',
              method: 'Daily mood tracking scale 1-10',
              frequency: 'Daily evening',
              targetRange: 'Mood 6-8, stress response improved',
              alertConditions: ['Suicidal thoughts', 'Severe depression']
            },
            {
              parameter: 'Social connection quality',
              method: 'Weekly relationship satisfaction assessment',
              frequency: 'Weekly',
              targetRange: 'Improved family/community connections',
              alertConditions: ['Increasing isolation', 'Family conflict']
            }
          ],
          milestones: [
            {
              milestone: 'Improved daily mood stability',
              expectedTimeframe: '2-3 weeks',
              successIndicators: ['Less mood swings', 'Better stress handling'],
              failureIndicators: ['Worsening depression', 'Increased anxiety'],
              nextSteps: 'Continue current protocol or adjust herbal support'
            },
            {
              milestone: 'Stronger social connections',
              expectedTimeframe: '3-4 weeks',
              successIndicators: ['More family time', 'Community involvement'],
              failureIndicators: ['Continued isolation', 'Relationship problems'],
              nextSteps: 'Focus on specific relationship building activities'
            }
          ]
        },
        {
          phase: 2,
          name: 'Resilience Building',
          duration: '6 weeks',
          goals: ['Build long-term resilience', 'Develop healthy coping mechanisms', 'Create sustainable support systems'],
          herbs: [
            {
              herbName: 'rhodiola',
              mexicanName: 'rodíola',
              dosage: '200-400mg daily',
              preparation: 'Standardized extract (3% rosavins, 1% salidroside)',
              timing: 'Morning on empty stomach',
              duration: '6 weeks',
              purpose: 'Adaptogenic support for stress resilience and mental clarity',
              interactions: ['Antidepressants (monitor)', 'Diabetes medications'],
              contraindications: ['Bipolar disorder', 'Pregnancy'],
              localAvailability: {
                mexicanMarkets: false,
                pharmacies: true,
                growsWild: false,
                seasonality: 'Year-round (supplements)',
                alternatives: ['ginseng', 'schisandra']
              }
            }
          ],
          lifestyle: [
            {
              category: 'stress',
              recommendation: 'Advanced stress management techniques',
              mexicanAdaptation: 'Integrate traditional Mexican wisdom and modern techniques',
              priority: 'essential',
              implementation: 'Combine meditation with traditional prayers or cultural practices'
            },
            {
              category: 'social',
              recommendation: 'Give back to community',
              mexicanAdaptation: 'Volunteer in community, help family members',
              priority: 'important',
              implementation: 'Regular community service or family support activities'
            }
          ],
          monitoring: [
            {
              parameter: 'Stress resilience and adaptation',
              method: 'Weekly stress challenge response assessment',
              frequency: 'Weekly',
              targetRange: 'Better handling of daily stressors',
              alertConditions: ['Inability to cope with normal stress', 'Regression in progress']
            }
          ],
          milestones: [
            {
              milestone: 'Consistent stress resilience',
              expectedTimeframe: '4-5 weeks',
              successIndicators: ['Handling challenges better', 'Stable mood despite stressors'],
              failureIndicators: ['Easy overwhelm', 'Return of old patterns'],
              nextSteps: 'Transition to maintenance phase'
            }
          ]
        }
      ],
      evidenceLevel: 'B',
      culturalAdaptations: [
        {
          aspect: 'Family support integration',
          mexicanContext: 'Strong family structures and extended family networks in Mexican culture',
          adaptationStrategy: 'Build treatment around existing family support systems',
          culturalConsiderations: ['Extended family involvement', 'Godparent (padrino) system', 'Community celebrations']
        },
        {
          aspect: 'Spiritual practices',
          mexicanContext: 'Integration of Catholic faith with indigenous spiritual practices',
          adaptationStrategy: 'Respect and incorporate existing spiritual practices',
          culturalConsiderations: ['Religious observances', 'Traditional ceremonies', 'Saints and spiritual protection']
        },
        {
          aspect: 'Communication styles',
          mexicanContext: 'Cultural norms around emotional expression and family hierarchy',
          adaptationStrategy: 'Work within cultural communication patterns',
          culturalConsiderations: ['Respect for elders', 'Gender roles', 'Indirect communication styles']
        }
      ],
      estimatedCost: {
        totalCostMXN: 1240,
        phaseBreakdown: [
          {
            phase: 1,
            costMXN: 680,
            items: [
              { item: 'Passionflower tea/extract', cost: 180 },
              { item: 'St. John\'s wort supplements', cost: 320 },
              { item: 'Stress management resources', cost: 180 }
            ]
          },
          {
            phase: 2,
            costMXN: 560,
            items: [
              { item: 'Rhodiola supplements', cost: 420 },
              { item: 'Advanced wellness resources', cost: 140 }
            ]
          }
        ],
        alternatives: [
          {
            option: 'Community-based support',
            costMXN: 380,
            description: 'Focus on traditional herbs and family/community support'
          },
          {
            option: 'Herbal teas only',
            costMXN: 240,
            description: 'Using only locally available Mexican medicinal plants'
          }
        ]
      },
      contraindications: [
        'Active suicidal ideation (requires immediate professional intervention)',
        'Severe mental illness requiring medication',
        'Substance abuse disorders',
        'Pregnancy (some herbs)'
      ],
      interactions: [
        'Antidepressant medications',
        'Anti-anxiety medications',
        'Sleep medications',
        'Blood pressure medications'
      ],
      followUpSchedule: {
        initialFollowUp: '1 week',
        ongoingSchedule: 'Every 2 weeks for first 6 weeks, then monthly',
        emergencyContacts: true,
        selfMonitoring: [
          'Daily mood tracking',
          'Weekly stress level assessment',
          'Monthly relationship quality evaluation',
          'Suicidal ideation screening (if applicable)'
        ]
      }
    });
  }

  /**
   * Get all protocols
   */
  getAllProtocols(): Map<string, TreatmentProtocol> {
    return new Map(this.protocols);
  }

  /**
   * Get protocol by ID
   */
  getProtocolById(id: string): TreatmentProtocol | undefined {
    return this.protocols.get(id);
  }

  /**
   * Get protocols by category
   */
  getProtocolsByCategory(category: ProtocolCategory): TreatmentProtocol[] {
    return Array.from(this.protocols.values()).filter(
      protocol => protocol.category === category
    );
  }

  /**
   * Get protocols by condition
   */
  getProtocolsByCondition(condition: string): TreatmentProtocol[] {
    return Array.from(this.protocols.values()).filter(
      protocol => protocol.condition.some(c => 
        c.toLowerCase().includes(condition.toLowerCase()) ||
        condition.toLowerCase().includes(c.toLowerCase())
      )
    );
  }

  /**
   * Get protocols by constitution type
   */
  getProtocolsByConstitution(constitution: ConstitutionType): TreatmentProtocol[] {
    return Array.from(this.protocols.values()).filter(
      protocol => protocol.constitution.includes(constitution) || 
                 protocol.constitution.includes('all')
    );
  }

  /**
   * Search protocols by multiple criteria
   */
  searchProtocols(criteria: {
    category?: ProtocolCategory;
    condition?: string;
    constitution?: ConstitutionType;
    maxDuration?: ProtocolDuration;
    maxCost?: number;
  }): TreatmentProtocol[] {
    return Array.from(this.protocols.values()).filter(protocol => {
      // Category filter
      if (criteria.category && protocol.category !== criteria.category) {
        return false;
      }
      
      // Condition filter
      if (criteria.condition) {
        const hasCondition = protocol.condition.some(c => 
          c.toLowerCase().includes(criteria.condition!.toLowerCase()) ||
          criteria.condition!.toLowerCase().includes(c.toLowerCase())
        );
        if (!hasCondition) return false;
      }
      
      // Constitution filter
      if (criteria.constitution) {
        const hasConstitution = protocol.constitution.includes(criteria.constitution) || 
                               protocol.constitution.includes('all');
        if (!hasConstitution) return false;
      }
      
      // Duration filter (simplified)
      if (criteria.maxDuration) {
        // Simple duration comparison - in real implementation would parse duration strings
        const durationWeeks = this.parseDurationToWeeks(protocol.duration);
        const maxWeeks = this.parseDurationToWeeks(criteria.maxDuration);
        if (durationWeeks > maxWeeks) return false;
      }
      
      // Cost filter
      if (criteria.maxCost && protocol.estimatedCost.totalCostMXN > criteria.maxCost) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Get protocol categories
   */
  getProtocolCategories(): ProtocolCategory[] {
    const categories = new Set<ProtocolCategory>();
    this.protocols.forEach(protocol => {
      categories.add(protocol.category);
    });
    return Array.from(categories);
  }

  /**
   * Get protocol statistics
   */
  getProtocolStatistics(): {
    totalProtocols: number;
    byCategory: Record<ProtocolCategory, number>;
    averageDuration: number;
    averageCost: number;
    evidenceLevels: Record<EvidenceLevel, number>;
  } {
    const stats = {
      totalProtocols: this.protocols.size,
      byCategory: {} as Record<ProtocolCategory, number>,
      averageDuration: 0,
      averageCost: 0,
      evidenceLevels: {} as Record<EvidenceLevel, number>
    };
    
    const protocols = Array.from(this.protocols.values());
    
    // Count by category
    protocols.forEach(protocol => {
      stats.byCategory[protocol.category] = (stats.byCategory[protocol.category] || 0) + 1;
      stats.evidenceLevels[protocol.evidenceLevel] = (stats.evidenceLevels[protocol.evidenceLevel] || 0) + 1;
    });
    
    // Calculate averages
    stats.averageDuration = protocols.reduce((sum, p) => sum + this.parseDurationToWeeks(p.duration), 0) / protocols.length;
    stats.averageCost = protocols.reduce((sum, p) => sum + p.estimatedCost.totalCostMXN, 0) / protocols.length;
    
    return stats;
  }

  /**
   * Helper method to parse duration to weeks
   */
  private parseDurationToWeeks(duration: ProtocolDuration): number {
    switch (duration) {
      case '1_week': return 1;
      case '2_weeks': return 2;
      case '4_weeks': return 4;
      case '6_weeks': return 6;
      case '8_weeks': return 8;
      case '12_weeks': return 12;
      case 'ongoing': return 52; // Assume 1 year for ongoing
      default: return 4; // Default to 4 weeks
    }
  }
}