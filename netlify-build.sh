#!/bin/bash
set -e

echo "🚀 Starting Netlify build script with updated packages..."

# Clean previous build artifacts
echo "🧹 Cleaning up build artifacts..."
rm -rf node_modules
rm -rf build
npm cache clean --force

# Install dependencies with updated packages
echo "📦 Installing dependencies with modern versions..."
npm install --force

# Install required critical dependencies with specific versions
echo "🔧 Installing critical dependencies..."
npm install --save-dev --force \
  cross-env@7.0.3 \
  @babel/plugin-transform-class-properties@7.22.5 \
  @babel/plugin-transform-private-methods@7.22.5 \
  @babel/plugin-transform-private-property-in-object@7.22.5 \
  @jridgewell/sourcemap-codec@1.4.15 \
  @rollup/plugin-terser@0.4.4 \
  @pmmmwh/react-refresh-webpack-plugin@0.5.10 \
  @tanstack/react-query@4.29.7 \
  glob@10.3.10 \
  rimraf@5.0.5 \
  lru-cache@10.1.0 \
  path-browserify@1.0.1 \
  os-browserify@0.3.0 \
  crypto-browserify@3.12.0 \
  eslint-webpack-plugin@4.0.1 \
  react-refresh@0.14.0

# Set environment variables
echo "🌐 Setting environment variables..."
export SKIP_PREFLIGHT_CHECK=true
export DISABLE_ESLINT_PLUGIN=true
export CI=false
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=4096"

# Run the build with cross-env to ensure environment variables are set properly
echo "🏗️ Building with updated packages..."
npx cross-env NODE_ENV=production SKIP_PREFLIGHT_CHECK=true DISABLE_ESLINT_PLUGIN=true CI=false npm run build

# Verify build was successful
if [ -d "build" ]; then
  echo "✅ Build completed successfully!"
else
  echo "❌ Build failed. Directory 'build' not found."
  exit 1
fi
