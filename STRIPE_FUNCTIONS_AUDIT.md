# Stripe Functions Audit Report

## Summary
Audited all Netlify functions that reference Stripe. Identified 7 functions that require `STRIPE_SECRET_KEY`.

---

## Functions Requiring STRIPE_SECRET_KEY

### ✅ CRITICAL - Payment & Checkout Functions

1. **create-checkout-session.js**
   - **Usage**: Line 1 - `const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);`
   - **Check**: Lines 39-46 - Validates `STRIPE_SECRET_KEY` exists
   - **Purpose**: Creates Stripe checkout sessions for subscriptions
   - **Status**: ✅ Properly checks for env var

2. **stripe-webhook.js**
   - **Usage**: Line 1 - `const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);`
   - **Check**: Lines 83-90 - Validates `STRIPE_WEBHOOK_SECRET` (also needs `STRIPE_SECRET_KEY`)
   - **Purpose**: Handles Stripe webhook events (payment success, subscription updates, etc.)
   - **Status**: ✅ Properly checks for webhook secret
   - **Additional**: Also needs `STRIPE_WEBHOOK_SECRET` environment variable

3. **exchange-stripe-session.js**
   - **Usage**: Line 1 - `const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);`
   - **Check**: ❌ NO validation - missing check
   - **Purpose**: Exchanges Stripe session for user email/magic link
   - **Status**: ⚠️ Should add validation

---

### ✅ CRITICAL - Customer Portal Functions

4. **create-portal-session.js**
   - **Usage**: Line 1 - `const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);`
   - **Check**: Lines 36-43 - Validates `STRIPE_SECRET_KEY` exists
   - **Purpose**: Creates Stripe billing portal sessions
   - **Status**: ✅ Properly checks for env var

5. **create-customer-portal-session.js**
   - **Usage**: Line 1 - `const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);`
   - **Check**: Lines 39-46 - Validates `STRIPE_SECRET_KEY` exists
   - **Purpose**: Alternative customer portal session creator
   - **Status**: ✅ Properly checks for env var

---

### ✅ IMPORTANT - Price Fetching Functions

6. **get-stripe-prices.js**
   - **Usage**: Line 1 - `const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);`
   - **Check**: Lines 29-36 - Validates `STRIPE_SECRET_KEY` exists
   - **Purpose**: Fetches live prices from Stripe API
   - **Status**: ✅ Properly checks for env var

7. **get-prices.js**
   - **Usage**: Line 1 - `const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);`
   - **Check**: Lines 27-34 - Validates `STRIPE_SECRET_KEY` exists
   - **Purpose**: Fetches prices for display on pricing page
   - **Status**: ✅ Properly checks for env var

---

## Functions NOT Using Stripe

- **generate-pdf.js** - ✅ No Stripe dependency (uses Supabase only)
- **get-profile.js** - ✅ No Stripe dependency (uses Supabase only)
- **resend-magic-link.js** - ✅ No Stripe dependency (uses Supabase only)
- **fetch-session-email.js** - ✅ No Stripe dependency (uses Supabase only)

---

## Required Environment Variables in Netlify

### 🔴 CRITICAL (Must be configured)

```
STRIPE_SECRET_KEY
```
- **Scope**: All
- **Value**: Your live Stripe secret key (starts with `sk_live_`)
- **Used by**: 7 functions
- **Without it**: All payment/subscription functionality will fail

```
STRIPE_WEBHOOK_SECRET
```
- **Scope**: All
- **Value**: Your Stripe webhook signing secret (starts with `whsec_`)
- **Used by**: stripe-webhook.js
- **Without it**: Webhook events won't be processed

---

## Additional Environment Variables Already Configured

These should already be in Netlify:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
VITE_STRIPE_PUBLISHABLE_KEY
VITE_PRICE_ID_STARTER
VITE_PRICE_ID_PRO
VITE_PRICE_ID_PREMIUM
```

---

## 🚨 ACTION REQUIRED

### 1. Add STRIPE_SECRET_KEY to Netlify

**Steps:**
1. Go to: https://app.netlify.com → Your site → Site configuration → Environment variables
2. Click "Add a variable"
3. Key: `STRIPE_SECRET_KEY`
4. Value: Your actual live Stripe secret key (from https://dashboard.stripe.com/apikeys)
5. Scope: **All**
6. Save

### 2. Add STRIPE_WEBHOOK_SECRET to Netlify

**Steps:**
1. Go to: https://dashboard.stripe.com/webhooks
2. Find your webhook endpoint or create new one
3. Copy the signing secret (starts with `whsec_`)
4. Add to Netlify:
   - Key: `STRIPE_WEBHOOK_SECRET`
   - Value: The webhook signing secret
   - Scope: **All**

### 3. Redeploy Without Cache

After adding both variables, trigger a clean deploy:
- Go to: Deploys → Trigger deploy → Clear cache and deploy site

---

## Testing Plan

After deployment, test these endpoints:

1. **PDF Generation**: `/.netlify/functions/generate-pdf` (does NOT need Stripe)
2. **Price Fetching**: `/.netlify/functions/get-stripe-prices` (needs Stripe key)
3. **Checkout**: `/.netlify/functions/create-checkout-session` (needs Stripe key)
4. **Portal**: `/.netlify/functions/create-portal-session` (needs Stripe key)

---

## Current Status

- ✅ All functions properly reference `process.env.STRIPE_SECRET_KEY`
- ✅ 6 out of 7 functions validate the key exists before using
- ⚠️ 1 function (exchange-stripe-session.js) missing validation
- ❌ Key is NOT currently working (tested and got "Invalid API Key")
- 🔴 **You must get your real Stripe key and add it to Netlify**

---

## Recommendation

**IMMEDIATE ACTION**: Get your real live Stripe secret key from the Stripe dashboard and add it to Netlify as shown above. The current key in `.env` is invalid.
