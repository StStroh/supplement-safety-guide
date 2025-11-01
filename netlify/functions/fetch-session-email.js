const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    console.info('Reading env vars: STRIPE_SECRET_KEY');

    const sessionId = event.queryStringParameters?.session_id;

    if (!sessionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Session ID is required' }),
      };
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Stripe is not configured' }),
      };
    }

    console.info(`Fetching session: ${sessionId}`);

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const email = session.customer_details?.email || session.customer_email;

    if (!email) {
      console.error('No email found in session');
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Email not found in session' }),
      };
    }

    // Fetch temporary password from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('temp_password, password_set_at')
      .eq('user_email', email)
      .maybeSingle();

    const tempPassword = profile?.temp_password || null;
    const hasPassword = !!tempPassword;

    console.info('Session email and credentials retrieved successfully');

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        hasPassword,
        tempPassword: tempPassword // Only sent once, client should clear it
      }),
    };
  } catch (error) {
    console.error('Error fetching session:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message,
      }),
    };
  }
};
