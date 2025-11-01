# Annual Pricing Toggle - Setup Guide

## Overview
The pricing page now has a Monthly/Yearly toggle that persists user preference and dynamically updates prices and Stripe checkout links.

## Features Implemented
✅ Monthly/Yearly toggle with "Save 20%" badge
✅ Toggle state persists in localStorage across page refreshes
✅ Smooth fade-in animations when switching between plans
✅ Button text updates: "Subscribe Monthly" vs "Subscribe Yearly"
✅ Starter/Free plan remains unchanged in both views
✅ Correct Stripe Price IDs used based on toggle selection

## Required Netlify Environment Variables

You need to add the following environment variables in your Netlify dashboard:

### Navigate to:
Netlify Dashboard → Your Site → Site settings → Environment variables

### Add these variables:

```
VITE_PRICE_ID_PRO_MONTHLY=price_xxx    # Your monthly Pro price ID from Stripe
VITE_PRICE_ID_PRO_ANNUAL=price_xxx     # Your annual Pro price ID from Stripe
VITE_PRICE_ID_PREMIUM_MONTHLY=price_xxx # Your monthly Premium price ID from Stripe
VITE_PRICE_ID_PREMIUM_ANNUAL=price_xxx  # Your annual Premium price ID from Stripe
```

**Note:** The existing `VITE_PRICE_ID_PRO` and `VITE_PRICE_ID_PREMIUM` variables will be used as fallbacks if the monthly-specific ones aren't set.

## How to Get Your Annual Price IDs from Stripe

1. Go to https://dashboard.stripe.com/products
2. Find your Pro product
3. Click on it to see all prices
4. Copy the Price ID that starts with `price_` for the annual/yearly option
5. Repeat for Premium product

## Testing Checklist

### Test 1: Toggle Functionality
- [ ] Visit /pricing page
- [ ] Toggle should default to "Monthly"
- [ ] Click "Yearly (Save 20%)"
- [ ] Prices should update to show annual amounts
- [ ] Green "💰 Save 20%" badge should appear
- [ ] Refresh page - toggle should stay on "Yearly"

### Test 2: Stripe Checkout Links
- [ ] With Monthly selected, click "Subscribe Now" on Pro
- [ ] Stripe checkout should show monthly price
- [ ] Go back, switch to Yearly
- [ ] Click "Subscribe Now" on Pro
- [ ] Stripe checkout should show annual price

### Test 3: Free Starter Plan
- [ ] Free Starter plan should show $0.00 in both Monthly and Yearly views
- [ ] "Get Started Free" button should work the same (no Stripe)
- [ ] "No credit card required" badge should be visible

### Test 4: Mobile Responsiveness
- [ ] Toggle should be readable on mobile
- [ ] Pricing cards should stack properly
- [ ] No layout shift when switching between Monthly/Yearly

## Files Changed

1. **src/pages/PricingPage.tsx**
   - Added localStorage persistence for toggle state
   - Updated badge text to "Save 20%"
   - Added smooth transition animations
   - Toggle button labels: "Monthly" and "Yearly (Save 20%)"

2. **src/index.css**
   - Added fadeIn animation for price card transitions

3. **.env.example**
   - Added annual price ID variables for documentation

4. **netlify/functions/get-stripe-prices.js**
   - Already supports fetching annual prices (no changes needed)

## Architecture Notes

- The toggle state is stored in `localStorage` with key `billing_interval`
- Values: `'month'` or `'year'`
- The `get-stripe-prices` function fetches both monthly and annual prices from Stripe
- Frontend filters prices based on the selected billing interval
- Free Starter plan is hardcoded (doesn't come from Stripe)

## Deployment Instructions

1. Add the environment variables to Netlify (see above)
2. Deploy the built `dist/` folder
3. Test both toggle states work correctly
4. Verify Stripe checkout opens with correct annual/monthly prices

## Support

If annual prices aren't showing up:
1. Check that the annual Price IDs are added to Netlify environment variables
2. Make sure the annual prices exist in your Stripe dashboard
3. Check the browser console for any errors from get-stripe-prices function
4. Verify the price IDs in Netlify match exactly what's in Stripe (including the `price_` prefix)
