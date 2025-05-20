#!/bin/bash
set -e  # Exit immediately if a command fails

# Back up the original files if they don't already exist
if [ ! -f src/index.original.tsx ]; then
  cp src/index.tsx src/index.original.tsx
  cp src/App.tsx src/App.original.tsx
fi

# Copy the simple versions to the main files
cp src/index.simple.tsx src/index.tsx
cp src/App.simple.tsx src/App.tsx

echo "Switched to simple versions for testing"