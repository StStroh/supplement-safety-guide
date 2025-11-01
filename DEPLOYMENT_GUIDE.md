# Deployment Guide for The Supplement Safety Bible

## Current Status
- ✅ Build completed successfully (`dist/` folder ready)
- ✅ Database deployed to Supabase
- ✅ All connections configured
- ❌ Site not yet deployed to Netlify

## Quick Deploy via Netlify Dashboard

### Step 1: Deploy the Site
1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Deploy manually"**
3. Drag and drop the entire `dist` folder from this project
4. Wait for deployment to complete

### Step 2: Configure Environment Variables
In Netlify Dashboard → Site settings → Environment variables, add:

```
VITE_SUPABASE_URL=https://jggzgdrivlamjwwsvdow.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3pnZHJpdmxhbWp3d3N2ZG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTY0MzYsImV4cCI6MjA3NjI3MjQzNn0.shgnllEtoSdOnEzS8LqbX0xfXdcz8illzCRaOND9lgE
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51RyLMELSpIuKqlsUbSSu5SbIhBn7R93T9MlkmbZ8pWv8m2HHKoaiZ0xAwCMcOQvBp073eOKLXQzUZSVuxRDXIERq000D3OJrF3
```

**Important:** You'll need to add your real Stripe Price IDs:
```
VITE_PRICE_ID_PRO=price_xxxxx
VITE_PRICE_ID_PRO_ANNUAL=price_xxxxx
VITE_PRICE_ID_PREMIUM=price_xxxxx
VITE_PRICE_ID_PREMIUM_ANNUAL=price_xxxxx
```

### Step 3: Configure Custom Domain
1. In Netlify → Domain settings → Add custom domain
2. Enter: `supplementsafetybible.com`
3. Follow Netlify's instructions to update DNS records at your domain registrar:
   - Add A record pointing to Netlify's load balancer IP
   - Or add CNAME record pointing to your Netlify subdomain

### Step 4: Enable HTTPS
1. Netlify will automatically provision SSL certificate
2. Wait a few minutes for DNS propagation
3. Enable "Force HTTPS" in domain settings

---

## Alternative: Deploy via Netlify CLI

If you prefer command line:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist

# Link custom domain
netlify domains:add supplementsafetybible.com
```

---

## Verify Deployment

After deployment, test these URLs:
- ✅ Homepage: https://supplementsafetybible.com/
- ✅ Checker: https://supplementsafetybible.com/checker
- ✅ Success: https://supplementsafetybible.com/success
- ✅ Cancel: https://supplementsafetybible.com/cancel

Test interaction checker:
1. Go to /checker
2. Search for "Warfarin" (prescription) OR "Fish Oil" (supplement)
3. Should return results from Supabase database

---

## Troubleshooting

### Site not loading?
- Check DNS propagation: https://dnschecker.org
- Verify Netlify deployment status
- Check browser console for errors

### Database not connecting?
- Verify environment variables are set in Netlify
- Check Supabase project is active
- Test with: https://jggzgdrivlamjwwsvdow.supabase.co

### Stripe payments not working?
- Ensure Stripe publishable key is correct
- Add price IDs for all tiers
- Verify webhook endpoint is configured in Stripe dashboard

---

## Support
- Netlify Docs: https://docs.netlify.com
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
