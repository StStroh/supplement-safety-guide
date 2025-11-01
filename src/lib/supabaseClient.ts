import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

let supabase: SupabaseClient | null = null;

if (!env.isConfigured) {
  console.warn('Supabase not configured - missing environment variables');
} else {
  supabase = createClient(env.url, env.key, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

export { supabase, env };
