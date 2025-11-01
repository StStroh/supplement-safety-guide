# Acceptance Checklist - Backend Functions

## Overview

This checklist verifies that all backend functions are robust, self-diagnosing, and production-ready.

**Instructions**: Follow each step in order. Check the box when complete and verified.

---

## Pre-Deployment Checks

### Build Verification
- [ ] Project builds successfully (`npm run build`)
- [ ] No TypeScript errors
- [ ] Bundle size is reasonable (< 500KB)
- [ ] All dependencies resolved

### File Structure
- [ ] `dist/` directory exists with frontend build
- [ ] `netlify/functions/` contains all function files
- [ ] `netlify/functions/_shared/env-validator.js` exists
- [ ] `netlify.toml` configuration file present
- [ ] `.env.sample` template file included

### Documentation
- [ ] `README_DEPLOY.md` explains deployment steps
- [ ] `NETLIFY_DEPLOYMENT_GUIDE.md` covers environment setup
- [ ] `FUNCTIONS_TEST_GUIDE.md` provides testing instructions
- [ ] All documentation is clear and actionable

---

## Deployment Checks

### Netlify Deployment
- [ ] Site deployed to Netlify successfully
- [ ] Site URL is accessible in browser
- [ ] Static assets load correctly (CSS, JS, images)
- [ ] No 404 errors on main pages

### Environment Variables Configuration
- [ ] `SUPABASE_URL` added to Netlify
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added to Netlify
- [ ] `STRIPE_SECRET_KEY` added to Netlify
- [ ] `VITE_SUPABASE_URL` added to Netlify
- [ ] `VITE_SUPABASE_ANON_KEY` added to Netlify
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` added to Netlify
- [ ] All price IDs added (STARTER, PRO, PREMIUM)
- [ ] Site redeployed after adding environment variables

### Functions Deployed
- [ ] Functions tab shows all functions in Netlify dashboard
- [ ] `grant-starter` function appears in list
- [ ] `create-checkout-session` function appears in list
- [ ] `generate-pdf` function appears in list

---

## Function Testing - grant-starter

### Environment Validation (Missing Variables Test)
- [ ] **Setup**: Remove `SUPABASE_SERVICE_ROLE_KEY` from Netlify
- [ ] **Test**: Call function via browser or curl
- [ ] **Expected**: Returns `400` status code
- [ ] **Expected**: Response body contains `"error": "MISSING_ENV"`
- [ ] **Expected**: Response lists `["SUPABASE_SERVICE_ROLE_KEY"]` in `missing` array
- [ ] **Expected**: Response includes helpful hint message
- [ ] **Verify**: Function logs show MISSING_ENV error
- [ ] **Cleanup**: Re-add `SUPABASE_SERVICE_ROLE_KEY` and redeploy

### Successful Execution
- [ ] Navigate to `/pricing` page
- [ ] Open browser DevTools → Network tab
- [ ] Click "Get Started" on Starter plan
- [ ] **Expected**: Request to `grant-starter` appears in Network tab
- [ ] **Expected**: Status code is `200 OK`
- [ ] **Expected**: Response contains `"ok": true`
- [ ] **Expected**: Response contains `"tempPassword"`
- [ ] **Expected**: Response contains `"email"`

### Function Logs Verification
- [ ] Open Netlify → Logs → Functions → grant-starter
- [ ] **Verify**: Log entry with `"phase": "start"`
- [ ] **Verify**: Log entry with `"phase": "validated_env"`
- [ ] **Verify**: Log entry with `"phase": "supabase_connect_ok"`
- [ ] **Verify**: Log entry with `"phase": "profile_created"` or `"phase": "profile_exists_with_password"`
- [ ] **Verify**: Log entry with `"phase": "done"`
- [ ] **Verify**: All logs are valid JSON
- [ ] **Verify**: Logs include timestamp

### Database Verification
- [ ] Open Supabase dashboard → Table Editor → profiles
- [ ] **Verify**: New profile row created with test email
- [ ] **Verify**: `plan` field is set to "starter"
- [ ] **Verify**: `sub_status` field is set to "active"
- [ ] **Verify**: `temp_password` field is not null
- [ ] **Verify**: `checks_remaining` is set to 5

---

## Function Testing - create-checkout-session

### Environment Validation
- [ ] **Setup**: Remove `STRIPE_SECRET_KEY` from Netlify
- [ ] **Test**: Click on Pro or Premium plan
- [ ] **Expected**: Returns `400` status code
- [ ] **Expected**: Response body contains `"error": "MISSING_ENV"`
- [ ] **Expected**: Response lists `["STRIPE_SECRET_KEY"]`
- [ ] **Cleanup**: Re-add `STRIPE_SECRET_KEY` and redeploy

### Successful Execution
- [ ] Navigate to `/pricing` page
- [ ] Open browser DevTools → Network tab
- [ ] Click "Subscribe" on Pro plan
- [ ] **Expected**: Request to `create-checkout-session` appears
- [ ] **Expected**: Status code is `200 OK`
- [ ] **Expected**: Response contains `"url"` field
- [ ] **Expected**: URL starts with `https://checkout.stripe.com`
- [ ] **Expected**: Browser redirects to Stripe checkout

### Function Logs Verification
- [ ] Open Netlify → Logs → Functions → create-checkout-session
- [ ] **Verify**: Log entry with `"phase": "start"`
- [ ] **Verify**: Log entry with `"phase": "validated_env"`
- [ ] **Verify**: Log entry with `"phase": "creating_session"`
- [ ] **Verify**: Log entry with `"phase": "done"`
- [ ] **Verify**: Log includes `sessionId`

---

## Function Testing - generate-pdf

