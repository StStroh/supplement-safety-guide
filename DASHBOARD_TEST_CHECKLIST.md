# Dashboard Test Checklist

## 1. Authentication & Access Control

### Test 1.1: Unauthenticated Access
- [ ] Visit `/dashboard` while logged out
- [ ] Expected: Redirect to `/login`
- [ ] Status: ___________

### Test 1.2: Post-Payment Auto-Login
- [ ] Complete Stripe payment successfully
- [ ] Click "Access Your Content Now" on `/thanks` page
- [ ] Expected: Auto-login and redirect to `/dashboard`
- [ ] Expected: Dashboard shows correct plan and status
- [ ] Status: ___________

### Test 1.3: Dashboard Link Visibility
- [ ] While logged out: Dashboard link NOT visible in header
- [ ] While logged in: Dashboard link IS visible in header
- [ ] Status: ___________

## 2. Dashboard UI Components

### Test 2.1: Welcome/Plan Card
- [ ] Shows correct email address
- [ ] Shows current plan name (Starter/Professional/Premium)
- [ ] Shows subscription status badge (Active/Past Due/Canceled)
- [ ] Shows renewal date (if subscription exists)
- [ ] For non-active status: Shows "Fix Payment Issue" button
- [ ] Status: ___________

### Test 2.2: Checks Counter Card
- [ ] Starter plan: Shows numeric count (e.g., "5")
- [ ] Pro/Premium plan: Shows "Unlimited"
- [ ] Starter with 0 checks: Shows upgrade warning
- [ ] Shows reset date for limited plans
- [ ] Status: ___________

### Test 2.3: Quick Actions Card
- [ ] "Open Interaction Checker" button → navigates to `/`
- [ ] "Download Safety Report (PDF)" button → triggers PDF download
- [ ] Status: ___________

### Test 2.4: Manage Subscription Card
- [ ] Starter users see: "Upgrade to Professional" button
- [ ] Starter users see: "Go Premium" button
- [ ] Pro users see: "Manage Billing" button
- [ ] Pro users see: "Upgrade to Premium" button
- [ ] Premium users see: "Manage Billing" button only
- [ ] Status: ___________

## 3. Serverless Functions

### Test 3.1: Get Profile Function
```bash
# Test with valid auth token
curl -X GET https://supplementsafetybible.com/.netlify/functions/get-profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: 200 OK with JSON profile data
```
- [ ] Returns correct user profile
- [ ] Returns 401 for invalid/missing token
- [ ] Status: ___________

### Test 3.2: Generate PDF Function
- [ ] Click "Download Safety Report" button
- [ ] PDF file downloads successfully
- [ ] PDF size > 10 KB
- [ ] PDF contains: user email, plan name, safety tips
- [ ] PDF opens correctly in viewer
- [ ] Status: ___________

### Test 3.3: Create Portal Session Function
- [ ] Click "Manage Billing" (Pro/Premium users)
- [ ] Redirects to Stripe Customer Portal
- [ ] Portal shows correct subscription details
- [ ] Return from portal redirects back to `/dashboard`
- [ ] Status: ___________

## 4. Upgrade Flow

### Test 4.1: Starter → Professional Upgrade
- [ ] As Starter user, click "Upgrade to Professional"
- [ ] Redirects to Stripe Checkout with $9.99/mo plan
- [ ] Complete payment successfully
- [ ] Redirects to `/thanks?session_id=...`
- [ ] Dashboard shows "Professional" plan after login
- [ ] Status: ___________

### Test 4.2: Starter → Premium Upgrade
- [ ] As Starter user, click "Go Premium"
- [ ] Redirects to Stripe Checkout with $49.99/mo plan
- [ ] Complete payment successfully
- [ ] Dashboard shows "Premium" plan after login
- [ ] Status: ___________

### Test 4.3: Pro → Premium Upgrade
- [ ] As Pro user, click "Upgrade to Premium"
- [ ] Redirects to Stripe Checkout with $49.99/mo plan
- [ ] Complete payment successfully
- [ ] Dashboard shows "Premium" plan after login
- [ ] Status: ___________

## 5. Checks Remaining Logic

### Test 5.1: Starter Plan Limits
- [ ] New Starter user: Shows "5" checks remaining
- [ ] After using checks: Count decrements
- [ ] At 0 checks: Shows yellow warning banner
- [ ] Warning includes "Upgrade to Professional" message
- [ ] Status: ___________

