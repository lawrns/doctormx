#!/bin/bash

# ============================================================================
# Doctory Database Backup Script
# ============================================================================
# This script performs automated database backups with compression and
# optional upload to cloud storage (S3, Backblaze B2, or local).
#
# Usage: ./backup-db.sh [options]
# Options:
#   --local-only      Skip cloud upload, keep local backup only
#   --no-compress     Skip compression step
#   --dry-run         Show what would be done without executing
#
# Environment variables required:
#   SUPABASE_URL      - Your Supabase project URL
#   SUPABASE_DB_PASSWORD - Database password
#   BACKUP_PATH       - Local backup directory (default: ./backups)
#
# Optional for cloud upload:
#   AWS_ACCESS_KEY_ID     - AWS/S3 access key
#   AWS_SECRET_ACCESS_KEY - AWS/S3 secret key
#   AWS_S3_BUCKET         - S3 bucket name
#   BACKBLAZE_KEY_ID      - Backblaze B2 key ID
#   BACKBLAZE_APPLICATION_KEY - Backblaze B2 application key
#   BACKBLAZE_BUCKET      - Backblaze B2 bucket name
#   SLACK_WEBHOOK_URL     - For failure notifications
# ============================================================================

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="doctory_backup_${BACKUP_DATE}"
LOG_FILE="${SCRIPT_DIR}/backup_${BACKUP_DATE}.log"

# Default backup path (can be overridden by env var)
BACKUP_PATH="${BACKUP_PATH:-${PROJECT_ROOT}/backups}"

# Storage configuration
STORAGE_TYPE="${BACKUP_STORAGE_TYPE:-auto}" # auto, s3, backblaze, local
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}" # Keep backups for 30 days

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
      "title": "Database Backup ${status}",
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
          "value": "${BACKUP_NAME}.sql.gz",
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
    command -v gzip >/dev/null 2>&1 || missing+=("gzip")
    command -v supabase >/dev/null 2>&1 || missing+=("supabase")

    if [[ "${STORAGE_TYPE}" == "s3" || "${STORAGE_TYPE}" == "auto" ]]; then
        command -v aws >/dev/null 2>&1 || missing+=("aws")
    fi

    if [[ ${#missing[@]} -gt 0 ]]; then
        log_error "Missing required dependencies: ${missing[*]}"
        log_info "Install with:"
        for dep in "${missing[@]}"; do
            case "$dep" in
                psql) log_info "  - psql: PostgreSQL client (install postgresql-client)" ;;
                gzip) log_info "  - gzip: Compression utility" ;;
                supabase) log_info "  - supabase: npm install -g supabase" ;;
                aws) log_info "  - aws: AWS CLI v2 (for S3 upload)" ;;
            esac
        done
        return 1
    fi

    return 0
}

