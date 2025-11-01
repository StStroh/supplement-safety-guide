# Netlify Environment Variables - REQUIRED

This document lists all environment variables required for supplementsafetybible.com to function correctly on Netlify.

## How to Configure

1. Log into Netlify: https://app.netlify.com
2. Select your site
3. Go to: **Site Settings** → **Environment Variables**
4. Click **Add a variable**
5. For each variable below:
   - Enter the **Key** (exact name from list)
   - Enter the **Value** (from your Supabase/Stripe dashboards)
   - Select **All contexts** (production, deploy-preview, branch-deploy)
   - Click **Save**

6. After adding all variables:
   - Go to **Deploys** tab
   - Click **Trigger deploy** → **Clear cache and deploy site**

---

## Required Environment Variables

### Supabase Configuration (REQUIRED for all features)

```
BOLT_DATABASE_URL
```
- **Description**: Your Supabase project URL
- **Example**: `https://abcdefghijklmnop.supabase.co`
- **Get from**: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

```
BOLT_DATABASE_ANON_KEY
```
- **Description**: Supabase anonymous (public) key
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Get from**: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

```
BOLT_DATABASE_SERVICE_ROLE_KEY
```
- **Description**: Supabase service role (secret) key - NEVER expose in frontend
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Get from**: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

---

### Stripe Configuration (REQUIRED for paid plans)

```
STRIPE_SECRET_KEY
```
- **Description**: Stripe secret key - NEVER expose in frontend
- **Example**: `sk_live_51AbCdEf...` (live) or `sk_test_51AbCdEf...` (test)
- **Get from**: https://dashboard.stripe.com/apikeys

```
PRICE_ID_PRO_MONTHLY
```
- **Description**: Stripe Price ID for Professional plan (monthly billing)
- **Example**: `price_1AbCdEfGhIjKlMnO`
- **Get from**: https://dashboard.stripe.com/products (click on Pro product → Pricing)

```
PRICE_ID_PRO_ANNUAL
```
- **Description**: Stripe Price ID for Professional plan (annual billing)
- **Example**: `price_1PqRsTuVwXyZaBcD`
- **Get from**: https://dashboard.stripe.com/products (click on Pro product → Pricing)

```
PRICE_ID_PREMIUM_MONTHLY
```
- **Description**: Stripe Price ID for Premium plan (monthly billing)
- **Example**: `price_1EfGhIjKlMnOpQrS`
- **Get from**: https://dashboard.stripe.com/products (click on Premium product → Pricing)

```
PRICE_ID_PREMIUM_ANNUAL
```
- **Description**: Stripe Price ID for Premium plan (annual billing)
- **Example**: `price_1TuVwXyZaBcDeFgH`
- **Get from**: https://dashboard.stripe.com/products (click on Premium product → Pricing)

---

## Verification

After configuring all environment variables, verify your setup:

### 1. Check Environment Variables

```bash
curl https://supplementsafetybible.com/.netlify/functions/env-check
```

**Expected response:**
```json
{
  "env": {
    "BOLT_DATABASE_URL": true,
    "BOLT_DATABASE_ANON_KEY": true,
    "BOLT_DATABASE_SERVICE_ROLE_KEY": true,
    "STRIPE_SECRET_KEY": true,
    "PRICE_ID_PRO_MONTHLY": true,
    "PRICE_ID_PRO_ANNUAL": true,
    "PRICE_ID_PREMIUM_MONTHLY": true,
    "PRICE_ID_PREMIUM_ANNUAL": true
  }
}
```

If any value shows `false`, that variable is missing or not configured correctly.

### 2. Test Starter Signup

```bash
curl -X POST https://supplementsafetybible.com/.netlify/functions/grant-starter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Expected response (200):**
```json
{
  "ok": true,
  "plan": "starter_granted",
  "email": "test@example.com"
}
```

### 3. Test Paid Checkout

```bash
curl -X POST https://supplementsafetybible.com/.netlify/functions/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"plan":"pro_monthly"}'
```

**Expected response (200):**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_live_..."
}
```

---

## Troubleshooting

### Error: `{"error":"missing_env","missing":["BOLT_DATABASE_URL"]}`

**Fix**: Add the missing environment variable(s) in Netlify settings, then redeploy with cache clear.

### Error: `{"error":"invalid_plan","valid_plans":["pro_monthly","pro_annual"]}`

**Fix**: One or more `PRICE_ID_PREMIUM_*` variables are missing. Add them and redeploy.

### Error: `{"error":"stripe_create_failed","detail":"No such price: 'price_xyz'"}`

**Fix**: The Price ID doesn't exist in your Stripe account. Verify the Price IDs in Stripe dashboard match exactly.

### Error: `{"error":"db_upsert_failed"}`

**Fix**: Check that your Supabase `profiles` table exists and has the correct schema. Verify RLS policies allow inserts.

---

## Function Endpoints

- **env-check**: `GET /.netlify/functions/env-check` - Check environment configuration
- **grant-starter**: `POST /.netlify/functions/grant-starter` - Create free Starter account
- **create-checkout-session**: `POST /.netlify/functions/create-checkout-session` - Create Stripe checkout

---

## Security Notes

- ⚠️ **NEVER** commit `.env` files to Git
- ⚠️ **NEVER** expose `STRIPE_SECRET_KEY` or `BOLT_DATABASE_SERVICE_ROLE_KEY` in frontend code
- ✅ Always use "All contexts" when setting environment variables in Netlify
- ✅ Always redeploy with cache clear after changing environment variables
- ✅ Use live keys (`sk_live_*`) in production, test keys (`sk_test_*`) for testing

---

## Summary Checklist

Before going live, ensure:

- [ ] All 8 environment variables are configured in Netlify
- [ ] All contexts selected (production, deploy-preview, branch-deploy)
- [ ] env-check returns all `true` values
- [ ] grant-starter test returns `{ok: true}`
- [ ] create-checkout-session test returns Stripe URL
- [ ] Cache cleared and site redeployed after env changes

---

**Need help?** Check function logs in Netlify → Logs → Functions
