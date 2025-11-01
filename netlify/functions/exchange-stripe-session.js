const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Stripe is not configured' }),
      };
    }

    const { session_id } = JSON.parse(event.body);

    if (!session_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'session_id is required' }),
      };
    }

    const stripeSession = await stripe.checkout.sessions.retrieve(session_id);

    if (!stripeSession || !stripeSession.customer_details?.email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid session or no email found' }),
      };
    }

    const customerEmail = stripeSession.customer_details.email;

    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users?.users?.find(u => u.email === customerEmail);

    if (!user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: 'User account not found. Please wait a moment and try again.',
          email: customerEmail
        }),
      };
    }

    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: customerEmail,
      options: {
        redirectTo: `${process.env.URL || 'https://supplementsafetybible.com'}/dashboard`
      }
    });

    if (error) {
      console.error('Error generating magic link:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to generate login link' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        email: customerEmail,
        action_link: data.properties.action_link,
        redirect_url: data.properties.redirect_url,
        user_id: user.id
      }),
    };
  } catch (error) {
    console.error('Exchange session error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
