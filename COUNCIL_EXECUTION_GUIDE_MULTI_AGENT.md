# 🚀 COUNCIL EXECUTION GUIDE - MULTI-AGENT PARALLEL FLOWS
## DoctorMX: Zero-Error Parallel Execution Protocol

**Document Purpose:** Guide for executing the Council-approved plan with multiple subagents working in parallel flows, ensuring zero errors, zero loose ends, and zero inconsistencies.

---

## 📋 EXECUTION PHILOSOPHY

```
┌─────────────────────────────────────────────────────────────────┐
│  ZERO-TOLERANCE PRINCIPLES                                      │
├─────────────────────────────────────────────────────────────────┤
│  1. Every subagent output is verified by another subagent       │
│  2. No phase is "complete" until independently validated        │
│  3. Cross-flow changes are reviewed by both flows before merge  │
│  4. Conflicts are resolved BEFORE they reach integration        │
│  5. Documentation is written BEFORE code is considered done     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ MULTI-AGENT ARCHITECTURE

### Flow Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    COORDINATOR (You)                            │
│         ┌─────────────────┬─────────────────┐                  │
│         │                 │                 │                  │
│    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐              │
│    │ Flow A  │      │ Flow B  │      │ Verifier│              │
│    │ Backend │      │ Frontend│      │ Cross   │              │
│    │ Team    │      │ Team    │      │ Check   │              │
│    └───┬─────┘      └───┬─────┘      └────┬────┘              │
│        │                │                 │                    │
│   ┌────┴────┐      ┌────┴────┐           │                    │
│   │A1-A2-A3 │      │B1-B2-B3 │           │                    │
│   │Subagents│      │Subagents│           │                    │
│   └─────────┘      └─────────┘           │                    │
└─────────────────────────────────────────────────────────────────┘
```

### Agent Roles

| Role | Responsibility | Output Verification |
|------|---------------|---------------------|
| **Coordinator** | Orchestrate, delegate, verify, resolve conflicts | Final approval |
| **Flow A Lead** | Backend infrastructure, security, APIs | Verified by Flow B + Cross-Verifier |
| **Flow B Lead** | Frontend components, UI/UX, testing | Verified by Flow A + Cross-Verifier |
| **Cross-Verifier** | Validate no conflicts, test integration points | Independent validation report |
| **Specialist Agents** | Execute specific tasks within flows | Peer-reviewed within flow |

---

## 🔄 PARALLEL FLOW COORDINATION

### Communication Protocol

```
DAILY RHYTHM:

09:00 - FLOW STANDUP (Async written report)
   ├── Flow A Lead reports:
   │   ├── Files modified today
   │   ├── Shared files touched (if any)
   │   ├── Blockers or needs from Flow B
   │   └── API contracts changes
   └── Flow B Lead reports:
       ├── Components modified today
       ├── Shared files touched (if any)
       ├── Blockers or needs from Flow A
       └── Mock API drift detected (if any)

12:00 - CONFLICT CHECK (Coordinator review)
   └── Review git diffs, identify overlaps

17:00 - SYNC MEETING (If conflicts detected)
   └── Resolve before end of day

WEEKLY RHYTHM:

Friday 16:00 - INTEGRATION PREP
   ├── Cross-Verifier reviews both flows
   ├── Identifies integration risks
   └── Creates integration test plan
```

### Shared Resource Protocol

```typescript
// For ANY file in SHARED ZONES (src/types/, src/lib/errors/, src/lib/utils/):

// 1. BEFORE modifying, create NOTIFICATION:
//    File: .shared-changes-notify.md

## Notification: Shared File Change
**File:** src/types/database.ts
**Proposed by:** Flow A
**Change:** Add 'version' column to appointments
**Impact on Flow B:** May affect AppointmentCard props
**Review by:** Flow B Lead
**Approval needed before:** Tomorrow 10:00

// 2. Flow B reviews and approves/rejects

// 3. Only after approval, make change

// 4. Both flows update immediately after merge
```

---

## 📅 WEEK-BY-WEEK MULTI-AGENT EXECUTION

---

