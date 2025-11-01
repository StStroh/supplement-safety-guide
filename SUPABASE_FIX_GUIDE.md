# Supabase Signup Fix Guide

## Problem Identified

The "Failed to fetch" error during free signup was caused by:
1. **RLS Policy Issue**: Profiles table had restrictive RLS policies that only allowed `authenticated` users to insert profiles
2. **Timing Issue**: During signup, the user isn't fully authenticated yet when trying to create the profile
3. **Missing Auto-Profile Creation**: No database trigger to automatically create profiles on user signup

## Solution Implemented

### 1. Database Migration (`20251025200000_fix_profile_creation.sql`)

Created a new migration that:
- ✅ Adds a database trigger to auto-create profiles when users sign up
- ✅ Creates a `handle_new_user()` function that runs with `SECURITY DEFINER` privileges
- ✅ Adds service role policy to allow trigger to insert profiles
- ✅ Updates authenticated user policy to be more permissive

**Key Features:**
- Profile is created automatically on `auth.users` INSERT
- Uses `ON CONFLICT DO NOTHING` to prevent duplicate profile errors
- Runs as `SECURITY DEFINER` to bypass RLS during trigger execution
- Default plan is set to 'starter' for all new users

### 2. Updated FreeSignupPage Component

Simplified the signup flow:
- ✅ Removed manual profile insertion (now handled by trigger)
- ✅ Added better error handling and logging
- ✅ Improved user feedback with descriptive error messages
- ✅ Added session check for immediate redirect vs confirmation flow
- ✅ Added `minLength` validation to password inputs

## Supabase Dashboard Configuration

### Step 1: Apply Database Migration

Run this migration in your Supabase SQL Editor:

```sql
-- File: supabase/migrations/20251025200000_fix_profile_creation.sql
-- (See migration file in project)
```

Or using Supabase CLI:
```bash
supabase db push
```

### Step 2: Authentication Settings

Navigate to: **Authentication → URL Configuration**

Set the following:

**Site URL:**
```
https://supplementsafetybible.com
```

**Redirect URLs (Add all of these):**
```
https://supplementsafetybible.com/*
https://supplementsafetybible.com/dashboard*
https://supplementsafetybible.com/thanks*
https://supplementsafetybible.com/thanks-free*
https://supplementsafetybible.com/login*
```

### Step 3: Email Confirmation Settings

Navigate to: **Authentication → Providers → Email**

**Recommended Settings:**
- ✅ **Confirm email**: DISABLED (for instant signup)
- ✅ **Secure email change**: ENABLED
- ✅ **Enable email signups**: ENABLED

**Why disable email confirmation?**
- Instant account creation for Starter (no credit card) users
- Immediate access to dashboard
- Better user experience (no email verification step)

**Alternative (if you want confirmation):**
- Keep "Confirm email" ENABLED
- Update FreeSignupPage to show confirmation message
- User clicks link in email → profile is auto-created by trigger

### Step 4: CORS Configuration

Navigate to: **Settings → API**

Add this to **Additional Redirect URLs:**
```
https://supplementsafetybible.com
```

## Netlify Environment Variables

Verify these variables are set in Netlify (Production scope):

```bash
VITE_SUPABASE_URL=https://jggzgdrivlamjwwsvdow.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**To update:**
1. Go to: Netlify Dashboard → Site settings → Environment variables
2. Verify both variables exist and are not empty
3. If missing, add them with values from Supabase Dashboard → Settings → API

## Testing the Fix

### Test 1: Free Starter Signup

1. Open browser in incognito/private mode
2. Visit: `https://supplementsafetybible.com/pricing`
3. Click "Start Free" on Starter plan
4. Fill out signup form with test email and password
5. Click "Create Free Account"

**Expected Result:**
- ✅ No "Failed to fetch" error
- ✅ User is created in `auth.users`
- ✅ Profile is auto-created in `profiles` table with `plan='starter'`
- ✅ Redirect to `/dashboard` (if email confirmation disabled) OR `/thanks-free` (if confirmation enabled)
- ✅ User can immediately use the application

### Test 2: Verify Database

Check in Supabase SQL Editor:

```sql
-- View newly created users
SELECT
  u.id,
  u.email,
  u.created_at as user_created,
  p.plan,
  p.stripe_customer_id,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
ORDER BY u.created_at DESC
LIMIT 10;
```

**Expected:**
- Each user in `auth.users` has a matching profile in `profiles`
- Profile has `plan='starter'`
- Profile `created_at` is within milliseconds of user `created_at`

### Test 3: Check Browser Console

Open DevTools → Console tab:

**Expected Logs:**
```
User created: <uuid>
Session created, redirecting to dashboard
```

OR (if email confirmation enabled):
```
User created: <uuid>
No session, redirecting to thanks page
```

**No errors should appear**

## Troubleshooting

### Error: "Failed to fetch"

