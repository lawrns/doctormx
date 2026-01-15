# Testing Checklist - Sistema IA Cooperativa

## ✅ Pre-requisitos
- [ ] Migración SQL 003 ejecutada en Supabase
- [x] Features activadas en .env.local
- [ ] Servidor Next.js corriendo (`npm run dev`)
- [ ] Usuario de prueba: paciente@test.com / test123
- [ ] Usuario de prueba: doctor@test.com / test123

---

## 🧪 Test 1: Pre-consulta Inteligente

### Setup
1. Login como paciente@test.com
2. Ir a `/doctors`
3. Seleccionar cualquier doctor verificado
4. Click "Agendar consulta"

### Flujo
1. [ ] Seleccionar fecha (hoy + 1 día)
2. [ ] Seleccionar hora disponible
3. [ ] Click "Iniciar pre-consulta IA"
4. [ ] Modal abre con mensaje inicial de bienvenida
5. [ ] Responder pregunta 1: "Dolor de cabeza hace 3 días"
6. [ ] IA hace pregunta de seguimiento
7. [ ] Responder pregunta 2: "Frontal, constante"
8. [ ] IA hace otra pregunta
9. [ ] Responder pregunta 3: "No he tomado nada"
10. [ ] IA muestra mensaje final
11. [ ] Modal se cierra automáticamente
12. [ ] Continúa al checkout

### Validaciones
- [ ] Chat funciona sin errores
- [ ] Mensajes se muestran correctamente (usuario vs asistente)
- [ ] No hay diagnósticos directos ("tienes migraña" ❌)
- [ ] Disclaimer visible: "Esta conversación es solo informativa"
- [ ] En Supabase: `pre_consulta_sessions` tiene 1 registro nuevo
- [ ] Status = 'completed'
- [ ] Summary tiene: chiefComplaint, urgencyLevel, suggestedSpecialty

**Costo esperado:** ~$0.02-0.05

---

## 🧪 Test 2: Transcripción con Whisper

### Setup
1. Login como doctor@test.com
2. Tener una cita confirmada (status='confirmed')
3. Ir a `/doctor/prescription/[appointmentId]`

### Preparación Audio
Crear archivo de prueba (30 segundos):
```bash
# Grabar audio diciendo:
"Paciente con cefalea tensional. 
Prescripción: Paracetamol 500mg, 
una tableta cada 8 horas por 5 días. 
Seguimiento en 7 días."
```
Guardar como `test-consulta.mp3`

### Flujo
1. [ ] Ver sección "Transcripción automática (opcional)"
2. [ ] Click "Subir grabación de consulta"
3. [ ] Seleccionar archivo de audio
4. [ ] Ver barra de progreso (Upload... X%)
5. [ ] Ver "Transcribiendo con IA..."
6. [ ] Campos auto-rellenados:
   - Diagnóstico: "Cefalea tensional"
   - Medicamentos: "Paracetamol 500mg..."
   - Instrucciones: "Seguimiento en 7 días"

### Validaciones
- [ ] Upload sin errores
- [ ] Transcripción toma ~10-30 segundos
- [ ] Texto extraído correctamente
- [ ] Campos del formulario se llenan automáticamente
- [ ] En Supabase: `consultation_transcripts` tiene 1 registro
- [ ] Status = 'completed'
- [ ] Summary contiene: diagnosis, prescriptions, followUpInstructions
- [ ] Audio guardado en Supabase Storage

**Costo esperado:** ~$0.003 (30 segundos)

---

## 🧪 Test 3: Seguimiento Post-consulta

### Setup Automático
El trigger se ejecuta cuando una cita pasa a status='completed'

### Flujo
1. [ ] Completar una consulta (cambiar status a 'completed')
2. [ ] En Supabase: verificar tabla `follow_up_schedules`
3. [ ] Debe haber 3 registros:
   - type='24h-check', scheduled_for = ahora + 24h
   - type='7d-progress', scheduled_for = ahora + 7 días
   - type='30d-outcome', scheduled_for = ahora + 30 días
4. [ ] Todos con status='pending'

### Simular Respuesta
```bash
curl -X POST http://localhost:3000/api/ai/followup \
  -H "Content-Type: application/json" \
  -d '{
    "followUpId": "UUID-del-follow-up",
    "response": "Me siento mucho mejor, gracias"
  }'
```

### Validaciones
- [ ] Trigger crea 3 follow-ups automáticamente
- [ ] Messages contienen variables reemplazadas ({{doctorName}}, {{patientName}})
- [ ] Respuesta actualiza status a 'responded'
- [ ] Detección de escalamiento funciona (probar con "estoy peor")
- [ ] En Supabase: `ai_audit_logs` registra la operación

**Costo esperado:** $0 (no usa IA generativa)

---

## 🐛 Bugs Comunes Esperados

### Pre-consulta
- [ ] Modal no abre → Verificar feature flag en .env.local
- [ ] "No autenticado" → Login primero
- [ ] Chat no responde → Verificar OPENAI_API_KEY
- [ ] "Rate limit" → Esperar 60 segundos

### Transcripción
- [ ] "Feature no habilitada" → Verificar flag
- [ ] "Solo doctores" → Login como doctor
- [ ] Upload falla → Verificar tamaño <25MB y formato correcto
- [ ] No transcribe → Verificar API key OpenAI

### Seguimiento
- [ ] No se crean follow-ups → Verificar trigger en DB
- [ ] Tabla no existe → Ejecutar migración 003

---

## 📊 Verificación Final

### En Supabase SQL Editor:
```sql
-- Contar registros de IA
SELECT 
  'pre_consulta_sessions' as table, COUNT(*) as count 
FROM pre_consulta_sessions
UNION ALL
SELECT 
  'consultation_transcripts', COUNT(*) 
FROM consultation_transcripts
UNION ALL
SELECT 
  'follow_up_schedules', COUNT(*) 
FROM follow_up_schedules
UNION ALL
SELECT 
  'ai_audit_logs', COUNT(*) 
FROM ai_audit_logs;

-- Ver costos acumulados
SELECT 
  operation,
  SUM(cost) as total_cost,
  COUNT(*) as operations
FROM ai_audit_logs
GROUP BY operation;
```

### Costos Totales Esperados
- Pre-consulta: $0.02-0.05
- Transcripción: $0.003
- Seguimiento: $0
- **TOTAL: ~$0.03-0.06** para testing completo

---

## ✅ Criterios de Éxito

- [ ] 3/3 features funcionan sin errores críticos
- [ ] Datos se guardan correctamente en DB
- [ ] Auditoría registra todas las operaciones
- [ ] Costos dentro de lo esperado
- [ ] UX fluida (no lags, mensajes claros)
- [ ] Safety checks funcionan (no diagnósticos inapropiados)

---

## 📝 Reportar Bugs

Formato:
```
Feature: [Pre-consulta/Transcripción/Seguimiento]
Paso: [Número del checklist]
Error: [Mensaje de error o comportamiento]
Consola: [Logs relevantes]
```
