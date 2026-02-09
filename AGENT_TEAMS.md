# Doctormx Agent Teams Configuration

> **Last Updated:** 2026-02-09
> **Status:** Active

---

## Overview

This project uses Claude Code Agent Teams for parallel development across different layers. Each teammate operates in its own git worktree to avoid file conflicts and enable independent work.

## Project Structure

```
~/doctormx/
├── .git/                  # Main git repository
├── worktrees/             # Teammate worktrees (nested)
│   ├── frontend/          # Frontend Specialist
│   ├── backend/           # Backend Specialist
│   ├── database/          # Database Specialist
│   └── ai/                # AI/ML Specialist
├── src/                   # Main source files
├── supabase/              # Database files
├── AGENT_TEAMS.md         # This file
└── [other project files]
```

**Why nested?** All worktrees are contained within the main project folder for better organization and easier management.

---

## Team Members

| Role | Worktree | Branch | Responsibilities |
|------|----------|--------|------------------|
| **Coordinator (Lead)** | ~/doctormx | `main` | Orchestration, task breakdown, final integration, git merges |
| **Frontend Specialist** | ~/doctormx/worktrees/frontend | `feature/frontend-work` | UI/UX components, pages, styling, responsive design |
| **Backend Specialist** | ~/doctormx/worktrees/backend | `feature/backend-work` | Business logic, API routes, integrations (Stripe, Supabase) |
| **Database Specialist** | ~/doctormx/worktrees/database | `feature/database-work` | Database schema, migrations, auth, testing, infrastructure |
| **AI/ML Specialist** | ~/doctormx/worktrees/ai | `feature/ai-work` | AI features, prompt engineering, LLM integrations, clinical tools |

---

## File Ownership Matrix

### Frontend Specialist
```
src/components/          # All UI components
src/app/                # All pages EXCEPT /api
  ├── admin/            # Admin dashboard pages
  ├── ai-consulta/      # AI consultation UI
  ├── app/              # Main app pages
  ├── auth/             # Auth pages (login, register)
  ├── book/             # Booking flow pages
  ├── chat/             # Chat UI
  ├── consultation/     # Video consultation UI
  ├── doctor/           # Doctor portal pages
  └── doctors/          # Doctor discovery pages
public/                 # Static assets
```

### Backend Specialist
```
src/lib/                # Business logic modules
  ├── appointments.ts
  ├── availability.ts
  ├── booking.ts
  ├── cache.ts
  ├── chat.ts
  ├── discovery.ts
  ├── doctors.ts
  ├── followup.ts
  ├── notifications.ts
  ├── offline-notes.ts
  ├── patient.ts
  ├── payment.ts
  ├── premium-features.ts
  ├── prescriptions.ts
  ├── rate-limit.ts
  ├── reviews.ts
  ├── subscription.ts
  └── video.ts
src/app/api/            # API routes
src/hooks/              # Custom hooks (if exists)
```

### Database Specialist
```
supabase/               # Database migrations & schema
  ├── migrations/
  └── FULL_SCHEMA.sql
src/lib/supabase/       # Supabase client utilities
src/lib/auth.ts         # Authentication logic
src/lib/validation/     # Input validation schemas
tests/                  # Unit tests (vitest)
e2e/                    # End-to-end tests (playwright)
src/**/__tests__/       # Component tests
Infrastructure configs:
  - next.config.ts
  - vite.config.js
  - tsconfig.json
  - tailwind.config.ts
  - .env.example
```

### AI/ML Specialist
```
src/lib/ai/             # AI business logic
src/lib/openai.ts       # OpenAI integration
src/lib/medical-knowledge/  # Medical knowledge base
src/lib/triage/         # Symptom triage logic
src/lib/soap/           # SOAP note generation
src/app/ai-consulta/    # AI consultation pages
src/app/chat/           # Chat-related pages
src/components/ClinicalCopilot.tsx
src/components/AdaptiveQuestionnaire.tsx
```

---

## Coordination Protocol

### Task Lifecycle

1. **Lead Creates Task**
   - Assigns to specific teammate OR enables self-claim
   - Sets dependencies if needed
   - Task starts as `pending`

2. **Teammate Claims Task**
   - Marks as `in_progress`
   - Works independently in their worktree

3. **Teammate Completes Work**
   - Messages Lead: "Task X complete, ready for review"
   - Waits for approval

4. **Lead Reviews**
   - If approved: marks `completed`
   - If not approved: provides feedback, keeps task `in_progress`

5. **Dependencies Auto-Resolve**
   - When task A completes, tasks blocked by A automatically unblock

### Communication

| Situation | Action |
|-----------|--------|
| **Blocker detected** | Message Lead immediately with description |
| **Cross-layer conflict** | Message both affected teammates + Lead |
| **Architecture question** | Request Council System (per AGENT_INSTRUCTIONS.md) |
| **Ready for review** | Message Lead with summary of changes |

### Git Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                        Git Workflow                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  doctormx/                                                      │
│  ├── .git/ (main)                                              │
│  ├── worktrees/                                                │
│  │   ├── frontend/  → feature/frontend-work                     │
│  │   ├── backend/   → feature/backend-work                      │
│  │   ├── database/  → feature/database-work                     │
│  │   └── ai/        → feature/ai-work                           │
│  └── [source files]                                             │
│                                                                 │
│  Lead handles ALL merges to main                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Rules:**
- Each teammate commits to their feature branch
- Lead reviews and merges to `main`
- No direct pushes to `main` from teammates
- Lead resolves merge conflicts if they occur

---

## Display Mode

**Current:** `in-process`

All teammates run inside the main terminal. Use:
- `Shift+↑/↓` - Cycle through teammates
- `Enter` - View selected teammate's session
- `Escape` - Interrupt current teammate
- `Ctrl+T` - Toggle task list view

---

## Agent Instructions Reference

All teammates follow the universal agent instructions at:
```
C:\Users\danig\AGENT_INSTRUCTIONS.md
```

Project-specific context should be documented in:
```
~/doctormx/PROJECT.md
```

---

## Startup Checklist

When starting a new work session:

1. **Ensure Agent Teams enabled**
   ```bash
   cat ~/.claude/settings.json | grep CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS
   ```

2. **Verify worktrees exist**
   ```bash
   cd ~/doctormx && git worktree list
   ```

3. **Update all worktrees**
   ```bash
   cd ~/doctormx && git pull
   cd worktrees/frontend && git pull
   cd ../backend && git pull
   cd ../database && git pull
   cd ../ai && git pull
   cd ../..
   ```

4. **Start Claude Code with agent teams**
   ```bash
   cd ~/doctormx
   claude  # Agent teams enabled via settings
   ```

---

## Cleanup

To remove the team when done:

1. Shut down all teammates (via Lead)
2. Remove worktrees:
   ```bash
   cd ~/doctormx
   git worktree remove worktrees/frontend
   git worktree remove worktrees/backend
   git worktree remove worktrees/database
   git worktree remove worktrees/ai
   ```
3. Clean up team resources (ask Lead to "clean up the team")

---

## Quality Standards

All teammates follow **Stripe-level quality standards**:
- ✅ All states handled (loading, empty, error, success)
- ✅ Mobile-first responsive design
- ✅ Smooth transitions
- ✅ Edge cases covered
- ✅ Post-sprint review before marking complete

---

*For questions or issues, refer to AGENT_INSTRUCTIONS.md or contact the team lead.*
