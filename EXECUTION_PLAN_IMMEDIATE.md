# 🚀 PLAN DE EJECUCIÓN INMEDIATA
## Fase 1: Infraestructura de Calidad (Semanas 1-3)

**Fecha Inicio:** 2026-02-20  
**Objetivo:** Sistema que IMPIDE código de baja calidad  
**Meta de Salida:** TypeScript 90/100, DevOps 80/100, Testing Infra 75/100  

---

## 📋 DÍA 0 (Hoy) - SETUP INICIAL

### Tarea 0.1: Crear Estructura de Directorios
```bash
mkdir -p docs/{quality,security,compliance,testing,i18n,typescript,architecture}
mkdir -p src/lib/__tests__/{factories,utils,templates}
mkdir -p .github/workflows
mkdir -p scripts/quality
```

### Tarea 0.2: Inicializar Sistema de Tracking
```bash
# Crear archivos de tracking
touch QUALITY_BASELINE.md
touch QUALITY_DASHBOARD.md
touch PHASE_1_TRACKING.md
```

### Tarea 0.3: Instalar Dependencias de Calidad
```bash
npm install --save-dev husky lint-staged @commitlint/config-conventional @commitlint/cli
npx husky-init
```

---

## 📋 SEMANA 1 - QUALITY GATES

### DÍA 1-2: Pre-commit Hooks

**Subagente:** INFRA_AGENT_1  
**Verificador:** AUTO_VERIFY_AGENT

```markdown
## Implementar .husky/pre-commit

#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# 1. ESLint + Prettier on staged files
echo "  → Linting staged files..."
npx lint-staged || exit 1

# 2. TypeScript strict check
echo "  → Type checking..."
npm run type-check || exit 1

# 3. i18n hardcoded string check
echo "  → Checking for hardcoded strings..."
npm run i18n:check || exit 1

# 4. Test changed files
echo "  → Running tests on changed files..."
npm run test:changed || exit 1

echo "✅ Pre-commit checks passed!"
```

```markdown
## Implementar .lintstagedrc.json

{
  "*.{ts,tsx}": [
    "eslint --fix --max-warnings=0",
    "prettier --write"
  ],
  "*.{json,md}": [
    "prettier --write"
  ]
}
```

**Verificación:**
- [ ] Commit con error de lint → Bloqueado
- [ ] Commit con string hardcodeado → Bloqueado  
- [ ] Commit válido → Permitido

---

### DÍA 3-4: CI/CD Quality Gates

**Subagente:** INFRA_AGENT_2  
**Verificador:** AUTO_VERIFY_AGENT

```markdown
## Crear .github/workflows/quality-gates.yml

name: Quality Gates

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: TypeScript Strict Check
        run: npm run type-check
      
      - name: ESLint
        run: npm run lint
      
      - name: Test Coverage
        run: npm run test:coverage
      
      - name: Check Coverage Threshold
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 80% threshold"
            exit 1
          fi
      
      - name: Security Audit
        run: npm audit --audit-level=moderate
      
      - name: Build
        run: npm run build
      
      - name: Generate Quality Report
        run: npm run quality:report
      
      - name: Comment PR
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('quality-report.md', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: report
            });
```

**Verificación:**
- [ ] PR con error TypeScript → Rechazado
- [ ] PR con coverage <80% → Rechazado
- [ ] PR con vulnerabilidad → Rechazado

---

### DÍA 5: Sistema de Métricas

**Subagente:** INFRA_AGENT_3  
**Verificador:** METRICS_AGENT

```markdown
## Crear scripts/quality/generate-report.js

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function generateQualityReport() {
  const report = {
    timestamp: new Date().toISOString(),
    metrics: {}
  };

  // TypeScript errors
  report.metrics.typescript = await getTypeScriptErrors();
  
  // ESLint errors
  report.metrics.eslint = await getESLintErrors();
  
  // Test coverage
  report.metrics.coverage = await getTestCoverage();
  
  // i18n coverage
  report.metrics.i18n = await getI18nCoverage();
  
  // Security vulnerabilities
  report.metrics.security = await getSecurityVulns();
  
  // Calculate overall score
  report.overallScore = calculateOverallScore(report.metrics);
  
  // Generate markdown report
  const mdReport = generateMarkdownReport(report);
  fs.writeFileSync('quality-report.md', mdReport);
  
  // Update dashboard
  updateDashboard(report);
  
  console.log(`Quality Score: ${report.overallScore}/100`);
  
  // Exit with error if score < threshold
  if (report.overallScore < 75) {
    console.error('Quality score below threshold!');
    process.exit(1);
  }
}

generateQualityReport();
```

**Verificación:**
- [ ] Script genera reporte correctamente
- [ ] CI usa reporte para bloquear/desbloquear
- [ ] Dashboard se actualiza automáticamente

---

## 📋 SEMANA 2 - TYPESCRIPT STRICT

### DÍA 6-8: Eliminar `any` implícitos

**Subagentes:** TS_AGENT_1, TS_AGENT_2, TS_AGENT_3, TS_AGENT_4 (en paralelo)

```markdown
## División de trabajo:

TS_AGENT_1: src/app/api/**/*.ts (40 archivos)
TS_AGENT_2: src/components/**/*.tsx (60 archivos)  
TS_AGENT_3: src/lib/**/*.ts (50 archivos)
TS_AGENT_4: src/app/**/page.tsx (30 archivos)

## Proceso por archivo:
1. Encontrar todos los `any` con: grep -n "any" file.ts
2. Determinar tipo correcto basado en uso
3. Si es necesario, crear tipo en src/types/
4. Aplicar cambio
5. Verificar: npx tsc --noEmit
6. Commit atómico con descripción

## Verificación:
- grep -r "any" src/ --include="*.ts" | wc -l → Debe dar 0
- npm run type-check → 0 errores
```

