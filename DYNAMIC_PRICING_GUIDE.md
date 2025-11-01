# Dynamic Pricing Grid - Implementation Guide

## Overview
A fully dynamic, JSON-driven pricing grid with 4 plans (Starter, Professional, Premium, Digital Guide) and Monthly/Yearly toggle.

## Features Implemented

✅ **Dynamic Configuration**: All pricing details pulled from `src/config/pricing.json`
✅ **Monthly/Yearly Toggle**: Automatically switches prices and Stripe checkout links
✅ **Persistent State**: Toggle selection saves to localStorage
✅ **Stripe Integration**: Pro, Premium, and Guide plans connect to Stripe Checkout
✅ **Free Starter Flow**: No Stripe for Starter plan - direct to `/signup-free`
✅ **Visual Ribbons**: "Most Popular", "Best Value", "Start here - no card required"
✅ **Responsive Design**: 4-column desktop, 2-column tablet, 1-column mobile
✅ **Smooth Animations**: Fade-in effects when toggling between plans
✅ **Guarantee Banner**: "14-day money-back guarantee • Stripe Secure • Cancel anytime"

## File Structure

### New Files Created:
1. **`src/config/pricing.json`** - Master pricing configuration
2. **`src/components/pricing/DynamicPricingGrid.tsx`** - Main grid component

### Modified Files:
1. **`src/pages/PricingPage.tsx`** - Simplified to use DynamicPricingGrid
2. **`.env.example`** - Added VITE_PRICE_ID_GUIDE variable

## Configuration JSON Structure

The pricing grid is fully driven by `src/config/pricing.json`:

```json
{
  "plans": [
    {
      "id": "starter",
      "name": "Starter",
      "tagline": "Start here — no card required",
      "monthly_price": 0,
      "yearly_price": 0,
      "stripe_price_id_monthly": null,
      "stripe_price_id_yearly": null,
      "cta_text": "Start Free",
      "features": [...],
      "highlight": false
    },
    // ... more plans
  ],
  "toggle_labels": {
    "monthly": "Monthly",
    "yearly": "Yearly (Save 20%)"
  },
  "ui_labels": {
    "most_popular": "Most Popular",
    "best_value": "Best Value",
    "free_ribbon": "Start here — no card required",
    "guarantee": "14-day money-back guarantee",
    "secure_checkout": "Stripe Secure • Cancel anytime • Works on mobile"
  }
}
```

## Environment Variables Required

Add these to your Netlify dashboard (Site settings → Environment variables):

```bash
# Existing variables
VITE_PRICE_ID_PRO_MONTHLY=price_xxx
VITE_PRICE_ID_PRO_ANNUAL=price_xxx
VITE_PRICE_ID_PREMIUM_MONTHLY=price_xxx
VITE_PRICE_ID_PREMIUM_ANNUAL=price_xxx

# New variable for Digital Guide
VITE_PRICE_ID_GUIDE=price_xxx
```

## Price ID Mapping

The component maps config placeholders to actual Stripe price IDs:

| Config Placeholder | Environment Variable | Plan |
|-------------------|---------------------|------|
| `price_PRO_MONTHLY_LIVE` | `VITE_PRICE_ID_PRO_MONTHLY` | Pro Monthly |
| `price_PRO_YEARLY_LIVE` | `VITE_PRICE_ID_PRO_ANNUAL` | Pro Annual |
| `price_PREMIUM_MONTHLY_LIVE` | `VITE_PRICE_ID_PREMIUM_MONTHLY` | Premium Monthly |
| `price_PREMIUM_YEARLY_LIVE` | `VITE_PRICE_ID_PREMIUM_ANNUAL` | Premium Annual |
| `price_GUIDE_ONETIME_LIVE` | `VITE_PRICE_ID_GUIDE` | Digital Guide |

## Visual Design

### Plan Ribbons:
- **Starter**: Teal ribbon - "Start here - no card required"
- **Professional**: Blue ribbon - "Most Popular"
- **Premium**: Green ribbon - "Best Value"
- **Digital Guide**: Gray ribbon - "One-time purchase"

### Card Highlighting:
- **Professional** and **Premium** have `highlight: true` → blue border, shadow, scale-105
- **Starter** has subtle teal gradient background
- **Starter** shows "No credit card" badge in top-right

### Toggle Behavior:
- Toggle persists in localStorage (key: `billing_interval`)
- Monthly is default
- When Yearly selected: "💰 Save 20%" badge appears
- Prices update instantly with fade-in animation

## How It Works

### 1. Plan Selection Flow

```typescript
// For Starter plan
if (plan.id === 'starter') {
  navigate('/signup-free'); // No Stripe
}

// For paid plans
const priceId = billingInterval === 'yearly'
  ? plan.stripe_price_id_yearly
  : plan.stripe_price_id_monthly;

// Map placeholder to actual Stripe price ID
const mappedPriceId = mapPriceId(priceId);

// Create Stripe checkout session
fetch('/.netlify/functions/create-checkout-session', {
  body: JSON.stringify({ priceId: mappedPriceId })
});
```

### 2. CTA Text Logic

