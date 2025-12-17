# Decisiones de Arquitectura

Este documento explica **por qué** tomamos decisiones específicas que van contra convenciones comunes.

## 🏗️ Sistemas Independientes vs Modelos Tradicionales

### Decisión
Cada sistema (booking, payment, discovery, availability) es **completamente independiente** en su propio archivo.

### Por qué
- **Se explica solo**: Cada archivo tiene Input → Proceso → Output claro
- **Testeable**: Puedo probar `booking.ts` sin tocar `payment.ts`
- **Escalable**: Cambiar el sistema de pago no rompe el sistema de reservas
- **Reversible**: Si cambio de Stripe a otro provider, solo modifico `payment.ts`

### Alternativa rechazada
Modelo MVC tradicional donde todo está acoplado. Cambiar una cosa requiere entender 5 archivos.

---

## 👨‍⚕️ 2 Estados de Doctor vs 4 Estados

### Decisión
Solo `unverified` y `verified`. No hay `draft`, `pending`, `rejected`.

### Por qué
- **Menos fricción**: Doctor puede configurar TODO inmediatamente
- **Más claro**: "¿Estás verificado?" Sí/No. No hay estados intermedios confusos
- **Menos código**: No necesito lógica para "pending puede editar pero no publicar"
- **Mejor UX**: Doctor no está bloqueado esperando aprobación para configurar horarios

### Alternativa rechazada
4 estados (draft/pending/approved/rejected) requieren:
- Lógica compleja de "¿qué puede hacer en cada estado?"
- UI diferente para cada estado
- Mensajes confusos ("estás pending, ¿qué significa eso?")

### ¿Y si rechazan al doctor?
Sigue `unverified`. Admin puede dejar nota. Doctor puede corregir y re-enviar.

---

## 🔓 Slots Públicos vs Login Obligatorio

### Decisión
Cualquiera puede ver slots disponibles **sin login**. Login solo al reservar.

### Por qué
- **Reduce fricción**: Usuario explora antes de comprometerse a registrarse
- **Aumenta conversión**: "Veo que hay citas hoy" → más probabilidad de registro
- **Mejor UX**: No frustras a usuarios pidiendo login para solo "ver"
- **Menos abandono**: Registro forzado temprano = alta tasa de abandono

### Seguridad
- Ver slots: Público (solo info de disponibilidad)
- Crear cita: Requiere auth (API valida session)
- Los datos sensibles (paciente, doctor personal) nunca se exponen al ver slots

### Alternativa rechazada
Login obligatorio para ver slots. Razonamiento: "Si no están dispuestos a registrarse, no son usuarios serios."

**Problema**: Ese razonamiento asume que todos los usuarios tienen la misma motivación inicial. En realidad:
- Usuario curioso: "¿Hay doctores cerca de mí?"
- Usuario comparando: "¿Cuánto cuesta? ¿Hay horarios convenientes?"
- Usuario comprometido: "Necesito cita YA"

Solo el tercero registra inmediatamente. Los primeros dos abandonan si pides login temprano.

---

## ⏱️ Sin `reserved_until` vs Sistema de Reservas con Timeout

### Decisión
**NO usamos** campo `reserved_until` para "hold" temporal de slots.

### Por qué
- **Stripe ya maneja timeout**: Payment Intent expira en 10 minutos automáticamente
- **Menos complejidad**: No necesito cron jobs para liberar slots expirados
- **Más simple**: `pending_payment` O `confirmed`. Sin estados intermedios.
- **Suficientemente bueno**: Si alguien abandona el pago, slot se libera en max 10 minutos

### Alternativa rechazada
Sistema de "hold" con `reserved_until`:
```sql
-- Cita creada con hold de 5 minutos
reserved_until: now() + 5 minutes
```

**Problemas**:
- Necesito filtrar slots expirados en cada query (`WHERE reserved_until > NOW()`)
- ¿Qué pasa si el usuario tarda 6 minutos en Stripe? Reserva expiró pero Stripe sigue activo
- Complejidad para "just in case" (Principio 9: "Si agregas por si acaso, vas mal")

### ¿Y si dos usuarios intentan el mismo slot?
**Race condition real**: Usuario A y B seleccionan mismo slot simultáneamente.

