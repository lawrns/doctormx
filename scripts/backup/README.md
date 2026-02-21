# Doctory Database Backup System

Automated backup solution for Doctory's Supabase database with cloud storage support, integrity verification, and disaster recovery capabilities.

## Overview

This backup system provides:

- **Automated daily backups** via GitHub Actions (3 AM CST / 9 AM UTC)
- **Compression** with gzip to minimize storage costs
- **Cloud storage** support (AWS S3, Backblaze B2, or local)
- **Integrity verification** with automated weekly restore tests
- **Slack notifications** for backup failures
- **Retention policies** to automatically clean up old backups

## Quick Start

### 1. Set Environment Variables

Create a `.env.local` file or set these in your GitHub repository secrets:

```bash
# Required for database connection
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_DB_PASSWORD=your-database-password
DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres

# Optional: For cloud storage
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-backup-bucket

# Optional: For Slack notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### 2. Make Scripts Executable

```bash
chmod +x scripts/backup/backup-db.sh
chmod +x scripts/backup/restore-test.sh
```

### 3. Run Manual Backup

```bash
# Full backup with cloud upload
./scripts/backup/backup-db.sh

# Local backup only (no cloud upload)
./scripts/backup/backup-db.sh --local-only
```

## File Structure

```
scripts/backup/
├── backup-db.sh       # Main backup script
├── restore-test.sh    # Restore and verification script
└── README.md          # This file
```

## Scripts

### backup-db.sh

Performs automated database backups.

**Usage:**
```bash
./scripts/backup/backup-db.sh [options]
```

**Options:**
- `--local-only` - Skip cloud upload, keep backup locally
- `--no-compress` - Skip compression (not recommended)
- `--dry-run` - Show what would be done without executing

**Environment Variables:**
| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_DB_PASSWORD` | Yes | Database password |
| `DATABASE_URL` | Auto* | Full database connection string |
| `AWS_ACCESS_KEY_ID` | No* | AWS access key for S3 |
| `AWS_SECRET_ACCESS_KEY` | No* | AWS secret key for S3 |
| `AWS_S3_BUCKET` | No* | S3 bucket name |
| `SLACK_WEBHOOK_URL` | No | Slack webhook for notifications |
| `BACKUP_STORAGE_TYPE` | No | Storage type: `auto`, `s3`, `backblaze`, `local` |
| `BACKUP_RETENTION_DAYS` | No | Days to keep backups (default: 30) |

*Required if not using auto-constructed DATABASE_URL

**Example:**
```bash
export SUPABASE_URL="https://myproject.supabase.co"
export SUPABASE_DB_PASSWORD="mypassword"
export AWS_S3_BUCKET="my-backups"

./scripts/backup/backup-db.sh
```

### restore-test.sh

Restores a backup and verifies data integrity.

**Usage:**
```bash
./scripts/backup/restore-test.sh [backup_file] [options]
```

**Options:**
- `--skip-verify` - Skip data integrity verification
- `--keep-test-db` - Don't drop test database after restore
- `--verbose` - Show detailed output

**Environment Variables:**
| Variable | Required | Description |
|----------|----------|-------------|
| `TEST_DATABASE_URL` | Yes | Test database connection string |
| `DATABASE_URL` | No | Production DB for comparison |
| `SUPABASE_URL` | No | Supabase project URL |
| `SUPABASE_DB_PASSWORD` | No | Database password |
| `SLACK_WEBHOOK_URL` | No | Slack webhook for notifications |

**Example:**
```bash
export TEST_DATABASE_URL="postgresql://postgres:password@test-db.supabase.co:5432/postgres"

# Test with latest backup
./scripts/backup/restore-test.sh

# Test with specific backup
./scripts/backup/restore-test.sh backups/doctory_backup_20250209_030000.sql.gz

# Keep test database for inspection
./scripts/backup/restore-test.sh --keep-test-db
```

## GitHub Actions Workflow

The `.github/workflows/backup.yml` workflow runs automatically:

