#!/usr/bin/env node

const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => {
    rl.output.write(query);
    rl.input.once('data', (data) => {
      resolve(data.toString().trim());
    });
  });
}

function maskSecret(secret, showChars = 12) {
  if (!secret || secret.length <= showChars) return '***';
  return secret.substring(0, showChars) + '...';
}

function httpsRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function fetchStripeProducts(apiKey) {
  console.log('📦 Fetching products from Stripe...');
  const options = {
    hostname: 'api.stripe.com',
    path: '/v1/products?active=true&limit=100',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  return await httpsRequest(options);
}

async function fetchStripePrices(apiKey) {
  console.log('💰 Fetching prices from Stripe...');
  const options = {
    hostname: 'api.stripe.com',
    path: '/v1/prices?active=true&limit=100',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  return await httpsRequest(options);
}

async function getNetlifyEnvVars(siteId, token) {
  console.log('🔍 Fetching current Netlify env vars...');
  const options = {
    hostname: 'api.netlify.com',
    path: `/api/v1/accounts/${siteId.split('-')[0]}/env`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    return await httpsRequest(options);
  } catch (e) {
    // Try alternate path
    const options2 = {
      hostname: 'api.netlify.com',
      path: `/api/v1/sites/${siteId}/env`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    return await httpsRequest(options2);
  }
}

async function setNetlifyEnvVar(siteId, token, key, value) {
  const options = {
    hostname: 'api.netlify.com',
    path: `/api/v1/sites/${siteId}/env/${key}`,
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const payload = {
    context: 'production',
    value: value
  };

  return await httpsRequest(options, JSON.stringify(payload));
}

async function triggerNetlifyDeploy(siteId, token) {
  console.log('🚀 Triggering Netlify deploy...');
  const options = {
    hostname: 'api.netlify.com',
    path: `/api/v1/sites/${siteId}/builds`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const payload = {
    clear_cache: true
  };

  return await httpsRequest(options, JSON.stringify(payload));
}

async function main() {
  console.log('\n=== Stripe → Netlify Price ID Sync Tool ===\n');

  // Collect credentials
  process.stdout.write('STRIPE_SECRET_KEY (sk_live_...): ');
  process.stdin.setRawMode(true);
  let stripeKey = '';

  await new Promise(resolve => {
    process.stdin.on('data', function handler(char) {
      char = char.toString();
      if (char === '\r' || char === '\n') {
        process.stdin.removeListener('data', handler);
        process.stdin.setRawMode(false);
        process.stdout.write('\n');
        resolve();
      } else if (char === '\u0003') {
        process.exit();
      } else if (char === '\u007f') {
        stripeKey = stripeKey.slice(0, -1);
      } else {
        stripeKey += char;
        process.stdout.write('*');
      }
    });
  });

  const netlifyToken = await question('NETLIFY_AUTH_TOKEN: ');
  const netlifySiteId = await question('NETLIFY_SITE_ID: ');

  rl.close();

  // Validate
  if (!stripeKey.startsWith('sk_live_')) {
    console.error('\n❌ Error: STRIPE_SECRET_KEY must start with sk_live_');
    process.exit(1);
  }

  if (!netlifyToken || !netlifySiteId) {
    console.error('\n❌ Error: All credentials are required');
    process.exit(1);
  }

  console.log('\n✓ Credentials collected (masked for security)');
  console.log(`  Stripe Key: ${maskSecret(stripeKey)}`);
  console.log(`  Site ID: ${maskSecret(netlifySiteId, 8)}`);
  console.log('');

  try {
    // Fetch from Stripe
    const products = await fetchStripeProducts(stripeKey);
    const prices = await fetchStripePrices(stripeKey);

    console.log(`✓ Found ${products.data.length} products, ${prices.data.length} prices\n`);

    // Map products
    const priceMap = {};

    for (const product of products.data) {
      const productPrices = prices.data.filter(p => p.product === product.id);
      const nameLower = product.name.toLowerCase();

      if (nameLower.includes('professional')) {
        const monthly = productPrices.find(p => p.recurring?.interval === 'month' && p.currency === 'usd');
        const yearly = productPrices.find(p => p.recurring?.interval === 'year' && p.currency === 'usd');
        if (monthly) priceMap.VITE_PRICE_ID_PRO_MONTHLY = monthly.id;
        if (yearly) priceMap.VITE_PRICE_ID_PRO_ANNUAL = yearly.id;
        console.log(`✓ Professional Plan:`);
        console.log(`  Monthly: ${monthly ? monthly.id : 'NOT FOUND'} ($${monthly ? (monthly.unit_amount/100).toFixed(2) : 'N/A'})`);
        console.log(`  Annual: ${yearly ? yearly.id : 'NOT FOUND'} ($${yearly ? (yearly.unit_amount/100).toFixed(2) : 'N/A'})`);
      }

      if (nameLower.includes('premium')) {
        const monthly = productPrices.find(p => p.recurring?.interval === 'month' && p.currency === 'usd');
        const yearly = productPrices.find(p => p.recurring?.interval === 'year' && p.currency === 'usd');
        if (monthly) priceMap.VITE_PRICE_ID_PREMIUM_MONTHLY = monthly.id;
        if (yearly) priceMap.VITE_PRICE_ID_PREMIUM_ANNUAL = yearly.id;
        console.log(`✓ Premium Plan:`);
        console.log(`  Monthly: ${monthly ? monthly.id : 'NOT FOUND'} ($${monthly ? (monthly.unit_amount/100).toFixed(2) : 'N/A'})`);
        console.log(`  Annual: ${yearly ? yearly.id : 'NOT FOUND'} ($${yearly ? (yearly.unit_amount/100).toFixed(2) : 'N/A'})`);
      }

      if (nameLower.includes('supplement') && nameLower.includes('bible')) {
        const oneTime = productPrices.find(p => p.type === 'one_time' && p.currency === 'usd');
        if (oneTime) priceMap.VITE_PRICE_ID_GUIDE = oneTime.id;
        console.log(`✓ Digital Guide:`);
        console.log(`  One-time: ${oneTime ? oneTime.id : 'NOT FOUND'} ($${oneTime ? (oneTime.unit_amount/100).toFixed(2) : 'N/A'})`);
      }
    }

    console.log('');

    // Validate required prices
    const required = ['VITE_PRICE_ID_PRO_MONTHLY', 'VITE_PRICE_ID_PREMIUM_MONTHLY', 'VITE_PRICE_ID_GUIDE'];
    const missing = required.filter(key => !priceMap[key]);

    if (missing.length > 0) {
      console.error(`❌ Missing required price IDs: ${missing.join(', ')}`);
      console.error('   Visit: https://dashboard.stripe.com/products');
      process.exit(1);
    }

    // Update Netlify
    console.log('📝 Updating Netlify environment variables...');
    for (const [key, value] of Object.entries(priceMap)) {
      await setNetlifyEnvVar(netlifySiteId, netlifyToken, key, value);
      console.log(`  ✓ ${key} = ${value}`);
    }

    console.log('');

    // Trigger deploy
    const deploy = await triggerNetlifyDeploy(netlifySiteId, netlifyToken);
    console.log(`✓ Deploy triggered: ${deploy.id || 'pending'}`);
    console.log(`  URL: https://app.netlify.com/sites/${netlifySiteId}/deploys`);

    console.log('\n=== Summary ===\n');
    console.log('Environment Variables Set:');
    console.log('┌─────────────────────────────────┬──────────────────────────────┐');
    console.log('│ Variable                        │ Stripe Price ID              │');
    console.log('├─────────────────────────────────┼──────────────────────────────┤');
    for (const [key, value] of Object.entries(priceMap)) {
      console.log(`│ ${key.padEnd(31)} │ ${value.padEnd(28)} │`);
    }
    console.log('└─────────────────────────────────┴──────────────────────────────┘');

    console.log('\n✅ Sync Complete!');
    console.log('\nNext Steps:');
    console.log('1. Wait for Netlify deploy to complete (~2-3 minutes)');
    console.log('2. Visit https://supplementsafetybible.com/pricing');
    console.log('3. Test each plan button');
    console.log('4. Verify Starter bypasses Stripe (no checkout)');
    console.log('5. Verify Pro/Premium/Guide open correct Stripe checkouts');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
