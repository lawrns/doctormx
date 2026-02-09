# Authentication Pages Refactor Checklist

Quick reference guide for refactoring authentication pages to match shadcn/ui patterns.

---

## Phase 1: Validation Setup (2-3 hours)

### Step 1: Create Validation Schemas

- [ ] Create `/src/lib/validation/auth-schemas.ts`
- [ ] Add loginSchema with zod
- [ ] Add registerSchema with zod
- [ ] Export TypeScript types from schemas
- [ ] Add Spanish error messages

**File to create:**
```typescript
// src/lib/validation/auth-schemas.ts
import * as z from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().min(1, 'El correo es requerido').email('Correo inválido'),
  phone: z.string().regex(/^\d{10}$/, '10 dígitos').optional().or(z.literal('')),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
```

---

### Step 2: Refactor Login Page

- [ ] Import `useForm` from react-hook-form
- [ ] Import `zodResolver` from @hookform/resolvers/zod
- [ ] Import Form components (FormField, FormItem, etc.)
- [ ] Replace useState with useForm
- [ ] Replace manual inputs with FormField components
- [ ] Add FormMessage for field errors
- [ ] Update submit handler to use form.handleSubmit
- [ ] Test validation (empty fields, invalid email, etc.)

**Changes to `/src/app/auth/login/page.tsx`:**

Before:
```tsx
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')

<Input value={email} onChange={(e) => setEmail(e.target.value)} />
```

After:
```tsx
const form = useForm<LoginFormValues>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: '', password: '' },
})

<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Correo electrónico</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

### Step 3: Refactor Register Page

- [ ] Same steps as login page
- [ ] Add validation for fullName and phone fields
- [ ] Update submit handler
- [ ] Test validation
- [ ] Verify doctor vs patient flow still works

---

## Phase 2: Component Extraction (2-3 hours)

### Step 4: Create AuthLayout Component

- [ ] Create `/src/components/auth/AuthLayout.tsx`
- [ ] Extract header from login/register pages
- [ ] Extract footer/back-to-home link
- [ ] Create centered container for children
- [ ] Update login page to use AuthLayout
- [ ] Update register page to use AuthLayout

**Component to create:**
```tsx
// src/components/auth/AuthLayout.tsx
import Link from 'next/link'
import { DoctoryLogo } from '@/components/DoctoryLogo'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <DoctoryLogo />
            <span className="text-xl font-bold text-neutral-900">Doctory</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  )
}

export function BackToHomeLink() {
  return (
    <div className="text-center mt-6">
      <Link
        href="/"
        className="text-gray-400 hover:text-primary-500 text-sm transition-colors inline-flex items-center gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al inicio
      </Link>
    </div>
  )
}
```

---

### Step 5: Create PasswordInput Component

- [ ] Create `/src/components/auth/PasswordInput.tsx`
- [ ] Add eye icon for toggle visibility
- [ ] Add state for show/hide password
- [ ] Make component compatible with react-hook-form (forwardRef)
- [ ] Add accessibility (aria-label)
- [ ] Replace password inputs in login/register pages

**Component to create:**
```tsx
// src/components/auth/PasswordInput.tsx
'use client'

import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="relative">
      <Input
        type={showPassword ? 'text' : 'password'}
        className={className}
        ref={ref}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Eye className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  )
})

PasswordInput.displayName = 'PasswordInput'
```

---

### Step 6: Create SocialLogin Component

- [ ] Create `/src/components/auth/SocialLogin.tsx`
- [ ] Extract social login buttons from login/register
- [ ] Add OAuth handlers (Google, GitHub)
- [ ] Add divider
- [ ] Update login/register pages to use component

**Component to create:**
```tsx
// src/components/auth/SocialLogin.tsx
import { Button } from '@/components/ui/button'
import { FcGoogle } from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa'