### Environment Validation
- [ ] **Setup**: Remove `SUPABASE_SERVICE_ROLE_KEY` from Netlify
- [ ] **Test**: Attempt to generate PDF (requires auth)
- [ ] **Expected**: Returns `400` status code
- [ ] **Expected**: Response body contains `"error": "MISSING_ENV"`
- [ ] **Cleanup**: Re-add key and redeploy

### Authentication Validation
- [ ] **Test**: Call function without Authorization header
- [ ] **Expected**: Returns `401 Unauthorized`
- [ ] **Expected**: Response contains `"error": "Unauthorized"`

### Successful Execution (Authenticated User)
- [ ] Login as authenticated user
- [ ] Navigate to checker page
- [ ] Add medications and supplements
- [ ] Click "Download PDF" button
- [ ] **Expected**: Request to `generate-pdf` appears in Network tab
- [ ] **Expected**: Status code is `200 OK`
- [ ] **Expected**: Content-Type is `application/pdf`
- [ ] **Expected**: PDF file downloads successfully
- [ ] **Expected**: PDF contains medications and supplements

### Starter Tier Limit Enforcement
- [ ] Login as Starter tier user
- [ ] Generate PDF 5 times successfully
- [ ] **Expected**: 6th attempt returns `429` status code
- [ ] **Expected**: Response contains `"error": "Monthly PDF limit reached"`
- [ ] **Expected**: Response contains `"limit": 5`
- [ ] **Expected**: Response contains `"used": 5`

### Function Logs Verification
- [ ] Open Netlify → Logs → Functions → generate-pdf
- [ ] **Verify**: Log entry with `"phase": "start"`
- [ ] **Verify**: Log entry with `"phase": "validated_env"`
- [ ] **Verify**: Log entry with `"phase": "user_authenticated"`
- [ ] **Verify**: Log entry with `"phase": "limit_check"` (for Starter users)
- [ ] **Verify**: Log entry with `"phase": "generating_pdf"`
- [ ] **Verify**: Log entry with `"phase": "done"`

### Database Verification (pdf_logs)
- [ ] Open Supabase dashboard → Table Editor → pdf_logs
- [ ] **Verify**: New row created for each PDF generation
- [ ] **Verify**: `user_email` matches the authenticated user
- [ ] **Verify**: `created_at` timestamp is accurate

---

## Error Handling Verification

### Uncaught Errors Never Return 500 Without Details
- [ ] Check all function logs for any `500` responses
- [ ] **Verify**: All `500` responses include error message
- [ ] **Verify**: All `500` responses logged with `"phase": "uncaught_error"`
- [ ] **Verify**: Stack traces appear in Netlify logs

### No Silent Failures
- [ ] **Test**: Break database connection (wrong SUPABASE_URL)
- [ ] **Expected**: Function returns proper error (not silent failure)
- [ ] **Expected**: Error is logged in Netlify
- [ ] **Cleanup**: Fix SUPABASE_URL

### All Errors Return Proper HTTP Status Codes
- [ ] Missing env vars → `400 Bad Request`
- [ ] Invalid auth token → `401 Unauthorized`
- [ ] Rate limit exceeded → `429 Too Many Requests`
- [ ] Database errors → `500 Internal Server Error`
- [ ] Runtime errors → `500 Internal Server Error`

---

## Production Readiness

### Structured Logging
- [ ] All functions log JSON format
- [ ] All logs include timestamp
- [ ] All logs include function name
- [ ] All logs include phase
- [ ] Logs are searchable in Netlify dashboard

### Security
- [ ] Service role key is used for admin operations
- [ ] Anon key is never used for profile creation
- [ ] Stripe secret key is backend-only
- [ ] No secrets exposed in frontend code
- [ ] CORS headers configured correctly

### Performance
- [ ] Function cold start time < 3 seconds
- [ ] Function warm execution time < 1 second
- [ ] PDF generation completes in < 5 seconds
- [ ] No memory leaks in long-running processes

### Monitoring
- [ ] Can view function logs in real-time
- [ ] Can filter logs by function name
- [ ] Can search logs for specific errors
- [ ] Error alerts configured (optional)

---

## Final Verification

### End-to-End Flow
- [ ] New user signs up via Starter plan
- [ ] User receives temporary password
- [ ] User can login with temp password
- [ ] User can upgrade to Pro plan
- [ ] Stripe checkout completes successfully
- [ ] User subscription status updates
- [ ] User can generate PDF reports
- [ ] Starter users hit 5 PDF limit correctly
- [ ] Pro users have unlimited PDF generation

### Documentation Completeness
- [ ] All error codes documented
- [ ] All environment variables explained
- [ ] Deployment steps are clear
- [ ] Testing procedures are complete
- [ ] Troubleshooting guide covers common issues

### Acceptance Criteria Met
- [ ] **Requirement 1**: All functions validate environment variables
- [ ] **Requirement 2**: Missing vars return `400` with `MISSING_ENV` error
- [ ] **Requirement 3**: All errors logged with structured JSON
- [ ] **Requirement 4**: No silent 500 errors
- [ ] **Requirement 5**: grant-starter uses service_role key
- [ ] **Requirement 6**: All functions have phase-based logging
- [ ] **Requirement 7**: Production bundle includes all files
- [ ] **Requirement 8**: Deployment guide is complete
- [ ] **Requirement 9**: Test guide is actionable
- [ ] **Requirement 10**: All tests pass

---

## Sign-Off

**Tested By**: ________________

**Date**: ________________

**Environment**: 
- [ ] Local development
- [ ] Netlify staging
- [ ] Netlify production

**Overall Status**: 
- [ ] ✅ All checks passed - Ready for production
- [ ] ⚠️  Minor issues found - Acceptable with caveats
- [ ] ❌ Blocking issues found - Not ready for production

**Notes**:
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

