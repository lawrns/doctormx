#!/bin/bash

# Doctory V2 - Detailed CURL Tests for All User Stories
# Run with: bash tests/curl-tests.sh

BASE_URL="http://localhost:3001"

# Test Credentials
PATIENT_EMAIL="testpatient2026@doctory.com"
PATIENT_PASS="TestPass123!"
DOCTOR_EMAIL="testdoctor2026@doctory.com"
DOCTOR_PASS="TestPass123!"
ADMIN_EMAIL="testadmin2026@doctory.com"
ADMIN_PASS="TestPass123!"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

# Helper function
run_test() {
  local name=$1
  local cmd=$2
  local expected=$3
  
  echo -e "${BLUE}▶ $name${NC}"
  result=$(eval "$cmd" 2>&1)
  
  if echo "$result" | grep -q "$expected"; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC}"
    echo "Expected: $expected"
    echo "Got: $result" | head -5
    ((FAILED++))
  fi
  echo ""
}

echo -e "${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║  DOCTORY V2 - CURL INTEGRATION TESTS                  ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# USER STORY 1: PATIENT REGISTRATION & LOGIN
# ============================================================================
echo -e "${YELLOW}[USER STORY 1] Patient Registration & Login${NC}"
echo "────────────────────────────────────────────────────────────"

run_test "1.1 Access Registration Page" \
  "curl -s $BASE_URL/auth/register | grep -o 'Crear cuenta'" \
  "Crear cuenta"

run_test "1.2 Access Login Page" \
  "curl -s $BASE_URL/auth/login | grep -o 'Bienvenido'" \
  "Bienvenido"

run_test "1.3 Patient Can Login" \
  "curl -s -X POST $BASE_URL/api/auth/login \
    -H 'Content-Type: application/json' \
    -d '{\"email\":\"$PATIENT_EMAIL\",\"password\":\"$PATIENT_PASS\"}' | grep -o 'session\|error'" \
  "session"

# ============================================================================
# USER STORY 2: DOCTOR REGISTRATION & ONBOARDING
# ============================================================================
echo -e "${YELLOW}[USER STORY 2] Doctor Registration & Onboarding${NC}"
echo "────────────────────────────────────────────────────────────"

run_test "2.1 Access Doctor Registration" \
  "curl -s '$BASE_URL/auth/register?type=doctor' | grep -o 'Registro de médico'" \
  "Registro de médico"

run_test "2.2 Doctor Can Login" \
  "curl -s -X POST $BASE_URL/api/auth/login \
    -H 'Content-Type: application/json' \
    -d '{\"email\":\"$DOCTOR_EMAIL\",\"password\":\"$DOCTOR_PASS\"}' | grep -o 'session\|error'" \
  "session"

run_test "2.3 Access Doctor Onboarding" \
  "curl -s -L $BASE_URL/doctor/onboarding | grep -o 'onboarding\|Onboarding'" \
  "onboarding"

# ============================================================================
# USER STORY 3: BROWSE DOCTORS
# ============================================================================
echo -e "${YELLOW}[USER STORY 3] Browse Doctors${NC}"
echo "────────────────────────────────────────────────────────────"

run_test "3.1 Access Doctors Directory" \
  "curl -s $BASE_URL/doctors | grep -o 'doctors\|Doctores'" \
  "doctors"

run_test "3.2 Get Doctors API" \
  "curl -s $BASE_URL/api/doctors | grep -o '\[\|doctors'" \
  "doctors"

run_test "3.3 Get Doctor Details" \
  "curl -s '$BASE_URL/api/doctors/752400de-e81d-4391-82a5-4211bd64da6a' | grep -o 'user_id\|id'" \
  "user_id"

run_test "3.4 Get Doctor Availability Slots" \
  "curl -s '$BASE_URL/api/doctors/752400de-e81d-4391-82a5-4211bd64da6a/slots' | grep -o 'slots\|availability'" \
  "slots"

# ============================================================================
# USER STORY 4: BOOK APPOINTMENT
# ============================================================================
echo -e "${YELLOW}[USER STORY 4] Book Appointment${NC}"
echo "────────────────────────────────────────────────────────────"

run_test "4.1 Access Booking Page" \
  "curl -s -L '$BASE_URL/book/752400de-e81d-4391-82a5-4211bd64da6a' | grep -o 'book\|appointment'" \
  "book"

run_test "4.2 Create Payment Intent" \
  "curl -s -X POST $BASE_URL/api/create-payment-intent \
    -H 'Content-Type: application/json' \
    -d '{\"appointmentId\":\"test\",\"amount\":50000}' | grep -o 'client_secret\|error'" \
  "client_secret"

# ============================================================================
# USER STORY 5: PATIENT DASHBOARD
# ============================================================================
echo -e "${YELLOW}[USER STORY 5] Patient Dashboard${NC}"
echo "────────────────────────────────────────────────────────────"

run_test "5.1 Access Patient Dashboard" \
  "curl -s -L $BASE_URL/app | grep -o 'app\|dashboard'" \
  "app"

