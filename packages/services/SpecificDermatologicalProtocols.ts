/**
 * Specific Dermatological Protocols for Vision API detected conditions
 */

import { TreatmentProtocol } from './ComprehensiveProtocolDatabase';
import { loggingService } from './LoggingService';

export const specificDermatologicalProtocols: TreatmentProtocol[] = [
  {
    id: 'rosacea_specific_001',
    name: 'Protocolo Específico para Rosácea',
    description: 'Tratamiento integral para rosácea con enfoque antiinflamatorio y reparador',
    category: 'dermatological',
    condition: ['rosácea', 'enrojecimiento facial persistente', 'telangiectasias'],
    constitution: ['pitta', 'hot'],
    duration: '8_weeks',
    targetOrganSystems: ['integumentario', 'circulatorio', 'inmunológico'],
    phases: [
      {
        phase: 1,
        name: 'Control de Inflamación Aguda',
        duration: '2 semanas',
        goals: [
          'Reducir enrojecimiento activo',
          'Calmar irritación cutánea',
          'Estabilizar barrera cutánea'
        ],
        herbs: [
          {
            herbName: 'Calendula',
            mexicanName: 'Caléndula',
            dosage: '2 tazas',
            preparation: 'Infusión',
            timing: 'Mañana y noche',
            duration: '2 semanas',
            purpose: 'Antiinflamatorio y cicatrizante',
            interactions: [],
            contraindications: [],
            localAvailability: {
              mexicanMarkets: true,
              pharmacies: true,
              growsWild: true,
              seasonality: 'Todo el año',
              alternatives: ['Manzanilla']
            }
          },
          {
            herbName: 'Green Tea',
            mexicanName: 'Té Verde',
            dosage: '3 tazas',
            preparation: 'Infusión fría',
            timing: 'Durante el día',
            duration: '2 semanas',
            purpose: 'Antioxidante y antiinflamatorio',
            interactions: [],
            contraindications: ['Sensibilidad a cafeína'],
            localAvailability: {
              mexicanMarkets: true,
              pharmacies: true,
              growsWild: false,
              seasonality: 'Todo el año',
              alternatives: ['Té blanco']
            }
          }
        ],
        lifestyle: [
          {
            category: 'diet',
            recommendation: 'Evitar alimentos picantes, alcohol y cafeína',
            mexicanAdaptation: 'Reducir chile, evitar tequila y café',
            priority: 'essential',
            implementation: 'Sustituir picante con hierbas aromáticas'
          },
          {
            category: 'skincare',
            recommendation: 'Usar protector solar mineral SPF 30+',
            mexicanAdaptation: 'Aplicar cada 2 horas en altitud mexicana',
            priority: 'essential',
            implementation: 'Buscar fórmulas con óxido de zinc'
          }
        ],
        monitoring: [
          {
            parameter: 'Enrojecimiento facial',
            method: 'Fotografía diaria',
            frequency: 'Diario',
            targetRange: 'Reducción visible',
            alertConditions: ['Aumento de rojez', 'Nuevas pústulas']
          }
        ],
        milestones: [
          {
            milestone: 'Reducción del 30% en enrojecimiento',
            expectedTimeframe: '2 semanas',
            successIndicators: ['Menos episodios de flushing'],
            failureIndicators: ['Sin cambios visibles'],
            nextSteps: 'Continuar a fase 2'
          }
        ]
      },
      {
        phase: 2,
        name: 'Reparación y Fortalecimiento',
        duration: '4 semanas',
        goals: [
          'Fortalecer barrera cutánea',
          'Reducir sensibilidad',
          'Mejorar microcirculación'
        ],
        herbs: [
          {
            herbName: 'Aloe Vera',
            mexicanName: 'Sábila',
            dosage: 'Gel fresco',
            preparation: 'Aplicación tópica',
            timing: 'Noche',
            duration: '4 semanas',
            purpose: 'Hidratante y reparador',
            interactions: [],
            contraindications: [],
            localAvailability: {
              mexicanMarkets: true,
              pharmacies: true,
              growsWild: true,
              seasonality: 'Todo el año',
              alternatives: ['Gel de nopal']
            }
          },
          {
            herbName: 'Licorice Root',
            mexicanName: 'Regaliz',
            dosage: '1 taza',
            preparation: 'Decocción',
            timing: 'Tarde',
            duration: '4 semanas',
            purpose: 'Antiinflamatorio sistémico',
            interactions: ['Medicamentos para presión'],
            contraindications: ['Hipertensión'],
            localAvailability: {
              mexicanMarkets: true,
              pharmacies: true,
              growsWild: false,
              seasonality: 'Todo el año',
              alternatives: ['Gordolobo']
            }
          }
        ],
        lifestyle: [
          {
            category: 'stress',
            recommendation: 'Técnicas de relajación diarias',
            mexicanAdaptation: 'Meditación o temazcal semanal',
            priority: 'important',
            implementation: 'Dedicar 15 minutos antes de dormir'
          }
        ],
        monitoring: [
          {
            parameter: 'Sensibilidad cutánea',
            method: 'Escala subjetiva 1-10',
            frequency: 'Semanal',
            targetRange: 'Menor a 5',
            alertConditions: ['Aumento de sensibilidad']
          }
        ],
        milestones: [
          {
            milestone: 'Piel más resistente a triggers',
            expectedTimeframe: '4 semanas',
            successIndicators: ['Menos episodios de ardor'],
            failureIndicators: ['Sensibilidad persistente'],
            nextSteps: 'Fase de mantenimiento'
          }
        ]
      },
      {
        phase: 3,
        name: 'Mantenimiento a Largo Plazo',
        duration: '2 semanas + continuo',
        goals: [
          'Prevenir brotes',
          'Mantener piel equilibrada',
          'Identificar y evitar triggers'
        ],
        herbs: [
          {
            herbName: 'Chamomile',
            mexicanName: 'Manzanilla',
            dosage: '1-2 tazas',
            preparation: 'Infusión',
            timing: 'Según necesidad',
            duration: 'Continuo',
            purpose: 'Mantenimiento antiinflamatorio',
            interactions: [],
            contraindications: ['Alergia a asteráceas'],
            localAvailability: {
              mexicanMarkets: true,
              pharmacies: true,
              growsWild: true,
              seasonality: 'Todo el año',
              alternatives: ['Tila']
            }
          }
        ],
        lifestyle: [
          {
            category: 'prevention',
            recommendation: 'Diario de triggers',
            mexicanAdaptation: 'Anotar reacciones a comidas y clima',
            priority: 'important',
            implementation: 'Usar app o libreta'
          }
        ],
        monitoring: [
          {
            parameter: 'Frecuencia de brotes',
            method: 'Registro mensual',
            frequency: 'Mensual',
            targetRange: 'Menos de 2 al mes',
            alertConditions: ['Aumento de frecuencia']
          }
        ],
        milestones: [
          {
            milestone: 'Control sostenido de rosácea',
            expectedTimeframe: 'Continuo',
            successIndicators: ['Brotes mínimos', 'Piel estable'],
            failureIndicators: ['Brotes frecuentes'],
            nextSteps: 'Ajustar según necesidad'
          }
        ]
      }
    ],
    evidenceLevel: 'A',
    culturalAdaptations: [
      {
        aspect: 'Clima',
        mexicanContext: 'Considerar altitud y sol intenso mexicano',
        adaptationStrategy: 'Énfasis en protección solar y hidratación',
        culturalConsiderations: ['Uso de sombreros tradicionales']
      }
    ],
    estimatedCost: {
      totalCostMXN: 1200,
      phaseBreakdown: [
        { phase: 1, costMXN: 400, items: [{ item: 'Hierbas fase 1', cost: 200 }, { item: 'Protector solar', cost: 200 }] },
        { phase: 2, costMXN: 500, items: [{ item: 'Hierbas fase 2', cost: 300 }, { item: 'Sábila fresca', cost: 200 }] },
        { phase: 3, costMXN: 300, items: [{ item: 'Mantenimiento', cost: 300 }] }
      ],
      alternatives: [
        { option: 'Versión económica', costMXN: 800, description: 'Usando solo hierbas locales' }
      ]
    },
    contraindications: ['Alergia a plantas específicas', 'Rosácea fulminante (requiere dermatólogo)'],
    interactions: ['Retinoides tópicos', 'Medicamentos fotosensibilizantes'],
    followUpSchedule: {
      initialFollowUp: '2 semanas',
      ongoingSchedule: 'Mensual',
      emergencyContacts: true,
      selfMonitoring: ['Fotografías semanales', 'Diario de síntomas']
    }
  },
  
  {
    id: 'acne_specific_001',
    name: 'Protocolo Específico para Acné',
    description: 'Tratamiento integral para acné con enfoque en regulación hormonal y antibacteriano',
    category: 'dermatological',
    condition: ['acné', 'comedones', 'pústulas', 'acné hormonal'],
    constitution: ['pitta', 'kapha'],
    duration: '12_weeks',
    targetOrganSystems: ['integumentario', 'endocrino', 'digestivo'],
    phases: [
      {
        phase: 1,
        name: 'Desintoxicación y Limpieza',
        duration: '3 semanas',
        goals: [
          'Limpiar toxinas acumuladas',
          'Regular producción sebácea',
          'Reducir bacterias cutáneas'
        ],
        herbs: [
          {
            herbName: 'Burdock Root',
            mexicanName: 'Bardana',
            dosage: '2 cápsulas',
            preparation: 'Extracto seco',
            timing: 'Con comidas',
            duration: '3 semanas',
            purpose: 'Depurativo sanguíneo',
            interactions: ['Diuréticos'],
            contraindications: ['Embarazo'],
            localAvailability: {
              mexicanMarkets: true,
              pharmacies: true,
              growsWild: false,
              seasonality: 'Todo el año',
              alternatives: ['Diente de león']
            }
          },
          {
            herbName: 'Neem',
            mexicanName: 'Nim',
            dosage: '1 cápsula',
            preparation: 'Extracto',
            timing: 'Mañana',
            duration: '3 semanas',
            purpose: 'Antibacteriano natural',
            interactions: [],
            contraindications: ['Embarazo', 'Lactancia'],
            localAvailability: {
              mexicanMarkets: false,
              pharmacies: true,
              growsWild: false,
              seasonality: 'Importado',
              alternatives: ['Propóleo']
            }
          }
        ],
        lifestyle: [
          {
            category: 'diet',
            recommendation: 'Eliminar lácteos y azúcar refinada',
            mexicanAdaptation: 'Sustituir leche por agua de coco o almendra',
            priority: 'essential',
            implementation: 'Cambio gradual en 1 semana'
          }
        ],
        monitoring: [
          {
            parameter: 'Nuevas lesiones',
            method: 'Conteo diario',
            frequency: 'Diario',
            targetRange: 'Reducción progresiva',
            alertConditions: ['Aumento súbito de lesiones']
          }
        ],
        milestones: [
          {
            milestone: 'Reducción 40% en lesiones nuevas',
            expectedTimeframe: '3 semanas',
            successIndicators: ['Menos comedones nuevos'],
            failureIndicators: ['Sin cambios'],
            nextSteps: 'Continuar a fase 2'
          }
        ]
      }
    ],
    evidenceLevel: 'A',
    culturalAdaptations: [],
    estimatedCost: {
      totalCostMXN: 1800,
      phaseBreakdown: [
        { phase: 1, costMXN: 600, items: [{ item: 'Suplementos', cost: 400 }, { item: 'Productos tópicos', cost: 200 }] }
      ],
      alternatives: []
    },
    contraindications: ['Acné quístico severo', 'Embarazo'],
    interactions: ['Isotretinoína', 'Antibióticos orales'],
    followUpSchedule: {
      initialFollowUp: '3 semanas',
      ongoingSchedule: 'Mensual',
      emergencyContacts: true,
      selfMonitoring: ['Fotografías semanales', 'Registro de brotes']
    }
  }
];

export function addSpecificProtocolsToDatabase(database: any): void {
  specificDermatologicalProtocols.forEach(protocol => {
    database.protocols.set(protocol.id, protocol);
    loggingService.info('SpecificDermatologicalProtocols', `Added specific protocol: ${protocol.name}`, {
      id: protocol.id,
      conditions: protocol.condition
    });
  });
}