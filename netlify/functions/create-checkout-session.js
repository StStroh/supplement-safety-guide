import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const json = (s, p) => new Response(JSON.stringify(p), {
  status: s,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  }
});

export default async function handler(req) {
  if (req.method === "OPTIONS") return json(204, {});
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const requiredEnv = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    PRICE_ID_PRO_MONTHLY: process.env.PRICE_ID_PRO_MONTHLY,
    PRICE_ID_PRO_ANNUAL: process.env.PRICE_ID_PRO_ANNUAL,
    PRICE_ID_PREMIUM_MONTHLY: process.env.PRICE_ID_PREMIUM_MONTHLY,
    PRICE_ID_PREMIUM_ANNUAL: process.env.PRICE_ID_PREMIUM_ANNUAL,
  };

  const missing = Object.entries(requiredEnv)
    .filter(([_, val]) => !val)
    .map(([key]) => key);

  if (missing.length > 0) {
    return json(400, { error: "missing_env", missing });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const { plan, userId } = body;

  if (!plan || typeof plan !== "string") {
    return json(400, { error: "missing_plan" });
  }

  if (!userId || typeof userId !== "string") {
    return json(400, { error: "missing_user_id" });
  }

  const priceMap = {
    pro_monthly: { priceId: requiredEnv.PRICE_ID_PRO_MONTHLY, plan: "pro" },
    pro_annual: { priceId: requiredEnv.PRICE_ID_PRO_ANNUAL, plan: "pro" },
    premium_monthly: { priceId: requiredEnv.PRICE_ID_PREMIUM_MONTHLY, plan: "premium" },
    premium_annual: { priceId: requiredEnv.PRICE_ID_PREMIUM_ANNUAL, plan: "premium" },
  };

  if (!priceMap[plan]) {
    return json(400, {
      error: "invalid_plan",
      plan,
      valid_plans: Object.keys(priceMap)
    });
  }

  const { priceId, plan: tierName } = priceMap[plan];

  if (!priceId.startsWith("price_")) {
    return json(500, {
      error: "invalid_price_id_format",
      plan,
      priceId
    });
  }

  const stripe = new Stripe(requiredEnv.STRIPE_SECRET_KEY);
  const supabase = createClient(
    requiredEnv.SUPABASE_URL,
    requiredEnv.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("id", userId)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email,
        metadata: { supabase_user_id: userId },
      });
      customerId = customer.id;

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", userId);
    }

    const origin = new URL(req.url).origin;
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=1`,
      allow_promotion_codes: true,
      metadata: {
        supabase_user_id: userId,
        plan: tierName,
      },
    });

    return json(200, { url: session.url });
  } catch (e) {
    console.error("Stripe error:", e);
    return json(500, {
      error: "stripe_create_failed",
      detail: e?.message || String(e)
    });
  }
}
