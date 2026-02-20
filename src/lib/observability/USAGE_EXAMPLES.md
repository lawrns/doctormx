# Observability Usage Examples

This document shows how to use the observability features implemented for Doctor.mx.

## Overview

The observability module provides:

1. **Health Check Endpoint** (`/api/health`) - OBS-001
2. **Web Vitals Tracking** - OBS-002
3. **Request Logging** - OBS-005
4. **Structured Logging**
5. **Metrics Collection**

---

## OBS-001: Health Check Endpoint

### Testing the Health Endpoint

```bash
# Test the health endpoint
curl http://localhost:3000/api/health

# Example response:
{
  "status": "healthy",
  "timestamp": "2026-02-20T17:15:00.561Z",
  "version": "0.1.0",
  "uptime": 1234,
  "environment": "development",
  "checks": {
    "database": { "status": "ok", "latency": 15 },
    "cache": { "status": "ok", "latency": 5 },
    "stripe": { "status": "ok", "latency": 120 },
    "whatsapp": { "status": "skipped", "latency": 0, "message": "WhatsApp credentials not configured" },
    "twilio": { "status": "skipped", "latency": 0, "message": "Twilio credentials not configured" },
    "ai": { "status": "ok", "latency": 1, "message": "Configured providers: GLM, OpenAI" }
  }
}
```

### Status Codes

- `200 OK` - All services healthy or degraded
- `503 Service Unavailable` - One or more critical services are down

---

## OBS-002: Web Vitals Tracking

### Web Vitals Metrics Tracked

- **CLS** (Cumulative Layout Shift) - Visual stability
- **FCP** (First Contentful Paint) - Initial load
- **LCP** (Largest Contentful Paint) - Loading performance
- **TTFB** (Time to First Byte) - Server response time
- **INP** (Interaction to Next Paint) - Interactivity (Chrome 108+)

### Components Already Integrated

The Web Vitals tracking is already integrated in `src/app/layout.tsx`:

```tsx
import { WebVitalsProvider } from '@/components/performance/WebVitalsProvider'
import { WebVitalsReporter } from '@/components/performance/WebVitalsReporter'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <WebVitalsProvider />
        <WebVitalsReporter debug={process.env.NODE_ENV === 'development'} />
        {children}
      </body>
    </html>
  )
}
```

### Viewing Web Vitals in Development

When running in development mode, Web Vitals are logged to the console:

```
[Web Vitals] ✅ LCP: 1200ms (good)
[Web Vitals] ✅ CLS: 0.05 (good)
[Web Vitals] ✅ FCP: 800ms (good)
[Web Vitals] ⚠️ TTFB: 1200ms (needs-improvement)
```

### Web Vitals API Endpoint

```bash
# Get endpoint info
curl http://localhost:3000/api/metrics/web-vitals

# Submit a metric (automatically done by WebVitalsReporter)
curl -X POST http://localhost:3000/api/metrics/web-vitals \
  -H "Content-Type: application/json" \
  -d '{
    "name": "LCP",
    "value": 1200,
    "rating": "good"
  }'
```

---

## OBS-005: Request Logging

### Basic Usage - Wrap API Route Handler

```typescript
// src/app/api/example/route.ts
import { NextResponse } from 'next/server'
import { withApiMiddleware } from '@/lib/observability/api-middleware'

// Simple usage with all defaults
export const GET = withApiMiddleware(async (request) => {
  const data = await fetchData()
  return NextResponse.json({ data })
})

// With custom configuration
export const POST = withApiMiddleware(
  async (request) => {
    const body = await request.json()
    const result = await createData(body)
    return NextResponse.json({ result }, { status: 201 })
  },
  {
    logLevel: 'debug',
    errorLogLevel: 'error',
    sampleRate: 1.0,
    recordMetrics: true,
  }
)
```

### Individual Middleware Functions

```typescript
import { 
  withLogging, 
  withErrorHandling, 
  withCors 
} from '@/lib/observability/api-middleware'

// Apply individual middlewares
export const GET = withCors(
  withLogging(
    withErrorHandling(async (request) => {
      return NextResponse.json({ data: 'example' })
    })
  ),
  { allowedOrigins: ['https://doctor.mx'] }
)
```

### Manual Request Logging

```typescript
import { logRequest, logResponse } from '@/lib/observability/request-logger'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Log the request
  const { requestId, startTime, requestData } = await logRequest(request)
  
  try {
    // Your handler logic
    const data = await fetchData()
    const response = NextResponse.json({ data })
    
    // Log the response
    logResponse(requestData, response, startTime)
    
    // Add request ID to response
    response.headers.set('x-request-id', requestId)
    return response
  } catch (error) {
    const errorResponse = NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
    
    // Log the error
    logResponse(requestData, errorResponse, startTime, {}, error as Error)
    throw error
  }
}
```

### Request Logger Configuration Options

```typescript
interface RequestLoggerConfig {
  logLevel?: 'debug' | 'info' | 'warn' | 'error'      // Default: 'info'
  errorLogLevel?: 'debug' | 'info' | 'warn' | 'error' // Default: 'warn'
  sampleRate?: number                                 // Default: 1 (log all)
  logHeaders?: boolean                                // Default: true
  logQuery?: boolean                                  // Default: true
  redactedHeaders?: string[]                          // Default: ['authorization', 'cookie', ...]
  redactedQueryParams?: string[]                      // Default: ['token', 'password', ...]
  excludePaths?: (string | RegExp)[]                  // Default: ['/api/health', ...]
  recordMetrics?: boolean                             // Default: true
  maxBodySize?: number                                // Default: 10000
}
```