## WEEK 0: RISK HARDENING SPRINT

### Objective
Prepare foundation for zero-error parallel execution.

### Parallel Subagent Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│ WEEK 0 SUBAGENT ASSIGNMENTS                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  AGENT 1: Database Safety                                        │
│  ├─ Task: Create verified backup of production DB               │
│  ├─ Task: Test restore procedure                                │
│  ├─ Task: Document rollback scripts                             │
│  └─ Output: backup-verified.md + rollback-scripts/              │
│                                                                 │
│  AGENT 2: Schema Hardening (Flow A)                             │
│  ├─ Task: Add UNIQUE constraint for booking slots               │
│  ├─ Task: Create reserve_slot_atomic RPC                        │
│  ├─ Task: Verify all RLS policies                               │
│  └─ Output: migrations/ + verification-report.md                │
│                                                                 │
│  AGENT 3: Code Cleanup (Flow B)                                 │
│  ├─ Task: Find and delete ALL .bak files                        │
│  ├─ Task: Find and eliminate ALL TODO/FIXME                     │
│  ├─ Task: Create tickets for legitimate TODOs                   │
│  └─ Output: cleanup-report.md + tickets-created.md              │
│                                                                 │
│  AGENT 4: Security Infrastructure                               │
│  ├─ Task: Setup feature flag infrastructure                     │
│  ├─ Task: Configure security headers middleware                 │
│  ├─ Task: Setup audit logging tables                            │
│  └─ Output: security-config/ + setup-guide.md                   │
│                                                                 │
│  AGENT 5: Quality Gates Setup                                   │
│  ├─ Task: Configure lint-staged with zero warnings              │
│  ├─ Task: Setup pre-commit hooks                                │
│  ├─ Task: Create coverage enforcement                           │
│  └─ Output: .lintstagedrc.json + quality-gates.md               │
│                                                                 │
│  AGENT 6: Legal/Compliance                                      │
│  ├─ Task: Implement medical disclaimer                          │
│  ├─ Task: Create patient acknowledgment flow                    │
│  ├─ Task: Draft HIPAA compliance checklist                      │
│  └─ Output: legal/ + compliance-checklist.md                    │
│                                                                 │
│  CROSS-VERIFIER (AGENT 7):                                      │
│  ├─ Task: Verify all Week 0 deliverables                        │
│  ├─ Task: Test backup/restore actually works                    │
│  ├─ Task: Validate no .bak files remain                         │
│  └─ Output: week0-validation-report.md                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Week 0 Verification Protocol

```markdown
## WEEK 0 EXIT VERIFICATION (MANDATORY)

### Verification by Cross-Verifier:

□ AGENT 1 Verification:
  - [ ] Backup created: _______________
  - [ ] Restore tested successfully
  - [ ] Rollback scripts exist and are executable
  - [ ] Documentation complete
  
□ AGENT 2 Verification:
  - [ ] UNIQUE constraint in schema
  - [ ] RPC function created and tested
  - [ ] All RLS policies verified with test queries
  - [ ] Migration is reversible
  
□ AGENT 3 Verification:
  - [ ] `find . -name "*.bak" -o -name "*.bak2"` returns 0 results
  - [ ] `grep -r "TODO\|FIXME" src/ --include="*.ts" --include="*.tsx"` returns 0 results
  - [ ] Tickets created for legitimate items
  
□ AGENT 4 Verification:
  - [ ] Feature flags operational
  - [ ] Security headers present in responses
  - [ ] Audit logging captures required events
  
□ AGENT 5 Verification:
  - [ ] Pre-commit hooks block commits with warnings
  - [ ] CI/CD enforces coverage thresholds
  - [ ] Naming convention lint rules active
  
□ AGENT 6 Verification:
  - [ ] Disclaimer shown to users
  - [ ] Acknowledgment tracked in database
  - [ ] HIPAA checklist complete

□ COORDINATOR FINAL CHECK:
  - [ ] All verifications passed
  - [ ] No blocking issues
  - [ ] Week 1 can begin
```

---

## WEEKS 1-5: PARALLEL EXECUTION

### Week 1: Survival Phase

