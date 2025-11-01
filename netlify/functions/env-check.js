export default async function handler() {
  const requiredEnvVars = [
    "BOLT_DATABASE_URL",
    "BOLT_DATABASE_ANON_KEY",
    "BOLT_DATABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
    "PRICE_ID_PRO_MONTHLY",
    "PRICE_ID_PRO_ANNUAL",
    "PRICE_ID_PREMIUM_MONTHLY",
    "PRICE_ID_PREMIUM_ANNUAL"
  ];

  const result = Object.fromEntries(
    requiredEnvVars.map(name => [name, !!process.env[name]])
  );

  return new Response(JSON.stringify({ env: result }, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
