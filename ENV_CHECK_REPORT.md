# Environment Variables Check

| Variable | Status | Notes |
|----------|--------|-------|
| VITE_SUPABASE_URL | ✅ Present | https://jggzgdrivlamjwwsvdow.supabase.co |
| VITE_SUPABASE_ANON_KEY | ✅ Present | Valid JWT token |
| VITE_BOLT_DATABASE_URL | ⚠️  Missing | Using VITE_SUPABASE_URL instead (same thing) |
| VITE_BOLT_DATABASE_ANON_KEY | ⚠️  Missing | Using VITE_SUPABASE_ANON_KEY instead (same thing) |
| VITE_STRIPE_PUBLISHABLE_KEY | ✅ Present | pk_live_51RyLMELSpIu... |
| STRIPE_SECRET_KEY | ✅ Present | sk_live_51RyLMELSpIu... |
| STRIPE_WEBHOOK_SECRET | ⚠️  Not in .env | Referenced in webhook code (must be in Netlify) |
| VITE_PRICE_ID_STARTER | ✅ Present | price_1SJJL4LSpIuKqlsUgNBSE8ZV |
| VITE_PRICE_ID_PRO | ✅ Present | price_1SJJQtLSpIuKqlsUhZdEPJ3L |
| VITE_PRICE_ID_PREMIUM | ✅ Present | price_1SJJXgLSpIuKqlsUa5rP1xbE |
| VITE_PRICE_ID_PRO_MONTHLY | ❌ Missing | Not required if VITE_PRICE_ID_PRO exists |
| VITE_PRICE_ID_PRO_ANNUAL | ❌ Missing | Optional (annual pricing) |
| VITE_PRICE_ID_PREMIUM_MONTHLY | ❌ Missing | Not required if VITE_PRICE_ID_PREMIUM exists |
| VITE_PRICE_ID_PREMIUM_ANNUAL | ❌ Missing | Optional (annual pricing) |
| VITE_PRICE_ID_GUIDE | ❌ Missing | Optional (digital guide product) |

## Summary
- ✅ All critical variables present
- ⚠️  VITE_BOLT_DATABASE_* not used (code uses VITE_SUPABASE_* instead)
- ⚠️  STRIPE_WEBHOOK_SECRET must be in Netlify environment (not in .env file)
- ✅ Ready to proceed with fixes