### Test 5.2: Unlimited Plans
- [ ] Professional plan: Shows "Unlimited"
- [ ] Premium plan: Shows "Unlimited"
- [ ] No warning banner displayed
- [ ] Status: ___________

## 6. Database Integration

### Test 6.1: Profile Table
```sql
SELECT user_email, plan, sub_status, checks_remaining, stripe_customer_id
FROM profiles
WHERE user_email = 'test@example.com';
```
- [ ] `checks_remaining` field exists
- [ ] Starter users default to 5 checks
- [ ] Pro/Premium users have 999999 (unlimited)
- [ ] Status: ___________

### Test 6.2: Temp Password Cleanup
- [ ] After first login from `/thanks` page
- [ ] Verify `temp_password` is cleared in database
- [ ] Status: ___________

## 7. Security Tests

### Test 7.1: Function Authorization
- [ ] All functions reject requests without Authorization header
- [ ] All functions return 401 for invalid tokens
- [ ] No PII logged in function console output
- [ ] Status: ___________

### Test 7.2: Protected Routes
- [ ] `/dashboard` requires authentication
- [ ] Unauthenticated users redirected to `/login`
- [ ] Session persistence across page refreshes
- [ ] Status: ___________

## 8. Responsive Design

### Test 8.1: Mobile (375px)
- [ ] Dashboard cards stack vertically
- [ ] All buttons are full-width and tappable
- [ ] Text is readable without zooming
- [ ] No horizontal scrolling
- [ ] Status: ___________

### Test 8.2: Tablet (768px)
- [ ] Cards display in 2-column grid
- [ ] Navigation is accessible
- [ ] Status: ___________

### Test 8.3: Desktop (1440px)
- [ ] Cards display in 2-column grid with proper spacing
- [ ] All content is centered with max-width constraint
- [ ] Status: ___________

## 9. Error Handling

### Test 9.1: Network Failures
- [ ] Disconnect network during profile fetch
- [ ] Shows error message
- [ ] Provides retry option
- [ ] Status: ___________

### Test 9.2: PDF Generation Failure
- [ ] Simulate function error
- [ ] Shows user-friendly error alert
- [ ] Doesn't break dashboard UI
- [ ] Status: ___________

## 10. Integration Tests

### Test 10.1: End-to-End Payment Flow
1. [ ] Start as logged-out user
2. [ ] Visit `/pricing`
3. [ ] Select Professional plan
4. [ ] Complete Stripe payment
5. [ ] Land on `/thanks` page with credentials
6. [ ] Click "Access Your Content Now"
7. [ ] Arrive at `/dashboard`
8. [ ] Dashboard shows Professional plan status
9. [ ] Download PDF works
10. [ ] Manage Billing opens Stripe portal
- [ ] Status: ___________

### Test 10.2: Upgrade Path
1. [ ] Login as Starter user
2. [ ] Go to `/dashboard`
3. [ ] See 5 checks remaining
4. [ ] Click "Upgrade to Professional"
5. [ ] Complete payment
6. [ ] Return to dashboard
7. [ ] See Professional plan with unlimited checks
- [ ] Status: ___________

## Summary

- **Total Tests:** 40+
- **Passed:** _____
- **Failed:** _____
- **Blocked:** _____
- **Notes:** _______________________________________________

## Environment Variables Checklist

Ensure these are set in Netlify:
- [ ] `STRIPE_SECRET_KEY` (live key)
- [ ] `STRIPE_WEBHOOK_SECRET` (live webhook)
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `VITE_PRICE_ID_PRO_MONTHLY`
- [ ] `VITE_PRICE_ID_PREMIUM_MONTHLY`
- [ ] `SITE_URL=https://supplementsafetybible.com`

## Deployment Steps

1. Extract `dashboard-complete-deployment.tar.gz`
2. Deploy to Netlify (drag `dist/` folder or use CLI)
3. Verify all environment variables are set
4. Test Stripe webhook endpoint
5. Run through acceptance tests above

## Quick Smoke Test (5 minutes)

1. [ ] Visit site while logged out → Dashboard link hidden
2. [ ] Login with test account → Dashboard link appears
3. [ ] Click Dashboard → Loads profile correctly
4. [ ] Download PDF → File downloads and opens
5. [ ] Click "Manage Billing" → Stripe portal opens
6. [ ] Logout → Dashboard link disappears
