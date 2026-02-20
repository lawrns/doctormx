# Comprehensive i18n Analysis Report - Doctor.mx

**Date:** 2026-02-16  
**Analyst:** Internationalization (i18n) Expert  
**Project:** Doctor.mx - Telemedicine Platform for Mexico

---

## Executive Summary

### i18n Readiness Score: **35/100** ⚠️

| Category | Score | Status |
|----------|-------|--------|
| i18n Infrastructure | 0/100 | ❌ No i18n library installed |
| Translation Files | 0/100 | ❌ No translation structure |
| Language Coverage | 30/100 | ⚠️ Spanish only (es-MX) |
| Hardcoded Strings | 20/100 | ❌ Extensively hardcoded |
| Regional Formats | 95/100 | ✅ Excellent Mexican locale support |
| RTL Support | 0/100 | ❌ Not implemented |
| SEO Multilingual | 20/100 | ❌ Missing hreflang |
| Legal Content | 50/100 | ⚠️ Spanish only |

---

## 1. Current i18n Implementation Status

### 1.1 No i18n Library Detected

**Finding:** The project has NO internationalization library installed.

**Checked Libraries (all not found):**
- ❌ `next-i18next`
- ❌ `next-intl`
- ❌ `react-i18next`
- ❌ `i18next`
- ❌ `@lingui/react`

**Package.json dependencies analyzed:**
- No i18n-related dependencies in 124 production dependencies
- No i18n-related devDependencies in 25 dev dependencies

### 1.2 No Translation File Structure

**Missing directories:**
- ❌ `/public/locales/` (standard for next-i18next)
- ❌ `/src/locales/` 
- ❌ `/src/i18n/`
- ❌ `/messages/` (standard for next-intl)
- ❌ No JSON/YAML translation files

### 1.3 No i18n Configuration in next.config.ts

**Current state:**
```typescript
// next.config.ts - NO i18n configuration
const nextConfig: NextConfig = {
  reactCompiler: true,
  output: 'standalone',
  // ... webpack config
  // NO i18n: { locales: ['es', 'en'], defaultLocale: 'es' }
}
```

**Missing configuration:**
```typescript
// Required for i18n
i18n: {
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localeDetection: true,
}
```

### 1.4 HTML Lang Attribute

**Current (line 87 in layout.tsx):**
```tsx
<html lang="es" className={`${hedvigLettersSerif.variable}`}>
```

**Assessment:** ✅ Correctly set to "es" but static - doesn't change with language.

---

## 2. Language Coverage Analysis

### 2.1 Current Language Support

| Language | Code | Status | Coverage |
|----------|------|--------|----------|
| Spanish (Mexico) | es-MX | ✅ Primary | 100% |
| English | en | ❌ Not implemented | 0% |
| Náhuatl | nah | ❌ Not implemented | 0% |
| Yucatec Maya | yua | ❌ Not implemented | 0% |
| Other Indigenous | - | ❌ Not implemented | 0% |

### 2.2 Medical Tourism & Expat Considerations

**Critical Gap:** No English support for:
- Medical tourists visiting Mexico
- Expats living in Mexico
- International patients seeking Mexican healthcare
- English-speaking Mexicans

**Mexico Statistics:**
- Medical tourism: ~1.2 million patients annually (2024)
- US expats in Mexico: ~1.6 million
- English-speaking Mexicans: ~10% of population

---

## 3. Hardcoded Strings Inventory

### 3.1 Component-Level Hardcoded Text

#### Navigation Components

**Header.tsx** (lines 34-39, 96, 101, 112, 138, 165, 172):
```typescript
const navLinks = [
  { href: '/doctores', label: 'Buscar doctores' },
  { href: '/app/second-opinion', label: 'Consulta IA' },
  { href: '/specialties', label: 'Especialidades' },
  { href: '/for-doctors', label: 'Para doctores' },
]
// ... "Iniciar sesión", "Registrarse", "Cerrar menú", "Abrir menú"
```

**Footer.tsx** (lines 72-221):
- "Para pacientes" / "Para doctores" / "Compañía" / "Legal"
- All navigation links (20+ strings)
- "Hecho con ❤️ en México"
- "Todos los derechos reservados"

#### Landing Page Components

**HeroSection.tsx** (30+ hardcoded strings):
```tsx
// Lines 116-130
<h1>5 Consultas Medicas 100% GRATIS</h1>
<p>Salud accesible para todos...</p>
<span>En línea ahora</span>
<span>Dr. Simeon - Asistente médico IA</span>
<button>CONSULTAR AHORA — GRATIS</button>
<button>Buscar un Especialista</button>
<a>Eres doctor? Unete a la red</a>
<span>COFEPRIS Verificado</span>
<span>Doctores con cédula SEP</span>
<span>Consultas realizadas</span>
```

**FeaturesSection.tsx**:
- "Doctores con cédula verificada"
- "Videoconsulta HD desde casa"
- "Receta digital en minutos"

#### UI Components

