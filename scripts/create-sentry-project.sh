#!/bin/bash
# Sentry Project Setup Script
# Run this after creating a project in the Sentry dashboard

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <project-slug>"
    echo ""
    echo "Before running this script:"
    echo "1. Create project at: https://sentry.io/org/fyves/projects/"
    echo "2. Note the project slug"
    echo ""
    exit 1
fi

PROJECT_SLUG=$1
ORG_SLUG="fyves"

echo "🔧 Setting up Sentry for project: $PROJECT_SLUG"
echo ""

# Update .sentryclirc
cat > .sentryclirc << EOF
[auth]
token = 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

[defaults]
org = $ORG_SLUG
project = $PROJECT_SLUG

[http]
verify_ssl = true
EOF

echo "✅ Updated .sentryclirc"
echo ""

# Test connection
export SENTRY_AUTH_TOKEN="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"

echo "🔍 Verifying connection..."
sentry-cli info | grep -E "Organization|Project"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Available commands:"
echo "  sentry-cli releases new <version>"
echo "  sentry-cli releases files <version> upload-sourcemaps ./dist"
echo "  sentry-cli releases finalize <version>"
