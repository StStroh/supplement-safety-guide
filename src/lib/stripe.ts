import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export { stripePromise };

export const createCheckoutSession = async (priceId: string, mode: 'subscription' | 'payment' = 'subscription') => {
  console.log('=== CREATE CHECKOUT SESSION ===');
  console.log('Price ID:', priceId);
  console.log('Mode:', mode);
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`;
  console.log('Calling URL:', url);

  const body = {
    price_id: priceId,
    mode,
    success_url: `${window.location.origin}/success`,
    cancel_url: `${window.location.origin}/pricing`,
  };
  console.log('Request body:', body);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });

  console.log('Response status:', response.status);
  console.log('Response OK:', response.ok);

  const responseText = await response.text();
  console.log('Response text:', responseText);

  if (!response.ok) {
    let errorMessage = 'Failed to create checkout session';
    try {
      const error = JSON.parse(responseText);
      errorMessage = error.error || errorMessage;
    } catch (e) {
      errorMessage = responseText || errorMessage;
    }
    console.error('Error creating checkout:', errorMessage);
    throw new Error(errorMessage);
  }

  const data = JSON.parse(responseText);
  console.log('Response data:', data);

  return data.sessionId;
};