**EmptyState.tsx** (lines 179-273):
```tsx
// Multiple hardcoded empty states
title: "No tienes consultas programadas"
description: "Las citas aparecerán aquí cuando los pacientes reserven..."
action: { label: "Ver mi perfil público" }
// ... 6 more empty state variations
```

**Badge.tsx** (lines 47-56):
```typescript
const labels: Record<string, string> = {
  pending_payment: 'Pago pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
  no_show: 'No asistió',
  refunded: 'Reembolsada',
}
```

### 3.2 Form Validation Messages

**Zod Schemas** (src/lib/validation/schemas.ts):
```typescript
// English validation messages (mixed with Spanish UI)
licenseNumber: z.string().regex(/.../, 'License number must be 6-20 alphanumeric characters')
// Should be: 'La cédula debe tener 6-20 caracteres alfanuméricos'
```

### 3.3 Error Messages

**Patient Messages** (src/lib/errors/messages.ts, lines 96-181):
- ✅ 70+ well-structured Spanish error messages
- ✅ Categorized by error type (Medical, Emergency, Prescription, etc.)
- ❌ Only Spanish - no English translations

**Developer Messages** (lines 186-271):
- ✅ English messages for developers
- ✅ Good separation of concerns

### 3.4 Medical Terminology

**Medical Terminology Constants** (src/lib/constants/medical-terminology.ts):
- ✅ Comprehensive Spanish medical terms
- ✅ Patient-friendly explanations
- ✅ NOM-004-SSA3-2012 compliant terminology
- ❌ Only Spanish - no English equivalents

### 3.5 Legal Content

**Terms Page** (src/app/terms/page.tsx):
- Full terms and conditions in Spanish
- COFEPRIS compliance notices
- Mexican corporate information (RFC)
- ❌ No English version

**Privacy Page** (src/app/privacy/page.tsx):
- Full privacy policy in Spanish
- Ley Federal de Protección de Datos compliance
- ❌ No English version

### 3.6 Hardcoded String Count Estimate

| Category | Estimated Strings |
|----------|------------------|
| Navigation | 30+ |
| Landing Page | 80+ |
| UI Components | 150+ |
| Error Messages | 80+ |
| Form Labels/Placeholders | 100+ |
| Medical Terminology | 200+ |
| Legal Content | 500+ words |
| **Total** | **~600+ strings** |

---

## 4. Date/Number/Currency Formatting

### 4.1 ✅ Excellent Regional Format Support

**Currency Formatting** (src/lib/utils/formatters.ts, lines 22-30):
```typescript
export function formatCurrency(cents: number, currency: string = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
// Result: "$500" (Mexican Peso format)
```

**Date Formatting** (lines 44-51):
```typescript
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}
// Result: "15 de enero de 2026"
```

**Phone Formatting** (lines 114-137):
```typescript
// Mexican mobile format: +52 1 XXX XXX XXXX
export function formatPhoneNumber(phone: string): string {
  // Proper Mexican phone formatting
}
```

### 4.2 Assessment

| Format | Status | Locale |
|--------|--------|--------|
| Currency | ✅ | es-MX, MXN |
| Dates | ✅ | es-MX |
| Times | ✅ | es-MX |
| Numbers | ✅ | es-MX |
| Phone | ✅ | Mexican format |

**Strength:** The application correctly uses `Intl` API with Mexican Spanish locale.

---

## 5. RTL (Right-to-Left) Support

### 5.1 Current Status: ❌ Not Implemented

**Findings:**
- No RTL CSS classes
- No direction detection
- No layout flipping logic
- HTML dir attribute not dynamic

### 5.2 Impact

While RTL languages (Arabic, Hebrew) may not be primary targets for Mexico, this represents incomplete i18n architecture that would require significant refactoring later.

---

## 6. Language Detection & Switching

### 6.1 Current Status: ❌ Not Implemented

**Missing:**
- ❌ Language selector component
- ❌ Browser language detection
- ❌ Cookie-based language persistence
- ❌ URL locale prefixes (/es/, /en/)
- ❌ Language switcher in UI

### 6.2 Middleware Analysis

**Current middleware.ts:**
- Handles CSRF protection
- Applies security headers
- Session management
- ❌ No i18n routing
- ❌ No locale detection

---

## 7. SEO Multilingual

### 7.1 Current Metadata (layout.tsx)

```typescript
export const metadata: Metadata = {
  title: "Doctor.mx | Telemedicina y Doctores Verificados en México | 24/7",
  description: "Consulta médica en línea con doctores verificados en México...",
  // ...
  alternates: {
    canonical: "https://doctor.mx",
    // ❌ Missing: languages: { 'es': '...', 'en': '...' }
  },
  openGraph: {
    locale: "es_MX", // ✅ Correct
    // ...
  },
}
```

### 7.2 Missing SEO Elements

- ❌ Hreflang tags
- ❌ Alternate language URLs
- ❌ Language-specific sitemap entries
- ❌ x-default hreflang

---

## 8. Indigenous Languages Consideration

### 8.1 Mexico Context

**Major Indigenous Languages in Mexico:**
| Language | Speakers | ISO Code |
|----------|----------|----------|
| Náhuatl | 1.7M | nah |
| Yucatec Maya | 800K | yua |
| Mixtec | 500K | mix |
| Zapotec | 450K | zap |
| Tzeltal | 400K | tzh |

