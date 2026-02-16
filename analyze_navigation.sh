#!/bin/bash

echo "=== Comprehensive Navigation Analysis ==="
echo

# Lists to track files with and without navigation
files_with_navigation=()
files_without_navigation=()

# Find all files
find src/app -name "page.tsx" -o -name "loading.tsx" -o -name "error.tsx" | sort > all_files.txt

echo "Checking navigation patterns in all files..."
echo

while IFS= read -r file; do
    echo "=== $file ==="
    
    # Check for specific navigation patterns
    has_navigation=false
    
    # Check for Link components
    if grep -q "Link href=" "$file" || grep -q "href=" "$file"; then
        echo "✓ Has Link/href components"
        has_navigation=true
    fi
    
    # Check for arrow/left/back icons
    if grep -q -E "(ArrowLeft|back|cancel|Volver|back-to|return|escape)" "$file"; then
        echo "✓ Has back/escape navigation"
        has_navigation=true
    fi
    
    # Check for home navigation
    if grep -q -E "(home|Home|/|inicio)" "$file"; then
        echo "✓ Has home navigation"
        has_navigation=true
    fi
    
    # Check for router navigation
    if grep -q -E "(router\.push|navigate\(|to=)" "$file"; then
        echo "✓ Has router navigation"
        has_navigation=true
    fi
    
    if [ "$has_navigation" = true ]; then
        files_with_navigation+=("$file")
        echo "✅ HAS NAVIGATION"
    else
        files_without_navigation+=("$file")
        echo "❌ NO NAVIGATION FOUND"
    fi
    
    echo
done < all_files.txt

echo
echo "=== SUMMARY ==="
echo "Files with navigation: ${#files_with_navigation[@]}"
echo "Files without navigation: ${#files_without_navigation[@]}"
echo

echo "Files WITHOUT navigation:"
printf "%s\n" "${files_without_navigation[@]}" | sort

echo
echo "=== Files WITH navigation (sample check) ==="
for file in "${files_with_navigation[@]:0:20}"; do
    echo "$file"
    # Show first navigation pattern found
    grep -m 1 -E "(Link href=|href=|ArrowLeft|back|Volver|home|Home|/)" "$file" | head -1
    echo
done
