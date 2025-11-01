# Functions Testing Guide

## Quick Test: Starter Signup Flow

This guide shows you how to verify that the `grant-starter` function is working correctly.

### Prerequisites

1. Site is deployed to Netlify
2. Environment variables are configured (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
3. Site has been redeployed after adding environment variables

### Test 1: Open Pricing Page

1. **Navigate to Pricing**
   - Open your site in a browser
   - Go to `/pricing` (e.g., `https://your-site.netlify.app/pricing`)

2. **Open Browser DevTools**
   - Press `F12` (Windows/Linux) or `Cmd+Option+I` (Mac)
   - Click on "Network" tab
   - Ensure "All" or "Fetch/XHR" is selected

### Test 2: Click Starter Button

1. **Initiate Signup**
   - Click the "Get Started" or "Try Free" button on the Starter plan
   - Watch the Network tab for the request

2. **Expected Request**
   - URL: `/.netlify/functions/grant-starter`
   - Method: `POST`
   - Status: `200 OK` (green)

3. **Click on the Request**
   - In Network tab, click on the `grant-starter` request
   - Click "Response" sub-tab

### Test 3: Verify Response

**Success Response (Status 200)**:
```json
{
  "ok": true,
  "email": "user@example.com",
  "tempPasswordProvided": true,
  "tempPassword": "ABC123...",
  "plan": "starter"
}
```

**Missing Environment Variables (Status 400)**:
```json
{
  "error": "MISSING_ENV",
  "missing": ["SUPABASE_SERVICE_ROLE_KEY"],
  "message": "Missing required environment variables in grant-starter",
  "hint": "Check Netlify Site Settings → Environment Variables"
}
```

**Internal Error (Status 500)**:
```json
{
  "error": "Internal server error",
  "message": "..."
}
```

### Test 4: Check Netlify Function Logs

1. **Open Netlify Dashboard**
   - Go to https://app.netlify.com
   - Select your site
   - Click "Logs" in top navigation
   - Click "Functions" tab

2. **Select grant-starter Function**
   - In the functions list, click "grant-starter"
   - Recent invocations appear at the bottom

3. **Review Log Output**

**Successful Execution**:
```json
{"timestamp":"2025-10-26T12:34:56Z","function":"grant-starter","phase":"start"}
{"timestamp":"2025-10-26T12:34:56Z","function":"grant-starter","phase":"validated_env","found":["SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY"]}
{"timestamp":"2025-10-26T12:34:56Z","function":"grant-starter","phase":"supabase_connect_ok"}
{"timestamp":"2025-10-26T12:34:56Z","function":"grant-starter","phase":"processing_signup","email":"user@example.com"}
{"timestamp":"2025-10-26T12:34:56Z","function":"grant-starter","phase":"creating_new_profile","email":"user@example.com"}
{"timestamp":"2025-10-26T12:34:57Z","function":"grant-starter","phase":"profile_created","email":"user@example.com"}
{"timestamp":"2025-10-26T12:34:57Z","function":"grant-starter","phase":"creating_auth_user","email":"user@example.com"}
{"timestamp":"2025-10-26T12:34:58Z","function":"grant-starter","phase":"auth_user_created","email":"user@example.com","userId":"abc-123"}
{"timestamp":"2025-10-26T12:34:58Z","function":"grant-starter","phase":"done","email":"user@example.com","success":true}
```

**Missing Environment Variables**:
```json
[grant-starter] MISSING_ENV: {
  "error": "MISSING_ENV",
  "missing": ["SUPABASE_SERVICE_ROLE_KEY"],
  "message": "Missing required environment variables in grant-starter",
  "hint": "Check Netlify Site Settings → Environment Variables"
}
```

**Error During Execution**:
```json
{"timestamp":"2025-10-26T12:34:56Z","function":"grant-starter","phase":"uncaught_error","error":"Connection refused","stack":"..."}
```

## Test 2: Checkout Session Creation

### Test create-checkout-session Function

1. **Open Pricing Page**
   - Navigate to `/pricing`
   - Open DevTools Network tab

2. **Click on Pro or Premium Plan**
   - Click "Subscribe" or "Get Started" button
   - Watch Network tab for request

3. **Expected Request**
   - URL: `/.netlify/functions/create-checkout-session`
   - Method: `POST`
   - Status: `200 OK`

4. **Expected Response**:
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

5. **Check Logs**:
```json
{"timestamp":"2025-10-26T12:34:56Z","function":"create-checkout-session","phase":"start"}
{"timestamp":"2025-10-26T12:34:56Z","function":"create-checkout-session","phase":"validated_env","found":["STRIPE_SECRET_KEY"]}
{"timestamp":"2025-10-26T12:34:56Z","function":"create-checkout-session","phase":"creating_session","priceId":"price_123","hasEmail":true,"hasGuestToken":false}
{"timestamp":"2025-10-26T12:34:57Z","function":"create-checkout-session","phase":"done","sessionId":"cs_test_abc123","success":true}
```

## Test 3: PDF Generation

### Test generate-pdf Function

**Prerequisites**: Must be logged in as authenticated user.

1. **Open Checker Page**
   - Navigate to `/checker` or `/dashboard`
   - Add medications and supplements
   - Click "Download PDF" or "Generate Report"

2. **Check Network Tab**
   - URL: `/.netlify/functions/generate-pdf`
   - Method: `POST`
   - Status: `200 OK`
   - Response: Binary PDF data

3. **Check Logs**:
```json
{"timestamp":"2025-10-26T12:34:56Z","function":"generate-pdf","phase":"start"}
{"timestamp":"2025-10-26T12:34:56Z","function":"generate-pdf","phase":"validated_env","found":["SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY"]}
{"timestamp":"2025-10-26T12:34:56Z","function":"generate-pdf","phase":"supabase_connect_ok"}
{"timestamp":"2025-10-26T12:34:56Z","function":"generate-pdf","phase":"user_authenticated","userId":"abc-123","email":"user@example.com"}
{"timestamp":"2025-10-26T12:34:56Z","function":"generate-pdf","phase":"limit_check","plan":"starter","count":2,"limit":5,"allowed":true}
{"timestamp":"2025-10-26T12:34:57Z","function":"generate-pdf","phase":"generating_pdf","medicationCount":2,"supplementCount":3}
{"timestamp":"2025-10-26T12:34:58Z","function":"generate-pdf","phase":"done","pdfSize":12345,"success":true}
```

## Common Issues and Solutions

### Issue: 400 "MISSING_ENV"

**Problem**: Environment variables not configured

**Solution**:
1. Go to Netlify → Site Settings → Environment Variables
2. Add the missing variables listed in the error
3. Go to Deploys tab
4. Click "Trigger deploy" → "Clear cache and deploy site"
5. Wait for deployment to complete
6. Test again

### Issue: 500 "Internal Server Error"

**Problem**: Runtime error in function

**Solution**:
1. Open Netlify Logs → Functions
2. Click on the failing function
3. Look for `"phase":"uncaught_error"` entries
4. Check the error message
5. Common causes:
   - Invalid Stripe key → Verify `STRIPE_SECRET_KEY`
   - Wrong Supabase URL → Verify `SUPABASE_URL`
   - Missing service role key → Use service_role key not anon key

### Issue: No Response in Network Tab

**Problem**: Request not being sent

**Solution**:
1. Check browser console for JavaScript errors
2. Verify button click handlers are working
3. Check if frontend has correct environment variables
4. Ensure `VITE_` prefixed variables are set for frontend

## Manual Testing with cURL

### Test grant-starter

```bash
curl -X POST https://YOUR-SITE.netlify.app/.netlify/functions/grant-starter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' \
  -v
```

**Expected**: `200 OK` with JSON response containing `ok: true`

### Test create-checkout-session

```bash
curl -X POST https://YOUR-SITE.netlify.app/.netlify/functions/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"priceId":"price_123","email":"test@example.com"}' \
  -v
```

**Expected**: `200 OK` with `{"url":"https://checkout.stripe.com/..."}`

### Test generate-pdf

```bash
curl -X POST https://YOUR-SITE.netlify.app/.netlify/functions/generate-pdf \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"medications":["Aspirin"],"supplements":["Vitamin C"]}' \
  --output test-report.pdf \
  -v
```

**Expected**: `200 OK` with PDF file downloaded as `test-report.pdf`

## Acceptance Checklist

Use this checklist to verify all functions are working:

- [ ] Starter signup returns 200 OK
- [ ] Starter signup creates user in Supabase
- [ ] Starter signup provides temporary password
- [ ] Pro checkout creates Stripe session
- [ ] Premium checkout creates Stripe session
- [ ] PDF generation works for authenticated users
- [ ] PDF generation respects Starter tier limits (5/month)
- [ ] All functions log structured JSON to Netlify
- [ ] Missing env vars return 400 with helpful error
- [ ] Runtime errors log stack traces

## Next Steps

After all tests pass:
1. Configure custom domain in Netlify
2. Set up Stripe webhook endpoint
3. Test end-to-end payment flow
4. Monitor function logs for 24 hours
5. Set up error alerting