**Solución actual**:
1. Usuario A crea cita → `INSERT` en DB → status `pending_payment`
2. Usuario B crea cita → `INSERT` en DB → **falla** (violación de constraint única en doctor_id + scheduled_for)
3. Usuario B ve "Slot ya no disponible, elige otro"

**Costo**: Muy ocasional (requiere timing exacto). Beneficio: Elimina toda complejidad de expiración.

---

## 📝 Onboarding en 1 Paso vs Wizard Multi-Paso

### Decisión
**Todo el onboarding en una sola pantalla scrollable**. No wizard de 3 pasos.

### Por qué
- **Menos clicks**: Ver todo de un vistazo
- **Menos abandono**: Los wizards tienen alta tasa de abandono en steps intermedios
- **Más rápido**: Llenar todo de corrido es más eficiente que navegar
- **Validación clara**: Ves qué falta completar sin "siguiente, siguiente"

### Alternativa rechazada
Wizard de 3 pasos (Profesional → Disponibilidad → Precio).

**Falacia del "no abrumar"**: La idea de que "3 pasos es menos abrumador que 1 página" es falsa.

**En realidad**:
- Usuario ve Step 1/3 → "¿Cuánto falta?"
- Step 2/3 → "¿Puedo volver a editar Step 1?"
- Step 3/3 → "¿Envío o reviso?"

vs 1 página:
- Usuario scrollea → ve todo → completa → envía

**Excepción**: Si tuviéramos 50 campos, sí tendría sentido wizard. Con 8 campos, 1 página es más eficiente.

---

## 🧪 Prueba de Decisión

Cada decisión aquí pasa esta prueba:

1. **¿Reduce pasos?** ✅
2. **¿Elimina complejidad?** ✅  
3. **¿Es reversible?** ✅
4. **¿Puedo explicarlo en 2 líneas?** ✅

Si una decisión falla cualquiera, la rechazamos.

---

## 🔄 Cuándo Cambiar

Estas decisiones **NO son permanentes**. Cambia si:

1. **Datos reales muestran problema**: "50% abandona al ver slots públicos"
2. **Nuevo caso de uso**: "Doctores empresariales necesitan 10 estados"
3. **Regulación**: "COFEPRIS requiere aprobación dual"

**NO cambies por**: "X framework hace Y distinto", "Leí artículo que dice Z", "Empresa grande usa W".

---

## ⏰ Restricción de Cambios de Disponibilidad

### Decisión (Pendiente de Implementación)
Los doctores solo pueden modificar su disponibilidad con **48 horas de antelación mínima**.

### Por qué
- **Mejor servicio**: Pacientes no pierden citas por cambios de último momento
- **Confiabilidad**: Sistema más predecible y profesional
- **Reduce cancelaciones**: Doctor piensa dos veces antes de cambiar horarios
- **Menos fricción**: Paciente confía que el slot reservado NO desaparecerá

### Cómo funciona
1. Doctor cambia disponibilidad HOY → cambios solo afectan slots desde pasado mañana (48h+)
2. Slots ya reservados NUNCA se pueden eliminar (protección absoluta)
3. Sugerencia UI: "Recomendamos actualizar disponibilidad una vez por semana (ej. cada viernes)"

### Alternativa rechazada
Permitir cambios inmediatos sin restricción. **Problema**: Doctor puede eliminar horarios con citas ya reservadas, causando cancelaciones inesperadas.

### Estado
⏸️ **Documentado, no implementado**. Prioridad: Después de completar FLUJO 1 y FLUJO 2.

---

## 🤖 Sistema de IA Cooperativa (Humano + Máquina)

### Filosofía
IA no reemplaza al médico, **amplifica su capacidad**. La máquina maneja tareas repetitivas/riesgosas, el humano toma decisiones finales.

### Decisión
Integrar 5 sistemas de IA médica cooperativa priorizados por impacto vs complejidad:

---

## 1️⃣ Pre-consulta Inteligente (PRIORIDAD MÁXIMA)

### Problema
- Pacientes reservan citas para cosas que NO requieren doctor (resfriado común, info general)
- Doctor pierde tiempo en consultas de bajo valor
- Paciente frustra porque "pagué $500 para que me diga que tome agua"

### Decisión
Chatbot médico de triaje ANTES de reservar cita.

### Cómo funciona
1. Paciente selecciona doctor → ANTES de ver slots, chatbot pregunta:
   - "¿Cuál es el motivo de tu consulta?"
   - "¿Cuándo empezaron los síntomas?"
   - "¿Has tenido fiebre?"