**Verificadores:** CROSS_REVIEW_1, CROSS_REVIEW_2

---

### DÍA 9-10: Tipos de Supabase Completos

**Subagente:** TS_AGENT_5

```markdown
## Generar tipos completos:

supabase gen types typescript --project-id "$PROJECT_REF" --schema public > src/lib/database.types.ts

## Luego verificar:
- [ ] Todas las tablas tipadas
- [ ] Todas las relaciones tipadas
- [ ] Todas las funciones RPC tipadas
- [ ] Autocompletado funciona en VS Code
- [ ] 0 errores de tipo en queries Supabase
```

---

### DÍA 11-12: Return Types Explícitos

**Subagentes:** TS_AGENT_6, TS_AGENT_7

```markdown
## Para cada función exportada sin return type:

ANTES:
export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

DESPUÉS:
export function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

## Verificación:
npm run lint:return-types → 0 errores
```

---

## 📋 SEMANA 3 - TESTING INFRA + I18N INFRA

### DÍA 13-15: Mock Factories

**Subagente:** TEST_AGENT_1

```typescript
// src/lib/__tests__/factories/user.factory.ts

import { User, UserRole } from '@/types/user';

export const UserFactory = {
  create(overrides: Partial<User> = {}): User {
    return {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      email: `user${Date.now()}@test.com`,
      role: UserRole.PATIENT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    };
  },

  createDoctor(overrides: Partial<User> = {}): User {
    return this.create({
      role: UserRole.DOCTOR,
      ...overrides
    });
  },

  createList(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
};
```

**Verificación:**
- [ ] Factories generan datos válidos
- [ ] Tests usan factories
- [ ] 0 objetos inline en tests

---

### DÍA 16-18: i18n Infrastructure

**Subagente:** I18N_AGENT_1

```markdown
## Implementar ESLint Rule:

// eslint-plugin-custom/rules/no-hardcoded-spanish.js

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded Spanish strings',
      category: 'Possible Errors',
      recommended: true
    },
    fixable: 'code',
    schema: []
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value === 'string' && isSpanish(node.value)) {
          context.report({
            node,
            message: 'Hardcoded Spanish string detected. Use t() instead.',
            fix(fixer) {
              // Suggest fix
            }
          });
        }
      }
    };
  }
};
```

**Verificación:**
- [ ] ESLint detecta strings hardcodeados
- [ ] CI bloquea PRs con strings hardcodeados
- [ ] Script de extracción funciona

---

## 📋 FIN DE FASE 1 - VERIFICACIÓN

### DÍA 19-21: Validación Exhaustiva

**Equipo:** Todos los agentes + CROSS_REVIEW_1 + CROSS_REVIEW_2

```markdown
## CHECKLIST DE FASE 1:

### Quality Gates
- [ ] Pre-commit hooks funcionan (test: commit con error)
- [ ] CI quality gates rechazan PRs malos
- [ ] Métricas se generan automáticamente
- [ ] Dashboard actualizado

### TypeScript
- [ ] 0 errores de TypeScript strict
- [ ] 0 usages de `any` implícito
- [ ] Todas las funciones exportadas tienen return type
- [ ] Tipos de Supabase completos y usados

### Testing
- [ ] Mock factories creadas (user, appointment, prescription)
- [ ] Test utilities documentadas
- [ ] Templates de tests disponibles
- [ ] Cobertura medible

### i18n
- [ ] ESLint rule activa y bloquea
- [ ] Script de extracción funciona
- [ ] Reporte de coverage generado

### Documentación
- [ ] Cada tarea documentada
- [ ] Instrucciones claras para reproducir
- [ ] Lecciones aprendidas registradas

## Métricas Objetivo:
- TypeScript: 90/100 (antes: 78)
- DevOps: 80/100 (antes: 65)
- Testing Infra: 75/100 (antes: 63)
- Global: 70/100 (antes: 64.5)

## Si NO se cumplen las métricas:
- NO avanzar a Fase 2
- Identificar bloqueos
- Extender Fase 1 hasta cumplir
```

---

## 🎯 PROXIMOS PASOS INMEDIATOS

### Ahora (Próximas 2 horas):

1. **Setup inicial** (30 min)
   - Crear directorios
   - Instalar husky
   - Crear archivos de tracking

2. **Configurar pre-commit** (45 min)
   - .husky/pre-commit
   - .lintstagedrc.json
   - Probar con commit de prueba

3. **Configurar CI** (45 min)
   - .github/workflows/quality-gates.yml
   - Probar con PR de prueba

### Mañana:

4. **Script de métricas** (4 horas)
   - scripts/quality/generate-report.js
   - Integrar con CI
   - Dashboard inicial

### Esta semana:

5. **TypeScript strict** (20 horas paralelizadas)
6. **Testing infra** (12 horas)
7. **i18n infra** (12 horas)

---

## ✅ CHECKLIST DE ARRANQUE

- [ ] Aprobado por stakeholders
- [ ] Recursos asignados (subagentes)
- [ ] Feature freeze comunicado
- [ ] Sistema de tracking listo
- [ ] Primera tarea asignada

---

**¿Empezamos la ejecución inmediata?**
