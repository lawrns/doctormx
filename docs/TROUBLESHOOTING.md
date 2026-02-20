# Troubleshooting Guide

Common issues and solutions for Doctor.mx developers.

## Table of Contents

- [Build Issues](#build-issues)
- [Environment Variables](#environment-variables)
- [Database & Supabase](#database--supabase)
- [Authentication Issues](#authentication-issues)
- [API & Webhooks](#api--webhooks)
- [AI Services](#ai-services)
- [Payment Processing](#payment-processing)
- [Video Consultations](#video-consultations)
- [Testing Issues](#testing-issues)
- [Performance Issues](#performance-issues)

---

## Build Issues

### Build fails with "Module not found"

**Symptom:**
```
Module not found: Can't resolve '@/components/ui/button'
```

**Solutions:**
1. Check that the import path is correct
2. Verify the file exists at the expected location
3. Check `tsconfig.json` paths configuration:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```
4. Restart TypeScript server in your IDE
5. Delete `.next` folder and rebuild:
   ```bash
   rm -rf .next
   npm run build
   ```

---

### Build fails with "Type error"

**Symptom:** TypeScript errors during build

**Solutions:**
1. Run type check separately:
   ```bash
   npx tsc --noEmit
   ```
2. Check for missing type definitions:
   ```bash
   npm install --save-dev @types/missing-package
   ```
3. Update `tsconfig.json` if needed:
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true
     }
   }
   ```

---

### Build hangs or takes too long

**Symptom:** Build process never completes

**Solutions:**
1. Clear Next.js cache:
   ```bash
   rm -rf .next
   rm -rf node_modules/.cache
   ```
2. Check for circular dependencies:
   ```bash
   npx madge --circular src/
   ```
3. Increase Node.js memory:
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```

---

## Environment Variables

### "Missing required environment variable"

**Symptom:**
```
Error: Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL
```

**Solutions:**
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in all required variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (if using payments)
   - `STRIPE_SECRET_KEY`
3. Restart development server after changes
4. Check for typos in variable names

---

### Environment variables not loading

**Symptom:** `process.env.VAR_NAME` is undefined

**Solutions:**
1. Ensure file is named `.env.local` (not just `.env` for Next.js)
2. Variables must be defined before starting the server
3. Client-side variables must start with `NEXT_PUBLIC_`
4. Check for syntax errors in `.env.local`:
   - No spaces around `=`
   - No quotes needed (unless value contains spaces)
   - No trailing comments on the same line

**Correct:**
```
NEXT_PUBLIC_API_URL=https://api.example.com
```

**Incorrect:**
```
NEXT_PUBLIC_API_URL = https://api.example.com  # comment
```

---

## Database & Supabase

### "Connection refused" or timeout errors

**Symptom:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**
1. Check Supabase project status at https://status.supabase.com/
2. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
3. Check if IP is allowlisted in Supabase Dashboard
4. Test connection with curl:
   ```bash
   curl -I https://your-project.supabase.co/rest/v1/
   ```

---

### RLS (Row Level Security) errors

**Symptom:**
```
Error: new row violates row-level security policy
```

**Solutions:**
1. Check RLS policies in Supabase Dashboard
2. Verify user is authenticated
3. Ensure service role key is used for admin operations:
   ```typescript
   import { createServiceClient } from '@/lib/supabase/service';
   const supabase = createServiceClient();
   ```
4. Review policy conditions match the query

---

### Migration fails

**Symptom:** SQL migration errors

**Solutions:**
1. Run migrations in correct order (check timestamps)
2. Check for conflicting table/column names
3. Verify foreign key references exist
4. Run in Supabase SQL Editor to see detailed errors:
   ```sql
   -- Check for existing tables
   SELECT * FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

---

### "Database connection pool exhausted"

**Symptom:**
```
Error: remaining connection slots are reserved
```

**Solutions:**
1. Check for connection leaks
2. Ensure connections are closed properly
3. Use connection pooling (PgBouncer)
4. Limit concurrent connections in settings

---

## Authentication Issues

### "Invalid login credentials" but credentials are correct

**Symptom:** Login fails despite correct email/password

**Solutions:**
1. Check email confirmation status in Supabase Auth
2. Verify user exists:
   ```sql
   SELECT * FROM auth.users WHERE email = 'user@example.com';
   ```
3. Check for RLS blocking profile creation
4. Reset password via Supabase Dashboard

---

### Session expires too quickly

**Symptom:** User is logged out frequently

**Solutions:**
1. Check Supabase Auth settings:
   - Go to Authentication > Settings
   - Adjust "JWT expiry"
2. Implement refresh token logic
3. Check for cookie issues in browser

---

### OAuth redirect fails

**Symptom:** Social login redirect shows error

**Solutions:**
1. Check redirect URL matches exactly in Supabase Dashboard
2. Verify OAuth provider credentials
3. Check for URL encoding issues
4. Ensure HTTPS in production

---

## API & Webhooks

### 404 on API routes

**Symptom:** API routes return 404

**Solutions:**
1. Check file is in `src/app/api/` directory
2. Verify `route.ts` exports correct methods:
   ```typescript
   export async function GET(request: Request) { }
   export async function POST(request: Request) { }
   ```
3. Check URL path matches file location
4. Restart dev server

---

### Webhook signature verification fails

**Symptom:**
```
Error: Webhook signature verification failed
```

**Solutions:**
1. Ensure `STRIPE_WEBHOOK_SECRET` is correct
2. Use raw request body, not parsed JSON
3. Check webhook endpoint URL is correct
4. For local testing, use Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

---

### CORS errors

**Symptom:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solutions:**
1. Check `next.config.ts` headers configuration:
   ```typescript
   async headers() {
     return [
       {
         source: '/api/:path*',
         headers: [
           { key: 'Access-Control-Allow-Origin', value: '*' },
           { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
         ],
       },
     ];
   }
   ```
2. Ensure preflight requests (OPTIONS) are handled
3. Check that origin matches allowed origins

---

## AI Services

### "OpenAI API key invalid"

**Symptom:**
```
Error: 401 - Invalid API key
```

**Solutions:**
1. Verify `OPENAI_API_KEY` is set correctly
2. Check key hasn't been revoked in OpenAI Dashboard
3. Ensure key has required permissions
4. Check billing status (must have payment method)
5. Try regenerating the key

---

### AI responses are slow or timeout

**Symptom:** Requests to OpenAI take >30 seconds

**Solutions:**
1. Implement request timeout:
   ```typescript
   const response = await openai.chat.completions.create({
     // ... config
     timeout: 10000, // 10 seconds
   });
   ```
2. Use streaming responses
3. Check OpenAI status: https://status.openai.com/
4. Implement retry logic with exponential backoff
5. Use faster models (gpt-4o-mini instead of gpt-4o)

---

### "Quota exceeded" errors

**Symptom:**
```
Error: 429 - Rate limit exceeded
```

**Solutions:**
1. Check usage at https://platform.openai.com/usage
2. Implement rate limiting in your app
3. Add user quotas and tracking
4. Upgrade OpenAI plan if needed
5. Implement caching for similar requests

---

### AI responses are inaccurate

**Symptom:** AI gives wrong or irrelevant answers

**Solutions:**
1. Review and improve system prompts
2. Add more context to requests
3. Use RAG (Retrieval-Augmented Generation)
4. Adjust temperature (lower = more deterministic)
5. Implement confidence scoring
6. Add human review for low-confidence responses

---

## Payment Processing

### Stripe payment fails in test mode

**Symptom:** Payments fail with test cards

**Solutions:**
1. Use correct test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Require auth: `4000 0025 0000 3155`
2. Use any future expiry date
3. Use any 3-digit CVC
4. Use any ZIP code

---

### Webhook not receiving events

**Symptom:** Stripe webhooks aren't triggering

**Solutions:**
1. Check webhook endpoint is configured in Stripe Dashboard
2. Verify endpoint URL is publicly accessible (use ngrok for local)
3. Check webhook is enabled for required events
4. Review webhook delivery attempts in Stripe Dashboard
5. Check server logs for webhook errors

---

### "Payment intent requires action"

**Symptom:** 3D Secure or additional authentication needed

**Solutions:**
1. Handle `requires_action` status:
   ```typescript
   if (paymentIntent.status === 'requires_action') {
     // Redirect to authentication URL
   }
   ```
2. Use Stripe Elements for automatic handling
3. Test with `4000 0025 0000 3155`

---

## Video Consultations

### Video call won't connect

**Symptom:** Black screen or connection fails

**Solutions:**
1. Check `DAILY_API_KEY` is set
2. Verify room URL is correct
3. Check Daily.co dashboard for room status
4. Test in different browsers
5. Check firewall isn't blocking WebRTC

---

### Camera/microphone not working

**Symptom:** No video or audio in call

**Solutions:**
1. Check browser permissions:
   - Chrome: Click lock icon in address bar
   - Ensure camera/mic are allowed
2. Test with https://webcamtests.com/
3. Check no other app is using camera
4. Try refreshing the page
5. Check for browser extensions blocking access

---

### Recording fails

**Symptom:** Consultation not recorded

**Solutions:**
1. Check Daily.co plan supports recording
2. Verify recording is enabled in room config
3. Check storage quota in Daily.co
4. Review recording webhook handling

---

## Testing Issues

### Tests fail with "Module not found"

**Symptom:** Jest/Vitest can't resolve imports

**Solutions:**
1. Check `vitest.config.ts` or `jest.config.js` aliases:
   ```typescript
   resolve: {
     alias: {
       '@': path.resolve(__dirname, './src'),
     },
   },
   ```
2. Ensure test environment matches runtime
3. Mock external modules if needed

---

### Environment variables not available in tests

**Symptom:** `process.env.VAR` is undefined in tests

**Solutions:**
1. Create `.env.test` file
2. Set variables in test setup:
   ```typescript
   // vitest.setup.ts
   process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
   ```
3. Use `dotenv` in test config

---

### Supabase tests fail with RLS errors

**Symptom:** Tests can't access data due to RLS

**Solutions:**
1. Use service role key for test setup
2. Create test users with proper roles
3. Disable RLS for test database (not recommended for CI)
4. Use Supabase local CLI for isolated testing

---

### Playwright tests timeout

**Symptom:** E2E tests fail with timeout

**Solutions:**
1. Increase timeout in config:
   ```typescript
   // playwright.config.ts
   export default {
     timeout: 60000,
   };
   ```
2. Ensure dev server is running
3. Check for loading states that block interaction
4. Use `waitForSelector` before interactions

---

## Performance Issues

### Slow page load times

**Symptom:** Pages take >3 seconds to load

**Solutions:**
1. Check for large dependencies:
   ```bash
   npm run analyze
   ```
2. Implement code splitting:
   ```typescript
   const HeavyComponent = dynamic(() => import('./HeavyComponent'));
   ```
3. Optimize images with Next.js Image
4. Use `loading="lazy"` for below-fold images
5. Enable SSR for dynamic content

---

### High memory usage

**Symptom:** App consumes excessive memory

**Solutions:**
1. Check for memory leaks in React components
2. Implement proper cleanup in useEffect
3. Limit concurrent AI requests
4. Use streaming for large responses
5. Monitor with:
   ```bash
   NODE_OPTIONS="--inspect" npm run dev
   ```

---

### Database queries are slow

**Symptom:** API responses take >1 second

**Solutions:**
1. Add database indexes:
   ```sql
   CREATE INDEX idx_appointments_user_id ON appointments(user_id);
   ```
2. Use query caching (Redis/Upstash)
3. Implement pagination
4. Optimize N+1 queries with joins
5. Use Supabase query explain:
   ```typescript
   const { data, error } = await supabase
     .from('appointments')
     .select('*')
     .explain();
   ```

---

## Getting More Help

If the issue persists:

1. **Check Logs:**
   - Server logs: `npm run dev` output
   - Browser console (F12)
   - Supabase logs in Dashboard
   - Vercel deployment logs

2. **Enable Debug Mode:**
   ```bash
   LOG_LEVEL=debug npm run dev
   ```

3. **Review Documentation:**
   - [API Documentation](/docs/api/README.md)
   - [Error Codes Reference](/docs/errors/ERROR_CODES.md)
   - [Architecture Docs](/docs/architecture/)

4. **Create an Issue:**
   Include:
   - Error message (full stack trace)
   - Steps to reproduce
   - Environment details (Node version, OS)
   - Relevant code snippets

---

## Quick Diagnostic Commands

```bash
# Check Node.js version (should be 18+)
node --version

# Check installed packages
npm list

# Clean install
rm -rf node_modules package-lock.json
npm install

# Type check
npx tsc --noEmit

# Lint check
npm run lint

# Run tests
npm test

# Build check
npm run build

# Check environment variables
node -e "console.log(process.env)" | grep NEXT_PUBLIC
```