### Schedule
- **Daily backups:** 3 AM CST (9 AM UTC) every day
- **Weekly verification:** Sundays at 3 AM CST

### Manual Trigger

You can trigger backups manually from GitHub Actions:

1. Go to Actions → Database Backup
2. Click "Run workflow"
3. Select options:
   - `local_only`: Skip cloud upload
   - `skip_verify`: Skip verification

### Required GitHub Secrets

Configure these in your repository settings:

```
Settings → Secrets and variables → Actions → New repository secret
```

| Secret | Required | Description |
|--------|----------|-------------|
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_DB_PASSWORD` | Yes | Database password |
| `DATABASE_URL` | Yes | Full database connection string |
| `AWS_ACCESS_KEY_ID` | Yes* | AWS access key for S3 |
| `AWS_SECRET_ACCESS_KEY` | Yes* | AWS secret key for S3 |
| `AWS_S3_BUCKET` | Yes* | S3 bucket name |
| `TEST_DATABASE_URL` | Yes* | Test database for verification |
| `SLACK_WEBHOOK_URL` | No | Slack webhook for notifications |

*Required only for cloud upload

## Disaster Recovery

### Restoring from Backup

1. **Download the backup:**
   ```bash
   # From S3
   aws s3 cp s3://your-bucket/doctory/backups/doctory_backup_DATE.sql.gz .

   # From local
   cp backups/doctory_backup_DATE.sql.gz .
   ```

2. **Extract the backup:**
   ```bash
   gunzip doctory_backup_DATE.sql.gz
   ```

3. **Restore to database:**
   ```bash
   # Using psql
   psql $DATABASE_URL -f doctory_backup_DATE.sql

   # Using Supabase CLI
   supabase db reset --db-url $DATABASE_URL
   ```

### Testing a Backup Before Restore

Always test backups in a non-production environment:

```bash
# Create a test database in Supabase Dashboard
# Get its connection string

export TEST_DATABASE_URL="postgresql://..."

./scripts/backup/restore-test.sh doctory_backup_DATE.sql.gz --keep-test-db
```

## Monitoring

### Logs

Backup logs are stored in `scripts/backup/`:
- `backup_YYYYMMDD_HHMMSS.log` - Backup execution logs
- `restore_test_YYYYMMDD_HHMMSS.log` - Restore test logs

### Slack Notifications

When configured, the system sends Slack notifications for:
- Backup failures
- Restore test failures
- Successful completion (optional)

### GitHub Actions Artifacts

Artifacts are retained for:
- Database backups: 7 days
- Logs: 7-30 days (depending on type)

## Best Practices

1. **Test your backups regularly** - The weekly restore test verifies integrity
2. **Store backups in multiple locations** - Use S3 + local storage
3. **Encrypt sensitive data** - Ensure S3 bucket encryption is enabled
4. **Monitor backup sizes** - Sudden changes may indicate issues
5. **Document restore procedures** - Keep this README updated with your specific setup

## Troubleshooting

### Backup Fails with "Database connection failed"

Check your `DATABASE_URL`:
```bash
echo $DATABASE_URL
psql $DATABASE_URL -c "SELECT 1"
```

### S3 Upload Fails

Verify AWS credentials:
```bash
aws sts get-caller-identity
aws s3 ls s3://$AWS_S3_BUCKET
```

### Restore Test Fails

Check test database connectivity:
```bash
psql $TEST_DATABASE_URL -c "SELECT 1"
```

### Out of Space

Clean old backups manually:
```bash
find backups/ -name "doctory_backup_*.sql.gz" -mtime +30 -delete
```

## Security Considerations

- **Never commit backup files** to the repository
- **Use GitHub Secrets** for all credentials
- **Enable S3 bucket encryption** (SSE-S3 or SSE-KMS)
- **Restrict S3 bucket access** with bucket policies
- **Rotate access keys** regularly
- **Audit backup access** through CloudTrail

## Support

For issues or questions:
1. Check the logs in `scripts/backup/*.log`
2. Review GitHub Actions runs
3. Verify environment variables are set correctly
4. Test with `--dry-run` flag first
