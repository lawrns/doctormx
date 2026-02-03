# Doctor.mx Optimization Plan

**Goal:** Improve performance, reduce bundle size, and modernize architecture.

---

## 1. Component Consolidation

### Duplicate Components to Merge

| Keep (shadcn) | Remove (Custom) | Files to Update |
|---------------|-----------------|-----------------|
| `ui/button.tsx` | `Button.tsx` | 15 imports |
| `ui/card.tsx` | `Card.tsx` | 12 imports |
| `ui/input.tsx` | `Input.tsx` | 8 imports |
| `ui/badge.tsx` | `Badge.tsx` | 6 imports |
| `ui/avatar.tsx` | `Avatar.tsx` | 5 imports |
| `ui/select.tsx` | `Select.tsx` | 4 imports |
| `ui/skeleton.tsx` | `Skeleton.tsx` | 3 imports |
| `ui/dialog.tsx` | `Modal.tsx` | 7 imports |

### Migration Script

```bash
# Step 1: Find all imports of custom components
grep -r "from '@/components/Button'" --include="*.tsx" src/
grep -r "from '@/components/Card'" --include="*.tsx" src/
# ... repeat for each

# Step 2: Update imports (example for Button)
find src -name "*.tsx" -exec sed -i "s|from '@/components/Button'|from '@/components/ui/button'|g" {} \;

# Step 3: Delete custom components
rm src/components/Button.tsx
rm src/components/Card.tsx
# ... etc
```

---

## 2. Server Components Migration

### Candidates for Server Conversion

| File | Current | Action |
|------|---------|--------|
| `HeroSection.tsx` | Client | Convert to Server |
| `FeaturesSection.tsx` | Client | Convert to Server |
| `StatsSection.tsx` | Client | Convert to Server |
| `TestimonialsSection.tsx` | Client | Convert to Server |
| `landing/CTASection.tsx` | Client | Convert to Server |

### How to Convert

```tsx
// BEFORE (Client Component)
'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export function HeroSection() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* content */}
    </motion.section>
  )
}

// AFTER (Server Component)
export function HeroSection() {
  return (
    <section className="py-20">
      {/* content - no animations, no hooks */}
    </section>
  )
}
```

---

## 3. Implement Server Actions

### API Routes to Convert

| Route | Server Action | Benefit |
|-------|---------------|---------|
| `POST /api/appointments` | `createAppointment()` | No HTTP overhead |
| `POST /api/appointments/[id]/cancel` | `cancelAppointment()` | Direct DB access |
| `PUT /api/patient/profile` | `updateProfile()` | Type safety |
| `POST /api/doctor/availability` | `updateAvailability()` | Simplified code |

### Example Implementation

```typescript
// src/app/actions/appointments.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createAppointmentSchema = z.object({
  doctorId: z.string().uuid(),
  startTime: z.string().datetime(),
  reason: z.string().optional(),
})

export async function createAppointment(data: z.infer<typeof createAppointmentSchema>) {
  const supabase = await createClient()
  
  // Validate
  const parsed = createAppointmentSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Invalid data', details: parsed.error.flatten() }
  }
  
  // Get user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }
  
  // Create appointment
  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert({
      doctor_id: parsed.data.doctorId,
      patient_id: user.id,
      start_ts: parsed.data.startTime,
      reason: parsed.data.reason,
      status: 'pending',
    })
    .select()
    .single()
  
  if (error) {
    return { error: error.message }
  }
  
  // Revalidate cache
  revalidatePath('/app/appointments')
  
  return { success: true, appointment }
}
```

### Usage in Client Component

```tsx
'use client'

import { createAppointment } from '@/app/actions/appointments'

export function BookingForm() {
  async function handleSubmit(formData: FormData) {
    const result = await createAppointment({
      doctorId: formData.get('doctorId') as string,
      startTime: formData.get('startTime') as string,
    })
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Appointment booked!')
      router.push('/app/appointments')
    }
  }
  
  return <form action={handleSubmit}>...</form>
}
```

---

## 4. Caching Strategy

### React Cache Implementation

```typescript
// src/lib/cache.ts
import { unstable_cache } from 'next/cache'
import { cache } from 'react'

// Request-level cache (React cache)
export const getDoctorById = cache(async (id: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', id)
    .single()
  return data
})

// Persistent cache (Next.js unstable_cache)
export const getSpecialties = unstable_cache(
  async () => {
    const supabase = await createClient()
    const { data } = await supabase
      .from('specialties')
      .select('*')
      .order('name')
    return data
  },
  ['specialties', 'list'],
  { revalidate: 3600 } // 1 hour
)
```

### Route Cache Configuration

```tsx
// src/app/doctors/page.tsx
export const revalidate = 60 // 1 minute

export default async function DoctorsPage() {
  const doctors = await getDoctors() // Cached for 60s
  return <DoctorsList doctors={doctors} />
}
```

---

## 5. Loading States & Suspense

