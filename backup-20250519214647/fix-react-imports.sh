#!/bin/bash

# Fix duplicate React imports
find src -type f \( -name "*.tsx" -o -name "*.jsx" \) -exec grep -l "import React from" {} \; | xargs grep -l "import React," | while read file; do
  echo "Fixing $file"
  # Use sed to remove the first import React line
  sed -i '' -e '/import React from "react";/d' "$file"
done

echo "All duplicate React imports fixed!"