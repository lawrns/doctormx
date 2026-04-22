# Sentry Setup for DoctorMX

## Installation Status

✅ Sentry React SDK installed
✅ Configuration files created
✅ Next.js sourcemap upload scripts configured

## One-Time Manual Step Required

**The Sentry wizard requires an interactive terminal. Please complete this step manually:**

### Option 1: Create Project via Dashboard (Recommended)

1. **Visit:** https://sentry.io/org/fyves/projects/?project=create
2. **Create new project:**
   - Name: `doctormx`
   - Platform: `React` or `JavaScript`
3. **Copy the DSN** from the project settings
4. **Update** `src/sentry.config.ts` with your DSN

### Option 2: Run Wizard in Terminal

```bash
# Run this in your local terminal (not through Claude Code)
npx @sentry/wizard@latest -i react --org fyves
```

## Configuration Files

### `.sentryclirc` (Project Config)
```ini
[auth]
token = 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

[defaults]
org = fyves
project = doctormx
```

### `src/sentry.config.ts`
Already created with sensible defaults:
- Error tracking enabled
- Performance monitoring (10% sample rate)
- Session replay (1% sessions, 100% errors)
- Sensitive data filtering
- Development mode filtering

### `package.json`
Configured with release, sourcemap upload, finalize, and deploy scripts that upload `.next` sourcemaps.

## Environment Variables

Add to your `.env` file:
```bash
# Sentry
SENTRY_AUTH_TOKEN=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
```

## Usage

### Development
Sentry is automatically disabled in development mode.

### Production
Errors are captured in production builds when Sentry is initialized with a valid DSN.

### Manual Error Reporting
```typescript
import * as Sentry from "@sentry/react";

// Capture message
Sentry.captureMessage("Something happened");

// Capture exception
try {
  throw new Error("Something went wrong");
} catch (error) {
  Sentry.captureException(error);
}

// Set user context
Sentry.setUser({
  id: "123",
  email: "user@example.com"
});
```

### Performance Monitoring
```typescript
// Start a transaction
const transaction = Sentry.startTransaction({
  name: "doctor-consultation",
  op: "medical"
});

// Add spans
const span = transaction.startChild({
  description: "Processing symptoms",
  op: "process"
});

// ... do work ...

span.finish();
transaction.finish();
```

## Build & Deploy

The Sentry scripts:
1. Creates a new release on build
2. Uploads sourcemaps
3. Associates commits (if git is available)

```bash
# Build with Sentry integration
npm run build

# Deploy with Sentry tracking
npm run sentry:deploy
```

## Verifying Setup

After creating the project in Sentry:

```bash
# Test error capture
curl "https://o4509302601220096.ingest.us.sentry.io/api/4509302602399744/?sentry_key=..."

# Or in your browser console:
throw new Error("Sentry test");
```

## Troubleshooting

### No events appearing
1. Check you're running a production build
2. Verify DSN is correct in `sentry.config.ts`
3. Check browser console for errors

### Sourcemaps not working
1. Ensure `npm run build` completed and `.next` sourcemaps exist
2. Check `SENTRY_AUTH_TOKEN` is set
3. Verify project slug in `.sentryclirc` matches dashboard

## Next Steps

1. Create doctormx project in Sentry dashboard
2. Update DSN in `src/sentry.config.ts`
3. Test with `npm run build && npm run preview`
4. Check Sentry dashboard for events
