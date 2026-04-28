#!/usr/bin/env bash
set -euo pipefail

MIGRATIONS_DIR="supabase/migrations"
EXIT_CODE=0

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "ERROR: Migrations directory not found at $MIGRATIONS_DIR"
  exit 1
fi

# Count migration files
count=0
while IFS= read -r -d '' file; do
  count=$((count + 1))
done < <(find "$MIGRATIONS_DIR" -maxdepth 1 -name '*.sql' -print0)

echo "Migration file count: $count"

if [ "$count" -eq 0 ]; then
  echo "ERROR: No migration files found"
  exit 1
fi

# Collect prefixes in sorted order
prefixes=()
while IFS= read -r -d '' file; do
  basename=$(basename "$file")
  prefix="${basename%%_*}"
  prefixes+=("$prefix|$basename")
done < <(find "$MIGRATIONS_DIR" -maxdepth 1 -name '*.sql' -print0 | sort -z)

# Check chronological order
prev_prefix=""
has_order_issue=false
for entry in "${prefixes[@]}"; do
  prefix="${entry%%|*}"
  filename="${entry#*|}"
  if [ -n "$prev_prefix" ]; then
    if [ "$prefix" \< "$prev_prefix" ]; then
      echo "ERROR: Migration out of order: '$filename' comes before '$prev_filename' (prefix $prefix < $prev_prefix)"
      has_order_issue=true
      EXIT_CODE=1
    fi
  fi
  prev_prefix="$prefix"
  prev_filename="$filename"
done

if [ "$has_order_issue" = false ]; then
  echo "Chronological order: OK"
fi

# Check for duplicate prefixes
echo "Checking for duplicate migration prefixes..."
dups=$(find "$MIGRATIONS_DIR" -maxdepth 1 -name '*.sql' \
  | sed 's/.*\///' | sed 's/_.*//' \
  | sort | uniq -d)

if [ -n "$dups" ]; then
  echo "ERROR: Duplicate migration prefixes found:"
  while IFS= read -r dup; do
    files=$(find "$MIGRATIONS_DIR" -maxdepth 1 -name "${dup}_*.sql" \
      | sed 's/.*\///' | tr '\n' ' ')
    echo "  '$dup' appears in: $files"
  done <<< "$dups"
  EXIT_CODE=1
else
  echo "No duplicate migration prefixes: OK"
fi

# Report date range
# Get last element index
last_idx=$(( ${#prefixes[@]} - 1 ))
echo "Migration date range:"
echo "  First: ${prefixes[0]#*|}"
echo "  Last:  ${prefixes[$last_idx]#*|}"

if [ "$EXIT_CODE" -eq 0 ]; then
  echo "All migration integrity checks passed."
else
  echo "Migration integrity checks found issues."
fi

exit $EXIT_CODE
