# Doctory Database Migrations

## Quick Setup

Run all migrations in order in your Supabase SQL Editor:

1. Go to your Supabase Dashboard → SQL Editor
2. Run each migration file in order:
   - `000_cleanup.sql` (optional - cleans up old schema)
   - `001_initial_schema.sql` (core tables)
   - `002_onboarding_function.sql` (doctor onboarding)
   - `002_simplify_doctor_status.sql` (status simplification)
   - `003_add_missing_columns.sql` (additional columns)
   - `003_ai_tables.sql` (AI/pre-consulta tables)
   - `004_complete_schema.sql` (monetization & advanced features)

## Using psql

If you have `psql` installed:

```bash
# Set your database URL
export DATABASE_URL='postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres'

# Run the migration script
./scripts/run-migrations.sh
```

## Verify Setup

After running migrations, verify by checking these tables exist:
- `profiles`
- `doctors`
- `specialties`
- `appointments`
- `pre_consulta_sessions`
- `doctor_subscriptions`

## Troubleshooting

If you see "relation does not exist" errors:
1. Make sure you ran ALL migrations in order
2. Check the Supabase SQL Editor for any errors
3. Verify the tables exist in Table Editor
