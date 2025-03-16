#!/bin/bash
set -euo pipefail

echo "🔍 Installing dependencies..."
npm ci || npm install

echo "🔄 Installing react-refresh..."
npm install react-refresh --save-dev

echo "🛠️ Setting environment variables..."
export SKIP_PREFLIGHT_CHECK=true
export DISABLE_ESLINT_PLUGIN=true
export CI=false

echo "📦 Building project..."
npm run build

echo "✅ Build completed!"