### Example Log Output

**Request Start (Debug Level):**
```json
{
  "timestamp": "2026-02-20T17:15:00.561Z",
  "level": "debug",
  "message": "Request started: GET /api/users",
  "context": {
    "requestId": "1740071700561-abc123",
    "method": "GET",
    "path": "/api/users",
    "userAgent": "Mozilla/5.0...",
    "ip": "192.168.1.1"
  }
}
```

**Successful Response (Info Level):**
```json
{
  "timestamp": "2026-02-20T17:15:00.681Z",
  "level": "info",
  "message": "✅ GET /api/users 200 - 120ms",
  "context": {
    "requestId": "1740071700561-abc123",
    "method": "GET",
    "path": "/api/users",
    "statusCode": 200,
    "durationMs": 120,
    "userId": "user-123"
  }
}
```

**Error Response (Warn Level):**
```json
{
  "timestamp": "2026-02-20T17:15:00.781Z",
  "level": "warn",
  "message": "⚠️ POST /api/users 400 - 45ms",
  "context": {
    "requestId": "1740071700781-def456",
    "method": "POST",
    "path": "/api/users",
    "statusCode": 400,
    "durationMs": 45
  }
}
```

---

## Structured Logging

### Basic Usage

```typescript
import { logger } from '@/lib/observability'

// Simple logging
logger.info('User logged in', { userId: '123', ip: '192.168.1.1' })
logger.warn('Rate limit approaching', { userId: '123', requests: 95 })
logger.error('Database connection failed', { service: 'postgres' }, error)

// Child logger with preset context
const userLogger = logger.child({ userId: '123', sessionId: 'abc' })
userLogger.info('User action') // Includes userId and sessionId automatically

// Timed operations
const result = await logger.time(
  'fetch user data',
  async () => {
    return await db.users.findById('123')
  },
  { userId: '123' }
)
// Logs: "fetch user data completed" with duration_ms
```

---

## Metrics Collection

### Basic Usage

```typescript
import { metrics } from '@/lib/observability'

// Counters
metrics.increment('user_signups')
metrics.increment('api_calls', 1, { endpoint: '/users', method: 'GET' })

// Gauges
metrics.gauge('active_users', 150)
metrics.gauge('queue_depth', 42, { queue: 'email' })

// Histograms (timing, sizes, etc.)
metrics.histogram('api_latency', 120, { endpoint: '/users' })
metrics.histogram('response_size', 1024)

// Predefined API metrics
metrics.apiRequest('/users', 'GET', 200, 120)

// Feature-specific metrics
metrics.secondOpinion.created()
metrics.referrals.accepted()
metrics.soapNotes.tokensUsed(1500)

// Force flush (on shutdown)
await metrics.flush()
```

### Initialize Metrics with Cleanup

```typescript
import { initMetrics } from '@/lib/observability'

// In your app initialization
const cleanupMetrics = initMetrics()

// On shutdown
process.on('SIGTERM', () => {
  cleanupMetrics()
})
```

---

## Complete Example: API Route with Full Observability

```typescript
// src/app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { withApiMiddleware, logger, metrics } from '@/lib/observability'
import { createClient } from '@/lib/supabase/server'

// GET /api/appointments - List appointments
export const GET = withApiMiddleware(async (request: NextRequest) => {
  const userId = request.headers.get('x-user-id')
  
  logger.info('Fetching appointments', { userId })
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', userId)
  
  if (error) {
    logger.error('Failed to fetch appointments', { userId }, error)
    throw new Error('Database error', { cause: error })
  }
  
  metrics.increment('appointments.listed', 1, { userId: userId || 'unknown' })
  
  return NextResponse.json({ appointments: data })
}, {
  logLevel: 'info',
  errorLogLevel: 'error',
  recordMetrics: true,
})

// POST /api/appointments - Create appointment
export const POST = withApiMiddleware(async (request: NextRequest) => {
  const body = await request.json()
  const userId = request.headers.get('x-user-id')
  
  logger.info('Creating appointment', { userId, doctorId: body.doctorId })
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('appointments')
    .insert({ ...body, user_id: userId })
    .select()
    .single()
  
  if (error) {
    logger.error('Failed to create appointment', { userId, body }, error)
    throw new Error('Failed to create appointment')
  }
  
  metrics.increment('appointments.created')
  metrics.soapNotes.generated() // If SOAP notes were generated
  
  return NextResponse.json({ appointment: data }, { status: 201 })
}, {
  logLevel: 'debug', // More verbose for creation
  recordMetrics: true,
})
```

---

## Testing Observability

### Run Tests

```bash
# Run all observability tests
npm test -- src/lib/observability

# Run specific test file
npm test -- src/lib/observability/__tests__/request-logger.test.ts

# Run health endpoint tests
npm test -- src/app/api/health
```

### Manual Testing

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test with request ID tracking
curl -H "X-Request-ID: test-123" http://localhost:3000/api/appointments

# View logs in development
npm run dev
# Logs appear in console with structured format
```

---

## Configuration

### Environment Variables

```bash
# Log level (debug, info, warn, error)
LOG_LEVEL=info

# Node environment affects log formatting
NODE_ENV=production  # JSON format
NODE_ENV=development # Pretty print format
```

### TypeScript Types

All observability exports include full TypeScript support:

```typescript
import type {
  LogLevel,
  LogContext,
  MetricType,
  MetricLabels,
  RequestLogData,
  ResponseLogData,
  RequestLoggerConfig,
  ApiHandler,
  MiddlewareConfig,
} from '@/lib/observability'
```
