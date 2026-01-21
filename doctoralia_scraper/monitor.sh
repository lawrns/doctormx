#!/bin/bash

# Monitor scraper progress
OUTPUT_FILE="/private/tmp/claude/-Users-lukatenbosch-Downloads-DOCTORY2-doctory-v2/tasks/b132fb4.output"

echo "=== Doctoralia Scraper Monitor ==="
echo ""

# Show last 30 lines
echo "Recent Activity:"
echo "----------------"
tail -30 "$OUTPUT_FILE" | grep -v "^\[stderr\]"

echo ""
echo "Statistics:"
echo "----------------"

# Count total doctors found
TOTAL=$(grep -o "Total doctors found: [0-9]*" "$OUTPUT_FILE" | awk '{sum+=$4} END {print sum}')
echo "Total doctor URLs collected so far: ${TOTAL:-0}"

# Count errors
ERRORS=$(grep -c "Error on page" "$OUTPUT_FILE" 2>/dev/null || echo "0")
echo "Pages with timeout errors: $ERRORS"

# Check which phase
if grep -q "PHASE 2" "$OUTPUT_FILE"; then
    echo ""
    echo "Current Phase: 2 - Scraping individual profiles"
    SCRAPED=$(grep -c "Saved:" "$OUTPUT_FILE" 2>/dev/null || echo "0")
    echo "Doctor profiles scraped: $SCRAPED"
else
    echo ""
    echo "Current Phase: 1 - Collecting doctor URLs"
fi

# Show data directory size if it exists
if [ -d "./doctors_data" ]; then
    echo ""
    echo "Data Directory Size:"
    du -sh ./doctors_data 2>/dev/null
    echo "Files created: $(find ./doctors_data -type f | wc -l | tr -d ' ')"
fi
