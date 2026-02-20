# Doctor.mx - Comprehensive Dependencies Audit Report

**Audit Date:** 2026-02-20  
**Auditor:** AI Agent  
**Project:** doctormx v0.1.0  
**Node Version Requirement:** >=16.0.0

---

## Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| Total Dependencies | 1,430 | ⚠️ |
| Production Dependencies | 607 | - |
| Development Dependencies | 682 | - |
| Peer Dependencies | 43 | - |
| Security Vulnerabilities | 19 (14 high, 3 moderate, 2 low) | 🔴 CRITICAL |
| Outdated Packages | 30 | 🟡 |
| Node Modules Size | ~2.1 GB (759 packages) | ⚠️ |
| Potential Unused Dependencies | 15+ | 🟡 |

---

## 1. SECURITY VULNERABILITIES (CRITICAL)

### 🔴 HIGH SEVERITY (14 vulnerabilities)

| Package | Severity | Issue | CWE | Affected Range | Fix Available |
|---------|----------|-------|-----|----------------|---------------|
| **@lhci/cli** | HIGH | Via chrome-launcher, inquirer, tmp | Multiple | * | ⚠️ Major update required |
| **@sentry/vite-plugin** | HIGH | Via @sentry/bundler-plugin-core → glob | - | >=0.5.0 | ⚠️ Downgrade to 0.4.0 |
| **@sentry/bundler-plugin-core** | HIGH | Via glob → minimatch | - | >=0.5.0 | ⚠️ Downgrade to 0.4.0 |
| **@typescript-eslint/eslint-plugin** | HIGH | Via @typescript-eslint/parser, type-utils, utils, eslint | - | * | ❌ No fix |
| **@typescript-eslint/parser** | HIGH | Via @typescript-eslint/typescript-estree, eslint | - | * | ❌ No fix |
| **@typescript-eslint/type-utils** | HIGH | Via @typescript-eslint/typescript-estree, utils, eslint | - | >=5.62.1-alpha.0 | ✅ Fix available |
| **@typescript-eslint/typescript-estree** | HIGH | Via minimatch | - | >=6.16.0 | ❌ No fix |
| **@typescript-eslint/utils** | HIGH | Via @eslint-community/eslint-utils, @typescript-eslint/typescript-estree, eslint | - | * | ❌ No fix |
| **glob** | HIGH | Via minimatch | CWE-1333 | 3.0.0 - 10.5.0 | ⚠️ Indirect |
| **minimatch** | HIGH | ReDoS via repeated wildcards | CWE-1333 | <10.2.1 | ❌ No fix |
| **rimraf** | HIGH | Via glob | - | 2.3.0 - 3.0.2 \|\| 4.2.0 - 5.0.10 | ⚠️ Indirect |
| **chrome-launcher** | HIGH | Via rimraf | - | 0.3.1 - 0.13.4 | ⚠️ Indirect |
| **typedoc** | HIGH | Via minimatch | CWE-1333 | >=0.0.5 | ⚠️ Major downgrade |

### 🟡 MODERATE SEVERITY (3 vulnerabilities)

| Package | Issue | CWE | Affected Range |
|---------|-------|-----|----------------|
| **ajv** | ReDoS when using `$data` option | CWE-400 | <8.18.0 |
| **eslint** | Via @eslint-community/eslint-utils, ajv | - | >=4.2.0 |
| **@eslint-community/eslint-utils** | Via eslint | - | * |

### 🟢 LOW SEVERITY (2 vulnerabilities)

| Package | Issue | CVE/CWE | Affected Range |
|---------|-------|---------|----------------|
| **tmp** | Arbitrary temp file write via symlink | GHSA-52f5-9888-hmc6, CWE-59, CVSS: 2.5 | <=0.2.3 |
| **external-editor** | Via tmp | - | >=1.1.1 |
| **inquirer** | Via external-editor | - | 3.0.0 - 8.2.6 \|\| 9.0.0 - 9.3.7 |

### Security Impact Analysis
- **minimatch** vulnerability affects 14 packages due to deep dependency chains
- **@lhci/cli** brings in multiple vulnerable dependencies (chrome-launcher, inquirer, tmp)
- **typedoc** introduces minimatch vulnerability in dev environment
- The glob/minimatch vulnerability chain affects the Sentry bundler plugin

---

## 2. OUTDATED DEPENDENCIES

### Major Version Updates (Breaking Changes)

