# 🏛️ MASTER QUALITY SYSTEM (MQS) v1.0
## Sistema de Producción de Calidad Garantizada para Doctor.mx

**Versión:** 1.0  
**Fecha:** 2026-02-20  
**Meta:** 90+/100 en todas las dimensiones  
**Filosofía:** Calidad > Compleción > Esfuerzo > Velocidad  

---

## 📜 MANIFIESTO DE CALIDAD

Este sistema está diseñado para que **cualquier persona** sin conocimiento previo del proyecto pueda ejecutarlo y llegar al mismo resultado: **código de calidad excepcional, medible y verificable**.

### Principios Inquebrantables

1. **"DONE" significa:**
   - ✅ Pasa TODAS las verificaciones automáticas
   - ✅ Revisado por 2+ subagentes independientes
   - ✅ Documentado exhaustivamente
   - ✅ Sin deuda técnica introducida
   - ✅ Métricas mejoradas o mantenidas (nunca degradadas)

2. **"NO AVANZAMOS" hasta que:**
   - Todas las verificaciones de la fase actual pasen al 100%
   - El quality score de la dimensión trabajada suba
   - No haya errores, warnings, ni inconsistencias

3. **Reversibilidad:**
   - Todo cambio debe ser reversible en <5 minutos
   - Commits atómicos con descripción completa
   - Backups automáticos antes de cambios grandes

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### 1. ESTRUCTURA DE SUBAGENTES

```
MASTER_COORDINATOR (Tú)
    ├── Subagentes de FASE (8 equipos)
    │   ├── PHASE_1_INFRASTRUCTURE_TEAM
    │   ├── PHASE_2_SECURITY_TEAM
    │   ├── PHASE_3_STABILITY_TEAM
    │   ├── PHASE_4_ARCHITECTURE_TEAM
    │   ├── PHASE_5_QUALITY_TEAM
    │   ├── PHASE_6_I18N_TEAM
    │   ├── PHASE_7_OPTIMIZATION_TEAM
    │   └── PHASE_8_VALIDATION_TEAM
    │
    ├── Subagentes de VERIFICACIÓN (4 equipos)
    │   ├── AUTO_VERIFICATION_AGENT
    │   ├── CROSS_REVIEW_AGENT_1
    │   ├── CROSS_REVIEW_AGENT_2
    │   └── METRICS_VALIDATION_AGENT
    │
    └── Subagentes de DOCUMENTACIÓN (2 equipos)
        ├── TECHNICAL_WRITER_AGENT
        └── KNOWLEDGE_BASE_AGENT
```

### 2. PROTOCOLO DE COMUNICACIÓN

```yaml
Comunicación_Obligatoria:
  - Cada subagente reporta a MASTER_COORDINATOR
  - Subagentes de misma fase NO se comunican directamente
  - Verificadores son independientes de implementadores
  - Documentadores verifican comprensión con implementadores

Formato_de_Reporte:
  Status: [IN_PROGRESS | COMPLETED | BLOCKED | FAILED]
  Tarea_ID: "PHASE-X-TASK-NN"
  Evidencia: [Links a commits, tests, screenshots]
  Métricas: {before: X, after: Y}
  Bloqueos: [Lista de impedimentos]
  Riesgos: [Potenciales problemas]
```

---

## 🎯 FASES DEL SISTEMA (8 Fases Secuenciales)

### FASE 1: INFRAESTRUCTURA DE CALIDAD (Semanas 1-3)
**Objetivo:** Sistema que IMPIDE código de baja calidad

#### 1.1 Setup de Quality Gates (Día 1-3)

**Subagente:** PHASE_1_INFRASTRUCTURE_TEAM  
**Verificadores:** AUTO_VERIFICATION_AGENT + METRICS_VALIDATION_AGENT

**Tareas:**

```markdown
TASK 1.1.1: Implementar Husky + lint-staged
├── Implementar:
│   ├── pre-commit: ESLint --fix + Prettier
│   ├── pre-commit: TypeScript strict check
│   ├── pre-commit: i18n string detection
│   └── commit-msg: Conventional commits enforcement
├── Verificación:
│   ├── TEST: Commit con error de lint → Debe bloquearse
│   ├── TEST: Commit con string hardcodeado → Debe bloquearse
│   └── TEST: Commit con error TypeScript → Debe bloquearse
└── Documentación:
    ├── docs/QUALITY_GATES.md
    └── .husky/README.md
```

