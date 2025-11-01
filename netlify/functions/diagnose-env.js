export default async function handler() {
  const names = [
    "BOLT_DATABASE_URL","BOLT_DATABASE_ANON_KEY","BOLT_DATABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY","PRICE_ID_PRO_MONTHLY","PRICE_ID_PRO_ANNUAL",
    "PRICE_ID_PREMIUM_MONTHLY","PRICE_ID_PREMIUM_ANNUAL"
  ];
  const result = Object.fromEntries(names.map(n => [n, !!process.env[n]]));
  return new Response(JSON.stringify({ env: result }), {
    headers: { "Content-Type":"application/json" }
  });
}
