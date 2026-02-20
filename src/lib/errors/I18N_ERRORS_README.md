# I18N Error Handling System

This document describes the internationalized error handling system implemented for Doctor.mx.

## Overview

The error handling system now supports full internationalization (i18n) via `next-intl`. All error messages are stored in translation files (`messages/es.json` and `messages/en.json`) and can be displayed in the user's preferred language.

## Translation Structure

Error messages are organized in `messages/{locale}.json` under the `errors` namespace:

```json
{
  "errors": {
    "medical": {
      "recordError": "...",
      "dataInvalid": "..."
    },
    "auth": {
      "invalidCredentials": "...",
      "sessionExpired": "..."
    },
    // ... more categories
  }
}
```

### Error Categories

- `medical` - Medical/clinical errors
- `emergency` - Emergency detection errors
- `prescription` - Prescription-related errors
- `diagnosis` - Diagnosis errors
- `appointment` - Appointment booking errors
- `auth` - Authentication errors
- `access` - Authorization/access errors
- `validation` - Input validation errors
- `notFound` - Resource not found errors
- `rateLimit` - Rate limiting errors
- `external` - External service errors
- `consent` - Consent/privacy errors
- `payment` - Payment processing errors
- `video` - Video consultation errors
- `generic` - Generic error messages
- `titles` - Error title translations

## Usage

### Server-Side (API Routes)

Use the async error handlers for full i18n support:

```typescript
import { handleErrorAsync, withErrorHandlingAsync } from '@/lib/errors/handler';
import { getLocale } from 'next-intl/server';

// Option 1: Using handleErrorAsync
export async function POST(request: Request) {
  const locale = await getLocale();
  
  try {
    // Your code here
  } catch (error) {
    return handleErrorAsync(error, { locale });
  }
}

// Option 2: Using withErrorHandlingAsync
export async function GET(request: Request) {
  const locale = await getLocale();
  
  return withErrorHandlingAsync(async () => {
    // Your code here
    return Response.json({ success: true, data: result });
  }, { locale });
}

// Option 3: Using createRouteHandlerAsync
import { createRouteHandlerAsync } from '@/lib/errors/handler';

const routeHandler = createRouteHandlerAsync('/api/consult', 'POST');

export async function POST(request: Request) {
  const locale = await getLocale();
  
  return routeHandler(async () => {
    // Your code here
    return Response.json({ success: true, data: result });
  }, { locale });
}
```

### Client-Side (React Components)

Use the `useErrorTranslations` hook or individual helper functions:

```tsx
import { useTranslations } from 'next-intl';
import { useErrorTranslations } from '@/lib/errors/client-handler';
import { toast } from 'sonner';

function MyComponent() {
  const t = useTranslations('errors');
  const { getErrorMessage, createToastError, getErrorTitle } = useErrorTranslations(t);
  
  const handleError = (error: unknown) => {
    // Get translated toast error
    const { title, description, variant } = createToastError(error);
    toast.error(title, { description });
    
    // Or get individual translated messages
    if (error && 'code' in error) {
      const message = getErrorMessage(error);
      const title = getErrorTitle(error);
    }
  };
  
  return (
    // Your component JSX
  );
}
```

### Error Boundaries

```tsx
import { useTranslations } from 'next-intl';
import { getTranslatedErrorInfo } from '@/lib/errors/client-handler';

function ErrorFallback({ error, resetErrorBoundary }: { 
  error: Error; 
  resetErrorBoundary: () => void;
}) {
  const t = useTranslations('errors');
  const { title, message, showRetry, showHome } = getTranslatedErrorInfo(error, t);
  
  return (
    <div className="error-container">
      <h1>{title}</h1>
      <p>{message}</p>
      {showRetry && <button onClick={resetErrorBoundary}>Retry</button>}
      {showHome && <a href="/">Go Home</a>}
    </div>
  );
}
```

## Migration Guide

### From Legacy (Hardcoded Messages)

The legacy functions are still available but marked as deprecated:

```typescript
// OLD (deprecated but still works)
import { getPatientMessage, handleError } from '@/lib/errors';
const message = getPatientMessage(error);

// NEW (recommended for i18n)
import { getPatientMessageAsync, handleErrorAsync } from '@/lib/errors';
const message = await getPatientMessageAsync(error, locale);
```

### Client Components

```tsx
// OLD (Spanish only)
import { handleClientError } from '@/lib/errors';
const message = handleClientError(error);

// NEW (i18n supported)
import { useTranslations } from 'next-intl';
import { getTranslatedErrorMessage } from '@/lib/errors/client-handler';

const t = useTranslations('errors');
const message = getTranslatedErrorMessage(error, t);
```

## Error Code to Translation Key Mapping

Error codes are automatically mapped to translation keys:

| Error Code | Translation Key |
|------------|-----------------|
| `MED_001` | `errors.medical.recordError` |
| `MED_002` | `errors.medical.dataInvalid` |
| `AUTH_001` | `errors.auth.invalidCredentials` |
| `AUTH_002` | `errors.auth.sessionExpired` |
| `VAL_001` | `errors.validation.failed` |
| `EMG_001` | `errors.emergency.detected` |
| `PAY_001` | `errors.payment.failed` |
| ... | ... |

The mapping is defined in `ERROR_CODE_TO_PATIENT_KEY` in `messages.ts`.

## Adding New Error Messages

1. Add the error code to `ERROR_CODES` in `src/lib/errors/messages.ts`:

```typescript
export const ERROR_CODES = {
  // ... existing codes
  NEW_ERROR_CODE: 'NEW_001',
} as const;
```

2. Add the translation key mapping:

```typescript
const ERROR_CODE_TO_PATIENT_KEY: Record<string, string> = {
  // ... existing mappings
  [ERROR_CODES.NEW_ERROR_CODE]: 'errors.category.newError',
};
```

3. Add translations to both `messages/es.json` and `messages/en.json`:

```json
{
  "errors": {
    "category": {
      "newError": "Translated error message"
    }
  }
}
```

4. Run tests to verify: `npm test -- --run src/lib/errors/__tests__/i18n-messages.test.ts`

## Testing

Run the i18n error tests:

```bash
npm test -- --run src/lib/errors/__tests__/i18n-messages.test.ts
```

## Backward Compatibility

- All legacy functions still work but are marked as `@deprecated`
- Legacy functions return Spanish messages by default
- The `PATIENT_MESSAGES` and `DEVELOPER_MESSAGES` objects are kept for reference
- Existing code using `handleError` will continue to work (Spanish messages)

## Best Practices

1. **Always use async handlers for server-side**: Use `handleErrorAsync` instead of `handleError`
2. **Pass locale context**: Always pass the locale to error handlers for proper translations
3. **Use the hook in client components**: Use `useErrorTranslations` for consistency
4. **Test both languages**: When adding new error messages, test in both Spanish and English
5. **Keep error codes consistent**: Follow the existing naming convention (`CATEGORY_NUMBER`)

## Support

For questions or issues with the i18n error system, refer to:
- `src/lib/errors/messages.ts` - Error codes and translation mapping
- `src/lib/errors/handler.ts` - Server-side error handling
- `src/lib/errors/client-handler.ts` - Client-side error handling
- `messages/es.json` and `messages/en.json` - Translation files
