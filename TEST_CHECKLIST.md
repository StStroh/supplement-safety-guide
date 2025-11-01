# 🧪 PAYMENT TIER TESTING CHECKLIST

## Quick 2-Minute Test (After Deployment)

### 1️⃣ Open Incognito Window
- **Chrome/Edge:** Ctrl+Shift+N (Windows) or Cmd+Shift+N (Mac)
- **Firefox:** Ctrl+Shift+P (Windows) or Cmd+Shift+P (Mac)
- **Safari:** Cmd+Shift+N

### 2️⃣ Go to Live Site
Navigate to: `https://supplementsafetybible.com`

---

## 3️⃣ Test All 6 Buttons (One by One)

### Toggle: **MONTHLY** Selected

| # | Button to Click | Expected Result | Status |
|---|----------------|-----------------|--------|
| 1 | **Starter Access** → "Start Free" | Redirects to `/checker` page | ⬜ |
| 2 | **Professional Plan** → "Get Started" | Opens Stripe checkout with "$20/month" | ⬜ |
| 3 | **Premium Access** → "Get Started" | Opens Stripe checkout with "$49/month" | ⬜ |

### Toggle: **ANNUAL** Selected

| # | Button to Click | Expected Result | Status |
|---|----------------|-----------------|--------|
| 4 | **Starter Access** → "Start Free" | Redirects to `/checker` page | ⬜ |
| 5 | **Professional Plan** → "Get Started" | Opens Stripe checkout with "$200/year" | ⬜ |
| 6 | **Premium Access** → "Get Started" | Opens Stripe checkout with "$490/year" | ⬜ |

---

## ✅ SUCCESS CRITERIA

For buttons #2, #3, #5, #6:
- Button shows "Processing..." briefly
- Browser redirects to **NEW PAGE** (Stripe checkout)
- URL changes to `https://buy.stripe.com/live_...` OR `https://checkout.stripe.com/...`
- Stripe page shows correct plan name and price
- No error messages or blank pages

For buttons #1, #4 (Starter/Free):
- Redirects to interaction checker page (`/checker`)

---

## 🔍 ADVANCED TESTING (With Developer Tools)

### Open Browser DevTools
Press **F12** or Right-click → Inspect

### Console Tab Test
1. Click each button (one at a time)
2. **PASS:** No red errors
3. **FAIL:** See errors like:
   - `Stripe is not defined` → Missing publishable key
   - `Failed to create checkout session` → Backend/function issue
   - `Invalid Price ID` → Wrong price ID in config

### Network Tab Test
1. Click **Network** tab in DevTools
2. Click a pricing button
3. Look for requests:
   - **Payment Links:** Direct redirect to `buy.stripe.com` (302/200)
   - **Checkout Sessions:** POST to `functions/v1/stripe-checkout` (200), then redirect
4. **FAIL:** 400/401/500 errors → Check env variables

---

## 🎯 AUTOMATED TEST SCRIPT

Copy-paste in browser console (F12):

```javascript
// Test all pricing tier URLs
const plans = {
  "Pro Monthly": document.querySelector('[data-plan="pro-monthly"]'),
  "Pro Annual": document.querySelector('[data-plan="pro-annual"]'),
  "Premium Monthly": document.querySelector('[data-plan="premium-monthly"]'),
  "Premium Annual": document.querySelector('[data-plan="premium-annual"]')
};

console.log('🧪 Payment Tier Test Results:');
Object.entries(plans).forEach(([name, button]) => {
  if (!button) {
    console.warn(`❌ ${name}: Button not found`);
  } else {
    console.log(`✅ ${name}: Button exists`);
  }
});
```

---

## 📸 VISUAL VERIFICATION

### What Working Buttons Look Like:

#### Before Click:
- Button text: "Get Started"
- Button is clickable (not grayed out)
- Hover effect works

#### During Click:
- Button text changes to "Processing..."
- Button appears disabled
- Spinner may show (if implemented)

#### After Click (1-2 seconds):
- **New browser tab/page opens** with Stripe checkout
- OR current page redirects to Stripe
- You see Stripe's checkout form with:
  - Your plan name
  - Correct price ($20, $200, $49, or $490)
  - "Monthly" or "Annual" subscription text
  - Credit card input fields

---

## 🚨 COMMON ISSUES & FIXES

### Issue: Button does nothing
**Check:**
1. Open DevTools Console → Click button → Look for error
2. Right-click button → Inspect → Check if `onClick` handler exists

**Fix:** Config file not deployed or wrong URLs

---

### Issue: Goes to wrong price
**Check:** Toggle Monthly/Annual and test again

**Fix:** Wrong payment link in wrong tier (swap them in config)

---

### Issue: "Checkout not configured" alert
**Cause:** No Payment Links in config + invalid Price IDs

**Fix:** Add real Stripe Payment Links to `/src/config/plans.json`

---

### Issue: Console error "STRIPE_SECRET_KEY not configured"
**Cause:** Supabase Edge Function can't find env variable

**Fix:** Add to Supabase project settings (not Netlify) or use Payment Links instead

---

## 🎬 TEST VIDEO EVIDENCE

Record a screen video showing:
1. Toggle between Monthly/Annual
2. Click each "Get Started" button
3. Show Stripe checkout page opens with correct prices
4. Return and test next button

Upload to Loom/YouTube and share for verification.

---

## ✨ FINAL VALIDATION

All 6 tests must pass:

- [ ] Starter Monthly → Checker page
- [ ] Pro Monthly → Stripe $20/month
- [ ] Premium Monthly → Stripe $49/month
- [ ] Starter Annual → Checker page
- [ ] Pro Annual → Stripe $200/year
- [ ] Premium Annual → Stripe $490/year

**When complete:** You have a fully working payment system! 🎉
