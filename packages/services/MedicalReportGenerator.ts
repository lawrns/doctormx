/**
 * MedicalReportGenerator - Generates comprehensive medical reports in Spanish
 */

import { ComprehensiveAnalysisResult } from './RealComprehensiveMedicalImageAnalyzer';
import { PersonalizedTreatmentPlan } from './IntelligentTreatmentEngine';
import { loggingService } from './LoggingService';

export interface MedicalReport {
  reportId: string;
  generatedAt: Date;
  patientInfo: {
    analysisDate: string;
    analysisType: string;
  };
  clinicalSummary: string;
  detailedFindings: {
    category: string;
    findings: string[];
    severity: string;
    recommendations: string[];
  }[];
  diagnosticImpression: string;
  treatmentPlan: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  followUpRecommendations: string;
  disclaimers: string[];
  signature: {
    generatedBy: string;
    aiDisclaimer: string;
  };
}

export class MedicalReportGenerator {
  private static instance: MedicalReportGenerator;

  static getInstance(): MedicalReportGenerator {
    if (!MedicalReportGenerator.instance) {
      MedicalReportGenerator.instance = new MedicalReportGenerator();
    }
    return MedicalReportGenerator.instance;
  }

  /**
   * Generate comprehensive medical report
   */
  async generateReport(
    analysisResult: ComprehensiveAnalysisResult,
    treatmentPlan?: PersonalizedTreatmentPlan,
    patientContext?: any
  ): Promise<MedicalReport> {
    loggingService.info('MedicalReportGenerator', 'Generating medical report');

    const reportId = this.generateReportId();
    const generatedAt = new Date();

    // Map analysis type to Spanish
    const analysisTypeMap: Record<string, string> = {
      'facial_analysis': 'Análisis Facial Integral',
      'eye_analysis': 'Análisis Ocular e Iridología',
      'tongue_diagnosis': 'Diagnóstico de Lengua (MTC)',
      'skin_analysis': 'Análisis Dermatológico',
      'nail_analysis': 'Análisis de Uñas',
      'hair_scalp_analysis': 'Análisis Capilar y Tricológico',
      'posture_analysis': 'Análisis Postural Biomecánico',
      'comprehensive_scan': 'Evaluación Médica Integral'
    };

    // Generate clinical summary
    const clinicalSummary = this.generateClinicalSummary(analysisResult);

    // Process detailed findings
    const detailedFindings = this.processDetailedFindings(analysisResult);

    // Generate diagnostic impression
    const diagnosticImpression = this.generateDiagnosticImpression(analysisResult);

    // Create treatment plan sections
    const treatmentPlanSections = this.generateTreatmentPlanSections(analysisResult, treatmentPlan);

    // Generate follow-up recommendations
    const followUpRecommendations = this.generateFollowUpRecommendations(analysisResult);

    const report: MedicalReport = {
      reportId,
      generatedAt,
      patientInfo: {
        analysisDate: generatedAt.toLocaleDateString('es-MX', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        analysisType: analysisTypeMap[analysisResult.analysisType] || 'Análisis Médico'
      },
      clinicalSummary,
      detailedFindings,
      diagnosticImpression,
      treatmentPlan: treatmentPlanSections,
      followUpRecommendations,
      disclaimers: [
        'Este reporte es generado por inteligencia artificial y debe ser revisado por un profesional médico.',
        'No sustituye una consulta médica profesional.',
        'Los resultados son orientativos y requieren confirmación clínica.',
        'En caso de síntomas severos o emergencia, acuda inmediatamente a un servicio médico.'
      ],
      signature: {
        generatedBy: 'Sistema de IA Médica DoctorMX',
        aiDisclaimer: 'Reporte generado automáticamente mediante análisis de imagen con IA'
      }
    };

    loggingService.info('MedicalReportGenerator', 'Report generated successfully', {
      reportId,
      findingsCount: detailedFindings.length
    });

    return report;
  }

  /**
   * Generate clinical summary in Spanish
   */
  private generateClinicalSummary(analysisResult: ComprehensiveAnalysisResult): string {
    const healthStatus = this.getHealthStatusSpanish(analysisResult.overallHealthScore.status);
    const urgencyLevel = this.getUrgencyLevelSpanish(analysisResult.urgencyLevel);
    
    let summary = `RESUMEN CLÍNICO:\n\n`;
    summary += `Estado de Salud General: ${healthStatus} (Puntuación: ${analysisResult.overallHealthScore.score}/100)\n`;
    summary += `Nivel de Urgencia: ${urgencyLevel}\n`;
    summary += `Confianza del Análisis: ${Math.round(analysisResult.confidence * 100)}%\n\n`;
    
    summary += `HALLAZGOS PRINCIPALES:\n`;
    analysisResult.primaryFindings.slice(0, 3).forEach((finding, index) => {
      summary += `${index + 1}. ${finding.finding}\n`;
    });

    if (analysisResult.aiInsights) {
      summary += `\nANÁLISIS DE VISIÓN ARTIFICIAL:\n`;
      summary += analysisResult.aiInsights.analysis + '\n';
    }

    return summary;
  }

  /**
   * Process detailed findings into structured format
   */
  private processDetailedFindings(analysisResult: ComprehensiveAnalysisResult): MedicalReport['detailedFindings'] {
    const findingsByCategory = new Map<string, typeof analysisResult.primaryFindings>();

    // Group findings by category
    [...analysisResult.primaryFindings, ...analysisResult.secondaryFindings].forEach(finding => {
      const category = this.getCategorySpanish(finding.category);
      if (!findingsByCategory.has(category)) {
        findingsByCategory.set(category, []);
      }
      findingsByCategory.get(category)!.push(finding);
    });

    // Convert to structured format
    const detailedFindings: MedicalReport['detailedFindings'] = [];
    
    findingsByCategory.forEach((findings, category) => {
      detailedFindings.push({
        category,
        findings: findings.map(f => f.finding),
        severity: this.getSeveritySpanish(findings[0].severity),
        recommendations: findings.flatMap(f => f.recommendations || [])
      });
    });

    return detailedFindings;
  }

  /**
   * Generate diagnostic impression
   */
  private generateDiagnosticImpression(analysisResult: ComprehensiveAnalysisResult): string {
    let impression = 'IMPRESIÓN DIAGNÓSTICA:\n\n';

    // Constitutional assessment
    if (analysisResult.constitutionalAssessment) {
      impression += 'EVALUACIÓN CONSTITUCIONAL:\n';
      impression += `- Tipo Ayurvédico: ${this.getAyurvedicTypeSpanish(analysisResult.constitutionalAssessment.ayurvedicType)}\n`;
      impression += `- Constitución MTC: ${this.getTCMConstitutionSpanish(analysisResult.constitutionalAssessment.tcmConstitution)}\n`;
      impression += `- Tipo Metabólico: ${this.getMetabolicTypeSpanish(analysisResult.constitutionalAssessment.metabolicType)}\n\n`;
    }

    // Primary diagnosis
    impression += 'DIAGNÓSTICO PRINCIPAL:\n';
    const primaryDiagnosis = this.synthesizePrimaryDiagnosis(analysisResult);
    impression += primaryDiagnosis + '\n\n';

    // Secondary findings
    if (analysisResult.secondaryFindings.length > 0) {
      impression += 'HALLAZGOS SECUNDARIOS:\n';
      analysisResult.secondaryFindings.slice(0, 3).forEach((finding, index) => {
        impression += `${index + 1}. ${finding.finding}\n`;
      });
    }

    return impression;
  }

  /**
   * Generate treatment plan sections
   */
  private generateTreatmentPlanSections(
    analysisResult: ComprehensiveAnalysisResult,
    treatmentPlan?: PersonalizedTreatmentPlan
  ): MedicalReport['treatmentPlan'] {
    const sections: MedicalReport['treatmentPlan'] = {
      immediate: [],
      shortTerm: [],
      longTerm: []
    };

    // Immediate actions (within 48 hours)
    if (analysisResult.urgencyLevel === 'emergency' || analysisResult.urgencyLevel === 'urgent') {
      sections.immediate.push('Consultar con médico especialista en las próximas 24-48 horas');
    }
    
    analysisResult.treatmentRecommendations
      .filter(rec => rec.urgency === 'emergency' || rec.urgency === 'urgent')
      .forEach(rec => {
        sections.immediate.push(...rec.recommendations);
      });

    // Short-term actions (1-4 weeks)
    if (treatmentPlan?.protocol.phases[0]) {
      const phase1 = treatmentPlan.protocol.phases[0];
      sections.shortTerm.push(`Iniciar ${phase1.name} (${phase1.duration})`);
      phase1.herbs.forEach(herb => {
        sections.shortTerm.push(`${herb.mexicanName}: ${herb.dosage} - ${herb.timing}`);
      });
    }

    // Long-term actions (1-3 months)
    analysisResult.treatmentRecommendations
      .filter(rec => rec.urgency === 'routine' || rec.urgency === 'moderate')
      .forEach(rec => {
        sections.longTerm.push(...rec.recommendations.slice(0, 3));
      });

    // Add lifestyle recommendations
    if (analysisResult.mexicanCulturalContext.length > 0) {
      sections.longTerm.push(...analysisResult.mexicanCulturalContext.slice(0, 2));
    }

    return sections;
  }

  /**
   * Generate follow-up recommendations
   */
  private generateFollowUpRecommendations(analysisResult: ComprehensiveAnalysisResult): string {
    let followUp = 'RECOMENDACIONES DE SEGUIMIENTO:\n\n';

    // Determine follow-up timeline
    const followUpSchedule = this.determineFollowUpSchedule(analysisResult);
    followUp += `Próxima Evaluación: ${followUpSchedule}\n\n`;

    // Specialist referrals
    if (analysisResult.urgentReferrals.length > 0) {
      followUp += 'REFERENCIAS ESPECIALIZADAS RECOMENDADAS:\n';
      analysisResult.urgentReferrals.forEach((referral, index) => {
        followUp += `${index + 1}. ${referral}\n`;
      });
      followUp += '\n';
    }

    // Monitoring parameters
    followUp += 'PARÁMETROS A MONITOREAR:\n';
    followUp += '1. Evolución de síntomas principales\n';
    followUp += '2. Respuesta al tratamiento inicial\n';
    followUp += '3. Aparición de nuevos síntomas\n';
    followUp += '4. Cambios en estado general de salud\n\n';

    // Red flags
    followUp += 'SIGNOS DE ALARMA (Consultar inmediatamente si presenta):\n';
    followUp += '- Empeoramiento súbito de síntomas\n';
    followUp += '- Aparición de dolor severo\n';
    followUp += '- Cambios drásticos en estado general\n';
    followUp += '- Cualquier síntoma que genere preocupación\n';

    return followUp;
  }

  // Helper methods for Spanish translations

  private getHealthStatusSpanish(status: string): string {
    const statusMap: Record<string, string> = {
      'poor': 'Deficiente',
      'fair': 'Regular',
      'good': 'Bueno',
      'excellent': 'Excelente'
    };
    return statusMap[status] || status;
  }

  private getUrgencyLevelSpanish(level?: string): string {
    if (!level) return 'Rutina';
    const urgencyMap: Record<string, string> = {
      'routine': 'Rutina',
      'monitor': 'Seguimiento',
      'consult': 'Consulta Pronta',
      'urgent': 'Urgente',
      'emergency': 'Emergencia'
    };
    return urgencyMap[level] || level;
  }

  private getCategorySpanish(category: string): string {
    const categoryMap: Record<string, string> = {
      'circulatory': 'Sistema Circulatorio',
      'digestive': 'Sistema Digestivo',
      'respiratory': 'Sistema Respiratorio',
      'nervous': 'Sistema Nervioso',
      'structural': 'Sistema Musculoesquelético',
      'dermatological': 'Sistema Dermatológico',
      'emotional': 'Salud Emocional',
      'constitutional': 'Constitucional',
      'metabolic': 'Sistema Metabólico',
      'endocrine': 'Sistema Endocrino',
      'nutritional': 'Estado Nutricional'
    };
    return categoryMap[category] || category;
  }

  private getSeveritySpanish(severity: string): string {
    const severityMap: Record<string, string> = {
      'low': 'Leve',
      'moderate': 'Moderado',
      'high': 'Severo',
      'severe': 'Severo'
    };
    return severityMap[severity] || severity;
  }

  private getAyurvedicTypeSpanish(type: string): string {
    const typeMap: Record<string, string> = {
      'vata': 'Vata (Aire/Espacio)',
      'pitta': 'Pitta (Fuego/Agua)',
      'kapha': 'Kapha (Tierra/Agua)',
      'mixed': 'Mixto'
    };
    return typeMap[type] || type;
  }

  private getTCMConstitutionSpanish(constitution: string): string {
    const constitutionMap: Record<string, string> = {
      'hot': 'Calor',
      'cold': 'Frío',
      'damp': 'Humedad',
      'dry': 'Sequedad',
      'balanced': 'Equilibrado'
    };
    return constitutionMap[constitution] || constitution;
  }

  private getMetabolicTypeSpanish(type: string): string {
    const typeMap: Record<string, string> = {
      'fast': 'Rápido',
      'normal': 'Normal',
      'slow': 'Lento'
    };
    return typeMap[type] || type;
  }

  private synthesizePrimaryDiagnosis(analysisResult: ComprehensiveAnalysisResult): string {
    // Create a coherent diagnosis based on findings
    const primaryFindings = analysisResult.primaryFindings.slice(0, 2);
    let diagnosis = '';

    if (primaryFindings.length === 0) {
      diagnosis = 'No se detectaron hallazgos patológicos significativos. Estado general dentro de parámetros normales.';
    } else {
      diagnosis = 'Basado en el análisis integral, se observa: ';
      diagnosis += primaryFindings.map(f => f.finding).join('. Además, ');
      diagnosis += '. El cuadro clínico sugiere necesidad de intervención terapéutica dirigida.';
    }

    return diagnosis;
  }

  private determineFollowUpSchedule(analysisResult: ComprehensiveAnalysisResult): string {
    switch (analysisResult.urgencyLevel) {
      case 'emergency':
        return 'Inmediata - Acudir a urgencias';
      case 'urgent':
        return 'Dentro de 24-48 horas';
      case 'consult':
        return 'Dentro de 1 semana';
      case 'monitor':
        return 'En 2-4 semanas';
      default:
        return analysisResult.followUpSchedule || 'En 4-6 semanas';
    }
  }

  private generateReportId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `REP-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Format report for display as HTML
   */
  formatReportAsHTML(report: MedicalReport): string {
    let html = `
      <div class="medical-report">
        <header class="report-header">
          <h1>REPORTE MÉDICO</h1>
          <p>ID: ${report.reportId}</p>
          <p>Fecha: ${report.patientInfo.analysisDate}</p>
          <p>Tipo de Análisis: ${report.patientInfo.analysisType}</p>
        </header>

        <section class="clinical-summary">
          <h2>RESUMEN CLÍNICO</h2>
          <pre>${report.clinicalSummary}</pre>
        </section>

        <section class="detailed-findings">
          <h2>HALLAZGOS DETALLADOS</h2>
    `;

    report.detailedFindings.forEach(finding => {
      html += `
        <div class="finding-category">
          <h3>${finding.category}</h3>
          <p><strong>Severidad:</strong> ${finding.severity}</p>
          <h4>Hallazgos:</h4>
          <ul>
            ${finding.findings.map(f => `<li>${f}</li>`).join('')}
          </ul>
          <h4>Recomendaciones:</h4>
          <ul>
            ${finding.recommendations.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
      `;
    });

    html += `
        </section>

        <section class="diagnostic-impression">
          <h2>IMPRESIÓN DIAGNÓSTICA</h2>
          <pre>${report.diagnosticImpression}</pre>
        </section>

        <section class="treatment-plan">
          <h2>PLAN DE TRATAMIENTO</h2>
          <div class="treatment-immediate">
            <h3>Acciones Inmediatas (24-48 horas):</h3>
            <ul>
              ${report.treatmentPlan.immediate.map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
          <div class="treatment-short">
            <h3>Corto Plazo (1-4 semanas):</h3>
            <ul>
              ${report.treatmentPlan.shortTerm.map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
          <div class="treatment-long">
            <h3>Largo Plazo (1-3 meses):</h3>
            <ul>
              ${report.treatmentPlan.longTerm.map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
        </section>

        <section class="follow-up">
          <h2>SEGUIMIENTO</h2>
          <pre>${report.followUpRecommendations}</pre>
        </section>

        <section class="disclaimers">
          <h2>AVISOS IMPORTANTES</h2>
          <ul>
            ${report.disclaimers.map(d => `<li>${d}</li>`).join('')}
          </ul>
        </section>

        <footer class="report-footer">
          <p><strong>${report.signature.generatedBy}</strong></p>
          <p><em>${report.signature.aiDisclaimer}</em></p>
          <p>Generado: ${report.generatedAt.toLocaleString('es-MX')}</p>
        </footer>
      </div>
    `;

    return html;
  }

  /**
   * Format report for PDF export
   */
  formatReportForPDF(report: MedicalReport): string {
    // Similar to HTML but with PDF-friendly styling
    return this.formatReportAsHTML(report);
  }
}