/**
 * EnhancedProtocolMatcher - Improved protocol matching for Vision API findings
 */

import { loggingService } from './LoggingService';
import { HealthIndicator, ConstitutionalMarkers } from './RealComprehensiveMedicalImageAnalyzer';
import { TreatmentProtocol } from './ComprehensiveProtocolDatabase';

export class EnhancedProtocolMatcher {
  /**
   * Enhanced scoring that prioritizes Vision API findings
   */
  static enhanceProtocolScoring(
    protocol: TreatmentProtocol,
    findings: HealthIndicator[],
    existingScore: number,
    existingReasons: string[]
  ): {
    enhancedScore: number;
    enhancedReasons: string[];
  } {
    let enhancedScore = existingScore;
    const enhancedReasons = [...existingReasons];

    // Check for Vision API findings (they have confidence of 0.85)
    const visionAPIFindings = findings.filter(f => f.confidence === 0.85);
    const hasVisionAPIFindings = visionAPIFindings.length > 0;

    if (hasVisionAPIFindings) {
      loggingService.info('EnhancedProtocolMatcher', 'Vision API findings detected', {
        count: visionAPIFindings.length,
        findings: visionAPIFindings.map(f => f.finding)
      });

      // Give significant bonus for protocols that match Vision API findings
      visionAPIFindings.forEach(visionFinding => {
        const findingLower = visionFinding.finding.toLowerCase();
        
        // Check for specific condition matches
        const specificConditionMatches = [
          { condition: 'rosácea', protocolKeywords: ['rosácea', 'rosacea', 'enrojecimiento facial'] },
          { condition: 'acné', protocolKeywords: ['acné', 'acne', 'comedones', 'pústulas'] },
          { condition: 'dermatitis', protocolKeywords: ['dermatitis', 'eczema', 'inflamación cutánea'] },
          { condition: 'melasma', protocolKeywords: ['melasma', 'manchas', 'pigmentación'] },
          { condition: 'psoriasis', protocolKeywords: ['psoriasis', 'descamación', 'placas'] },
          { condition: 'vitiligo', protocolKeywords: ['vitiligo', 'despigmentación'] }
        ];

        for (const match of specificConditionMatches) {
          if (findingLower.includes(match.condition)) {
            // Check if protocol is specific for this condition
            const protocolNameLower = protocol.name.toLowerCase();
            const protocolConditionsLower = protocol.condition.map(c => c.toLowerCase()).join(' ');
            
            for (const keyword of match.protocolKeywords) {
              if (protocolNameLower.includes(keyword) || protocolConditionsLower.includes(keyword)) {
                enhancedScore += 30; // Significant bonus for specific match
                enhancedReasons.push(`✅ Protocolo específico para ${match.condition} detectado por Vision API`);
                
                loggingService.info('EnhancedProtocolMatcher', 'Specific protocol match for Vision API finding', {
                  condition: match.condition,
                  protocol: protocol.name,
                  bonus: 30
                });
                break;
              }
            }
          }
        }

        // Additional bonus if protocol targets the same organ systems
        if (visionFinding.organSystems && protocol.targetOrganSystems) {
          const matchingOrgans = visionFinding.organSystems.filter(organ =>
            protocol.targetOrganSystems?.some(target => 
              target.toLowerCase() === organ.toLowerCase()
            )
          );
          
          if (matchingOrgans.length > 0) {
            enhancedScore += 10 * matchingOrgans.length;
            enhancedReasons.push(`🎯 Sistemas coincidentes con Vision API: ${matchingOrgans.join(', ')}`);
          }
        }
      });

      // Penalty for generic protocols when Vision API found specific conditions
      if (protocol.name.toLowerCase().includes('general') || 
          protocol.name.toLowerCase().includes('bienestar')) {
        const hasSpecificCondition = visionAPIFindings.some(f => 
          ['rosácea', 'acné', 'dermatitis', 'eczema', 'psoriasis', 'melasma'].some(condition =>
            f.finding.toLowerCase().includes(condition)
          )
        );
        
        if (hasSpecificCondition) {
          enhancedScore *= 0.3; // Heavy penalty
          enhancedReasons.push('❌ Protocolo genérico penalizado - Vision API detectó condición específica');
        }
      }
    }

    return {
      enhancedScore: Math.min(100, enhancedScore),
      enhancedReasons
    };
  }

  /**
   * Create custom protocol phases based on Vision API observations
   */
  static generateCustomPhases(
    visionAnalysis: string,
    findings: HealthIndicator[]
  ): Array<{
    phase: number;
    name: string;
    duration: string;
    goals: string[];
    focus: string;
  }> {
    const phases = [];
    
    // Analyze severity to determine phase structure
    const hasSevere = findings.some(f => f.severity === 'high');
    const hasModerate = findings.some(f => f.severity === 'moderate');
    
    if (hasSevere) {
      // Urgent intervention phase
      phases.push({
        phase: 1,
        name: 'Fase de Intervención Inmediata',
        duration: '1 semana',
        goals: [
          'Controlar síntomas agudos',
          'Reducir inflamación activa',
          'Estabilizar la condición'
        ],
        focus: 'Control rápido basado en hallazgos de Vision API'
      });
    }

    // Main treatment phase based on specific findings
    const mainPhaseDuration = hasSevere ? '3 semanas' : '4 semanas';
    phases.push({
      phase: hasSevere ? 2 : 1,
      name: 'Fase de Tratamiento Principal',
      duration: mainPhaseDuration,
      goals: findings.slice(0, 3).map(f => 
        `Tratar: ${f.finding.substring(0, 50)}...`
      ),
      focus: 'Tratamiento específico de condiciones detectadas'
    });

    // Maintenance phase
    phases.push({
      phase: phases.length + 1,
      name: 'Fase de Mantenimiento y Prevención',
      duration: '4 semanas',
      goals: [
        'Mantener mejoras obtenidas',
        'Prevenir recurrencias',
        'Fortalecer sistemas afectados'
      ],
      focus: 'Consolidación de resultados'
    });

    return phases;
  }
}