2. IA evalúa urgencia con modelo médico (OpenAI GPT-4 fine-tuned)
3. Responde:
   - **Urgencia**: "Ve a urgencias ahora" + link hospitales cercanos
   - **Requiere consulta**: Muestra slots + genera resumen pre-consulta para doctor
   - **Autocuidado**: "Parece resfriado común, aquí está el plan" + opción "¿Quieres consulta de todas formas?"
4. Doctor recibe resumen: "Paciente: fiebre 3 días, dolor garganta, sin contacto COVID"

### Por qué IA (no solo formulario)
- Formulario estático no detecta banderas rojas (dolor pecho + brazo izquierdo = urgencia)
- IA pregunta dinámicamente según respuestas
- Lenguaje natural vs checkboxes médicos confusos

### Valor diferencial
- **Para paciente**: No paga $500 por "toma agua"
- **Para doctor**: Consultas de mayor valor, llega preparado
- **Para plataforma**: Reduce tasa de insatisfacción, aumenta NPS

### Alternativa rechazada
Formulario estático de síntomas. **Problema**: Paciente no sabe si "dolor abdominal" es urgencia o indigestión.

### MVP (Primera Implementación)
- Solo 3 categorías: Urgencia, Consulta, Autocuidado
- Prompt engineering (no fine-tuning inicial)
- Modelo: OpenAI GPT-4o-mini (barato, rápido)
- UI: Chat simple en modal antes de ver slots
- Costo estimado: $0.01-0.05 por triaje

### Estado
⏸️ **Documentado**. Implementar después de FLUJO 1 completo.

---

## 2️⃣ Transcripción + Resumen de Consulta

### Problema
Doctor pierde 5-10 min post-consulta escribiendo nota médica. Esto reduce consultas/día y aumenta burnout.

### Decisión
Grabar consulta → transcribir → generar nota médica automática → doctor solo revisa/aprueba.

### Cómo funciona
1. Consulta inicia → botón "Grabar" (requiere consentimiento paciente)
2. Audio grabado se envía a Whisper API (OpenAI)
3. Transcripción se procesa con GPT-4 para generar:
   - Motivo de consulta
   - Síntomas reportados
   - Diagnóstico (del doctor en la conversación)
   - Plan de tratamiento
4. Doctor revisa/edita/aprueba en 30 segundos

### Por qué IA
- Whisper es mejor que transcripción humana (entiende jerga médica)
- GPT-4 extrae estructura de conversación no estructurada
- Doctor mantiene control final (cumple regulaciones)

### Valor diferencial
- Doctor ahorra 10 min/consulta = +2 consultas/día
- Notas más completas y legibles
- Cumple auditorías médicas (registro completo)

### Alternativa rechazada
Plantillas manuales. **Problema**: Doctor igual teclea todo, solo con estructura pre-definida.

### Estado
⏸️ **Documentado**. Prioridad 2 después de Pre-consulta.

---

## 3️⃣ Seguimiento Post-consulta Automático

### Problema
Paciente no sigue tratamiento (olvida medicamentos, no reporta síntomas). Doctor no sabe si paciente mejoró o empeoró.

### Decisión
Bot de seguimiento vía WhatsApp/SMS con alertas inteligentes al doctor.

### Cómo funciona
1. Consulta termina → sistema programa seguimientos:
   - **Día 1**: "¿Tomaste tu medicamento hoy?"
   - **Día 3**: "Del 1-10, ¿cómo está tu dolor de garganta?"
   - **Día 7**: "¿Los síntomas desaparecieron?"
2. IA analiza respuestas:
   - **Mejorando**: No hace nada
   - **Empeorando**: Alerta al doctor + sugiere consulta de seguimiento
3. Doctor ve dashboard con pacientes que necesitan atención

### Por qué IA
- Detecta patrones ("fiebre subió" = alerta, "fiebre bajó" = OK)
- Lenguaje natural vs formularios
- Escala a 100 pacientes sin contratar enfermera

### Valor diferencial
- Paciente se siente cuidado (retención)
- Doctor detecta complicaciones temprano (reduce demandas)
- Plataforma genera data para mejorar tratamientos

### Estado
⏸️ **Documentado**. Prioridad 3.

---

## 4️⃣ Asistente de Recetas (Seguridad Médica)

