#!/bin/bash
set -e  # Exit immediately if a command fails

# Only restore if backups exist
if [ -f src/index.original.tsx ]; then
  cp src/index.original.tsx src/index.tsx
  cp src/App.original.tsx src/App.tsx
  
  echo "Restored original files"
else
  echo "Original backups not found"
fi