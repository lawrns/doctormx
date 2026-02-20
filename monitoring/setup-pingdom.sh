#!/bin/bash
#
# Pingdom Setup Script - OBS-003 Implementation
#
# This script automates the setup of Pingdom monitoring for Doctor.mx
#
# Prerequisites:
# - Pingdom account (https://www.pingdom.com/)
# - API token with write permissions
# - curl and jq installed
#
# Usage:
#   export PINGDOM_API_TOKEN="your_api_token_here"
#   export PINGDOM_EMAIL="your@email.com"
#   ./setup-pingdom.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_BASE="https://api.pingdom.com/api/3.1"
API_TOKEN="${PINGDOM_API_TOKEN:-}"
PINGDOM_EMAIL="${PINGDOM_EMAIL:-}"

echo "========================================"
echo "Doctor.mx Pingdom Setup"
echo "========================================"
echo ""

# Validate API token
if [ -z "$API_TOKEN" ]; then
    echo -e "${RED}Error: PINGDOM_API_TOKEN environment variable is required${NC}"
    echo "Get your API token from: https://my.pingdom.com/app/api-tokens"
    exit 1
fi

if [ -z "$PINGDOM_EMAIL" ]; then
    echo -e "${RED}Error: PINGDOM_EMAIL environment variable is required${NC}"
    echo "Use the email address associated with your Pingdom account"
    exit 1
fi

# Test API connectivity
echo -e "${YELLOW}Testing API connectivity...${NC}"
ACCOUNT_INFO=$(curl -s -X GET "$API_BASE/account" \
    -H "Authorization: Bearer $API_TOKEN")

if echo "$ACCOUNT_INFO" | grep -q '"error"'; then
    echo -e "${RED}Error: Invalid API token or API error${NC}"
    echo "$ACCOUNT_INFO"
    exit 1
fi

echo -e "${GREEN}✓ API connection successful${NC}"
echo ""

# Function to create a check
create_check() {
    local name=$1
    local host=$2
    local path=$3
    local resolution=$4
    local tags=$5
    
    echo "  Creating: $name"
    
    RESPONSE=$(curl -s -X POST "$API_BASE/checks" \
        -H "Authorization: Bearer $API_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"$name\",
            \"host\": \"$host\",
            \"type\": \"http\",
            \"encryption\": true,
            \"url\": \"$path\",
            \"resolution\": $resolution,
            \"sendtoemail\": true,
            \"sendnotificationwhendown\": 2,
            \"notifyagainevery\": 0,
            \"tags\": \"$tags\"
        }")
    
    if echo "$RESPONSE" | grep -q '"check"'; then
        CHECK_ID=$(echo "$RESPONSE" | jq -r '.check.id')
        echo -e "    ${GREEN}✓ Created successfully (ID: $CHECK_ID)${NC}"
        return 0
    else
        echo -e "    ${RED}✗ Failed to create${NC}"
        echo "    $RESPONSE"
        return 1
    fi
}

echo -e "${YELLOW}Creating checks...${NC}"

# Create checks
# 1. API Health Check (1 minute resolution)
create_check "Doctor.mx API Health" "doctor.mx" "/api/health" "1" "api,health,critical"

# 2. Homepage Check (5 minute resolution)
create_check "Doctor.mx Homepage" "doctor.mx" "/" "5" "website,homepage"

# 3. Auth API Check (5 minute resolution)
create_check "Doctor.mx Auth API" "doctor.mx" "/api/auth/session" "5" "api,auth"

echo ""
echo -e "${YELLOW}Setting up team notification...${NC}"

# Get or create team
TEAMS=$(curl -s -X GET "$API_BASE/teams" \
    -H "Authorization: Bearer $API_TOKEN")

TEAM_ID=$(echo "$TEAMS" | jq -r '.teams[] | select(.name == "Doctor.mx") | .id')

if [ -z "$TEAM_ID" ]; then
    echo "  Creating Doctor.mx team..."
    TEAM_CREATE=$(curl -s -X POST "$API_BASE/teams" \
        -H "Authorization: Bearer $API_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"Doctor.mx\",
            \"admins\": [{ \"id\": 1 }]
        }")
    TEAM_ID=$(echo "$TEAM_CREATE" | jq -r '.team.id // empty')
fi

if [ -n "$TEAM_ID" ]; then
    echo -e "${GREEN}✓ Team configured (ID: $TEAM_ID)${NC}"
else
    echo -e "${YELLOW}⚠ Team setup skipped${NC}"
fi

echo ""
echo "========================================"
echo -e "${GREEN}Setup Complete!${NC}"
echo "========================================"
echo ""
echo "Next Steps:"
echo "1. Verify checks at: https://my.pingdom.com/app/reports/uptime"
echo "2. Configure alert recipients in Pingdom dashboard"
echo "3. Set up public status page if needed"
echo "4. Test alerts by simulating downtime"
echo ""