```markdown
TASK 1.1.2: Configurar CI/CD Quality Gates
├── Implementar en .github/workflows/:
│   ├── quality-gates.yml:
│   │   ├── TypeScript: 0 errores strict
│   │   ├── ESLint: 0 errores, 0 warnings
│   │   ├── Tests: >80% cobertura de archivos modificados
│   │   ├── i18n: 0 strings hardcodeados nuevos
│   │   ├── Security: npm audit (0 moderate/high/critical)
│   │   ├── Build: Sin warnings
│   │   └── Bundle: Sin incremento >10KB sin justificación
│   └── auto-reject si cualquier gate falla
├── Verificación:
│   ├── PR #1: Con error TypeScript → Debe rechazarse
│   ├── PR #2: Con coverage <80% → Debe rechazarse
│   └── PR #3: Con string hardcodeado → Debe rechazarse
└── Documentación:
    ├── docs/CI_CD_QUALITY_GATES.md
    └── .github/workflows/README.md
```

```markdown
TASK 1.1.3: Setup de Métricas Automáticas
├── Implementar:
│   ├── Script npm run quality:report
│   ├── Generación de QUALITY_SCORE.md automático
│   ├── Comparación antes/después en cada PR
│   └── Block de merge si score baja
├── Verificación:
│   ├── Cambio que baja score → Bloqueado
│   ├── Cambio que mantiene score → Permitido
│   └── Cambio que sube score → Aprobado rápido
└── Documentación:
    └── docs/QUALITY_METRICS.md
```

#### 1.2 TypeScript Strict Compliance (Día 4-7)

```markdown
TASK 1.2.1: Eliminar TODOS los `any` implícitos
├── Subagentes: 4 en paralelo
│   ├── AGENT_1: src/app/api/**/*.ts
│   ├── AGENT_2: src/components/**/*.tsx
│   ├── AGENT_3: src/lib/**/*.ts
│   └── AGENT_4: src/app/**/page.tsx
├── Proceso por archivo:
│   1. Identificar cada `any`
│   2. Determinar tipo correcto
│   3. Si no existe tipo, crearlo
│   4. Aplicar cambio
│   5. Verificar: tsc --noEmit pasa
├── Verificación:
│   ├── grep -r "any" src/ --include="*.ts" | wc -l → Debe dar 0
│   ├── npm run type-check → Debe pasar
│   └── npm run build → Debe pasar
└── Documentación:
    └── docs/typescript/STRICT_COMPLIANCE.md
```

```markdown
TASK 1.2.2: Generar Tipos Completos de Supabase
├── Implementar:
│   ├── supabase gen types --lang=typescript
│   ├── Tipos para TODAS las tablas
│   ├── Tipos para TODAS las funciones RPC
│   ├── Tipos para TODAS las vistas
│   └── Relationships tipadas
├── Verificación:
│   ├── Todas las queries de Supabase tipadas
│   ├── Autocompletado funciona en IDE
│   └── 0 errores de tipo en queries
└── Documentación:
    └── src/lib/database.types.ts (comentado)
```

```markdown
TASK 1.2.3: Agregar Return Types a TODAS las funciones exportadas
├── Subagentes: 4 en paralelo
│   ├── Cada uno toma un directorio src/*/
├── Proceso:
│   1. Encontrar función exportada sin return type
│   2. Inferir tipo de retorno del cuerpo
│   3. Agregar anotación explícita
│   4. Verificar que sea el tipo más específico posible
│   5. Si hay uniones, usar tipos discriminados
├── Verificación:
│   ├── eslint @typescript-eslint/explicit-function-return-type → 0 errores
│   └── TODAS las funciones exportadas tienen :Type
└── Documentación:
    └── docs/typescript/FUNCTION_TYPING.md
```

#### 1.3 Testing Infrastructure (Día 8-12)

```markdown
TASK 1.3.1: Crear Mock Factories Estandarizadas
├── Implementar en src/lib/__tests__/factories/:
│   ├── user.factory.ts (patient, doctor, admin)
│   ├── appointment.factory.ts
│   ├── prescription.factory.ts
│   ├── conversation.factory.ts
│   └── message.factory.ts
├── Cada factory debe tener:
│   ├── create(): Entity básico
│   ├── createOverridden(overrides): Con modificaciones
│   ├── createList(n): Array de n entidades
│   └── realistic(): Datos que parecen reales
├── Verificación:
│   ├── Cada factory genera datos válidos
│   ├── Tests usan factories, no objetos inline
│   └── Factories pasan validación de esquema
└── Documentación:
    └── src/lib/__tests__/factories/README.md
```

