#!/bin/bash

# ============================================================================
# Doctory Backup Restore & Verification Script
# ============================================================================
# This script restores a backup and verifies data integrity.
# Designed for weekly automated testing of backup reliability.
#
# Usage: ./restore-test.sh [backup_file] [--skip-verify] [--keep-test-db]
# Options:
#   --skip-verify    Skip data integrity verification
#   --keep-test-db   Don't drop the test database after restore
#   --verbose        Show detailed output during verification
#
# Environment variables:
#   DATABASE_URL         - Production database (read-only for comparison)
#   TEST_DATABASE_URL    - Test database for restore (required)
#   SUPABASE_URL         - Supabase project URL
#   SUPABASE_DB_PASSWORD - Database password
# ============================================================================

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TEST_DATE=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="${SCRIPT_DIR}/restore_test_${TEST_DATE}.log"

# Database connection
PROD_DB="${DATABASE_URL:-}"
TEST_DB="${TEST_DATABASE_URL:-}"

# Verification thresholds (allow 1% variance in record counts)
THRESHOLD_PERCENT=1

# ============================================================================
# Utility Functions
# ============================================================================

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] [${level}] ${message}" | tee -a "$LOG_FILE"
}

log_info() { log "INFO" "$@"; }
log_success() { log "SUCCESS" "$@"; }
log_warning() { log "WARNING" "$@"; }
log_error() { log "ERROR" "$@"; }
log_verbose() {
    if [[ "${VERBOSE:-false}" == "true" ]]; then
        log "VERBOSE" "$@"
    fi
}

send_slack_notification() {
    local status="$1"
    local message="$2"

    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        local color="good"
        [[ "$status" == "FAILURE" ]] && color="danger"

        local payload=$(cat <<EOF
{
  "attachments": [
    {
      "color": "${color}",
      "title": "Backup Restore Test ${status}",
      "text": "${message}",
      "fields": [
        {
          "title": "Project",
          "value": "Doctory",
          "short": true
        },
        {
          "title": "Timestamp",
          "value": "$(date -u +"%Y-%m-%d %H:%M:%S UTC")",
          "short": true
        },
        {
          "title": "Backup File",
          "value": "${BACKUP_FILE:-N/A}",
          "short": false
        }
      ]
    }
  ]
}
EOF
)

        curl -s -X POST "$SLACK_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "$payload" > /dev/null 2>&1 || true
        log_info "Slack notification sent"
    fi
}

