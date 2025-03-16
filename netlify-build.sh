#!/bin/bash
set -euo pipefail

echo "🛠️ Setting up build environment..."

# First, make sure we have a src/index.js file (Create React App requirement)
if [ ! -f "./src/index.js" ] && [ -f "./src/index.tsx" ]; then
  echo "Creating index.js bridge to index.tsx..."
  echo "// Bridge file to TypeScript entry point\nimport './index.tsx';" > ./src/index.js
fi

echo "🧹 Cleaning npm cache..."
npm cache clean --force

echo "🗑️ Removing node_modules..."
rm -rf node_modules

echo "🧹 Cleaning npm install..."
npm cache verify

echo "🔍 Installing dependencies with legacy peer deps..."
NODE_ENV=development npm install --legacy-peer-deps

echo "🔄 Installing specific dependencies..."
npm install ajv@8.12.0 --save --legacy-peer-deps
npm install ajv-keywords@5.1.0 --save --legacy-peer-deps
npm install react-refresh@0.14.0 --save --legacy-peer-deps
npm install eslint-webpack-plugin@4.0.1 --save-dev --legacy-peer-deps
npm install --save-dev @pmmmwh/react-refresh-webpack-plugin --legacy-peer-deps
npm install @tanstack/react-query@4.29.7 --save --legacy-peer-deps

echo "🛠️ Setting environment variables..."
export SKIP_PREFLIGHT_CHECK=true
export DISABLE_ESLINT_PLUGIN=true
export CI=false
export NODE_OPTIONS="--max-old-space-size=4096"

echo "📦 Building project..."
NODE_ENV=production npm run build

echo "✅ Build completed!"
