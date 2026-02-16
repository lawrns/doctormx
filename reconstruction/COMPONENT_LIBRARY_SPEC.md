# 🎨 Component Library Specification - DoctorMX Reconstruction

> **Document Version:** 1.0  
> **Date:** 2026-02-16  
> **Purpose:** Define the complete component library, design tokens, and component hierarchy  
> **Goal:** Eliminate duplication, ensure consistency, enable maintainability

---

## 📋 Executive Summary

The original codebase had **71 duplicate error.tsx files**, multiple skeleton implementations, inconsistent styling, and no design system. This document defines the **minimal, complete** component library for reconstruction.

**Key Principles:**
1. One component per pattern (no duplicates)
2. Design tokens for all visual properties
3. Compound components for complex UI
4. Accessibility built-in (WCAG 2.1 AA)
5. Mobile-first responsive design

---

## 🎨 Design System Tokens

### Colors

```typescript
// src/config/tokens/colors.ts

export const colors = {
  // Primary Brand
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Main brand color
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Medical Severity (critical for healthcare UI)
  severity: {
    emergency: '#dc2626',    // Red - Emergency
    urgent: '#ea580c',       // Orange - Urgent
    high: '#ca8a04',         // Yellow - High priority
    normal: '#16a34a',       // Green - Normal
    low: '#6b7280',          // Gray - Low priority
    info: '#2563eb',         // Blue - Information
  },

  // Semantic
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Neutral
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Background
  background: {
    DEFAULT: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
  },

  // Text
  text: {
    primary: '#111827',
    secondary: '#4b5563',
    tertiary: '#9ca3af',
    inverse: '#ffffff',
  },

  // Border
  border: {
    DEFAULT: '#e5e7eb',
    strong: '#d1d5db',
    focus: '#3b82f6',
  },
} as const;
```

### Typography

```typescript
// src/config/tokens/typography.ts

export const typography = {
  fontFamily: {
    sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
    serif: ['var(--font-geist-serif)', 'Georgia', 'serif'],
    mono: ['var(--font-geist-mono)', 'monospace'],
  },

  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;
```

### Spacing & Layout

```typescript
// src/config/tokens/spacing.ts

export const spacing = {
  // Base unit: 4px
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  8: '2rem',        // 32px
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
} as const;

export const layout = {
  maxWidth: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;
```

### Shadows & Effects

```typescript
// src/config/tokens/effects.ts

export const effects = {
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  borderRadius: {
    none: '0',
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },

  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    DEFAULT: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;
```

### Animation

```typescript
// src/config/tokens/animation.ts

export const animation = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },

  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  keyframes: {
    fadeIn: {
      from: { opacity: '0' },
      to: { opacity: '1' },
    },
    slideUp: {
      from: { transform: 'translateY(10px)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' },
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' },
    },
  },
} as const;
```

---

## 🧩 Component Hierarchy

### Level 1: Primitives (Base UI)

These map directly to shadcn/ui components. **NO custom logic** - pure styling.

```typescript
// src/components/ui/primitives.ts
// Re-export from shadcn/ui with consistent naming

export { Button } from './button';
export { Card, CardHeader, CardTitle, CardContent, CardFooter } from './card';
export { Input } from './input';
export { Label } from './label';
export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select';
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
export { Badge } from './badge';
export { Avatar, AvatarImage, AvatarFallback } from './avatar';
export { Skeleton } from './skeleton';
export { Spinner } from './spinner';
export { Separator } from './separator';
export { ScrollArea } from './scroll-area';
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip';
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './dropdown-menu';
export { Popover, PopoverTrigger, PopoverContent } from './popover';
export { Calendar } from './calendar';
export { Checkbox } from './checkbox';
export { RadioGroup, RadioGroupItem } from './radio-group';
export { Switch } from './switch';
export { Slider } from './slider';
export { Textarea } from './textarea';
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './table';
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion';
export { Alert, AlertTitle, AlertDescription } from './alert';
export { Toast, Toaster } from './toast';
export { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from './form';
```

### Level 2: Composed Components

Built from primitives. Single responsibility.

#### 2.1 Form Components

```typescript
// src/components/forms/FormField.tsx
interface FormFieldProps {
  name: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  helperText?: string;
}

// src/components/forms/TextField.tsx
interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

// src/components/forms/DatePicker.tsx
interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}

// src/components/forms/PhoneField.tsx
// Mexican phone number formatting
interface PhoneFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

// src/components/forms/CurrencyField.tsx
// Mexican peso formatting
interface CurrencyFieldProps {
  value: number; // in cents
  onChange: (value: number) => void;
  error?: string;
  min?: number;
  max?: number;
}
```

#### 2.2 Feedback Components

