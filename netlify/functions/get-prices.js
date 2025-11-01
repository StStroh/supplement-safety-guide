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
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Stripe is not configured' }),
      };
    }

    const priceIds = [
      process.env.VITE_PRICE_ID_STARTER,
      process.env.VITE_PRICE_ID_PRO,
      process.env.VITE_PRICE_ID_PREMIUM
    ].filter(Boolean);

    if (priceIds.length === 0) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'No price IDs configured' }),
      };
    }

    const prices = await Promise.all(
      priceIds.map(async (priceId) => {
        try {
          const price = await stripe.prices.retrieve(priceId, {
            expand: ['product']
          });

          return {
            priceId: price.id,
            productName: price.product.name,
            amount: price.unit_amount / 100,
            currency: price.currency.toUpperCase(),
            interval: price.recurring?.interval || 'one_time'
          };
        } catch (error) {
          console.error(`Error fetching price ${priceId}:`, error);
          return null;
        }
      })
    );

    const validPrices = prices.filter(p => p !== null);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prices: validPrices }),
    };
  } catch (error) {
    console.error('Error fetching prices:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message,
      }),
    };
  }
};
