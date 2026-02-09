# DOCTORMX EXECUTION PLAN (Simplified)
## Direct File Editing with Clear Ownership Boundaries

> **Date:** 2026-02-09
> **Council Approval:** APPROVED WITH CONDITIONS (Quality > Time/Effort)
> **Quality Standard:** Stripe-level excellence, patient safety first
> **Approach:** Direct file editing, parallel specialist agents, task tracking with dependencies

---

## WHY SIMPLIFIED?

Git worktrees and PR workflows are overkill for AI execution. We keep:
- ✅ File ownership boundaries (prevent conflicts)
- ✅ Task tracking with dependencies
- ✅ Council evaluation framework
- ✅ Quality gates checklist

We drop:
- ❌ Git worktrees (unnecessary complexity)
- ❌ PR/merge workflow (direct editing instead)

---

## SPECIALIST ROLES (No Worktrees - Just Mental Boundaries)

| Role | Files Owned | Responsibilities |
|------|-------------|------------------|
| **Frontend Specialist** | `src/components/`, `src/app/` (not `/api`), `public/` | UI/UX, components, pages, mobile, accessibility |
| **Backend Specialist** | `src/lib/`, `src/app/api/`, `src/hooks/` | Business logic, APIs, integrations, services |
| **Database Specialist** | `supabase/`, `src/lib/supabase/`, `src/lib/auth.ts`, `tests/`, config files | Schema, migrations, tests, infrastructure |
| **AI/ML Specialist** | `src/lib/ai/`, clinical AI components | AI features, prompts, LLMs, triage logic |
| **Coordinator** | All (orchestration) | Task assignment, coordination, quality review |

---

## PARALLEL EXECUTION STRATEGY

**How parallel execution works:**
1. Launch multiple specialist agents simultaneously using Task tool
2. Each agent works on their assigned tasks/files
3. Coordinator (me) reviews and integrates results
4. Dependencies block tasks until prerequisites complete

**Example parallel launch:**
```
Task: Frontend Specialist → Fix console statements in components
Task: Backend Specialist → Fix console statements in lib
Task: AI/ML Specialist → Replace any types in AI code
```

All run in parallel. No git conflicts because files don't overlap.

---

## PHASE 0: FOUNDATION CLEANUP (1-2 weeks) ⏳ IN PROGRESS

**Status:** 3/10 tasks complete | **Blocker:** F001 (needs user action)

| Task ID | Assignee | File | Effort | Priority | Status |
|---------|----------|------|--------|----------|--------|
| F001 | **USER** | .env | 4h | CRITICAL | ⏳ User Action Needed |
| F002 | Backend | `src/lib/ai/adaptive-questionnaire/service.ts` | 8h | CRITICAL | ✅ Complete |
| F003 | Backend | `src/app/api/ai/vision/analyze/route.ts` | 4h | CRITICAL | 🔄 Ready to Start |
| F004 | Frontend | `src/app/doctor/[specialty]/*/page.tsx` | 4h | CRITICAL | ✅ Complete |
| F005 | Frontend | `src/components/PatientLayout.tsx` | 4h | CRITICAL | ✅ Complete |
| D001 | Database | `src/app/api/__tests__/webhooks/*.test.ts` | 16h | CRITICAL | Ready to Start |
| D002 | Database | `src/lib/video/__tests__/videoService.test.ts` | 8h | CRITICAL | Ready to Start |
| D003 | AI/ML | `src/app/api/__tests__/ai/consult-emergency.test.ts` | 8h | CRITICAL | Ready to Start |
| T001 | Backend+AI | Multiple files with `any` | 16h | HIGH | Ready to Start |
| T002 | Database | `supabase/migrations/` | 4h | HIGH | Ready to Start |

---

## PHASE 1: CORE SUPERIORITY (3-4 weeks)

**Status:** Not started | **Blockers:** Phase 0 complete