export function SocialLogin() {
  return (
    <div>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            o continúa con
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" type="button" onClick={handleGoogleLogin}>
          <FcGoogle className="mr-2 h-4 w-4" />
          Google
        </Button>
        <Button variant="outline" type="button" onClick={handleGithubLogin}>
          <FaGithub className="mr-2 h-4 w-4" />
          GitHub
        </Button>
      </div>
    </div>
  )
}

async function handleGoogleLogin() {
  // TODO: Implement Supabase OAuth
}

async function handleGithubLogin() {
  // TODO: Implement Supabase OAuth
}
```

---

### Step 7: Update Card Structure

- [ ] Update login page to use CardHeader, CardContent, CardFooter
- [ ] Update register page to use CardHeader, CardContent, CardFooter
- [ ] Remove manual padding (Card subcomponents handle it)
- [ ] Test layout and spacing

**Before:**
```tsx
<Card className="p-8">
  <div className="text-center mb-8">
    <h1>Title</h1>
    <p>Description</p>
  </div>
  <form>...</form>
  <p>Footer</p>
</Card>
```

**After:**
```tsx
<Card>
  <CardHeader className="text-center">
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <form>...</form>
  </CardContent>
  <CardFooter>
    <p>Footer</p>
  </CardFooter>
</Card>
```

---

## Phase 3: Testing & Validation (1-2 hours)

### Step 8: Test Validation

- [ ] Test login with empty fields (should show "required" errors)
- [ ] Test login with invalid email (should show "invalid" error)
- [ ] Test login with short password (should show "min 6" error)
- [ ] Test register with all fields
- [ ] Test register with optional phone field
- [ ] Verify error messages are in Spanish
- [ ] Verify errors appear below each field (not at top)

---

### Step 9: Test User Flows

- [ ] Login as existing user (success case)
- [ ] Login with wrong password (error case)
- [ ] Login with non-existent email (error case)
- [ ] Register new patient account
- [ ] Register new doctor account
- [ ] Verify redirect after login works
- [ ] Verify doctor registration redirects to profile completion

---

### Step 10: Accessibility Testing

- [ ] Tab through login form (keyboard navigation)
- [ ] Tab through register form
- [ ] Verify focus visible on all inputs
- [ ] Test screen reader (VoiceOver on Mac)
- [ ] Verify error announcements
- [ ] Test password toggle with keyboard (Space/Enter)
- [ ] Verify ARIA labels on password toggle

---

## Phase 4: Polish & Optimization (1-2 hours)

### Step 11: Code Cleanup

- [ ] Remove unused useState imports from login/register
- [ ] Remove inline SVGs (use lucide-react icons)
- [ ] Remove duplicated Tailwind classes (extract to components)
- [ ] Run ESLint and fix warnings
- [ ] Run Prettier to format code
- [ ] Remove console.log statements

---

### Step 12: Performance

- [ ] Verify Suspense boundaries are in place
- [ ] Add loading skeleton for auth pages (optional)
- [ ] Lazy load social login icons (optional)
- [ ] Test page load speed (should be < 2s)

---

### Step 13: Final Review

- [ ] Login page < 100 lines
- [ ] Register page < 150 lines
- [ ] Zero duplicated code
- [ ] All components in `/src/components/auth/`
- [ ] All validation in `/src/lib/validation/`
- [ ] Spanish error messages
- [ ] Field-level errors working
- [ ] Password toggle working
- [ ] Accessibility tested
- [ ] Mobile responsive

---

## Files Created/Modified

### New Files
```
src/
├── components/
│   └── auth/
│       ├── AuthLayout.tsx           (NEW)
│       ├── PasswordInput.tsx        (NEW)
│       ├── SocialLogin.tsx          (NEW)
│       └── index.ts                 (NEW)
├── lib/
│   └── validation/
│       ├── auth-schemas.ts          (NEW)
│       └── index.ts                 (NEW)
```

### Modified Files
```
src/
└── app/
    └── auth/
        ├── login/page.tsx           (MODIFIED)
        └── register/page.tsx        (MODIFIED)
