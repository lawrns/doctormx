# 🏗️ Architecture Principles for DoctorMX Reconstruction

> **Document Version:** 1.0  
> **Date:** 2026-02-16  
> **Purpose:** Define clean architecture patterns, folder structure, and dependency rules  
> **Mandate:** All code MUST follow these principles

---

## 📐 Core Architecture Principles

### 1. Clean Architecture (Onion/Hexagonal)

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  (UI Components, Pages, API Routes, Middleware)              │
├─────────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                         │
│  (Use Cases, Services, Business Logic)                       │
├─────────────────────────────────────────────────────────────┤
│                     DOMAIN LAYER                             │
│  (Entities, Value Objects, Domain Events, Repository IF)     │
├─────────────────────────────────────────────────────────────┤
│                  INFRASTRUCTURE LAYER                        │
│  (Database, External APIs, Queue, Cache, Storage)            │
└─────────────────────────────────────────────────────────────┘
```

**Dependency Rule:** Dependencies point INWARD only.
- Domain has NO external dependencies
- Application depends only on Domain
- Infrastructure implements interfaces from Domain
- Presentation depends on Application

---

### 2. Folder Structure (Feature-Based)

```
src/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Public marketing pages (group)
│   │   ├── page.tsx              # Landing page
│   │   ├── doctors/
│   │   └── pricing/
│   │
│   ├── (app)/                    # Authenticated app (group)
│   │   ├── layout.tsx            # App shell with auth
│   │   ├── dashboard/
│   │   ├── appointments/
│   │   └── profile/
│   │
│   ├── (doctor)/                 # Doctor portal (group)
│   │   ├── layout.tsx            # Doctor shell
│   │   ├── schedule/
│   │   └── patients/
│   │
│   └── api/                      # API Routes
│       ├── v1/                   # Versioned API
│       │   ├── appointments/
│       │   ├── doctors/
│       │   └── payments/
│       └── webhooks/             # External webhooks
│
├── components/                   # React Components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   │
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   │
│   └── features/                 # Feature-specific components
│       ├── appointments/
│       │   ├── AppointmentCard.tsx
│       │   ├── BookingForm.tsx
│       │   └── index.ts          # Barrel export
│       ├── doctors/
│       └── payments/
│
├── lib/                          # Utilities & Business Logic
│   ├── db/                       # Database layer
│   │   ├── index.ts
│   │   ├── schema.ts             # Database schema types
│   │   ├── queries/              # Query builders
│   │   └── mutations/            # Mutation builders
│   │
│   ├── api/                      # API utilities
│   │   ├── client.ts             # API client
│   │   ├── response.ts           # Response helpers
│   │   └── error.ts              # Error handling
│   │
│   ├── auth/                     # Authentication
│   │   ├── index.ts
│   │   ├── server.ts             # Server-side auth
│   │   ├── client.ts             # Client-side auth
│   │   └── middleware.ts         # Auth middleware
│   │
│   ├── queue/                    # Message queue
│   │   ├── index.ts
│   │   ├── client.ts             # Queue client
│   │   └── jobs/                 # Job definitions
│   │       ├── email.ts
│       │   └── notification.ts
│   │
│   ├── cache/                    # Caching layer
│   │   ├── index.ts
│   │   ├── client.ts
│   │   └── keys.ts               # Cache key generators
│   │
│   ├── ai/                       # AI services
│   │   ├── index.ts
│   │   ├── router.ts             # AI provider routing
│   │   └── providers/            # Provider implementations
│   │
│   └── utils/                    # General utilities
│       ├── date.ts
│       ├── currency.ts
│       └── validation.ts
│
├── types/                        # Global TypeScript types
│   ├── index.ts                  # Main exports
│   ├── api.ts                    # API types
│   ├── domain.ts                 # Domain types
│   └── database.ts               # Database types
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── useAppointment.ts
│   └── useToast.ts
│
├── config/                       # Configuration
│   ├── constants.ts              # App constants
│   ├── features.ts               # Feature flags
│   └── env.ts                    # Environment validation
│
└── middleware.ts                 # Next.js middleware
```

---

### 3. Module Boundaries

```typescript
// ✅ ALLOWED: Clear imports following dependency rule
// components/features/appointments/BookingForm.tsx
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { appointmentService } from '@/lib/services/appointment';
import { formatCurrency } from '@/lib/utils/currency';