### Problema
Doctor puede recetar medicamento que interactúa con otro del paciente, o dosis incorrecta para niños.

### Decisión
IA valida receta en tiempo real y alerta sobre errores potenciales.

### Cómo funciona
1. Doctor escribe receta → sistema valida:
   - Interacciones medicamentosas (base de datos + IA)
   - Dosis según peso/edad
   - Alergias del paciente
   - Contraindicaciones
2. Si hay alerta: "⚠️ Ibuprofeno contraindicado con warfarina"
3. Doctor decide: ignorar (con justificación) o cambiar

### Por qué IA
- Base de datos médica + razonamiento contextual
- Actualización continua con nuevos estudios
- Detecta combinaciones raras que doctor puede olvidar

### Valor diferencial
- Reduce errores médicos (responsabilidad legal)
- Aumenta confianza del paciente
- Plataforma cumple estándares de calidad

### Alternativa rechazada
Checklist manual. **Problema**: Doctor omite pasos bajo presión.

### Estado
⏸️ **Documentado**. Prioridad 4 (requiere base de datos médica completa).

---

## 5️⃣ Matching Inteligente Paciente-Doctor

### Problema
Paciente busca "cardiólogo" → ve lista de 20 → no sabe cuál elegir → abandona o elige mal.

### Decisión
IA recomienda top 3 doctores según múltiples factores ponderados.

### Cómo funciona
1. Paciente describe síntomas/necesidad
2. IA analiza:
   - Especialización específica (no solo "cardiólogo", sino "cardiólogo pediátrico")
   - Reviews de casos similares
   - Disponibilidad + precio + ubicación
   - Idioma + compatibilidad cultural
3. Muestra: "Mejor match para ti: Dr. X (95% compatibilidad)"

### Por qué IA
- Considera 10+ variables simultáneamente
- Aprende de éxitos pasados
- Personalización vs búsqueda genérica

### Valor diferencial
- Paciente encuentra doctor correcto en primer intento
- Doctor recibe pacientes mejor matched
- Plataforma reduce tasa de cancelación

### Estado
⏸️ **Documentado**. Prioridad 5 (requiere volumen de datos históricos).

---

## 📊 Plan de Implementación IA

### Fase 1: MVP Pre-consulta (2-3 semanas)
1. Integrar OpenAI API
2. Diseñar prompt de triaje médico
3. UI: Modal de chat pre-reserva
4. Validar con 50 consultas reales
5. Medir: % consultas evitadas, NPS

### Fase 2: Transcripción (1-2 semanas)
1. Integrar Whisper API
2. Prompt para generar nota médica
3. UI: Botón grabar + editor de notas
4. Medir: Tiempo ahorrado/consulta

### Fase 3+: Resto según demanda

### Costo Estimado (por consulta)
- Pre-consulta: $0.01-0.05
- Transcripción: $0.10-0.20
- Seguimiento: $0.05/paciente/semana
- Total: <$0.50/consulta (2% del precio promedio)

### Dependencias Técnicas
```json
{
  "openai": "^4.0.0",
  "@supabase/supabase-js": "^2.0.0" // Para guardar conversaciones
}
```

### Cumplimiento Regulatorio
- ✅ Doctor mantiene decisión final (no es diagnóstico automatizado)
- ✅ Consentimiento explícito para grabaciones
- ✅ Datos encriptados en tránsito y reposo
- ✅ Cumple HIPAA/GDPR (Supabase certificado)

---

## 📚 Principios que Guiaron Estas Decisiones

1. **Claridad antes que complejidad**
2. **Sistema antes que feature**
3. **Proceso antes que código**
4. **Mínimo viable** (construimos lo que funciona HOY)
5. **Escalable/cambiable** (decisiones reversibles)
6. **Automatizar lo repetible** (config > código)
7. **Validar contra realidad** (reduce fricción real)
8. **Documentar para pensar** (escribir para entender)
9. **Cómo saber si vas bien** (simplifica, elimina pasos)

Cada decisión aquí cumple los 9 principios.

---

## 🚀 Features IA Adicionales (Roadmap Extendido)

### Priorización P0-P3

**P0 (MVP - 3 meses)**: Pre-consulta, Transcripción, Seguimiento  
**P1 (Diferenciadores - 6 meses)**: Historial Médico, Farmacia, Emergencias 24/7  
**P2 (Escaladores - 12 meses)**: Second Opinion, Predicción Riesgo, Educación  
**P3 (Innovadores - 18 meses)**: Análisis Imágenes, Comunidad, Coach Hábitos, Wearables

