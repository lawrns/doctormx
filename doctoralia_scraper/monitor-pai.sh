#!/bin/bash

# Monitor PAI scraper progress
echo "=== PAI Doctor Scraper Monitor ==="
echo ""

# Check if scraper is running
if pgrep -f "scrape-pai-resume.js" > /dev/null; then
    echo "✅ Scraper is running"
else
    echo "❌ Scraper is not running"
fi

echo ""
echo "Progress:"
echo "----------------"

# Check progress file
if [ -f "./scrape_progress.json" ]; then
    COMPLETED=$(cat ./scrape_progress.json | jq -r '.completed | length' 2>/dev/null || echo "0")
    echo "Completed specialty/city combos: $COMPLETED"
    
    echo ""
    echo "Last completed:"
    cat ./scrape_progress.json | jq -r '.completed[-5:]' 2>/dev/null | sed 's/^/  - /'
fi

echo ""
echo "Data Directory Status:"
echo "----------------"

if [ -d "./doctors_data" ]; then
    # Count total doctors
    TOTAL_JSON=$(find ./doctors_data -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
    TOTAL_WEBP=$(find ./doctors_data -name "*.webp" 2>/dev/null | wc -l | tr -d ' ')
    
    echo "Total doctors scraped: $TOTAL_JSON"
    echo "Total photos downloaded: $TOTAL_WEBP"
    
    echo ""
    echo "Specialties processed:"
    ls -1 ./doctors_data 2>/dev/null | head -10 | sed 's/^/  - /'
    
    if [ $(ls -1 ./doctors_data 2>/dev/null | wc -l | tr -d ' ') -gt 10 ]; then
        echo "  ... and $(($(ls -1 ./doctors_data 2>/dev/null | wc -l | tr -d ' ') - 10)) more"
    fi
    
    echo ""
    echo "Directory size:"
    du -sh ./doctors_data 2>/dev/null
else
    echo "No data directory found"
fi

echo ""
echo "Recent Activity:"
echo "----------------"
# Show recent directories created
if [ -d "./doctors_data" ]; then
    find ./doctors_data -type d -mtime -1 | head -10 | sed 's/^/  /'
fi
