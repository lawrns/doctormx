# Redis/Upstash Caching Implementation

## Overview

Doctor.mx now has a comprehensive Redis/Upstash caching layer with tag-based invalidation. This implementation provides:

- **Modular architecture** with separate files for client, TTL, keys, and operations
- **Tag-based cache invalidation** for efficient cache management
- **Type-safe operations** with full TypeScript support
- **Graceful fallback** to in-memory cache for development
- **Performance monitoring** with built-in statistics
- **Automatic TTL management** with domain-specific expiration times

## File Structure

```
src/lib/cache/
├── client.ts      # Redis client setup with Upstash integration
├── ttl.ts         # Cache TTL constants (Time-To-Live)
├── keys.ts        # Cache key generators and utilities
├── cache.ts       # High-level cache operations
├── index.ts       # Centralized exports
└── README.md      # This file
```

## Installation

The cache system uses Upstash Redis, which is already included in your dependencies:

```json
{
  "@upstash/redis": "^1.36.1",
  "@upstash/ratelimit": "^2.0.8"
}
```

## Environment Variables

Add these to your `.env.local` file:

```bash
# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

Get these values from [Upstash Console](https://console.upstash.com/).

## Usage

### Basic Operations

```typescript
import { cache, TTL } from '@/lib/cache'

// Get a value
const data = await cache.get('my-key')

// Set a value with TTL
await cache.set('my-key', data, TTL.HOUR_1)

// Delete a value
await cache.del('my-key')

// Invalidate by pattern
await cache.invalidate('doctor:*')
```

### Domain-Specific Operations

#### Doctor Profiles

```typescript
import { cache } from '@/lib/cache'

// Get doctor profile (1 hour cache)
const doctor = await cache.getDoctorProfile(doctorId)

// Set doctor profile
await cache.setDoctorProfile(doctorId, profile)

// Invalidate all doctor-related cache
await cache.invalidateDoctor(doctorId)
```

#### Specialties List

```typescript
// Get specialties (24 hour cache)
const specialties = await cache.getSpecialtiesList()

// Set specialties
await cache.setSpecialtiesList(specialties)

// Invalidate specialties cache
await cache.invalidateSpecialties()
```

#### Appointments

```typescript
// Get available slots (5 minute cache)
const slots = await cache.getAppointmentAvailability(doctorId, date)

// Set available slots
await cache.setAppointmentAvailability(doctorId, date, slots)

// Invalidate availability for a doctor
await cache.invalidateAppointmentAvailability(doctorId)
```

#### Premium/Subscription Status

```typescript
// Get premium status (15 minute cache)
const status = await cache.getPremiumStatus(doctorId)

// Set premium status
await cache.setPremiumStatus(doctorId, status)

// Invalidate subscription cache
await cache.invalidateSubscription(doctorId)
```

### Tag-Based Invalidation

```typescript
import { cache, CacheTags } from '@/lib/cache'

// Invalidate all doctor profiles
await cache.invalidateTag(CacheTags.DOCTOR_PROFILE)

// Invalidate all doctor lists
await cache.invalidateTag(CacheTags.DOCTOR_LIST)

// Invalidate all appointment availability
await cache.invalidateTag(CacheTags.APPOINTMENT_AVAILABILITY)
```

### Custom Keys

```typescript
import {
  doctorProfileKey,
  appointmentAvailabilityKey,
  hashObject
} from '@/lib/cache'

// Generate standardized keys
const key1 = doctorProfileKey('doctor-123')
// => "doctor:profile:doctor-123"

const key2 = appointmentAvailabilityKey('doctor-123', '2024-01-15')
// => "appointment:availability:doctor-123:2024-01-15"

// Hash complex objects for cache keys
const filters = { specialty: 'cardiology', city: 'CDMX' }
const hash = await hashObject(filters)
const key3 = `search:${hash}`
```

## TTL Strategy

| Data Type | TTL | Rationale |
|-----------|-----|-----------|
| Doctor Profiles | 1 hour | Changes infrequently (bio, credentials) |
| Doctor Lists | 15 min | Balance freshness with performance |
| Specialties List | 24 hours | Rarely changes, manual invalidation |
| Appointment Availability | 5 min | Real-time data, changes frequently |
| Premium Status | 15 min | Changes on renewal/cancellation |
| AI Responses | 1 hour | Reduce API calls, safe to cache |
| Reviews | 15 min | Moderate change frequency |
| Search Results | 5 min | Fast-changing data |

## Cache Invalidation Patterns

### On Data Updates

```typescript
// When updating a doctor profile
async function updateDoctorProfile(doctorId: string, data: ProfileUpdate) {
  // 1. Update database
  await db.update(doctorId, data)

  // 2. Invalidate cache
  await cache.invalidateDoctor(doctorId)

  return updatedProfile
}
```

### On Subscriptions

```typescript
// When subscription changes
async function handleSubscriptionUpdate(doctorId: string) {
  // Invalidate subscription-specific cache
  await cache.invalidateSubscription(doctorId)

  // Also invalidate doctor profile (subscription affects it)
  await cache.del(doctorProfileKey(doctorId))
}
```

### On Appointments

```typescript
// When booking an appointment
async function bookAppointment(doctorId: string, date: string, time: string) {
  // 1. Create appointment
  await db.createAppointment({ doctorId, date, time })

  // 2. Invalidate availability for that date
  await cache.invalidateAppointmentAvailability(doctorId, date)

  return appointment
}
```

## Health Monitoring

```typescript
import { cache } from '@/lib/cache'