#### Flow A - Backend Survival (Subagents A1-A4)

```
┌─────────────────────────────────────────────────────────────────┐
│ FLOW A - WEEK 1: BACKEND SURVIVAL                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  AGENT A1: Syntax Error Exterminator                            │
│  ├─ Task: Fix all .doctores syntax errors                       │
│  ├─ Task: Fix database.ts:445 error                             │
│  ├─ Task: Fix patient/appointments route query                  │
│  ├─ Task: Fix arco/escalation.ts syntax                         │
│  ├─ Task: Run grep for all ".doctores" patterns                │
│  ├─ Task: Verify build passes                                   │
│  └─ Output: syntax-fixes-report.md                              │
│                                                                 │
│  AGENT A2: RLS Policy Enforcer                                  │
│  ├─ Task: Add INSERT policy to payments                         │
│  ├─ Task: Add policies to whatsapp_sessions                     │
│  ├─ Task: Verify all tables have RLS                            │
│  ├─ Task: Create RLS test suite                                 │
│  └─ Output: rls-policies.sql + rls-tests/                       │
│                                                                 │
│  AGENT A3: Metadata Standardizer                                │
│  ├─ Task: Convert all payment metadata to snake_case            │
│  ├─ Task: Update all webhook handlers                           │
│  ├─ Task: Add stripe_payment_intent_id field                    │
│  ├─ Task: Test webhook processing end-to-end                    │
│  └─ Output: metadata-fixes.md + webhook-tests/                  │
│                                                                 │
│  AGENT A4: IDOR Eliminator                                      │
│  ├─ Task: Add ownership validation to create-payment-intent     │
│  ├─ Task: Add security event logging                            │
│  ├─ Task: Test IDOR prevention (User A can't access User B)     │
│  └─ Output: idor-fixes.md + security-tests/                     │
│                                                                 │
│  FLOW A VERIFIER (AGENT A5):                                    │
│  ├─ Task: Review all A1-A4 outputs                              │
│  ├─ Task: Run full test suite                                   │
│  ├─ Task: Verify no regressions                                 │
│  └─ Output: flow-a-week1-verification.md                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Flow B - Frontend Survival (Subagents B1-B4)

```
┌─────────────────────────────────────────────────────────────────┐
│ FLOW B - WEEK 1: FRONTEND SURVIVAL                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  AGENT B1: Link Repair Specialist                               │
│  ├─ Task: Fix all broken links (href=".doctores")              │
│  ├─ Task: Run link checker across all pages                     │
│  ├─ Task: Verify navigation works end-to-end                    │
│  └─ Output: link-fixes.md                                       │
│                                                                 │
│  AGENT B2: Skeleton Consolidator                                │
│  ├─ Task: Eliminate duplicate Skeleton components               │
│  ├─ Task: Migrate all usages to ui/skeleton                     │
│  ├─ Task: Add missing variants                                  │
│  └─ Output: skeleton-consolidation.md                           │
│                                                                 │
│  AGENT B3: Error Page Unifier                                   │
│  ├─ Task: Create reusable ErrorPage component                   │
│  ├─ Task: Replace 71 error.tsx with wrappers                    │
│  ├─ Task: Test all error scenarios                              │
│  └─ Output: error-page-refactor.md                              │
│                                                                 │
│  AGENT B4: Duplicate Eliminator                                 │
│  ├─ Task: Merge appointment page duplicates                     │
│  ├─ Task: Set up redirects                                      │
│  ├─ Task: Verify no 404s from old URLs                          │
│  └─ Output: duplicate-cleanup.md                                │
│                                                                 │
│  FLOW B VERIFIER (AGENT B5):                                    │
│  ├─ Task: Review all B1-B4 outputs                              │
│  ├─ Task: Run visual regression tests                           │
│  ├─ Task: Verify mobile navigation works                        │
│  └─ Output: flow-b-week1-verification.md                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Cross-Flow Verification (Week 1)