```markdown
TASK 1.3.2: Crear Test Utilities Compartidas
├── Implementar en src/lib/__tests__/utils/:
│   ├── render.tsx (wrapper con providers)
│   ├── api-test.utils.ts (helpers para API tests)
│   ├── db-mock.utils.ts (mock de Supabase)
│   ├── i18n-test.utils.ts (mock de traducciones)
│   └── auth-test.utils.ts (mock de auth)
├── Cada utilidad debe:
│   ├── Tener TypeScript types completos
│   ├── Estar documentada con JSDoc
│   ├── Tener tests propios
│   └── Ser reutilizable
├── Verificación:
│   ├── 0 duplicación de setup en tests
│   └── Todos los tests usan utils
└── Documentación:
    └── src/lib/__tests__/utils/README.md
```

```markdown
TASK 1.3.3: Crear Templates de Tests
├── Templates en src/lib/__tests__/templates/:
│   ├── component.test.template.tsx
│   ├── api-route.test.template.ts
│   ├── hook.test.template.ts
│   └── utility.test.template.ts
├── Cada template incluye:
│   ├── Estructura estándar (describe/it/expect)
│   ├── Imports necesarios
│   ├── Setup común
│   ├── Ejemplos de casos básicos
│   ├── Ejemplos de casos edge
│   └── Ejemplos de mocks
├── Verificación:
│   └── Nuevos tests siguen templates
└── Documentación:
    └── docs/testing/TEST_TEMPLATES.md
```

#### 1.4 i18n Infrastructure (Día 13-18)

```markdown
TASK 1.4.1: ESLint Rule - Prohibir Strings Hardcodeados
├── Implementar:
│   ├── Custom ESLint plugin
│   ├── Rule: no-hardcoded-spanish
│   ├── Detección de strings en JSX
│   ├── Whitelist para casos permitidos
│   └── Auto-fix sugerido
├── Verificación:
│   ├── Código con string hardcodeado → Error ESLint
│   ├── String en whitelist → Permitido
│   └── npm run lint → 0 errores de i18n
└── Documentación:
    └── docs/i18n/ESLINT_RULE.md
```

```markdown
TASK 1.4.2: Script de Extracción Automática de Strings
├── Implementar:
│   ├── npm run i18n:extract
│   ├── Scanner de archivos .tsx/.ts
│   ├── Detección de strings no traducidos
│   ├── Generación de keys sugeridas
│   ├── Inserción automática de t()
│   └── Reporte de progreso
├── Verificación:
│   ├── Script encuentra strings hardcodeados
│   ├── Sugiere keys apropiadas
│   └── No modifica archivos sin confirmación
└── Documentación:
    └── docs/i18n/EXTRACTION_SCRIPT.md
```

```markdown
TASK 1.4.3: Sistema de Reporte de i18n Coverage
├── Implementar:
│   ├── npm run i18n:coverage
│   ├── Conteo de strings total/hardcodeados/traducidos
│   ├── Porcentaje por archivo
│   ├── Porcentaje por directorio
│   ├── Trend (subió/bajó vs main)
│   └── Block si coverage <100%
├── Verificación:
│   ├── Reporte generado en cada PR
│   ├── Block si hay strings sin traducir
│   └── Métrica visible en dashboard
└── Documentación:
    └── docs/i18n/COVERAGE_REPORTING.md
```

#### 1.5 Verificación de Fase 1 (Día 19-21)

**Equipo:** PHASE_1_INFRASTRUCTURE_TEAM + CROSS_REVIEW_AGENT_1 + CROSS_REVIEW_AGENT_2

```markdown
VERIFICACIÓN 1.5.1: Checklist de Infraestructura
├── Cada ítem verificado por 2 agentes independientes:
│   ├── [ ] Pre-commit hooks funcionan
│   ├── [ ] CI quality gates rechazan PRs malos
│   ├── [ ] TypeScript strict: 0 errores
│   ├── [ ] ESLint: 0 errores, 0 warnings
│   ├── [ ] Mock factories creadas y funcionando
│   ├── [ ] Test utilities documentadas
│   ├── [ ] ESLint i18n rule activa
│   ├── [ ] Script de extracción funciona
│   └── [ ] Reporte de métricas generado
├── Si cualquier ítem falla:
│   ├── NO avanzar a Fase 2
│   ├── Corregir ítems fallidos
│   └── Re-verificar
└── Documentación:
    └── PHASE_1_COMPLETION_REPORT.md
```

