# UI/UX Audit Report - Doctor.mx

## Executive Summary

| Category | Issues Found | Priority |
|----------|--------------|----------|
| Doctor Onboarding | 4 critical | 🔴 P0 |
| Patient Onboarding | 3 issues | 🟡 P1 |
| Empty States | 8 generic placeholders | 🟡 P1 |
| Mobile UX | 3 critical | 🔴 P0 |
| Trust Signals | 2 missing | 🟡 P1 |

---

## 1. Doctor Onboarding: The "Limbo State" Problem 🔴

### Current State (Screenshot Analysis)
When doctors are in "En revisión" status:
- **8 menu items are locked** (Analytics, Farmacia, Seguimientos, Suscripción, Precios, Finanzas, Consultas, Disponibilidad)
- Only "Inicio" and "Mi perfil" are accessible
- Generic message: "24-48 horas hábiles"
- No queue position visibility
- Limited "Mientras tanto" activities

### Issues Identified

| Issue | Impact | Location |
|-------|--------|----------|
| Cognitive overload | High - 8 lock icons create frustration | `DoctorLayout.tsx:17-28` |
| No queue transparency | High - doctors don't know position in line | `DoctorOnboarding.tsx` |
| Limited idle productivity | Medium - can only edit profile | `Doctor.tsx:160-224` |
| "En revisión" badge unclear | Medium - no explanation of process | `DoctorLayout.tsx:103-106` |

### Recommended Fixes
1. **Show queue position**: "Eres #12 de 45 médicos en verificación"
2. **Expand "Mientras tanto" checklist**:
   - ✅ Perfil completado
   - ✅ Disponibilidad configurada  
   - ⏳ Verificación pendiente
   - 📋 Prueba tu cámara/micrófono
   - 📋 Lee guía de primer consulta
3. **Remove locked items from nav** - only show available features + "Próximamente" teaser
4. **Add estimated time**: "Aproximadamente 36 horas restantes"

---

## 2. Patient Onboarding Issues 🟡

### Current Flow Analysis
```
Landing → Click "Consultar AHORA" → /ai-consulta → Can use immediately ✅
                     ↓
            Click "Empezar GRATIS" → /auth/register → 3-step form
```

### Issues Identified

| Issue | Current State | Recommended Fix |
|-------|---------------|-----------------|
| COFEPRIS badge visibility | Not visible in first 10 seconds | Add to announcement bar or hero |
| Phone field | Marked "opcional" but needed for WhatsApp | Add tooltip: "Recomendado para notificaciones" |
| Terms acceptance | No TL;DR summary | Add bullet points of key terms |
| Password strength | Technical labels (Débil/Media/Fuerte) | Add requirements checklist |

---

## 3. Empty State Inventory 🔴

### Current Generic Placeholders Found

| Location | Current Text | Required Fix |
|----------|--------------|--------------|
| `admin/analytics` | "No hay datos disponibles aún" | Add "Los datos aparecerán cuando haya actividad" |
| `patient/dashboard` | "No tienes consultas" + "Buscar doctor" | Celebrate first visit + AI consult CTA |
| `doctor/appointments` | "No hay citas programadas" | "Tu primera cita está por llegar - comparte tu perfil" |
| `chat/messages` | "No hay mensajes" | "Los mensajes aparecerán cuando un paciente te contacte" |

### Required Empty States (Missing)

| State | Required Copy |
|-------|---------------|
| Zero doctors online | "3 médicos regresan a las 8 PM. ¿Chat con Dr. Simeon mientras tanto?" |
| AI low confidence | "Dr. Simeon está aprendiendo esto. Te conecto con un doctor humano..." |
| Prescription pending | "Generando receta... Validando con COFEPRIS" (progress bar) |
| Payment failed | Retry with OXXO/Spei alternatives |
| Rural connectivity | SMS fallback: "Envía SÍNTOMAS al 55-XX-XXX" |
| Search no results | "Ningún doctor con esa especialidad ahora. Especialistas similares:..." |
| First video call | Pre-call tech check + "Prueba tu cámara" button |
| Consultation ended | Summary + pharmacy map + "¿Necesitas seguimiento?" |

---

## 4. Mobile-First Issues 🔴 CRITICAL

### Issue: Patient Mobile Navigation Completely Missing

**Location**: `PatientLayout.tsx:117`
```tsx
<aside className="hidden lg:flex flex-col w-64...">
```

**Impact**: 70%+ of Mexican users on mobile cannot navigate the patient portal

**Fix Required**: Add mobile hamburger menu (similar to DoctorLayout)

### Other Mobile Issues

| Issue | Location | Impact |
|-------|----------|--------|
| No thumb zone optimization | Landing CTA | Hard to reach top-center buttons |
| Touch targets < 44px | Various | Hard to tap for motor-impaired |
| No 2G fallback | Video calls | Crashes on poor connectivity |
| No "Modo ahorro de datos" | Settings | Excludes rural users |

---

## 5. Trust & Safety Visuals 🟡

### Missing Trust Signals

| Signal | Current State | Required |
|--------|---------------|----------|
| COFEPRIS compliance | Not visible in hero | Add badge within 3 seconds |
| Doctor cédula verification | Badge shows but not clickable | Link to SEP verification |
| AI disclosure | Small text at bottom | Prominent "Asistente IA - No es doctor" |
| Secure connection | No padlock during prescription | Add lock icon + "Conexión segura" |

---

## 6. Quick Fixes (Week 1)

### Priority 0 (Deploy Today)
- [ ] Fix PatientLayout mobile navigation
- [ ] Add queue position to doctor pending state
- [ ] Replace "En revisión" with progress checklist

### Priority 1 (This Week)
- [ ] Update 8 empty states with contextual copy
- [ ] Add COFEPRIS badge to landing
- [ ] Fix mobile CTA thumb zone placement
- [ ] Add AI disclosure banner

### Priority 2 (Next Week)
- [ ] Implement SMS fallback for rural areas
- [ ] Add data saver mode toggle
- [ ] Add pre-call tech check

---

## Appendix: Nielsen Heuristic Violations

| Heuristic | Violation | Location |
|-----------|-----------|----------|
| Visibility of system status | AI confidence not shown | `/app/ai-consulta` |
| Match system/real world | Medical jargon without explanation | Specialties page |
| User control | No "Cancelar consulta" during wait | Video call page |
| Consistency | Different nav patterns patient/doctor | Layouts |
| Error prevention | Can book wrong specialty | Search flow |
| Recognition vs recall | Must re-enter symptoms | AI consulta |