run_test "5.2 Get Patient Appointments" \
  "curl -s -L $BASE_URL/api/patient/appointments | grep -o 'appointments\|error'" \
  "appointments"

run_test "5.3 Get Patient Profile" \
  "curl -s -L $BASE_URL/api/patient/profile | grep -o 'profile\|user'" \
  "profile"

# ============================================================================
# USER STORY 6: DOCTOR DASHBOARD
# ============================================================================
echo -e "${YELLOW}[USER STORY 6] Doctor Dashboard${NC}"
echo "────────────────────────────────────────────────────────────"

run_test "6.1 Access Doctor Dashboard" \
  "curl -s -L $BASE_URL/doctor | grep -o 'doctor\|dashboard'" \
  "doctor"

run_test "6.2 Get Doctor Appointments" \
  "curl -s -L $BASE_URL/api/appointments | grep -o 'appointments\|error'" \
  "appointments"

run_test "6.3 Update Doctor Availability" \
  "curl -s -X POST $BASE_URL/api/doctor/availability \
    -H 'Content-Type: application/json' \
    -d '{\"monday\":{\"start\":\"09:00\",\"end\":\"17:00\"}}' | grep -o 'success\|error'" \
  "success"

# ============================================================================
# USER STORY 7: ADMIN VERIFICATION
# ============================================================================
echo -e "${YELLOW}[USER STORY 7] Admin Verification${NC}"
echo "────────────────────────────────────────────────────────────"

run_test "7.1 Access Admin Dashboard" \
  "curl -s -L $BASE_URL/admin | grep -o 'admin\|dashboard'" \
  "admin"

run_test "7.2 Access Doctor Verification Panel" \
  "curl -s -L $BASE_URL/admin/verify | grep -o 'verify\|verification'" \
  "verify"

run_test "7.3 Verify Doctor API" \
  "curl -s -X POST $BASE_URL/api/admin/verify-doctor \
    -H 'Content-Type: application/json' \
    -d '{\"doctorId\":\"752400de-e81d-4391-82a5-4211bd64da6a\"}' | grep -o 'success\|error'" \
  "success"

# ============================================================================
# USER STORY 8: CHAT SYSTEM
# ============================================================================
echo -e "${YELLOW}[USER STORY 8] Chat System${NC}"
echo "────────────────────────────────────────────────────────────"

run_test "8.1 Access Chat" \
  "curl -s -L $BASE_URL/app/chat | grep -o 'chat\|conversation'" \
  "chat"

run_test "8.2 Get Conversations" \
  "curl -s -L $BASE_URL/api/chat/conversations | grep -o 'conversations\|error'" \
  "conversations"

run_test "8.3 Get Messages" \
  "curl -s -L $BASE_URL/api/chat/messages | grep -o 'messages\|error'" \
  "messages"

# ============================================================================
# USER STORY 9: PRESCRIPTIONS
# ============================================================================
echo -e "${YELLOW}[USER STORY 9] Prescriptions${NC}"
echo "────────────────────────────────────────────────────────────"

run_test "9.1 Get Prescriptions" \
  "curl -s -L $BASE_URL/api/prescriptions | grep -o 'prescriptions\|error'" \
  "prescriptions"

# ============================================================================
# USER STORY 10: REVIEWS & RATINGS
# ============================================================================
echo -e "${YELLOW}[USER STORY 10] Reviews & Ratings${NC}"
echo "────────────────────────────────────────────────────────────"

run_test "10.1 Get Reviews" \
  "curl -s -L $BASE_URL/api/reviews | grep -o 'reviews\|error'" \
  "reviews"

run_test "10.2 Create Review" \
  "curl -s -X POST $BASE_URL/api/reviews \
    -H 'Content-Type: application/json' \
    -d '{\"doctorId\":\"test\",\"rating\":5,\"comment\":\"Great doctor\"}' | grep -o 'success\|error'" \
  "success"

# ============================================================================
# USER STORY 11: PAYMENT & BILLING
# ============================================================================
echo -e "${YELLOW}[USER STORY 11] Payment & Billing${NC}"
echo "────────────────────────────────────────────────────────────"

run_test "11.1 Confirm Payment" \
  "curl -s -X POST $BASE_URL/api/confirm-payment \
    -H 'Content-Type: application/json' \
    -d '{\"appointmentId\":\"test\",\"paymentIntentId\":\"test\"}' | grep -o 'success\|error'" \
  "success"

# ============================================================================
# USER STORY 12: LOGOUT
# ============================================================================
echo -e "${YELLOW}[USER STORY 12] Logout${NC}"
echo "────────────────────────────────────────────────────────────"

run_test "12.1 Access Logout" \
  "curl -s -L $BASE_URL/auth/signout | grep -o 'signout\|logout'" \
  "signout"

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo -e "${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║  TEST SUMMARY                                          ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
echo -e "${GREEN}✓ Passed: $PASSED${NC}"
echo -e "${RED}✗ Failed: $FAILED${NC}"
echo -e "${YELLOW}Total: $((PASSED + FAILED))${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed! ✓${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed. Review output above.${NC}"
  exit 1
fi
