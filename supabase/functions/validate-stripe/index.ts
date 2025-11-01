import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.4.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured in Supabase Edge Functions environment variables");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia",
    });

    const priceIds = [
      { name: "STARTER", id: "price_1SJJL4LSpIuKqlsUgNBSE8ZV" },
      { name: "PRO", id: "price_1SJJQtLSpIuKqlsUhZdEPJ3L" },
      { name: "PREMIUM", id: "price_1SJJXgLSpIuKqlsUa5rP1xbE" },
    ];

    const results = [];

    for (const p of priceIds) {
      try {
        const price = await stripe.prices.retrieve(p.id);
        results.push({
          name: p.name,
          id: p.id,
          active: price.active,
          currency: price.currency,
          product: price.product,
          type: price.type,
          unit_amount: price.unit_amount,
        });
      } catch (error) {
        results.push({
          name: p.name,
          id: p.id,
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        stripeConfigured: true,
        results,
        timestamp: new Date().toISOString(),
      }, null, 2),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});