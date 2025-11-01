#!/bin/bash

# Quick 2-Minute Verification Script for Starter Flow
# Tests that Starter plan routes to grant-starter (NOT Stripe)

set -e

SITE_URL="${1:-https://supplementsafetybible.com}"
TEST_EMAIL="test-starter-$(date +%s)@example.com"

echo "=================================================="
echo "🧪 STARTER FLOW VERIFICATION SCRIPT"
echo "=================================================="
echo ""
echo "Site: $SITE_URL"
echo "Test Email: $TEST_EMAIL"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "📋 Quick Verification Checklist:"
echo ""

# Test 1: Check grant-starter function exists
echo -n "1. Checking grant-starter function exists... "
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  "$SITE_URL/.netlify/functions/grant-starter" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' 2>/dev/null || echo "000")

if [ "$response" = "200" ]; then
  echo -e "${GREEN}✓ PASS${NC} (Status: $response)"
  echo "   → grant-starter function is deployed and responding"
else
  echo -e "${RED}✗ FAIL${NC} (Status: $response)"
  echo "   → grant-starter may not be deployed"
fi
echo ""

# Test 2: Verify function returns proper structure
echo -n "2. Testing grant-starter response structure... "
full_response=$(curl -s -X POST \
  "$SITE_URL/.netlify/functions/grant-starter" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\"}")

if echo "$full_response" | grep -q '"ok":true'; then
  echo -e "${GREEN}✓ PASS${NC}"
  echo "   → Response contains 'ok: true'"
  if echo "$full_response" | grep -q '"tempPassword"'; then
    echo "   → Temp password generated"
  fi
  if echo "$full_response" | grep -q '"email"'; then
    echo "   → Email confirmed in response"
  fi
else
  echo -e "${RED}✗ FAIL${NC}"
  echo "   → Response: $full_response"
fi
echo ""

# Test 3: Check that Stripe checkout still exists (for Pro/Premium)
echo -n "3. Checking Stripe checkout function exists (Pro/Premium)... "
stripe_response=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS \
  "$SITE_URL/.netlify/functions/create-checkout-session" 2>/dev/null || echo "000")

if [ "$stripe_response" = "200" ]; then
  echo -e "${GREEN}✓ PASS${NC} (Status: $stripe_response)"
  echo "   → Stripe checkout still available for paid plans"
else
  echo -e "${YELLOW}⚠ WARNING${NC} (Status: $stripe_response)"
  echo "   → Stripe checkout may have issues"
fi
echo ""

# Test 4: Check generate-pdf function
echo -n "4. Checking generate-pdf function exists... "
pdf_response=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS \
  "$SITE_URL/.netlify/functions/generate-pdf" 2>/dev/null || echo "000")

if [ "$pdf_response" = "200" ]; then
  echo -e "${GREEN}✓ PASS${NC} (Status: $pdf_response)"
  echo "   → PDF generation function deployed"
else
  echo -e "${YELLOW}⚠ WARNING${NC} (Status: $pdf_response)"
  echo "   → PDF function may need redeploy"
fi
echo ""

echo "=================================================="
echo "📊 SUMMARY"
echo "=================================================="
echo ""
echo "Network Request Paths:"
echo "  • Starter Plan:    POST $SITE_URL/.netlify/functions/grant-starter"
echo "  • Pro/Premium:     POST $SITE_URL/.netlify/functions/create-checkout-session"
echo "  • PDF Generation:  POST $SITE_URL/.netlify/functions/generate-pdf"
echo ""

echo "Expected Netlify Function Logs:"
echo "  1. Click 'Get Started Free' → grant-starter called"
echo "  2. Console shows: 'Starter plan detected - using grant-starter flow'"
echo "  3. Function returns 200 with { ok: true, email, tempPassword }"
echo "  4. User redirected to /thanks?session_id=starter"
echo "  5. Auto-login and redirect to /dashboard"
echo ""

echo -e "${YELLOW}Manual Verification Steps:${NC}"
echo "  1. Open browser DevTools → Network tab"
echo "  2. Go to $SITE_URL/pricing"
echo "  3. Click 'Get Started Free' on Starter plan"
echo "  4. Watch Network tab → Should see:"
echo "     ✓ POST to grant-starter (NOT create-checkout-session)"
echo "     ✓ Status 200"
echo "     ✓ Response contains email and tempPassword"
echo "  5. Should redirect to /thanks?session_id=starter"
echo "  6. Should auto-login and go to /dashboard"
echo ""

echo -e "${GREEN}Netlify Dashboard Check:${NC}"
echo "  1. Go to: https://app.netlify.com → Functions"
echo "  2. Verify 'grant-starter' appears in function list"
echo "  3. Check last deployed date = today"
echo "  4. Click function → View logs"
echo "  5. Test by clicking Starter button → logs should show 200"
echo ""

echo "=================================================="
echo "✅ Test script complete"
echo "=================================================="
