# Worktrees Cleanup - Deferred

**Date:** 2026-02-09
**Status:** Deferred to Council decision

## Issue

The `worktrees/` directory contains 765MB of data — nearly as large as `node_modules/` (740MB).

### Current Worktrees
- `worktrees/frontend/` → `feature/frontend-work`
- `worktrees/backend/` → `feature/backend-work`
- `worktrees/database/` → `feature/database-work`
- `worktrees/ai/` → `feature/ai-work`

### Space Usage
```
740M	node_modules/
765M	worktrees/
```

### Context

Per `AGENT_TEAMS.md`, the worktrees were created for parallel development using Claude Code Agent Teams. Each worktree is a complete copy of the repository (minus `.git/`).

### Cleanup Commands (if approved)

```bash
# List current worktrees
cd ~/doctormx
git worktree list

# Remove each worktree
git worktree remove worktrees/frontend
git worktree remove worktrees/backend
git worktree remove worktrees/database
git worktree remove worktrees/ai

# Expected space savings: ~765MB
```

### Risk Assessment

- **Low Risk:** Worktrees can be recreated if needed
- **Data Loss:** None (all work is in main repo or branches)
- **Functionality:** Agent Teams would need worktrees re-created to use

### Recommendation

Present to Council: Decide whether Agent Teams workflow is actively being used. If not, remove worktrees to free up 765MB.

---

*Documented for future reference*