| Package | Current | Latest | Behind | Impact |
|---------|---------|--------|--------|--------|
| **react** | 18.3.1 | 19.2.4 | 1 major | 🔴 Breaking - needs migration |
| **react-dom** | 18.3.1 | 19.2.4 | 1 major | 🔴 Breaking - needs migration |
| **@types/react** | 18.3.28 | 19.2.14 | 1 major | 🔴 Type conflicts |
| **@types/react-dom** | 18.3.7 | 19.2.3 | 1 major | 🔴 Type conflicts |
| **@testing-library/react** | 14.3.1 | 16.3.2 | 2 majors | 🔴 Breaking changes |
| **@vitejs/plugin-react** | 4.7.0 | 5.1.4 | 1 major | 🟡 May have config changes |
| **react-router-dom** | 6.30.3 | 7.13.0 | 1 major | 🔴 Breaking - new API |
| **tailwindcss** | 3.4.19 | 4.2.0 | 1 major | 🔴 Complete rewrite needed |
| **@tailwindcss/postcss** | 4.1.18 | 4.2.0 | patch | 🟢 Low risk |
| **recharts** | 2.15.4 | 3.7.0 | 1 major | 🔴 Breaking - major API changes |
| **react-helmet-async** | 1.3.0 | 2.0.5 | 1 major | 🟡 API changes likely |
| **react-intersection-observer** | 9.5.2 | 10.0.3 | 1 major | 🟡 Hook API changes |
| **uuid** | 9.0.1 | 13.0.0 | 4 majors | 🔴 Breaking changes |
| **lint-staged** | 15.5.2 | 16.2.7 | 1 major | 🟡 Config changes |
| **typescript** | 5.2.2 | 5.9.3 | 7 minors | 🟡 New features available |

### Minor/Patch Updates

| Package | Current | Latest | Type |
|---------|---------|--------|------|
| **@anthropic-ai/sdk** | 0.72.1 | 0.78.0 | Non-semver update |
| **@sentry/react** | 10.38.0 | 10.39.0 | Patch |
| **@supabase/supabase-js** | 2.95.3 | 2.97.0 | Minor |
| **framer-motion** | 12.34.0 | 12.34.3 | Patch |
| **ioredis** | 5.9.2 | 5.9.3 | Patch |
| **jsdom** | 28.0.0 | 28.1.0 | Minor |
| **lucide-react** | 0.561.0 | 0.575.0 | Non-semver |
| **openai** | 6.21.0 | 6.22.0 | Minor |
| **react-error-boundary** | 6.1.0 | 6.1.1 | Patch |
| **tailwind-merge** | 3.4.0 | 3.5.0 | Minor |
| **xstate** | 5.26.0 | 5.28.0 | Minor |
| **@sentry/cli** | 3.2.0 | 3.2.1 | Patch |
| **happy-dom** | 20.6.1 | 20.6.3 | Patch |
| **@types/pdfkit** | 0.17.4 | 0.17.5 | Patch |

---

## 3. POTENTIALLY UNUSED DEPENDENCIES

Based on `npm-check` and `depcheck` analysis (requires manual verification):

### Production Dependencies (Potentially Unused)

| Package | Listed In | Reason | Recommendation |
|---------|-----------|--------|----------------|
| **@anthropic-ai/sdk** | dependencies | Depcheck didn't find usage | ⚠️ Verify AI integration |
| **@tailwindcss/postcss** | dependencies | Depcheck didn't find usage | ⚠️ Verify Tailwind v4 setup |
| **@tanstack/react-query** | dependencies | Depcheck didn't find usage | 🔴 Verify - likely used |
| **@xstate/react** | dependencies | Depcheck didn't find usage | ⚠️ Verify (found 1 file using xstate) |
| **autoprefixer** | dependencies | Depcheck didn't find usage | ⚠️ Verify PostCSS config |
| **axios** | dependencies | Depcheck didn't find usage | 🔴 Verify - common HTTP client |
| **cheerio** | dependencies | Depcheck didn't find usage | ⚠️ Verify scraping usage |
| **postcss** | dependencies | Depcheck didn't find usage | ⚠️ Verify build pipeline |
| **react-helmet-async** | dependencies | Depcheck didn't find usage | ⚠️ Verify SEO usage |
| **react-intersection-observer** | dependencies | Depcheck didn't find usage | ⚠️ Verify intersection usage |
| **uuid** | dependencies | Depcheck didn't find usage | ⚠️ Verify UUID generation |

### Development Dependencies (Potentially Unused)