```
CROSS-VERIFIER AGENTS (C1-C3):

AGENT C1: Integration Point Validator
├─ Check: Flow A APIs don't break Flow B components
├─ Check: Type changes in Flow A propagated to Flow B
├─ Check: Error handling consistent between flows
└─ Output: integration-check-week1.md

AGENT C2: Quality Gate Enforcer
├─ Check: All syntax fixes verified with build
├─ Check: No console.log introduced
├─ Check: Test coverage maintained or improved
└─ Output: quality-gate-week1.md

AGENT C3: Conflict Detector
├─ Check: No file modified by both flows
├─ Check: Shared files have proper notifications
├─ Check: Git history shows clean separation
└─ Output: conflict-report-week1.md
```

### Week 1 Exit Verification

```markdown
## WEEK 1 EXIT VERIFICATION

### Flow A Verification (by Coordinator + Verifiers):
□ AGENT A1:
  - [ ] `npm run build` passes with 0 errors
  - [ ] `grep -r "\.doctores" src/` returns 0 results
  - [ ] All syntax errors fixed
  
□ AGENT A2:
  - [ ] payments table has INSERT policy
  - [ ] whatsapp_sessions has proper policies
  - [ ] RLS tests pass
  
□ AGENT A3:
  - [ ] Webhooks can read metadata
  - [ ] stripe_payment_intent_id field exists
  - [ ] Payment flow tested end-to-end
  
□ AGENT A4:
  - [ ] User A cannot pay for User B's appointment
  - [ ] Security events logged
  - [ ] IDOR tests pass

### Flow B Verification (by Coordinator + Verifiers):
□ AGENT B1:
  - [ ] No broken links (automated scan)
  - [ ] Navigation flows work
  
□ AGENT B2:
  - [ ] Single skeleton system
  - [ ] No duplicate Skeleton imports
  
□ AGENT B3:
  - [ ] 71 error.tsx use single component
  - [ ] All error scenarios render correctly
  
□ AGENT B4:
  - [ ] Single appointment page
  - [ ] Redirects work
  - [ ] No 404s from old URLs

### Cross-Flow Verification:
□ AGENT C1:
  - [ ] Flow B can call Flow A APIs
  - [ ] Types are compatible
  
□ AGENT C2:
  - [ ] 0 console.log in new code
  - [ ] Test coverage > 5.6% (baseline)
  
□ AGENT C3:
  - [ ] No file conflicts
  - [ ] Git history clean
```

---

## VERIFICATION PROTOCOL FOR ALL PHASES

### Subagent Output Verification Template

```markdown
## SUBAGENT OUTPUT VERIFICATION

### Agent: [NAME]
### Task: [DESCRIPTION]
### Output Files: [LIST]

#### Verification by Peer Agent:

□ CODE REVIEW:
  - [ ] Follows naming conventions
  - [ ] No TypeScript errors
  - [ ] No ESLint warnings
  - [ ] Properly documented (JSDoc)
  
□ TESTING:
  - [ ] Unit tests pass
  - [ ] Edge cases covered
  - [ ] No "skip" or "only" in tests
  
□ INTEGRATION:
  - [ ] Doesn't break existing functionality
  - [ ] Compatible with other subagent outputs
  - [ ] Shared files properly handled
  
□ DOCUMENTATION:
  - [ ] README updated if needed
  - [ ] API documentation updated
  - [ ] Architecture Decision Record if architectural

#### Verification Sign-off:
Peer Reviewer: _______________
Date: _______________
Status: [PASS / NEEDS_REVISION]

If NEEDS_REVISION:
- Issues found:
- Required changes:
- Re-verification needed: [YES/NO]
```

### Coordinator Re-Verification Steps

```markdown
## COORDINATOR RE-VERIFICATION CHECKLIST

For EVERY phase completion:

□ STEP 1: Automated Verification
  - Run: `npm run build`
  - Run: `npm run test`
  - Run: `npm run lint`
  - Run: `npm run typecheck`
  - All must pass with 0 errors/warnings

□ STEP 2: Subagent Output Review
  - Review all output files from subagents
  - Verify against task requirements
  - Check for completeness

□ STEP 3: Cross-Agent Consistency
  - Verify no contradictions between agents
  - Check naming conventions consistent
  - Validate shared resources coordinated

□ STEP 4: Integration Testing
  - Run integration tests if available
  - Test critical user journeys
  - Verify no regressions

□ STEP 5: Documentation Review
  - Check all outputs are documented
  - Verify ADRs created for architectural decisions
  - Confirm no undocumented changes

□ STEP 6: Git Hygiene
  - Review git diff for unexpected changes
  - Ensure clean commit history
  - Verify no secrets or .env files committed

□ STEP 7: Final Approval
  - Sign off on phase completion
  - Authorize next phase to begin
  - Document any technical debt created
```