```typescript
// src/components/feedback/LoadingState.tsx
// Single unified loading component
interface LoadingStateProps {
  variant: 'spinner' | 'skeleton' | 'skeleton-card' | 'skeleton-list';
  count?: number; // For list skeletons
}

// src/components/feedback/ErrorState.tsx
// Single unified error component (replaces 71 error.tsx files!)
interface ErrorStateProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'page' | 'section' | 'inline';
}

// src/components/feedback/EmptyState.tsx
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// src/components/feedback/AlertBanner.tsx
// For system-wide notifications
interface AlertBannerProps {
  variant: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message?: string;
  onDismiss?: () => void;
}
```

#### 2.3 Data Display Components

```typescript
// src/components/data-display/DataTable.tsx
// Single, configurable table component
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    perPage: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSort: (column: string) => void;
  };
  onRowClick?: (row: T) => void;
}

// src/components/data-display/StatCard.tsx
interface StatCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

// src/components/data-display/Timeline.tsx
interface TimelineProps {
  items: {
    id: string;
    title: string;
    description?: string;
    timestamp: Date;
    status: 'completed' | 'current' | 'pending';
  }[];
}
```

### Level 3: Feature Components

Domain-specific components built from Level 1 & 2.

```typescript
// src/components/features/appointments/
export { AppointmentCard } from './AppointmentCard';
export { AppointmentList } from './AppointmentList';
export { BookingCalendar } from './BookingCalendar';
export { TimeSlotPicker } from './TimeSlotPicker';
export { AppointmentStatusBadge } from './AppointmentStatusBadge';

// src/components/features/doctors/
export { DoctorCard } from './DoctorCard';
export { DoctorList } from './DoctorList';
export { DoctorProfile } from './DoctorProfile';
export { SpecialtyBadge } from './SpecialtyBadge';

// src/components/features/payments/
export { PaymentMethodSelector } from './PaymentMethodSelector';
export { PaymentSummary } from './PaymentSummary';
export { OXXOPaymentInstructions } from './OXXOPaymentInstructions';

// src/components/features/consultation/
export { VideoCallWindow } from './VideoCallWindow';
export { ChatPanel } from './ChatPanel';
export { SOAPNoteEditor } from './SOAPNoteEditor';
```

### Level 4: Layout Components

```typescript
// src/components/layout/
export { Header } from './Header';
export { Footer } from './Footer';
export { Sidebar } from './Sidebar';
export { AppShell } from './AppShell';
export { PageHeader } from './PageHeader';
export { Container } from './Container';
export { SkipLink } from './SkipLink';  // Accessibility
export { Breadcrumb } from './Breadcrumb';
```

---

## 🔧 Component Implementation Details

### Unified Error Component (Replaces 71 error.tsx files!)

```typescript
// src/components/feedback/ErrorState.tsx

'use client';

import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ErrorStateProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'page' | 'section' | 'inline';
  error?: Error;
}

export function ErrorState({
  title = 'Ha ocurrido un error',
  message,
  action,
  variant = 'section',
  error
}: ErrorStateProps) {
  const isDev = process.env.NODE_ENV === 'development';
  
  if (variant === 'page') {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold">{title}</h1>
          <p className="mt-2 text-muted-foreground">{message}</p>
          
          <div className="mt-6 flex gap-4 justify-center">
            {action && (
              <Button onClick={action.onClick}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {action.label}
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Ir al inicio
              </Link>
            </Button>
          </div>
          
          {isDev && error && (
            <div className="mt-8 text-left">
              <details className="rounded-lg bg-muted p-4">
                <summary className="cursor-pointer text-sm font-medium">
                  Detalles técnicos (solo desarrollo)
                </summary>
                <pre className="mt-2 overflow-auto text-xs">
                  {error.stack}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
        <AlertTriangle className="h-4 w-4" />
        <span>{message}</span>
        {action && (
          <button
            onClick={action.onClick}
            className="ml-auto underline hover:no-underline"
          >
            {action.label}
          </button>
        )}
      </div>
    );
  }

  // section (default)
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-8 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      {action && (
        <Button className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Usage in app/error.tsx
'use client';

import { ErrorState } from '@/components/feedback/ErrorState';

export default function Error({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <ErrorState
      variant="page"
      title="Algo salió mal"
      message="Lo sentimos, ha ocurrido un error inesperado."
      action={{ label: 'Intentar de nuevo', onClick: reset }}
      error={error}
    />
  );
}

// One-line wrapper for specific pages
// app/doctors/error.tsx
export { default } from '@/components/feedback/ErrorState';
```

### Unified Skeleton Component