```

---

## Quick Wins (Can Do Immediately)

### Win 1: Add Password Toggle (15 min)
Create `PasswordInput.tsx` and replace password inputs. Instant UX improvement.

### Win 2: Use Card Subcomponents (10 min)
Replace `<Card className="p-8">` with `CardHeader/Content/Footer`. Better structure.

### Win 3: Extract AuthLayout (20 min)
Create `AuthLayout.tsx` and remove 68 lines of duplicated code.

---

## Common Issues & Solutions

### Issue: FormMessage not showing errors
**Solution:** Make sure you're using `<FormControl>` wrapper around Input:
```tsx
<FormItem>
  <FormLabel>Email</FormLabel>
  <FormControl>  {/* Required! */}
    <Input {...field} />
  </FormControl>
  <FormMessage />  {/* Will show error if FormControl is present */}
</FormItem>
```

---

### Issue: Form submits even with validation errors
**Solution:** Use `form.handleSubmit(onSubmit)` not just `onSubmit`:
```tsx
<form onSubmit={form.handleSubmit(onSubmit)}>  {/* Correct */}
<form onSubmit={onSubmit}>  {/* Wrong - bypasses validation */}
```

---

### Issue: Password toggle breaks react-hook-form
**Solution:** Use `React.forwardRef` in PasswordInput component:
```tsx
export const PasswordInput = React.forwardRef<HTMLInputElement, ...>(
  (props, ref) => {
    return <Input ref={ref} {...props} />  {/* Forward ref */}
  }
)
```

---

### Issue: Zod validation too strict (e.g., phone field)
**Solution:** Use `.optional().or(z.literal(''))` for optional fields:
```tsx
phone: z.string().regex(/^\d{10}$/, '10 dígitos').optional().or(z.literal(''))
```

---

## Rollback Plan

If something breaks during refactor:

1. **Validation issues:** Temporarily disable zod, use HTML5 validation:
   ```tsx
   <Input type="email" required />  // Fallback
   ```

2. **Component extraction issues:** Keep old code commented out until new components work:
   ```tsx
   {/* OLD CODE - remove after testing
   <div>
     <label>Email</label>
     <Input />
   </div>
   */}

   <FormField>  {/* NEW CODE */}
     ...
   </FormField>
   ```

3. **Git safety:** Create branch before refactoring:
   ```bash
   git checkout -b refactor/auth-pages-shadcn
   git commit -m "WIP: Auth pages refactor - checkpoint 1"
   ```

---

## Success Metrics

### Before Refactor
- Login page: 201 lines
- Register page: 274 lines
- Duplicated code: ~100 lines
- Validation: HTML5 only
- Error display: Global only
- Type safety: None

### After Refactor
- Login page: ~80 lines (60% reduction)
- Register page: ~120 lines (56% reduction)
- Duplicated code: 0 lines
- Validation: Zod + react-hook-form
- Error display: Field-level
- Type safety: Full TypeScript
- Accessibility: WCAG 2.1 AA
- Password toggle: ✅
- Reusable components: 3+ extracted

---

## Estimated Time

| Phase | Time | Priority |
|-------|------|----------|
| Phase 1: Validation | 2-3 hours | HIGH |
| Phase 2: Components | 2-3 hours | HIGH |
| Phase 3: Testing | 1-2 hours | MEDIUM |
| Phase 4: Polish | 1-2 hours | LOW |
| **Total** | **6-10 hours** | |

**Recommendation:** Do Phase 1 and 2 in one session (4-6 hours). Test and polish later.

---

## Questions Before Starting?

- [ ] Should we add two-column layout? (adds 2-3 hours)
- [ ] Should we implement OAuth now or later?
- [ ] Do we need password strength indicator? (adds 1 hour)
- [ ] Should we add "Remember me" checkbox?
- [ ] Do we need dark mode support now?

**Recommendation:** Start with core refactor (Phases 1-2), add features later.