---

### **P1-01: Historial Médico Inteligente** 🏥
**Prioridad**: P1 (Alta - Diferenciador competitivo)

**Problema**:  
Pacientes llegan con bolsas de estudios físicos, el doctor pierde 10min digitalizando. Información desestructurada imposibilita análisis de tendencias.

**Solución IA**:  
- OCR + NLP para extraer datos estructurados de PDFs/fotos  
- Cronología automática de diagnósticos, medicamentos, alergias  
- Gráficos de evolución (glucosa, presión, peso histórico)  
- Alertas de interacciones medicamentosas

**MVP (Mes 4-6)**:  
1. Upload de PDF/imagen → OCR con Google Cloud Vision API  
2. Extracción de campos clave: fecha, tipo de estudio, valores numéricos  
3. Timeline visual básico ordenado cronológicamente  
4. Alertas simples de alergias (match contra prescripciones)

**Tecnología**:  
- Google Cloud Vision API ($1.50/1000 páginas)  
- OpenAI GPT-4 para estructuración ($0.03/documento)  
- PostgreSQL JSONB para datos extraídos

**Costo Estimado**: $0.05-0.08 por documento procesado  
**Valor**: Ahorra 10min/consulta × $50/hora = $8.33/consulta  
**ROI**: 100x

**Compliance**:  
- Cifrado AES-256 en reposo (Supabase Storage)  
- Auditoría de acceso (quién vio qué documento)  
- Retención configurable por jurisdicción

---

### **P1-02: Farmacia Inteligente + Entrega** 💊
**Prioridad**: P1 (Alta - Revenue adicional + experiencia)

**Problema**:  
Paciente sale de consulta, debe ir a farmacia física, a veces el medicamento no está disponible, debe regresar otro día.

**Solución IA**:  
- Receta digital enviada automáticamente a red de farmacias  
- Verificación de disponibilidad en tiempo real  
- Sugerencias de genéricos equivalentes (ahorro hasta 70%)  
- Entrega a domicilio en <2h o pickup programado

**MVP (Mes 4-6)**:  
1. Integración con 2-3 farmacias locales (API o WhatsApp Business)  
2. Envío automático de receta post-consulta  
3. Confirmación de disponibilidad vía SMS/WhatsApp  
4. Coordinación de entrega con mensajería local  
5. IA sugiere genéricos cuando marca no disponible

**Tecnología**:  
- API de farmacias partners (custom)  
- WhatsApp Business API para comunicación  
- OpenAI para matching de principios activos  
- Stripe para pagos

**Modelo de Negocio**:  
- Comisión 10-15% sobre venta de farmacia  
- Fee de entrega $2-5 (opcional para paciente)  
- Ingresos estimados: $5-10 por receta procesada

**Valor**:  
- Paciente: Ahorra viaje a farmacia (1h + transporte)  
- Doctor: Cierra el ciclo de atención  
- Plataforma: Revenue stream adicional

---

### **P1-03: Asistente de Emergencias 24/7** 🚨
**Prioridad**: P1 (Alta - Diferenciador crítico)

**Problema**:  
Emergencias médicas a medianoche → usuario no sabe si es ambulancia o puede esperar. Urgencias saturadas con casos no urgentes.

**Solución IA**:  
- Chatbot de triaje disponible 24/7  
- Evalúa síntomas con protocolo de Manchester Triage  
- Decisión: ambulancia ahora / urgencias 4h / consulta mañana  
- Conecta con doctor de guardia si ambiguo

**MVP (Mes 4-6)**:  
1. Chatbot con 10 síntomas de alerta roja (chest pain, stroke, bleeding)  
2. Flujo tipo árbol de decisión: "¿Dolor en el pecho? → ¿Se irradia? → AMBULANCIA"  
3. Botón de pánico directo a emergencias locales  
4. Historial médico pre-cargado para paramédicos  
5. Si no urgente: agenda consulta prioritaria next morning

**Tecnología**:  
- OpenAI GPT-4o con prompt especializado en triaje  
- Validación médica por comité de emergenciólogos  
- Integración con servicios de ambulancia (API o llamada directa)  
- Geolocalización para ambulancia más cercana

