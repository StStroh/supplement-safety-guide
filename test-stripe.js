// COPY AND PASTE THIS INTO YOUR BROWSER CONSOLE
// Then run: testSubscription()

async function testSubscription() {
  console.log('═══════════════════════════════════════════');
  console.log('🔍 SUBSCRIPTION DIAGNOSTIC TOOL');
  console.log('═══════════════════════════════════════════\n');

  const SUPABASE_URL = 'https://jggzgdrivlamjwwsvdow.supabase.co';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3pnZHJpdmxhbWp3d3N2ZG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTY0MzYsImV4cCI6MjA3NjI3MjQzNn0.shgnllEtoSdOnEzS8LqbX0xfXdcz8illzCRaOND9lgE';

  console.log('Step 1: Get auth session...');

  // Get from localStorage (this is how Supabase stores it)
  const authData = localStorage.getItem('sb-jggzgdrivlamjwwsvdow-auth-token');

  if (!authData) {
    console.error('❌ ERROR: Not logged in!');
    console.log('\n👉 To fix: Go to /login and sign in first');
    return;
  }

  const { access_token, user } = JSON.parse(authData);
  console.log('✅ Logged in as:', user.email);
  console.log('✅ User ID:', user.id);

  console.log('\nStep 2: Call edge function...');

  const url = `${SUPABASE_URL}/functions/v1/stripe-checkout`;
  const body = {
    price_id: 'price_1SJJQtLSpIuKqlsUhZdEPJ3L', // Professional plan
    mode: 'subscription',
    success_url: window.location.origin + '/success',
    cancel_url: window.location.origin + '/pricing'
  };

  console.log('📤 Request URL:', url);
  console.log('📤 Request body:', body);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    console.log('\n📥 Response status:', response.status);

    const text = await response.text();
    console.log('📥 Response body:', text);

    if (!response.ok) {
      console.error('\n❌ ERROR FOUND!');
      console.error('Status:', response.status);

      try {
        const error = JSON.parse(text);
        console.error('Error message:', error.error || error);

        // Specific error handling
        if (text.includes('STRIPE_SECRET_KEY')) {
          console.error('\n🔴 ROOT CAUSE: Stripe secret key not configured in Supabase!');
          console.log('\n✅ SOLUTION:');
          console.log('1. Go to: https://dashboard.stripe.com/apikeys');
          console.log('2. Copy your secret key (starts with sk_live_)');
          console.log('3. Go to: https://supabase.com/dashboard/project/jggzgdrivlamjwwsvdow/settings/functions');
          console.log('4. Add secret: STRIPE_SECRET_KEY = (your key)');
          console.log('5. Save and try again');
        } else if (response.status === 401) {
          console.error('\n🔴 ROOT CAUSE: Authentication failed!');
          console.log('\n✅ SOLUTION: Logout and login again');
        } else if (response.status === 404) {
          console.error('\n🔴 ROOT CAUSE: Edge function not found!');
          console.log('\n✅ SOLUTION: Edge function may not be deployed');
        }
      } catch (e) {
        console.error('Raw error:', text);
      }

      return;
    }

    const data = JSON.parse(text);
    console.log('\n✅ SUCCESS! Checkout session created!');
    console.log('Session ID:', data.sessionId);
    console.log('Checkout URL:', data.url);

    console.log('\n🎉 Subscriptions are working! You can now redirect to:', data.url);

  } catch (error) {
    console.error('\n❌ NETWORK ERROR:', error.message);
    console.log('\n✅ SOLUTION: Check your internet connection');
  }
}

console.log('📋 Diagnostic script loaded!');
console.log('👉 Run: testSubscription()');
console.log('');
