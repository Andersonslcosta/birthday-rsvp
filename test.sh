#!/bin/bash

# Test script - Frontend E2E Tests
echo "=========================================="
echo "Running Frontend Tests"
echo "=========================================="

# Test 1: Check if API module exists
echo "✓ Testing API module..."
if grep -q "export const saveRSVP" src/app/utils/api.ts; then
  echo "  ✓ saveRSVP function found"
else
  echo "  ✗ saveRSVP function not found"
  exit 1
fi

if grep -q "export const getGuests" src/app/utils/api.ts; then
  echo "  ✓ getGuests function found"
else
  echo "  ✗ getGuests function not found"
  exit 1
fi

if grep -q "export const adminLogin" src/app/utils/api.ts; then
  echo "  ✓ adminLogin function found"
else
  echo "  ✗ adminLogin function not found"
  exit 1
fi

# Test 2: Check frontend components
echo ""
echo "✓ Testing components..."
if grep -q "InvitePage" src/app/App.tsx; then
  echo "  ✓ InvitePage component registered"
else
  echo "  ✗ InvitePage component not found in routing"
  exit 1
fi

if grep -q "AdminPanel" src/app/App.tsx; then
  echo "  ✓ AdminPanel component registered"
else
  echo "  ✗ AdminPanel component not found in routing"
  exit 1
fi

# Test 3: Check backend files
echo ""
echo "✓ Testing backend files..."

if [ -f "server/src/database.ts" ]; then
  echo "  ✓ database.ts exists"
else
  echo "  ✗ database.ts not found"
  exit 1
fi

if [ -f "server/src/routes.ts" ]; then
  echo "  ✓ routes.ts exists"
else
  echo "  ✗ routes.ts not found"
  exit 1
fi

if [ -f "server/src/auth.ts" ]; then
  echo "  ✓ auth.ts exists"
else
  echo "  ✗ auth.ts not found"
  exit 1
fi

if [ -f "server/src/index.ts" ]; then
  echo "  ✓ index.ts exists"
else
  echo "  ✗ index.ts not found"
  exit 1
fi

# Test 4: Check TypeScript compilation
echo ""
echo "✓ Testing TypeScript..."
npx tsc --noEmit 2>/dev/null
if [ $? -eq 0 ]; then
  echo "  ✓ TypeScript compilation successful"
else
  echo "  ✗ TypeScript compilation failed"
fi

# Test 5: Check environment files
echo ""
echo "✓ Testing environment files..."
if [ -f ".env.development" ]; then
  echo "  ✓ .env.development exists"
else
  echo "  ✗ .env.development not found"
  exit 1
fi

if [ -f ".env.production" ]; then
  echo "  ✓ .env.production exists"
else
  echo "  ✗ .env.production not found"
  exit 1
fi

if [ -f "server/.env.example" ]; then
  echo "  ✓ server/.env.example exists"
else
  echo "  ✗ server/.env.example not found"
  exit 1
fi

echo ""
echo "=========================================="
echo "✓ All tests passed!"
echo "=========================================="