verify_environment() {
    local errors=0

    if [[ -z "${SUPABASE_URL:-}" ]]; then
        log_error "SUPABASE_URL environment variable is not set"
        errors=$((errors + 1))
    fi

    if [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
        log_error "SUPABASE_DB_PASSWORD environment variable is not set"
        errors=$((errors + 1))
    fi

    if [[ -z "${DATABASE_URL:-}" ]]; then
        # Construct DATABASE_URL from SUPABASE_URL and password
        if [[ -n "${SUPABASE_URL:-}" && -n "${SUPABASE_DB_PASSWORD:-}" ]]; then
            local project_id=$(echo "$SUPABASE_URL" | sed -E 's|https://||' | sed -E 's|\.supabase\.co.*||')
            export DATABASE_URL="postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.${project_id}.supabase.co:5432/postgres"
            log_info "Constructed DATABASE_URL from SUPABASE_URL"
        fi
    fi

    if [[ "$STORAGE_TYPE" == "s3" && -z "${AWS_S3_BUCKET:-}" ]]; then
        log_error "AWS_S3_BUCKET environment variable is required for S3 storage"
        errors=$((errors + 1))
    fi

    if [[ "$errors" -gt 0 ]]; then
        return 1
    fi

    return 0
}

create_backup_directory() {
    if [[ ! -d "$BACKUP_PATH" ]]; then
        mkdir -p "$BACKUP_PATH"
        log_info "Created backup directory: $BACKUP_PATH"
    fi
}

dump_database() {
    local output_file="$1"
    local start_time=$(date +%s)

    log_info "Starting database dump..."
    log_info "Output file: $output_file"

    # Try supabase db dump first, fall back to pg_dump
    if command -v supabase >/dev/null 2>&1; then
        log_info "Using Supabase CLI for database dump"
        supabase db dump -f "$output_file" --db-url "$DATABASE_URL" 2>&1 | tee -a "$LOG_FILE"
    else
        log_info "Using pg_dump for database dump"
        pg_dump "$DATABASE_URL" --no-owner --no-acl --format=plain > "$output_file" 2>&1 | tee -a "$LOG_FILE"
    fi

    if [[ $? -eq 0 ]]; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        local file_size=$(du -h "$output_file" | cut -f1)
        log_success "Database dump completed in ${duration}s (${file_size})"
        return 0
    else
        log_error "Database dump failed"
        return 1
    fi
}

compress_backup() {
    local input_file="$1"
    local output_file="${input_file}.gz"
    local start_time=$(date +%s)

    log_info "Compressing backup..."

    gzip -c "$input_file" > "$output_file" 2>&1 | tee -a "$LOG_FILE"

    if [[ $? -eq 0 ]]; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        local original_size=$(du -h "$input_file" | cut -f1)
        local compressed_size=$(du -h "$output_file" | cut -f1)
        log_success "Compression completed in ${duration}s (${original_size} -> ${compressed_size})"

        # Remove uncompressed file after successful compression
        rm "$input_file"
        log_info "Removed uncompressed backup file"

        echo "$output_file"
        return 0
    else
        log_error "Compression failed"
        return 1
    fi
}

upload_to_s3() {
    local file="$1"
    local s3_key="doctory/backups/$(basename "$file")"

    log_info "Uploading to S3: s3://${AWS_S3_BUCKET}/${s3_key}"

    aws s3 cp "$file" "s3://${AWS_S3_BUCKET}/${s3_key}" \
        --storage-class STANDARD_IA \
        2>&1 | tee -a "$LOG_FILE"

    if [[ $? -eq 0 ]]; then
        log_success "Upload to S3 completed"

        # Set lifecycle rules for automatic deletion
        aws s3api put-object-tagging \
            --bucket "$AWS_S3_BUCKET" \
            --key "$s3_key" \
            --tagging 'TagSet=[{Key=Retention,Value='$(date +%Y-%m-%d)'}]' \
            2>/dev/null || true

        return 0
    else
        log_error "S3 upload failed"
        return 1
    fi
}

upload_to_backblaze() {
    local file="$1"
    local b2_key="doctory/backups/$(basename "$file")"

    log_info "Uploading to Backblaze B2: ${BACKBLAZE_BUCKET}/${b2_key}"

    # B2 upload using their API or CLI
    if command -v b2 >/dev/null 2>&1; then
        b2 upload-file "$BACKBLAZE_BUCKET" "$file" "$b2_key" 2>&1 | tee -a "$LOG_FILE"
    else
        log_warning "B2 CLI not found, attempting with generic S3 API"
        # Backblaze B2 has an S3-compatible API
        aws s3 cp "$file" "s3://${BACKBLAZE_BUCKET}/${b2_key}" \
            --endpoint-url "${BACKBLAZE_ENDPOINT_URL:-https://s3.us-west-002.backblazeb2.com}" \
            2>&1 | tee -a "$LOG_FILE"
    fi

    if [[ $? -eq 0 ]]; then
        log_success "Upload to Backblaze completed"
        return 0
    else
        log_error "Backblaze upload failed"
        return 1
    fi
}

cleanup_old_backups() {
    log_info "Cleaning up old backups (older than ${RETENTION_DAYS} days)..."

    # Clean local backups
    find "$BACKUP_PATH" -name "doctory_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -print |
    while read -r old_file; do
        log_info "Removing old backup: $old_file"
        rm -f "$old_file"
    done

    # For S3, you would typically use lifecycle policies
    # This is just for cleanup of any local metadata
    log_success "Cleanup completed"
}

generate_backup_summary() {
    local backup_file="$1"
    local file_size=$(du -h "$backup_file" | cut -f1)
    local file_path=$(realpath "$backup_file")

    cat <<EOF
=============================================================================
BACKUP SUMMARY
=============================================================================
Backup Name:     ${BACKUP_NAME}
Backup File:     ${file_path}
File Size:       ${file_size}
Timestamp:       $(date -u +"%Y-%m-%d %H:%M:%S UTC")
Storage Type:    ${STORAGE_TYPE}
Retention:       ${RETENTION_DAYS} days
=============================================================================
To restore this backup:
  ./restore-test.sh "${backup_file}"
=============================================================================
EOF
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    local dry_run=false
    local local_only=false
    local no_compress=false

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --dry-run)
                dry_run=true
                shift
                ;;
            --local-only)
                local_only=true
                shift
                ;;
            --no-compress)
                no_compress=true
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    log_info "=========================================="
    log_info "Doctory Database Backup"
    log_info "=========================================="
    log_info "Starting backup process..."

    if [[ "$dry_run" == true ]]; then
        log_warning "DRY RUN MODE - No actual changes will be made"
    fi

    # Check dependencies
    if ! check_dependencies; then
        send_slack_notification "FAILURE" "Backup failed due to missing dependencies"
        exit 1
    fi

    # Verify environment
    if ! verify_environment; then
        send_slack_notification "FAILURE" "Backup failed due to missing environment variables"
        exit 1
    fi

    # Create backup directory
    create_backup_directory

    # Backup file path
    local backup_file="${BACKUP_PATH}/${BACKUP_NAME}.sql"

    # Dump database
    if [[ "$dry_run" == false ]]; then
        if ! dump_database "$backup_file"; then
            send_slack_notification "FAILURE" "Database dump failed"
            exit 1
        fi
    else
        log_info "[DRY RUN] Would dump database to: $backup_file"
        backup_file="${BACKUP_PATH}/DRY_RUN_${BACKUP_NAME}.sql"
        echo "-- Dry run backup file" > "$backup_file"
    fi

    # Compress backup
    if [[ "$no_compress" == false ]]; then
        if [[ "$dry_run" == false ]]; then
            if ! compressed_file=$(compress_backup "$backup_file"); then
                send_slack_notification "FAILURE" "Backup compression failed"
                exit 1
            fi
            backup_file="$compressed_file"
        else
            log_info "[DRY RUN] Would compress backup file"
            backup_file="${backup_file}.gz"
        fi
    fi

    # Upload to cloud storage
    if [[ "$local_only" == false && "$dry_run" == false ]]; then
        # Auto-detect storage type
        if [[ "$STORAGE_TYPE" == "auto" ]]; then
            if [[ -n "${AWS_S3_BUCKET:-}" && -n "${AWS_ACCESS_KEY_ID:-}" ]]; then
                STORAGE_TYPE="s3"
            elif [[ -n "${BACKBLAZE_BUCKET:-}" && -n "${BACKBLAZE_KEY_ID:-}" ]]; then
                STORAGE_TYPE="backblaze"
            else
                STORAGE_TYPE="local"
                log_warning "No cloud storage configured, using local storage only"
            fi
        fi

        case "$STORAGE_TYPE" in
            s3)
                upload_to_s3 "$backup_file"
                ;;
            backblaze)
                upload_to_backblaze "$backup_file"
                ;;
            local)
                log_info "Skipping cloud upload (local-only mode)"
                ;;
        esac
    fi

    # Cleanup old backups
    if [[ "$dry_run" == false ]]; then
        cleanup_old_backups
    fi

    # Generate summary
    log_info ""
    generate_backup_summary "$backup_file" | tee -a "$LOG_FILE"

    log_success "Backup completed successfully!"
    log_info "Log file: $LOG_FILE"

    send_slack_notification "SUCCESS" "Database backup completed successfully"

    return 0
}

# Run main function
main "$@"
