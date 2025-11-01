#!/bin/bash

# Export environment variables in Netlify CLI format
# Usage: ./netlify-env-export.sh

set -e

# Load .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "ERROR: .env file not found"
    exit 1
fi

echo "======================================"
echo "Netlify Environment Variables Export"
echo "======================================"
echo ""
echo "Copy and paste these commands to set environment variables using Netlify CLI:"
echo ""
echo "# Make sure you're logged in first:"
echo "# netlify login"
echo ""
echo "# Link to your site if not already linked:"
echo "# netlify link"
echo ""
echo "# Set environment variables:"
echo ""

cat << EOF
netlify env:set BOLT_DATABASE_URL "$BOLT_DATABASE_URL"
netlify env:set BOLT_DATABASE_ANON_KEY "$BOLT_DATABASE_ANON_KEY"
netlify env:set BOLT_DATABASE_SERVICE_ROLE_KEY "$BOLT_DATABASE_SERVICE_ROLE_KEY"
netlify env:set STRIPE_SECRET_KEY "$STRIPE_SECRET_KEY"
netlify env:set PRICE_ID_PRO_MONTHLY "$PRICE_ID_PRO_MONTHLY"
netlify env:set PRICE_ID_PRO_ANNUAL "$PRICE_ID_PRO_ANNUAL"
netlify env:set PRICE_ID_PREMIUM_MONTHLY "$PRICE_ID_PREMIUM_MONTHLY"
netlify env:set PRICE_ID_PREMIUM_ANNUAL "$PRICE_ID_PREMIUM_ANNUAL"
EOF

echo ""
echo "# Deploy with cache clear:"
echo "netlify deploy --prod --build"
echo ""
echo "======================================"
echo ""
echo "Or save to a file and run it:"
echo "./netlify-env-export.sh > set-env.sh"
echo "bash set-env.sh"
echo ""
