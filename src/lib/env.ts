export type EnvCheck = {
  url: string;
  key: string;
  stripe: string;
  missing: string[];
  isConfigured: boolean;
};

const getUrl = () => {
  return import.meta?.env?.VITE_SUPABASE_URL ||
         import.meta?.env?.VITE_BOLT_DATABASE_URL ||
         import.meta?.env?.BOLT_DATABASE_URL ||
         "";
};

const getAnonKey = () => {
  return import.meta?.env?.VITE_SUPABASE_ANON_KEY ||
         import.meta?.env?.VITE_BOLT_DATABASE_ANON_KEY ||
         import.meta?.env?.BOLT_DATABASE_ANON_KEY ||
         "";
};

const getStripeKey = () => {
  return import.meta?.env?.VITE_STRIPE_PUBLISHABLE_KEY ||
         import.meta?.env?.STRIPE_PUBLIC_KEY ||
         "";
};

export const checkEnv = (): EnvCheck => {
  const url = getUrl();
  const key = getAnonKey();
  const stripe = getStripeKey();
  const missing: string[] = [];

  if (!url) missing.push("VITE_SUPABASE_URL");
  if (!key) missing.push("VITE_SUPABASE_ANON_KEY");
  if (!stripe) missing.push("VITE_STRIPE_PUBLISHABLE_KEY");

  return {
    url,
    key,
    stripe,
    missing,
    isConfigured: missing.length === 0,
  };
};

export const env = checkEnv();