| Package | Listed In | Reason | Recommendation |
|---------|-----------|--------|----------------|
| **@babel/core** | devDependencies | Depcheck didn't find usage | ⚠️ Verify Babel usage |
| **@babel/preset-env** | devDependencies | Depcheck didn't find usage | ⚠️ Verify Babel config |
| **@babel/preset-react** | devDependencies | Depcheck didn't find usage | ⚠️ Verify Babel config |
| **@babel/preset-typescript** | devDependencies | Depcheck didn't find usage | ⚠️ Verify Babel config |
| **@lhci/cli** | devDependencies | Depcheck didn't find usage | ⚠️ Verify Lighthouse CI |
| **@testing-library/user-event** | devDependencies | Depcheck didn't find usage | ⚠️ Verify test usage |
| **@vitest/coverage-v8** | devDependencies | Depcheck didn't find usage | ⚠️ Verify coverage usage |
| **lint-staged** | devDependencies | Depcheck didn't find usage | ⚠️ Verify husky integration |
| **prettier** | devDependencies | Depcheck didn't find usage | ⚠️ Verify formatting |
| **typedoc** | devDependencies | Depcheck didn't find usage | ⚠️ Verify docs generation |

**Note:** Depcheck can produce false positives. Dependencies may be used in:
- Configuration files
- Build scripts
- Runtime dynamic imports
- Type-only imports
- Next.js auto-imports

---

## 4. BUNDLE SIZE ANALYSIS

### Largest Dependencies in node_modules

| Package | Size (MB) | Category | Impact |
|---------|-----------|----------|--------|
| **next** | 135.2 | Framework | Core runtime |
| **@next** | 122.07 | Framework | Build tools |
| **@sentry** | 49.77 | Monitoring | Error tracking |
| **typescript** | 38.73 | Dev Tool | Build only |
| **lucide-react** | 34.46 | UI Icons | Client bundle |
| **@swc** | 24.52 | Compiler | Build only |
| **date-fns** | 21.55 | Date Utils | Client bundle |
| **lighthouse** | 20.4 | Dev Tool | CI/CD only |
| **@pact-foundation** | 19.32 | Testing | Dev only |
| **@img** | 19.02 | Images | Sharp binaries |
| **@esbuild** | 10.85 | Bundler | Build only |
| **@babel** | 10.65 | Compiler | Build/legacy |
| **tailwindcss** | 7.24 | CSS | Build only |
| **openai** | 6.92 | AI | Client bundle |
| **stripe** | 6.36 | Payments | Client bundle |
| **pdfkit** | 5.81 | PDF Gen | Client bundle |
| **jsdom** | 5.53 | Testing | Dev only |
| **recharts** | 4.46 | Charts | Client bundle |
| **framer-motion** | 4.38 | Animation | Client bundle |
| **react-dom** | 4.30 | Core | Client bundle |

### Client Bundle Optimization Status

✅ **Good:**
- Separate chunks configured for framer-motion, recharts, pdfkit
- AI libraries chunked separately
- Lucide icons optimized via `optimizePackageImports`

⚠️ **Concerns:**
- `lucide-react` (34.46 MB raw) - ensure tree-shaking works
- `date-fns` (21.55 MB raw) - verify only needed locales imported
- `pdfkit` (5.81 MB) - server-side only? Should not be in client bundle
- `openai` (6.92 MB) - should be server-side only
- `stripe` (6.36 MB) - load Stripe.js externally?

---

## 5. LICENSE COMPLIANCE

### Licenses Found in Dependencies

| License | Count | Risk Level |
|---------|-------|------------|
| MIT | ~650 | ✅ Permissive |
| Apache-2.0 | ~45 | ✅ Permissive |
| BSD-3-Clause | ~25 | ✅ Permissive |
| ISC | ~30 | ✅ Permissive |
| MPL-2.0 | ~5 | 🟡 Weak copyleft |
| BlueOak-1.0.0 | ~2 | ✅ Permissive |
| CC0-1.0 | ~3 | ✅ Public domain |
| (MIT OR Apache-2.0) | ~8 | ✅ Dual license |

### Specific License Notes

| Package | License | Note |
|---------|---------|------|
| **@axe-core/playwright** | MPL-2.0 | Weak copyleft - acceptable |
| **lru-cache@11.2.6** | BlueOak-1.0.0 | Permissive, newer license |
| **caniuse-lite** | CC-BY-4.0 | Attribution required |

**Overall License Risk:** 🟢 **LOW** - All dependencies use permissive or weak copyleft licenses compatible with commercial use.

---

## 6. PEER DEPENDENCY ISSUES

