const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const calculateStripeFee = (amountCents) => {
  return Math.floor((amountCents * 0.029) + 30);
};

const getTierFromPriceId = (priceId) => {
  const priceIdLower = priceId.toLowerCase();
  if (priceIdLower.includes('starter') || priceIdLower.includes('free')) {
    return 'Starter';
  } else if (priceIdLower.includes('pro') || priceIdLower.includes('professional')) {
    return 'Professional';
  } else if (priceIdLower.includes('enterprise') || priceIdLower.includes('premium')) {
    return 'Enterprise';
  }
  return 'Professional';
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Webhook secret not configured' }),
    };
  }

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` }),
    };
  }

  try {
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;

      const customerId = session.customer;
      const customerEmail = session.customer_details?.email;
      const amountTotal = session.amount_total;
      const paymentIntentId = session.payment_intent;
      const subscriptionId = session.subscription;
      const refCode = session.client_reference_id || null;

      if (!subscriptionId) {
        console.log('No subscription ID found, skipping');
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ received: true }),
        };
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0].price.id;
      const tier = getTierFromPriceId(priceId);

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', customerEmail)
        .maybeSingle();

      if (!profile) {
        console.error('No profile found for email:', customerEmail);
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Profile not found' }),
        };
      }

      await supabase
        .from('profiles')
        .update({
          plan: tier.toLowerCase(),
          stripe_customer_id: customerId
        })
        .eq('id', profile.id);

      const stripeFee = calculateStripeFee(amountTotal);

      await supabase
        .from('revenue_tracking')
        .insert({
          user_id: profile.id,
          stripe_payment_id: paymentIntentId,
          tier: tier,
          amount_cents: amountTotal,
          stripe_fee_cents: stripeFee,
          referral_code: refCode,
          reinvested: false
        });

      console.log(`Revenue tracked: $${amountTotal / 100} for ${customerEmail} (${tier})`);

      if (refCode) {
        await supabase
          .from('referral_tracking')
          .update({
            converted_to_pro: true,
            conversion_date: new Date().toISOString(),
            tier: tier,
            revenue_cents: amountTotal
          })
          .eq('ref_code', refCode)
          .eq('user_id', profile.id);

        console.log(`Referral conversion tracked for ref_code: ${refCode}`);
      }
    }

    if (stripeEvent.type === 'invoice.payment_succeeded') {
      const invoice = stripeEvent.data.object;

      if (invoice.billing_reason === 'subscription_cycle') {
        const customerId = invoice.customer;
        const customerEmail = invoice.customer_email;
        const amountPaid = invoice.amount_paid;
        const subscriptionId = invoice.subscription;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;
        const tier = getTierFromPriceId(priceId);

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (profile) {
          const stripeFee = calculateStripeFee(amountPaid);

          await supabase
            .from('revenue_tracking')
            .insert({
              user_id: profile.id,
              stripe_payment_id: invoice.payment_intent,
              tier: tier,
              amount_cents: amountPaid,
              stripe_fee_cents: stripeFee,
              referral_code: null,
              reinvested: false
            });

          console.log(`Renewal revenue tracked: $${amountPaid / 100} for ${customerEmail} (${tier})`);
        }
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Webhook processing error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