---

## CONFLICT PREVENTION & RESOLUTION

### Pre-Conflict Detection System

```
AUTOMATED DAILY SCANS:

Scan 1: File Overlap Detection
├─ Command: git diff --name-only feature/flow-a feature/flow-b
├─ Alert if: Any file appears in both diffs
└─ Action: Immediate notification to Coordinator

Scan 2: Shared File Change Detection
├─ Monitor: src/types/*, src/lib/errors/*, src/lib/utils/*
├─ Alert if: Modified by either flow
└─ Action: Require explicit approval before merge

Scan 3: API Contract Drift Detection
├─ Compare: Flow A API responses vs Flow B mocks
├─ Alert if: Divergence detected
└─ Action: Schedule sync meeting
```

### Conflict Resolution Protocol

```markdown
## CONFLICT RESOLUTION WORKFLOW

### Level 1: Automated Detection
When overlap detected:
1. STOP both flows immediately
2. Coordinator receives alert
3. Both leads notified

### Level 2: Impact Assessment
Within 1 hour:
1. Coordinator identifies scope of conflict
2. Determine: Is this a real conflict or intentional coordination?
3. If intentional → Document and approve
4. If conflict → Proceed to resolution

### Level 3: Resolution Options

Option A: Serialization (Use when: Both changes needed)
├─ Flow A makes change first
├─ Flow B updates, then makes their change
└─ Timeline extended by 1 day

Option B: Refactoring (Use when: Better architecture possible)
├─ Identify abstraction that eliminates conflict
├─ Create shared component/service
└─ Both flows use abstraction

Option C: Scope Adjustment (Use when: One change more critical)
├─ Defer lower priority change
├─ Document deferred work
└─ Proceed with critical change

### Level 4: Documentation
After resolution:
1. Document decision in PROJECT.md > Decisions
2. Update ADR if architectural
3. Notify both teams of resolution
4. Resume flows with clear understanding
```

---

## ZERO-ERROR CHECKLIST PER PHASE

### Universal Checklist (Every Phase)

```markdown
## PHASE COMPLETION - ZERO ERROR CHECKLIST

### Code Quality
□ 0 TypeScript errors (`tsc --noEmit`)
□ 0 ESLint warnings (`eslint --max-warnings=0`)
□ 0 console.log statements
□ 0 TODO/FIXME comments (in code - tickets created)
□ 0 .bak or temporary files
□ All functions have explicit return types
□ All public APIs documented with JSDoc

### Testing
□ All new code has corresponding tests
□ All tests pass (0 failures)
□ No skipped tests (.skip, .only)
□ Coverage meets phase target
□ Integration tests pass

### Architecture
□ No duplicated logic (DRY principle)
□ Proper abstraction layers
□ Shared resources properly coordinated
□ API contracts honored
□ No circular dependencies

### Security
□ No secrets in code
□ RLS policies tested
□ Input validation in place
□ No SQL injection vulnerabilities
□ No XSS vulnerabilities

### Documentation
□ README updated (if needed)
□ API docs updated (if needed)
□ ADR created (for architectural changes)
□ CHANGELOG updated

### Integration
□ Flow A and Flow B changes don't conflict
□ Shared files properly handled
□ Mock APIs match real APIs
□ Cross-flow communication established

### Git Hygiene
□ Clean commit history
□ Descriptive commit messages
□ No merge conflicts
□ All changes in appropriate branch
```

---

## CONTINUOUS VERIFICATION SUBAGENTS

### Running Throughout All Phases

