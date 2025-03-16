#!/bin/bash
set -e

echo "🚀 Starting Netlify build script..."

# Clean previous build artifacts to ensure a fresh start
echo "🧹 Cleaning up build artifacts..."
rm -rf node_modules
rm -rf build
npm cache clean --force

# Install dependencies with force to override any conflicts
echo "📦 Installing dependencies..."
npm install --force

# Install specific dependencies that might be missing
echo "🔧 Installing critical dependencies..."
npm install cross-env path-browserify os-browserify crypto-browserify @tanstack/react-query@4.29.7 react-refresh@0.14.0 eslint-webpack-plugin@4.0.1 @pmmmwh/react-refresh-webpack-plugin@0.5.10 --save-dev --force

# Set environment variables for build
echo "🌐 Setting environment variables..."
export NODE_ENV=production
export SKIP_PREFLIGHT_CHECK=true
export DISABLE_ESLINT_PLUGIN=true
export CI=false
export NODE_OPTIONS="--max-old-space-size=4096"

# Run the build
echo "🏗️ Building project..."
npx cross-env NODE_ENV=production SKIP_PREFLIGHT_CHECK=true DISABLE_ESLINT_PLUGIN=true CI=false craco build

# Check if build succeeded
if [ -d "build" ]; then
  echo "✅ Build completed successfully!"
else
  echo "❌ Build failed. Directory 'build' not found."
  exit 1
fi
