# DoctorMX Database Rollback Scripts

## Overview
This directory contains comprehensive rollback scripts for all database migrations in the DoctorMX telemedicine platform. These scripts are designed to safely reverse migrations when needed.

**⚠️ CRITICAL WARNING**: Rollback scripts will DELETE DATA. Always create a backup before running any rollback.

## File Structure

```
rollback-scripts/
├── README.md                                    # This file
├── 001_complete_schema_rollback.sql            # Core tables rollback
├── 002_soap_consultations_rollback.sql         # SOAP consultation rollback
├── 003_ai_referrals_rollback.sql               # AI referrals rollback
├── 004_whatsapp_tables_rollback.sql            # WhatsApp tables rollback
├── 005_chat_followup_rollback.sql              # Chat & followup rollback
├── 006_video_appointments_rollback.sql         # Video appointments rollback
├── 007_subscription_fixes_rollback.sql         # Subscription fixes rollback
├── 008_performance_indexes_rollback.sql        # Performance indexes rollback
├── 009_followup_enhancements_rollback.sql      # Followup enhancements rollback
├── 010_medical_knowledge_rollback.sql          # Medical knowledge rollback
├── 011_performance_enhanced_rollback.sql       # Enhanced indexes rollback
├── 20250209_arco_system_rollback.sql           # ARCO rights system rollback
├── 20250209_consent_system_rollback.sql        # Consent system rollback
├── 20250209_digital_signatures_rollback.sql    # Digital signatures rollback
├── 20250209_security_events_rollback.sql       # Security events rollback
├── 20250210_consent_fixes_rollback.sql         # Consent fixes rollback
├── 20250211_web_vitals_rollback.sql            # Web vitals rollback
└── 20250211_audit_trail_rollback.sql           # Audit trail rollback
```

## Migration Order

Migrations should be rolled back in **REVERSE ORDER** of application:

### Phase 1: Core System (Last to Rollback)
1. `20250211_immutable_audit_trail.sql` → `20250211_audit_trail_rollback.sql`
2. `20250211150000_web_vitals_metrics.sql` → `20250211_web_vitals_rollback.sql`
3. `20250210_consent_system_fixes.sql` → `20250210_consent_fixes_rollback.sql`
4. `20250209_security_events.sql` → `20250209_security_events_rollback.sql`

### Phase 2: Compliance Systems
5. `20250209_digital_signatures.sql` → `20250209_digital_signatures_rollback.sql`
6. `20250209_consent_system.sql` → `20250209_consent_system_rollback.sql`
7. `20250209_arco_system.sql` → `20250209_arco_system_rollback.sql`

### Phase 3: Enhanced Features
8. `011_performance_indexes_enhanced.sql` → `011_performance_enhanced_rollback.sql`
9. `010_medical_knowledge_rag.sql` → `010_medical_knowledge_rollback.sql`
10. `009_followup_enhancements.sql` → `009_followup_enhancements_rollback.sql`
11. `008_performance_indexes.sql` → `008_performance_indexes_rollback.sql`
12. `007_fix_subscription_tables.sql` → `007_subscription_fixes_rollback.sql`
13. `006_add_video_appointments.sql` → `006_video_appointments_rollback.sql`
14. `005_chat_and_followup_tables.sql` → `005_chat_followup_rollback.sql`
15. `004_whatsapp_tables.sql` → `004_whatsapp_tables_rollback.sql`

### Phase 4: Core Features (First to Rollback)
16. `003_ai_referrals_tracking.sql` → `003_ai_referrals_rollback.sql`
17. `002_soap_consultations.sql` → `002_soap_consultations_rollback.sql`
18. `001_complete_schema.sql` → `001_complete_schema_rollback.sql`

## Usage Instructions

### Single Migration Rollback

```bash
# Connect to Supabase and execute rollback
psql $SUPABASE_DB_URL -f rollback-scripts/20250211_web_vitals_rollback.sql
```

### Multiple Migrations Rollback

```bash
# Rollback multiple migrations in reverse order
psql $SUPABASE_DB_URL -f rollback-scripts/20250211_web_vitals_rollback.sql
psql $SUPABASE_DB_URL -f rollback-scripts/20250210_consent_fixes_rollback.sql
psql $SUPABASE_DB_URL -f rollback-scripts/20250209_security_events_rollback.sql
```

### Complete System Rollback (⚠️ DESTRUCTIVE)

```bash
# Run all rollbacks in reverse order (use with extreme caution)
for script in $(ls -r rollback-scripts/*.sql | grep -v README); do
    echo "Rolling back: $script"
    psql $SUPABASE_DB_URL -f "$script"
done
```

## Safety Features

Each rollback script includes:

1. **Verification Checks**: Verifies the migration was applied before rollback
2. **Transaction Safety**: All operations wrapped in BEGIN/COMMIT
3. **Dependency Order**: Tables dropped in correct dependency order
4. **Policy Cleanup**: RLS policies removed before tables
5. **Type Cleanup**: Custom ENUM types dropped after tables

## Data Loss Warnings

### High Risk (Legal/Compliance Data)
- `20250209_digital_signatures_rollback.sql` - Deletes legally binding signatures
- `20250209_consent_system_rollback.sql` - Deletes user consent records
- `20250209_arco_system_rollback.sql` - Deletes data protection requests
- `20250211_audit_trail_rollback.sql` - Deletes compliance audit trail

### Medium Risk (User Data)
- `001_complete_schema_rollback.sql` - Deletes all user profiles, appointments, payments
- `002_soap_consultations_rollback.sql` - Deletes consultation records
- `005_chat_followup_rollback.sql` - Deletes chat messages and followups

### Low Risk (Analytics/Metrics)
- `20250211_web_vitals_rollback.sql` - Deletes performance metrics
- `008_performance_indexes_rollback.sql` - Only removes indexes

## Pre-Rollback Checklist

Before running any rollback:

- [ ] Create full database backup
- [ ] Verify backup integrity
- [ ] Document reason for rollback
- [ ] Notify stakeholders
- [ ] Schedule maintenance window
- [ ] Test rollback in staging environment
- [ ] Have restore procedure ready

## Post-Rollback Verification

After rollback, verify:

```sql
-- Check tables were removed
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'target_table';

-- Check indexes were removed
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' AND indexname LIKE 'idx_target%';

-- Check types were removed
SELECT typname FROM pg_type 
WHERE typname = 'target_type';
```

## Emergency Contacts

- Database Administrator: [TO BE FILLED]
- Compliance Officer: [TO BE FILLED]
- Technical Lead: [TO BE FILLED]

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0 | 2026-02-16 | Initial rollback scripts for all migrations |

---

**Generated**: 2026-02-16T09:42:35-06:00  
**Backup ID**: DB-BKP-20260216-001  
**Project**: DoctorMX Telemedicine Platform
