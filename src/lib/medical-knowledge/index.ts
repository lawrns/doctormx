/**
 * Medical Knowledge Base (RAG) for Doctor.mx
 * Provides context-augmented responses using Mexican medical guidelines
 *
 * NOTE: Embeddings still use OpenAI (text-embedding-3-small)
 * This is because embedding migration is a separate task requiring
 * re-indexing of all documents.
 */

import { createClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai'
import { logger } from '@/lib/observability/logger'

// Embeddings use OpenAI (embedding migration is a separate task)

export interface MedicalDocument {
  id: string;
  content: string;
  source: string;
  specialty: string;
  metadata: {
    title?: string;
    author?: string;
    year?: number;
    type?: 'nom' | 'imss' | 'issste' | 'who' | 'cdc' | 'uptodate' | 'guideline';
    url?: string;
    keywords?: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface RetrievedContext {
  documents: MedicalDocument[];
  relevance_scores: number[];
  total_results: number;
  query: string;
}

export interface MedicalGuideline {
  title: string;
  content: string;
  specialty: string;
  source: string;
  year: number;
  type: 'nom' | 'imss' | 'issste' | 'who' | 'cdc' | 'uptodate' | 'guideline';
  keywords: string[];
}

// Type for RPC results with similarity score
interface MedicalDocumentWithSimilarity extends MedicalDocument {
  similarity?: number;
}

// Sample Mexican medical guidelines
const SAMPLE_GUIDELINES: MedicalGuideline[] = [
  {
    title: 'NOM-004-SSA3-2012 - Prescripción Electrónica',
    content: 'La Norma Oficial Mexicana establece los requisitos para la prescripción electrónica de medicamentos. Incluye: identificación del prescriptor con cédula profesional, datos completos del paciente, medicamento prescrito con dosis, frecuencia y duración del tratamiento, firma electrónica avanzada, y validación en tiempo real de la prescripción.',
    specialty: 'General',
    source: 'Secretaría de Salud',
    year: 2012,
    type: 'nom',
    keywords: ['prescripción', 'electrónica', 'medicamentos', 'firma digital', 'validación', 'cédula']
  },
  {
    title: 'NOM-024-SSA3-2012 - Telemedicina',
    content: 'Norma que regula la práctica de telemedicina en México. Establece requisitos para: obtención de consentimiento informado electrónico, protección de confidencialidad de datos médicos (LFPDPPP), estándares de calidad para consulta remota, registro detallado de actividades, responsabilidades legales del prestador, y requisitos técnicos mínimos para plataformas de telesalud.',
    specialty: 'General',
    source: 'Secretaría de Salud',
    year: 2012,
    type: 'nom',
    keywords: ['telemedicina', 'consentimiento', 'confidencialidad', 'calidad', 'responsabilidad', 'remoto']
  },
  {
    title: 'Guía IMSS - Hipertensión Arterial Sistémica',
    content: 'Protocolo de atención para hipertensión arterial: diagnóstico con presión arterial ≥140/90 mmHg confirmada en dos o más ocasiones, evaluación integral de factores de riesgo cardiovascular (diabetes, dislipidemia, tabaquismo, obesidad), estudios de laboratorio básicos (BH, QS, EGO, perfil lipídico, ECG), tratamiento no farmacológico inicial (dieta DASH con restricción de sodio <2g/día, ejercicio aeróbico 150 min/semana, reducción de peso si IMC>25), y escalones de tratamiento farmacológico comenzando con IECA o ARA-II.',
    specialty: 'Cardiología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['hipertensión', 'presión arterial', 'cardiovascular', 'dieta DASH', 'IECA', 'ARA-II']
  },
  {
    title: 'Guía IMSS - Diabetes Mellitus Tipo 2',
    content: 'Manejo integral de diabetes tipo 2: criterios diagnósticos (glucosa en ayunas ≥126 mg/dL, HbA1c ≥6.5%, glucosa 2h post-carga ≥200 mg/dL), metas de control (HbA1c <7% en general, <8% en adultos mayores), automonitoreo de glucosa capilar, tratamiento con metformina como primera línea (iniciar 500mg/día, incrementar hasta 2g/día), insulinización temprana cuando HbA1c >9% o síntomas de hiperglucemia, y vigilancia de complicaciones micro/macrovasculares cada 3-6 meses.',
    specialty: 'Endocrinología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['diabetes', 'glucosa', 'HbA1c', 'metformina', 'insulina', 'complicaciones']
  },
  {
    title: 'Protocolo ISSSTE - Infecciones Respiratorias Agudas',
    content: 'Atención de IRA en adultos: diagnóstico diferencial entre resfriado común (rinorrea, estornudos), influenza (fiebre súbita >38°C, mialgias, cefalea) y COVID-19 (anosmia, ageusia), criterios de gravedad (SpO2<92%, FR>24, datos de dificultad respiratoria), tratamiento sintomático (paracetamol 500mg c/6h, hidratación), oseltamivir para influenza dentro de 48h del inicio de síntomas, antibióticos solo con evidencia de sobreinfección bacteriana, y esquemas de vacunación actualizados.',
    specialty: 'Neumología',
    source: 'ISSSTE',
    year: 2023,
    type: 'issste',
    keywords: ['respiratorias', 'influenza', 'COVID', 'antivirales', 'vacunación', 'neumonía']
  },
  {
    title: 'Guía OMS - Escalera Analgésica del Dolor',
    content: 'Manejo del dolor según OMS: Escalón 1 para dolor leve (paracetamol 500-1000mg c/6-8h, AINEs como ibuprofeno 400mg c/8h o naproxeno 250mg c/12h), Escalón 2 para dolor moderado (opioides débiles como tramadol 50-100mg c/6h, codeína 30-60mg c/4-6h), Escalón 3 para dolor severo (opioides fuertes como morfina oral 5-10mg c/4h, oxicodona, fentanilo transdérmico). Principios: vía oral preferente, horario fijo, dosis individualizadas, y manejo proactivo de efectos secundarios.',
    specialty: 'Medicina del Dolor',
    source: 'OMS',
    year: 2022,
    type: 'who',
    keywords: ['dolor', 'analgésicos', 'opioides', 'paracetamol', 'AINEs', 'morfina', 'escalera']
  },
  {
    title: 'Guía CDC - Prevención de Infecciones',
    content: 'Medidas de prevención: lavado de manos con agua y jabón por mínimo 20 segundos especialmente antes de comer y después del baño, uso de gel antibacterial con alcohol al 70% cuando no hay agua disponible, etiqueta respiratoria (cubrir boca y nariz al toser/estornudar con codo flexionado), distanciamiento de 1.5m en espacios cerrados durante brotes, uso de cubrebocas N95 o KN95 en situaciones de alto riesgo, y cumplimiento de esquemas de vacunación según calendario nacional.',
    specialty: 'Medicina Preventiva',
    source: 'CDC',
    year: 2023,
    type: 'cdc',
    keywords: ['prevención', 'infecciones', 'lavado de manos', 'cubrebocas', 'vacunación', 'higiene']
  },
  {
    title: 'UpToDate - Manejo de Fiebre en Pediatría',
    content: 'Evaluación de fiebre en niños: definición de fiebre como temperatura ≥38°C rectal o ≥37.5°C axilar, signos de alarma (letargia, irritabilidad extrema, rechazo al alimento, petequias, fontanela abombada en lactantes), tratamiento antipirético con paracetamol 10-15mg/kg/dosis c/4-6h o ibuprofeno 5-10mg/kg/dosis c/6-8h (no usar ibuprofeno en <6 meses), mantener hidratación adecuada, no usar medios físicos solos para bajar fiebre. Consulta urgente: lactantes <3 meses con fiebre, fiebre >5 días, o signos de alarma.',
    specialty: 'Pediatría',
    source: 'UpToDate',
    year: 2023,
    type: 'uptodate',
    keywords: ['fiebre', 'niños', 'paracetamol', 'ibuprofeno', 'signos de alarma', 'hidratación']
  },
  {
    title: 'NOM-046-SSA2-2005 - Violencia Familiar y Sexual',
    content: 'Atención médica de violencia: obligación de detección activa mediante tamizaje en consulta, manejo integral que incluye atención de lesiones, anticoncepción de emergencia (levonorgestrel 1.5mg dosis única hasta 72h post-exposición), profilaxis VIH (TDF/FTC + RAL por 28 días iniciando antes de 72h), profilaxis ITS, apoyo psicológico inmediato, referencia a trabajo social y ministerio público, y seguimiento a las 2 semanas. Confidencialidad absoluta excepto en menores de edad.',
    specialty: 'General',
    source: 'Secretaría de Salud',
    year: 2005,
    type: 'nom',
    keywords: ['violencia', 'emergencia', 'anticoncepción', 'profilaxis', 'VIH', 'confidencialidad']
  },
  {
    title: 'Guía CENETEC - Lumbalgia Inespecífica',
    content: 'Manejo de lumbalgia: clasificación (aguda <6 semanas, subaguda 6-12 semanas, crónica >12 semanas), banderas rojas que requieren imagen (trauma, edad >50 con primer episodio, pérdida de peso inexplicable, fiebre, déficit neurológico progresivo, síndrome de cauda equina), tratamiento conservador inicial (actividad física temprana, evitar reposo prolongado, analgésicos según escalera OMS), no realizar estudios de imagen en lumbalgia aguda sin banderas rojas, y referencia a rehabilitación si persiste >4 semanas.',
    specialty: 'Traumatología',
    source: 'CENETEC',
    year: 2022,
    type: 'guideline',
    keywords: ['lumbalgia', 'espalda', 'banderas rojas', 'rehabilitación', 'imagen', 'analgésicos']
  },
  // CARDIOLOGÍA EXPANDED
  {
    title: 'Guía IMSS - Insuficiencia Cardíaca',
    content: 'Diagnóstico y manejo de ICC: clasificación funcional NYHA I-IV, criterios diagnósticos (síntomas + evidencia estructural de disfunción cardíaca), evaluación con ecocardiograma (FEVI <40% indica fracción reducida), tratamiento farmacológico basal (IECA/ARA-II + beta-bloqueantes + antagonista de aldosterona), diuréticos de asa para congestión, ivabradina si FC >70 lpm con FEVI ≤35% en ritmo sinusal, y dispositivos (MARCAPASOS, DAI, TRC) según criterios de indicación.',
    specialty: 'Cardiología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['insuficiencia cardíaca', 'NYHA', 'FEVI', 'IECA', 'beta-bloqueantes', 'diuréticos']
  },
  {
    title: 'Guía IMSS - Arritmias Cardíacas',
    content: 'Manejo de arritmias: Fibrilación auricular (control de frecuencia con beta-bloqueantes o calcioantagonistas, control de ritmo con amiodarona o propafenona, anticoagulación según escala CHA2DS2-VASc ≥2), Taquicardia supraventricular (maniobras vagales, adenosina 6mg IV rápido), Taquicardia ventricular (estabilidad hemodinámica define manejo: estable - amiodarona 150mg IV; inestable - cardioversión eléctrica), y bradiarritmias (marcapasos definitivo si sintomático).',
    specialty: 'Cardiología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['arritmia', 'fibrilación auricular', 'anticoagulación', 'adenosina', 'marcapasos']
  },
  {
    title: 'Guía IMSS - Síndrome Coronario Agudo',
    content: 'SCA sin elevación del ST: estratificación de riesgo con TIMI o GRACE, troponinas seriadas (0, 3-6 horas), ECG seriados, tratamiento inicial (doble antiagregación con AAS 300mg + clopidogrel 300-600mg, anticoagulación con enoxaparina, nitratos, morfina si dolor severo), estrategia invasiva precoz si alto riesgo (angiografía <24h), y SCA con elevación del ST (reperfusión inmediata: angiografía primaria <120min o trombólisis con estreptokinasa o TNK-TPA).',
    specialty: 'Cardiología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['síndrome coronario', 'angina', 'infarto', 'troponina', 'antiagregación', 'angiografía']
  },
  {
    title: 'Guía IMSS - Dislipidemias',
    content: 'Manejo de dislipidemias: clasificación según riesgo cardiovascular (muy alto, alto, moderado, bajo), metas de cLDL (muy alto <40mg/dL o reducción ≥50%, alto <55mg/dL, moderado <100mg/dL, bajo <130mg/dL), tratamiento con estatinas (atorvastatina 20-80mg, rosuvastatina 10-40mg) como primera línea, ezetimiba si no alcanza meta, inhibidores de PCSK9 si no controlado con máxima terapia, y monitoreo de enzimas hepáticas y CK.',
    specialty: 'Cardiología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['colesterol', 'dislipidemia', 'estatinas', 'cLDL', 'prevención cardiovascular']
  },
  // ENDOCRINOLOGÍA EXPANDED
  {
    title: 'Guía IMSS - Hipotiroidismo',
    content: 'Diagnóstico y tratamiento: TSH como prueba inicial (TSH elevado con T4 libre baja confirma hipotiroidismo primario), etiología más común en México: tiroiditis de Hashimoto, tratamiento con levotiroxina (dosis inicial 25-50mcg/día en adultos, ajustar cada 6-8 semanas, meta TSH 0.5-3.0 mUI/L), tomar en ayunas 30min antes del desayuno, no tomar con calcio, hierro o antiácidos, y monitoreo anual una vez estabilizado.',
    specialty: 'Endocrinología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['hipotiroidismo', 'TSH', 'levotiroxina', 'tiroiditis', 'Hashimoto']
  },
  {
    title: 'Guía IMSS - Síndrome de Ovario Poliquístico',
    content: 'Criterios diagnósticos de Rotterdam (2 de 3): oligo/anovulación, signos clínicos o bioquímicos de hiperandrogenismo (hirsutismo, acné, alopecia), ovarios poliquísticos en ultrasonido (≥12 folículos 2-9mm en cada ovario). Manejo: cambios en estilo de vida (pérdida de 5-10% del peso mejora síntomas), metformina 500-1500mg/día para resistencia a insulina, anticonceptivos orales para regularizar ciclos, y citrato de clomifeno para inducción de ovulación si desea embarazo.',
    specialty: 'Endocrinología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['SOP', 'ovario poliquístico', 'infertilidad', 'metformina', 'hirsutismo']
  },
  {
    title: 'Guía IMSS - Osteoporosis',
    content: 'Diagnóstico: DEXA con T-score ≤-2.5 en columna lumbar o cadera, factores de riesgo (edad >65, sexo femenino, menopausia precoz, corticoideos crónicos, tabaquismo, FR de cadera fracturada). Prevención: calcio 1000-1200mg/día + vitamina D 800-2000 UI/día, ejercicio con pesas. Tratamiento: bisfosfonatos (alendronato 70mg/semana, ácido zoledrónico 5mg IV anual), denosumab 60mg SC cada 6 meses, terapia hormonal en <60 años o <10 años postmenopausia.',
    specialty: 'Endocrinología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['osteoporosis', 'DEXA', 'bisfosfonatos', 'fractura', 'calcio', 'vitamina D']
  },
  // NEUMOLOGÍA EXPANDED
  {
    title: 'Guía IMSS - Asma Bronquial',
    content: 'Clasificación de gravedad: intermitente (síntomas <2/semana, despertares nocturnos <2/mes), persistente leve (síntomas ≥2/semana pero <diario), persistente moderada (síntomas diarios, crisis que afectan actividad), persistente severa (síntomas continuos, crisis frecuentes). Tratamiento escalonado: SABA salbutamol para rescate, CI baja dosis + LABA para persistente, aumentar a CI alta-dosis + LABA si no control, considerar omalizumab si alérgico severo.',
    specialty: 'Neumología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['asma', 'salbutamol', 'corticosteroides inhalados', 'LABA', 'crisis asmática']
  },
  {
    title: 'Guía IMSS - EPOC',
    content: 'Diagnóstico: espirometría con relación VEF1/CVF <0.70 post-broncodilatador, síntomas crónicos (tos, expectoración, disnea), exposición a factores de riesgo (tabaquismo principal). Evaluación de gravedad por GOLD A-D según síntomas mMRC y exacerbaciones. Tratamiento: broncodilatadores de acción prolongada (LAMA o LABA o combinación), corticosteroides inhalados solo si exacerbaciones recurrentes o eosinófilos elevados, oxigenoterapia crónica si PaO2 <55mmHg, rehabilitación pulmonar.',
    specialty: 'Neumología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['EPOC', 'espirometría', 'VEF1', 'broncodilatadores', 'tabaquismo', 'oxigenoterapia']
  },
  {
    title: 'Guía IMSS - Neumonía Adquirida en Comunidad',
    content: 'Diagnóstico: clínica (fiebre, tos, expectoración, disnea), imagen (infiltrado nuevo en RX o TC), confirmación microbiológica opcional. Escala CURB-65 para estratificación: 0-1 tratamiento ambulatorio, ≥2 hospitalizar, ≥3 UCI. Tratamiento empírico: ambulatorio <65 años sin comorbilidades (amoxicilina 1g c/8h + macrólido), hospitalizado (beta-lactámico + macrólido o fluoroquinolona), duración 5-7 días según respuesta clínica.',
    specialty: 'Neumología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['neumonía', 'CURB-65', 'antibióticos', 'hospitalización', 'infiltrado']
  },
  // GASTROENTEROLOGÍA
  {
    title: 'Guía IMSS - Enfermedad por Reflujo Gastroesofágico',
    content: 'Diagnóstico: pirosis retroesternal y/o regurgitación como síntomas principales, episodios ≥2/semana sugieren ERGE. Manejo inicial: modificaciones de estilo de vida (evitar alimentos irritantes, comer 2-3h antes de dormir, elevar cabecera de cama, perder peso), IBP dosis estándar por 4-8 semanas (omeprazol 20mg, pantoprazol 40mg, esomeprazol 40mg), si no respuesta considerar IBP doble dosis o estudio con endoscopia y pH-metría.',
    specialty: 'Gastroenterología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['reflujo', 'ERGE', 'pirosis', 'IBP', 'omeprazol', 'endoscopia']
  },
  {
    title: 'Guía IMSS - Enfermedad Inflamatoria Intestinal',
    content: 'Diferenciación: Enfermedad de Crohn (afecta cualquier parte del tracto GI, patrón transmural, lesiones salteadas, fistulizante), Colitis Ulcerosa (afecta solo colon, patrón mucoso, continuo desde recto, sangrado). Diagnóstico: colonoscopia con biopsias, imagenología (enteroTC o cápsula endoscópica). Tratamiento de inducción: corticosteroides para brote moderado-severo, mesalazina para leve, mantenimiento con inmunomoduladores (azatioprina) o biológicos (infliximab, adalimumab).',
    specialty: 'Gastroenterología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['EII', 'Crohn', 'colitis ulcerosa', 'mesalazina', 'biológicos', 'inmunomoduladores']
  },
  {
    title: 'Guía IMSS - Síndrome de Intestino Irritable',
    content: 'Criterios ROMA IV: dolor abdominal recurrente (≥1 día/semana últimos 3 meses) asociado a ≥2 de: defecación, cambio en frecuencia de evacuaciones, cambio en forma/apariencia de las heces. Subtipos: SII con predominio de estreñimiento (IBS-C), con predominio de diarrea (IBS-D), mixto (IBS-M), sin clasificar (IBS-U). Tratamiento: dieta FODMAP baja, fibra soluble (psyllium), antiespasmódicos (mebeverina), loperamida para IBS-D, laxantes osmóticos para IBS-C, antidepresivos tricíclicos a dosis bajas si dolor crónico.',
    specialty: 'Gastroenterología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['SII', 'colon irritable', 'FODMAP', 'diarrea', 'estreñimiento', 'antiespasmódicos']
  },
  {
    title: 'Guía CENETEC - Pancreatitis Aguda',
    content: 'Diagnóstico: dolor abdominal en epigastrio de instalación súbita con irradiación a dorso, amilasa/lipasa séricas ≥3 veces el límite superior normal, imagen (TC o USG) para confirmar y clasificar severidad (Balthazar A-E). Criterios de gravedad: BISAP ≥2, Falla orgánica persistente, o necrosis >30%. Manejo inicial: reposo intestinal, hidratación agresiva con cristaloides, analgesia con opioides, soporte nutricional temprano si se espera ayuno prolongado. Etiología: litiasis biliar 60-80%, alcohol 20-30%, otras 10%.',
    specialty: 'Gastroenterología',
    source: 'CENETEC',
    year: 2022,
    type: 'guideline',
    keywords: ['pancreatitis', 'amilasa', 'lipasa', 'Balthazar', 'BISAP', 'dolor abdominal']
  },
  // NEUROLOGÍA
  {
    title: 'Guía IMSS - Cefalea Primaria',
    content: 'Migraña: dolor hemicraneal pulsátil de moderado a severo, duración 4-72h, empeora con actividad física, asociada a náusea/vómito, foto/fonofobia. Tratamiento de crisis: triptanes (sumatriptan 50-100mg, rizatriptan 10mg) + AINEs, manejo en entorno oscuro y silencioso. Profilaxis si ≥3 crisis/mes: topiramato 25-100mg/día, amitriptilina 25-75mg/noche, propranolol 40-160mg/día. Cefalea tensional: dolor opresivo bilateral, leve a moderado, sin foto/fonofobia, tratamiento con AINEs y relajantes musculares.',
    specialty: 'Neurología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['migraña', 'cefalea', 'triptanes', 'topiramato', 'profilaxis', 'cadera tensional']
  },
  {
    title: 'Guía IMSS - Enfermedad Cerebrovascular',
    content: 'Código AVC en urgencias: reconocimiento rápido (FACE: facie asimétrica, debilidad de brazos, dificultad del habla), tiempo a tratamiento (ventana de 4.5h para trombólisis). Isquemia: TC craneal sin contraste inicial para descartar hemorragia, trombolisis con rt-PA si cumple criterios (NIHSS >4 y <25, sin contraindicaciones), antiagregación con AAS 160-300mg. Hemorragia: control de TA <140 mmHg con labetalol o nicardipino, manejo neuroquirúrgico si hemorragia lobular >30ml o cerebelosa >3cm.',
    specialty: 'Neurología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['AVC', 'ictus', 'trombolisis', 'rt-PA', 'NIHSS', 'ACV']
  },
  {
    title: 'Guía IMSS - Epilepsia',
    content: 'Clasificación: crisis focal (inicia en una región del cerebro, puede progresar a bilateral), crisis generalizada (afecta ambos hemisferios desde inicio: tónico-clónica, ausencia, mioclónica, atónica), crisis desconocida. Diagnóstico: EEG interictal (sensibilidad ~50%), resonancia magnética para buscar etiología. Tratamiento: monoterapia con FAE (ácido valproico 10-15mg/kg/día para generalizada, carbamazepina 10-20mg/kg/día para focal, levetiracetam 1000-3000mg/día), alcanzar dosis terapéutica antes de cambiar medicamento.',
    specialty: 'Neurología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['epilepsia', 'convulsión', 'EEG', 'valproato', 'carbamazepina', 'levetiracetam']
  },
  {
    title: 'Guía IMSS - Enfermedad de Parkinson',
    content: 'Diagnóstico clínico: bradicinesia + al menos 1 de: temblor en reposo, rigidez, inestabilidad postural. Criterios UK Parkinson Brain Bank. Escala UPDRS para evaluar severidad. Tratamiento farmacológico: levodopa/carbidopa 100/25mg c/8h aumentando según respuesta (fase "honeymoon" dura ~5 años), agonistas dopaminérgicos (pramipexol, ropinirol) en pacientes jóvenes, IMAO-B (selegilina, rasagilina) como coadyuvante. No response después de 6 semanas reconsiderar diagnóstico.',
    specialty: 'Neurología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['Parkinson', 'levodopa', 'bradicinesia', 'temblor', 'UPDRS', 'agonistas dopaminérgicos']
  },
  // DERMATOLOGÍA
  {
    title: 'Guía IMSS - Acné Vulgar',
    content: 'Clasificación de severidad: leve (comedonos y pápulas escasas, <20 lesiones), moderado (pápulas y pústulas, 20-100 lesiones), severo (nódulos y quistes, >100 lesiones o lesiones cicatrizales). Tratamiento escalonado: leve (retinoides tópicos, peróxido de benzoilo, antibióticos tópicos), moderado (combinación de retinoide tópico + antibiótico tópico u oral), severo (isotretinoína oral 0.5-1mg/kg/día por 5-7 meses). Cuidados: limpieza suave, no manipular lesiones, fotoprotección.',
    specialty: 'Dermatología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['acné', 'comedones', 'retinoides', 'isotretinoína', 'peróxido de benzoilo']
  },
  {
    title: 'Guía IMSS - Dermatitis Atópica',
    content: 'Criterios diagnósticos de Hanifin y Rajka: prurito crónico o recurrente, morfología y distribución típicas (flexuras en adultos, cara y extensores en lactantes), curso crónico o recidivante, historia personal o familiar de atopia. Tratamiento: hidratación intensa (emolientes libres de fragancias 2-3 veces/día), evitar desencadenantes, corticosteroides tópicos de baja potencia para cara/pliegues, media potencia para tronco, inhibidores tópicos de calcineurina (tacrolimus, pimecrolimus) para mantenimiento, antihistamínicos orales para prurito nocturno.',
    specialty: 'Dermatología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['dermatitis atópica', 'eccema', 'prurito', 'emolientes', 'corticosteroides tópicos']
  },
  {
    title: 'Guía IMSS - Psoriasis',
    content: 'Formas clínicas: psoriasis en placas (80-90% de casos, placas eritematoescamosas bien delimitadas), psoriasis guttata (pequeñas lesiones tras infección estreptocócica), psoriasis ungueal, psoriasis del cuero cabelludo. Clasificación de severidad por BSA (afectación de superficie corporal): leve <3%, moderada 3-10%, severa >10%. Tratamiento: leve (corticosteroides tópicos, análogos de vitamina D, queratolíticos), moderado (fototerapia UVB), severo (metotrexato 7.5-25mg/semana, acitretina, biológicos como adalimumab, ustekinumab).',
    specialty: 'Dermatología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['psoriasis', 'placas', 'BSA', 'fototerapia', 'metotrexato', 'biológicos']
  },
  // INFECTOLOGÍA
  {
    title: 'Guía IMSS - Infección del Tracto Urinario',
    content: 'ITU no complicada: cistitis aguda en mujer no embarazada sin factores de riesgo, síntomas (disuria, urgencia, frecuencia, dolor suprapúbico), urocultivo no obligatorio en casos típicos, tratamiento empírico (nitrofurantoína 100mg c/6h por 5 días o fosfomicina 3g dosis única). ITU complicada: hombres, embarazo, alteraciones anatómicas, inmunosupresión, requiere urocultivo y tratamiento más prolongado (7-14 días) según antibiograma, valorar imagenología para descartar complicaciones.',
    specialty: 'Infectología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['ITU', 'cistitis', 'urocultivo', 'nitrofurantoína', 'disuria']
  },
  {
    title: 'Guía IMSS - Dengue',
    content: 'Clasificación: Dengue sin signos de alarma, Dengue con signos de alarma (dolor abdominal intenso, vómito persistente, acumulación de líquidos, letargo, irritabilidad, hepatomegalia >2cm, laboratorio: plaquetas <100,000, aumento de Hto), Dengue grave (choque, dificultad respiratoria, sangrado severo, compromiso de órganos). Manejo: ambulatorio sin signos de alarma (hidratación oral, paracetamol, evitar AINEs), hospitalizar con signos de alarma o gravedad, monitoreo estricto de líquidos, plaquetas y hematocrito.',
    specialty: 'Infectología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['dengue', 'plaquetas', 'hematocrito', 'signos de alarma', 'choque', 'hidratación']
  },
  {
    title: 'Guía IMSS - COVID-19',
    content: 'Estratificación de riesgo: bajo riesgo (edad <60 sin comorbilidades, SpO2 ≥94%), riesgo alto (edad ≥60 o comorbilidades, obesidad, diabetes, EPOC, cardiovascular, inmunosupresión), riesgo muy alto (SpO2 <94%, FR >24, neumonía bilateral). Tratamiento ambulatorio: sintomáticos (paracetamol, hidratación), monitorización de oximetría en casa, considerar dexametasona 6mg si SpO2 90-94%, hospitalizar si SpO2 <90% o signos de gravedad. Profilaxis post-exposición no recomendada rutinariamente.',
    specialty: 'Infectología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['COVID', 'SARS-CoV-2', 'SpO2', 'dexametasona', 'oximetría', 'neumonía']
  },
  {
    title: 'Guía IMSS - VIH/SIDA',
    content: 'Diagnóstico: prueba de tamizaje (cuarta generación ELISA), confirmación con Western blot o PCR viral. Inicio de TAR inmediato tras diagnóstico independientemente de cuenta de CD4 ("tratamiento para todos"). Esquema inicial recomendado: 2 ITRN + 1 ITINN (TDF/FTC + dolutegravir o TDF/FTC + efavirenz). Monitoreo basal (VDRL, hepatitis B y C, lipidograma, creatinina), seguimiento con carga viral a las 4-8 semanas, objetivo carga viral indetectable a las 24 semanas. Profilaxis de infecciones oportunistas si CD4 <200.',
    specialty: 'Infectología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['VIH', 'SIDA', 'TAR', 'antirretrovirales', 'carga viral', 'CD4']
  },
  {
    title: 'Guía CENETEC - Tuberculosis Pulmonar',
    content: 'Sospecha clínica: tos y expectoración ≥2-3 semanas, fiebre vespertina, sudoración nocturna, pérdida de peso, hemoptisis. Diagnóstico: baciloscopia de esputo (3 muestras, al menos 2 positivas confirma), cultivo de Lowenstein-Jensen (gold standard, toma 3-8 semanas), radiografía de tórax (infiltrados en lóbulos superiores, cavitaciones). Tratamiento esquema intensivo de 2 meses (isoniazida + rifampicina + pirazinamida + etambutol) + 4 meses de isoniazida + rifampicina. Directamente observado (DOTS) para asegurar adherencia.',
    specialty: 'Infectología',
    source: 'CENETEC',
    year: 2022,
    type: 'guideline',
    keywords: ['tuberculosis', 'BK', 'baciloscopia', 'isoniazida', 'rifampicina', 'DOTS']
  },
  // PSIQUATRÍA
  {
    title: 'Guía IMSS - Depresión Mayor',
    content: 'Criterios DSM-5: ≥5 síntomas durante 2 semanas, uno de los cuales debe ser estado de ánimo deprimido o anhedonia, síntomas: pérdida/peso ganancia, insomnio/hipersomnia, agitación/retardo psicomotor, fatiga, sentimiento de inutilidad, dificultad de concentración, pensamientos de muerte. Escala PHQ-9 para tamizaje. Tratamiento: psicoterapia (CBT) para leve a moderada, ISRS como primera línea (fluoxetina 20-40mg/día, sertralina 50-200mg/día, escitalopram 10-20mg/día), respuesta esperada en 2-4 semanas, continuar 6-12 meses después de remisión.',
    specialty: 'Psiquiatría',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['depresión', 'anhedonia', 'ISRS', 'PHQ-9', 'CBT', 'psicoterapia']
  },
  {
    title: 'Guía IMSS - Trastorno de Ansiedad Generalizada',
    content: 'Criterios DSM-5: ansiedad excesiva y difícil de controlar por ≥6 meses, asociada a ≥3 de: inquietud, fatiga fácil, dificultad de concentración, irritabilidad, tensión muscular, alteraciones del sueño, deterioro funcional. Escala GAD-7 para tamizaje y seguimiento. Tratamiento: psicoterapia (relajación, CBT), ISRS (escitalopram 10-20mg, sertralina 50-200mg), ISRN (venlafaxina 75-225mg), benzodiacepinas solo a corto plazo (<4 semanas) o mientras inicia efecto de antidepresivo.',
    specialty: 'Psiquiatría',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['ansiedad', 'GAD', 'GAD-7', 'ISRS', 'venlafaxina', 'benzodiacepinas']
  },
  {
    title: 'Guía IMSS - Insomnio',
    content: 'Diagnóstico: dificultad para iniciar o mantener el sueño, despertar temprano con incapacidad de volver a dormir, ocurre ≥3 noches/semana por ≥3 meses, causa deterioro diurno (fatiga, disfunción cognitiva, irritabilidad). Clasificación: crónico (>3 meses), agudo (<3 meses), primario (sin causa médica/psiquiátrica), secundario (asociado a condición médica, medicamento o sustancia). Tratamiento no farmacológico: higiene del sueño, terapia CBT-I, relajación progresiva. Farmacológico: zolpidem 5-10mg, melatonina 3-5mg, benzodiacepinas solo por corto tiempo.',
    specialty: 'Psiquiatría',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['insomnio', 'higiene del sueño', 'CBT-I', 'zolpidem', 'melatonina']
  },
  // REUMATOLOGÍA
  {
    title: 'Guía IMSS - Artritis Reumatoide',
    content: 'Criterios ACR/EULAR 2010: ≥6 puntos (factor reumatoide o anticuerpo anti-CCP positivos, VSG o PCR elevadas, duración de síntomas ≥6 semanas, afectación articular específica). Diagnóstico diferencial con artrosis, lupus, gota. Tratamiento: diagnóstico temprano ("ventana de oportunidad" primeros 3-6 meses), FAME sintético convencional (metotrexato 10-25mg/semana + ácido fólico) como primera línea, adicionar corticosteroides a dosis bajas mientras inicio efecto, FAME biológicos si falla ≥2 FAME sintéticos.',
    specialty: 'Reumatología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['artritis reumatoide', 'factor reumatoide', 'anti-CCP', 'metotrexato', 'FAME']
  },
  {
    title: 'Guía IMSS - Lupus Eritematoso Sistémico',
    content: 'Criterios de clasificación EULAR/ACR 2019: ≥10 puntos de dominios (clínico: constitucional, hematológico, neuropsiquiátrico, mucocutáneo, seroso, musculoesquelético, renal; inmunológico: ANA obligatorio + anti-dsDNA, anti-Sm, antifosfolípidos). Evaluación de actividad con SLEDAI-2K. Tratamiento: hidroxicloroquina 200-400mg/día en todos los pacientes (salvo contraindicación), NSAIDs para dolor articular, corticosteroides según gravedad (prednisona 0.5-1mg/kg para moderado, pulso de metilprednisolona para severo), inmunosupresores (azatioprina, micofenolato, ciclofosfamida).',
    specialty: 'Reumatología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['lupus', 'LES', 'ANA', 'hidroxicloroquina', 'SLEDAI', 'anti-dsDNA']
  },
  {
    title: 'Guía IMSS - Gota',
    content: 'Diagnóstico de crisis aguda: monoartritis súbita (primeira articulación MTF en 50%), eritema, calor, dolor intenso, confirmación con visualización de cristales de urato monosódico en líquido sinovial (gold standard). Niveles de ácido úrico pueden ser normales durante crisis aguda. Tratamiento de crisis: AINEs (indometacina 50mg c/8h, naproxeno 500mg c/12h), colchicina 0.5mg c/8h, corticosteroides intraarticulares o sistémicos si contraindicación. Tratamiento de base: alopurinol 100-300mg/día iniciando 2 semanas después de resuelta crisis, objetivo ácido úrico <6mg/dL.',
    specialty: 'Reumatología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['gota', 'hiperuricemia', 'artritis', 'colchicina', 'alopurinol', 'urato']
  },
  // NEFROLOGÍA
  {
    title: 'Guía IMSS - Enfermedad Renal Crónica',
    content: 'Definición: daño renal (albuminuria ≥30mg/g creatinina o alteraciones en imagen/sedimento) o FG <60 mL/min/1.73m² por ≥3 meses. Estadificación por FG (estadio 1: FG≥90, estadio 2: FG60-89, estadio 3a: FG45-59, estadio 3b: FG30-44, estadio 4: FG15-29, estadio 5: FG<15 o diálisis). Evaluación inicial: creatinina, FG (CKD-EPI), albuminuria, electrolitos, PTH, hemoglobina, USG renal. Tratamiento: controlar proteinuria (IECA/ARA-II target proteinuria <300mg/día), evitar nefrotóxicos, manejo de complicaciones (anemia, hiperfosfatemia, hiperparatiroidismo secundario).',
    specialty: 'Nefrología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['ERC', 'insuficiencia renal', 'FG', 'albuminuria', 'IECA', 'diálisis']
  },
  {
    title: 'Guía IMSS - Síndrome Nefrítico',
    content: 'Cuadro clínico: edema, hipertensión, hematuria (macro o microscópica), proteinuria no nefrótica (<3.5g/24h), cilindros hemáticos en sedimento, oliguria, azoemia. Etiologías: post-infeccioso (post-estreptocócica más común en niños), nefropatía por IgA, lupus, vasculitis. Estudios: complemento sérico (C3, C4), ASO, anti-DNasa B, inmunoglobulinas, biopsia renal si atípico. Tratamiento: restricción de sodio y agua, diuréticos de asa, antihipertensivos (IECA preferidos), corticosteroides según etiología.',
    specialty: 'Nefrología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['síndrome nefrítico', 'hematuria', 'cilindros', 'complemento', 'edema']
  },
  // UROLOGÍA
  {
    title: 'Guía IMSS - Hiperplasia Prostática Benigna',
    content: 'Síntomas obstructivos: chorro débil, goteo terminal, dificultad para iniciar la micción, retención urinaria. Síntomas irritativos: frecuencia, urgencia, nocturia. Evaluación: IPSS (International Prostate Symptom Score) para cuantificar severidad, tacto rectal (evaluar tamaño, nodulos), PSA (para descartar cáncer), USG prostático transrectal, uroflujometría. Tratamiento: leve a moderado (observación, modificación de estilo de vida), moderado (bloqueadores alfa: tamsulosina 0.4mg/día, terazosina), severo o resistente (inhibidores 5-alfa reductasa: dutasteride, finasteride, cirugía).',
    specialty: 'Urología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['HPB', 'próstata', 'IPSS', 'tamsulosina', 'nocturia', 'retención urinaria']
  },
  {
    title: 'Guía IMSS - Disfunción Eréctil',
    content: 'Definición: incapacidad persistente o recurrente para lograr o mantener una erección suficiente para actividad sexual satisfactoria, por mínimo 3 meses. Clasificación de causa: orgánica (vasculogénica 70%, neurogénica, hormonal), psicógena, mixta. Evaluación: historia clínica (IIEF-5), examen físico, glucosa, perfil lipídico, testosterona total, PRL. Tratamiento de primera línea: inhibidores de PDE5 (sildenafil 50mg 1h antes de actividad sexual, tadalafil 10-20mg, vardenafil). Segunda línea: inyecciones intracavernosas (alprostadil), bomba de vacío. Tercera línea: prótesis peneana.',
    specialty: 'Urología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['disfunción eréctil', 'impotencia', 'PDE5', 'sildenafil', 'tadalafil', 'IIEF']
  },
  // OFTALMOLOGÍA
  {
    title: 'Guía IMSS - Conjuntivitis',
    content: 'Clasificación: viral (más común, secreción serosa, adenopatía preauricular, auto-limitada 7-10 días), bacteriana (secreción purulenta, matinal, unilateral inicial, tratamiento con ofloxacino o moxifloxacino tópico c/4-6h por 5-7 días), alérgica (prurito intenso, bilateral, estacional, antecedente atópico, tratamiento con antihistamínicos tópicos y frío local). Medidas generales: higiene, no tocarse ojos, compresas frías, evitar maquillaje. Signos de alarma: dolor ocular severo, pérdida de visión, fotofobia intensa (referir a oftalmólogo).',
    specialty: 'Oftalmología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['conjuntivitis', 'ojo rojo', 'secreción', 'prurito', 'ofloxacino', 'antihistamínicos']
  },
  {
    title: 'Guía IMSS - Retinopatía Diabética',
    content: 'Clasificación ETDRS: no proliferativa (leve, moderada, severa), proliferativa (neovascularización), edema macular diabético. Factores de riesgo: duración de diabetes, mal control glucémico (HbA1c), hipertensión, dislipidemia, embarazo. Prevención: control estricto de glucosa y presión arterial. Tratamiento: edema macular con afectación central (anti-VEGF intravítreo: bevacizumab, ranibizumab, aflibercept), retinopatía proliferativa (fotocoagulación con láser panretiniana), vitrectomía si hemorragia vítrea o desprendimiento.',
    specialty: 'Oftalmología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['retinopatía diabética', 'edema macular', 'anti-VEGF', 'láser', 'proliferativa']
  },
  // OTORRINOLARINGOLOGÍA
  {
    title: 'Guía IMSS - Rinitis Alérgica',
    content: 'Síntomas: rinorrea acuosa, estornudos, prurito nasal, congestión nasal, oftalmopatía alérgica. Clasificación de duración: intermittente (<4 días/semana o <4 semanas), persistente (≥4 días/semana y ≥4 semanas). Clasificación de gravedad: leve (no afecta sueño/actividad), moderada-severa (afecta sueño/actividad). Tratamiento: evitar alérgenos identificados, antihistamínicos orales de segunda generación (loratadina 10mg/día, cetirizina 5-10mg/día), corticosteroides nasales (mometasona, fluticasona, budesonida) como tratamiento de elección para congestión persistente, lavado nasal con solución salina.',
    specialty: 'Otorrinolaringología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['rinitis', 'alergia', 'congestión nasal', 'antihistamínicos', 'corticoides nasales']
  },
  {
    title: 'Guía IMSS - Otitis Media Aguda',
    content: 'Diagnóstico: otalgia, alteración de la membrana timpánica (eritema, abombamiento, opacificación, pérdida de reflejo luminoso), fiebre, síntomas catarrales recientes. Clasificación: otitis media aguda (OMA) con efusión, OMA supurativa, OMA bullosa. Tratamiento: analgesia (paracetamol o ibuprofeno, gotas óticas con anestésicos locales), antibioterapia si <2 años, ambos lados afectados, otorrea, síntomas >48h, o estado general comprometido (amoxicilina 80-90mg/kg/día dividido c/8h por 10 días, amoxicilina-clavulanato si falla terapéutica o riesgo elevado).',
    specialty: 'Otorrinolaringología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['otitis media', 'otalgia', 'amoxicilina', 'timpano', 'dolor de oído']
  },
  // GERIATRÍA
  {
    title: 'Guía IMSS - Síndrome de Fragilidad',
    content: 'Fenotipo de Fried: ≥3 de 5 criterios define fragilidad (pérdida involuntaria de peso ≥10lb/año, agotamiento autorreportado, debilidad por grip strength, lentitud de marcha (caminar 15 pies), baja actividad física). Predicción de caídas, hospitalización, institucionalización, muerte. Intervención: ejercicio multicomponente (resistencia, equilibrio, marcha), optimización nutricional (proteína 1.0-1.2g/kg/día, suplemento vitamina D), revisión de polifarmacia (deprescriptores), corrección de déficits sensoriales (audición, visión).',
    specialty: 'Geriatría',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['fragilidad', 'geriatría', 'caídas', 'polifarmacia', 'ejercicio', 'desnutrición']
  },
  {
    title: 'Guía IMSS - Demencia Tipo Alzheimer',
    content: 'Criterios NIA-AA: deterioro cognitivo progresivo que interfiere con independencia en actividades cotidianas, dominio amnésico típico (dificultad para aprender y recordar nueva información) o dominio no amnésico (lenguaje, visoespacial, ejecutivo), curso gradual. Diagnóstico diferencial con depresión, delirium, otras demencias. Evaluación: MMSE, MoCA, escalas funcionales (IADL, ADL), laboratorio (B12, TSH, VDRL, serología), imagenología (TC o MRI para descartar otras causas). Tratamiento: IACE (donepezilo 5-10mg/día, rivastigmina, galantamina) para leve-moderada, memantina 10-20mg/día para moderada-severa.',
    specialty: 'Geriatría',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['Alzheimer', 'demencia', 'MMSE', 'MoCA', 'donepezilo', 'memantina', 'IACE']
  },
  // OBSTETRICIA Y GINECOLOGÍA
  {
    title: 'Guía IMSS - Preeclampsia',
    content: 'Definición: hipertensión (PA ≥140/90) + proteinuria ≥300mg/24h o hipertensión + trombocitopenia <100,000, creatinina elevada, elevación de transaminasas, dolor epigástrico, edema pulmonar o new-onset cefalea visual. Clasificación: con signos de gravedad (PA ≥160/110, trombocitopenia, dolor epigástrico, alteración de pruebas hepáticas, insuficiencia renal, edema pulmonar, cefalea/alteraciones visuales, eclampsia), sin signos de gravedad. Tratamiento: estabilización (sulfato de magnesio para convulsiones, antihipertensivos: labetalol, hidralazina, nifedipino), terminación del embarazo según edad gestacional y gravedad.',
    specialty: 'Ginecología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['preeclampsia', 'hipertensión gestacional', 'proteinuria', 'sulfato de magnesio', 'eclampsia']
  },
  {
    title: 'Guía IMSS - Hemorragia Obstétrica',
    content: 'Causas de las 4 T: Tonus (atonia uterina 70-80%), Trauma (laceraciones, ruptura uterina), Trombina (coagulopatía), Tissue (retención de productos, placenta acreta). Evaluación inicial: ABC, monitoreo hemodinámico, oxígeno, 2 accesos venosos gruesos, laboratorio (BH, QS, coagulación), usar masaje uterino y oxitocina 10UI IV bolus + 40UI en infusión. Si persiste: misoprostol 800mcg sublingual, metilergometrina, agregados plaquetarios, plasma fresco, crioprecipitados según laboratorio. Considerar balón de Bakri, embolización de arterias uterinas, histerectomía si no control.',
    specialty: 'Ginecología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['hemorragia obstétrica', 'atonia uterina', 'oxitocina', 'misoprostol', 'PPH']
  },
  // PEDIATRÍA EXPANDED
  {
    title: 'Guía IMSS - Deshidratación en Pediatría',
    content: 'Clasificación clínica: leve (pérdida <5% peso, sed leve, mucosas húmedas, llora con lágrimas), moderada (pérdida 5-10%, sed intensa, mucosas secas, fontanela deprimida, oliguria), severa (pérdida >10%, shock, fontanela muy deprimida, ojos hundidos, ausencia de lágrimas, piel con turgor disminuido, oligoanuria). Plan de hidratación: leve (plan A: ambulatorio, aumenatrado), moderada (plan B: SRO 75-100mL/kg en 4h + VO a voluntad), severa (plan C: hospitalización, solución Hartmann 20mL/kg bolus, repetir si necesario).',
    specialty: 'Pediatría',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['deshidratación', 'pediatría', 'SRO', 'shock', 'plan ABC', 'fontanela']
  },
  {
    title: 'Guía IMSS - Bronquiolitis',
    content: 'Etiología más común: VRS (virus sincitial respiratorio). Criterios diagnósticos: primer episodio de sibilancias en lactante <2 años, cuadro viral previo (rinorrea, tos, fiebre baja), dificultad respiratoria (tiraje, aleteo nasal, quejido), crépitos diseminados. Escala de Wood-Downes para evaluar gravedad. Tratamiento: principalmente de soporte (hidratación, franjas nasales, aspirado de secreciones), oxígeno si SatO2 <92%, broncodilatadores (salbutamol) solo si hay antecedente de atopia/sibilancias previas, no usar corticosteroides sistémicos rutinariamente, no usar antibióticos salvo sobreinfección.',
    specialty: 'Pediatría',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['bronquiolitis', 'VRS', 'sibilancias', 'pediatría', 'Wood-Downes', 'lactante']
  },
  {
    title: 'Guía IMSS - Síndrome Urémico Hemolítico',
    content: 'Clásica triada: anemia hemolítica microangiopática, trombocitopenia, insuficiencia renal aguda. Usualmente precedido por diarrea con sangre (E. coli O157:H7). Edad típica: 6 meses a 5 años. Diagnóstico: BH (anemia, esquistocitos, trombocitopenia), QS (azoemia, hiperK, hiperuricemia), Coombs negativo, LDH elevada, productos de degradación de fibrina elevados. Complicaciones: hipertensión, pancreatitis, convulsiones, coma. Tratamiento: soporte (hidratación cuidadosa, manejo electrolítico), diálisis si indicación (hiperK refractaria, sobrecarga de volumen, uremia severa), evitar antibióticos y antimotilinos en fase diarreica, evitar plaquetas.',
    specialty: 'Pediatría',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['SUH', 'síndrome urémico hemolítico', 'E. coli', 'trombocitopenia', 'diálisis']
  },
  // MEDICINA DE EMERGENCIAS
  {
    title: 'Guía IMSS - Trauma Grave',
    content: 'Evaluación primaria ABCDE: A (vía aérea con control de columna cervical), B (respiración y ventilación), C (circulación con control de hemorragias), D (disabilidad neurológica - AVPU, Glasgow), E (exposición/ambiental con control de temperatura). Evaluación secundaria con examen completo从头到脚. Acceso venoso gruesos (14-16G), cristaloides calientes (Hartmann o solución salina), sangre O negativa si Shock Clase IV. Reanimación concurrente con diagnóstico: FAST (Focused Assessment with Sonography for Trauma), radiografías de tórax, pelvis, columna cervical según mecanismo.',
    specialty: 'Medicina de Urgencias',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['trauma', 'ABCDE', 'ATLS', 'FAST', 'shock', 'Glasgow', 'reanimación']
  },
  {
    title: 'Guía IMSS - Paro Cardiorrespiratorio',
    content: 'RCP adulto: llamada de ayuda, iniciar compresiones torácicas (profundidad 5-6cm, frecuencia 100-120/min, relación compresión-ventilación 30:2, permitir completa recoil, minimizar interrupciones), vía aérea (boca-boca o bolsa-máscara), acceso vascular y adrenalina 1mg IV c/3-5min, ritmos no desfibrilables (asistolia, AESP) continuar RCP + adrenalina, ritmos desfibrilables (FV, TV sin pulso) descarga inmediata 200-360J según tipo de desfibrilador. Causas reversibles 5H+5T: Hipovolemia, Hipoxia, H+ (acidosis), Hipo/HiperK, Hipotermia, Taponamiento, Tensión neumotórax, Trombosis (Pulmonar/Coronaria), Tóxicos.',
    specialty: 'Medicina de Urgencias',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['RCP', 'paro cardíaco', 'BLS', 'ACLS', 'adrenalina', 'desfibrilación', 'ABCDE']
  },
  // MEDICINA PREVENTIVA
  {
    title: 'NOM-035-SCT2-2017 - Salud en el Trabajo',
    content: 'Normativa para identificación, prevención y análisis de riesgos psicosociales. Factores de riesgo psicosocial: condiciones peligrosas e inseguras, cargas de trabajo excesivas, falta de control sobre el trabajo, jornadas de trabajo extensas, interferencia en la relación trabajo-familia, liderazgo negativo, violencia laboral. Obligaciones del patrón: identificar y analizar riesgos, realizar exámenes médicos integrales, practicar exámenes médicos generales a trabajadores expuestos, mantener registros por 12 años, informar trabajadores sobre riesgos y medidas de prevención.',
    specialty: 'Medicina Preventiva',
    source: 'Secretaría del Trabajo',
    year: 2017,
    type: 'nom',
    keywords: ['psicosocial', 'trabajo', 'riesgos', 'salud laboral', 'prevención', 'violencia']
  },
  {
    title: 'NOM-031-SSA2-1999 - Atención a la Salud de la Infancia',
    content: 'Norma para la atención de la salud de niñas y niños de 0 a 9 años. Actividades por grupo de edad: recién nacido (tamizaje metabólico, audiometría, Valoración de Riesgo Neonatal), lactante (vacunación, suplementación vitamina D 400UI/día, prevención de caries, detección temprana de problemas desarrollo), preescolar (vacunación, psicomotricidad, lenguaje, socialización), escolar (vacunación, detección de problemas visuales y auditivos, salud bucodental, orientación nutricional). Registro en Cartilla Nacional de Salud.',
    specialty: 'Pediatría',
    source: 'Secretaría de Salud',
    year: 1999,
    type: 'nom',
    keywords: ['niñez', 'vacunación', 'desarrollo', 'tamizaje', 'Cartilla Nacional']
  }
];

/**
 * Generate embedding for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    logger.error('', undefined,  as Error);
    throw error;
  }
}

/**
 * Initialize the medical knowledge base with sample guidelines
 */
export async function initializeMedicalKnowledgeBase(): Promise<void> {
  const supabase = await createClient();

  logger.info('Initializing medical knowledge base', { context: 'medical-knowledge' });

  for (const guideline of SAMPLE_GUIDELINES) {
    try {
      // Check if already exists
      const { data: existing } = await supabase
        .from('medical_knowledge')
        .select('id')
        .eq('metadata->>title', guideline.title)
        .single();

      if (existing) continue;

      // Generate embedding
      const embedding = await generateEmbedding(guideline.content);

      // Store in database
      await supabase.from('medical_knowledge').insert({
        content: guideline.content,
        source: guideline.source,
        specialty: guideline.specialty,
        embedding: embedding,
        metadata: {
          title: guideline.title,
          author: guideline.source,
          year: guideline.year,
          type: guideline.type,
          keywords: guideline.keywords,
        }
      });

      logger.info(`Added medical guideline: ${guideline.title}`, { context: 'medical-knowledge' });
    } catch (error) {
      logger.error(`Error adding ${guideline.title}`, { context: 'medical-knowledge', error });
    }
  }

  logger.info('Medical knowledge base initialized', { context: 'medical-knowledge' });
}

/**
 * Retrieve relevant medical context based on symptoms/query
 */
export async function retrieveMedicalContext(
  query: string,
  options?: {
    specialty?: string;
    limit?: number;
  }
): Promise<RetrievedContext> {
  const supabase = await createClient();
  const limit = options?.limit || 5;
  
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Use Supabase's vector similarity search
    const { data, error } = await supabase.rpc('match_medical_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: limit,
      filter_specialty: options?.specialty || null,
    });
    
    if (error) {
      // Fallback to keyword search if vector search fails
      logger.warn('', undefined,  as Error);
      return keywordSearch(supabase, query, options);
    }
    
    if (!data || data.length === 0) {
      return keywordSearch(supabase, query, options);
    }
    
    return {
      documents: (data as MedicalDocumentWithSimilarity[]).map((doc) => ({
        id: doc.id,
        content: doc.content,
        source: doc.source,
        specialty: doc.specialty,
        metadata: doc.metadata,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
      })),
      relevance_scores: (data as MedicalDocumentWithSimilarity[]).map((doc) => doc.similarity || 0.7),
      total_results: data.length,
      query,
    };
  } catch (error) {
    logger.error('', undefined,  as Error);
    return keywordSearch(supabase, query, options);
  }
}

/**
 * Fallback keyword search
 */
async function keywordSearch(
  supabase: Awaited<ReturnType<typeof createClient>>,
  query: string,
  options?: { specialty?: string; limit?: number }
): Promise<RetrievedContext> {
  const limit = options?.limit || 5;
  const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  let dbQuery = supabase
    .from('medical_knowledge')
    .select('*')
    .limit(limit);
  
  if (options?.specialty) {
    dbQuery = dbQuery.or(`specialty.eq.${options.specialty},specialty.eq.General`);
  }
  
  // Search in content
  if (keywords.length > 0) {
    const searchPattern = keywords.join('%');
    dbQuery = dbQuery.ilike('content', `%${searchPattern}%`);
  }
  
  const { data, error } = await dbQuery;
  
  if (error || !data) {
    return {
      documents: [],
      relevance_scores: [],
      total_results: 0,
      query,
    };
  }
  
  return {
    documents: data,
    relevance_scores: data.map(() => 0.5),
    total_results: data.length,
    query,
  };
}

/**
 * Generate augmented prompt with retrieved medical context
 */
export function generateAugmentedPrompt(
  basePrompt: string,
  retrievedContext: RetrievedContext
): string {
  if (retrievedContext.documents.length === 0) {
    return basePrompt;
  }
  
  const contextSummary = retrievedContext.documents
    .map((doc, index) => {
      const score = retrievedContext.relevance_scores[index];
      const title = doc.metadata?.title || doc.source;
      const relevanceLabel = score >= 0.8 ? '⭐' : score >= 0.6 ? '✓' : '';
      return `📋 **${title}** ${relevanceLabel} (${doc.source}, ${doc.metadata?.year || 'N/A'})\n${doc.content.substring(0, 400)}...`;
    })
    .join('\n\n');
  
  return `${basePrompt}

## CONTEXTO MÉDICO RELEVANTE (Guías Clínicas Mexicanas)
${contextSummary}

## INSTRUCCIONES DE CITACIÓN
- Utiliza la información de las guías clínicas para fundamentar tu respuesta
- Cita las fuentes específicas (NOM, IMSS, ISSSTE, etc.) cuando hagas recomendaciones
- Prioriza las guías mexicanas (NOM, IMSS, ISSSTE) sobre internacionales
- Si hay información conflictiva, menciona las diferentes perspectivas
- Incluye referencias al final de tu respuesta cuando cites guías específicas`;
}

/**
 * Get medical knowledge statistics
 */
export async function getMedicalKnowledgeStats(): Promise<{
  total_documents: number;
  documents_by_specialty: Record<string, number>;
  documents_by_source: Record<string, number>;
  last_updated: string;
}> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('medical_knowledge')
    .select('specialty, source, updated_at');
  
  if (error || !data) {
    return {
      total_documents: 0,
      documents_by_specialty: {},
      documents_by_source: {},
      last_updated: new Date().toISOString(),
    };
  }
  
  const specialtyCount: Record<string, number> = {};
  const sourceCount: Record<string, number> = {};
  
  data.forEach(doc => {
    specialtyCount[doc.specialty] = (specialtyCount[doc.specialty] || 0) + 1;
    sourceCount[doc.source] = (sourceCount[doc.source] || 0) + 1;
  });
  
  const lastUpdated = data
    .map(doc => doc.updated_at)
    .sort()
    .pop() || new Date().toISOString();
  
  return {
    total_documents: data.length,
    documents_by_specialty: specialtyCount,
    documents_by_source: sourceCount,
    last_updated: lastUpdated,
  };
}

