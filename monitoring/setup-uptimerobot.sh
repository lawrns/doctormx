#!/bin/bash
#
# UptimeRobot Setup Script - OBS-003 Implementation
# 
# This script automates the setup of UptimeRobot monitoring for Doctor.mx
# 
# Prerequisites:
# - UptimeRobot account (https://uptimerobot.com/)
# - API key with write permissions
# - curl installed
#
# Usage:
#   export UPTIMEROBOT_API_KEY="your_api_key_here"
#   export ALERT_EMAIL="admin@doctor.mx"
#   export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
#   ./setup-uptimerobot.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_BASE="https://api.uptimerobot.com/v2"
API_KEY="${UPTIMEROBOT_API_KEY:-}"
ALERT_EMAIL="${ALERT_EMAIL:-admin@doctor.mx}"
SLACK_WEBHOOK="${SLACK_WEBHOOK_URL:-}"

echo "========================================"
echo "Doctor.mx UptimeRobot Setup"
echo "========================================"
echo ""

# Validate API key
if [ -z "$API_KEY" ]; then
    echo -e "${RED}Error: UPTIMEROBOT_API_KEY environment variable is required${NC}"
    echo "Get your API key from: https://uptimerobot.com/dashboard.php#mySettings"
    exit 1
fi

# Test API connectivity
echo -e "${YELLOW}Testing API connectivity...${NC}"
ACCOUNT_INFO=$(curl -s -X POST "$API_BASE/getAccountDetails" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "api_key=$API_KEY" \
    -d "format=json")

if echo "$ACCOUNT_INFO" | grep -q '"stat":"fail"'; then
    echo -e "${RED}Error: Invalid API key or API error${NC}"
    echo "$ACCOUNT_INFO"
    exit 1
fi

echo -e "${GREEN}✓ API connection successful${NC}"
echo ""

# Create email alert contact if not exists
echo -e "${YELLOW}Setting up email alert contact...${NC}"
EMAIL_ALERT_ID=$(curl -s -X POST "$API_BASE/newAlertContact" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "api_key=$API_KEY" \
    -d "format=json" \
    -d "type=2" \
    -d "friendly_name=Doctor.mx Admin" \
    -d "value=$ALERT_EMAIL" | jq -r '.alertcontact.id // empty')

if [ -n "$EMAIL_ALERT_ID" ]; then
    echo -e "${GREEN}✓ Email alert contact created (ID: $EMAIL_ALERT_ID)${NC}"
else
    echo -e "${YELLOW}⚠ Email alert contact may already exist${NC}"
    # Try to find existing
    EMAIL_ALERT_ID=$(curl -s -X POST "$API_BASE/getAlertContacts" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "api_key=$API_KEY" \
        -d "format=json" | jq -r ".alertcontacts[] | select(.value == \"$ALERT_EMAIL\") | .id")
fi

# Create Slack alert contact if webhook provided
SLACK_ALERT_ID=""
if [ -n "$SLACK_WEBHOOK" ]; then
    echo -e "${YELLOW}Setting up Slack alert contact...${NC}"
    SLACK_ALERT_ID=$(curl -s -X POST "$API_BASE/newAlertContact" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "api_key=$API_KEY" \
        -d "format=json" \
        -d "type=19" \
        -d "friendly_name=Doctor.mx Slack" \
        -d "value=$SLACK_WEBHOOK" | jq -r '.alertcontact.id // empty')
    
    if [ -n "$SLACK_ALERT_ID" ]; then
        echo -e "${GREEN}✓ Slack alert contact created (ID: $SLACK_ALERT_ID)${NC}"
    else
        echo -e "${YELLOW}⚠ Slack alert contact may already exist${NC}"
        SLACK_ALERT_ID=$(curl -s -X POST "$API_BASE/getAlertContacts" \
            -H "Content-Type: application/x-www-form-urlencoded" \
            -d "api_key=$API_KEY" \
            -d "format=json" | jq -r ".alertcontacts[] | select(.value == \"$SLACK_WEBHOOK\") | .id")
    fi
fi

echo ""
echo -e "${YELLOW}Creating monitors...${NC}"

# Build alert contacts string
ALERT_CONTACTS="$EMAIL_ALERT_ID"
if [ -n "$SLACK_ALERT_ID" ]; then
    ALERT_CONTACTS="${EMAIL_ALERT_ID}-${SLACK_ALERT_ID}"
fi

# Function to create a monitor
create_monitor() {
    local name=$1
    local url=$2
    local interval=$3
    local timeout=$4
    
    echo "  Creating: $name"
    
    RESPONSE=$(curl -s -X POST "$API_BASE/newMonitor" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "api_key=$API_KEY" \
        -d "format=json" \
        -d "friendly_name=$name" \
        -d "url=$url" \
        -d "type=1" \
        -d "interval=$interval" \
        -d "timeout=$timeout" \
        -d "alert_contacts=$ALERT_CONTACTS")
    
    if echo "$RESPONSE" | grep -q '"stat":"ok"'; then
        echo -e "    ${GREEN}✓ Created successfully${NC}"
        return 0
    else
        echo -e "    ${RED}✗ Failed to create${NC}"
        echo "    $RESPONSE"
        return 1
    fi
}

# Create monitors
# 1. API Health Monitor (1 minute interval)
create_monitor "Doctor.mx API Health" "https://doctor.mx/api/health" "60" "10"

# 2. Homepage Monitor (5 minute interval)
create_monitor "Doctor.mx Homepage" "https://doctor.mx" "300" "10"

# 3. Auth API Monitor (5 minute interval)
create_monitor "Doctor.mx Auth API" "https://doctor.mx/api/auth/session" "300" "5"

echo ""
echo -e "${YELLOW}Creating status page...${NC}"

# Create status page (public status page requires paid plan)
STATUS_PAGE=$(curl -s -X POST "$API_BASE/newPSP" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "api_key=$API_KEY" \
    -d "format=json" \
    -d "friendly_name=Doctor.mx Status" \
    -d "custom_domain=status.doctor.mx" \
    -d "password=" \
    -d "sort=1" \
    -d "hide_url_links=0" \
    -d "monitors=")

if echo "$STATUS_PAGE" | grep -q '"stat":"ok"'; then
    PSP_ID=$(echo "$STATUS_PAGE" | jq -r '.psp.id')
    echo -e "${GREEN}✓ Status page created${NC}"
    echo "  Status Page URL: https://stats.uptimerobot.com/$PSP_ID"
    echo "  Custom Domain: https://status.doctor.mx (configure DNS)"
else
    echo -e "${YELLOW}⚠ Status page creation skipped (may require paid plan or already exists)${NC}"
fi

echo ""
echo "========================================"
echo -e "${GREEN}Setup Complete!${NC}"
echo "========================================"
echo ""
echo "Next Steps:"
echo "1. Verify monitors at: https://uptimerobot.com/dashboard"
echo "2. Configure DNS for status.doctor.mx if using custom domain"
echo "3. Test alerts by simulating downtime"
echo "4. Add team members to alert contacts"
echo ""
echo "API Key (save securely): $API_KEY"
echo ""
