# Next Actions

## Top Tasks

1. Make `npm run verify` or an equivalent baseline credible.
2. Resolve any baseline failures with minimal, semantics-preserving changes.
3. Document which commands are required for local development versus CI.
4. Audit PHI logging usage before adding logs to clinical/payment flows.
5. Reconcile stale production-readiness docs with current command output.
6. Confirm Supabase migration status before any database work.
7. Review doctor verification/listing behavior before marketplace growth work.
8. Verify payment/webhook appointment confirmation path before checkout changes.
9. Verify video join/access behavior before consultation UX changes.
10. Only after baseline is credible, consider narrow money-path improvements.

## First Narrow Task

Task: make the verification baseline credible without changing product behavior.

Suggested approach:

1. Read `.github/PROCESO_AGENTE.md`, `.github/copilot-instructions.md`, `PRINCIPIOS.md`, `CONFIGURACION.md`, `DECISIONES.md`, and `FLUJOS.md`.
2. Run:

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run test:e2e
```

3. If a command fails, inspect the failure and fix the smallest non-semantic issue.
4. Do not change:
   - booking statuses,
   - payment confirmation,
   - PHI logging behavior,
   - doctor verification policy,
   - prescriptions,
   - video fallback/join behavior,
   - service-role fallback behavior,
   - medical AI boundaries,
   - auth/billing/production integration behavior.
5. Stop and ask if the failure requires touching one of those boundaries.

## Exact Next Prompt

Use this prompt for the next implementation pass:

```text
Work only in /Users/lukatenbosch/Downloads/doctory. Read AI_CONTEXT first, plus .github/PROCESO_AGENTE.md and .github/copilot-instructions.md. Do not modify product semantics, secrets, migrations, deployment, PHI handling, doctor verification policy, booking/payment/prescription/video behavior, service-role fallback behavior, medical AI boundaries, auth, billing, production integrations, or customer data. If worktree is dirty, do not revert or overwrite others' edits.

First task: make the verification baseline credible. Run npm run lint, npm run typecheck, npm run test:coverage, npm run build, and npm run test:e2e, or explain exactly why a command cannot run. If failures occur, fix only the smallest non-semantic test/config/code issue needed to make the baseline meaningful. Stop and ask before touching any protected boundary. Report commands run, failures, fixes, remaining risks, and the exact baseline command recommendation.
```

## Definition Of Done For Baseline Task

- Fresh command output is known for lint/typecheck/coverage/build/e2e.
- Any fixes are minimal and reviewed against protected boundaries.
- `npm run verify` is either passing or its blockers are documented precisely.
- The recommended baseline command is explicit.
- No unrelated worktree changes are reverted.
