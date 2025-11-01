#!/bin/bash

echo "==================================="
echo "Environment Variables Verification"
echo "==================================="
echo ""

# Load local .env file
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

echo "✅ Local .env file found"
echo ""

echo "📋 Required Variables for Production:"
echo "-----------------------------------"
echo ""

# Read and display each variable
echo "Client-Side Variables (VITE_*):"
echo "  VITE_SUPABASE_URL=$(grep VITE_SUPABASE_URL .env | cut -d '=' -f2)"
echo "  VITE_SUPABASE_ANON_KEY=$(grep VITE_SUPABASE_ANON_KEY .env | cut -d '=' -f2 | cut -c1-20)..."
echo "  VITE_STRIPE_PUBLISHABLE_KEY=$(grep VITE_STRIPE_PUBLISHABLE_KEY .env | cut -d '=' -f2 | cut -c1-20)..."
echo "  VITE_PRICE_ID_STARTER=$(grep VITE_PRICE_ID_STARTER .env | cut -d '=' -f2)"
echo "  VITE_PRICE_ID_PRO=$(grep VITE_PRICE_ID_PRO .env | cut -d '=' -f2)"
echo "  VITE_PRICE_ID_PREMIUM=$(grep VITE_PRICE_ID_PREMIUM .env | cut -d '=' -f2)"
echo ""
echo "Server-Side Variables (NO VITE_ prefix):"
SECRET_KEY=$(grep STRIPE_SECRET_KEY .env | cut -d '=' -f2)
if [[ "$SECRET_KEY" == "your_stripe_secret_key_here" ]]; then
    echo "  STRIPE_SECRET_KEY=❌ NOT SET (placeholder value)"
else
    echo "  STRIPE_SECRET_KEY=✅ SET (hidden for security)"
fi
echo ""

echo "==================================="
echo "Manual Verification Steps:"
echo "==================================="
echo ""
echo "1. CHECK BOLT SECRETS:"
echo "   - Open Bolt → Settings → Secrets"
echo "   - Verify all 7 variables above exist"
echo "   - Ensure values match exactly"
echo ""
echo "2. CHECK NETLIFY ENVIRONMENT:"
echo "   - Go to: https://app.netlify.com"
echo "   - Site settings → Environment variables"
echo "   - Verify all 7 variables above exist"
echo "   - Ensure STRIPE_SECRET_KEY has real sk_live_... key"
echo ""
echo "3. TRIGGER DEPLOYMENT:"
echo "   - In Netlify: Deploys → Trigger deploy"
echo "   - Select: Clear cache and deploy site"
echo ""
echo "==================================="
