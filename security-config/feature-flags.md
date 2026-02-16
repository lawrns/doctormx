# Feature Flags Infrastructure

## Overview

DoctorMX implements a comprehensive feature flag system for gradual rollout of security-sensitive features. This enables controlled deployment and minimizes the blast radius of potential vulnerabilities.

## Architecture

### Components

1. **Feature Flag Definitions** (`src/lib/feature-flags/flags.ts`)
   - Type-safe flag definitions
   - Default configurations
   - Subscription tier restrictions

2. **Flag Service** (`src/lib/feature-flags.ts`)
   - Database override support
   - Caching layer (60-second TTL)
   - Deterministic rollout based on user ID hashing
   - Blocklist/allowlist support
   - Audit logging

3. **Database Table** (`feature_flags`)
   - Runtime configuration
   - Rollout percentage control
   - User/tier allowlists
   - Blocklist for emergency disable

## Current Flags

| Flag | Default | Rollout | Tiers | Description |
|------|---------|---------|-------|-------------|
| `second_opinion_enabled` | false | 0% | pro, elite | Second opinion request flow |
| `doctor_referrals_enabled` | false | 0% | pro, elite | Doctor-to-doctor referral network |
| `ai_soap_notes_enabled` | false | 0% | pro, elite | AI-generated SOAP notes |
| `directory_claim_flow_enabled` | true | 100% | all | Unclaimed doctor profile claiming |
| `programmatic_seo_enabled` | true | 100% | all | Programmatic SEO directory pages |
| `whatsapp_bot_v2_enabled` | false | 0% | all | WhatsApp bot with AI triage |
| `subscription_tier_specialist_enabled` | false | 0% | all | Specialist tier (1499 MXN) |
| `subscription_tier_clinic_enabled` | false | 0% | all | Clinic tier (2999 MXN) |

## Usage

### Check if Feature is Enabled

```typescript
import { isFeatureEnabled } from '@/lib/feature-flags'

const enabled = await isFeatureEnabled('ai_soap_notes_enabled', {
  userId: user.id,
  subscriptionTier: user.tier,
})
```

### Require Feature (throws if disabled)

```typescript
import { requireFeature } from '@/lib/feature-flags'

await requireFeature('doctor_referrals_enabled', { userId: user.id })
// Feature is guaranteed to be enabled
```

### Get All Flags for User

```typescript
import { getAllFlags } from '@/lib/feature-flags'

const flags = await getAllFlags({
  userId: user.id,
  subscriptionTier: user.tier,
})
// Returns: { second_opinion_enabled: true, ... }
```

## Rollout Strategy

### Gradual Rollout Process

1. **Phase 0: Internal Testing**
   - Enable for specific user IDs
   - Test in staging environment

2. **Phase 1: Limited Beta**
   - 10% rollout to eligible users
   - Monitor for issues

3. **Phase 2: Expanded Beta**
   - Increment rollout by 10% daily
   - Use `incrementRollout()` function

4. **Phase 3: General Availability**
   - 100% rollout
   - Remove feature flag checks after stabilization

### Security Benefits

- **Blast Radius Limitation**: Issues affect only enabled users
- **Instant Rollback**: Disable feature without deployment
- **A/B Testing**: Compare metrics between enabled/disabled users
- **Tier-based Access**: Premium features controlled by subscription

## Audit Trail

All feature flag access is logged to `feature_flag_audit` table:

```sql
SELECT * FROM feature_flag_audit 
WHERE flag_key = 'ai_soap_notes_enabled'
ORDER BY timestamp DESC;
```

## API Reference

### Types

```typescript
interface FlagContext {
  userId?: string
  subscriptionTier?: string
  doctorId?: string
  email?: string
  userAgent?: string
}
```

### Functions

| Function | Purpose |
|----------|---------|
| `isFeatureEnabled(flag, context)` | Check if flag is enabled |
| `requireFeature(flag, context)` | Assert feature is enabled |
| `getAllFlags(context)` | Get all flags for user |
| `incrementRollout(flag, amount)` | Increase rollout percentage |
| `hasBetaAccess(context)` | Check if user has any beta access |

## Database Schema

```sql
CREATE TABLE feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0,
  allowed_user_ids UUID[],
  allowed_subscription_tiers TEXT[],
  blocked_user_ids UUID[],
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