### 8.2 Recommendation

While not immediately required, the architecture should support indigenous languages given:
- 7.3 million indigenous language speakers in Mexico
- Healthcare accessibility gap in indigenous communities
- Potential government/NGO partnerships

---

## 9. Technical Debt Assessment

### 9.1 Debt Categories

| Category | Level | Effort to Fix |
|----------|-------|---------------|
| i18n Library Integration | High | 16 hours |
| String Extraction | High | 40 hours |
| Component Refactoring | Medium | 24 hours |
| Translation File Creation | Medium | 16 hours |
| Testing | Medium | 16 hours |
| **Total** | **High** | **~112 hours** |

### 9.2 Risk Factors

1. **String Fragmentation:** Text scattered across 400+ files
2. **Medical Terminology:** Requires professional translation
3. **Legal Content:** Must comply with Mexican law in Spanish
4. **Validation Messages:** Zod schemas need message updates
5. **SEO Impact:** Multilingual SEO needs careful implementation

---

## 10. Recommendations

### 10.1 Recommended i18n Architecture

**Library Choice:** `next-intl` (Recommended for Next.js App Router)

**Rationale:**
- Native App Router support
- Server Components compatible
- Type-safe translations
- Middleware integration
- Smaller bundle than next-i18next

**Alternative:** `next-i18next` (if maintaining Pages Router compatibility)

### 10.2 Proposed File Structure

```
doctormx/
├── messages/                    # Translation files
│   ├── es.json                 # Spanish (default)
│   ├── en.json                 # English
│   └── nah.json                # Náhuatl (future)
├── src/
│   ├── i18n/
│   │   ├── config.ts           # i18n configuration
│   │   └── routing.ts          # Locale routing
│   ├── components/
│   │   └── LanguageSelector.tsx
│   └── middleware.ts           # Updated with locale routing
├── next.config.ts              # With i18n config
└── src/app/
    ├── [locale]/               # Localized routes
    │   ├── page.tsx
    │   └── layout.tsx
    └── page.tsx                # Redirect to /es
```

### 10.3 Implementation Roadmap

#### Phase 1: Infrastructure (Week 1-2)
- [ ] Install `next-intl`
- [ ] Create translation file structure
- [ ] Configure next.config.ts
- [ ] Set up middleware for locale routing
- [ ] Create LanguageSelector component

#### Phase 2: String Extraction (Week 3-4)
- [ ] Extract navigation strings
- [ ] Extract landing page strings
- [ ] Extract UI component strings
- [ ] Extract error messages
- [ ] Create base es.json file

#### Phase 3: English Translation (Week 5-6)
- [ ] Create en.json
- [ ] Translate all UI strings
- [ ] Translate medical terminology
- [ ] Keep legal content Spanish-only (compliance)
- [ ] Professional medical translation review

#### Phase 4: SEO & Testing (Week 7)
- [ ] Implement hreflang tags
- [ ] Update sitemap.ts
- [ ] Add alternate language links
- [ ] Test language switching
- [ ] Test SEO indexing

#### Phase 5: Future: Indigenous Languages (Optional)
- [ ] Náhuatl translation partnership
- [ ] Maya translation partnership
- [ ] Community review process

### 10.4 Critical Considerations

1. **Legal Content:** Keep Terms & Privacy in Spanish only (Mexican law requirement)
2. **Medical Accuracy:** Professional translation for medical terms
3. **Cultural Context:** Mexican Spanish nuances
4. **Currency:** Always MXN regardless of language
5. **Phone Format:** Always Mexican format (+52)

---

## 11. Cost Estimate

| Item | Hours | Rate | Cost (USD) |
|------|-------|------|------------|
| Infrastructure setup | 16 | $50 | $800 |
| String extraction | 40 | $50 | $2,000 |
| Component refactoring | 24 | $50 | $1,200 |
| Professional translation (EN) | - | - | $2,000 |
| QA & Testing | 16 | $50 | $800 |
| **Total** | **96** | - | **$6,800** |

---

## 12. Conclusion

### Current State: ⚠️ Not Production-Ready for Multilingual

**Strengths:**
- ✅ Proper Mexican locale formatting
- ✅ Well-structured error message system
- ✅ Comprehensive Spanish medical terminology
- ✅ Correct OpenGraph locale metadata

**Critical Weaknesses:**
- ❌ No i18n infrastructure
- ❌ 600+ hardcoded Spanish strings
- ❌ No English support for medical tourism
- ❌ No language switching capability

### Immediate Actions Required:

1. **Before Launch:** Decide on English support requirement
2. **Post-Launch:** Plan i18n infrastructure implementation
3. **Future:** Consider indigenous language support for social impact

### Final Recommendation:

**Priority: HIGH** - Implement i18n infrastructure before extensive content growth makes migration prohibitively expensive.

---

**Report Generated:** 2026-02-16  
**Analyst:** i18n Expert Subagent  
**Next Review:** Post-implementation
