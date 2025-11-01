# Deployment Package - Supplement Safety Bible

## What's Included

This tarball contains a production-ready deployment of the Supplement Safety Bible application:

```
netlify-production-deploy/
├── dist/                       # Built frontend (HTML, CSS, JS)
├── netlify/
│   ├── functions/              # Serverless backend functions
│   │   ├── _shared/            # Shared utilities
│   │   │   └── env-validator.js  # Environment validation helper
│   │   ├── grant-starter.js    # Free tier signup
│   │   ├── create-checkout-session.js  # Stripe checkout
│   │   └── generate-pdf.js     # PDF report generation
│   └── functions/package.json  # Function dependencies
├── netlify.toml                # Netlify configuration
├── .env.sample                 # Environment variable template
├── NETLIFY_DEPLOYMENT_GUIDE.md # Deployment instructions
└── FUNCTIONS_TEST_GUIDE.md     # Testing instructions
```

## Quick Deploy to Netlify

### Method 1: Drag-and-Drop (Easiest)

1. **Extract the tarball**
   ```bash
   tar -xzf netlify-production-deploy.tar.gz
   cd netlify-production-deploy
   ```

2. **Login to Netlify**
   - Go to https://app.netlify.com
   - Sign in or create a free account

3. **Drag and Drop**
   - On the dashboard, find "Deploy manually" section
   - Drag the entire `netlify-production-deploy` folder onto the dropzone
   - Wait 30-60 seconds for deployment

4. **Configure Environment Variables** (REQUIRED)
   - Click on your new site
   - Go to Site Settings → Environment Variables
   - Add variables from `.env.sample` (see below)
   - Redeploy: Deploys → Trigger deploy → Clear cache and deploy

5. **Test**
   - Open your site URL (e.g., `https://random-name-123.netlify.app`)
   - Navigate to `/pricing`
   - Click "Get Started" on Starter plan
   - Check browser Network tab for `200 OK` response

### Method 2: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd netlify-production-deploy
netlify deploy --prod
```

## Required Environment Variables

**CRITICAL**: Add these in Netlify Site Settings → Environment Variables.

Copy variable names from `.env.sample` and add your actual values:

### Supabase (Database)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (get from Supabase dashboard)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (get from Supabase dashboard)
```

### Stripe (Payments)
```
STRIPE_SECRET_KEY=sk_live_... (get from Stripe dashboard)
STRIPE_WEBHOOK_SECRET=whsec_... (get from Stripe webhook config)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... (get from Stripe dashboard)
VITE_PRICE_ID_STARTER=price_...
VITE_PRICE_ID_PRO=price_...
VITE_PRICE_ID_PREMIUM=price_...
```

### Where to Get Keys

1. **Supabase Keys**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Settings → API
   - Copy URL, anon key, and service_role key

2. **Stripe Keys**
   - Go to https://dashboard.stripe.com/apikeys
   - Copy publishable key and secret key
   - For webhook secret:
     - Go to Webhooks section
     - Add endpoint: `https://YOUR-SITE.netlify.app/.netlify/functions/stripe-webhook`
     - Copy webhook signing secret

## Key Features

### Self-Diagnosing Functions

All backend functions now include:

1. **Environment Validation**
   - Functions check for required env vars on startup
   - Returns `400 MISSING_ENV` if any are missing
   - Lists exactly which variables are needed

2. **Structured Logging**
   - Every function logs JSON with phase tracking
   - View logs in Netlify dashboard → Logs → Functions
   - Phases: `start`, `validated_env`, `supabase_connect_ok`, `done`, etc.

3. **Error Handling**
   - No silent failures
   - All errors return proper HTTP status codes
   - Detailed error messages in logs and responses

### Example Error Response

If `SUPABASE_SERVICE_ROLE_KEY` is missing:

```json
{
  "error": "MISSING_ENV",
  "missing": ["SUPABASE_SERVICE_ROLE_KEY"],
  "message": "Missing required environment variables in grant-starter",
  "hint": "Check Netlify Site Settings → Environment Variables"
}
```

## Testing Your Deployment

### Quick Test

1. Open your site in a browser
2. Press F12 to open DevTools
3. Go to Network tab
4. Navigate to `/pricing`
5. Click "Get Started" on Starter plan
6. Look for `grant-starter` request in Network tab
7. Status should be `200 OK`

### Detailed Testing

See `FUNCTIONS_TEST_GUIDE.md` for:
- Step-by-step testing instructions
- Expected responses
- How to read function logs
- Troubleshooting guide

## Troubleshooting

### Functions Return 400 "MISSING_ENV"

**Problem**: Missing environment variables

**Fix**:
1. Check the error response for which variables are missing
2. Add them in Netlify → Site Settings → Environment Variables
3. Redeploy site

### Functions Return 500 Errors

**Problem**: Runtime error

**Fix**:
1. Go to Netlify → Logs → Functions
2. Click on the failing function
3. Look for `"phase":"uncaught_error"` log entries
4. Check error message for details

### Site Loads but Functions Don't Work

**Problem**: Functions not deployed

**Fix**:
1. Verify `netlify.toml` was included in deployment
2. Check Netlify → Functions tab shows your functions
3. If missing, redeploy entire folder

## File Structure Details

### Frontend (`dist/`)
- Pre-built React application
- Includes all static assets
- Ready to serve immediately

### Functions (`netlify/functions/`)
- Node.js serverless functions
- Automatically deployed by Netlify
- Dependencies in `package.json` are installed automatically

### Shared Utilities (`netlify/functions/_shared/`)
- `env-validator.js`: Environment variable validation helper
- Used by all functions
- Provides consistent error responses

## Next Steps

After deployment:

1. ✅ Verify site loads at your Netlify URL
2. ✅ Add environment variables
3. ✅ Test Starter signup flow
4. ✅ Configure custom domain (optional)
5. ✅ Set up Stripe webhook
6. ✅ Test payment flows
7. ✅ Monitor function logs

## Support

### Documentation
- `NETLIFY_DEPLOYMENT_GUIDE.md` - Detailed deployment steps
- `FUNCTIONS_TEST_GUIDE.md` - Testing procedures
- `.env.sample` - Environment variable reference

### Getting Help
1. Check function logs in Netlify dashboard
2. Review error messages in browser console
3. Verify all environment variables are set
4. Test functions individually with curl

## Version Info

- Built: October 2025
- Framework: React + Vite
- Backend: Netlify Functions
- Database: Supabase
- Payments: Stripe

---

**Ready to deploy? Start with Method 1 above!**
