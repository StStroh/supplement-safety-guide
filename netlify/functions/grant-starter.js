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
    BOLT_DATABASE_URL: process.env.BOLT_DATABASE_URL,
    BOLT_DATABASE_ANON_KEY: process.env.BOLT_DATABASE_ANON_KEY,
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

  const email = (body?.email || "").toLowerCase().trim();

  if (!email) {
    return json(400, { error: "missing_email" });
  }

  if (!email.includes("@") || email.length < 3) {
    return json(400, { error: "invalid_email" });
  }

  const supabase = createClient(
    requiredEnv.BOLT_DATABASE_URL,
    requiredEnv.BOLT_DATABASE_ANON_KEY
  );

  const { error } = await supabase
    .from("profiles")
    .upsert(
      { email, plan: "starter", is_active: true },
      { onConflict: "email" }
    );

  if (error) {
    console.error("DB upsert error:", error);
    return json(500, { error: "db_upsert_failed", detail: error.message });
  }

  return json(200, { ok: true, plan: "starter_granted", email });
}