### Peer Dependency Requirements Found

| Package | Peer Dependencies | Status |
|---------|------------------|--------|
| **@anthropic-ai/sdk** | zod (^3.25.0 \|\| ^4.0.0) | ✅ Satisfied (4.3.5) |
| **@axe-core/playwright** | playwright-core (>= 1.0.0) | ✅ Satisfied |
| **@hookform/resolvers** | react-hook-form (^7.0.0) | ✅ Satisfied (7.71.1) |
| **@sentry/react** | react (^16.14.0 \|\| 17.x \|\| 18.x \|\| 19.x) | ✅ Satisfied (18.3.1) |
| **@stripe/react-stripe-js** | react (^16.8.0 \|\| ^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0), react-dom, @stripe/stripe-js | ✅ Satisfied |
| **@xstate/react** | react (^16.8.0 \|\| ^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0), xstate | ✅ Satisfied |
| **@testing-library/react** | react (^18.0.0), react-dom (^18.0.0) | ✅ Satisfied |

### Missing Peer Dependencies (from npm-check)

| Package | Required By | Severity |
|---------|-------------|----------|
| **eslint-config-next** | .eslintrc.json | 🔴 High |
| **@eslint/js** | eslint.config.mjs | 🔴 High |
| **globals** | eslint.config.mjs | 🔴 High |
| **typescript-eslint** | eslint.config.mjs | 🔴 High |
| **@next/eslint-plugin-next** | eslint.config.mjs | 🔴 High |
| **dotenv** | src/lib/__tests__/setup.ts | 🟡 Medium |
| **@vapi-ai/web** | src/hooks/useVapi.ts | 🟡 Medium |
| **playwright** | scripts/axe-audit.js | 🟡 Medium |
| **react-toastify** | legacy/toast.js | 🟢 Low |

---

## 7. DEPENDENCY CONFLICTS & INCONSISTENCIES

### Duplicate Packages Detected

**Dependency Tree Issues:**
- Multiple versions of `lru-cache` (5.1.1, 6.x, 7.x, 10.x, 11.x)
- Multiple versions of `semver` (5.x, 6.x, 7.x)
- Multiple versions of `debug` (2.x, 4.x)
- Multiple versions of `ms` (2.0.x, 2.1.x)

### Invalid/Extraneous Packages

| Package | Issue | Location |
|---------|-------|----------|
| **@emnapi/runtime@1.8.1** | Extraneous | node_modules/@emnapi/runtime |
| **@swc/helpers@0.5.15** | Invalid version | node_modules/@swc/helpers |

### Structural Issues

1. **yaml** appears in BOTH dependencies AND devDependencies (version 2.8.2)
2. **@types/pdfkit** appears in BOTH dependencies AND devDependencies
3. **@types/qrcode** appears in BOTH dependencies AND devDependencies

---

## 8. MAINTENANCE STATUS ANALYSIS