**Costo**: $0.03-0.05 por consulta de emergencia  
**Valor**: Potencialmente salva vidas + reduce saturación de urgencias

**Compliance**:  
- Disclaimer legal: "No reemplaza criterio médico profesional"  
- Botón de emergencia siempre visible  
- Registro auditado de todas las interacciones

---

### **P2-01: Second Opinion Asistida por IA** 🔍
**Prioridad**: P2 (Media - Casos complejos)

**Problema**:  
Diagnósticos complejos o cirugías mayores → paciente quiere segunda opinión pero no sabe a quién acudir. Proceso manual toma semanas.

**Solución IA**:  
- Análisis de historial + diagnóstico inicial  
- IA sugiere 3 especialistas ideales para second opinion  
- Paquete de información pre-armado para nuevo doctor  
- Comparación estructurada de ambas opiniones

**MVP (Mes 7-9)**:  
1. Paciente solicita second opinion desde dashboard  
2. IA analiza caso y sugiere doctores con experiencia relevante  
3. Sistema arma resumen ejecutivo para segundo doctor  
4. Consulta asíncrona (video opcional)  
5. Informe comparativo de ambos diagnósticos

**Valor**: $50-100 fee por second opinion (split 70/30 con doctor)

---

### **P2-02: Predicción de Riesgo Preventiva** 📊
**Prioridad**: P2 (Media - Salud preventiva)

**Problema**:  
Pacientes solo van al doctor cuando están enfermos. Enfermedades crónicas detectadas tarde cuestan 10x más tratar.

**Solución IA**:  
- Health Score basado en historial, hábitos, genética familiar  
- Predicción de riesgos: diabetes, hipertensión, cardiovascular  
- Alertas proactivas: "Tu riesgo de diabetes subió 15%, agenda checkup"  
- Plan preventivo personalizado

**MVP (Mes 7-9)**:  
1. Cuestionario inicial: edad, peso, presión, antecedentes familiares  
2. Scoring simple con modelo logístico (no deep learning)  
3. Alertas mensuales si score empeora  
4. Recomendaciones básicas: ejercicio, dieta, checkups

**Tecnología**: Regresión logística + rules engine (no IA costosa al inicio)

---

### **P2-03: Educación Médica Personalizada** 📚
**Prioridad**: P2 (Media - Engagement)

**Problema**:  
Doctor explica diagnóstico con términos médicos → paciente sale confundido, googlea y se asusta con WebMD.

**Solución IA**:  
- Post-consulta: explicación en lenguaje simple del diagnóstico  
- Videos personalizados sobre la condición  
- FAQs generadas automáticamente  
- Recursos confiables (no Dr. Google)

**MVP (Mes 10-12)**:  
1. Transcript de consulta → IA genera resumen en lenguaje simple  
2. Links a videos educativos verificados  
3. Glosario de términos médicos mencionados  
4. Próximos pasos en checklist visual

---

### **P3-01: Análisis de Síntomas con Imágenes** 📸
**Prioridad**: P3 (Baja - Innovador pero riesgoso)

**Problema**:  
Paciente con lesión cutánea → difícil describir por texto. Doctor necesita ver foto para evaluar urgencia.

**Solución IA**:  
- Upload de foto de lesión/erupción/herida  
- IA clasifica: urgente / consulta normal / autocuidado  
- Matching con doctor especializado en dermatología  
- Referencia cruzada con base de datos médica

**MVP (Mes 13-15)**:  
1. Upload de imagen en pre-consulta  
2. Computer Vision detecta categoría básica (quemadura, erupción, herida)  
3. Priorización automática de consulta  
4. Imagen anexada a historial para doctor

**Tecnología**: Google Vision API + modelo entrenado con dataset médico  
**Compliance**: Muy delicado - requiere validación médica exhaustiva, no puede ser diagnóstico automático

---

### **P3-02: Comunidad de Condiciones** 👥
**Prioridad**: P3 (Baja - Community engagement)

**Problema**:  
Pacientes con condiciones crónicas se sienten solos. Foros online no moderados tienen desinformación.

**Solución IA**:  
- Grupos privados por condición (diabetes, hipertensión, ansiedad)  
- IA modera para detectar desinformación  
- Conexión con otros pacientes similares  
- Doctor puede participar ocasionalmente