```markdown
VERIFICACIÓN 1.5.2: Métricas de Línea Base
├── Capturar métricas iniciales:
│   ├── TypeScript errors: _
│   ├── ESLint errors: _
│   ├── Test coverage: _%
│   ├── i18n coverage: _%
│   ├── Security vulns: _
│   └── Build time: _s
├── Guardar en QUALITY_BASELINE.md
├── Setup de tracking semanal
└── Dashboard visible para todo el equipo
```

---

### FASE 2: SECURITY & COMPLIANCE LOCKDOWN (Semanas 4-5)
**Objetivo:** Sistema seguro y legalmente compliant

#### 2.1 Security Critical Fixes

```markdown
TASK 2.1.1: Fix - Unauthenticated PDF Export
├── PROBLEMA: src/app/api/export/pdf/route.ts sin auth
├── SOLUCIÓN:
│   ├── Agregar requireAuth() al inicio
│   ├── Verificar permisos del usuario
│   ├── Log de acceso a exportación
│   └── Rate limiting específico
├── TESTS:
│   ├── Sin auth → 401
│   ├── Auth sin permiso → 403
│   ├── Auth con permiso → 200 + PDF
│   └── Rate limit excedido → 429
├── Verificación:
│   ├── Security audit pasa
│   ├── Penetration test manual
│   └── Logs muestran accesos
└── Documentación:
    └── docs/security/PDF_EXPORT_FIX.md
```

```markdown
TASK 2.1.2: Fix - Unauthenticated Pharmacy Webhook
├── PROBLEMA: src/app/api/pharmacy/webhook/route.ts sin verificación
├── SOLUCIÓN:
│   ├── Implementar HMAC signature verification
│   ├── Validar timestamp (prevent replay)
│   ├── IP allowlist para pharmacy
│   └── Idempotency check
├── TESTS:
│   ├── Sin signature → 401
│   ├── Signature inválida → 401
│   ├── Timestamp viejo → 401
│   ├── IP no permitida → 403
│   ├── Request duplicado → 200 (idempotent)
│   └── Request válido → 200 + procesado
├── Verificación:
│   ├── Webhook security test pasa
│   └── HMAC verification funciona
└── Documentación:
    └── docs/security/WEBHOOK_VERIFICATION.md
```

#### 2.2 Compliance Legal

```markdown
TASK 2.2.1: Implementar Granular Cookie Consent
├── PROBLEMA: Consentimiento binario (ilegal GDPR/LFPDPPP)
├── SOLUCIÓN:
│   ├── Banner con categorías:
│   │   ├── Esencial (siempre activo)
│   │   ├── Funcional (toggle)
│   │   ├── Analítica (toggle)
│   │   └── Marketing (toggle)
│   ├── Guardar preferencias
│   ├── Aplicar preferencias (cargar solo lo aceptado)
│   └── Withdraw consent opción
├── TESTS:
│   ├── Banner aparece para nuevos usuarios
│   ├── Preferencias se guardan
│   ├── Solo scripts aceptados cargan
│   ├── Withdraw limpia cookies
│   └── Reject all funciona
├── Verificación Legal:
│   ├── Review con abogado de privacidad
│   └── Cumple GDPR Art. 7
└── Documentación:
    └── docs/compliance/COOKIE_CONSENT.md
```

---

[Continuará con Fases 3-8...]

## 📋 SISTEMA DE VERIFICACIÓN CRUZADA

### Protocolo de Triple Verificación

```yaml
Cada_tarea_completa_requiere:
  1. Implementación:
     - Por: Subagente de Fase
     - Output: Código + Tests + Docs
  
  2. Verificación Automática:
     - Por: AUTO_VERIFICATION_AGENT
     - Check: Scripts automáticos (tests, lint, type-check)
     - Output: Reporte PASS/FAIL con métricas
  
  3. Verificación Cruzada #1:
     - Por: CROSS_REVIEW_AGENT_1
     - Check: Código (calidad, patrones, mejores prácticas)
     - Output: Review checklist firmada
  
  4. Verificación Cruzada #2:
     - Por: CROSS_REVIEW_AGENT_2
     - Check: Tests (cobertura, casos edge, calidad)
     - Output: Test review checklist firmada
  
  5. Validación de Métricas:
     - Por: METRICS_VALIDATION_AGENT
     - Check: Score mejoró, no hay regresiones
     - Output: Métricas antes/después
  
  6. Documentación:
     - Por: TECHNICAL_WRITER_AGENT
     - Check: Docs completas y claras
     - Output: Documentación aprobada

Aprobación_Final:
  - Solo si TODOS los checks son PASS
  - Firma digital de MASTER_COORDINATOR
  - Commit a rama de fase
```

