# Supabase Configuration - Reusable Assets

> **Status**: ✅ VERIFIED WORKING  
> **Source**: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/middleware.ts`

---

## 1. Environment Variables Template

### Required Variables
```bash
# Client-side (NEXT_PUBLIC_ prefix required for browser access)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Alternative VITE_ prefixes (for Vite projects)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Server-side only (NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Complete .env.example
```bash
# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Server-side operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (for migrations/backups)
SUPABASE_DB_PASSWORD=your-database-password
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
TEST_DATABASE_URL=postgresql://postgres:password@test-db.your-project.supabase.co:5432/postgres
```

---

## 2. Server-Side Client

**Source**: `src/lib/supabase/server.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Environment variable helpers
function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  if (!url) throw new Error('Supabase URL must be set')
  return url
}

function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!key) throw new Error('Supabase anon key must be set')
  return key
}

/**
 * Create a Supabase client for server-side operations (App Router)
 * Uses cookies() for authentication
 */
export async function createClient() {
  const cookieStore = await cookies()
  const supabaseUrl = getSupabaseUrl()
  const supabaseAnonKey = getSupabaseAnonKey()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        flowType: 'pkce',  // Recommended for server-side
        debug: process.env.NODE_ENV === 'development',
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // The `set` method was called from a Server Component
            // This can be ignored if you have middleware refreshing sessions
          }
        },
      },
    }
  )
}

/**
 * Service role client - bypasses RLS
 * ONLY use for server-side operations that need elevated permissions
 */
export function createServiceClient() {
  const supabaseUrl = getSupabaseUrl()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY must be set')
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey)
}
```

### Usage Examples

```typescript
// In API routes (App Router)
import { createClient, createServiceClient } from '@/lib/supabase/server'

// Regular client (respects RLS)
export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
  // ...
}

// Service client (bypasses RLS - use carefully!)
export async function POST(request: Request) {
  const serviceClient = createServiceClient()
  const { data, error } = await serviceClient
    .from('users')
    .update({ role: 'admin' })
    .eq('id', userId)
  // ...
}
```

---

## 3. Client-Side Client

**Source**: `src/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Return cached instance (singleton pattern)
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Only create client on client side
  if (typeof window === 'undefined') {
    throw new Error('Supabase client should only be used on client side')
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials not configured')
  }

  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}
```

### Usage in Client Components

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

export function ProfileComponent() {
  const supabase = createClient()
  
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      // ...
    }
    fetchProfile()
  }, [])
  
  // ...
}
```

---

## 4. Middleware Integration

**Source**: `src/lib/supabase/middleware.ts` (referenced, simplified version)

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser()

  return supabaseResponse
}
```

### Middleware Configuration

```typescript
// middleware.ts
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Run session update first
  let response = await updateSession(request)
  
  // Apply other middleware (CSRF, security headers, etc.)
  // ...
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## 5. Service Role vs Anon Key Usage

### When to Use Each

| Client Type | Use Case | RLS Applied? | Security Level |
|-------------|----------|--------------|----------------|
| **Anon Key** (client-side) | User-facing operations, queries | ✅ Yes | Standard |
| **Anon Key** (server-side) | API routes that respect user permissions | ✅ Yes | Standard |
| **Service Role** | Admin operations, webhooks, background jobs | ❌ No | **High Risk** |

### Service Role - Use Cases

```typescript
// ✅ APPROPRIATE: Webhook handlers
export async function POST(request: Request) {
  const serviceClient = createServiceClient()
  // Update payment status regardless of user session
  await serviceClient.from('payments').update({ status: 'paid' })
}

// ✅ APPROPRIATE: Admin operations
export async function verifyDoctor(doctorId: string) {
  const serviceClient = createServiceClient()
  await serviceClient
    .from('doctors')
    .update({ verified_at: new Date().toISOString() })
    .eq('id', doctorId)
}

// ✅ APPROPRIATE: Background jobs
export async function cleanupExpiredSessions() {
  const serviceClient = createServiceClient()
  await serviceClient
    .from('sessions')
    .delete()
    .lt('expires_at', new Date().toISOString())
}
```

### Service Role - NEVER Use For

```typescript
// ❌ WRONG: User-facing queries (bypasses RLS!)
export async function GET(request: Request) {
  const serviceClient = createServiceClient()  // DON'T DO THIS
  const { data } = await serviceClient
    .from('medical_records')
    .select('*')  // Returns ALL records, not just user's
}

// ❌ WRONG: Client-side code
'use client'
const serviceClient = createServiceClient()  // NEVER - exposes service key!
```

---

## 6. Common Patterns

### Auth Check Pattern

```typescript
// In API routes
export async function GET() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // User is authenticated, continue...
}
```

### RLS-Compliant Query Pattern

```typescript
// These queries respect RLS policies
const supabase = await createClient()

// Only returns records the user has access to
const { data } = await supabase
  .from('appointments')
  .select(`
    *,
    doctor:doctors(*),
    patient:profiles!patient_id(*)
  `)
  .eq('status', 'confirmed')
```

### Transaction Pattern (using RPC)

```typescript
// For multi-step operations, use database functions
const { data, error } = await supabase.rpc('create_appointment_with_payment', {
  p_doctor_id: doctorId,
  p_patient_id: patientId,
  p_slot_id: slotId,
  p_amount: amount,
})
```

---

## 7. TypeScript Types

### Database Types Generation

```typescript
// src/types/database.ts (generated from Supabase schema)
export type DatabaseRow = {
  [key: string]: unknown
}

export type ProfileRow = {
  id: string
  role: 'patient' | 'doctor' | 'admin'
  full_name: string
  email?: string
  phone: string | null
  photo_url: string | null
  created_at: string
}

export type AppointmentRow = {
  id: string
  patient_id: string
  doctor_id: string
  status: 'pending_payment' | 'confirmed' | 'completed' | 'cancelled'
  scheduled_at: string
  // ...
}

// Helper types for relations
export type AppointmentWithRelations = AppointmentRow & {
  doctor: DoctorRow
  patient: ProfileRow
}
```

---

## Summary: Key Points

✅ **KEEP**:
- Server client with PKCE flow
- Client singleton pattern
- Service role isolation
- Middleware session refresh
- Environment variable helpers
- Clear separation of concerns

⚠️ **SECURITY REMINDERS**:
- Service role key NEVER in client-side code
- Always use RLS policies
- Validate auth in every protected route
- Use `supabase.auth.getUser()` not `getSession()` for security
- Middleware runs on every request - keep it fast
