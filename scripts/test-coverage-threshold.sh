#!/bin/bash

# Test script to verify coverage threshold enforcement
# This script simulates what happens when coverage is below threshold

echo "============================================"
echo "TST-008: Coverage Threshold Test Script"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

echo "Step 1: Checking vitest configuration..."
echo "------------------------------------------"

# Check if vitest.config.ts exists
if [ -f "vitest.config.ts" ]; then
    print_status 0 "vitest.config.ts found"
    
    # Check for coverage configuration
    if grep -q "provider: 'v8'" vitest.config.ts; then
        print_status 0 "Coverage provider: v8"
    else
        print_status 1 "Coverage provider not configured"
    fi
    
    # Check thresholds
    if grep -q "lines: 80" vitest.config.ts; then
        print_status 0 "Lines threshold: 80%"
    else
        print_status 1 "Lines threshold not set to 80%"
    fi
    
    if grep -q "functions: 80" vitest.config.ts; then
        print_status 0 "Functions threshold: 80%"
    else
        print_status 1 "Functions threshold not set to 80%"
    fi
    
    if grep -q "branches: 70" vitest.config.ts; then
        print_status 0 "Branches threshold: 70%"
    else
        print_status 1 "Branches threshold not set to 70%"
    fi
    
    if grep -q "statements: 80" vitest.config.ts; then
        print_status 0 "Statements threshold: 80%"
    else
        print_status 1 "Statements threshold not set to 80%"
    fi
    
    if grep -q "perFile: 60" vitest.config.ts; then
        print_status 0 "Per-file threshold: 60%"
    else
        print_status 1 "Per-file threshold not set to 60%"
    fi
else
    print_status 1 "vitest.config.ts not found"
    exit 1
fi

echo ""
echo "Step 2: Checking GitHub Actions workflow..."
echo "------------------------------------------"

if [ -f ".github/workflows/coverage.yml" ]; then
    print_status 0 "coverage.yml workflow exists"
    
    if grep -q "test:coverage" .github/workflows/coverage.yml; then
        print_status 0 "Coverage test command configured"
    else
        print_status 1 "Coverage test command not found"
    fi
else
    print_status 1 "coverage.yml workflow not found"
fi

echo ""
echo "Step 3: Checking package.json scripts..."
echo "------------------------------------------"

if [ -f "package.json" ]; then
    if grep -q '"test:coverage"' package.json; then
        print_status 0 "test:coverage script exists"
    else
        print_status 1 "test:coverage script not found"
    fi
else
    print_status 1 "package.json not found"
fi

echo ""
echo "Step 4: Checking documentation..."
echo "------------------------------------------"

if [ -f "docs/testing/COVERAGE_REQUIREMENTS.md" ]; then
    print_status 0 "Coverage requirements documentation exists"
else
    print_status 1 "Coverage requirements documentation not found"
fi

echo ""
echo "Step 5: Checking README badge..."
echo "------------------------------------------"

if [ -f "README.md" ]; then
    if grep -q "Coverage" README.md; then
        print_status 0 "Coverage badge in README"
    else
        print_status 1 "Coverage badge not in README"
    fi
else
    print_status 1 "README.md not found"
fi

echo ""
echo "============================================"
echo "Running coverage test (this may take a moment)..."
echo "============================================"
echo ""

# Run actual coverage test
if command -v npm &> /dev/null; then
    print_info "Running: npm run test:coverage"
    npm run test:coverage
    COVERAGE_EXIT_CODE=$?
    
    echo ""
    if [ $COVERAGE_EXIT_CODE -eq 0 ]; then
        print_status 0 "Coverage check PASSED - meets all thresholds"
    else
        print_status 1 "Coverage check FAILED - below threshold(s)"
        echo ""
        print_info "To see detailed coverage report:"
        echo "  open coverage/index.html"
        echo ""
        print_info "This is the expected behavior when coverage is below threshold."
        print_info "CI will fail until coverage meets requirements."
    fi
else
    print_info "npm not available - skipping actual test run"
fi

echo ""
echo "============================================"
echo "Coverage Threshold Configuration Summary"
echo "============================================"
echo ""
echo "Global Thresholds:"
echo "  - Lines:        80%"
echo "  - Functions:    80%"
echo "  - Branches:     70%"
echo "  - Statements:   80%"
echo ""
echo "Per-File Threshold:"
echo "  - Minimum:      60%"
echo ""
echo "CI Behavior:"
echo "  - Build FAILS if below threshold"
echo "  - Coverage reports uploaded as artifacts"
echo "  - PR comments with coverage summary"
echo ""
echo "============================================"