```
AGENT CV1: Consistency Guardian (Runs continuously)
├─ Task: Daily scan for naming inconsistencies
├─ Task: Check for code pattern violations
├─ Task: Verify design token usage
└─ Output: daily-consistency-report.md

AGENT CV2: Test Coverage Monitor (Runs after each commit)
├─ Task: Track coverage trends
├─ Task: Alert if coverage drops
├─ Task: Identify untested critical paths
└─ Output: coverage-alert.md (if issues)

AGENT CV3: Security Scanner (Runs daily)
├─ Task: Scan for secrets accidentally committed
├─ Task: Check for new vulnerabilities (npm audit)
├─ Task: Verify RLS policies still effective
└─ Output: security-scan-report.md

AGENT CV4: Performance Watcher (Runs weekly)
├─ Task: Track bundle size
├─ Task: Monitor build times
├─ Task: Check for performance regressions
└─ Output: performance-report.md

AGENT CV5: Documentation Drift Detector (Runs weekly)
├─ Task: Check if code and docs are in sync
├─ Task: Verify ADRs are current
├─ Task: Check for undocumented features
└─ Output: documentation-drift-report.md
```

---

## FINAL INTEGRATION PROTOCOL (Week 6)

### Multi-Agent Integration Testing

```
INTEGRATION PHASE - ALL HANDS ON DECK

AGENT I1: API Integration Tester
├─ Task: Test every Flow A API with Flow B components
├─ Task: Verify error handling across boundary
├─ Task: Test authentication flows end-to-end
└─ Output: api-integration-results.md

AGENT I2: E2E Flow Tester
├─ Task: Test complete user journeys
├─ Task: Booking → Payment → Confirmation
├─ Task: AI Consultation → Emergency Detection
├─ Task: Doctor Portal workflows
└─ Output: e2e-test-results.md

AGENT I3: Chaos Engineer
├─ Task: Simulate database failures
├─ Task: Test retry mechanisms
├─ Task: Verify circuit breakers
├─ Task: Test concurrent booking (1000 users)
└─ Output: chaos-engineering-report.md

AGENT I4: Performance Load Tester
├─ Task: Load test with production-like data
├─ Task: Test concurrent user limits
├─ Task: Measure response times under load
├─ Task: Identify bottlenecks
└─ Output: load-test-results.md

AGENT I5: Security Penetration Tester
├─ Task: Attempt IDOR attacks
├─ Task: Test CSRF protection
├─ Task: Attempt SQL injection
├─ Task: Test authentication bypasses
└─ Output: penetration-test-results.md

AGENT I6: Accessibility Auditor
├─ Task: Run axe-core on all pages
├─ Task: Test keyboard navigation
├─ Task: Verify screen reader compatibility
├─ Task: Check color contrast
└─ Output: accessibility-audit-results.md

COORDINATOR: Final Integration Sign-off
├─ Review all I1-I6 outputs
├─ Determine if system is production-ready
├─ Authorize or reject Week 7 launch
└─ Output: integration-final-verdict.md
```

---

## SUCCESS METRICS

### Phase Completion Criteria

```markdown
## PHASE COMPLETION SCORECARD

For each phase to be considered COMPLETE:

□ All subagent outputs verified by peer (100%)
□ All subagent outputs re-verified by Coordinator (100%)
□ All quality gates pass (0 failures)
□ Cross-flow verification passes (0 conflicts)
□ Integration tests pass (100%)
□ Documentation complete (100%)
□ Zero P0 or P1 bugs open
□ Technical debt tracked and ticketed (if any)

Phase Score: _____/100
Minimum to proceed: 95/100
```

---

## DOCUMENT CONTROL

```
Document: COUNCIL_EXECUTION_GUIDE_MULTI_AGENT.md
Version: 1.0
Status: APPROVED FOR EXECUTION
Council Review Date: 2026-02-16
Next Review: End of Week 0

Owner: Coordinator (You)
Distribution: All Subagents, Flow Leads, Cross-Verifiers
```

---

**This guide ensures zero errors, zero loose ends, and zero inconsistencies through systematic multi-agent execution with comprehensive verification at every step.**
