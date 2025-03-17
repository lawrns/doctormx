#!/bin/bash

# Super simple build script for Netlify
echo "🛠️ Starting barebones build process..."

# Install dependencies including important ones that might be missing
echo "📦 Installing dependencies..."
npm install --no-save --legacy-peer-deps tailwindcss postcss autoprefixer @babel/plugin-transform-react-jsx

# Build the project
echo "🏗️ Building the project..."
npx vite build

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "✅ Build completed successfully!"
  exit 0
else
  echo "❌ Build failed!"
  exit 1
fi