| Task ID | Assignee | Focus | Effort | Priority |
|---------|----------|-------|--------|----------|
| C001 | All | Replace console with logger | 8h | HIGH |
| C002 | Backend | Extract constants | 4h | HIGH |
| P001 | Backend | Parallelize analytics | 4h | HIGH |
| P002 | Backend | Fix N+1 chat query | 4h | HIGH |
| P003 | AI/ML | Vision caching | 4h | HIGH |
| UX001 | Frontend | User-friendly errors | 8h | HIGH |
| UX002 | Frontend | Success feedback | 4h | HIGH |
| UX003 | Frontend+Backend | Video fallback | 8h | HIGH |
| UX004 | Frontend | Doctor queue display | 4h | HIGH |
| D004 | Database | Auth integration tests | 8h | HIGH |
| D005 | Database | Prescription PDF tests | 8h | HIGH |
| COMP001 | Coordinator | Privacy notice | 4h | HIGH |
| COMP002 | Frontend+Backend | Consent mechanisms | 8h | HIGH |

---

## PHASE 2: ADVANCED EXCELLENCE (2-3 weeks)

**Status:** Not started | **Blockers:** Phase 1 complete

| Task ID | Assignee | Focus | Effort | Priority |
|---------|----------|-------|--------|----------|
| A001 | Backend | Standard error format | 8h | MEDIUM |
| A002 | Backend | VideoProvider interface | 8h | MEDIUM |
| A003 | AI/ML | AI factory pattern | 8h | MEDIUM |
| Q001 | Frontend | Dark mode | 4h | MEDIUM |
| Q002 | Frontend | Keyboard navigation | 8h | MEDIUM |
| Q003 | All | JSDoc documentation | 8h | MEDIUM |
| V001 | Database | Full test suite | 4h | HIGH |
| V002 | Coordinator | Security audit | 8h | HIGH |
| V003 | Backend | Performance benchmarks | 4h | HIGH |

---

## COORDINATION PROTOCOL (Simplified)

### Task Assignment
1. Coordinator assigns task to specialist
2. Specialist marks task "in_progress"
3. Specialist works directly on files (no PRs)
4. Specialist marks "completed" when done
5. Coordinator reviews and may request changes
6. Task fully complete when approved

### Dependencies
```
Task A (Frontend) ──depends on──> Task B (Database)

Frontend waits for Database to complete.
Coordinator unblocks Frontend when Database done.
```

### Quality Gates (Every Task Must Pass)
- [ ] No console.log in production code
- [ ] Proper error handling (Result type or try-catch)
- [ ] Type-safe (no `any` in critical paths)
- [ ] Mobile responsive tested
- [ ] Accessibility reviewed (ARIA, keyboard)
- [ ] Tests written (70%+ coverage for critical paths)
- [ ] JSDoc on complex functions (>20 lines)
- [ ] No magic numbers (use constants)
- [ ] Healthcare security verified (if applicable)

---

## COUNCIL FRAMEWORK (Keep)

For major decisions, get 4 perspectives:
- **Visionary:** Market fit, strategic alignment
- **Skeptic:** Risks, challenges, what could go wrong
- **Optimizer:** Efficiency, ROI, prioritization
- **Craftsperson:** Quality, best practices, technical excellence

---

## EXECUTION COMMANDS

### For Coordinator (me):
```bash
# Launch parallel specialists
Task → Frontend Specialist: "Fix console statements in components"
Task → Backend Specialist: "Fix console statements in lib"
Task → AI/ML Specialist: "Replace any types in AI code"

# All run in parallel, report back when done
```

### For Specialists:
```bash
# Work directly on assigned files
# Mark task in_progress when starting
# Mark completed when done (after self-check)
# Notify coordinator: "Task X complete, ready for review"
```

---

## SUCCESS METRICS

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Test coverage | <20% | 70%+ | 🔴 Not started |
| Console statements | 327 | 0 | 🟡 In progress (0% → ~10%) |
| `any` types (critical) | 15 | 0 | 🔴 Not started |
| Critical vulnerabilities | 6 | 0 | 🟡 3 fixed, 3 remain |
| Mobile usability | Broken | 100% | 🟢 Fixed |
| N+1 queries | 5+ | 0 | 🔴 Not started |

---

## ESTIMATED TIMELINE

- **Phase 0:** 1-2 weeks (BLOCKER for production)
- **Phase 1:** 3-4 weeks (Core superiority)
- **Phase 2:** 2-3 weeks (Advanced excellence)
- **Total to Production-Ready:** 6-9 weeks

**Remember:** Quality is the priority. Patient safety depends on technical excellence.

---

*Document Version: 2.0 (Simplified)*
*Last Updated: 2026-02-09*
*Council Approved: YES (Unanimous)*