// ❌ FORBIDDEN: Violating dependency rules
// - Importing UI components from database layer
// - Importing infra (db) directly from components
// - Cross-feature deep imports
```

**Import Rules:**

| From | Can Import | Cannot Import |
|------|-----------|---------------|
| `app/` | `components/`, `lib/`, `hooks/`, `types/`, `config/` | Nothing forbidden |
| `components/features/X/` | `components/ui/`, `lib/`, `hooks/`, `types/` | Other `features/` (use services) |
| `components/ui/` | `lib/utils/`, `types/` | `features/`, `app/`, database |
| `lib/` | `types/`, `config/` | `app/`, `components/` |
| `hooks/` | `lib/`, `types/` | database directly |
| `types/` | Nothing (pure types) | Everything |
| `config/` | `types/` | Everything else |

---

### 4. File Naming Conventions

```
Files:
  Components:     PascalCase.tsx          (e.g., AppointmentCard.tsx)
  Hooks:          camelCase.ts            (e.g., useAuth.ts)
  Utilities:      camelCase.ts            (e.g., formatDate.ts)
  Types:          kebab-case.ts           (e.g., api-types.ts) OR types.ts
  Constants:      UPPER_SNAKE_CASE.ts     (e.g., API_ENDPOINTS.ts)
  Tests:          *.test.ts               (unit)
                  *.spec.ts               (E2E)
                  *.stories.tsx           (Storybook)

Folders:
  Features:       kebab-case              (e.g., appointments/)
  Components:     PascalCase              (e.g., AppointmentCard/)
  Utilities:      kebab-case              (e.g., error-handling/)

Database:
  Tables:         snake_case              (e.g., appointments)
  Columns:        snake_case              (e.g., created_at)
  Enums:          snake_case              (e.g., appointment_status)
```

---

### 5. Domain Layer Design

```typescript
// src/types/domain.ts
// Pure TypeScript - no external dependencies

// Value Objects (immutable)
export interface Money {
  readonly amount: number;
  readonly currency: 'MXN';
}

export interface TimeSlot {
  readonly start: Date;
  readonly end: Date;
  readonly isAvailable: boolean;
}

// Entities (have identity)
export interface Appointment {
  readonly id: string;
  readonly patientId: string;
  readonly doctorId: string;
  readonly slot: TimeSlot;
  readonly status: AppointmentStatus;
  readonly price: Money;
}

// Domain Events
export interface AppointmentBookedEvent {
  readonly type: 'APPOINTMENT_BOOKED';
  readonly appointmentId: string;
  readonly patientId: string;
  readonly doctorId: string;
  readonly occurredAt: Date;
}

// Repository Interfaces (inversion of control)
export interface AppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  findByDoctorAndDate(doctorId: string, date: Date): Promise<Appointment[]>;
  save(appointment: Appointment): Promise<void>;
  delete(id: string): Promise<void>;
}
```

---

### 6. API Layer Design

```typescript
// src/lib/api/response.ts
// Standardized API responses

import { NextResponse } from 'next/server';
import { z } from 'zod';

// Response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta?: PaginationMeta;
}