### Checklist de Verificación por Dimensión

```markdown
## SECURITY VERIFICATION CHECKLIST
- [ ] 0 vulnerabilidades npm audit (critical/high/moderate)
- [ ] Todos los endpoints autenticados (excepto públicos documentados)
- [ ] CSRF tokens en todas las mutaciones
- [ ] Rate limiting implementado
- [ ] Input validation en todas las entradas
- [ ] Output encoding para prevenir XSS
- [ ] Security headers configurados
- [ ] Secrets no expuestos en cliente
- [ ] Logs no contienen PII
- [ ] Penetration test manual pasó
```

```markdown
## TESTING VERIFICATION CHECKLIST
- [ ] Cobertura global >80%
- [ ] Cobertura por archivo >60%
- [ ] 0 tests skipped
- [ ] 0 tests flaky
- [ ] Tests de integración para workflows críticos
- [ ] Tests E2E para user journeys principales
- [ ] Mock factories usadas (no mocks inline)
- [ ] Tests documentan comportamiento esperado
- [ ] CI ejecuta tests en <10 minutos
```

```markdown
## I18N VERIFICATION CHECKLIST
- [ ] 0 strings hardcodeados en español
- [ ] 100% keys tienen traducción ES
- [ ] 100% keys tienen traducción EN
- [ ] Nuevos strings usan t() automáticamente
- [ ] Fechas/horas localizadas
- [ ] Números/monedas localizados
- [ ] RTL support (si aplica)
- [ ] hreflang tags presentes
- [ ] Metadata i18n completo
```

---

## 📊 SISTEMA DE MÉTRICAS Y ACCOUNTABILITY

### Dashboard Semanal Automático

```markdown
# QUALITY_DASHBOARD_WEEK_N.md

## Métricas Globales
- Score Global: _/100 (Target: 85+, Trend: ↑/↓/=)
- Vulnerabilidades: _ (Target: 0)
- Cobertura Tests: _% (Target: >80%)
- i18n Coverage: _% (Target: 100%)

## Por Dimensión
| Dimensión | Score | Trend | Blockers |
|-----------|-------|-------|----------|
| Security | _/100 | ↑ | None |
| Testing | _/100 | ↓ | 3 archivos sin tests |
| ... | ... | ... | ... |

## Issues Resueltos Esta Semana
- [ ] Issue #1 (verificado por X, Y)
- [ ] Issue #2 (verificado por X, Y)

## Issues Introducidos (DEBE SER 0)
- [ ] None ✓

## Decisiones de Calidad
- Feature X pospuesta hasta que pase quality gates
- Refactoring Y aprobado (métricas mejoraron)

## Plan Semana N+1
1. [ ] Tarea A (owner: Subagente X)
2. [ ] Tarea B (owner: Subagente Y)

Firmado: MASTER_COORDINATOR
Fecha: _
```

### Sistema de Bloqueos

```yaml
Condiciones_de_Bloqueo:
  - Score global baja → Bloqueo inmediato, revertir cambios
  - Nuevas vulnerabilidades → Bloqueo hasta fix
  - Cobertura baja → Bloqueo hasta tests agregados
  - Strings hardcodeados → Bloqueo hasta i18n
  - Tests flaky → Bloqueo hasta estabilizar

Procedimiento_de_Desbloqueo:
  1. Identificar causa raíz
  2. Crear plan de corrección
  3. Ejecutar corrección con verificación doble
  4. Verificar métricas recuperadas
  5. Aprobación de MASTER_COORDINATOR para continuar
```

---

## 🎓 DOCUMENTACIÓN REQUERIDA

### Por Cada Fase

