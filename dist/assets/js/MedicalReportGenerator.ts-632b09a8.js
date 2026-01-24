import{l as c}from"./chunk-92241edc.js";class s{static getInstance(){return s.instance||(s.instance=new s),s.instance}async generateReport(e,n,t){c.info("MedicalReportGenerator","Generating medical report");const i=this.generateReportId(),a=new Date,o={facial_analysis:"Análisis Facial Integral",eye_analysis:"Análisis Ocular e Iridología",tongue_diagnosis:"Diagnóstico de Lengua (MTC)",skin_analysis:"Análisis Dermatológico",nail_analysis:"Análisis de Uñas",hair_scalp_analysis:"Análisis Capilar y Tricológico",posture_analysis:"Análisis Postural Biomecánico",comprehensive_scan:"Evaluación Médica Integral"},l=this.generateClinicalSummary(e),r=this.processDetailedFindings(e),m=this.generateDiagnosticImpression(e),d=this.generateTreatmentPlanSections(e,n),g=this.generateFollowUpRecommendations(e),p={reportId:i,generatedAt:a,patientInfo:{analysisDate:a.toLocaleDateString("es-MX",{year:"numeric",month:"long",day:"numeric"}),analysisType:o[e.analysisType]||"Análisis Médico"},clinicalSummary:l,detailedFindings:r,diagnosticImpression:m,treatmentPlan:d,followUpRecommendations:g,disclaimers:["Este reporte es generado por inteligencia artificial y debe ser revisado por un profesional médico.","No sustituye una consulta médica profesional.","Los resultados son orientativos y requieren confirmación clínica.","En caso de síntomas severos o emergencia, acuda inmediatamente a un servicio médico."],signature:{generatedBy:"Sistema de IA Médica DoctorMX",aiDisclaimer:"Reporte generado automáticamente mediante análisis de imagen con IA"}};return c.info("MedicalReportGenerator","Report generated successfully",{reportId:i,findingsCount:r.length}),p}generateClinicalSummary(e){const n=this.getHealthStatusSpanish(e.overallHealthScore.status),t=this.getUrgencyLevelSpanish(e.urgencyLevel);let i=`RESUMEN CLÍNICO:

`;return i+=`Estado de Salud General: ${n} (Puntuación: ${e.overallHealthScore.score}/100)
`,i+=`Nivel de Urgencia: ${t}
`,i+=`Confianza del Análisis: ${Math.round(e.confidence*100)}%

`,i+=`HALLAZGOS PRINCIPALES:
`,e.primaryFindings.slice(0,3).forEach((a,o)=>{i+=`${o+1}. ${a.finding}
`}),e.aiInsights&&(i+=`
ANÁLISIS DE VISIÓN ARTIFICIAL:
`,i+=e.aiInsights.analysis+`
`),i}processDetailedFindings(e){const n=new Map;[...e.primaryFindings,...e.secondaryFindings].forEach(i=>{const a=this.getCategorySpanish(i.category);n.has(a)||n.set(a,[]),n.get(a).push(i)});const t=[];return n.forEach((i,a)=>{t.push({category:a,findings:i.map(o=>o.finding),severity:this.getSeveritySpanish(i[0].severity),recommendations:i.flatMap(o=>o.recommendations||[])})}),t}generateDiagnosticImpression(e){let n=`IMPRESIÓN DIAGNÓSTICA:

`;e.constitutionalAssessment&&(n+=`EVALUACIÓN CONSTITUCIONAL:
`,n+=`- Tipo Ayurvédico: ${this.getAyurvedicTypeSpanish(e.constitutionalAssessment.ayurvedicType)}
`,n+=`- Constitución MTC: ${this.getTCMConstitutionSpanish(e.constitutionalAssessment.tcmConstitution)}
`,n+=`- Tipo Metabólico: ${this.getMetabolicTypeSpanish(e.constitutionalAssessment.metabolicType)}

`),n+=`DIAGNÓSTICO PRINCIPAL:
`;const t=this.synthesizePrimaryDiagnosis(e);return n+=t+`

`,e.secondaryFindings.length>0&&(n+=`HALLAZGOS SECUNDARIOS:
`,e.secondaryFindings.slice(0,3).forEach((i,a)=>{n+=`${a+1}. ${i.finding}
`})),n}generateTreatmentPlanSections(e,n){const t={immediate:[],shortTerm:[],longTerm:[]};if((e.urgencyLevel==="emergency"||e.urgencyLevel==="urgent")&&t.immediate.push("Consultar con médico especialista en las próximas 24-48 horas"),e.treatmentRecommendations.filter(i=>i.urgency==="emergency"||i.urgency==="urgent").forEach(i=>{t.immediate.push(...i.recommendations)}),n!=null&&n.protocol.phases[0]){const i=n.protocol.phases[0];t.shortTerm.push(`Iniciar ${i.name} (${i.duration})`),i.herbs.forEach(a=>{t.shortTerm.push(`${a.mexicanName}: ${a.dosage} - ${a.timing}`)})}return e.treatmentRecommendations.filter(i=>i.urgency==="routine"||i.urgency==="moderate").forEach(i=>{t.longTerm.push(...i.recommendations.slice(0,3))}),e.mexicanCulturalContext.length>0&&t.longTerm.push(...e.mexicanCulturalContext.slice(0,2)),t}generateFollowUpRecommendations(e){let n=`RECOMENDACIONES DE SEGUIMIENTO:

`;const t=this.determineFollowUpSchedule(e);return n+=`Próxima Evaluación: ${t}

`,e.urgentReferrals.length>0&&(n+=`REFERENCIAS ESPECIALIZADAS RECOMENDADAS:
`,e.urgentReferrals.forEach((i,a)=>{n+=`${a+1}. ${i}
`}),n+=`
`),n+=`PARÁMETROS A MONITOREAR:
`,n+=`1. Evolución de síntomas principales
`,n+=`2. Respuesta al tratamiento inicial
`,n+=`3. Aparición de nuevos síntomas
`,n+=`4. Cambios en estado general de salud

`,n+=`SIGNOS DE ALARMA (Consultar inmediatamente si presenta):
`,n+=`- Empeoramiento súbito de síntomas
`,n+=`- Aparición de dolor severo
`,n+=`- Cambios drásticos en estado general
`,n+=`- Cualquier síntoma que genere preocupación
`,n}getHealthStatusSpanish(e){return{poor:"Deficiente",fair:"Regular",good:"Bueno",excellent:"Excelente"}[e]||e}getUrgencyLevelSpanish(e){return e?{routine:"Rutina",monitor:"Seguimiento",consult:"Consulta Pronta",urgent:"Urgente",emergency:"Emergencia"}[e]||e:"Rutina"}getCategorySpanish(e){return{circulatory:"Sistema Circulatorio",digestive:"Sistema Digestivo",respiratory:"Sistema Respiratorio",nervous:"Sistema Nervioso",structural:"Sistema Musculoesquelético",dermatological:"Sistema Dermatológico",emotional:"Salud Emocional",constitutional:"Constitucional",metabolic:"Sistema Metabólico",endocrine:"Sistema Endocrino",nutritional:"Estado Nutricional"}[e]||e}getSeveritySpanish(e){return{low:"Leve",moderate:"Moderado",high:"Severo",severe:"Severo"}[e]||e}getAyurvedicTypeSpanish(e){return{vata:"Vata (Aire/Espacio)",pitta:"Pitta (Fuego/Agua)",kapha:"Kapha (Tierra/Agua)",mixed:"Mixto"}[e]||e}getTCMConstitutionSpanish(e){return{hot:"Calor",cold:"Frío",damp:"Humedad",dry:"Sequedad",balanced:"Equilibrado"}[e]||e}getMetabolicTypeSpanish(e){return{fast:"Rápido",normal:"Normal",slow:"Lento"}[e]||e}synthesizePrimaryDiagnosis(e){const n=e.primaryFindings.slice(0,2);let t="";return n.length===0?t="No se detectaron hallazgos patológicos significativos. Estado general dentro de parámetros normales.":(t="Basado en el análisis integral, se observa: ",t+=n.map(i=>i.finding).join(". Además, "),t+=". El cuadro clínico sugiere necesidad de intervención terapéutica dirigida."),t}determineFollowUpSchedule(e){switch(e.urgencyLevel){case"emergency":return"Inmediata - Acudir a urgencias";case"urgent":return"Dentro de 24-48 horas";case"consult":return"Dentro de 1 semana";case"monitor":return"En 2-4 semanas";default:return e.followUpSchedule||"En 4-6 semanas"}}generateReportId(){const e=Date.now(),n=Math.random().toString(36).substring(2,9);return`REP-${e}-${n}`.toUpperCase()}formatReportAsHTML(e){let n=`
      <div class="medical-report">
        <header class="report-header">
          <h1>REPORTE MÉDICO</h1>
          <p>ID: ${e.reportId}</p>
          <p>Fecha: ${e.patientInfo.analysisDate}</p>
          <p>Tipo de Análisis: ${e.patientInfo.analysisType}</p>
        </header>

        <section class="clinical-summary">
          <h2>RESUMEN CLÍNICO</h2>
          <pre>${e.clinicalSummary}</pre>
        </section>

        <section class="detailed-findings">
          <h2>HALLAZGOS DETALLADOS</h2>
    `;return e.detailedFindings.forEach(t=>{n+=`
        <div class="finding-category">
          <h3>${t.category}</h3>
          <p><strong>Severidad:</strong> ${t.severity}</p>
          <h4>Hallazgos:</h4>
          <ul>
            ${t.findings.map(i=>`<li>${i}</li>`).join("")}
          </ul>
          <h4>Recomendaciones:</h4>
          <ul>
            ${t.recommendations.map(i=>`<li>${i}</li>`).join("")}
          </ul>
        </div>
      `}),n+=`
        </section>

        <section class="diagnostic-impression">
          <h2>IMPRESIÓN DIAGNÓSTICA</h2>
          <pre>${e.diagnosticImpression}</pre>
        </section>

        <section class="treatment-plan">
          <h2>PLAN DE TRATAMIENTO</h2>
          <div class="treatment-immediate">
            <h3>Acciones Inmediatas (24-48 horas):</h3>
            <ul>
              ${e.treatmentPlan.immediate.map(t=>`<li>${t}</li>`).join("")}
            </ul>
          </div>
          <div class="treatment-short">
            <h3>Corto Plazo (1-4 semanas):</h3>
            <ul>
              ${e.treatmentPlan.shortTerm.map(t=>`<li>${t}</li>`).join("")}
            </ul>
          </div>
          <div class="treatment-long">
            <h3>Largo Plazo (1-3 meses):</h3>
            <ul>
              ${e.treatmentPlan.longTerm.map(t=>`<li>${t}</li>`).join("")}
            </ul>
          </div>
        </section>

        <section class="follow-up">
          <h2>SEGUIMIENTO</h2>
          <pre>${e.followUpRecommendations}</pre>
        </section>

        <section class="disclaimers">
          <h2>AVISOS IMPORTANTES</h2>
          <ul>
            ${e.disclaimers.map(t=>`<li>${t}</li>`).join("")}
          </ul>
        </section>

        <footer class="report-footer">
          <p><strong>${e.signature.generatedBy}</strong></p>
          <p><em>${e.signature.aiDisclaimer}</em></p>
          <p>Generado: ${e.generatedAt.toLocaleString("es-MX")}</p>
        </footer>
      </div>
    `,n}formatReportForPDF(e){return this.formatReportAsHTML(e)}}export{s as MedicalReportGenerator};
