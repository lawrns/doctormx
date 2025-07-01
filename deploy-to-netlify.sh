#!/bin/bash

# 🚀 DoctorMX Netlify Deployment Script
# This script will deploy your video consultation app to Netlify

echo "🚀 Starting DoctorMX deployment to Netlify..."

# Check if we're logged in to Netlify
echo "📋 Checking Netlify authentication..."
if ! netlify status > /dev/null 2>&1; then
    echo "❌ Not logged in to Netlify. Please run 'netlify login' first."
    exit 1
fi

echo "✅ Netlify authentication confirmed"

# Build the project
echo "🔨 Building the project..."
npm ci
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo "✅ Build completed successfully"

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify deploy --prod --dir=dist

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your Netlify dashboard to get the site URL"
echo "2. Set up environment variables (see NETLIFY_DEPLOYMENT_GUIDE.md)"
echo "3. Test the video call feature at: https://your-site.netlify.app/video-test-simple"
echo ""
echo "🎯 Ready for testing with your friend!"