export interface APIError {
  code: string;
  message: string;
  details?: unknown;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

// Response helpers
export function success<T>(
  data: T, 
  meta?: PaginationMeta
): NextResponse<APIResponse<T>> {
  return NextResponse.json({ 
    success: true, 
    data, 
    meta 
  });
}

export function error(
  code: string,
  message: string,
  status: number = 400,
  details?: unknown
): NextResponse<APIResponse<never>> {
  return NextResponse.json(
    { 
      success: false, 
      error: { code, message, details } 
    },
    { status }
  );
}

// Validation helper
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ data?: T; error?: NextResponse }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        error: error(
          'VALIDATION_ERROR',
          'Invalid request data',
          400,
          err.errors
        )
      };
    }
    return {
      error: error('INVALID_JSON', 'Invalid JSON in request body', 400)
    };
  }
}
```

---

### 7. Database Layer Design

```typescript
// src/lib/db/index.ts
// Repository pattern with Supabase

import { createClient } from '@supabase/supabase-js';
import { Appointment, AppointmentRepository } from '@/types/domain';

// Database client
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Repository implementation
export class SupabaseAppointmentRepository implements AppointmentRepository {
  async findById(id: string): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    return this.mapToDomain(data);
  }

  async findByDoctorAndDate(
    doctorId: string, 
    date: Date
  ): Promise<Appointment[]> {
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId)
      .gte('start_ts', startOfDay.toISOString())
      .lte('start_ts', endOfDay.toISOString());
    
    if (error || !data) return [];
    return data.map(this.mapToDomain);
  }

  async save(appointment: Appointment): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .upsert(this.mapToDatabase(appointment));
    
    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  private mapToDomain(data: any): Appointment {
    return {
      id: data.id,
      patientId: data.patient_id,
      doctorId: data.doctor_id,
      slot: {
        start: new Date(data.start_ts),
        end: new Date(data.end_ts),
        isAvailable: data.status === 'available'
      },
      status: data.status,
      price: {
        amount: data.price_cents / 100,
        currency: 'MXN'
      }
    };
  }

  private mapToDatabase(appointment: Appointment): any {
    return {
      id: appointment.id,
      patient_id: appointment.patientId,
      doctor_id: appointment.doctorId,
      start_ts: appointment.slot.start.toISOString(),
      end_ts: appointment.slot.end.toISOString(),
      status: appointment.status,
      price_cents: appointment.price.amount * 100
    };
  }
}

// Factory for dependency injection
export function createAppointmentRepository(): AppointmentRepository {
  return new SupabaseAppointmentRepository();
}
```

---

### 8. Service Layer Design

```typescript
// src/lib/services/appointment.ts
// Business logic - pure TypeScript

import { 
  Appointment, 
  AppointmentRepository,
  TimeSlot,
  Money 
} from '@/types/domain';
import { QueueService } from '@/lib/queue';

export interface CreateAppointmentInput {
  patientId: string;
  doctorId: string;
  slot: TimeSlot;
}

export class AppointmentService {
  constructor(
    private readonly repository: AppointmentRepository,
    private readonly queue: QueueService
  ) {}

  async create(input: CreateAppointmentInput): Promise<Appointment> {
    // Validate slot is available
    const existing = await this.repository.findByDoctorAndDate(
      input.doctorId,
      input.slot.start
    );
    
    const isSlotTaken = existing.some(
      apt => apt.slot.start.getTime() === input.slot.start.getTime()
    );
    
    if (isSlotTaken) {
      throw new Error('SLOT_UNAVAILABLE');
    }

    // Create appointment
    const appointment: Appointment = {
      id: crypto.randomUUID(),
      patientId: input.patientId,
      doctorId: input.doctorId,
      slot: input.slot,
      status: 'pending_payment',
      price: await this.calculatePrice(input.doctorId)
    };

    // Save to database
    await this.repository.save(appointment);

    // Queue notification (async)
    await this.queue.add('appointment-created', {
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId
    });

    return appointment;
  }

  private async calculatePrice(doctorId: string): Promise<Money> {
    // Business logic for pricing
    return { amount: 500, currency: 'MXN' };
  }
}
```

---

### 9. Component Design Patterns

```typescript
// Container/Presentational Pattern
// src/components/features/appointments/BookingContainer.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookingForm } from './BookingForm';
import { useToast } from '@/hooks/useToast';