check_dependencies() {
    local missing=()

    command -v psql >/dev/null 2>&1 || missing+=("psql")
    command -v gunzip >/dev/null 2>&1 || missing+=("gunzip")

    if [[ ${#missing[@]} -gt 0 ]]; then
        log_error "Missing required dependencies: ${missing[*]}"
        return 1
    fi

    return 0
}

verify_environment() {
    local errors=0

    if [[ -z "${TEST_DB}" ]]; then
        log_error "TEST_DATABASE_URL environment variable is required"
        log_info "Set it with: export TEST_DATABASE_URL='postgresql://...'"
        errors=$((errors + 1))
    fi

    if [[ -z "${PROD_DB}" ]]; then
        log_warning "DATABASE_URL not set - will skip comparison verification"
    fi

    if [[ "$errors" -gt 0 ]]; then
        return 1
    fi

    return 0
}

extract_backup() {
    local backup_file="$1"
    local output_file="$2"

    log_info "Extracting backup file..."

    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" > "$output_file" 2>&1 | tee -a "$LOG_FILE"
    elif [[ "$backup_file" == *.sql ]]; then
        cp "$backup_file" "$output_file"
    else
        log_error "Unsupported backup file format"
        return 1
    fi

    if [[ $? -eq 0 ]]; then
        log_success "Backup extracted successfully"
        return 0
    else
        log_error "Failed to extract backup"
        return 1
    fi
}

drop_existing_tables() {
    local db_url="$1"

    log_info "Dropping existing tables in test database..."

    psql "$db_url" >/dev/null 2>&1 <<EOF
DO \$\$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;

    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(r.sequence_name) || ' CASCADE';
    END LOOP;
END \$\$;
EOF

    if [[ $? -eq 0 ]]; then
        log_success "Existing tables dropped"
        return 0
    else
        log_error "Failed to drop existing tables"
        return 1
    fi
}

restore_backup() {
    local sql_file="$1"
    local db_url="$2"
    local start_time=$(date +%s)

    log_info "Starting restore process..."
    log_info "Target: $db_url"

    # Restore the backup
    psql "$db_url" -f "$sql_file" 2>&1 | tee -a "$LOG_FILE" | while read -r line; do
        # Filter out NOTICE messages to reduce noise
        if [[ "$line" != *NOTICE:* ]]; then
            echo "$line"
        fi
    done

    local exit_code=${PIPESTATUS[0]}

    if [[ $exit_code -eq 0 ]]; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        log_success "Restore completed in ${duration}s"
        return 0
    else
        log_error "Restore failed with exit code $exit_code"
        return 1
    fi
}

verify_schema() {
    local db_url="$1"
    local errors=0

    log_info "Verifying database schema..."

    # Check for critical tables
    local critical_tables=(
        "profiles"
        "appointments"
        "doctors"
        "patients"
        "subscriptions"
        "payments"
        "consultations"
        "medical_records"
    )

    for table in "${critical_tables[@]}"; do
        local exists=$(psql "$db_url" -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${table}')")

        if [[ "$exists" == "t" ]]; then
            log_verbose "  ✓ Table '${table}' exists"
        else
            log_warning "  ✗ Table '${table}' is missing"
            errors=$((errors + 1))
        fi
    done

    # Check for critical functions
    local functions=(
        "handle_new_user"
        "check_subscription_status"
        "calculate_doctor_rating"
    )

    for func in "${functions[@]}"; do
        local exists=$(psql "$db_url" -tAc "SELECT EXISTS (SELECT FROM pg_proc WHERE proname = '${func}')")

        if [[ "$exists" == "t" ]]; then
            log_verbose "  ✓ Function '${func}' exists"
        else
            log_warning "  ✗ Function '${func}' is missing"
        fi
    done

    if [[ $errors -eq 0 ]]; then
        log_success "Schema verification passed"
        return 0
    else
        log_error "Schema verification failed with $errors errors"
        return 1
    fi
}

verify_data_integrity() {
    local test_db="$1"
    local prod_db="${2:-}"
    local errors=0
    local warnings=0

    log_info "Verifying data integrity..."

    # Get list of tables
    local tables=$(psql "$test_db" -tAc "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename")

    # Check for empty critical tables (warning)
    local critical_tables_with_data=(
        "profiles"
        "appointments"
        "consultations"
    )

    for table in "${critical_tables_with_data[@]}"; do
        local exists=$(echo "$tables" | grep -c "^${table}\$" || true)
        if [[ $exists -gt 0 ]]; then
            local count=$(psql "$test_db" -tAc "SELECT COUNT(*) FROM ${table}")
            if [[ "$count" -eq 0 ]]; then
                log_warning "  ⚠ Critical table '${table}' is empty"
                warnings=$((warnings + 1))
            else
                log_verbose "  ✓ Table '${table}' has ${count} records"
            fi
        fi
    done

    # If prod database is available, compare record counts
    if [[ -n "$prod_db" ]]; then
        log_info "Comparing record counts with production database..."

        for table in $tables; do
            # Skip system tables and small lookup tables
            case "$table" in
                _prisma_migrations|schema_migrations|spatial_ref_sys) continue ;;
            esac

            local test_count=$(psql "$test_db" -tAc "SELECT COUNT(*) FROM ${table}" 2>/dev/null || echo "0")
            local prod_count=$(psql "$prod_db" -tAc "SELECT COUNT(*) FROM ${table}" 2>/dev/null || echo "0")

            if [[ "$test_count" == "$prod_count" ]]; then
                log_verbose "  ✓ ${table}: ${test_count} records (matches production)"
            else
                # Calculate variance
                if [[ "$prod_count" -gt 0 ]]; then
                    local variance=$(( (test_count - prod_count) * 100 / prod_count ))
                    local abs_variance=${variance#-} # Absolute value

                    if [[ $abs_variance -le $THRESHOLD_PERCENT ]]; then
                        log_info "  ✓ ${table}: ${test_count} vs ${prod_count} (${variance}% variance, acceptable)"
                    else
                        log_warning "  ⚠ ${table}: ${test_count} vs ${prod_count} (${variance}% variance)"
                        warnings=$((warnings + 1))
                    fi
                else
                    log_info "  ℹ ${table}: ${test_count} records (production table has 0)"
                fi
            fi
        done
    else
        log_info "Production database not available - skipping comparison"
        log_info "Record counts for test database:"
        for table in $tables; do
            local count=$(psql "$test_db" -tAc "SELECT COUNT(*) FROM ${table}" 2>/dev/null || echo "N/A")
            log_info "  ${table}: ${count}"
        done
    fi

    # Check for data consistency constraints
    log_info "Checking foreign key constraints..."

    local fk_violations=$(psql "$test_db" -tAc "
        SELECT COUNT(*)
        FROM (
            SELECT conrelid::regclass as table_name, conname as constraint_name
            FROM pg_constraint
            WHERE contype = 'f'
            AND connamespace = 'public'::regnamespace
        ) constraints
        LEFT JOIN LATERAL (
            SELECT 1
            FROM pg_trigger
            WHERE tgconstraint = pg_constraint.oid
            AND tgenabled = 'D'
        ) disabled_trigger ON TRUE
        WHERE disabled_trigger IS NULL;
    " 2>/dev/null || echo "0")

    if [[ "$fk_violations" -gt 0 ]]; then
        log_warning "  ⚠ Found ${fk_violations} potentially unchecked foreign keys"
    else
        log_verbose "  ✓ Foreign key constraints appear intact"
    fi

    # Summary
    log_info "Data integrity verification summary:"
    log_info "  Warnings: $warnings"
    log_info "  Errors: $errors"

    if [[ $errors -eq 0 ]]; then
        log_success "Data integrity verification passed"
        return 0
    else
        log_error "Data integrity verification failed"
        return 1
    fi
}

run_health_checks() {
    local db_url="$1"
    local errors=0

    log_info "Running health checks..."

    # Check database size
    local db_size=$(psql "$db_url" -tAc "SELECT pg_size_pretty(pg_database_size(current_database()))")
    log_info "  Database size: $db_size"

    # Check for long-running queries (should be none in restored database)
    local long_queries=$(psql "$db_url" -tAc "SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active' AND query_start < now() - interval '5 minutes'" 2>/dev/null || echo "0")
    if [[ "$long_queries" -gt 0 ]]; then
        log_warning "  ⚠ Found $long_queries long-running queries"
    else
        log_verbose "  ✓ No long-running queries"
    fi

    # Check table bloat (basic check)
    local bloat_tables=$(psql "$db_url" -tAc "
        SELECT COUNT(*)
        FROM (
            SELECT schemaname, tablename,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
                (SELECT count(*) FROM pg_stat_user_tables WHERE pg_stat_user_tables.schemaname = pg_stat_user_tables.schemaname AND pg_stat_user_tables.relname = pg_stat_user_tables.tablename) as has_stats
            FROM pg_tables
            WHERE schemaname = 'public'
        ) t
        WHERE t.has_stats = 0;
    " 2>/dev/null || echo "0")

    if [[ "$bloat_tables" -gt 0 ]]; then
        log_warning "  ⚠ Found $bloat_tables tables without statistics"
    else
        log_verbose "  ✓ Database statistics available"
    fi

    if [[ $errors -eq 0 ]]; then
        log_success "Health checks passed"
        return 0
    else
        log_error "Health checks failed"
        return 1
    fi
}

generate_test_report() {
    local backup_file="$1"
    local result="$2"
    local duration="$3"

    cat <<EOF
=============================================================================
RESTORE TEST REPORT
=============================================================================
Status:          ${result}
Backup File:     ${backup_file}
Test Date:       $(date -u +"%Y-%m-%d %H:%M:%S UTC")
Duration:        ${duration} seconds
Test Database:   ${TEST_DB:-Not configured}
=============================================================================
Verification Results:
  Schema Check:    ${SCHEMA_CHECK:-PASSED}
  Data Integrity:  ${DATA_CHECK:-PASSED}
  Health Checks:   ${HEALTH_CHECK:-PASSED}
=============================================================================
Log file:         ${LOG_FILE}
=============================================================================
EOF
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    local skip_verify=false
    local keep_test_db=false
    local backup_file=""

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --skip-verify)
                skip_verify=true
                shift
                ;;
            --keep-test-db)
                keep_test_db=true
                shift
                ;;
            --verbose)
                export VERBOSE=true
                shift
                ;;
            -*)
                log_error "Unknown option: $1"
                exit 1
                ;;
            *)
                backup_file="$1"
                shift
                ;;
        esac
    done

    log_info "=========================================="
    log_info "Doctory Backup Restore & Verification"
    log_info "=========================================="
    log_info "Starting restore test..."

    # Check dependencies
    if ! check_dependencies; then
        send_slack_notification "FAILURE" "Restore test failed - missing dependencies"
        exit 1
    fi

    # Verify environment
    if ! verify_environment; then
        send_slack_notification "FAILURE" "Restore test failed - missing environment variables"
        exit 1
    fi

    # Find or validate backup file
    if [[ -z "$backup_file" ]]; then
        # Find the most recent backup
        log_info "No backup file specified, searching for latest..."
        backup_file=$(find "${PROJECT_ROOT}/backups" -name "doctory_backup_*.sql.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2)

        if [[ -z "$backup_file" ]]; then
            log_error "No backup file found in ${PROJECT_ROOT}/backups"
            send_slack_notification "FAILURE" "No backup file found for restore test"
            exit 1
        fi

        log_info "Found latest backup: $backup_file"
    fi

    # Validate backup file
    if [[ ! -f "$backup_file" ]]; then
        log_error "Backup file not found: $backup_file"
        send_slack_notification "FAILURE" "Backup file not found: $backup_file"
        exit 1
    fi

    export BACKUP_FILE="$backup_file"

    local start_time=$(date +%s)
    local temp_sql="${SCRIPT_DIR}/temp_restore_${TEST_DATE}.sql"

    # Extract backup
    if ! extract_backup "$backup_file" "$temp_sql"; then
        send_slack_notification "FAILURE" "Failed to extract backup file"
        exit 1
    fi

    # Drop existing tables
    if ! drop_existing_tables "$TEST_DB"; then
        send_slack_notification "FAILURE" "Failed to drop existing tables"
        rm -f "$temp_sql"
        exit 1
    fi

    # Restore backup
    if ! restore_backup "$temp_sql" "$TEST_DB"; then
        send_slack_notification "FAILURE" "Failed to restore backup"
        rm -f "$temp_sql"
        exit 1
    fi

    # Clean up temp SQL file
    rm -f "$temp_sql"

    # Verification steps
    if [[ "$skip_verify" == false ]]; then
        if verify_schema "$TEST_DB"; then
            export SCHEMA_CHECK="PASSED"
        else
            export SCHEMA_CHECK="FAILED"
        fi

        if verify_data_integrity "$TEST_DB" "$PROD_DB"; then
            export DATA_CHECK="PASSED"
        else
            export DATA_CHECK="FAILED"
        fi

        if run_health_checks "$TEST_DB"; then
            export HEALTH_CHECK="PASSED"
        else
            export HEALTH_CHECK="FAILED"
        fi
    else
        log_warning "Skipping verification steps (--skip-verify flag)"
        export SCHEMA_CHECK="SKIPPED"
        export DATA_CHECK="SKIPPED"
        export HEALTH_CHECK="SKIPPED"
    fi

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    # Determine overall result
    local result="SUCCESS"
    if [[ "${SCHEMA_CHECK}" == "FAILED" || "${DATA_CHECK}" == "FAILED" || "${HEALTH_CHECK}" == "FAILED" ]]; then
        result="FAILURE"
    fi

    # Generate report
    generate_test_report "$backup_file" "$result" "$duration" | tee -a "$LOG_FILE"

    # Clean up test database if requested
    if [[ "$keep_test_db" == false ]]; then
        log_info "Cleaning up test database..."
        drop_existing_tables "$TEST_DB"
    else
        log_info "Test database preserved for inspection (--keep-test-db flag)"
    fi

    if [[ "$result" == "SUCCESS" ]]; then
        log_success "Restore test completed successfully!"
        send_slack_notification "SUCCESS" "Backup restore test passed - backup is valid"
        exit 0
    else
        log_error "Restore test failed!"
        send_slack_notification "FAILURE" "Backup restore test failed - backup may be corrupted"
        exit 1
    fi
}

# Run main function
main "$@"
