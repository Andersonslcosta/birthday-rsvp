#!/bin/bash

# API Testing Script
# Testa todos os endpoints da API

BASE_URL="http://localhost:5000"
ADMIN_PASSWORD="pequenopríncipe2025"

echo "=========================================="
echo "Birthday RSVP API Tests"
echo "=========================================="

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  local expected_status=$5
  local token=$6

  echo -e "\n${YELLOW}Testing:${NC} $name"
  
  local headers="-H 'Content-Type: application/json'"
  if [ -n "$token" ]; then
    headers="$headers -H 'Authorization: Bearer $token'"
  fi

  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" $headers "$BASE_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X $method $headers -d "$data" "$BASE_URL$endpoint")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [[ "$http_code" == "$expected_status"* ]]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}✗ FAIL${NC} (Expected $expected_status, got: $http_code)"
    echo "Response: $body"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
}

# 1. Health Check
echo -e "\n${GREEN}=== Health Check ===${NC}"
test_endpoint "GET /health" "GET" "/health" "" "200"

# 2. Login
echo -e "\n${GREEN}=== Authentication ===${NC}"
login_response=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d "{\"password\":\"$ADMIN_PASSWORD\"}" \
  "$BASE_URL/api/admin/login")

TOKEN=$(echo $login_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✓ Login successful${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ Login failed${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# 3. Create RSVP (Confirmed)
echo -e "\n${GREEN}=== RSVP Creation ===${NC}"
rsvp_data='{
  "responsibleName": "João Silva",
  "confirmation": "sim",
  "participants": [
    {"name": "João Silva", "age": 35},
    {"name": "Maria Silva", "age": 32},
    {"name": "Pedro Silva", "age": 5}
  ],
  "totalPeople": 3
}'

test_endpoint "POST /api/rsvp (Confirmed)" "POST" "/api/rsvp" "$rsvp_data" "201"

# 4. Create RSVP (Not Confirmed)
rsvp_data_declined='{
  "responsibleName": "Ana Costa",
  "confirmation": "nao",
  "participants": [],
  "totalPeople": 0
}'

test_endpoint "POST /api/rsvp (Declined)" "POST" "/api/rsvp" "$rsvp_data_declined" "201"

# 5. Get All RSVPs (Protected)
echo -e "\n${GREEN}=== Protected Endpoints ===${NC}"
test_endpoint "GET /api/rsvp" "GET" "/api/rsvp" "" "200" "$TOKEN"

# 6. Get Statistics (Protected)
test_endpoint "GET /api/statistics" "GET" "/api/statistics" "" "200" "$TOKEN"

# 7. Export CSV (Protected)
test_endpoint "GET /api/admin/export" "GET" "/api/admin/export" "" "200" "$TOKEN"

# 8. Validation Test - Invalid Data
echo -e "\n${GREEN}=== Validation Tests ===${NC}"
invalid_data='{
  "responsibleName": "",
  "confirmation": "sim",
  "participants": [],
  "totalPeople": 0
}'

test_endpoint "POST /api/rsvp (Invalid)" "POST" "/api/rsvp" "$invalid_data" "400"

# Summary
echo -e "\n${GREEN}=========================================="
echo "Test Summary"
echo "==========================================${NC}"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "\n${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "\n${RED}✗ Some tests failed${NC}"
  exit 1
fi
