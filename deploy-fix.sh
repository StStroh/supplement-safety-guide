#!/bin/bash

set -e

echo "🚀 Deploying Supabase Signup Fix"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check environment
echo "📋 Step 1: Checking environment..."
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    exit 1
fi

if ! grep -q "VITE_SUPABASE_URL" .env; then
    echo -e "${RED}❌ VITE_SUPABASE_URL not found in .env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment files OK${NC}"
echo ""

# Step 2: Build project
echo "🔨 Step 2: Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Step 3: Show migration reminder
echo -e "${YELLOW}📊 Step 3: Apply Database Migration${NC}"
echo ""
echo "IMPORTANT: Before deploying, apply the database migration:"
echo ""
echo "1. Open Supabase Dashboard:"
echo "   https://supabase.com/dashboard"
echo ""
echo "2. Go to SQL Editor → New query"
echo ""
echo "3. Run this migration file:"
echo "   supabase/migrations/20251025200000_fix_profile_creation.sql"
echo ""
read -p "Have you applied the migration? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Please apply the migration first${NC}"
    echo ""
    echo "Copy and run this SQL:"
    echo ""
    cat supabase/migrations/20251025200000_fix_profile_creation.sql
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Migration applied${NC}"
echo ""

# Step 4: Deploy to Netlify
echo "🌐 Step 4: Deploying to Netlify..."
echo ""

if command -v netlify &> /dev/null; then
    echo "Using Netlify CLI..."
    netlify deploy --prod --dir=dist

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Deployment successful!${NC}"
    else
        echo -e "${RED}❌ Deployment failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Netlify CLI not found${NC}"
    echo ""
    echo "Deploy manually:"
    echo "1. Go to: https://app.netlify.com"
    echo "2. Select your site"
    echo "3. Deploys → Trigger deploy → Clear cache and deploy site"
    echo ""
    echo "Or install Netlify CLI:"
    echo "  npm install -g netlify-cli"
    echo "  netlify login"
    echo "  netlify link"
    echo ""
fi

# Step 5: Verification checklist
echo ""
echo "📋 Post-Deployment Verification:"
echo ""
echo "1. Visit: https://supplementsafetybible.com/pricing"
echo "2. Click 'Start Free' on Starter plan"
echo "3. Sign up with test email"
echo "4. Verify no 'Failed to fetch' error"
echo "5. Check Supabase dashboard for new user + profile"
echo ""
echo "SQL to verify:"
echo "  SELECT u.email, p.plan, p.created_at"
echo "  FROM auth.users u"
echo "  LEFT JOIN profiles p ON p.id = u.id"
echo "  ORDER BY u.created_at DESC LIMIT 5;"
echo ""
echo -e "${GREEN}🎉 Deployment script complete!${NC}"
echo ""
echo "See DEPLOY_SUPABASE_FIX.md for detailed instructions"
