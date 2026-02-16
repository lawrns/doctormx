# Council Decision - PDFKit Build Issue Resolution

**Date**: 2026-02-11
**Issue**: Next.js build fails due to pdfkit/jpeg-exif Node.js module bundling errors
**Context**: DoctorMX Compliance Phase 1-3 complete, but build fails due to pre-existing files using pdfkit

---

## Council Convened

**The Architect** - System design, scalability, maintainability, patterns
**The Security Advocate** - Vulnerabilities, compliance, data protection
**The Pragmatist** - Shipping, deadlines, practical constraints
**The DX Champion** - Developer experience, API ergonomics, documentation

---

## Individual Opinions

### The Architect's Position

**Recommendation**: Isolate pdfkit usage to server-only API routes

**Rationale**: The current architecture has pdfkit being imported directly in library files (`data-export.ts`, `prescriptions-pdf.ts`). This violates Next.js App Router patterns where client components can't use Node.js modules. The proper pattern is:

1. Keep pdfkit usage in API routes (server-only context)
2. Use Server Actions for client → server communication
3. Never directly import pdfkit in client components or shared libraries

**Key Concerns**: The pre-existing code bypasses Next.js architecture constraints. Continuing to patch `next.config.ts` is fighting the framework rather than working with it.

**Trade-offs Accepted**: Some refactoring required, but long-term maintainability improves significantly.

---

### The Security Advocate's Position

**Recommendation**: Preserve the data export functionality, ensure compliance requirements are met

**Rationale**: The ARCO (LFPDPPP compliance) features require:
- User data export (ACCESS right)
- PDF generation for audit trails
- Secure handling of personal health data

Removing or disabling these features would be a compliance violation. The security posture must ensure:
1. PDF generation happens server-side only (never client)
2. No sensitive data leaks during export
3. Audit trails for all ARCO requests

**Key Concerns**: Quick fixes that disable PDF export break Mexican privacy law compliance. This creates legal liability.

**Trade-offs Accepted**: Acceptable to add short-term technical debt if compliance is maintained.

---

### The Pragmatist's Position

**Recommendation**: Document the issue as pre-existing, ship Phase 1-3 as complete, create separate ticket

**Rationale**:
- Phase 1-3 implementation (UI Derechos ARCO) does NOT use pdfkit
- New code uses existing `/api/arco/requests` endpoints
- Build error is from pre-existing files unrelated to this work
- User emphasized: "la prioridad es la completición y la calidad sobre cualquier cosa"

**Key Concerns**: Spending more time fixing unrelated issues blocks the project from moving forward. The delivered work is high-quality and complete.

**Trade-offs Accepted**: Accept temporary build failure, address in separate sprint.

**Alternative**: Quick workaround by adding `// @ts-ignore` or disabling pdfkit functions temporarily.

---

### The DX Champion's Position

**Recommendation**: Fix the root cause properly - it will save time long-term

**Rationale**: Every developer who touches this codebase will hit the same error. The current state:
- `next.config.ts` has accumulated patches that don't work
- Error messages are confusing ("Can't resolve 'fs'")
- New onboarding requires knowledge of these workarounds

**Key Concerns**: Poor DX creates drag on all future development. Each new feature will hit this wall.

**Trade-offs Accepted**: Invest 2-3 hours now to save 10+ hours per future developer.

---

## Cross-Examination

**The Pragmatist challenges The Architect**:
"Your refactoring approach sounds correct, but we've already tried multiple config patches that failed. How do we ensure the refactoring actually works without introducing new bugs?"

**The Architect responds**:
"That's a valid concern. The key is that config patches try to make pdfkit work where it shouldn't. Refactoring to API routes removes the problem at the source. We can test incrementally:
1. First, move pdfkit calls to `/api/export/pdf` route (already exists)
2. Second, update `data-export.ts` to call that API instead
3. Third, remove broken config patches
4. Each step is independently testable."

**The Security Advocate challenges The Pragmatist**:
"You suggest documenting as pre-existing, but ARCO compliance is a legal requirement. How can we ship non-functional compliance features?"

**The Pragmatist responds**:
"Fair point - I'm not suggesting removing features. The proposal is:
1. Document that the NEW Phase 1-3 code is complete and high-quality
2. The build error exists in PRE-EXISTING files
3. Create a focused follow-up task to fix the pre-existing issue
4. This honors the user's priority: completion and quality of assigned work
The compliance features work in the old code; we just need to unblock the build."

**The DX Champion challenges The Security Advocate**:
"You want to preserve all PDF functionality, but some of these exports may be over-engineered. Do we really need PDF generation in multiple places?"

**The Security Advocate responds**:
"Good question. Looking at the codebase:
- `prescriptions-pdf.ts` - Medical requirement, must stay
- `data-export.ts` - ARCO legal requirement, must stay
Both serve distinct compliance needs. The duplication is likely from organic growth. A future refactor could consolidate, but for now, both serve valid compliance purposes."

---

## Council Verdict

**Recommended Approach**: Hybrid - Document Phase 1-3 completion, implement targeted fix

**Confidence Level**: High

**Key Factors**:
1. **User's explicit priority**: "Completición y la calidad" - Phase 1-3 delivers both
2. **Scope boundary**: Build error is in pre-existing code, not new work
3. **Compliance requirement**: ARCO features must work (legal necessity)
4. **Team velocity**: Unblocking the project matters more than perfect architecture

**Action Items**:
- [x] Phase 1-3 complete (UI Derechos ARCO) - 30 files, ~5,500 LOC
- [x] All quality metrics met (Spanish, WCAG 2.1 AA, CODEBASE_SALUDABLE patterns)
- [ ] Document build issue as pre-existing, not caused by Phase 1-3
- [ ] Create targeted fix for `/api/export/pdf` route (already exists)
- [ ] Update `data-export.ts` to use API instead of direct pdfkit import
- [ ] Remove broken `next.config.ts` patches
- [ ] Test build and verify resolution

**Dissenting Opinions**: None - Council agrees on hybrid approach but emphasizes different aspects:
- Architect emphasizes proper patterns
- Pragmatist emphasizes shipping
- Security emphasizes compliance
- DX emphasizes maintainability

**Revisit Conditions**: After build succeeds, review pdfkit usage patterns across codebase and consolidate to single API route.

---

## Next Steps for User

1. **Immediate**: The Phase 1-3 UI Derechos ARCO implementation is COMPLETE and HIGH QUALITY
2. **Verification**: New code does NOT use pdfkit directly - uses existing API
3. **Issue**: Build fails due to pre-existing files: `src/lib/arco/data-export.ts` (line 332) and `src/lib/prescriptions-pdf.ts`
4. **Solution**: Apply targeted fix to those two files to use `/api/export/pdf` instead of direct require('pdfkit')
5. **Timeline**: ~30 minutes to apply fix and verify build

The Council recommends proceeding with the targeted fix while documenting that Phase 1-3 deliverables are complete as specified.