**MVP (Mes 13-15)**:  
1. Grupos cerrados para 5 condiciones comunes  
2. Moderación IA básica (filter spam, detect medical misinformation)  
3. Doctor anfitrión hace Q&A quincenal

---

### **P3-03: Coach de Hábitos Saludables** 🏃
**Prioridad**: P3 (Baja - Behavior change)

**Problema**:  
Doctor dice "baje de peso y haga ejercicio" → paciente intenta 3 días y abandona. Cambio de hábito requiere seguimiento.

**Solución IA**:  
- Metas incrementales: caminar 10min/día semana 1 → 15min semana 2  
- Recordatorios adaptativos basados en cumplimiento  
- Celebración de pequeños logros  
- Integración con doctor (reporte mensual de progreso)

**MVP (Mes 16-18)**:  
1. Paciente establece 1 meta (peso, ejercicio, medicación)  
2. Bot de WhatsApp envía recordatorio diario  
3. Check-in semanal: "¿Lograste X días?"  
4. Doctor ve dashboard de adherencia

---

### **P3-04: Integración con Wearables** ⌚
**Prioridad**: P3 (Baja - Data-driven pero complejo)

**Problema**:  
Paciente tiene Apple Watch/Fitbit → datos valiosos no llegan al doctor. Presión, sueño, actividad quedan en la app.

**Solución IA**:  
- Sincronización automática de datos de salud  
- Detección de anomalías: "Presión alta 7/7 últimos días"  
- Alertas proactivas a paciente y doctor  
- Consultas informadas con datos objetivos

**MVP (Mes 16-18)**:  
1. Integración con Apple Health + Google Fit  
2. Sincronización de 3 métricas: pasos, frecuencia cardíaca, sueño  
3. Gráficos en dashboard del doctor  
4. Alerta si métrica fuera de rango normal

**Tecnología**: HealthKit (iOS) + Google Fit API  
**Challenge**: Privacidad + compatibilidad cross-platform

---

## 📋 Plan de Implementación por Fases

### **Fase 1 (Mes 1-3): MVP Core**
- Pre-consulta Inteligente ✅  
- Transcripción + Resumen  
- Seguimiento Post-consulta  

**Objetivo**: Plataforma funcional con IA cooperativa básica  
**Budget**: $500/mes OpenAI + $200 Whisper = $700/mes

---

### **Fase 2 (Mes 4-6): Diferenciadores**
- Historial Médico Inteligente  
- Farmacia + Entrega  
- Emergencias 24/7  

**Objetivo**: Features que ningún competidor tiene  
**Budget**: +$1000/mes (Google Vision, WhatsApp Business)

---

### **Fase 3 (Mes 7-12): Escaladores**
- Second Opinion  
- Predicción de Riesgo  
- Educación Personalizada  

**Objetivo**: Escalabilidad y retención long-term  
**Budget**: +$500/mes (más usuarios, menos costo por usuario)

---

### **Fase 4 (Mes 13-18): Innovadores**
- Análisis Imágenes  
- Comunidad  
- Coach Hábitos  
- Wearables  

**Objetivo**: Innovación de frontera, prensa tech  
**Budget**: +$800/mes (Computer Vision, infraestructura)

---

## 🎯 Criterios de Priorización

Cada feature evaluada con:

1. **Impact**: ¿Resuelve dolor crítico? (1-5)  
2. **Diferenciación**: ¿Competencia lo tiene? (1-5)  
3. **Feasibility**: ¿Podemos construirlo? (1-5)  
4. **ROI**: ¿Genera revenue o ahorra costos? (1-5)  
5. **Compliance**: ¿Riesgo legal/médico? (1=alto, 5=bajo)

**P0/P1**: Score >20/25  
**P2**: Score 15-20  
**P3**: Score <15 (exploración)

---

## 🔐 Compliance Transversal

**TODAS** las features IA deben cumplir:

- ✅ Disclaimer: "IA asiste, no diagnostica"  
- ✅ Auditoría: Log de decisiones IA  
- ✅ Human-in-the-loop: Doctor siempre valida  
- ✅ Opt-out: Paciente puede rechazar IA  
- ✅ Explicabilidad: IA debe justificar recomendaciones  
- ✅ Privacidad: Datos nunca salen de ambiente HIPAA  
- ✅ Sesgo: Testing con poblaciones diversas  

**Revisión legal/médica obligatoria antes de producción.**
