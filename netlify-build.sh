#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Netlify build script"

# Get OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

echo "📊 Detected OS: $OS, Architecture: $ARCH"

# Install dependencies
echo "📦 Installing dependencies with --legacy-peer-deps"
npm install --legacy-peer-deps

# Install platform-specific Rollup packages based on the build environment
if [ "$OS" = "linux" ]; then
  echo "🐧 Linux detected, installing Linux-specific Rollup packages"
  
  # Try to detect if we're in a musl environment (Alpine Linux)
  if [ -f /etc/alpine-release ] || grep -q "alpine" /etc/os-release 2>/dev/null; then
    echo "❄️ Alpine/musl detected, installing musl variant"
    npm install --no-save @rollup/rollup-linux-x64-musl
  else
    echo "🐧 GNU/Linux detected, installing gnu variant"
    npm install --no-save @rollup/rollup-linux-x64-gnu
  fi
elif [ "$OS" = "darwin" ]; then
  echo "🍎 macOS detected, installing Darwin-specific Rollup package"
  npm install --no-save @rollup/rollup-darwin-x64
else
  echo "⚠️ Unsupported OS: $OS. Build may fail if Rollup requires platform-specific binaries."
fi

# Build the application
echo "🏗 Building the application with Vite"
npm run build

echo "✅ Build completed successfully!"
