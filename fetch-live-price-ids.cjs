require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

(async () => {
  try {
    console.log('\n=== FETCHING LIVE STRIPE PRICE IDs ===\n');
    console.log('Using secret key:', process.env.STRIPE_SECRET_KEY?.substring(0, 15) + '...\n');

    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
      limit: 100
    });

    const monthlyPrices = prices.data.filter(price =>
      price.recurring?.interval === 'month'
    );

    console.log('Found', monthlyPrices.length, 'active monthly prices:\n');

    const targetPrices = {
      starter: null,
      pro: null,
      premium: null
    };

    monthlyPrices.forEach(price => {
      const amount = price.unit_amount / 100;
      const productName = price.product.name;

      console.log('---');
      console.log('Product:', productName);
      console.log('Price ID:', price.id);
      console.log('Amount:', `$${amount.toFixed(2)}/${price.recurring.interval}`);
      console.log('Currency:', price.currency.toUpperCase());

      if (amount === 0 && !targetPrices.starter) {
        targetPrices.starter = { id: price.id, name: productName };
      } else if (amount === 9.99 && !targetPrices.pro) {
        targetPrices.pro = { id: price.id, name: productName };
      } else if (amount === 49.99 && !targetPrices.premium) {
        targetPrices.premium = { id: price.id, name: productName };
      }
    });

    console.log('\n=== RECOMMENDED PRICE IDs FOR NETLIFY ===\n');

    if (targetPrices.starter) {
      console.log('VITE_PRICE_ID_STARTER=' + targetPrices.starter.id);
      console.log('  → ' + targetPrices.starter.name + ' ($0.00/month)');
    } else {
      console.log('⚠ No $0.00/month price found');
    }

    if (targetPrices.pro) {
      console.log('\nVITE_PRICE_ID_PRO=' + targetPrices.pro.id);
      console.log('  → ' + targetPrices.pro.name + ' ($9.99/month)');
    } else {
      console.log('\n⚠ No $9.99/month price found');
    }

    if (targetPrices.premium) {
      console.log('\nVITE_PRICE_ID_PREMIUM=' + targetPrices.premium.id);
      console.log('  → ' + targetPrices.premium.name + ' ($49.99/month)');
    } else {
      console.log('\n⚠ No $49.99/month price found');
    }

    console.log('\n=== INSTRUCTIONS ===\n');
    console.log('1. Go to Netlify → Site settings → Environment variables');
    console.log('2. Update these variables with the Price IDs shown above');
    console.log('3. Redeploy your site (Deploys → Trigger deploy → Clear cache and deploy site)\n');

  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error('\nPlease ensure:');
    console.error('1. STRIPE_SECRET_KEY in .env is valid and starts with sk_live_');
    console.error('2. You are in LIVE mode in Stripe dashboard');
    console.error('3. Your Stripe account has the necessary permissions\n');
    process.exit(1);
  }
})();
