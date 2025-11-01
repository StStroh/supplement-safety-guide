# Stripe → Netlify Price ID Sync Guide

## Overview
This guide automates the end-to-end process of syncing live Stripe Price IDs to Netlify environment variables and deploying the updated configuration.

## What This Does

1. **Fetches live prices** from Stripe (not cached data)
2. **Maps products** by name to correct price IDs
3. **Updates Netlify** environment variables
4. **Triggers deploy** with cache clearing
5. **Verifies** the deployment works correctly

## Prerequisites

You need three credentials:

1. **STRIPE_SECRET_KEY** (sk_live_...)
   - Get from: https://dashboard.stripe.com/apikeys
   - Use a restricted key with read access to Products & Prices
   - Live mode only

2. **NETLIFY_AUTH_TOKEN**
   - Get from: https://app.netlify.com/user/applications/personal
   - Create a new personal access token
   - Requires site update permissions

3. **NETLIFY_SITE_ID**
   - Find in: Site settings → Site details → Site information
   - Or from the URL: `app.netlify.com/sites/[SITE_ID]/...`

## Stripe Products Required

The script looks for these products in your Stripe account:

| Product Name (contains) | Required Prices | Expected Amount |
|------------------------|----------------|-----------------|
| "Professional Plan" | Monthly (recurring) | $9.99 |
| "Professional Plan" | Annual (recurring) | $99.99 (optional) |
| "Premium Plan" | Monthly (recurring) | $49.99 |
| "Premium Plan" | Annual (recurring) | $239.00 (optional) |
| "Supplement Safety Bible" | One-time | $4.99 |
| "Starter Access" | N/A (free, no Stripe) | $0.00 |

**Note**: Annual prices are optional. If not found, the monthly price will be used as fallback.

## Running the Sync

### Step 1: Run the sync script

```bash
node sync-stripe-to-netlify.js
```

### Step 2: Enter credentials when prompted

The script will ask for:
- `STRIPE_SECRET_KEY`: Your input will be masked (*****)
- `NETLIFY_AUTH_TOKEN`: Plain text input
- `NETLIFY_SITE_ID`: Plain text input

### Step 3: Wait for completion

The script will:
1. Fetch products and prices from Stripe
2. Display what it found
3. Update Netlify environment variables
4. Trigger a new deploy
5. Show summary table

Example output:
```
=== Stripe → Netlify Price ID Sync Tool ===

✓ Credentials collected (masked for security)
  Stripe Key: sk_live_51J...
  Site ID: 8a7b3c2d...

📦 Fetching products from Stripe...
💰 Fetching prices from Stripe...
✓ Found 4 products, 7 prices

✓ Professional Plan:
  Monthly: price_1ABC2... ($9.99)
  Annual: price_1XYZ3... ($99.99)
✓ Premium Plan:
  Monthly: price_1DEF4... ($49.99)
  Annual: price_1UVW5... ($239.00)
✓ Digital Guide:
  One-time: price_1GHI6... ($4.99)

📝 Updating Netlify environment variables...
  ✓ VITE_PRICE_ID_PRO_MONTHLY = price_1ABC2...
  ✓ VITE_PRICE_ID_PRO_ANNUAL = price_1XYZ3...
  ✓ VITE_PRICE_ID_PREMIUM_MONTHLY = price_1DEF4...
  ✓ VITE_PRICE_ID_PREMIUM_ANNUAL = price_1UVW5...
  ✓ VITE_PRICE_ID_GUIDE = price_1GHI6...

🚀 Deploy triggered: 65f8a9b7...
  URL: https://app.netlify.com/sites/[site-id]/deploys

=== Summary ===

Environment Variables Set:
┌─────────────────────────────────┬──────────────────────────────┐
│ Variable                        │ Stripe Price ID              │
├─────────────────────────────────┼──────────────────────────────┤
│ VITE_PRICE_ID_PRO_MONTHLY       │ price_1ABC2...               │
│ VITE_PRICE_ID_PRO_ANNUAL        │ price_1XYZ3...               │
│ VITE_PRICE_ID_PREMIUM_MONTHLY   │ price_1DEF4...               │
│ VITE_PRICE_ID_PREMIUM_ANNUAL    │ price_1UVW5...               │
│ VITE_PRICE_ID_GUIDE             │ price_1GHI6...               │
└─────────────────────────────────┴──────────────────────────────┘

✅ Sync Complete!
```

## Verification

### Step 4: Run verification script

Wait 2-3 minutes for Netlify deploy to complete, then:

```bash
node verify-deployment.js
```

This will test:
- ✓ Pricing page loads
- ✓ Free signup page exists
- ✓ Checkout function exists

Example output:
```
=== Deployment Verification ===

Site: https://supplementsafetybible.com

✓ Testing /pricing page...
  ✓ Pricing page loads successfully
✓ Testing /signup-free page...
  ✓ Free signup page accessible
✓ Testing Stripe checkout function...
  ✓ Checkout function exists (status: 405)

=== Test Summary ===

┌─────────────────────────────────────┬──────────┐
│ Test                                │ Status   │
├─────────────────────────────────────┼──────────┤
│ Pricing page loads                  │ ✓ PASS   │
│ Free signup page exists             │ ✓ PASS   │
│ Checkout function exists            │ ✓ PASS   │
└─────────────────────────────────────┴──────────┘

3/3 tests passed

✅ All verification tests passed!
```

### Step 5: Manual verification

Visit https://supplementsafetybible.com/pricing and test:

1. **Starter Plan** (Free)
   - Click "Start Free"
   - Should redirect to `/signup-free`
   - Should NOT open Stripe checkout
   - Should create free user session immediately

