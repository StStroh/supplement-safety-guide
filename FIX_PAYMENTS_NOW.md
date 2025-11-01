# 🚨 FIX YOUR PAYMENTS - STEP BY STEP GUIDE

**Problem:** Customers cannot complete payments because your Stripe price IDs are invalid.

**Time to Fix:** 5 minutes

---

## ✅ STEP 1: Get Your Real Stripe Price IDs

### 1.1 Open Stripe Dashboard
Go to: **https://dashboard.stripe.com**

### 1.2 Make Sure You're in LIVE Mode
- Look at the top-left corner of the dashboard
- It should say **"VIEWING LIVE DATA"** (not "Viewing test data")
- If you see test data, click the toggle to switch to LIVE mode

### 1.3 Go to Products & Prices
Click: **https://dashboard.stripe.com/prices**

### 1.4 Find or Create Your Prices
You need THREE subscription prices:

**Option A: If they already exist**
- Find each price in the list
- Click on it to see details
- Copy the Price ID (starts with `price_`)

**Option B: If they don't exist yet**

Create these 3 prices:

1. **Starter Plan**
   - Name: "Starter Access"
   - Price: $0.00 USD
   - Billing: Recurring / Monthly
   - Click "Create price" → Copy the Price ID

2. **Professional Plan**
   - Name: "Professional Plan"
   - Price: $9.99 USD
   - Billing: Recurring / Monthly
   - Click "Create price" → Copy the Price ID

3. **Expert Plan**
   - Name: "Expert Plan"
   - Price: $29.99 USD
   - Billing: Recurring / Monthly
   - Click "Create price" → Copy the Price ID

---

## ✅ STEP 2: Send Me The Price IDs

Reply with your 3 price IDs in this format:

```
Starter: price_xxxxxxxxxxxxx
Pro: price_xxxxxxxxxxxxx
Premium: price_xxxxxxxxxxxxx
```

---

## ✅ STEP 3: I'll Fix Everything (Takes 2 minutes)

Once you give me the price IDs, I will:
1. Update your .env file ✓
2. Update your stripe-config.ts file ✓
3. Rebuild the application ✓
4. Test the payment flow ✓

---

## ✅ STEP 4: Verify Webhook (While Waiting)

1. Go to: **https://dashboard.stripe.com/webhooks**
2. Check if you have a webhook endpoint
3. If yes, verify it points to:
   ```
   https://jggzgdrivlamjwwsvdow.supabase.co/functions/v1/stripe-webhook
   ```
4. If no webhook exists, I'll help you create it after fixing the price IDs

---

## ✅ STEP 5: Verify Bank Connection (Optional)

1. Go to: **https://dashboard.stripe.com/settings/payouts**
2. Confirm Mercury bank account is connected
3. Verify "Live mode" toggle is ON

---

## 🔧 DIAGNOSTIC TOOL

Open this file in your browser to test your Stripe connection:
**File:** `test-stripe-live.html`

This will show you:
- Current price IDs being used
- Whether they're valid in Stripe
- What errors customers are seeing

---

## 📞 NEED HELP?

**Common Issues:**

**Issue 1: "I can't find any prices in my Stripe account"**
→ You need to create them (see Step 1.4 above)

**Issue 2: "I have prices but different amounts"**
→ That's fine! Just send me whatever price IDs you want to use

**Issue 3: "I'm in test mode, should I switch to live?"**
→ YES! You need to be in LIVE mode for real payments

**Issue 4: "My Mercury bank isn't connected"**
→ Go to Stripe → Settings → Payouts → Add bank account

---

## ⚡ QUICK SUMMARY

**What's broken:** Your price IDs don't exist in Stripe
**Why it's broken:** Either deleted, wrong account, or test IDs in live mode
**How to fix:** Get real price IDs from Stripe dashboard and send them to me
**Time to fix:** 5 minutes total

**Just reply with your 3 price IDs and I'll handle the rest!**
