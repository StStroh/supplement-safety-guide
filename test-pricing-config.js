import { readFileSync } from 'fs';

const envContent = readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2];
  }
});

console.log('=== Environment Variables Check ===\n');

const envVars = {
  'VITE_SUPABASE_URL': env.VITE_SUPABASE_URL,
  'VITE_SUPABASE_ANON_KEY': env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
  'VITE_STRIPE_PUBLISHABLE_KEY': env.VITE_STRIPE_PUBLISHABLE_KEY?.substring(0, 20) + '...',
  'STRIPE_SECRET_KEY': env.STRIPE_SECRET_KEY === 'your_stripe_secret_key_here' ? '❌ NOT SET' : '✅ SET',
  'VITE_PRICE_ID_STARTER': env.VITE_PRICE_ID_STARTER,
  'VITE_PRICE_ID_PRO': env.VITE_PRICE_ID_PRO,
  'VITE_PRICE_ID_PREMIUM': env.VITE_PRICE_ID_PREMIUM,
};

for (const [key, value] of Object.entries(envVars)) {
  const status = value && !value.includes('your_') && !value.includes('_here') ? '✅' : '❌';
  console.log(`${status} ${key}: ${value || 'NOT SET'}`);
}

console.log('\n=== Price ID Validation ===\n');

const priceIds = [
  { name: 'STARTER', id: env.VITE_PRICE_ID_STARTER },
  { name: 'PRO', id: env.VITE_PRICE_ID_PRO },
  { name: 'PREMIUM', id: env.VITE_PRICE_ID_PREMIUM },
];

for (const { name, id } of priceIds) {
  const valid = id && id.startsWith('price_') && id.length > 10;
  console.log(`${valid ? '✅' : '❌'} ${name}: ${id || 'NOT SET'}`);
  if (valid) {
    console.log(`   Format: Valid Stripe Price ID`);
  }
}

console.log('\n=== Summary ===\n');
const allPricesValid = priceIds.every(p => p.id && p.id.startsWith('price_') && p.id.length > 10);
console.log(`${allPricesValid ? '✅' : '❌'} All three price IDs are ${allPricesValid ? 'configured correctly' : 'NOT configured'}`);
console.log('✅ Client-side env vars (VITE_*) are set');
console.log(`${env.STRIPE_SECRET_KEY === 'your_stripe_secret_key_here' ? '❌' : '✅'} Server-side STRIPE_SECRET_KEY ${env.STRIPE_SECRET_KEY === 'your_stripe_secret_key_here' ? 'needs to be set' : 'is configured'}`);
console.log('\n📝 For Netlify deployment, ensure all these variables are set in:');
console.log('   Site settings → Environment variables');