Plans can have:
- **Static CTA**: `"cta_text": "Start Free"`
- **Dynamic CTA**:
  ```json
  "cta_text": {
    "monthly": "Upgrade to Pro",
    "yearly": "Upgrade to Pro — Yearly"
  }
  ```

### 3. Price Display

- **Free plan**: Shows "Free"
- **One-time purchase**: Shows "$4.99" (no interval)
- **Monthly**: Shows "$9.99/mo"
- **Yearly**: Shows "$99.99/year"

## Testing Checklist

### Visual Tests:
- [ ] 4 cards display in a balanced grid
- [ ] Ribbons show correct colors and text
- [ ] Toggle switches smoothly between Monthly/Yearly
- [ ] "Save 20%" badge appears only on Yearly
- [ ] Starter card shows "No credit card" badge
- [ ] Guarantee banner displays at bottom
- [ ] Cards scale properly on mobile (stack vertically)

### Functional Tests:
- [ ] Click "Start Free" → Redirects to `/signup-free` (no Stripe)
- [ ] Click "Upgrade to Pro" (Monthly) → Opens Stripe with monthly price
- [ ] Switch to Yearly, click "Upgrade to Pro - Yearly" → Opens Stripe with annual price
- [ ] Click "Go Premium" → Opens correct Stripe checkout
- [ ] Click "Get the Guide" → Opens Stripe for one-time purchase
- [ ] Refresh page → Toggle stays in last selected position
- [ ] No console errors

### Stripe Tests:
- [ ] Pro Monthly opens correct Stripe product/price
- [ ] Pro Yearly opens correct annual Stripe product/price
- [ ] Premium Monthly opens correct Stripe product/price
- [ ] Premium Yearly opens correct annual Stripe product/price
- [ ] Digital Guide opens correct one-time Stripe product/price

## Customization

### To Add a New Plan:
Edit `src/config/pricing.json` and add a new plan object:

```json
{
  "id": "enterprise",
  "name": "Enterprise",
  "tagline": "For Teams",
  "monthly_price": 99.99,
  "yearly_price": 999.99,
  "stripe_price_id_monthly": "price_ENTERPRISE_MONTHLY",
  "stripe_price_id_yearly": "price_ENTERPRISE_YEARLY",
  "cta_text": {
    "monthly": "Contact Sales",
    "yearly": "Contact Sales — Yearly"
  },
  "features": [
    "Unlimited users",
    "SSO integration",
    "Dedicated support"
  ],
  "highlight": false
}
```

Then add the price mapping in `DynamicPricingGrid.tsx`:

```typescript
const mapping: Record<string, string> = {
  // ... existing mappings
  'price_ENTERPRISE_MONTHLY': import.meta.env.VITE_PRICE_ID_ENTERPRISE_MONTHLY || '',
  'price_ENTERPRISE_YEARLY': import.meta.env.VITE_PRICE_ID_ENTERPRISE_ANNUAL || ''
};
```

### To Change Labels:
Edit the `toggle_labels` and `ui_labels` sections in `pricing.json`.

### To Change Colors:
Edit the ribbon colors in `DynamicPricingGrid.tsx`:

```typescript
const getRibbonColor = (plan: Plan): string => {
  if (plan.id === 'starter') return 'bg-teal-500';
  if (plan.tagline === 'Most Popular') return 'bg-blue-500';
  if (plan.tagline === 'Best Value') return 'bg-green-500';
  return 'bg-gray-700';
};
```

## Mobile Responsiveness

The grid uses Tailwind responsive classes:
- **Desktop (lg)**: `grid-cols-4` - 4 cards side-by-side
- **Tablet (md)**: `grid-cols-2` - 2 cards per row
- **Mobile**: `grid-cols-1` - Stacked vertically

Cards maintain proper spacing and readability at all breakpoints.

## Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Add environment variables to Netlify**:
   - Navigate to Site settings → Environment variables
   - Add all `VITE_PRICE_ID_*` variables

3. **Deploy**:
   ```bash
   npx netlify-cli deploy --prod --dir=dist
   ```

4. **Verify**:
   - Visit your live site `/pricing` page
   - Test toggle functionality
   - Click each plan's CTA button
   - Confirm correct Stripe checkout sessions open

## Troubleshooting

### Issue: Stripe checkout opens with wrong price
- Check that environment variables match Stripe dashboard
- Verify the price ID mapping in `mapPriceId()` function
- Check browser console for any errors

### Issue: Toggle doesn't persist on refresh
- Check browser localStorage for `billing_interval` key
- Clear localStorage and try again
- Ensure localStorage isn't blocked (private browsing)

### Issue: Plan cards don't display
- Check browser console for JSON parsing errors
- Verify `pricing.json` is valid JSON
- Ensure all required fields are present in plan objects

### Issue: Ribbons don't show
- Check `tagline` values match expected strings in `getRibbonText()`
- Verify `highlight` boolean is set correctly
- Check z-index and positioning in CSS

## Support

For questions or issues:
1. Check browser console for errors
2. Verify all environment variables are set in Netlify
3. Confirm Stripe price IDs exist and are active
4. Test with Stripe test mode first before going live

---

**Implementation Date**: 2025-10-25
**Version**: 1.0
**Status**: Production Ready ✅
