#!/bin/bash

echo "📱 Doctor.mx PWA Deployment Script"
echo "=================================="

# Generate PWA assets
echo "🔄 Generating PWA assets..."
node src/scripts/generate-icons.js
node src/scripts/generate-splash-screens.js

# Build the application
echo "🔨 Building the application..."
npm run build

# Check if build succeeded
if [ $? -eq 0 ]; then
  echo "✅ Build completed successfully!"
  
  # Check if serve is installed
  if ! command -v serve &> /dev/null; then
    echo "📦 Installing serve package globally..."
    npm install -g serve
  fi
  
  echo "🚀 Starting local preview with serve..."
  echo "📱 Test your PWA at: http://localhost:3000"
  echo "🔍 Use Chrome DevTools > Application > Service Workers to verify PWA functionality"
  serve -s dist -p 3000
else
  echo "❌ Build failed. Please check the errors above."
  exit 1
fi
