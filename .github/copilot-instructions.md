You are assisting in a Next.js + TypeScript project.

Hard rules:
- Do NOT add new dependencies unless explicitly requested.
- Do NOT invent imports. Only import from files or packages that already exist.
- Prefer minimal diffs. Modify the smallest number of files possible.
- All code must pass `npm run typecheck`.
- ESLint is enabled; respect existing rules.
- If a file path is not provided, ask before editing.
- Do not refactor unrelated code.

Output:
- Prefer unified diffs when modifying existing files.
- Be explicit when creating new files.

Checklist trigger is STRICT: run the conditional checklist if ANY is true:

config/pipelines changes, >2 files, docs-vs-code contradiction, ambiguous task ("optimize/clean/refactor"), or repeated loop in this session.

When checklist triggers, output ONLY the 5-line checklist format and STOP for confirmation.

