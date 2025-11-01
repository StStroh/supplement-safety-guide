# Netlify Deployment Guide

## Quick Drag-and-Drop Deployment

### Step 1: Build the Production Bundle
If you received a tarball file, skip to Step 2.

If deploying from source:
```bash
npm run build
```

### Step 2: Deploy to Netlify

#### Option A: Drag-and-Drop (Recommended for First Deploy)

1. **Login to Netlify**
   - Go to https://app.netlify.com
   - Sign in or create account

2. **Drag and Drop**
   - On the Netlify dashboard, find the "Deploy manually" section
   - Drag the `dist/` folder (or the extracted tarball folder) onto the dropzone
   - Wait for deployment to complete (usually 30-60 seconds)

3. **Note Your Site URL**
   - Netlify will give you a URL like: `https://random-name-123456.netlify.app`
   - You can customize this in Site Settings → Domain Management

#### Option B: Connect Git Repository

1. Click "Add new site" → "Import an existing project"
2. Choose your Git provider (GitHub, GitLab, Bitbucket)
3. Select your repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click "Deploy site"

### Step 3: Configure Environment Variables

**CRITICAL**: Functions will return HTTP 400 errors until these are set.

1. **Navigate to Environment Variables**
   - In Netlify dashboard, go to your site
   - Click "Site settings" in the top nav
   - Click "Environment variables" in the left sidebar
   - Click "Add a variable"

2. **Add Required Variables**

   Copy these variable names and add your actual values:

   ```
   SUPABASE_URL
   SUPABASE_SERVICE_ROLE_KEY
   STRIPE_SECRET_KEY
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   VITE_STRIPE_PUBLISHABLE_KEY
   VITE_PRICE_ID_STARTER
   VITE_PRICE_ID_PRO
   VITE_PRICE_ID_PREMIUM
   ```

   See `.env.sample` for descriptions of each variable.

3. **Set Variable Scopes**
   - For each variable, ensure these scopes are checked:
     - ✅ Production
     - ✅ Deploy previews
     - ✅ Branch deploys

4. **Redeploy**
   - After adding variables, go to "Deploys" tab
   - Click "Trigger deploy" → "Clear cache and deploy site"

### Step 4: View Function Logs

Functions now have structured logging. Here's how to view them:

1. **Access Logs**
   - In Netlify dashboard, go to your site
   - Click "Logs" in the top nav
   - Click "Functions" tab

2. **View Specific Function Logs**
   - Click on function name (e.g., "grant-starter")
   - Real-time logs will appear at bottom
   - Each log entry is JSON formatted with phase tracking

3. **Log Format**
   ```json
   {
     "timestamp": "2025-10-26T12:34:56.789Z",
     "function": "grant-starter",
     "phase": "start",
     ...
   }
   ```

4. **Common Log Phases**
   - `start` - Function invoked
   - `validated_env` - Environment variables checked
   - `supabase_connect_ok` - Database connected
   - `profile_created` - User profile created
   - `done` - Function completed successfully
   - `uncaught_error` - Function failed

### Step 5: Configure Stripe Webhook (Required for Payments)

1. **Get Your Netlify Function URL**
   - Format: `https://YOUR-SITE.netlify.app/.netlify/functions/stripe-webhook`
   - Replace `YOUR-SITE` with your actual Netlify subdomain

2. **Add Webhook in Stripe**
   - Go to https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - Enter your webhook URL
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

3. **Copy Webhook Secret**
   - After creating webhook, Stripe shows signing secret
   - Add it to Netlify as `STRIPE_WEBHOOK_SECRET`
   - Redeploy site

## Troubleshooting

### Functions Return 400 "MISSING_ENV"

**Problem**: Missing environment variables

**Response Body**:
```json
{
  "error": "MISSING_ENV",
  "missing": ["SUPABASE_SERVICE_ROLE_KEY"],
  "message": "Missing required environment variables in grant-starter",
  "hint": "Check Netlify Site Settings → Environment Variables"
}
```

**Solution**:
1. Check which variables are missing in the response
2. Add them in Netlify Site Settings → Environment Variables
3. Redeploy site

### Functions Return 500 "Internal Server Error"

**Problem**: Runtime error in function

**Solution**:
1. Go to Netlify dashboard → Logs → Functions
2. Click on the failing function (e.g., "grant-starter")
3. Look for logs with `phase: "uncaught_error"`
4. Check the error message and stack trace
5. Common issues:
   - Invalid Stripe keys → Update `STRIPE_SECRET_KEY`
   - Database connection issues → Check `SUPABASE_URL`
   - Missing permissions → Use `SUPABASE_SERVICE_ROLE_KEY` not anon key

### Starter Signup Not Working

**Problem**: "fetch failed" or 500 error

**Checklist**:
1. ✅ `SUPABASE_URL` is set in Netlify
2. ✅ `SUPABASE_SERVICE_ROLE_KEY` is set (NOT anon key)
3. ✅ Service role key is from correct Supabase project
4. ✅ Site has been redeployed after adding variables

**Test**:
```bash
curl -X POST https://YOUR-SITE.netlify.app/.netlify/functions/grant-starter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Expected: `200 OK` with `{ok: true, tempPassword: "..."}`

### Payments Not Working

**Problem**: Checkout fails or subscriptions not tracked

**Checklist**:
1. ✅ `STRIPE_SECRET_KEY` is valid live key (starts with `sk_live_`)
2. ✅ `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
3. ✅ Webhook endpoint is added in Stripe dashboard
4. ✅ Price IDs match actual Stripe products

## Monitoring

### Check Function Health

Open browser console on your site and run:

```javascript
// Test grant-starter
fetch('/.netlify/functions/grant-starter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com' })
})
.then(r => r.json())
.then(console.log);
```

Expected: `{ok: true, ...}` or `{error: "MISSING_ENV", ...}`

### View All Function Logs

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Stream logs
netlify logs:functions --stream
```

## Support

If issues persist:
1. Check Netlify function logs for phase tracking
2. Verify all environment variables in `.env.sample` are set
3. Ensure Stripe webhook is configured
4. Test each function individually using curl or browser console
