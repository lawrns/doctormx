#!/bin/bash
# Sentry CLI Complete Setup Script
# Run this to set up Sentry CLI for all projects

set -e

echo "🔧 Sentry CLI Setup for All Projects"
echo "======================================"
echo ""

# 1. Install Sentry CLI globally
echo "📦 Installing Sentry CLI globally..."
npm install -g @sentry/cli

echo ""
echo "✅ Sentry CLI installed at: $(which sentry-cli)"
echo "   Version: $(sentry-cli --version)"
echo ""

# 2. Set up environment
mkdir -p ~/.config/sentry

# 3. Create environment config
cat > ~/.config/sentry/sentry.env << 'EOF'
# Sentry CLI Configuration
# Source this file in your shell: source ~/.config/sentry/sentry.env

# Auth token - get from: https://sentry.io/settings/account/api/auth-tokens/
export SENTRY_AUTH_TOKEN=""

# Optional: Default organization
# export SENTRY_ORG="your-org-slug"

# Optional: Default project
# export SENTRY_PROJECT="your-project-slug"
EOF

echo "✅ Created config at: ~/.config/sentry/sentry.env"
echo ""

# 4. Add to shell profile
SHELL_RC=""
if [ -n "$ZSH_VERSION" ] || [ -f ~/.zshrc ]; then
    SHELL_RC="$HOME/.zshrc"
elif [ -f ~/.bashrc ]; then
    SHELL_RC="$HOME/.bashrc"
else
    SHELL_RC="$HOME/.profile"
fi

if ! grep -q "sentry.env" "$SHELL_RC" 2>/dev/null; then
    echo "" >> "$SHELL_RC"
    echo "# Sentry CLI - Load environment" >> "$SHELL_RC"
    echo "[ -f ~/.config/sentry/sentry.env ] && source ~/.config/sentry/sentry.env" >> "$SHELL_RC"
    echo "✅ Added to shell profile: $SHELL_RC"
else
    echo "✅ Already in shell profile: $SHELL_RC"
fi

echo ""
echo "📋 Next Steps to Complete Setup:"
echo "================================"
echo ""
echo "1. Get your authentication token:"
echo "   → Go to: https://sentry.io/settings/account/api/auth-tokens/"
echo "   → Click 'Create New Token'"
echo "   → Select scopes: project:write, project:read, org:read"
echo "   → Copy the token"
echo ""
echo "2. Add the token to your config:"
echo "   → Edit: ~/.config/sentry/sentry.env"
echo "   → Set: export SENTRY_AUTH_TOKEN=\"your_token_here\""
echo ""
echo "3. Reload your shell:"
echo "   → Run: source $SHELL_RC"
echo ""
echo "4. Verify installation:"
echo "   → Run: sentry-cli info"
echo ""
echo "5. Use in any project:"
echo "   → Initialize: sentry-cli init"
echo "   → Create release: sentry-cli releases new <version>"
echo "   → Upload sourcemaps: sentry-cli releases files <version> upload-sourcemaps ./dist"
echo ""
echo "📚 Quick Reference:"
echo "=================="
echo "  sentry-cli login              # Interactive login"
echo "  sentry-cli init               # Initialize project"
echo "  sentry-cli releases list      # List releases"
echo "  sentry-cli releases new vX.Y.Z # Create new release"
echo "  sentry-cli upload-dif         # Upload debug info files"
echo "  sentry-cli releases finalize vX.Y.Z # Finalize release"
echo ""