```typescript
// src/components/ui/skeleton.tsx

import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const skeletonVariants = cva(
  'animate-pulse rounded-md bg-muted',
  {
    variants: {
      variant: {
        default: 'h-4 w-full',
        text: 'h-4 w-3/4',
        title: 'h-6 w-1/2',
        avatar: 'h-10 w-10 rounded-full',
        image: 'aspect-video w-full',
        card: 'h-32 w-full',
        circle: 'h-12 w-12 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  count?: number;
}

function Skeleton({ 
  className, 
  variant, 
  count = 1,
  ...props 
}: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(skeletonVariants({ variant }), className)}
          {...props}
        />
      ))}
    </>
  );
}

export { Skeleton };

// Preset skeleton patterns
// src/components/ui/skeleton-patterns.tsx

import { Skeleton } from './skeleton';

export function CardSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="title" className="w-1/3" />
          <Skeleton variant="text" className="w-1/4" />
        </div>
      </div>
      <Skeleton variant="text" count={2} />
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <Skeleton variant="title" className="w-1/4" />
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton variant="title" className="h-8 w-1/3" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-32" />
      </div>
      <ListSkeleton count={3} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1" />
        </div>
      ))}
    </div>
  );
}
```

### Medical Severity Badge

```typescript
// src/components/feedback/SeverityBadge.tsx

import { cva, type VariantProps } from 'class-variance-authority';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const severityVariants = cva('', {
  variants: {
    severity: {
      emergency: 'bg-red-100 text-red-800 border-red-200',
      urgent: 'bg-orange-100 text-orange-800 border-orange-200',
      high: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      normal: 'bg-green-100 text-green-800 border-green-200',
      low: 'bg-gray-100 text-gray-800 border-gray-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200',
    },
  },
});

interface SeverityBadgeProps
  extends VariantProps<typeof severityVariants> {
  label: string;
  className?: string;
}

export function SeverityBadge({
  severity,
  label,
  className,
}: SeverityBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(severityVariants({ severity }), className)}
    >
      {label}
    </Badge>
  );
}

// Appointment status badge
const statusLabels: Record<string, string> = {
  pending_payment: 'Pago pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
  no_show: 'No asistió',
  refunded: 'Reembolsada',
};

const statusToSeverity: Record<string, Severity> = {
  pending_payment: 'warning',
  confirmed: 'normal',
  cancelled: 'low',
  completed: 'info',
  no_show: 'urgent',
  refunded: 'low',
};

interface AppointmentStatusBadgeProps {
  status: keyof typeof statusLabels;
}

export function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  return (
    <SeverityBadge
      severity={statusToSeverity[status]}
      label={statusLabels[status]}
    />
  );
}
```

---

## ♿ Accessibility Requirements

### Built-in A11y Features

Every component MUST implement:

```typescript
// Focus management
export interface FocusableProps {
  autoFocus?: boolean;
  tabIndex?: number;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
}

// ARIA attributes
export interface AriaProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'off' | 'assertive' | 'polite';
  role?: string;
}

// Keyboard navigation
export interface KeyboardProps {
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
}
```

### Touch Targets

All interactive elements must meet WCAG 2.5.5:
- Minimum touch target: **44×44px**
- Recommended touch target: **48×48px**

```typescript
// src/components/ui/button.tsx
// shadcn/ui already uses adequate sizing
// Ensure custom components follow:

const buttonVariants = cva(
  'inline-flex items-center justify-center min-h-[44px] min-w-[44px]',
  // ... variants
);
```

---

## 📱 Responsive Breakpoints

```typescript
// Mobile-first approach
const breakpoints = {
  sm: '640px',   // Large phones
  md: '768px',   // Tablets
  lg: '1024px',  // Small laptops
  xl: '1280px',  // Desktops
  '2xl': '1536px' // Large screens
};

// Usage pattern
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {/* Responsive grid */}
</div>
```

---

## ✅ Component Checklist

Before adding a new component:

- [ ] Is this pattern already covered by existing components?
- [ ] Does it use design tokens (no hardcoded values)?
- [ ] Is it accessible (keyboard, screen reader, focus)?
- [ ] Does it have proper TypeScript types?
- [ ] Are touch targets adequate (44×44px minimum)?
- [ ] Does it work on all breakpoints?
- [ ] Is it documented with usage examples?
- [ ] Does it have corresponding tests?

---

## 📊 Component Inventory Summary

| Category | Count | Purpose |
|----------|-------|---------|
| Primitives | 25 | shadcn/ui base components |
| Form | 8 | Input patterns |
| Feedback | 5 | Loading, error, empty states |
| Data Display | 4 | Tables, stats, timelines |
| Feature | ~15 | Domain-specific |
| Layout | 8 | Page structure |
| **Total** | **~65** | (vs 200+ in original) |

**Original codebase had ~300+ components with massive duplication.**

---

## 🎯 Key Decisions

1. **Use shadcn/ui primitives** - Don't reinvent base components
2. **One error component** - Replaces 71 error.tsx files
3. **Unified skeleton patterns** - Consistent loading states
4. **Feature folders** - Co-locate related components
5. **Design tokens** - No hardcoded colors, sizes, or spacing
