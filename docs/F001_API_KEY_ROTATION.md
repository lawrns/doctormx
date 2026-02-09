# F001: Rotate Exposed API Keys - User Action Required

## Status: PENDING (User Action Required)

## Description

API keys were found exposed in the codebase during security audit. These keys must be rotated immediately.

## Affected Services

Based on the security audit findings, the following API keys may need rotation:

1. **Supabase**
   - Service Role Key (if found in any logs or commits)
   - Anon Key (public, but should still be rotated if compromised)

2. **OpenAI**
   - API Key (if found in .env or code)

3. **Stripe**
   - Secret Key (if found in .env or code)
   - Webhook Secret (if found in .env or code)

4. **Twilio**
   - Account SID
   - Auth Token

5. **GLM/z.ai**
   - API Key

## Action Steps

1. **Check git history for exposed keys**
   ```bash
   git log --all --full-history --source -- "**/.env" "**/.env.example"
   git log --all --full-history -S "sk-" --source
   git log --all --full-history -S "service_role" --source
   ```

2. **Rotate keys for each service**
   - Go to each service's dashboard
   - Generate new API keys
   - Update environment variables
   - Revoke old keys

3. **Update environment**
   - Update `.env.local` (development)
   - Update production environment variables (Vercel/dotenv)

4. **Verify**
   - Run application to ensure keys work
   - Check API calls are successful

5. **Clean git history** (if keys were committed)
   ```bash
   # Use BFG Repo-Cleaner or git-filter-repo to remove keys from history
   ```

## References

- Security Audit Report: See Phase 0 Security Audit outputs
- OWASP Key Management: https://owasp.org/www-project-key-management/