**Cause**: Network or CORS issue

**Solution:**
1. Check browser console for specific error
2. Verify `VITE_SUPABASE_URL` is correct and accessible
3. Verify `VITE_SUPABASE_ANON_KEY` is valid
4. Check Supabase project status (not paused)
5. Verify CORS settings in Supabase dashboard

### Error: "User already registered"

**Cause**: Email already exists in database

**Solution:**
1. Use a different email address
2. OR delete the existing user from Supabase dashboard
3. OR add login flow for existing users

### Error: "Email rate limit exceeded"

**Cause**: Too many signups from same IP/email domain

**Solution:**
1. Wait 1 hour
2. OR use Supabase's production plan for higher limits
3. OR test with different email domains

### Profile not created

**Cause**: Trigger not properly installed

**Solution:**
1. Run the migration again in Supabase SQL Editor
2. Check trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
3. Verify function exists:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
   ```

### User redirected to confirmation page

**Cause**: Email confirmation is enabled in Supabase

**Solution (Option A - Disable confirmation):**
1. Go to Authentication → Providers → Email
2. Disable "Confirm email"
3. Test signup again

**Solution (Option B - Handle confirmation flow):**
1. Keep confirmation enabled
2. User receives email with confirmation link
3. User clicks link → redirected to dashboard
4. Profile is already created by trigger

## Code Changes Summary

### Files Created:
1. `supabase/migrations/20251025200000_fix_profile_creation.sql`
   - Auto-profile creation trigger
   - Updated RLS policies

### Files Modified:
1. `src/pages/FreeSignupPage.tsx`
   - Removed manual profile insertion
   - Added better error handling
   - Improved logging

### Files Not Changed (Already Correct):
1. `src/lib/supabase.ts` - Already properly configured
2. `src/components/pricing/DynamicPricingGrid.tsx` - Already bypasses Stripe for Starter

## Deployment Steps

### 1. Apply Database Migration

**Option A - Using Supabase Dashboard:**
```
1. Go to SQL Editor in Supabase
2. Copy contents of 20251025200000_fix_profile_creation.sql
3. Paste and run
4. Verify "Success. No rows returned"
```

**Option B - Using Supabase CLI:**
```bash
supabase db push
```

### 2. Deploy to Netlify

```bash
# Build the project
npm run build

# Deploy using Netlify CLI
netlify deploy --prod --dir=dist

# Or trigger deploy in Netlify Dashboard
# Site → Deploys → Trigger deploy → Clear cache and deploy site
```

### 3. Verify Environment Variables

```bash
# Check Netlify env vars
netlify env:list

# Should show:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
# (plus other Stripe/app variables)
```

### 4. Test Live Site

```
1. Visit https://supplementsafetybible.com/pricing
2. Click "Start Free"
3. Sign up with test email
4. Verify no errors
5. Check Supabase dashboard for new user and profile
```

## Expected User Flow (After Fix)

### Starter Plan Signup:
```
1. User clicks "Start Free" on pricing page
   ↓
2. Redirected to /signup-free
   ↓
3. User enters email and password
   ↓
4. Click "Create Free Account"
   ↓
5. Supabase creates user in auth.users
   ↓
6. Database trigger auto-creates profile with plan='starter'
   ↓
7. [If confirmation disabled] Immediate session + redirect to /dashboard
   OR
   [If confirmation enabled] Redirect to /thanks-free + email sent
```

### Paid Plan Signup (Pro/Premium/Guide):
```
1. User clicks "Upgrade to Pro" on pricing page
   ↓
2. Stripe Checkout opens (guest checkout enabled)
   ↓
3. User enters email + payment info
   ↓
4. Payment successful → Stripe webhook fires
   ↓
5. Webhook creates/updates user account
   ↓
6. User redirected to /success with session_id
   ↓
7. Success page displays credentials or auto-logs in
```

## Security Notes

- Trigger runs with `SECURITY DEFINER` to bypass RLS (safe for profile creation)
- Service role policy is restricted to profile insertion only
- Users can still only read/update their own profiles
- Email is validated by Supabase before user creation
- Passwords are hashed automatically by Supabase Auth

## Next Steps After Deployment

1. **Monitor Signups**:
   - Check Supabase dashboard for new users
   - Verify profiles are being created automatically
   - Check for any error logs

2. **Test Edge Cases**:
   - Duplicate email signup
   - Weak password
   - Special characters in email
   - Network timeout scenarios

3. **User Feedback**:
   - Add success toast notification
   - Improve loading states
   - Add progress indicators

4. **Analytics**:
   - Track signup completion rate
   - Monitor "Failed to fetch" errors (should be 0%)
   - Track time-to-first-check

---

**Status**: Ready to Deploy
**Priority**: Critical (Blocking user signups)
**Estimated Fix Time**: Database migration + deploy = ~5 minutes
