#!/bin/bash

# Netlify Deployment Script with Environment Validation
# This script helps you deploy supplementsafetybible.com with all required environment variables

set -e

echo "======================================"
echo "Supplement Safety Bible - Netlify Deploy"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✓${NC} Loaded .env file"
else
    echo -e "${RED}✗${NC} .env file not found"
    exit 1
fi

echo ""
echo "Validating Environment Variables..."
echo "======================================"

# Check required variables
REQUIRED_VARS=(
    "BOLT_DATABASE_URL"
    "BOLT_DATABASE_ANON_KEY"
    "BOLT_DATABASE_SERVICE_ROLE_KEY"
    "STRIPE_SECRET_KEY"
    "PRICE_ID_PRO_MONTHLY"
    "PRICE_ID_PRO_ANNUAL"
    "PRICE_ID_PREMIUM_MONTHLY"
    "PRICE_ID_PREMIUM_ANNUAL"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}✗${NC} $var - MISSING"
        MISSING_VARS+=("$var")
    else
        echo -e "${GREEN}✓${NC} $var - Present"
    fi
done

echo ""

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}ERROR: Missing required environment variables!${NC}"
    echo ""
    echo "Missing variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "Please update your .env file and try again."
    exit 1
fi

echo -e "${GREEN}✓ All required environment variables are present${NC}"
echo ""

# Display configuration summary
echo "Configuration Summary:"
echo "======================================"
echo "Supabase URL: ${BOLT_DATABASE_URL}"
echo "Supabase Anon Key: ${BOLT_DATABASE_ANON_KEY:0:20}..."
echo "Supabase Service Key: ${BOLT_DATABASE_SERVICE_ROLE_KEY:0:20}..."
echo "Stripe Secret Key: ${STRIPE_SECRET_KEY:0:20}..."
echo "Pro Monthly Price: ${PRICE_ID_PRO_MONTHLY}"
echo "Pro Annual Price: ${PRICE_ID_PRO_ANNUAL}"
echo "Premium Monthly Price: ${PRICE_ID_PREMIUM_MONTHLY}"
echo "Premium Annual Price: ${PRICE_ID_PREMIUM_ANNUAL}"
echo ""

# Build the project
echo "Building project..."
echo "======================================"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Build completed successfully"
else
    echo -e "${RED}✗${NC} Build failed"
    exit 1
fi

echo ""
echo "======================================"
echo "Next Steps for Netlify Deployment"
echo "======================================"
echo ""
echo "1. Log into Netlify:"
echo "   https://app.netlify.com"
echo ""
echo "2. Select your site: supplementsafetybible.com"
echo ""
echo "3. Go to: Site Settings → Environment Variables"
echo ""
echo "4. Add the following 8 variables:"
echo "   (Copy values from your .env file)"
echo ""
echo "   Variable Name                        | Value"
echo "   -------------------------------------|------------------------"
echo "   BOLT_DATABASE_URL                    | ${BOLT_DATABASE_URL}"
echo "   BOLT_DATABASE_ANON_KEY               | ${BOLT_DATABASE_ANON_KEY:0:30}..."
echo "   BOLT_DATABASE_SERVICE_ROLE_KEY       | ${BOLT_DATABASE_SERVICE_ROLE_KEY:0:30}..."
echo "   STRIPE_SECRET_KEY                    | ${STRIPE_SECRET_KEY:0:30}..."
echo "   PRICE_ID_PRO_MONTHLY                 | ${PRICE_ID_PRO_MONTHLY}"
echo "   PRICE_ID_PRO_ANNUAL                  | ${PRICE_ID_PRO_ANNUAL}"
echo "   PRICE_ID_PREMIUM_MONTHLY             | ${PRICE_ID_PREMIUM_MONTHLY}"
echo "   PRICE_ID_PREMIUM_ANNUAL              | ${PRICE_ID_PREMIUM_ANNUAL}"
echo ""
echo "5. For each variable, select 'All contexts'"
echo ""
echo "6. Go to: Deploys → Trigger deploy → Clear cache and deploy site"
echo ""
echo "7. After deployment, verify with:"
echo ""
echo "   curl https://supplementsafetybible.com/.netlify/functions/env-check"
echo ""
echo "   Expected: All values should be 'true'"
echo ""
echo "======================================"
echo ""
echo -e "${GREEN}Local validation complete!${NC}"
echo "Follow the steps above to complete deployment on Netlify."
echo ""
