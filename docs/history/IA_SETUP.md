# Sistema de IA Cooperativa - Guía de Activación

## 🎯 Features P0 Implementadas

### 1. Pre-consulta Inteligente ✅
**Archivos:**
- `src/components/PreConsultaChat.tsx` - Modal de chat interactivo
- `src/app/api/ai/preconsulta/route.ts` - Backend con OpenAI
- `src/app/book/[doctorId]/BookingForm.tsx` - Integración en flujo de booking

**Activar:**
```bash
# .env.local
NEXT_PUBLIC_AI_PRECONSULTA=true
```

**Funcionalidad:**
- Chat conversacional antes de agendar (3-5 preguntas)
- Análisis automático de urgencia (baja/media/alta/emergencia)
- Safety checks para prevenir diagnósticos inapropiados
- Contexto guardado en DB para el doctor
- Costo: ~$0.01-0.05 por pre-consulta

---

### 2. Transcripción con Whisper ✅
**Archivos:**
- `src/components/TranscriptionUploader.tsx` - UI de upload de audio
- `src/app/api/ai/transcription/route.ts` - Backend con Whisper API
- `src/app/doctor/prescription/[appointmentId]/page.tsx` - Integrado en recetas

**Activar:**
```bash
# .env.local
NEXT_PUBLIC_AI_TRANSCRIPTION=true
```

**Funcionalidad:**
- Upload de audio de consulta (MP3, WAV, M4A, WebM hasta 25MB)
- Transcripción automática con Whisper
- Resumen estructurado: diagnóstico, síntomas, recetas, seguimiento
- Auto-rellena formulario de receta
- Storage en Supabase
- Costo: ~$0.006 por minuto de audio

---

### 3. Seguimiento Post-consulta ✅
**Archivos:**
- `src/app/api/ai/followup/route.ts` - Backend para respuestas y creación
- `supabase/migrations/003_ai_tables.sql` - Trigger automático

**Activar:**
```bash
# .env.local
NEXT_PUBLIC_AI_FOLLOWUP=true
```

**Funcionalidad:**
- Trigger automático al completar consulta
- 3 check-ins: 24h, 7d, 30d
- Plantillas personalizadas por tipo
- Detección de escalamiento ("peor", "dolor", etc.)
- Notificación automática al doctor si necesario
- Canal: WhatsApp (24h, 7d) / Email (30d)

---

## 📊 Migración de Base de Datos

**Ejecutar manualmente en Supabase SQL Editor:**

1. Ve a: https://supabase.com/dashboard/project/lbxfierdgiewuslpgrhs/sql/new
2. Copia todo el contenido de `supabase/migrations/003_ai_tables.sql`
3. Pega y ejecuta
4. Verifica tablas creadas:
   - `pre_consulta_sessions`
   - `consultation_transcripts`
   - `follow_up_schedules`
   - `ai_audit_logs`
   - `ai_disclaimers`

---

## 🧪 Testing

### Pre-consulta:
1. Ir a `/book/[doctorId]`
2. Seleccionar fecha/hora
3. Click "Iniciar pre-consulta IA"
4. Responder 3+ preguntas
5. Verificar que continúa al pago automáticamente

### Transcripción:
1. Completar consulta
2. Ir a `/doctor/prescription/[appointmentId]`
3. Subir audio de prueba
4. Verificar que auto-rellena formulario

### Seguimiento:
1. Completar una consulta
2. Verificar en DB que se crearon 3 follow-ups
3. Simular respuesta vía API: POST `/api/ai/followup`

---

## 💰 Costos Estimados

**Con 100 consultas/mes:**
- Pre-consulta: $1-5/mes (si todos la usan)
- Transcripción: $6-12/mes (30min promedio por consulta)
- Follow-up: $0 (solo mensajería, no IA generativa)

**Total: ~$7-17/mes** para 100 consultas

---

## 🔐 Compliance

✅ Todas las features cumplen:
- Disclaimer: "IA asiste, no diagnostica"
- Auditoría completa en `ai_audit_logs`
- Human-in-the-loop (doctor valida todo)
- RLS policies (privacidad)
- Safety checks automáticos
- Datos cifrados (Supabase AES-256)

---

## 🚀 Próximos Pasos (P1-P3)

**P1 (Diferenciadores):**
- Historial Médico Inteligente (OCR)
- Farmacia + Entrega
- Emergencias 24/7

**P2 (Escaladores):**
- Second Opinion Asistida
- Predicción de Riesgo
- Educación Personalizada

**P3 (Innovadores):**
- Análisis de Imágenes
- Comunidad de Condiciones
- Coach de Hábitos
- Wearables

Ver `DECISIONES.md` para roadmap completo.

---

## 📝 Notas Técnicas

- OpenAI SDK: v4.x instalado
- Features OFF por defecto (kill switch)
- Dynamic import para evitar errores client-side
- Retry logic para rate limits
- ESLint passing con `eslint-disable` donde necesario
- TypeScript strict mode compatible

**Estado:** ✅ Ready for production testing
