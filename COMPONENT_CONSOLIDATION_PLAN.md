# Component Consolidation Plan

## Quick Action Matrix

| Priority | Component | Action | Effort | Files to Update |
|----------|-----------|--------|--------|-----------------|
| 🔴 P0 | Button | Extend `ui/button` | 2h | 4 files |
| 🔴 P0 | Input | Create FormInput wrapper | 2h | 3 files |
| 🔴 P0 | Modal | Replace with Dialog | 3h | ~5 files |
| 🟡 P1 | Card | Migrate to `ui/card` | 4h | 7 files |
| 🟡 P1 | Badge | Extend `ui/badge` | 2h | 5 files |
| 🟡 P1 | Avatar | Merge features | 3h | 0 files (new) |
| 🟢 P2 | Select | Migrate to `ui/select` | 3h | Check usage |
| 🟢 P2 | Pagination | Evaluate vs `ui/pagination` | 1h | Compare features |
| 🟢 P2 | EmptyState | Consolidate 2 versions | 2h | Update imports |
| ⚪ P3 | Skeleton | Keep both (specialized) | 0h | None |

---

## Detailed Migration Guide

### 1. Button Migration

**Current State:**
- Custom `Button` in `src/components/Button.tsx`
- Uses legacy CSS vars: `--color-primary-600`
- Has: `loading`, `leftIcon`, `rightIcon`, `fullWidth`
- 4 imports across codebase

**Target State:**
- Extend `src/components/ui/button.tsx`
- Add missing props to shadcn Button

**Implementation:**
```typescript
// src/components/ui/button.tsx (extended)
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, 
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

function Button({ className, variant, size, asChild = false, loading, leftIcon, rightIcon, children, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      disabled={loading || props.disabled}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && leftIcon}
      {children}
      {!loading && rightIcon}
    </Comp>
  )
}
```

**Migration Script:**
```bash
# Replace imports
find src -name "*.tsx" -exec sed -i 's|from "@/components/Button"|from "@/components/ui/button"|g' {} +
find src -name "*.tsx" -exec sed -i "s|from '@/components/Button'|from '@/components/ui/button'|g" {} +
```

---

### 2. Input Migration

**Current State:**
- Custom `Input` in `src/components/Input.tsx`
- Has built-in: `label`, `error`, `hint`, `leftIcon`, `rightIcon`
- 3 imports across codebase

**Target State:**
- Keep shadcn `ui/input` as base
- Create `FormInput` wrapper component

**Implementation:**
```typescript
// src/components/FormInput.tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function FormInput({ label, error, hint, leftIcon, rightIcon, className, ...props }: FormInputProps) {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="relative">
        {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2">{leftIcon}</span>}
        <Input className={cn(leftIcon && "pl-10", rightIcon && "pr-10", className)} {...props} />
        {rightIcon && <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</span>}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {hint && !error && <p className="text-sm text-muted-foreground">{hint}</p>}
    </div>
  )
}
```

---

### 3. Modal → Dialog Migration

**Current State:**
- Custom `Modal` in `src/components/Modal.tsx`
- No focus trap
- Custom animation system

**Target State:**
- Use `ui/dialog` (already has focus trap, accessibility)

**Before:**
```typescript
import { Modal, ModalFooter } from '@/components/Modal'

<Modal isOpen={open} onClose={handleClose} title="Confirm" size="md">
  <p>Are you sure?</p>
  <ModalFooter>
    <Button onClick={handleClose}>Cancel</Button>
    <Button onClick={handleConfirm}>Confirm</Button>
  </ModalFooter>
</Modal>
```

**After:**
```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Confirm</DialogTitle>
    </DialogHeader>
    <p>Are you sure?</p>
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      <Button onClick={handleConfirm}>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### 4. Card Migration

**Current State:**
- Custom `Card` in `src/components/Card.tsx`
- Compound pattern: `Card`, `CardHeader`, `CardBody`, `CardFooter`
- Also exports `StatCard`
- Uses legacy CSS vars

**Target State:**
- Use `ui/card` components
- Create `StatCard` as separate component

**Mapping:**
| Custom | shadcn/ui |
|--------|-----------|
| `Card` | `Card` |
| `CardHeader` | `CardHeader` + `CardTitle` |
| `CardBody` | `CardContent` |
| `CardFooter` | `CardFooter` |
| `StatCard` | New component |

---

### 5. Badge Migration

**Current State:**
- Custom `Badge` in `src/components/Badge.tsx`
- Variants: `success`, `warning`, `error`, `info`, `neutral`
- Has helper functions for appointments

**Target State:**
- Extend `ui/badge` with status variants
- Move helper functions to utils

**Implementation:**
```typescript
// src/components/ui/badge.tsx (add variants)
const badgeVariants = cva(
  // ... existing variants ...
  {
    variants: {
      variant: {
        // ... existing ...
        success: "border-transparent bg-green-100 text-green-800",
        warning: "border-transparent bg-yellow-100 text-yellow-800",
        error: "border-transparent bg-red-100 text-red-800",
        info: "border-transparent bg-blue-100 text-blue-800",
      }
    }
  }
)
```

---

## Post-Migration Cleanup

### Files to Delete (After Migration)

```
src/components/Button.tsx      → After updating 4 imports
src/components/Card.tsx        → After updating 7 imports + extracting StatCard
src/components/Input.tsx       → After updating 3 imports
src/components/Modal.tsx       → After updating usages
src/components/Badge.tsx       → After migrating helpers
src/components/Select.tsx      → After evaluating usage
src/components/Pagination.tsx  → After evaluating vs ui/pagination
src/components/Avatar.tsx      → After merging features into ui/avatar
```

### Files to Create

```
src/components/FormInput.tsx   → Wrapper around ui/input
src/components/StatCard.tsx    → Extracted from Card.tsx
src/components/AvatarGroup.tsx → From Avatar.tsx
```

### Files to Update

```
src/components/EmptyState.tsx  → Re-export from healthcare/EmptyState.tsx
src/components/ErrorState.tsx  → Make framer-motion optional
```

---

## Testing Checklist

### Per Component Migration

- [ ] Visual regression check (screenshot comparison)
- [ ] Props API compatibility verified
- [ ] All imports updated
- [ ] Accessibility audit (keyboard nav, focus, ARIA)
- [ ] Dark mode tested
- [ ] Mobile responsive tested
- [ ] Animation behavior verified

### Global Checks

- [ ] No console errors
- [ ] Build succeeds without errors
- [ ] All pages render correctly
- [ ] Form submissions work
- [ ] Modal/dialog interactions work
- [ ] Loading states display correctly

---

## Rollback Plan

If issues are discovered:

1. **Git revert** the specific component migration commit
2. **Restore** original component file
3. **Revert** import changes in affected files
4. **Document** the blocking issue for future retry

---

## Success Metrics

| Metric | Before | Target | After |
|--------|--------|--------|-------|
| Duplicate components | 9 pairs | 0 pairs | TBD |
| Custom CSS var usage | 50+ files | 0 files | TBD |
| shadcn/ui adoption | 24 components | 30+ components | TBD |
| Accessibility issues | 5 critical | 0 critical | TBD |
| Bundle size (gzipped) | Baseline | -5% | TBD |
