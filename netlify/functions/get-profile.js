const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    // Get authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized - No valid session' }),
      };
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.warn('Auth verification failed');
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized - Invalid session' }),
      };
    }

    const userEmail = user.email;

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_email, email, stripe_customer_id, sub_status, plan, current_period_end, checks_remaining')
      .or(`user_email.eq.${userEmail},email.eq.${userEmail}`)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch profile' }),
      };
    }

    if (!profile) {
      // Create a default profile for this user
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_email: userEmail,
          email: userEmail,
          plan: 'starter',
          sub_status: 'active',
          checks_remaining: 5
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to create profile' }),
        };
      }

      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          sub_status: 'active',
          plan: 'starter',
          current_period_end: null,
          checks_remaining: 5
        }),
      };
    }

    // Set default checks_remaining based on plan
    let checksRemaining = profile.checks_remaining;
    if (checksRemaining === null || checksRemaining === undefined) {
      if (profile.plan === 'starter') {
        checksRemaining = 5;
      } else {
        checksRemaining = 999999; // Unlimited for pro/premium
      }
    }

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: profile.email || profile.user_email,
        sub_status: profile.sub_status || 'active',
        plan: profile.plan || 'starter',
        current_period_end: profile.current_period_end,
        checks_remaining: checksRemaining,
        stripe_customer_id: profile.stripe_customer_id
      }),
    };
  } catch (error) {
    console.error('Error in get-profile:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
      }),
    };
  }
};
