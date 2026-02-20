# FASE 2: SECURITY & COMPLIANCE LOCKDOWN
## Ejecución Inmediata - 2026-02-20

### Objetivo: Security 75→90, Compliance 67→85
### Timeline: 2 semanas
### Prioridad: P0 Crítico (bloqueantes de producción)

---

## TAREAS P0 (Ejecución Paralela)

### TAREA 2.1: Fix Unauthenticated PDF Export 🔴
**File:** `src/app/api/export/pdf/route.ts`
**Issue:** No authentication required
**Fix:** Add requireAuth() check
**ETA:** 2 horas
**Subagente:** SECURITY_AGENT_1

### TAREA 2.2: Fix Unauthenticated Pharmacy Webhook 🔴
**File:** `src/app/api/pharmacy/webhook/route.ts`
**Issue:** No signature verification
**Fix:** Implement HMAC verification
**ETA:** 4 horas
**Subagente:** SECURITY_AGENT_2

### TAREA 2.3: Remove Exposed OpenAI API Key ✅
**Status:** COMPLETADO
**Location:** Environment variables (.env.example, README.md)
**Issue:** NEXT_PUBLIC_OPENAI_API_KEY was documented but not actually used in code
**Fix:** Removed all references to NEXT_PUBLIC_OPENAI_API_KEY, confirmed code only uses server-side OPENAI_API_KEY
**Date:** 2026-02-20

### TAREA 2.4: Granular Cookie Consent ⚖️
**Files:** 
- `src/components/CookieConsent.tsx`
- New: `src/app/cookies/page.tsx`
**Issue:** Binary consent only
**Fix:** Implement 4 categories
**ETA:** 8 horas
**Subagente:** COMPLIANCE_AGENT_1

### TAREA 2.5: GDPR Right to Restriction ⚖️
**Files:**
- `src/lib/arco/`
- `src/app/api/arco/`
**Issue:** Article 18 not implemented
**Fix:** Add restriction endpoint
**ETA:** 6 horas
**Subagente:** COMPLIANCE_AGENT_2

---

## SISTEMA DE VERIFICACIÓN

### Por cada tarea:
1. **NIVEL 1 (ALPHA):** Implementación + auto-test
2. **NIVEL 2 (BETA):** Code review por 2do agente
3. **NIVEL 3 (GAMMA):** Security audit independiente
4. **NIVEL 4 (DELTA):** Test de penetración manual
5. **NIVEL 5 (EPSILON):** Documentación + rollback test

### Métricas de éxito:
- [ ] Security vulnerabilities: 0
- [ ] Compliance gaps: 0
- [ ] Test coverage: >80%
- [ ] Documentation: 100%

---

## RIESGOS

| Riesgo | Mitigación |
|--------|------------|
| Breaking changes | Feature flags |
| Test failures | Pre-commit hooks |
| Regresión | Rollback plan |

---

**Inicio:** 2026-02-20  
**Fin estimado:** 2026-03-06  
**Status:** 🚀 IN PROGRESS