### Active & Well-Maintained ✅
- **next** - Regular updates, active development
- **react** / **react-dom** - Meta maintained
- **@radix-ui/*** - Modern, actively maintained
- **tailwindcss** - Very active, v4 in progress
- **@tanstack/react-query** - Tanner Linsley, very active
- **zod** - TypeScript-first validation, active
- **framer-motion** - Motion division, active

### Potential Concerns ⚠️
- **react-helmet-async** - Maintenance slowed, consider Next.js Metadata API
- **uuid** - Very stable but v9 is old, v13 available
- **@types/react-router-dom** - v5.3.3 types for v6.x (may be outdated)

### Unknown/Verify 🔍
- **@daily-co/daily-js** - Video SDK, verify current version compatibility
- **pdfkit** - PDF generation, check for v0.17+ compatibility

---

## 9. TREE-SHAKING COMPATIBILITY

### ESM-First Packages (Good for Tree-Shaking) ✅
- **lucide-react** - ESM, tree-shakeable
- **date-fns** - ESM, import individual functions
- **framer-motion** - ESM with tree-shaking support
- **zod** - ESM, tree-shakeable

### CommonJS-Only Packages (Tree-Shaking Issues) ⚠️
- **pdfkit** - CJS, large bundle impact
- **ioredis** - CJS, server-side only
- **cheerio** - CJS, server-side typically
- **stripe** - CJS, but provides ESM wrapper

### Next.js optimizePackageImports Configured ✅
```javascript
optimizePackageImports: [
  'lucide-react',
  'framer-motion', 
  'recharts',
  '@radix-ui/react-icons',
]
```

---

## 10. SPECIFIC RECOMMENDATIONS

### Immediate Actions (Critical) 🔴

1. **Fix Security Vulnerabilities**
   ```bash
   # Update @sentry/vite-plugin to safe version
   npm install @sentry/vite-plugin@0.4.0 --save
   
   # Update @typescript-eslint packages
   npm update @typescript-eslint/eslint-plugin @typescript-eslint/parser
   
   # Remove or update typedoc
   npm uninstall typedoc
   ```

2. **Install Missing Peer Dependencies**
   ```bash
   npm install --save-dev eslint-config-next @eslint/js globals typescript-eslint @next/eslint-plugin-next
   npm install --save-dev dotenv playwright
   npm install @vapi-ai/web  # if still needed
   ```

3. **Fix Dependency Duplicates**
   ```bash
   npm dedupe
   npm prune
   ```

### Short-Term (High Priority) 🟡

4. **Update Patch/Minor Versions**
   ```bash
   npm update
   ```

5. **Verify and Remove Actually Unused Dependencies**
   - Run manual verification on flagged packages
   - Remove confirmed unused dependencies

6. **Clean Up package.json**
   - Remove duplicate entries (yaml, @types/pdfkit, @types/qrcode)
   - Move @types packages to devDependencies only

### Medium-Term (Planning Required) 🟢

7. **Plan React 19 Migration**
   - Review React 19 breaking changes
   - Update @types/react and @types/react-dom together
   - Test thoroughly before deployment

8. **Evaluate Tailwind CSS v4**
   - v4 is a complete rewrite
   - Plan migration timeline
   - Consider staying on v3 until v4 stabilizes

9. **Evaluate React Router v7**
   - New framework mode APIs
   - May require routing structure changes
   - Consider Next.js App Router alternatives

10. **Server-Side Only Packages**
    - Ensure `pdfkit`, `openai`, `cheerio` are NOT bundled for client
    - Verify Next.js server-only imports

### Long-Term Strategic 📝

11. **Bundle Optimization**
    - Consider replacing `date-fns` with native `Intl.DateTimeFormat`
    - Evaluate if `recharts` v3 features are needed
    - Consider dynamic imports for heavy components

12. **Dependency Consolidation**
    - Audit if both `axios` and native `fetch` are needed
    - Consolidate state management (xstate vs React Query vs local)

---

## 11. AUDIT SUMMARY MATRIX

| Category | Critical | Warning | Info |
|----------|----------|---------|------|
| Security | 14 high vulns | 3 moderate | 2 low |
| Updates | 15 major behind | 15 minor/patch | - |
| Size | pdfkit, openai client | lucide-react (34MB) | - |
| Unused | - | 15+ potential | - |
| Licenses | - | - | All compliant |
| Peers | 5 missing | 4 optional missing | - |

---

## 12. PRIORITY ACTION CHECKLIST

- [ ] Fix 14 high-severity security vulnerabilities
- [ ] Install 5 missing peer dependencies for ESLint
- [ ] Run `npm dedupe` to reduce duplicate packages
- [ ] Remove extraneous packages (@emnapi/runtime)
- [ ] Fix invalid @swc/helpers version
- [ ] Update @sentry/vite-plugin to v0.4.0
- [ ] Run `npm update` for patch/minor updates
- [ ] Clean duplicate dependencies in package.json
- [ ] Verify tree-shaking for lucide-react
- [ ] Plan React 19 + React Router 7 migration
- [ ] Verify server-only packages aren't client-bundled
- [ ] Consider removing or updating typedoc

---

## Appendix A: Full Dependency Tree Stats

```
Total Dependencies:      1,430
├── Production:            607
├── Development:           682
├── Peer:                   43
└── Optional:              165

Node Modules Size:       ~2.1 GB
Node Modules Packages:     759

Import Statements Found:
├── TypeScript (.ts):    1,321
├── TSX (.tsx):          1,517
└── Total:               2,838
```

## Appendix B: Dependency Health Score

| Metric | Score | Weight | Weighted |
|--------|-------|--------|----------|
| Security | 40/100 | 30% | 12 |
| Up-to-date | 60/100 | 25% | 15 |
| Bundle Size | 70/100 | 20% | 14 |
| License | 95/100 | 15% | 14.25 |
| Maintenance | 80/100 | 10% | 8 |
| **Overall** | - | 100% | **63.25/100** |

**Grade: D+ (Needs Improvement)**

---

*Report generated by AI Agent on 2026-02-20*
*Next audit recommended: After security fixes applied*
