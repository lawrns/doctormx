# DoctorMX Operations Runbook

## First 24 Hours After Deployment

- [ ] Verify health endpoint returns 200
- [ ] Confirm Sentry is receiving events (check dashboard)
- [ ] Run E2E smoke tests: `npm run test:e2e`
- [ ] Verify Stripe webhook endpoint responds
- [ ] Check Supabase dashboard for error logs
- [ ] Confirm Daily.co video rooms are creatable
- [ ] Test a booking flow end-to-end
- [ ] Verify admin dashboard is accessible
- [ ] Check Redis connection (AI caching)
- [ ] Review Sentry for any new issues

## Health Checks

### Application Health

```
GET /api/health
```

Expected: 200 OK with `{"status":"ok"}`. If not, check Vercel dashboard for deployment status and recent errors.

### Sentry Dashboard

1. Go to your Sentry project dashboard
2. Check **Issues** for new errors
3. Check **Performance** for slow transactions (p95 > 5s warrants investigation)
4. Monitor **Releases** to confirm the deployed version is tracked

### Database Health

Check Supabase dashboard:
- Database → Query performance for slow queries
- Database → Connections for connection pool saturation
- Logs → Postgres logs for errors

## Rollback

### Vercel Rollback

```bash
vercel rollback
```

Or manually in Vercel dashboard: Deployments → find last working deployment → ⋮ → Promote to Production.

### Database Rollback

**Important:** There is no automated down-migration system. To roll back a migration:

1. Identify the migration to revert (by file name order in `supabase/migrations/`)
2. Write a SQL script to reverse the changes (DROP tables, columns, etc.)
3. Run the script in Supabase SQL Editor
4. Remove or rename the offending migration file

If reverting the most recent migration:

```sql
-- Example: drop tables created in the last migration
DROP TABLE IF EXISTS migration_table_name CASCADE;
```

Test thoroughly after reverting.

## Running Database Migrations

### In Supabase Dashboard

1. Go to Supabase Dashboard → SQL Editor
2. Open each migration file from `supabase/migrations/`
3. Run in alphanumeric order (they are prefixed with sequence numbers)
4. Verify no errors before proceeding to the next

### Via psql (if configured)

```bash
export DATABASE_URL='postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres'

# Run all migrations in order
for f in supabase/migrations/*.sql; do
  psql "$DATABASE_URL" -f "$f"
done
```

## Common Issues & Fixes

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| 500 errors in production | Missing env var | Check `.env.local` has all required vars |
| Stripe payment failures | Webhook secret wrong | Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard |
| Auth redirects in loop | `NEXT_PUBLIC_APP_URL` mismatch | Ensure URL matches the deployed domain |
| AI responses slow | Redis cache cold | First requests will be slow; cache warms up after first use |
| Database errors | Missing migration | Run all 37 migrations in order |
| Sentry no data | `SENTRY_DSN` not set | Verify DSN in environment and instrumentation.ts loads |

## Logs

| Source | Location |
|--------|----------|
| Application errors | Sentry dashboard |
| Vercel runtime logs | Vercel dashboard → Project → Logs |
| Database queries | Supabase → Logs → Postgres Logs |
| Database errors | Supabase → Logs → Postgres Logs |
| API route logs | Vercel → Functions → Logs |
| Build logs | Vercel → Deployments → [deployment] → Build Logs |

## Contact

**On-call engineer:** [Name / Slack handle / Phone]

**Team contact:** [Email / Slack channel]

**Escalation:** [Manager or lead contact, escalation policy]

---

*Last updated: April 2026*
