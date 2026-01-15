#!/bin/bash

# Doctory V2 - Comprehensive Smoke Tests
# Tests all critical user stories and endpoints

set -e

BASE_URL="http://localhost:3001"
PATIENT_EMAIL="testpatient2026@doctory.com"
PATIENT_PASS="TestPass123!"
DOCTOR_EMAIL="testdoctor2026@doctory.com"
DOCTOR_PASS="TestPass123!"
ADMIN_EMAIL="testadmin2026@doctory.com"
ADMIN_PASS="TestPass123!"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to test endpoint
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local expected_code=$4
  local data=$5

  echo -e "${BLUE}Testing: $name${NC}"
  
  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [ "$http_code" = "$expected_code" ]; then
    echo -e "${GREEN}✓ PASS${NC} - $name (HTTP $http_code)"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC} - $name (Expected $expected_code, got $http_code)"
    echo "Response: $body"
    ((TESTS_FAILED++))
  fi
  echo ""
}

echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  DOCTORY V2 - COMPREHENSIVE SMOKE TESTS${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

# ============================================================================
# 1. PUBLIC ROUTES - No Authentication Required
# ============================================================================
echo -e "${YELLOW}[1] PUBLIC ROUTES${NC}"
echo "────────────────────────────────────────────────────────────"

test_endpoint "Home Page" "GET" "/" "200"
test_endpoint "Login Page" "GET" "/auth/login" "200"
test_endpoint "Register Page" "GET" "/auth/register" "200"
test_endpoint "Doctor Registration" "GET" "/auth/register?type=doctor" "200"
test_endpoint "Doctors Directory" "GET" "/doctors" "200"

# ============================================================================
# 2. AUTHENTICATION FLOWS
# ============================================================================
echo -e "${YELLOW}[2] AUTHENTICATION FLOWS${NC}"
echo "────────────────────────────────────────────────────────────"

# Patient Login
test_endpoint "Patient Login" "POST" "/api/auth/login" "200" \
  "{\"email\":\"$PATIENT_EMAIL\",\"password\":\"$PATIENT_PASS\"}"

# Doctor Login
test_endpoint "Doctor Login" "POST" "/api/auth/login" "200" \
  "{\"email\":\"$DOCTOR_EMAIL\",\"password\":\"$DOCTOR_PASS\"}"

# Admin Login
test_endpoint "Admin Login" "POST" "/api/auth/login" "200" \
  "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}"

# Invalid Login
test_endpoint "Invalid Login" "POST" "/api/auth/login" "400" \
  "{\"email\":\"invalid@test.com\",\"password\":\"wrong\"}"

# ============================================================================
# 3. PATIENT USER STORIES
# ============================================================================
echo -e "${YELLOW}[3] PATIENT USER STORIES${NC}"
echo "────────────────────────────────────────────────────────────"

test_endpoint "Patient Dashboard" "GET" "/app" "307"
test_endpoint "Patient Appointments" "GET" "/app/appointments" "307"
test_endpoint "Patient Profile" "GET" "/app/profile" "307"
test_endpoint "Browse Doctors" "GET" "/doctors" "200"
test_endpoint "Doctor Details" "GET" "/doctors/752400de-e81d-4391-82a5-4211bd64da6a" "200"
test_endpoint "Book Appointment" "GET" "/book/752400de-e81d-4391-82a5-4211bd64da6a" "307"

# ============================================================================
# 4. DOCTOR USER STORIES
# ============================================================================
echo -e "${YELLOW}[4] DOCTOR USER STORIES${NC}"
echo "────────────────────────────────────────────────────────────"

test_endpoint "Doctor Dashboard" "GET" "/doctor" "307"
test_endpoint "Doctor Onboarding" "GET" "/doctor/onboarding" "200"
test_endpoint "Doctor Profile" "GET" "/doctor/profile" "307"
test_endpoint "Doctor Availability" "GET" "/doctor/availability" "307"
test_endpoint "Doctor Appointments" "GET" "/doctor/appointments" "307"
test_endpoint "Doctor Analytics" "GET" "/doctor/analytics" "307"

# ============================================================================
# 5. ADMIN USER STORIES
# ============================================================================
echo -e "${YELLOW}[5] ADMIN USER STORIES${NC}"
echo "────────────────────────────────────────────────────────────"

test_endpoint "Admin Dashboard" "GET" "/admin" "307"
test_endpoint "Admin Verify Doctors" "GET" "/admin/verify" "307"
test_endpoint "Admin Analytics" "GET" "/admin/analytics" "307"

# ============================================================================
# 6. API ENDPOINTS - DOCTORS
# ============================================================================
echo -e "${YELLOW}[6] API ENDPOINTS - DOCTORS${NC}"
echo "────────────────────────────────────────────────────────────"

test_endpoint "Get All Doctors" "GET" "/api/doctors" "200"
test_endpoint "Get Doctor Details" "GET" "/api/doctors/752400de-e81d-4391-82a5-4211bd64da6a" "200"
test_endpoint "Get Doctor Slots" "GET" "/api/doctors/752400de-e81d-4391-82a5-4211bd64da6a/slots" "200"

# ============================================================================
# 7. API ENDPOINTS - APPOINTMENTS
# ============================================================================
echo -e "${YELLOW}[7] API ENDPOINTS - APPOINTMENTS${NC}"
echo "────────────────────────────────────────────────────────────"

test_endpoint "Get Appointments" "GET" "/api/appointments" "307"
test_endpoint "Get Patient Appointments" "GET" "/api/patient/appointments" "307"

# ============================================================================
# 8. API ENDPOINTS - PAYMENTS
# ============================================================================
echo -e "${YELLOW}[8] API ENDPOINTS - PAYMENTS${NC}"
echo "────────────────────────────────────────────────────────────"

test_endpoint "Create Payment Intent" "POST" "/api/create-payment-intent" "307" \
  "{\"appointmentId\":\"test-id\",\"amount\":50000}"

# ============================================================================
# 9. API ENDPOINTS - CHAT
# ============================================================================
echo -e "${YELLOW}[9] API ENDPOINTS - CHAT${NC}"
echo "────────────────────────────────────────────────────────────"

test_endpoint "Get Conversations" "GET" "/api/chat/conversations" "307"
test_endpoint "Get Messages" "GET" "/api/chat/messages" "307"

# ============================================================================
# 10. API ENDPOINTS - ADMIN
# ============================================================================
echo -e "${YELLOW}[10] API ENDPOINTS - ADMIN${NC}"
echo "────────────────────────────────────────────────────────────"

test_endpoint "Verify Doctor" "POST" "/api/admin/verify-doctor" "307" \
  "{\"doctorId\":\"test-id\"}"

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  TEST SUMMARY${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Passed: $TESTS_PASSED${NC}"
echo -e "${RED}✗ Failed: $TESTS_FAILED${NC}"
echo -e "${YELLOW}Total: $((TESTS_PASSED + TESTS_FAILED))${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed!${NC}"
  exit 1
fi
