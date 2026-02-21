#!/bin/bash
# Verification script for secret scanning configuration
# Tests that gitleaks properly detects test secrets

set -e

echo "================================================"
echo "  Secret Scanning Verification"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if gitleaks is installed
echo "1. Checking Gitleaks installation..."
if command -v gitleaks >/dev/null 2>&1; then
    VERSION=$(gitleaks --version)
    echo -e "   ${GREEN}✓${NC} Gitleaks installed: $VERSION"
else
    echo -e "   ${RED}✗${NC} Gitleaks not found"
    echo "   Install with: npm run scan:install"
    exit 1
fi

echo ""
echo "2. Checking configuration files..."
CONFIG_FILES=(
    ".github/workflows/secret-scan.yml"
    ".pre-commit-config.yaml"
    ".gitleaks.toml"
    "scripts/install-tools.sh"
    "docs/operations/SECRET_SCANNING.md"
)

for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "   ${GREEN}✓${NC} $file"
    else
        echo -e "   ${RED}✗${NC} $file (missing)"
        exit 1
    fi
done

echo ""
echo "3. Testing secret detection..."

# Create a temporary test file with a fake secret
TEST_FILE=".test-secret-detection.txt"
cat > "$TEST_FILE" << EOF
// This file contains test secrets to verify gitleaks detection
const AWS_SECRET = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
# STRIPE_KEY: Documented test key from Stripe docs (not a real secret)
EOF

echo "   Created test file with fake secrets"
echo "   Running gitleaks scan..."

# Run gitleaks and expect it to fail (detect secrets)
if gitleaks detect --source . --config .gitleaks.toml --exit-code 0 > /dev/null 2>&1; then
    echo -e "   ${RED}✗${NC} Gitleaks did NOT detect test secrets (unexpected)"
    rm -f "$TEST_FILE"
    exit 1
else
    echo -e "   ${GREEN}✓${NC} Gitleaks correctly detected test secrets"
fi

# Clean up
rm -f "$TEST_FILE"

echo ""
echo "4. Checking package.json scripts..."
if grep -q '"scan:secrets"' package.json; then
    echo -e "   ${GREEN}✓${NC} scan:secrets script exists"
else
    echo -e "   ${RED}✗${NC} scan:secrets script missing"
    exit 1
fi

if grep -q '"scan:install"' package.json; then
    echo -e "   ${GREEN}✓${NC} scan:install script exists"
else
    echo -e "   ${RED}✗${NC} scan:install script missing"
    exit 1
fi

echo ""
echo "5. Verifying pre-commit configuration..."
if command -v pre-commit >/dev/null 2>&1; then
    echo -e "   ${GREEN}✓${NC} pre-commit installed"
    if [ -f ".git/hooks/pre-commit" ]; then
        echo -e "   ${GREEN}✓${NC} pre-commit hooks installed"
    else
        echo -e "   ${YELLOW}⚠${NC} pre-commit hooks not installed"
        echo "   Run: npm run precommit-install"
    fi
else
    echo -e "   ${YELLOW}⚠${NC} pre-commit not installed (optional)"
fi

echo ""
echo "================================================"
echo -e "  ${GREEN}Verification Complete!${NC}"
echo "================================================"
echo ""
echo "Summary:"
echo "  ✓ Gitleaks is properly configured"
echo "  ✓ CI/CD workflow is set up"
echo "  ✓ Pre-commit hooks are configured"
echo "  ✓ Documentation is complete"
echo ""
echo "Next steps:"
echo "  1. Install pre-commit hooks: npm run precommit-install"
echo "  2. Test with: npm run scan:secrets"
echo "  3. Commit a file to test pre-commit hook"
echo ""
