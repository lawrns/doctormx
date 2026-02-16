# DoctorMX Database Restore Procedure

## Document Information
- **Version**: 1.0
- **Created**: 2026-02-16T09:42:35-06:00
- **Backup ID**: DB-BKP-20260216-001
- **Classification**: CRITICAL - Medical Data

## Overview

This document provides step-by-step instructions for restoring the DoctorMX database from backup. This is a **CRITICAL PROCEDURE** - any errors could result in permanent data loss.

## Prerequisites

### Required Access
- Supabase project access with `postgres` role
- Service Role Key for administrative operations
- Access to backup storage location

### Required Tools
- `psql` (PostgreSQL 14+)
- `pg_restore` (if using custom format backups)
- Access to Supabase Dashboard (optional but recommended)

## Environment Setup

### 1. Set Environment Variables

```bash
# Supabase connection
export SUPABASE_URL="https://oxlbametpfubwnrmrbsv.supabase.co"
export SUPABASE_DB_URL="postgresql://postgres:[PASSWORD]@db.oxlbametpfubwnrmrbsv.supabase.co:5432/postgres"
export SUPABASE_SERVICE_KEY="[SERVICE_ROLE_KEY]"

# Backup location
export BACKUP_DIR="/path/to/backups"
export BACKUP_FILE="database-backup-2026-02-16.sql"
```

### 2. Verify Connection

```bash
# Test database connection
psql $SUPABASE_DB_URL -c "SELECT version();"

# Expected output:
# PostgreSQL 15.x on x86_64-pc-linux-gnu...
```

## Restore Scenarios

### Scenario A: Complete Database Restore (Disaster Recovery)

Use when the entire database needs to be restored.

#### Step 1: Pre-Restore Checklist

- [ ] Notify all stakeholders of maintenance window
- [ ] Stop all application services
- [ ] Create snapshot of current state (even if corrupted)
- [ ] Verify backup file integrity
- [ ] Ensure sufficient disk space (2x database size)

#### Step 2: Create Safety Snapshot

```bash
# Create a snapshot of current state before restore
pg_dump $SUPABASE_DB_URL > pre_restore_snapshot_$(date +%Y%m%d_%H%M%S).sql
```

#### Step 3: Full Database Restore

**⚠️ WARNING**: This will DELETE ALL CURRENT DATA

```bash
# Method 1: Direct restore using psql
psql $SUPABASE_DB_URL < $BACKUP_DIR/$BACKUP_FILE

# Method 2: Restore with verbose output and error logging
psql $SUPABASE_DB_URL -v ON_ERROR_STOP=1 -a -f $BACKUP_DIR/$BACKUP_FILE 2>&1 | tee restore.log
```

#### Step 4: Verify Restore

```sql
-- Connect to database and run verification queries
psql $SUPABASE_DB_URL

-- Check core tables
SELECT 'profiles' as table_name, COUNT(*) as row_count FROM profiles
UNION ALL
SELECT 'doctors', COUNT(*) FROM doctors
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'soap_consultations', COUNT(*) FROM soap_consultations
UNION ALL
SELECT 'arco_requests', COUNT(*) FROM arco_requests;
```

Expected output should show non-zero counts for populated tables.

### Scenario B: Selective Table Restore

Use when only specific tables need restoration.

#### Step 1: Extract Table from Backup

```bash
# Extract specific table definition and data
grep -A 1000 "CREATE TABLE public.appointments" $BACKUP_FILE > appointments_restore.sql
```

#### Step 2: Restore Single Table

```sql
-- Truncate existing data (optional)
TRUNCATE TABLE appointments CASCADE;

-- Restore from extracted SQL
\i appointments_restore.sql
```

### Scenario C: Point-in-Time Recovery

**Note**: Requires WAL archiving enabled (not available on all Supabase tiers).

Contact Supabase Support for point-in-time recovery assistance.

## Verification Procedures

### 1. Schema Verification

```sql
-- Verify all expected tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'profiles', 'doctors', 'appointments', 'payments',
    'soap_consultations', 'arco_requests', 'consent_versions',
    'digital_signatures', 'audit_logs'
)
ORDER BY table_name;
```

### 2. Data Integrity Verification

```sql
-- Verify foreign key relationships
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table,
    ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';

-- Verify no orphaned records
SELECT COUNT(*) as orphaned_appointments
FROM appointments a
LEFT JOIN doctors d ON a.doctor_id = d.id
WHERE d.id IS NULL;
```

### 3. RLS Policy Verification

```sql
-- Verify RLS is enabled on sensitive tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'doctors', 'appointments', 'payments');

-- Verify policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 4. Application Connectivity Test

```bash
# Test application can connect
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
supabase.from('profiles').select('count').then(console.log).catch(console.error);
"
```

## Post-Restore Steps

### 1. Restart Services

```bash
# Restart application services
# (Commands depend on deployment environment)
systemctl restart doctormx-app
# or
pm2 restart doctormx
# or
kubectl rollout restart deployment/doctormx
```

### 2. Verify Application Functionality

- [ ] User login works
- [ ] Doctor search works
- [ ] Appointment booking works
- [ ] Payment processing works
- [ ] Chat messaging works
- [ ] SOAP consultations work

### 3. Monitor Error Logs

```bash
# Check application logs
tail -f /var/log/doctormx/application.log

# Check database logs
# (Available in Supabase Dashboard)
```

## Rollback from Failed Restore

If restore fails:

1. **Stop the restore process** (Ctrl+C if running)
2. **Restore from pre-restore snapshot**:
   ```bash
   psql $SUPABASE_DB_URL < pre_restore_snapshot_YYYYMMDD_HHMMSS.sql
   ```
3. **Contact Supabase Support** if needed
4. **Document the failure** for post-mortem

## Common Issues and Solutions

### Issue 1: Permission Denied

```
ERROR: permission denied for table profiles
```

**Solution**: Ensure using service role key, not anon key

### Issue 2: Constraint Violations

```
ERROR: duplicate key value violates unique constraint
```

**Solution**: Truncate table before restore or use `ON CONFLICT` clause

### Issue 3: Extension Not Found

```
ERROR: extension "uuid-ossp" does not exist
```

**Solution**: Enable extensions first:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### Issue 4: Out of Memory

**Solution**: Restore in smaller chunks:
```bash
# Split backup and restore in parts
split -l 10000 $BACKUP_FILE backup_part_
for part in backup_part_*; do
    psql $SUPABASE_DB_URL < $part
done
```

## Compliance Considerations

### Medical Data Handling
- Verify HIPAA compliance during restore
- Ensure audit logs are preserved
- Document all restore activities

### Data Retention
- Verify retention policies are re-applied
- Confirm ARCO request history is intact
- Validate consent records are preserved

## Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| Database Administrator | [TBD] | [TBD] |
| DevOps Lead | [TBD] | [TBD] |
| Compliance Officer | [TBD] | [TBD] |
| Supabase Support | - | support@supabase.io |

## Document Maintenance

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-16 | Database Safety Specialist | Initial document |

---

**CRITICAL REMINDER**: Always test restore procedures in a non-production environment before executing in production.
