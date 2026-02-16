# Constants - Single Source of Truth (SSOT)

> **Doctor.mx Platform Constants**
>
> Centralized barrel exports for all application constants.

## Overview

This module provides a single entry point for all constants used throughout the Doctor.mx platform. Using this barrel export ensures consistency and enables IDE autocomplete.

## Usage

### Import Specific Constants

```typescript
import { PRICING, TIME, AI, HTTP_STATUS } from '@/constants'
```

### Import with Namespace

```typescript
import * as Constants from '@/constants'

const price = Constants.PRICING.STARTER_PRICE_MXN
const timeout = Constants.TIME.AI_REQUEST_TIMEOUT_MS
```

### Import Types

```typescript
import type { ErrorCode, TableName, AppointmentStatus } from '@/constants'
```

## Constants Reference

### Core Constants (from `@/lib/constants/`)

| Constant | Description | File |
|----------|-------------|------|
| `AI` | AI configuration, models, emergency patterns | `ai.ts` |
| `HTTP_STATUS` | HTTP status codes | `http.ts` |
| `LIMITS` | File sizes, rate limits, pagination | `limits.ts` |
| `PRICING` | Subscription and feature prices | `pricing.ts` |
| `TIME` | Durations, timeouts, cache TTL | `time.ts` |
| `MEDICAL_TERMS` | Spanish medical terminology | `medical-terminology.ts` |

### Domain Constants (from `@/constants/`)

| Constant | Description | File |
|----------|-------------|------|
| `APPOINTMENT_CONFIG` | Scheduling configuration | `appointments.ts` |
| `SPECIALTIES` | Medical specialties list | `appointments.ts` |
| `PAYMENT_CONFIG` | Payment processing config | `payments.ts` |
| `VIDEO_CONFIG` | Video call settings | `video.ts` |
| `APPOINTMENT_STATUS` | Appointment lifecycle statuses | `status.ts` |
| `DOCTOR_STATUS` | Doctor verification statuses | `status.ts` |
| `TABLES` | Database table names | `database.ts` |
| `LEGAL_AGE_MEXICO` | Legal age (18) | `consent.ts` |
| `ARCO_SLA_BUSINESS_DAYS` | SLA for data requests (20 days) | `arco.ts` |
| `ERROR_CODES` | Standardized error codes | `errors.ts` |

### Cache & Rate Limit Constants

| Constant | Description | Source |
|----------|-------------|--------|
| `TTL_*` | Cache TTL values | `@/lib/cache/ttl` |
| `RATE_LIMIT_TIERS` | Rate limit configuration | `@/lib/rate-limit/config` |

## Structure

```
src/constants/
├── index.ts              # Main barrel export
├── README.md             # This file
├── appointments.ts       # Scheduling constants
├── payments.ts           # Payment constants
├── video.ts              # Video call constants
├── status.ts             # Status values
├── database.ts           # Table names
├── consent.ts            # Consent management
├── arco.ts               # Data protection (LFPDPPP)
└── errors.ts             # Error codes and messages
```

## Migration Guide

### From `@/lib/constants`

**Before:**
```typescript
import { AI, TIME } from '@/lib/constants'
```

**After:**
```typescript
import { AI, TIME } from '@/constants'
```

### From `@/config/constants`

**Before:**
```typescript
import { APPOINTMENT_CONFIG, SPECIALTIES } from '@/config/constants'
```

**After:**
```typescript
import { APPOINTMENT_CONFIG, SPECIALTIES } from '@/constants'
```

## Best Practices

1. **Always import from `@/constants`** - Use the barrel export for consistency
2. **Use type imports** - Import types separately: `import type { ErrorCode } from '@/constants'`
3. **Prefer constants over magic numbers** - Use `TIME.MINUTE_IN_MS` instead of `60000`
4. **Check for existing constants** - Before adding new ones, check if they already exist

## Adding New Constants

1. Create or update the appropriate file in `src/constants/`
2. Add JSDoc comments explaining the constant's purpose
3. Export from `src/constants/index.ts`
4. Update this README

## Type Exports

All type exports follow the naming convention: `{ConstantName}Key` for keys, or descriptive names for specific types.

```typescript
// From ai.ts
export type AIKey = keyof typeof AI

// From errors.ts
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]
```