```markdown
FASE_X_COMPLETION_REPORT.md
├── Resumen Ejecutivo
│   ├── Objetivos cumplidos
│   ├── Métricas antes/después
│   └── Issues conocidos (si aplica)
├── Tareas Completadas
│   ├── Cada tarea con:
│   │   - Descripción
│   │   - Implementador
│   │   - Verificadores
│   │   - Evidencia (commits, tests)
│   │   - Métricas impactadas
│   └── Checklist de verificación firmada
├── Lecciones Aprendidas
│   ├── Qué funcionó bien
│   ├── Qué se podría mejorar
│   └── Ajustes para siguientes fases
├── Artefactos Generados
│   ├── Código
│   ├── Tests
│   ├── Documentación
│   └── Configuración
└── Aprobación
    ├── Firma MASTER_COORDINATOR
    ├── Firma verificador #1
    └── Firma verificador #2
```

### Documentación Técnica

```markdown
Por cada componente/sistema modificado:
- README.md con:
  - Propósito
  - API/Interface
  - Ejemplos de uso
  - Dependencias
  - Tests
  - Decisiones de diseño
```

---

## 🚀 PROTOCOLO DE EJECUCIÓN INICIAL

### Día 0: Setup del Sistema

```bash
# 1. Crear estructura de documentos
mkdir -p docs/{quality,security,compliance,testing,i18n,typescript}
mkdir -p .github/workflows
mkdir -p src/lib/__tests__/{factories,utils,templates}

# 2. Inicializar tracking
echo "# QUALITY_TRACKING" > QUALITY_DASHBOARD.md
echo "# BASELINE" > QUALITY_BASELINE.md

# 3. Setup git hooks
npx husky-init && npm install

# 4. Configurar CI
# (Copiar .github/workflows/quality-gates.yml)

# 5. Verificar setup
npm run quality:check
```

### Semana 1: Kickoff

```markdown
Día 1: 
- [ ] Reunión de kickoff con todos los subagentes
- [ ] Asignación de tareas específicas
- [ ] Setup de herramientas de comunicación
- [ ] Primer quality report de baseline

Día 2-5:
- [ ] Fase 1 tareas en paralelo
- [ ] Daily check-ins
- [ ] Blockers escalados inmediatamente

Fin de semana:
- [ ] Reporte semanal #1
- [ ] Verificación de Fase 1
- [ ] Decisión: ¿Listos para Fase 2?
```

---

## ✅ CRITERIOS DE ÉXITO FINAL

El proyecto se considera **COMPLETO** cuando:

```yaml
Métricas_Obligatorias:
  - Score Global: >= 85/100
  - Security: >= 90/100 (0 vulns)
  - Testing: >= 85/100 (>80% coverage)
  - TypeScript: >= 90/100 (0 errores strict)
  - i18n: >= 95/100 (100% strings traducidos)
  - Performance: >= 85/100
  - A11Y: >= 90/100
  - Documentation: >= 90/100
  - Architecture: >= 80/100
  - Database: >= 80/100
  - API Design: >= 85/100
  - State Management: >= 80/100
  - UI Components: >= 85/100
  - Error Handling: >= 85/100
  - Caching: >= 80/100
  - Dependencies: >= 85/100 (0 vulns)
  - Compliance: >= 85/100
  - DevOps: >= 80/100
  - Observability: >= 80/100
  - Mobile/PWA: >= 85/100
  - SEO: >= 85/100

Calidad_Proceso:
  - 0 issues introducidos en últimas 4 semanas
  - Todos los quality gates pasan
  - Documentación completa
  - Sistema reversible en <5 min

Aprobación:
  - Firma MASTER_COORDINATOR
  - Firma 2 verificadores independientes
  - Review de stakeholders
  - Sign-off de seguridad
  - Sign-off de compliance legal
```

---

## 📞 PROTOCOLO DE ESCALAMIENTO

```yaml
Problemas_Técnicos:
  Level 1: Subagente no puede resolver en 4 horas
    → Escalar a MASTER_COORDINATOR
  
  Level 2: MASTER_COORDINATOR no puede resolver en 8 horas
    → Escalar a arquitecto senior (externo si es necesario)
    → Documentar decisión y rationale

Conflictos_Entre_Subagentes:
  → MASTER_COORDINATOR actúa como árbitro
  → Decisión basada en: Calidad > Compleción > Esfuerzo
  → Documentar decisión

Cambios_de_Alcance:
  → Requieren aprobación escrita de stakeholders
  → Re-evaluación de timeline
  → Documentar trade-offs
```

---

**FIN DEL MASTER QUALITY SYSTEM v1.0**

*Este documento es la fuente de verdad. Cualquier desviación debe ser documentada y aprobada.*