2. **Professional Plan** (Monthly)
   - Click "Upgrade to Pro"
   - Should open Stripe checkout
   - Should show correct monthly price ($9.99)
   - Should show Professional Plan product

3. **Professional Plan** (Annual)
   - Switch toggle to "Yearly"
   - Click "Upgrade to Pro — Yearly"
   - Should open Stripe checkout
   - Should show correct annual price ($99.99)
   - Should show Professional Plan product

4. **Premium Plan**
   - Test both monthly ($49.99) and yearly ($239.00)
   - Verify correct prices in Stripe checkout

5. **Digital Guide**
   - Click "Get the Guide"
   - Should open Stripe checkout (payment mode, not subscription)
   - Should show $4.99 one-time price

6. **Guest Checkout**
   - Open pricing in incognito/private window
   - Click any paid plan
   - Should allow checkout with email only (no login required)

## Code Verification

### Files Using Price IDs

The following files reference Stripe price IDs:

1. **`src/components/pricing/DynamicPricingGrid.tsx`**
   - Uses `VITE_PRICE_ID_PRO_MONTHLY` (fallback to `VITE_PRICE_ID_PRO`)
   - Uses `VITE_PRICE_ID_PRO_ANNUAL`
   - Uses `VITE_PRICE_ID_PREMIUM_MONTHLY` (fallback to `VITE_PRICE_ID_PREMIUM`)
   - Uses `VITE_PRICE_ID_PREMIUM_ANNUAL`
   - Uses `VITE_PRICE_ID_GUIDE`
   - **Starter bypass**: Line 37-40 redirects to `/signup-free` (no Stripe)

2. **`src/pages/DashboardPage.tsx`**
   - Line 251: Uses `VITE_PRICE_ID_PRO_MONTHLY` for upgrade banner
   - Fallback to legacy `VITE_PRICE_ID_PRO`

3. **`src/pages/Checker.tsx`**
   - Line 90: Uses `VITE_PRICE_ID_PRO_MONTHLY` for usage modal
   - Fallback to legacy `VITE_PRICE_ID_PRO`

### Legacy Variable Support

These files maintain backward compatibility:
- If `VITE_PRICE_ID_PRO_MONTHLY` is not set, falls back to `VITE_PRICE_ID_PRO`
- If `VITE_PRICE_ID_PREMIUM_MONTHLY` is not set, falls back to `VITE_PRICE_ID_PREMIUM`

## Troubleshooting

### Error: Missing required price IDs

If you see this error:
```
❌ Missing required price IDs: VITE_PRICE_ID_PRO_MONTHLY
   Visit: https://dashboard.stripe.com/products
```

**Solution**:
1. Go to https://dashboard.stripe.com/products
2. Find the "Professional Plan" product
3. Ensure it has a monthly recurring price in USD
4. Verify the price is marked as "Active"
5. Run the sync script again

### Error: HTTP 401 Unauthorized

**Cause**: Invalid Stripe or Netlify credentials

**Solution**:
1. Verify your Stripe key starts with `sk_live_`
2. Test Stripe key: `curl -u sk_live_...: https://api.stripe.com/v1/prices`
3. Verify Netlify token has site update permissions
4. Regenerate tokens if needed

### Error: Product not found

**Cause**: Product names don't match expected patterns

The script searches for these strings (case-insensitive):
- "professional" in product name
- "premium" in product name
- "supplement" AND "bible" in product name

**Solution**:
1. Rename products in Stripe to match
2. Or update the script's product matching logic

### Deploy succeeded but prices wrong

**Cause**: Environment variables not properly set or cached

**Solution**:
1. Check Netlify dashboard: Site settings → Environment variables
2. Verify all 5 variables are present and correct
3. Trigger a new deploy with "Clear cache and deploy site"
4. Hard refresh browser (Ctrl+Shift+R) on pricing page

### Starter plan opens Stripe checkout

**Cause**: Code regression or incorrect plan ID

**Solution**:
1. Check `src/components/pricing/DynamicPricingGrid.tsx` line 37
2. Verify: `if (plan.id === 'starter')` condition exists
3. Verify: `navigate('/signup-free')` is called
4. Check browser console for errors
5. Rebuild and redeploy

## Security Notes

- The script never echoes back your secret keys
- Credentials are only stored in memory during execution
- Stripe key input is masked with asterisks
- Consider using Stripe restricted keys with minimal permissions
- Never commit credentials to git
- Rotate tokens regularly

## Environment Variables Summary

After running the sync, these variables should be set in Netlify:

```bash
# Monthly prices
VITE_PRICE_ID_PRO_MONTHLY=price_1ABC...      # Professional monthly
VITE_PRICE_ID_PREMIUM_MONTHLY=price_1DEF...  # Premium monthly

# Annual prices (optional)
VITE_PRICE_ID_PRO_ANNUAL=price_1XYZ...       # Professional annual
VITE_PRICE_ID_PREMIUM_ANNUAL=price_1UVW...   # Premium annual

# One-time purchase
VITE_PRICE_ID_GUIDE=price_1GHI...            # Digital Guide

# Legacy (maintained for backward compatibility)
VITE_PRICE_ID_PRO=price_1ABC...              # Falls back to monthly
VITE_PRICE_ID_PREMIUM=price_1DEF...          # Falls back to monthly
```

## Support

If you encounter issues:

1. Check all products exist in Stripe dashboard
2. Verify products are marked "Active"
3. Ensure prices are in USD currency
4. Confirm Netlify deploy completed successfully
5. Check browser console for JavaScript errors
6. Review Netlify function logs for backend errors

---

**Last Updated**: 2025-10-25
**Script Version**: 1.0
**Status**: Production Ready ✅
