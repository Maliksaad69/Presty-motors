#!/usr/bin/env bash
# ==============================================================================
# Presty Motors — Production PostgreSQL Automated Backup Script
# ==============================================================================
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups/postgres}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/presty_motors_backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=14

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

echo "=================================================="
echo " Starting Presty Motors Database Backup..."
echo " Target file: ${BACKUP_FILE}"
echo " Timestamp:   $(date)"
echo "=================================================="

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
  # Fallback to docker container if docker PostgreSQL instance is running
  if docker ps --format '{{.Names}}' | grep -q "cyberguard-postgres"; then
    echo "Using Docker container 'cyberguard-postgres' for pg_dump..."
    docker exec -t cyberguard-postgres pg_dump -U postgres presty_motors | gzip > "${BACKUP_FILE}"
  else
    echo "Error: Neither pg_dump nor Docker cyberguard-postgres container found." >&2
    exit 1
  fi
else
  DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/presty_motors}"
  pg_dump "${DB_URL}" | gzip > "${BACKUP_FILE}"
fi

# Check file size
BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "✅ Backup successfully created! Compressed size: ${BACKUP_SIZE}"

# Generate MD5 checksum
if command -v md5sum &> /dev/null; then
  md5sum "${BACKUP_FILE}" > "${BACKUP_FILE}.md5"
  echo "MD5 Checksum: $(cat "${BACKUP_FILE}.md5")"
fi

# Rotate backups older than RETENTION_DAYS
echo "Rotating backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "presty_motors_backup_*.sql.gz*" -mtime +"${RETENTION_DAYS}" -exec rm -f {} +
echo "Backup routine completed successfully."