interface BookingContainerProps {
  doctorId: string;
  availableSlots: TimeSlot[];
}

export function BookingContainer({ 
  doctorId, 
  availableSlots 
}: BookingContainerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (slot: TimeSlot) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId, slot })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to book');
      }

      toast.success('Appointment booked successfully');
      router.push('/appointments');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BookingForm
      availableSlots={availableSlots}
      isLoading={isLoading}
      onSubmit={handleSubmit}
    />
  );
}

// Pure presentational component
// src/components/features/appointments/BookingForm.tsx

interface BookingFormProps {
  availableSlots: TimeSlot[];
  isLoading: boolean;
  onSubmit: (slot: TimeSlot) => void;
}

export function BookingForm({ 
  availableSlots, 
  isLoading, 
  onSubmit 
}: BookingFormProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  return (
    <form onSubmit={() => selectedSlot && onSubmit(selectedSlot)}>
      {/* Form UI */}
    </form>
  );
}
```

---

### 10. Error Handling Architecture

```typescript
// src/lib/errors/index.ts

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}

// Error handler for API routes
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return errorResponse(error.code, error.message, error.statusCode);
  }
  
  // Log unexpected errors
  console.error('Unexpected error:', error);
  
  return errorResponse(
    'INTERNAL_ERROR',
    'An unexpected error occurred',
    500
  );
}
```

---

## 🔒 Security Principles

### 1. Defense in Depth

```
Layer 1: Client-side validation (UX only)
Layer 2: API input validation (Zod)
Layer 3: Authentication (JWT/session)
Layer 4: Authorization (RBAC/ABAC)
Layer 5: Row Level Security (RLS)
Layer 6: Database constraints
```

### 2. Authentication Pattern

```typescript
// src/lib/auth/server.ts

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getSession() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value: '', ...options });
        }
      }
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Usage in API routes
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new AppError('Unauthorized', 'UNAUTHORIZED', 401);
  }
  return session;
}
```

### 3. Rate Limiting Pattern

```typescript
// src/lib/rate-limit/index.ts

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true
});

export async function rateLimit(
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number }> {
  return await ratelimit.limit(identifier);
}
```

---

## 📊 Performance Principles

### 1. Caching Strategy

```
┌─────────────────┬─────────────────┬─────────────────┐
│   Cache Level   │     TTL         │   Use Case      │
├─────────────────┼─────────────────┼─────────────────┤
│ Browser         │ Session         │ User state      │
│ Service Worker  │ 7 days          │ Static assets   │
│ CDN             │ 1 year          │ Images, fonts   │
│ Redis           │ 15 min - 24h    │ API responses   │
│ Database        │ Permanent       │ Source of truth │
└─────────────────┴─────────────────┴─────────────────┘
```

### 2. Database Query Optimization

```typescript
// Always use select with specific columns
const { data } = await supabase
  .from('appointments')
  .select('id, status, start_ts, doctor:doctors(id, full_name)') // Not '*'
  .eq('patient_id', patientId)
  .order('start_ts', { ascending: false })
  .limit(10);

// Use pagination
const { data, count } = await supabase
  .from('appointments')
  .select('*', { count: 'exact' })
  .range((page - 1) * pageSize, page * pageSize - 1);
```

---

## ✅ Architecture Checklist

Before merging any code:

- [ ] Follows folder structure conventions
- [ ] Respects dependency rules (imports only allowed layers)
- [ ] Uses standardized API response format
- [ ] Implements proper error handling
- [ ] Has corresponding tests
- [ ] No `any` types
- [ ] No circular dependencies
- [ ] Documentation updated (if architectural change)

---

## 📚 Reference

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Best Practices](https://supabase.com/docs/guides/best-practices)
