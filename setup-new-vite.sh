#!/bin/bash
set -e  # Exit immediately if any command fails

# Create a new Vite project with React and TypeScript
npm create vite@latest doctormx-vite -- --template react-ts

# Copy the source files
cp -r src/* doctormx-vite/src/
cp public/* doctormx-vite/public/

# Copy configuration files
cp .env doctormx-vite/
cp tsconfig.json doctormx-vite/

# Instructions
echo "New Vite project created in 'doctormx-vite' directory"
echo "cd doctormx-vite"
echo "npm install"
echo "npm run dev"