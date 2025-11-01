const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    console.info('Reading env vars: STRIPE_SECRET_KEY, VITE_PRICE_ID_STARTER, VITE_PRICE_ID_PRO_MONTHLY, VITE_PRICE_ID_PRO_ANNUAL, VITE_PRICE_ID_PREMIUM_MONTHLY, VITE_PRICE_ID_PREMIUM_ANNUAL');

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Stripe is not configured' }),
      };
    }

    // Add hardcoded FREE Starter plan (no Stripe needed)
    const freeStarterPlan = {
      id: 'free_starter_plan',
      productName: 'Starter Access',
      nickname: 'Starter Access',
      unit_amount: 0,
      currency: 'usd',
      interval: 'month'
    };

    // Only fetch paid plans from Stripe (Pro and Premium)
    const priceIds = [
      process.env.VITE_PRICE_ID_PRO_MONTHLY || process.env.VITE_PRICE_ID_PRO,
      process.env.VITE_PRICE_ID_PRO_ANNUAL,
      process.env.VITE_PRICE_ID_PREMIUM_MONTHLY || process.env.VITE_PRICE_ID_PREMIUM,
      process.env.VITE_PRICE_ID_PREMIUM_ANNUAL
    ].filter(Boolean);

    console.info(`Fetching ${priceIds.length} paid prices from Stripe`);

    const prices = await Promise.all(
      priceIds.map(async (priceId) => {
        try {
          const price = await stripe.prices.retrieve(priceId, {
            expand: ['product']
          });

          return {
            id: price.id,
            productName: price.product.name,
            nickname: price.nickname || price.product.name,
            unit_amount: price.unit_amount,
            currency: price.currency,
            interval: price.recurring?.interval || 'one_time'
          };
        } catch (error) {
          console.error(`Error fetching price ${priceId}:`, error.message);
          return null;
        }
      })
    );

    const validPrices = prices.filter(p => p !== null);

    // Add the free Starter plan at the beginning
    validPrices.unshift(freeStarterPlan);

    console.info(`Successfully fetched ${validPrices.length} prices`);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prices: validPrices }),
    };
  } catch (error) {
    console.error('Error fetching prices:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message,
      }),
    };
  }
};