// Get cache health
const health = await cache.getHealth()
console.log(health)
// {
//   connected: true,
//   type: 'redis',
//   latency: 12,
//   stats: {
//     hits: 1234,
//     misses: 56,
//     hitRate: 0.956
//   }
// }

// Get statistics
const stats = cache.getStats()
console.log(`Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`)
```

## Cache Statistics

The cache module tracks:

- **Hits**: Number of successful cache retrievals
- **Misses**: Number of cache misses (data not found)
- **Hit Rate**: Percentage of requests served from cache
- **Latency**: Average response time for cache operations

Reset statistics:

```typescript
cache.resetStats()
```

## Best Practices

### 1. Always Invalidate on Updates

```typescript
// ❌ Bad: Database update without cache invalidation
await db.updateDoctor(doctorId, data)

// ✅ Good: Invalidate cache after update
await db.updateDoctor(doctorId, data)
await cache.invalidateDoctor(doctorId)
```

### 2. Use Appropriate TTL

```typescript
// ❌ Bad: Too short TTL for static data
await cache.set('specialties', list, TTL.MINUTES_5)

// ✅ Good: Longer TTL for rarely changing data
await cache.set('specialties', list, TTL.DAYS_1)
```

### 3. Use Tag-Based Invalidation

```typescript
// ❌ Bad: Manual pattern matching
await cache.invalidate('doctor:*')
await cache.invalidate('doctors:list:*')
await cache.invalidate('doctor:subscription:*')

// ✅ Good: Tag-based invalidation
await cache.invalidateTag(CacheTags.DOCTOR_PROFILE)
```

### 4. Handle Cache Failures Gracefully

```typescript
// ✅ Good: Always have database fallback
async function getDoctor(doctorId: string) {
  // Try cache first
  const cached = await cache.getDoctorProfile(doctorId)
  if (cached) return cached

  // Fallback to database
  const doctor = await db.getDoctor(doctorId)

  // Update cache for next time
  if (doctor) {
    await cache.setDoctorProfile(doctorId, doctor)
  }

  return doctor
}
```

## Testing

Without Redis configured, the cache automatically falls back to in-memory storage:

```typescript
// This works in both development and production
const data = await cache.getDoctorProfile(doctorId)
```

For testing, you can reset the cache client:

```typescript
import { resetCacheClient } from '@/lib/cache'

beforeEach(() => {
  resetCacheClient()
})
```

## Migration from Old Cache

The old cache interface is still supported for backward compatibility:

```typescript
// Old code still works
import { cache } from '@/lib/cache'

await cache.get('key')
await cache.set('key', value, ttl)
await cache.del('key')
await cache.invalidate('pattern:*')
```

However, new code should use the specialized methods:

```typescript
// New recommended approach
await cache.getDoctorProfile(doctorId)
await cache.setDoctorProfile(doctorId, profile)
await cache.invalidateDoctor(doctorId)
```

## Performance Impact

Expected improvements:

- **Doctor Profiles**: 90%+ cache hit rate, ~10ms response time
- **Specialties List**: Near 100% hit rate, <5ms response time
- **Appointment Availability**: 60-80% hit rate during peak hours
- **Premium Status**: 95%+ hit rate, ~5ms response time

## Troubleshooting

### Cache Not Working

1. Check environment variables are set
2. Verify Redis connectivity: `await cache.getHealth()`
3. Check logs for cache errors

### Stale Data

1. Verify cache invalidation is called on updates
2. Check TTL values are appropriate
3. Use tag-based invalidation for related data

### High Miss Rate

1. Check if cache is being warmed (first request is always a miss)
2. Verify TTL isn't too short for the data type
3. Monitor cache size - may need to increase Redis memory

## API Routes for Cache Management

### GET /api/cache/stats

Get cache statistics (admin only).

Response:
```json
{
  "status": {
    "connected": true,
    "keyCount": 1234
  },
  "cacheKeys": {
    "doctors": 45,
    "availability": 234,
    "lists": 12,
    "total": 1234
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### POST /api/cache/invalidate

Invalidate cache entries (admin only).

Request:
```json
{
  "type": "doctor",
  "doctorId": "doctor-123"
}
```

Or invalidate by pattern:
```json
{
  "pattern": "doctor:*"
}
```

## Future Enhancements

- [ ] Cache warming on deployment
- [ ] Partial cache invalidation for large lists
- [ ] Distributed cache locking for concurrent updates
- [ ] Cache compression for large values
- [ ] Redis Cluster support for high availability
- [ ] Cache analytics dashboard

## Support

For issues or questions:

1. Check this README first
2. Review the code comments in each module
3. Check the logs for error messages
4. Verify Upstash Redis is running and accessible
