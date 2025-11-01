const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const calculateStripeFee = (amountCents) => {
  return Math.floor((amountCents * 0.029) + 30);
};

const getTierFromPriceId = (priceId) => {
  // Map explicit price IDs from environment
  const proPriceIds = [
    process.env.PRICE_ID_PRO_MONTHLY,
    process.env.PRICE_ID_PRO_ANNUAL,
    process.env.VITE_PRICE_ID_PRO
  ].filter(Boolean);

  const premiumPriceIds = [
    process.env.PRICE_ID_PREMIUM_MONTHLY,
    process.env.PRICE_ID_PREMIUM_ANNUAL,
    process.env.VITE_PRICE_ID_PREMIUM
  ].filter(Boolean);

  // Check explicit price ID matches first
  if (proPriceIds.includes(priceId)) {
    return 'pro';
  }
  if (premiumPriceIds.includes(priceId)) {
    return 'premium';
  }

  // Fallback to name-based detection
  const priceIdLower = priceId.toLowerCase();
  if (priceIdLower.includes('starter') || priceIdLower.includes('free')) {
    return 'starter';
  } else if (priceIdLower.includes('pro') || priceIdLower.includes('professional')) {
    return 'pro';
  } else if (priceIdLower.includes('enterprise') || priceIdLower.includes('premium')) {
    return 'premium';
  }

  // Default to pro if unknown
  return 'pro';
};

async function updateProfileFromWebhook(email, data) {
  if (!email) {
    console.error('No email provided for profile update');
    return;
  }

  try {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingProfile) {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('email', email);

      if (error) {
        console.error('Supabase profile update error:', error);
      } else {
        console.log(`✅ Profile updated for ${email}:`, data);
      }
    } else {
      console.log(`⚠️  No profile found for ${email}, will be created by trigger on auth signup`);
    }
  } catch (err) {
    console.error('Exception updating profile:', err);
  }
}

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

  console.log(`Processing webhook event: ${stripeEvent.type}`);

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object;
        const customerId = session.customer;
        const customerEmail = session.customer_details?.email;
        const amountTotal = session.amount_total;
        const paymentIntentId = session.payment_intent;
        const subscriptionId = session.subscription;
        const refCode = session.client_reference_id || null;
        const mode = session.mode;
        const guestSessionToken = session.metadata?.guest_session_token;

        console.log(`Checkout completed: mode=${mode}, email=${customerEmail}`);
        console.info('Event: checkout_completed', { email: customerEmail });

        if (guestSessionToken) {
          console.log(`Converting guest session: ${guestSessionToken}`);
          try {
            await supabase
              .from('guest_sessions')
              .update({
                converted_user_id: customerId,
                stripe_customer_id: customerId,
              })
              .eq('session_token', guestSessionToken);
            console.log(`Guest session converted successfully`);
          } catch (err) {
            console.error('Error converting guest session:', err);
          }
        }

        if (!subscriptionId) {
          console.log('No subscription ID, one-time payment or free tier');
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ received: true }),
          };
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;
        const tier = getTierFromPriceId(priceId);
        const interval = subscription.items.data[0].price.recurring?.interval || 'month';
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

        console.info('Event: plan_type', { interval, tier, priceId });

        // Check if user already has an auth account
        const { data: existingAuthUser } = await supabase.auth.admin.listUsers();
        const userExists = existingAuthUser?.users?.some(u => u.email === customerEmail);

        if (!userExists && customerEmail) {
          console.log(`🔐 Creating new account for ${customerEmail}`);
          // Generate a secure random password
          const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12).toUpperCase() + '!@#';

          try {
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
              email: customerEmail,
              password: tempPassword,
              email_confirm: true,
              user_metadata: {
                created_via: 'stripe_payment',
                stripe_customer_id: customerId,
                plan: tier.toLowerCase()
              }
            });

            if (createError) {
              console.error('❌ Error creating user:', createError.message);
            } else if (newUser?.user) {
              console.log(`✅ Account created for ${customerEmail}, ID: ${newUser.user.id}`);

              await updateProfileFromWebhook(customerEmail, {
                stripe_customer: customerId,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                sub_status: subscription.status,
                current_period_end: currentPeriodEnd.toISOString(),
                plan: tier.toLowerCase(),
                user_email: customerEmail
              });

              console.log(`✅ Profile updated with subscription details`);
            }
          } catch (createErr) {
            console.error('Exception creating user:', createErr.message);
          }
        } else if (userExists) {
          console.log(`✅ User account exists for ${customerEmail}, updating profile`);

          await updateProfileFromWebhook(customerEmail, {
            stripe_customer: customerId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            sub_status: subscription.status,
            current_period_end: currentPeriodEnd.toISOString(),
            plan: tier.toLowerCase()
          });
        } else {
          console.error('❌ No email provided in checkout session');
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_email', customerEmail)
          .maybeSingle();

        if (profile) {
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
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = stripeEvent.data.object;
        const customerId = subscription.customer;
        const subscriptionId = subscription.id;
        const status = subscription.status;
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        const priceId = subscription.items.data[0].price.id;
        const tier = getTierFromPriceId(priceId);

        console.log(`Subscription updated: customer=${customerId}, status=${status}, tier=${tier}`);

        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (profile?.email) {
          await updateProfileFromWebhook(profile.email, {
            stripe_customer: customerId,
            stripe_subscription_id: subscriptionId,
            sub_status: status,
            current_period_end: currentPeriodEnd.toISOString(),
            plan: tier.toLowerCase()
          });
        } else {
          console.error('No profile found for customer:', customerId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object;
        const customerId = subscription.customer;

        console.log(`Subscription deleted: customer=${customerId}`);

        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (profile?.email) {
          await updateProfileFromWebhook(profile.email, {
            sub_status: 'canceled',
            plan: 'starter'
          });
        } else {
          console.error('No profile found for customer:', customerId);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = stripeEvent.data.object;
        const customerId = invoice.customer;
        const customerEmail = invoice.customer_email;
        const amountPaid = invoice.amount_paid;
        const subscriptionId = invoice.subscription;

        console.log(`Invoice payment succeeded: customer=${customerId}, amount=${amountPaid}`);

        if (invoice.billing_reason === 'subscription_cycle' && subscriptionId) {
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
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = stripeEvent.data.object;
        const customerId = invoice.customer;
        const customerEmail = invoice.customer_email;

        console.log(`Invoice payment failed: customer=${customerId}, email=${customerEmail}`);

        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (profile?.email) {
          await updateProfileFromWebhook(profile.email, {
            sub_status: 'past_due'
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Webhook processing error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ received: true }),
    };
  }
};