### Add loading.tsx Files

```tsx
// src/app/app/loading.tsx
import { DashboardSkeleton } from '@/components/skeletons'

export default function Loading() {
  return <DashboardSkeleton />
}
```

### Skeleton Components

```tsx
// src/components/skeletons.tsx
export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  )
}
```

### Suspense Boundaries

```tsx
// src/app/app/page.tsx
import { Suspense } from 'react'

export default function AppPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      <Suspense fallback={<AppointmentsSkeleton />}>
        <AppointmentsList />
      </Suspense>
      
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>
    </div>
  )
}
```

---

## 6. Image Optimization

### Priority Loading

```tsx
// Hero images
<Image
  src="/hero-doctor.jpg"
  alt="Doctor consultation"
  priority  // Load immediately
  loading="eager"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### Blur Placeholder

```tsx
<Image
  src="/doctor.jpg"
  alt="Doctor"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
/>
```

---

## 7. Bundle Size Optimization

### Dependency Analysis

```bash
# Analyze bundle size
npx next-bundle-analyzer

# Find heavy imports
npx import-cost src/app/layout.tsx
```

### Heavy Dependencies to Review

| Package | Size | Alternative |
|---------|------|-------------|
| framer-motion | 100kb+ | CSS transitions |
| recharts | 150kb+ | Chart.js or server-rendered |
| @anthropic-ai/sdk | 50kb+ | Use only server-side |
| cheerio | 80kb+ | Server-side only |

### Dynamic Imports

```tsx
// BEFORE (static import)
import { Chart } from 'recharts'

// AFTER (dynamic import)
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('recharts').then(m => m.Chart), {
  ssr: false,
  loading: () => <ChartSkeleton />
})
```

---

## 8. Legacy Code Removal

### Files to Delete

```bash
# Legacy React Router
rm src/contexts/AuthContext.jsx
rm src/components/Layout.jsx
rm src/pages/VisionConsultation.jsx

# Duplicate components
rm src/components/CookieConsent.jsx  # Keep .tsx
rm src/components/Button.tsx         # Use ui/button
rm src/components/Card.tsx            # Use ui/card
rm src/components/Input.tsx           # Use ui/input
rm src/components/Badge.tsx           # Use ui/badge
rm src/components/Modal.tsx           # Use ui/dialog

# Old entry point
rm src/index.tsx
```

### Check for References

```bash
grep -r "AuthContext" --include="*.tsx" --include="*.ts" src/
grep -r "from '@/components/Button'" --include="*.tsx" src/
grep -r "from '@/components/Layout'" --include="*.tsx" src/
```

---

## 9. Database Optimization

### Add Missing Indexes

```sql
-- Performance indexes
CREATE INDEX idx_appointments_doctor_date 
  ON appointments(doctor_id, start_ts);

CREATE INDEX idx_appointments_patient 
  ON appointments(patient_id, created_at DESC);

CREATE INDEX idx_payments_status 
  ON payments(status, created_at);

CREATE INDEX idx_chat_messages_conversation 
  ON chat_messages(conversation_id, created_at DESC);
```

### Query Optimization

```typescript
// BEFORE: N+1 query
const doctors = await getDoctors()
for (const doctor of doctors) {
  doctor.appointments = await getAppointments(doctor.id) // N queries!
}

// AFTER: Single query with join
const { data } = await supabase
  .from('doctors')
  .select(`
    *,
    appointments:appointments(*)
  `)
```

---

## 10. TypeScript Improvements

### Generate Database Types

```bash
# Generate types from Supabase schema
npx supabase gen types typescript --project-id your-project > src/types/database.ts
```

### Use Strict Types

```typescript
// BEFORE: Loose typing
function getDoctor(id: string): Promise<any>

// AFTER: Strict typing
import { Database } from '@/types/database'

 type Doctor = Database['public']['Tables']['doctors']['Row']

function getDoctor(id: string): Promise<Doctor | null>
```

---

## Implementation Timeline

### Week 1: Cleanup
- [ ] Remove legacy files
- [ ] Consolidate duplicate components
- [ ] Delete unused imports

### Week 2: Architecture
- [ ] Convert landing components to Server Components
- [ ] Implement first Server Actions
- [ ] Add caching layer

### Week 3: Performance
- [ ] Add loading states
- [ ] Implement Suspense boundaries
- [ ] Optimize images

### Week 4: Polish
- [ ] Generate database types
- [ ] Add database indexes
- [ ] Bundle optimization
- [ ] Final testing

---

## Success Metrics

| Metric | Before | After Target |
|--------|--------|--------------|
| Client components | 119 | < 80 |
| Duplicate components | 9 pairs | 0 |
| Server Actions | 0 | 10+ |
| Loading states | 5 | 20+ |
| Cached queries | 1 | 10+ |
| Legacy files | 10+ | 0 |
| Bundle size | ~500kb | < 350kb |
| Lighthouse score | ~60 | > 80 |
